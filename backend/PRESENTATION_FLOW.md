# ASHA Companion - Academic Presentation Demonstration Flow

This document provides a deterministic, step-by-step demonstration sequence to showcase the complete ASHA Companion backend functionality during academic reviews and live presentations.

---

## Pre-Demonstration Checklist

1. **Oracle 11g XE Database**: Running on `localhost:1521/XE`
2. **Discovery Server**: `http://localhost:8761`
3. **API Gateway**: `http://localhost:8081`
4. **Auth Service**: `http://localhost:8082`

---

## Step-by-Step Demonstration Sequence

1. **Show Infrastructure & Service Discovery**:
   - Open browser at `http://localhost:8761`.
   - Highlight that `API-GATEWAY` and `AUTH-SERVICE` are registered with Eureka.

2. **Open Interactive API Documentation (Swagger UI)**:
   - Open browser at `http://localhost:8081/swagger-ui.html`.
   - Explain how all 22 domain routes are exposed through the single API Gateway.

3. **Demonstrate Health Check**:
   - Call `GET http://localhost:8081/health`.
   - Observe `{"status": "UP", "service": "auth-service"}`.

4. **Login as System Administrator**:
   - Call `POST /auth/login` with `{"username": "admin", "password": "Admin@123"}`.
   - Copy the returned JWT token.
   - Authorize Swagger UI with `Bearer <JWT_TOKEN>`.

5. **Administrative Setup - Primary Health Center**:
   - Call `POST /phcs` with `{"name": "Metro Central PHC", "code": "PHC_DEMO_01", "district": "Central", "block": "Block A"}`.
   - Confirm HTTP 201 Created.

6. **User Provisioning - Role-Based User Creation**:
   - Provision PHC Supervisor: `POST /users` (`role: PHC_SUPERVISOR`, `phcId: PHC_DEMO_01`).
   - Provision Pharmacist: `POST /users` (`role: PHARMACIST`, `phcId: PHC_DEMO_01`).
   - Register ASHA Worker: `POST /auth/register` (`phcId: PHC_DEMO_01`).

7. **Patient Registration (ASHA Context)**:
   - Re-authorize Swagger UI using ASHA Worker JWT.
   - Call `POST /patients` to register a new pregnant patient.

8. **Maternal Care & Pregnancy Tracking**:
   - Register pregnancy: `POST /pregnancies` with LMP date.
   - Record ANC Visit: `POST /pregnancies/{id}/visits` with BP `145/95 mmHg` and Hemoglobin `9.5 g/dL`.
   - Observe automatic clinical risk screening returning `highRisk: true`.

9. **Child Immunization & Growth Monitoring**:
   - Record Immunization: `POST /immunizations` for polio dose 1.
   - Record Child Nutrition: `POST /nutrition-records` with MUAC `10.5 cm` (Severe Acute Malnutrition).
   - Observe automatic nutrition status `HIGH_RISK`.

10. **Pharmacy & Medicine Inventory Management**:
    - Re-authorize Swagger UI using Pharmacist JWT.
    - Create Medicine: `POST /medicines` (`reorderLevel: 100`).
    - Receive Stock Batch: `POST /medicine-batches` (`quantity: 500`).
    - Dispense Medicine: `POST /medicine-transactions/dispense` (`quantity: 50`).
    - Observe automated stock deduction (`quantityAfter: 450`).

11. **Unified Alert Engine & Deduplication**:
    - Call `POST /health-alerts/generate`.
    - Demonstrate alert creation for high-risk pregnancy, malnutrition, and stock levels.
    - Acknowledge alert: `PATCH /health-alerts/{id}/acknowledge`.

12. **AI Health Risk Intelligence & Medicine Forecasting**:
    - Evaluate overall patient risk: `POST /health-risks/evaluate/{patientId}`.
    - Generate 30-day medicine demand forecast: `POST /medicine-forecasts/generate`.
    - Show predicted demand, safety buffer (25%), recommended stock level, and stockout risk assessment.

13. **Offline Synchronization & Idempotency**:
    - Submit offline sync batch: `POST /sync` with unique `operationId`.
    - Submit identical batch again with same `operationId`.
    - Demonstrate instant idempotency rejection with status `DUPLICATE`.

14. **Security Hardening & Negative Testing**:
    - Demonstrate ASHA trying to create another PHC -> HTTP 403 Forbidden.
    - Demonstrate ASHA attempting to access another ASHA's patient -> HTTP 403 Forbidden.
    - Demonstrate Pharmacist attempting to evaluate clinical patient risk -> HTTP 403 Forbidden.

15. **Audit Trail System**:
    - Call `GET /audit-logs`.
    - Demonstrate detailed immutable audit logging for all administrative, patient, maternal, inventory, and sync actions.
