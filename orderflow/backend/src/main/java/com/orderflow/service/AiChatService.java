package com.orderflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.orderflow.dto.ChatRequest;
import com.orderflow.dto.ChatResponse;
import com.orderflow.model.*;
import com.orderflow.repository.*;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiChatService {

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.model}")
    private String model;

    private final ClientRepository clientRepo;
    private final SalesOrderRepository orderRepo;
    private final InvoiceRepository invoiceRepo;
    private final JobCardRepository jcRepo;
    private final PaymentAllocationRepository allocRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .build();

    public ChatResponse chat(ChatRequest req) {
        try {
            String context = buildContext();
            String systemPrompt = buildSystemPrompt(context);

            ArrayNode messages = objectMapper.createArrayNode();
            if (req.getHistory() != null) {
                for (ChatRequest.HistoryEntry h : req.getHistory()) {
                    ObjectNode msg = objectMapper.createObjectNode();
                    msg.put("role", h.getRole());
                    msg.put("content", h.getContent());
                    messages.add(msg);
                }
            }
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", req.getMessage());
            messages.add(userMsg);

            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", model);
            payload.put("max_tokens", 1024);
            payload.put("system", systemPrompt);
            payload.set("messages", messages);

            Request httpReq = new Request.Builder()
                    .url("https://api.anthropic.com/v1/messages")
                    .post(RequestBody.create(
                            objectMapper.writeValueAsString(payload),
                            MediaType.parse("application/json")))
                    .addHeader("x-api-key", apiKey)
                    .addHeader("anthropic-version", "2023-06-01")
                    .addHeader("content-type", "application/json")
                    .build();

            try (Response resp = httpClient.newCall(httpReq).execute()) {
                String body = resp.body().string();
                JsonNode node = objectMapper.readTree(body);
                if (!resp.isSuccessful()) {
                    return ChatResponse.builder().reply("API error: " + body).success(false).build();
                }
                String reply = node.path("content").get(0).path("text").asText();
                return ChatResponse.builder().reply(reply).success(true).build();
            }
        } catch (Exception e) {
            return ChatResponse.builder()
                    .reply("Error: " + e.getMessage() + ". Make sure ANTHROPIC_API_KEY is set.")
                    .success(false).build();
        }
    }

    private String buildSystemPrompt(String context) {
        return """
You are OrderFlow AI — an intelligent assistant embedded in a sales and production management system
for a bag manufacturing business (woven bags, non-woven bags, PP bags).

You have live access to orders, clients, job cards, invoices, and payment data summarized below.
Answer concisely and helpfully. Format Indian currency as ₹ with lakhs notation.

Production stages in order: Stereo Available → Material → Cutting → Stitching → Handle → QC & Packing → Delivery

You can help with:
- Checking order and production status
- Outstanding payments and receivables
- Identifying overdue invoices
- Production progress per job card
- Client-specific rates and product info

LIVE DATA:
""" + context;
    }

    private String buildContext() {
        StringBuilder sb = new StringBuilder();
        sb.append("Date: ").append(LocalDate.now()).append("\n");

        // Clients
        sb.append("\nCLIENTS:\n");
        clientRepo.findAll().forEach(c ->
                sb.append("  ").append(c.getName()).append(" | GST:").append(c.getGstPercent())
                  .append("% | CY-OS:₹").append(c.getCyOutstanding())
                  .append(" | PY-OS:₹").append(c.getPyOutstanding())
                  .append(" | SP:").append(c.getSalesperson()).append("\n"));

        // Open orders
        sb.append("\nOPEN ORDERS:\n");
        orderRepo.findAll().stream()
                .filter(o -> o.getStatus() != SalesOrder.OrderStatus.INVOICED
                          && o.getStatus() != SalesOrder.OrderStatus.COMPLETED
                          && o.getStatus() != SalesOrder.OrderStatus.CANCELLED)
                .forEach(o -> sb.append("  ").append(o.getOrderNo())
                        .append(" | ").append(o.getClient().getName())
                        .append(" | ").append(o.getStatus())
                        .append(" | Due:").append(o.getDeliveryDate()).append("\n"));

        // Active job cards with stages
        sb.append("\nACTIVE JOB CARDS:\n");
        jcRepo.findByStatus(JobCard.JobCardStatus.IN_PRODUCTION).forEach(jc -> {
            SalesOrderLine line = jc.getOrderLine();
            String product = line.getClientProduct().getProduct().getName();
            String client = line.getSalesOrder().getClient().getName();
            long doneCount = jc.getActivities().stream()
                    .map(a -> a.getActivityType().name()).distinct().count();
            sb.append("  ").append(jc.getJobCardNo())
              .append(" | ").append(product).append(" for ").append(client)
              .append(" | Stages done:").append(doneCount).append("/7")
              .append(" | Due:").append(jc.getDueDate()).append("\n");
        });

        // Unpaid invoices
        sb.append("\nUNPAID INVOICES:\n");
        invoiceRepo.findByStatusNot(Invoice.InvoiceStatus.PAID).forEach(inv -> {
            BigDecimal paid = allocRepo.sumAllocatedByInvoiceId(inv.getId());
            if (paid == null) paid = BigDecimal.ZERO;
            sb.append("  ").append(inv.getInvoiceNo())
              .append(" | ").append(inv.getClient().getName())
              .append(" | Due:").append(inv.getDueDate())
              .append(" | Balance:₹").append(paid).append("\n");
        });

        return sb.toString();
    }
}
