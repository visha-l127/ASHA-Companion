# 🩺 ASHA Companion

An offline-first Electronic Health Record platform helping India's ASHA (Accredited Social Health Activist) community health workers manage maternal care, child immunization, nutrition, and medicine records in low-connectivity rural areas.

**Java 17 · Spring Boot 3.x · React 18 · TypeScript · Oracle SQL** — Backend tests: 33/33 passing · Clinical integrity tests: 18/18 passing · Frontend mock tests: 33/33 passing · License: MIT
*(Test results reflect the last manually-run verification — no automated CI/CD is configured for this repo.)*

---

## 🔗 Live Demo

**[https://visha-l127.github.io/ASHA-Companion/](https://visha-l127.github.io/ASHA-Companion/)**

No setup, no login required — quick-access buttons let you sign in as any of the four roles instantly (Admin, PHC Supervisor, ASHA Worker, Pharmacist). This build runs in **Demo Mode**: an in-memory mock data layer standing in for the real backend, so every action (create, edit, delete) works interactively, but nothing persists — a page refresh resets to the original seed data.

Recommended: log in as **ASHA Worker** and open **Priority Cases** to see the rule-based clinical risk scoring engine in action, ranking seeded patients by computed urgency.

For the full application running against the real Spring Boot backend and Oracle database, see [Installation](#-installation) below.

---

## ✨ Key Features

- **Patient & household management** — registration, demographics, and household grouping
- **Maternal care** — pregnancy registration, antenatal visit tracking, high-risk pregnancy flagging
- **Child immunization tracking** — dose scheduling, overdue-defaulter detection, protected against accidental un-administration of completed doses
- **Nutrition monitoring** — MUAC/growth tracking with SAM/MAM malnutrition classification
- **Pharmacy & medicine inventory** — catalogue, batch tracking, dispensing, expiry-risk alerts
- **Offline-first data entry** — records queued locally and synced automatically once connectivity returns
- **Role-based access control** — four distinct roles (Admin, PHC Supervisor, ASHA Worker, Pharmacist) with JWT auth and facility-level data isolation
- **Custom rule-based clinical intelligence engine** — deterministic weighted scoring for maternal risk, malnutrition, immunization defaulting, and visit prioritization. Deliberately **not** a trained ML model — see [Clinical Intelligence Engine](#-clinical-intelligence-engine) below.
- **Data-integrity-first deletion model** — clinical records use soft-delete to preserve history rather than destructive deletion, with conditional protections on records with real clinical significance

---

## 🧠 Clinical Intelligence Engine

This project uses a **custom, deterministic, rule-based scoring engine** — not GPT, Gemini, a trained ML model, or any external API. Risk scores are computed from transparent, auditable clinical and operational thresholds (e.g., blood pressure, hemoglobin, MUAC, and gravida count). This is an intentional design choice: every score the system produces can be explained by citing the exact rule that triggered it.

---

## 🏗️ Architecture

```text
                 React / Vite Frontend
                          │
                          ▼
                 API Gateway (:8081)
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     Auth Service    Admin Service   Clinical Service
       (:8082)          (:8083)          (:8084)
          │               │               │
          └───────────────┼───────────────┘
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
      Pharmacy Service            AI Service
         (:8085)                    (:8086)
             │                         │
             └────────────┬────────────┘
                          ▼
                  Oracle Database
                     (:1521)

             Eureka Service Discovery
                     (:8761)
        (service registration/discovery)
```

---

## 📁 Project Structure

```text
ASHA-Companion/
├── backend/
│   ├── discovery-server/   # Eureka service registry
│   ├── api-gateway/        # Spring Cloud Gateway
│   ├── auth-service/       # Authentication and JWT
│   ├── admin-service/      # PHCs, users, roles, audit logs
│   ├── clinical-service/   # Patients, pregnancy, immunization, nutrition
│   ├── pharmacy-service/   # Medicines, batches, transactions
│   └── ai-service/         # Rule-based clinical intelligence
└── frontend/
    ├── src/pages/          # Role-specific screens
    ├── src/mocks/          # Demo-mode mock API layer
    └── src/utils/
        └── apiClient.ts    # Backend API communication
```

---

## 💻 Tech Stack

**Backend:** Java 17 · Spring Boot 3.x · Spring Cloud 2024 · Spring Security (JWT, BCrypt) · Spring Data JPA / Hibernate · Netflix Eureka · Spring Cloud Gateway · Oracle Database (11g/12c/19c XE)

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · Lucide React · Recharts

---

## 📦 Installation

### Prerequisites
- Java 17 (JDK)
- Maven
- Node.js 18+ and npm
- Oracle Database XE (11g, 12c, or 19c) running locally on port `1521`, with a schema named `ASHA`

### Clone the repository
```bash
git clone https://github.com/visha-l127/ASHA-Companion.git
cd ASHA-Companion
```

### Backend setup
Each service must be built and started individually, in this order:

```bash
# 1. Discovery Server (must start first)
cd backend/discovery-server
mvn clean package -DskipTests
java -jar target/discovery-server-0.0.1-SNAPSHOT.jar   # Port 8761

# 2. Core microservices (start each from its own directory, in any order)
cd backend/auth-service && mvn clean package -DskipTests && java -jar target/auth-service-0.0.1-SNAPSHOT.jar       # Port 8082
cd backend/admin-service && mvn clean package -DskipTests && java -jar target/admin-service-0.0.1-SNAPSHOT.jar     # Port 8083
cd backend/clinical-service && mvn clean package -DskipTests && java -jar target/clinical-service-0.0.1-SNAPSHOT.jar # Port 8084
cd backend/pharmacy-service && mvn clean package -DskipTests && java -jar target/pharmacy-service-0.0.1-SNAPSHOT.jar # Port 8085
cd backend/ai-service && mvn clean package -DskipTests && java -jar target/ai-service-0.0.1-SNAPSHOT.jar           # Port 8086

# 3. API Gateway (start last, after the above are registered with Eureka)
cd backend/api-gateway
mvn clean package -DskipTests
java -jar target/api-gateway-0.0.1-SNAPSHOT.jar   # Port 8081
```

**Database configuration:** Each service's `application.properties` reads the Oracle password from an environment variable with a local fallback:
```properties
spring.datasource.password=${DB_PASSWORD:ASHA}
```
Set `DB_PASSWORD` in your own environment for anything beyond local development — do not rely on the fallback outside local testing.

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Runs on port `3002`, proxying `/api` requests to the gateway at `http://localhost:8081`.

---

## 🚀 Usage

- **Default seed credentials (local testing only):** `admin` / `Admin@123`
- Once all services are running, open `http://localhost:3002` and log in with the seed credentials above, or register a new user via the appropriate role's provisioning flow.
- To run the frontend against the in-memory mock layer instead of the live backend (matching the hosted demo), build with:
```bash
  cross-env VITE_DEMO_MODE=true npm run build
```

---

## 🧪 Testing & Verification

| Suite | Result |
|---|---|
| Backend end-to-end regression (`final_backend_verification.py`) | 33 / 33 passed |
| Clinical data integrity tests (`ClinicalDataIntegrityTests.java`) | 18 / 18 passed |
| Frontend mock API layer tests (`mockApiClient.test.ts`) | 33 / 33 passed |
| Frontend interactive demo verification (Playwright) | 7 / 7 passed |

These reflect manually-run verification at the time of each fix, not a continuously monitored CI pipeline — no automated CI/CD is currently configured for this repository.

---

## 🤝 Contributing

This is a two-person capstone/portfolio project, not currently set up to accept external contributions through a formal process. That said, issues, forks, and feedback are genuinely welcome — if you spot a bug or have a suggestion, open a GitHub issue or reach out directly.

---

## 👥 Team

Built by **[Vishal SR](https://github.com/visha-l127)** and **Meiyappan CT**, working across the full stack together.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
