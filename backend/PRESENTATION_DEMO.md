# ASHA Companion Backend - Academic Presentation Demo Guide

This document outlines a deterministic, step-by-step 15-minute presentation script for demonstrating the ASHA Companion backend system.

---

## 1. Problem Statement & Architecture Overview (3 Mins)

- **Problem Statement**: Healthcare management in rural India requires offline-first operations for ASHA workers, paired with real-time analytics for PHC Supervisors and inventory controls for Pharmacists.
- **Architecture**:
  - **Spring Cloud Gateway (:8081)**: Central entry point handling routing & CORS.
  - **Netflix Eureka (:8761)**: Service discovery allowing dynamic instance registration.
  - **Auth & Healthcare Service (:8082)**: Microservice handling JWT auth, patient management, maternal care, immunization, nutrition, pharmacy, alerts, and reporting.
  - **Oracle 11g XE DB (:1521/XE)**: Relational storage with sequence generators.

---

## 2. Infrastructure & Health Verification (2 Mins)

1. Open `http://localhost:8761` -> Show `API-GATEWAY` and `AUTH-SERVICE` registered in Eureka.
2. Open `http://localhost:8081/swagger-ui.html` -> Demonstrate unified OpenAPI documentation exposed via Gateway.
3. Call `GET http://localhost:8081/health` -> Confirm system health status `UP`.

---

## 3. Role-Based Access Control & User Creation (3 Mins)

1. **Admin Login**:
   - `POST /auth/login` (`admin` / `Admin@123`). Copy JWT token and authorize Swagger UI.
2. **PHC & User Provisioning**:
   - Create PHC: `POST /phcs` (`code: PHC_DEMO_01`).
   - Provision PHC Supervisor: `POST /users` (`role: PHC_SUPERVISOR`).
   - Provision Pharmacist: `POST /users` (`role: PHARMACIST`).
   - Register ASHA Worker: `POST /auth/register` (`role: ASHA`).

---

## 4. Patient Registration & Clinical Risk Intelligence (4 Mins)

1. **Patient Registration**: `POST /patients` (Registered under ASHA worker).
2. **Pregnancy & ANC Visit**:
   - `POST /pregnancies` -> Register pregnancy.
   - `POST /pregnancies/{id}/visits` -> Record ANC visit with BP `145/95 mmHg` and Hemoglobin `9.5 g/dL`.
   - **Clinical Evaluation Result**: System automatically flags `highRisk: true` and generates alerts.
3. **Child Growth & Nutrition Screening**:
   - `POST /nutrition-records` -> Record MUAC `10.5 cm`.
   - **Nutrition Screening Result**: System automatically flags status as `HIGH_RISK` (Severe Acute Malnutrition).

---

## 5. Pharmacy Inventory & Stock Management (2 Mins)

1. Switch authorization to Pharmacist JWT.
2. Receive Batch: `POST /medicine-batches` (`quantity: 500`).
3. Dispense Stock: `POST /medicine-transactions/dispense` (`quantity: 50`).
4. Show automatic inventory deduction: `quantityAfter: 450`.

---

## 6. Executive Dashboards & Reports (1 Min)

1. Execute `GET /dashboard/summary` -> Demonstrate role-scoped metrics (Admin = Global, Supervisor = PHC, ASHA = Assigned Patients, Pharmacist = Pharmacy Inventory).
2. Execute `GET /reports/patients`, `GET /reports/maternal`, `GET /reports/immunization`, `GET /reports/nutrition`, `GET /reports/medicines`.

---

## 7. Security Negative Testing (1 Min)

1. **Pharmacist attempting clinical report**: Call `GET /reports/patients` as Pharmacist -> Returns `403 Forbidden`.
2. **ASHA attempting medicine report**: Call `GET /reports/medicines` as ASHA -> Returns `403 Forbidden`.
3. **Cross-Patient Access**: ASHA attempting to view another ASHA's patient -> Returns `403 Forbidden`.
