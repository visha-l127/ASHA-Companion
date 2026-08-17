# ASHA Companion - Comprehensive Healthcare Microservices Backend

ASHA Companion is a Spring Boot microservices backend designed for community healthcare workers (ASHA), Primary Health Center (PHC) Supervisors, Pharmacists, and System Administrators operating in rural and low-connectivity environments.

---

## 1. System Architecture

```text
               +----------------------------------+
               |        Client Application        |
               |  (Web / Postman / Swagger UI)    |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |      API Gateway (:8081)         |
               |     (Spring Cloud Gateway)       |
               +----------------------------------+
                                |
           +--------------------+--------------------+
           |                                         |
           v                                         v
+-----------------------+                 +-----------------------+
| Discovery Server      |                 | Auth & Healthcare     |
| (Eureka Server :8761) |                 | Service (:8082)       |
+-----------------------+                 +-----------------------+
                                                     |
                                                     v
                                          +-----------------------+
                                          | Oracle 11g XE DB      |
                                          | (localhost:1521/XE)   |
                                          +-----------------------+
```

---

## 2. Infrastructure & Port Mapping

| Service Name | Port | Description |
|---|---|---|
| `discovery-server` | `8761` | Eureka Service Discovery Server |
| `api-gateway` | `8081` | Spring Cloud Gateway (Single Entry Point for all REST APIs) |
| `auth-service` | `8082` | Domain & Authentication Service |
| `Oracle 11g XE` | `1521` | Oracle Database (`jdbc:oracle:thin:@localhost:1521:XE`, Schema: `ASHA`) |

---

## 3. Technology Stack

- **Java Version**: OpenJDK 17
- **Framework**: Spring Boot 3.4.1 / Spring Cloud 2024
- **Database**: Oracle 11g XE Database (`org.hibernate.community.dialect.OracleLegacyDialect`)
- **Persistence**: Spring Data JPA / Hibernate (`spring.jpa.hibernate.ddl-auto=update`)
- **Security**: Spring Security (Stateless), BCrypt Password Encoder, JWT (`jjwt 0.12.6`)
- **Service Discovery**: Netflix Eureka Client & Server
- **API Routing**: Spring Cloud Gateway Server MVC
- **API Documentation**: Springdoc OpenAPI / Swagger UI (`2.8.5`)

---

## 4. Role-Based Access Control (RBAC) & Scope Matrix

| Role | Access Scope | Dashboard Scope | Reports Access |
|---|---|---|---|
| `ADMIN` | Global System Access | Global System Statistics | All Reports (`patients`, `maternal`, `immunization`, `nutrition`, `medicines`) |
| `PHC_SUPERVISOR` | Assigned PHC | Assigned PHC Data | All Reports (`patients`, `maternal`, `immunization`, `nutrition`, `medicines`) scoped to PHC |
| `ASHA` | Assigned Patients | Assigned Patients | Clinical Reports (`patients`, `maternal`, `immunization`, `nutrition`). Medicine report blocked (`403`) |
| `PHARMACIST` | Assigned PHC Inventory | Assigned PHC Inventory Stats | Medicine Report (`medicines`) only. Clinical reports blocked (`403`) |

---

## 5. How to Run the Backend Services from VS Code

### Step 1: Ensure Oracle 11g Database is Running
Confirm Oracle 11g XE service is running on `localhost:1521/XE` with user `ASHA`.

### Step 2: Start Discovery Server
```bash
cd "c:\Projects\ASHA Companion\backend\discovery-server"
.\mvnw.cmd spring-boot:run
```
Verify Eureka dashboard at: `http://localhost:8761`

### Step 3: Start Auth Service
```bash
cd "c:\Projects\ASHA Companion\backend\auth-service"
.\mvnw.cmd spring-boot:run
```
Verify `AUTH-SERVICE` registers with Eureka on port `8082`.

### Step 4: Start API Gateway
```bash
cd "c:\Projects\ASHA Companion\backend\api-gateway"
.\mvnw.cmd spring-boot:run
```
Verify `API-GATEWAY` registers with Eureka on port `8081`.

---

## 6. Accessing API Documentation (Swagger UI)

Open your browser and navigate to:
```text
http://localhost:8081/swagger-ui.html
```

### Authorizing Swagger UI with JWT:
1. Call `POST /auth/login` with your credentials (e.g., `admin` / `Admin@123`).
2. Copy the `token` from the JSON response.
3. Click the **Authorize** button at the top right of Swagger UI.
4. Enter your token in the Value box and click **Authorize**.

---

## 7. Running the Full E2E Verification & Security Test Suite

Run the combined Phase 13 + 14 automated verification script:
```bash
python "C:\Users\Vishal\.gemini\antigravity\brain\9f9ad5e0-600c-4589-b2a5-c5d292a78322\scratch\phase13_14_verification.py"
```

Expected result:
```text
PASSED: 23 / 23
FAILED: 0 / 23
```

---

## 8. Key API Endpoints Summary

- **Health Check**: `GET /health`
- **Dashboard**: `GET /dashboard/summary`, `GET /dashboard/overview`
- **Reports**: `GET /reports/patients`, `GET /reports/maternal`, `GET /reports/immunization`, `GET /reports/nutrition`, `GET /reports/medicines`
- **Offline Sync**: `POST /sync`
- **AI Health Risk**: `POST /health-risks/evaluate/{patientId}`
- **Demand Forecast**: `POST /medicine-forecasts/generate`
- **System Audit Logs**: `GET /audit-logs`
- **Default Admin Credentials**: `username: admin`, `password: Admin@123`
