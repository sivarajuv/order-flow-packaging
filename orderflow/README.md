# OrderFlow — Sales & Production Management System

## Architecture

```
orderflow/
├── backend/          Spring Boot 3.2 + H2 in-memory DB
│   └── src/main/java/com/orderflow/
│       ├── model/        JPA entities
│       ├── repository/   Spring Data JPA repos
│       ├── service/      Business logic + AI chat
│       ├── controller/   REST API endpoints
│       ├── dto/          Request/response DTOs
│       └── config/       CORS + data seeder
└── frontend/         React 18 + Vite
    └── src/
        ├── api/          Axios API client
        ├── pages/        All screen pages
        ├── components/   Shared UI (AI chat, badges, pipeline)
        └── styles.css    Full design system
```

## Key Features

### Client-based product pricing
- Each client has their own product catalogue (`ClientProduct` entity)
- `agreedPrice` overrides the master `Product.basePrice` per client
- Stereo/artwork reference per client-product mapping
- When creating a sales order, only client-specific products are shown

### GST per client (0%, 5%, 18%)
- `Client.gstPercent` field stores default GST rate
- Invoice creation picks up the client's rate automatically
- Can be overridden per invoice at creation time (e.g. export orders = 0%)

### Dashboard production status
- Shows exact per-product pipeline stage for each active job card
- 7-stage pipeline: Stereo Available → Material → Cutting → Stitching → Handle → QC & Packing → Delivery
- Visual pipeline with green checkmarks for done stages, blue for active

### AI Chat (Anthropic Claude)
- Floating button opens chat panel
- Has live access to orders, invoices, job cards, client outstanding data
- Conversation history maintained in session
- Quick prompts for common queries

## Setup

### Backend

```bash
cd backend

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

mvn spring-boot:run
# API running at http://localhost:8080
# H2 console at http://localhost:8080/h2-console
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/dashboard | Dashboard metrics + active jobs |
| GET/POST | /api/clients | List / create clients |
| GET/PUT | /api/clients/:id | Get / update client |
| GET/POST | /api/clients/:id/products | Client-specific products |
| PUT/DELETE | /api/clients/:id/products/:cpId | Update / remove client product |
| GET/POST | /api/products | Products master |
| GET/POST | /api/orders | Sales orders |
| PUT | /api/orders/:id/status | Update order status |
| GET/POST | /api/jobcards | Job cards |
| PUT | /api/jobcards/:id/status | Update job card status |
| POST | /api/jobcards/:id/activities | Log production activity |
| GET/POST | /api/invoices | Invoices |
| GET/POST | /api/payments | Payments |
| POST | /api/ai/chat | AI chat (Anthropic) |

## Production Stages (Job Card Activities)

1. `STEREO_AVAILABLE` — Artwork/stereo plate ready and approved
2. `MATERIAL` — Raw material issued from warehouse
3. `CUTTING` — Fabric cutting completed
4. `STITCHING` — Bag stitching done
5. `HANDLE` — Handle attachment (loop/D-cut)
6. `QC_CHECK_PACKING` — Quality check and packing
7. `DELIVERY` — Dispatched / delivered to client

## GST Rates

| Rate | When to use |
|------|-------------|
| 0%  | Exporters, GST-exempt clients |
| 5%  | Specific product categories |
| 18% | Standard rate (default) |

Configure per client. Can be overridden per invoice.

## To switch to PostgreSQL

Replace H2 dependency in pom.xml:
```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
</dependency>
```

Update application.properties:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/orderflow
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```
