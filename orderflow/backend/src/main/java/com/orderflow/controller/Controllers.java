package com.orderflow.controller;

import com.orderflow.dto.*;
import com.orderflow.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// ─── Client Controller ───────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class ClientController {
    private final ClientService clientService;

    @GetMapping
    public List<ClientDto> getAll() { return clientService.getAll(); }

    @GetMapping("/{id}")
    public ClientDto getById(@PathVariable Long id) { return clientService.getById(id); }

    @PostMapping
    public ClientDto create(@RequestBody ClientDto dto) { return clientService.create(dto); }

    @PutMapping("/{id}")
    public ClientDto update(@PathVariable Long id, @RequestBody ClientDto dto) {
        return clientService.update(id, dto);
    }

    @GetMapping("/{id}/products")
    public List<ClientProductDto> getClientProducts(@PathVariable Long id) {
        return clientService.getClientProducts(id);
    }

    @PostMapping("/{id}/products")
    public ClientProductDto addProduct(@PathVariable Long id, @RequestBody ClientProductRequest req) {
        return clientService.addClientProduct(id, req);
    }

    @PutMapping("/{clientId}/products/{cpId}")
    public ClientProductDto updateProduct(@PathVariable Long clientId,
                                          @PathVariable Long cpId,
                                          @RequestBody ClientProductRequest req) {
        return clientService.updateClientProduct(cpId, req);
    }

    @DeleteMapping("/{clientId}/products/{cpId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long clientId, @PathVariable Long cpId) {
        clientService.deleteClientProduct(cpId);
        return ResponseEntity.ok().build();
    }
}

// ─── Product Controller ──────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class ProductController {
    private final ProductService productService;

    @GetMapping
    public List<ProductDto> getAll() { return productService.getAll(); }

    @GetMapping("/{id}")
    public ProductDto getById(@PathVariable Long id) { return productService.getById(id); }

    @PostMapping
    public ProductDto create(@RequestBody ProductDto dto) { return productService.create(dto); }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @RequestBody ProductDto dto) {
        return productService.update(id, dto);
    }
}

// ─── Sales Order Controller ──────────────────────────────────────────────────
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class SalesOrderController {
    private final SalesOrderService orderService;

    @GetMapping
    public List<SalesOrderDto> getAll() { return orderService.getAll(); }

    @GetMapping("/{id}")
    public SalesOrderDto getById(@PathVariable Long id) { return orderService.getById(id); }

    @PostMapping
    public SalesOrderDto create(@RequestBody SalesOrderRequest req) { return orderService.create(req); }

    @PutMapping("/{id}")
    public SalesOrderDto update(@PathVariable Long id, @RequestBody SalesOrderRequest req) { return orderService.update(id, req); }

    @PutMapping("/{id}/status")
    public SalesOrderDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateStatus(id, status);
    }

    @PutMapping("/{id}/lines/{lineId}")
    public SalesOrderDto updateLine(@PathVariable Long id, @PathVariable Long lineId, @RequestBody OrderLineUpdateRequest req) {
        return orderService.updateLine(id, lineId, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}

// ─── Job Card Controller ─────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/jobcards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class JobCardController {
    private final JobCardService jobCardService;

    @GetMapping
    public List<JobCardDto> getAll() { return jobCardService.getAll(); }

    @GetMapping("/{id}")
    public JobCardDto getById(@PathVariable Long id) { return jobCardService.getById(id); }

    @PutMapping("/{id}/status")
    public JobCardDto updateStatus(@PathVariable Long id, @RequestParam String status) {
        return jobCardService.updateStatus(id, status);
    }

    @PostMapping("/{id}/activities")
    public JobCardDto addActivity(@PathVariable Long id, @RequestBody JobActivityRequest req) {
        return jobCardService.addActivity(id, req);
    }
}

// ─── Invoice Controller ──────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class InvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping
    public List<InvoiceDto> getAll() { return invoiceService.getAll(); }

    @GetMapping("/{id}")
    public InvoiceDto getById(@PathVariable Long id) { return invoiceService.getById(id); }

    @PostMapping
    public InvoiceDto create(@RequestBody InvoiceRequest req) { return invoiceService.create(req); }
}

// ─── Payment Controller ──────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class PaymentController {
    private final PaymentService paymentService;

    @GetMapping
    public List<PaymentDto> getAll() { return paymentService.getAll(); }

    @PostMapping
    public PaymentDto create(@RequestBody PaymentRequest req) { return paymentService.create(req); }
}

// ─── Dashboard Controller ────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public DashboardDto getDashboard() { return dashboardService.getDashboard(); }
}

// ─── AI Chat Controller ──────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class AiChatController {
    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest req) { return aiChatService.chat(req); }
}
