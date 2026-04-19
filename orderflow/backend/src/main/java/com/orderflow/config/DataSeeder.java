package com.orderflow.config;

import com.orderflow.model.*;
import com.orderflow.repository.*;
import com.orderflow.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ClientRepository clientRepo;
    private final ProductRepository productRepo;
    private final ClientProductRepository cpRepo;
    private final SalesOrderRepository orderRepo;
    private final JobCardRepository jcRepo;
    private final PaymentRepository payRepo;
    private final PaymentAllocationRepository allocRepo;
    private final InvoiceRepository invoiceRepo;
    private final AuthService authService;

    @Override
    public void run(String... args) {
        log.info("Seeding sample data...");
        authService.seedAdminIfNone("admin","admin123","Admin User");
        /*// ── Products ─────────────────────────────────────────────
        Product wb1215 = productRepo.save(Product.builder()
                .sku("WB-1215-LC").name("White woven bag 12x15").category("Woven bag")
                .size("12x15 inch").handle("Loop").uom("Pcs").basePrice(new BigDecimal("18.00")).build());

        Product nwb1418 = productRepo.save(Product.builder()
                .sku("NWB-1418-DC").name("Non-woven D-cut 14x18").category("Non-woven")
                .size("14x18 inch").handle("D-cut").uom("Pcs").basePrice(new BigDecimal("12.50")).build());

        Product pp1020 = productRepo.save(Product.builder()
                .sku("PP-1020-NH").name("PP plain bag 10x20").category("PP bag")
                .size("10x20 inch").handle("None").uom("Pcs").basePrice(new BigDecimal("9.00")).build());

        Product wb1620 = productRepo.save(Product.builder()
                .sku("WB-1620-LC").name("White woven bag 16x20").category("Woven bag")
                .size("16x20 inch").handle("Loop").uom("Pcs").basePrice(new BigDecimal("22.00")).build());

        // ── Clients ───────────────────────────────────────────────
        Client ravi = clientRepo.save(Client.builder()
                .code("C001").name("Ravi Packaging")
                .gstNo("29AABCR1234F1Z5")
                .billingAddress("12, Industrial Area, Bangalore - 560010")
                .shippingAddress("12, Industrial Area, Bangalore - 560010")
                .phone("9876543210").email("ravi@ravipkg.com").salesperson("Meena")
                .creditLimit(new BigDecimal("500000")).paymentTerms("Net 30")
                .gstPercent(18)
                .pyOutstanding(new BigDecimal("30000"))
                .cyOutstanding(new BigDecimal("64000"))
                .status(Client.ClientStatus.ACTIVE).build());

        Client greenleaf = clientRepo.save(Client.builder()
                .code("C002").name("Greenleaf Exports")
                .gstNo("29AADCG5678B1Z3")
                .billingAddress("45, Export Zone, Chennai - 600045")
                .shippingAddress("45, Export Zone, Chennai - 600045")
                .phone("9845001234").email("info@greenleaf.com").salesperson("Arjun")
                .creditLimit(new BigDecimal("300000")).paymentTerms("Net 45")
                .gstPercent(0)   // GST-exempt exporter
                .pyOutstanding(BigDecimal.ZERO)
                .cyOutstanding(new BigDecimal("87500"))
                .status(Client.ClientStatus.ACTIVE).build());

        Client alpha = clientRepo.save(Client.builder()
                .code("C003").name("Alpha Bags")
                .gstNo("29AACCA9012C1Z1")
                .billingAddress("78, Market Road, Coimbatore - 641001")
                .shippingAddress("78, Market Road, Coimbatore - 641001")
                .phone("9900112233").email("orders@alphabags.com").salesperson("Meena")
                .creditLimit(new BigDecimal("200000")).paymentTerms("Net 30")
                .gstPercent(5)
                .pyOutstanding(new BigDecimal("38500"))
                .cyOutstanding(BigDecimal.ZERO)
                .status(Client.ClientStatus.ON_HOLD).build());

        // ── Client-specific products with negotiated prices ────────
        ClientProduct raviWb = cpRepo.save(ClientProduct.builder()
                .client(ravi).product(wb1215)
                .agreedPrice(new BigDecimal("17.00"))
                .stereoRef("RAVI-LOGO-2024")
                .specialSpec("Blue thread stitching, logo front center")
                .active(true).build());

        ClientProduct raviPp = cpRepo.save(ClientProduct.builder()
                .client(ravi).product(pp1020)
                .agreedPrice(new BigDecimal("8.50"))
                .stereoRef("").specialSpec("Plain, no print").active(true).build());

        ClientProduct greenNwb = cpRepo.save(ClientProduct.builder()
                .client(greenleaf).product(nwb1418)
                .agreedPrice(new BigDecimal("13.50"))
                .stereoRef("GREEN-EX-2024")
                .specialSpec("Export quality, extra stitching").active(true).build());

        ClientProduct greenWb = cpRepo.save(ClientProduct.builder()
                .client(greenleaf).product(wb1620)
                .agreedPrice(new BigDecimal("21.00"))
                .stereoRef("").specialSpec("").active(true).build());

        ClientProduct alphaWb = cpRepo.save(ClientProduct.builder()
                .client(alpha).product(wb1215)
                .agreedPrice(new BigDecimal("18.50"))
                .stereoRef("ALPHA-BLK-2024")
                .specialSpec("Black handle reinforced").active(true).build());

        // ── Sales Order SO-2025-0001 (Ravi, In Production) ─────────
        SalesOrder so1 = SalesOrder.builder()
                .orderNo("SO-2025-0001").client(ravi)
                .orderDate(LocalDate.now().minusDays(3))
                .deliveryDate(LocalDate.now().plusDays(12))
                .status(SalesOrder.OrderStatus.IN_PRODUCTION)
                .notes("Priority — festival season")
                .lines(new java.util.ArrayList<>())
                .build();

        SalesOrderLine line1 = SalesOrderLine.builder()
                .salesOrder(so1).clientProduct(raviWb)
                .qty(5000).unitPrice(new BigDecimal("17.00")).spec("2-colour logo print").build();
        SalesOrderLine line2 = SalesOrderLine.builder()
                .salesOrder(so1).clientProduct(raviPp)
                .qty(3000).unitPrice(new BigDecimal("8.50")).spec("Plain").build();
        so1.getLines().add(line1); so1.getLines().add(line2);
        orderRepo.save(so1);

        // Job cards for SO1
        JobCard jc1 = jcRepo.save(JobCard.builder()
                .jobCardNo("JC-2025-0001-01").orderLine(line1)
                .startDate(LocalDate.now().minusDays(3))
                .dueDate(LocalDate.now().plusDays(12))
                .status(JobCard.JobCardStatus.IN_PRODUCTION)
                .instructions("Stereo ref: RAVI-LOGO-2024. Blue thread.")
                .activities(new java.util.ArrayList<>())
                .build());
        jc1.getActivities().add(JobActivity.builder().jobCard(jc1)
                .activityType(JobActivity.ActivityType.STEREO_AVAILABLE)
                .description("Stereo plate ready and approved by Ravi")
                .performedBy("Design team").activityTime(LocalDateTime.now().minusDays(3)).notes("Ravi approved on call").build());
        jc1.getActivities().add(JobActivity.builder().jobCard(jc1)
                .activityType(JobActivity.ActivityType.MATERIAL)
                .description("PP fabric rolls issued — 5000 pcs worth")
                .performedBy("Warehouse").activityTime(LocalDateTime.now().minusDays(2)).notes("").build());
        jc1.getActivities().add(JobActivity.builder().jobCard(jc1)
                .activityType(JobActivity.ActivityType.CUTTING)
                .description("Cutting complete — 5000 pcs")
                .performedBy("Floor A").activityTime(LocalDateTime.now().minusDays(1)).notes("").build());
        jcRepo.save(jc1);

        JobCard jc2 = jcRepo.save(JobCard.builder()
                .jobCardNo("JC-2025-0001-02").orderLine(line2)
                .startDate(LocalDate.now().minusDays(3))
                .dueDate(LocalDate.now().plusDays(12))
                .status(JobCard.JobCardStatus.IN_PRODUCTION)
                .instructions("Plain bags, no print")
                .activities(new java.util.ArrayList<>())
                .build());
        jc2.getActivities().add(JobActivity.builder().jobCard(jc2)
                .activityType(JobActivity.ActivityType.MATERIAL)
                .description("PP fabric issued from warehouse")
                .performedBy("Warehouse").activityTime(LocalDateTime.now().minusDays(2)).notes("").build());
        jc2.getActivities().add(JobActivity.builder().jobCard(jc2)
                .activityType(JobActivity.ActivityType.CUTTING)
                .description("Cutting done 3000 pcs")
                .performedBy("Floor A").activityTime(LocalDateTime.now().minusDays(1)).notes("").build());
        jc2.getActivities().add(JobActivity.builder().jobCard(jc2)
                .activityType(JobActivity.ActivityType.STITCHING)
                .description("Stitching complete 3000 pcs")
                .performedBy("Floor B").activityTime(LocalDateTime.now().minusHours(4)).notes("").build());
        jcRepo.save(jc2);

        // ── Sales Order SO-2025-0002 (Greenleaf, New) ──────────────
        SalesOrder so2 = SalesOrder.builder()
                .orderNo("SO-2025-0002").client(greenleaf)
                .orderDate(LocalDate.now().minusDays(1))
                .deliveryDate(LocalDate.now().plusDays(18))
                .status(SalesOrder.OrderStatus.NEW).notes("")
                .lines(new java.util.ArrayList<>())
                .build();
        SalesOrderLine line3 = SalesOrderLine.builder()
                .salesOrder(so2).clientProduct(greenNwb)
                .qty(7000).unitPrice(new BigDecimal("13.50")).spec("Export quality").build();
        so2.getLines().add(line3);
        orderRepo.save(so2);
        jcRepo.save(JobCard.builder()
                .jobCardNo("JC-2025-0002-01").orderLine(line3)
                .startDate(LocalDate.now().minusDays(1))
                .dueDate(LocalDate.now().plusDays(18))
                .status(JobCard.JobCardStatus.PENDING)
                .instructions("Export quality extra stitching. Stereo: GREEN-EX-2024")
                .activities(new java.util.ArrayList<>())
                .build());

        // ── Sales Order SO-2025-0003 (Ravi, Invoiced with partial payment) ──
        SalesOrder so3 = SalesOrder.builder()
                .orderNo("SO-2025-0003").client(ravi)
                .orderDate(LocalDate.now().minusDays(20))
                .deliveryDate(LocalDate.now().minusDays(5))
                .status(SalesOrder.OrderStatus.INVOICED).notes("")
                .lines(new java.util.ArrayList<>())
                .build();
        SalesOrderLine line4 = SalesOrderLine.builder()
                .salesOrder(so3).clientProduct(raviWb)
                .qty(4000).unitPrice(new BigDecimal("17.00")).spec("Logo print").build();
        so3.getLines().add(line4);
        orderRepo.save(so3);

        // Invoice for SO3 — GST 18%
        Invoice inv1 = Invoice.builder()
                .invoiceNo("INV-2025-0001").salesOrder(so3).client(ravi)
                .invoiceDate(LocalDate.now().minusDays(15))
                .dueDate(LocalDate.now().minusDays(15).plusDays(30))
                .gstPercent(18).status(Invoice.InvoiceStatus.PARTIALLY_PAID)
                .lines(new java.util.ArrayList<>())
                .build();
        InvoiceLine il1 = InvoiceLine.builder()
                .invoice(inv1).orderLine(line4)
                .qty(4000).unitPrice(new BigDecimal("17.00")).taxPercent(18).build();
        inv1.getLines().add(il1);
        invoiceRepo.save(inv1);

        // Payment + allocation
        Payment pay1 = Payment.builder()
                .paymentRef("PAY-2025-0001").client(ravi)
                .paymentDate(LocalDate.now().minusDays(10))
                .amount(new BigDecimal("40000")).mode("NEFT")
                .bankRef("SBIN2025041000123").status(Payment.PaymentStatus.CONFIRMED)
                .allocations(new java.util.ArrayList<>())
                .build();
        payRepo.save(pay1);
        PaymentAllocation alloc1 = PaymentAllocation.builder()
                .payment(pay1).invoice(inv1)
                .allocatedAmount(new BigDecimal("40000"))
                .allocationDate(LocalDate.now().minusDays(10)).build();
        allocRepo.save(alloc1);

        // Invoice for Greenleaf — GST 0% (exempt)
        SalesOrder so4 = SalesOrder.builder()
                .orderNo("SO-2025-0004").client(greenleaf)
                .orderDate(LocalDate.now().minusDays(25))
                .deliveryDate(LocalDate.now().minusDays(10))
                .status(SalesOrder.OrderStatus.INVOICED).notes("Export order")
                .lines(new java.util.ArrayList<>())
                .build();
        SalesOrderLine line5 = SalesOrderLine.builder()
                .salesOrder(so4).clientProduct(greenNwb)
                .qty(6000).unitPrice(new BigDecimal("13.50")).spec("Plain export").build();
        so4.getLines().add(line5);
        orderRepo.save(so4);

        Invoice inv2 = Invoice.builder()
                .invoiceNo("INV-2025-0002").salesOrder(so4).client(greenleaf)
                .invoiceDate(LocalDate.now().minusDays(20))
                .dueDate(LocalDate.now().minusDays(20).plusDays(45))
                .gstPercent(0).status(Invoice.InvoiceStatus.UNPAID)
                .lines(new java.util.ArrayList<>())
                .build();
        InvoiceLine il2 = InvoiceLine.builder()
                .invoice(inv2).orderLine(line5)
                .qty(6000).unitPrice(new BigDecimal("13.50")).taxPercent(0).build();
        inv2.getLines().add(il2);
        invoiceRepo.save(inv2);

        // Recalculate Ravi CY outstanding to match seeded data
        // inv1 total = 4000 * 17 * 1.18 = 80240, paid 40000, balance 40240
        ravi.setCyOutstanding(new BigDecimal("40240"));
        clientRepo.save(ravi);

        log.info("Sample data seeded: {} clients, {} products, {} orders, {} job cards",
                clientRepo.count(), productRepo.count(), orderRepo.count(), jcRepo.count());*/
    }
}
