# 🩺 ASHA Companion — Full-System Documentation

ASHA Companion is a microservices-based EHR and field-coordination platform designed to support ASHA (Accredited Social Health Activist) volunteers, Primary Health Center (PHC) Supervisors, and Pharmacists in rural and low-connectivity environments.

---

## 📋 Problem Statement

In rural sectors, community health workers (ASHAs) face:
* **Poor Network Connectivity**: Standard cloud EHRs fail during offline field home visits.
* **Complex Patient Monitoring**: Tracking pregnant mothers, child immunizations, and malnutrition growth trends manually leads to high risk of missed follow-ups.
* **Supplies Shortages**: Poor communication of medicine inventory stockouts at sub-centers.
* **Coordination Gaps**: PHC Supervisors lack direct channels to delegate high-urgency tasks directly to community volunteers.

**ASHA Companion** addresses these challenges by providing an **offline-first field collection worksheet** for volunteers, coupled with a **real-time backend coordination board** for Supervisors and Pharmacists, backed by a **custom rule-based clinical intelligence engine**.

---

## 🏗️ System Architecture

The application is built on a distributed microservices architecture:

```text
                 ┌────────────────────────────────┐
                 │    React / Vite Frontend       │
                 │          (Port 3002)           │
                 └───────────────┬────────────────┘
                                 │ HTTP requests
                                 ▼
                 ┌────────────────────────────────┐
                 │      API Gateway Service       │
                 │          (Port 8081)           │
                 └───────────────┬────────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 │  Eureka Service Discovery      │◀─── Heartbeat (Registration)
                 │          (Port 8761)           │
                 └───────────────┬────────────────┘
                                 │ Routes Traffic
                                 ▼
                 ┌────────────────────────────────┐
                 │      Microservices Layer       │
                 │  • Auth Service (:8082)        │
                 │  • Admin Service (:8083)       │
                 │  • Clinical Service (:8084)    │
                 │  • Pharmacy Service (:8085)    │
                 │  • AI Service (:8086)          │
                 └───────────────┬────────────────┘
                                 │ Spring Data JPA / Hibernate
                                 ▼
                 ┌────────────────────────────────┐
                 │       Oracle Database XE       │
                 │         (Port 1521)            │
                 └────────────────────────────────┘
```

### **Architecture Component Roles:**
1. **React / Vite Frontend**: Provides a responsive, glassmorphic UI using Tailwind CSS. Stores local records in browser `localStorage` during offline use.
2. **API Gateway (Spring Cloud Gateway)**: Serves as the single entry point. Centralizes routing, logs, and forwards CORS headers.
3. **Eureka Discovery Server**: Registers dynamic instances and resolves target IP addresses for backend load-balancing.
4. **Microservices Layer**:
   - **Auth Service (:8082)**: Authentication, JWT generation/validation, password hashing.
   - **Admin Service (:8083)**: PHC directory management, user provisioning, system audit logging.
   - **Clinical Service (:8084)**: Patient records, households, maternal care, antenatal visits, immunizations, nutrition monitoring, medicine issues, and offline sync processing.
   - **Pharmacy Service (:8085)**: Medicine catalogue, batch tracking, stock transactions, inventory adjustments.
   - **AI Service (:8086)**: Clinical risk evaluation, visit prioritization scoring, medicine demand forecasting, and analytics dashboards.
5. **Oracle Database (11g XE)**: Central relational database with dedicated sequences and relational constraints.

---

## 💻 Technology Stack

### **Frontend**
- React 18, TypeScript, Vite.
- Tailwind CSS.
- Lucide React (Icons library), Recharts (Growth charts visualization).

### **Backend**
- Java 17, Spring Boot 3.x / Spring Cloud 2024.
- Spring Security (Stateless JWT filter chain, BCrypt password encoder).
- Spring Data JPA, Hibernate ORM.
- Spring Cloud Netflix Eureka Client & Server, Spring Cloud Gateway.

### **Database & Clinical Intelligence**
- Oracle Database 11g/12c/19c Express Edition (`OracleLegacyDialect`).
- **Custom Rule-Based Clinical Intelligence Engine**: Deterministic clinical risk scoring, WHO growth cutoff rules, and run-rate demand forecasting (no third-party black-box ML dependencies).

---

## 🔐 Role-Based Access Control (RBAC)

Spring Security enforces authorization boundaries at the microservice controllers layer:

| Role | Enforced Permissions | Scope Boundary |
|---|---|---|
| **ADMIN** | PHC Directory creation/updates, PHC Supervisor user provisioning, system audit logs. | Global Administrative |
| **PHC_SUPERVISOR** | User provisioning (ASHA, Pharmacists in assigned PHC), Priority Visits delegation, patient monitoring, PHC-level reports. | PHC Local Sector Only |
| **ASHA** | Patient records, household records, maternal cards, antenatal visits, immunizations, child growth, medicine issues, offline sync. | Community Field Work (Assigned Patients) |
| **PHARMACIST** | Medicine catalogue, batch intake, dispensing, stock adjustments, pharmacy inventory reports. | PHC Pharmacy Inventory |

*Note: All endpoints return `403 Forbidden` if requested with an unauthorized role token.*

---

## 🗑️ Clinical Data Deletion & Integrity Semantics

To preserve historical medical records and ensure clinical auditability, the clinical data layer enforces explicit deletion semantics across all entities as a deliberate data-integrity decision:

### 1. Soft-Delete Clinical Entities
The following entities use **soft deletion / deactivation** (`active = 0` / `active = false`):
* **Patients** (`DELETE /patients/{id}` $\rightarrow$ `204 No Content`, marks `active = 0`)
* **Households** (`DELETE /households/{id}` $\rightarrow$ `204 No Content`, marks `active = 0`)
* **Pregnancies** (`DELETE /pregnancies/{id}` $\rightarrow$ `204 No Content`, marks `active = false`)
* **Antenatal Visits** (`DELETE /pregnancies/visits/{id}` $\rightarrow$ `204 No Content`, marks `active = 0`)
* **Nutrition Records** (`DELETE /nutrition-records/{id}` $\rightarrow$ `204 No Content`, marks `active = 0`)
* **Medicine Issues** (`DELETE /medicine-issues/{id}` $\rightarrow$ `204 No Content`, marks `active = 0`)

Soft-deleted records remain stored in Oracle to preserve historical medical context, but are marked inactive and excluded from normal active queries and operational dashboards.

### 2. Pregnancy Deactivation Behavior
Deleting/deactivating a pregnancy record sets `active = false` without altering the clinical `pregnancyStatus`. Deleting/deactivating a pregnancy sets the record inactive without falsely changing its clinical pregnancy status to `COMPLETED`. Legitimate pregnancy completion remains a separate, explicit clinical status update (`PATCH /pregnancies/{id}/status?status=COMPLETED` or `PUT /pregnancies/{id}`).

### 3. Immunizations Update & Conditional Deletion Protection
Immunization record integrity enforces strict clinical history preservation:
* **Create** $\rightarrow$ `POST /immunizations` $\rightarrow$ `201 Created`
* **Read** $\rightarrow$ `GET /immunizations/patient/{patientId}` & `GET /immunizations/{id}` $\rightarrow$ `200 OK`
* **Update** $\rightarrow$ `PUT /immunizations/{id}` $\rightarrow$ `200 OK`
  * An already-administered immunization cannot be changed back to `administered=false` or `null`.
  * Such attempts return `409 Conflict`.
* **Delete** $\rightarrow$ `DELETE /immunizations/{id}`
  * Non-administered records may be deleted successfully (`204 No Content`).
  * Administered records are protected and return `409 Conflict` (`AdministeredImmunizationDeletionException`).

This restriction preserves administered immunization history while allowing correction/removal of records that have not yet been administered.

---

## 🔌 API & CRUD Matrix

| Module | Method | Endpoint | Supported Operation | Required Role | Status Code |
|---|---|---|---|---|---|
| **Auth** | `POST` | `/auth/login` | Authentication / JWT Token Issue | Public | `200 OK` |
| **Auth** | `POST` | `/auth/register` | Self-Registration | Public | `201 Created` |
| **Profile** | `GET` | `/users/profile` | Read Current User Profile | Authenticated | `200 OK` |
| **Profile** | `POST`| `/auth/change-password` | Password Change | Authenticated | `200 OK` |
| **User Mgmt** | `POST` | `/users` | Create / Re-provision User | `ADMIN`, `PHC_SUPERVISOR` | `201 Created` / `200 OK` |
| **User Mgmt** | `GET`  | `/users` | Read Users List (Scoped) | `ADMIN`, `PHC_SUPERVISOR` | `200 OK` |
| **User Mgmt** | `PUT`  | `/users/{id}` | Update User Details | `ADMIN`, `PHC_SUPERVISOR` | `200 OK` |
| **User Mgmt** | `DELETE`| `/users/{id}` | Deactivate / Delete User | `ADMIN`, `PHC_SUPERVISOR` | `204 No Content` |
| **PHC Mgmt** | `POST` | `/phcs` | Create PHC Directory | `ADMIN` | `201 Created` |
| **PHC Mgmt** | `GET`  | `/phcs` | Read PHC Directory List | `ADMIN`, `PHC_SUPERVISOR` | `200 OK` |
| **PHC Mgmt** | `PUT`  | `/phcs/{id}` | Update PHC Details | `ADMIN` | `200 OK` |
| **PHC Mgmt** | `DELETE`| `/phcs/{id}` | Delete PHC Directory | `ADMIN` | `204 No Content` |
| **Patients** | `POST` | `/patients` | Create Patient Record | `ASHA`, `ADMIN` | `201 Created` |
| **Patients** | `GET`  | `/patients` | Read Patients List (Scoped) | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Patients** | `GET`  | `/patients/{id}` | Read Patient by ID | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Patients** | `PUT`  | `/patients/{id}` | Update Patient Details | `ASHA`, `ADMIN` | `200 OK` |
| **Patients** | `DELETE`| `/patients/{id}` | Soft Delete Patient (`active=0`) | `ASHA`, `ADMIN` | `204 No Content` |
| **Households** | `POST` | `/households` | Create Household Record | `ASHA`, `ADMIN` | `201 Created` |
| **Households** | `GET`  | `/households` | Read Households List (Scoped) | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Households** | `PUT`  | `/households/{id}` | Update Household Record | `ASHA`, `ADMIN` | `200 OK` |
| **Households** | `DELETE`| `/households/{id}` | Soft Delete Household (`active=0`)| `ASHA`, `ADMIN` | `204 No Content` |
| **Maternal** | `POST` | `/pregnancies` | Register Pregnancy | `ASHA`, `ADMIN` | `201 Created` |
| **Maternal** | `GET`  | `/pregnancies` | Read Pregnancies List | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Maternal** | `GET`  | `/pregnancies/{id}` | Read Pregnancy by ID | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Maternal** | `GET`  | `/pregnancies/high-risk` | Read High-Risk Pregnancies | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Maternal** | `PUT`  | `/pregnancies/{id}` | Update Pregnancy Details | `ASHA`, `ADMIN` | `200 OK` |
| **Maternal** | `PATCH`| `/pregnancies/{id}/status` | Update Clinical Status | `ASHA`, `ADMIN` | `200 OK` |
| **Maternal** | `DELETE`| `/pregnancies/{id}` | Soft Deactivation (`active=false`)| `ASHA`, `ADMIN` | `204 No Content` |
| **ANC Visits** | `POST` | `/pregnancies/{id}/visits` | Record Antenatal Visit | `ASHA`, `ADMIN` | `201 Created` |
| **ANC Visits** | `GET`  | `/pregnancies/{id}/visits` | Read Visits for Pregnancy | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **ANC Visits** | `DELETE`| `/pregnancies/visits/{id}` | Soft Delete Visit (`active=0`) | `ASHA`, `ADMIN` | `204 No Content` |
| **Immunize** | `POST` | `/immunizations` | Record Immunization Dose | `ASHA`, `ADMIN` | `201 Created` |
| **Immunize** | `GET`  | `/immunizations/{id}` | Read Immunization Dose | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Immunize** | `GET`  | `/immunizations/patient/{patientId}` | Read Patient Immunizations | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Immunize** | `PUT`  | `/immunizations/{id}` | Update Immunization Dose (409 Conflict if un-administering an already-administered record) | `ASHA`, `ADMIN` | `200` / `409` |
| **Immunize** | `DELETE`| `/immunizations/{id}` | Conditional Delete (Non-Administered: 204; Administered: 409) | `ASHA`, `ADMIN` | `204` / `409` |
| **Nutrition** | `POST` | `/nutrition-records` | Create Growth Record | `ASHA`, `ADMIN` | `201 Created` |
| **Nutrition** | `GET`  | `/nutrition-records` | Read Nutrition Records | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Nutrition** | `GET`  | `/nutrition-records/{id}` | Read Nutrition Record by ID | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Nutrition** | `GET`  | `/patients/{patientId}/nutrition-records` | Read Patient Growth History | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Nutrition** | `PUT`  | `/nutrition-records/{id}` | Update Growth Record | `ASHA`, `ADMIN` | `200 OK` |
| **Nutrition** | `DELETE`| `/nutrition-records/{id}` | Soft Delete Record (`active=0`) | `ASHA`, `ADMIN` | `204 No Content` |
| **Medicine Issues** | `POST` | `/medicine-issues` | Record Medicine Issue to Patient | `ASHA`, `ADMIN` | `201 Created` |
| **Medicine Issues** | `GET`  | `/medicine-issues` | Read Medicine Issues (Scoped) | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Medicine Issues** | `GET`  | `/medicine-issues/patient/{patientId}` | Read Patient Medicine Issues | `ASHA`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Medicine Issues** | `PUT`  | `/medicine-issues/{id}` | Update Medicine Issue Record | `ASHA`, `ADMIN` | `200 OK` |
| **Medicine Issues** | `DELETE`| `/medicine-issues/{id}` | Soft Delete Issue (`active=0`) | `ASHA`, `ADMIN` | `204 No Content` |
| **Pharmacy** | `POST` | `/medicines` | Create Medicine Catalogue Item | `PHARMACIST`, `ADMIN` | `201 Created` |
| **Pharmacy** | `GET`  | `/medicines` | Read Medicine Catalogue | `PHARMACIST`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Pharmacy** | `PUT`  | `/medicines/{id}` | Update Medicine Item | `PHARMACIST`, `ADMIN` | `200 OK` |
| **Pharmacy** | `DELETE`| `/medicines/{id}` | Delete Medicine Item | `PHARMACIST`, `ADMIN` | `204 No Content` |
| **Batches**  | `POST` | `/medicine-batches` | Receive Medicine Batch | `PHARMACIST`, `ADMIN` | `201 Created` |
| **Batches**  | `GET`  | `/medicine-batches` | Read Medicine Batches | `PHARMACIST`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Stock Tx** | `POST` | `/medicine-transactions/dispense` | Dispense Medicine Stock | `PHARMACIST`, `ADMIN` | `200 OK` |
| **Stock Tx** | `POST` | `/medicine-transactions/adjust` | Adjust Stock Inventory | `PHARMACIST`, `ADMIN` | `200 OK` |
| **Stock Tx** | `GET`  | `/medicine-transactions` | Read Stock Transaction Logs | `PHARMACIST`, `SUPERVISOR`, `ADMIN` | `200 OK` |
| **Priority** | `POST` | `/priority-visits` | Delegate Priority Visit | `PHC_SUPERVISOR` | `201 Created` |
| **Priority** | `GET`  | `/priority-visits` | Read Priority Visits List | `PHC_SUPERVISOR`, `ASHA` | `200 OK` |
| **Priority** | `PUT`  | `/priority-visits/{id}` | Update Priority Visit Status | `PHC_SUPERVISOR` | `200 OK` |
| **Priority** | `DELETE`| `/priority-visits/{id}` | Delete Priority Visit | `PHC_SUPERVISOR` | `204 No Content` |
| **Dashboards** | `GET`| `/dashboard/summary` | Role-Scoped Dashboard Summary | Authenticated | `200 OK` |
| **Dashboards** | `GET`| `/dashboard/overview` | Role-Scoped Overview Stats | Authenticated | `200 OK` |
| **Reports**  | `GET`  | `/reports/{type}` | Clinical / Inventory Reports | Scoped by Role | `200 OK` |
| **Offline Sync** | `POST` | `/sync` | Process Single Offline Operation | `ASHA`, `PHARMACIST`, `ADMIN` | `200 OK` |
| **Offline Sync** | `POST` | `/sync/batch` | Process Batch Offline Operations | `ASHA`, `PHARMACIST`, `ADMIN` | `200 OK` |
| **Offline Sync** | `GET`  | `/sync/history` | Read Sync Operations History | Scoped by Role | `200 OK` |

*Note on CRUD Updates & Omission Corrections: Medicine Issues, Pregnancies (PUT details & PATCH status), and Immunizations (PUT dose details) provide full Update support returning 200 OK. Previous documentation under-documented these endpoints by omitting their implemented Update operations.*

---

## 💾 Database Schema

The central Oracle Database schema maps the following primary tables:
- **`users`**: Security accounts, BCrypt password hashes, roles, and PHC associations.
- **`phcs`**: Primary Health Center directory entries (code, name, district, state).
- **`patients`**: Patient demographics and ASHA worker assignment (`active` flag for soft delete).
- **`households`**: Household records mapping families and living conditions (`active` flag).
- **`pregnancies` & `antenatal_visits`**: Maternal health tracking and antenatal visit records (`active` flag).
- **`immunization_records`**: Child immunization records with `administered` dose status tracking.
- **`nutrition_records`**: Malnutrition tracking records (weight, height, MUAC, age, `active` flag).
- **`medicine_issues`**: Patient medicine dispensing records recorded by ASHA workers (`active` flag).
- **`medicines`, `medicine_batches`, `medicine_transactions`**: Pharmacy catalogue, batch inventory, and transaction audit trails.
- **`priority_visits`**: Priority task delegations from PHC Supervisors to ASHA workers.
- **`sync_operations`**: Audit log of all processed offline synchronization operations and conflict statuses.
- **`audit_logs`**: System-wide administrative action logs.

---

## 📴 Offline-First Synchronization & Conflict Detection

ASHA workers operate in rural areas with weak networks using local browser caching and synchronization endpoints:

### Synchronization Workflow
1. **Offline Mode**: When disconnected, worksheet entries (Patients, Pregnancies, ANC Visits, Immunizations, Nutrition) are cached in `localStorage` with status `'pending'` and assigned client-side operation IDs and timestamps (`clientTimestamp`, `clientUpdatedAt`).
2. **Sync Execution**: When connectivity is restored, the client posts queued operations to `POST /sync` or `POST /sync/batch`.
3. **Idempotency**: `SyncService` verifies `operationId` against `sync_operations` table. If already processed, it returns status `"DUPLICATE"` without re-executing.
4. **Entity Creation Sequence**: Operations are executed in referential order (Patients $\rightarrow$ Pregnancies $\rightarrow$ Visits $\rightarrow$ Immunizations $\rightarrow$ Nutrition).

### Current Offline Conflict Detection Status
* **Covered Entities**:
  * **Patient** (`SyncService.java:136-143`): On `UPDATE`, compares `clientUpdatedAt` with database `existingPatient.getUpdatedAt()`. If the server record has a newer timestamp, the operation is flagged with status `"CONFLICT"`, `conflictType = "SERVER_VERSION_NEWER"`, and logged to `sync_operations`.
  * **Pregnancy** (`SyncService.java:175-182`): On `UPDATE`, compares `clientUpdatedAt` with database `existingPreg.getUpdatedAt()`. If the server record has a newer timestamp, the operation is flagged with status `"CONFLICT"`, `conflictType = "SERVER_VERSION_NEWER"`, and logged to `sync_operations`.
* **Entities Not Covered by Conflict Detection**:
  * **Household**: Not processed via the `SyncService` switch path (`SyncService.java:113-264`).
  * **Antenatal Visit** (`SyncService.java:191-207`): Sync path supports `CREATE` only; no `UPDATE` conflict comparison exists.
  * **Immunization** (`SyncService.java:209-224`): Sync path supports `CREATE` only; no `UPDATE` conflict comparison exists.
  * **Nutrition Record** (`SyncService.java:226-241`): Sync path supports `CREATE` only; no `UPDATE` conflict comparison exists.
* **Documented Limitation**: Multi-device concurrent conflict *resolution* (such as automated three-way field merging or supervisor conflict-resolution screens) is **not implemented** in the current scope. Conflict detection is limited to timestamp comparison on Patient and Pregnancy updates.

---

## 🧠 Custom Rule-Based Clinical Intelligence Engine

The project uses a **custom domain-specific rule-based clinical intelligence engine** using weighted risk scoring, deterministic clinical rules, and forecasting logic.

> **Architecture Note**: The current implementation does **NOT** use external black-box models or generative AI (e.g. GPT, Gemini, OpenAI, Claude, Random Forest, XGBoost, Neural Networks, or any trained machine-learning model). All clinical decisions and risk alerts are computed using transparent, deterministic, auditable rules aligned with standard public health guidelines.

### Implemented Clinical Intelligence Capabilities:
1. **High-Risk Pregnancy Assessment**:
   - Evaluates maternal health parameters: systolic BP $\ge 140$ mmHg, diastolic BP $\ge 90$ mmHg (hypertension), hemoglobin $< 11.0$ g/dL (anemia) or $< 7.0$ g/dL (severe anemia), high gravida ($\ge 5$), maternal age limits ($< 18$ or $> 35$), and previous obstetric complications.
   - Computes deterministic risk flags (`highRisk: true/false`) and generates priority alerts.
2. **Child Malnutrition Risk Detection**:
   - Evaluates Mid-Upper Arm Circumference (MUAC) and anthropometric metrics: MUAC $< 11.5$ cm flags **Severe Acute Malnutrition (SAM)**; MUAC $11.5 - 12.5$ cm flags **Moderate Acute Malnutrition (MAM)**.
   - Classifies risk status (`NORMAL`, `MODERATE_RISK`, `HIGH_RISK`) and generates automated nutrition alerts.
3. **Immunization Risk Detection**:
   - Scans immunization schedules against patient date of birth and current date.
   - Deterministically identifies overdue and missed booster doses.
4. **AI-Assisted Visit Prioritization**:
   - Evaluates maternal risk, malnutrition severity, and overdue visits to generate a weighted urgency score for PHC Supervisor task delegation.
5. **Medicine Demand Forecasting & Expiry-Risk Analysis**:
   - Computes projected consumption run-rates from historical dispensing transaction velocity.
   - Evaluates medicine batch expiry dates against safety thresholds to flag stock nearing expiration.

---

## 🔑 Administrative Assumptions & System Limitations

### Temporary Password Delivery Assumption
* The system does not integrate with external SMS or email gateways (e.g. Twilio, SendGrid, AWS SES) for automated credential delivery.
* During administrative user provisioning (`POST /users`), temporary passwords are encrypted using BCrypt and stored in the database.
* Initial credentials are assumed to be securely communicated to new users out-of-band through standard administrative workflows.

### Schema Migration & Deployment Consideration
* Adding a `NOT NULL` column to an existing populated Oracle table requires an explicit `DEFAULT` clause (e.g. `@Column(nullable = false, columnDefinition = "NUMBER(10,0) DEFAULT 1")` / `DEFAULT 1 NOT NULL`).
* In Oracle 11g XE, adding a bare `NOT NULL` column without a `DEFAULT` clause to a table with existing rows is rejected with `ORA-01758: table must be empty to add mandatory (NOT NULL) column`.

---

## 🛠️ Local Development Setup

### **1. Discovery Server**
```bash
cd backend/discovery-server
mvn clean package -DskipTests
java -jar target/discovery-server-0.0.1-SNAPSHOT.jar
```
*Port: `8761`*

### **2. Microservices (Auth, Admin, Clinical, Pharmacy, AI)**
```bash
# Start each service from its respective directory:
cd backend/auth-service && java -jar target/auth-service-0.0.1-SNAPSHOT.jar      # Port 8082
cd backend/admin-service && java -jar target/admin-service-0.0.1-SNAPSHOT.jar    # Port 8083
cd backend/clinical-service && java -jar target/clinical-service-0.0.1-SNAPSHOT.jar # Port 8084
cd backend/pharmacy-service && java -jar target/pharmacy-service-0.0.1-SNAPSHOT.jar # Port 8085
cd backend/ai-service && java -jar target/ai-service-0.0.1-SNAPSHOT.jar          # Port 8086
```

### **3. API Gateway**
```bash
cd backend/api-gateway
mvn clean package -DskipTests
java -jar target/api-gateway-0.0.1-SNAPSHOT.jar
```
*Port: `8081`*

### **4. React Frontend**
```bash
cd frontend
npm install
npm run dev
```
*Port: `3002` (Proxies Gateway `/api` calls to `http://localhost:8081`)*

**Default seed credentials (local testing only):** `admin` / `Admin@123`

---

## 🧪 Verification & Test Suite

The system implementation and security policies are validated via automated test suites:
* **End-to-End Regression Suite** (`final_backend_verification.py`):
  - **Result**: `PASSED: 33 / 33` (Health check, Auth, RBAC, PHC Isolation, Patient, Maternal, Immunization, Nutrition, Pharmacy, Dashboard Summary, and Reports).
* **Clinical Data Integrity Test Suite** (`ClinicalDataIntegrityTests.java`):
  - **Result**: `PASSED: 11 / 11` (Soft-delete verification, administered immunization delete rejection with 409 Conflict, pregnancy delete status preservation).

---

## 🎬 Recommended Demo Flow

Follow this sequence to demonstrate end-to-end integration and stability:

### **Step 1: Supervisor - Delegate Priority Visit**
1. Log in as Supervisor `vedava` (Password: `Vedava@123`).
2. Go to **Priority Visits**.
3. Click **Delegate Priority Visit** and submit form:
   - Patient: `TEST_DEMO_PATIENT`
   - Condition: `Gestational Hypertension 155/95 follow-up`
   - Urgency: `High`
   - Assign: `Anita Devi`
4. Verify in the Network tab: `POST /priority-visits` returned status **`201 Created`**.
5. Refresh browser completely $\rightarrow$ Verify the visit remains in the list (Verifies database read persistence).

### **Step 2: Supervisor - Edit & Update Status**
1. Click **Mark as Completed / Visited** on the card.
2. Verify in the Network tab: `PUT /priority-visits/{id}` returned status **`200 OK`**.
3. Reload page $\rightarrow$ Verify status is modified to `Completed` (Verifies database update persistence).

### **Step 3: Supervisor - Delete Visit**
1. Click **Delete** button on the card.
2. Verify in the Network tab: `DELETE /priority-visits/{id}` returned status **`204 No Content`**.
3. Refresh page $\rightarrow$ Verify card is permanently gone (Verifies database delete persistence).

### **Step 4: Demonstrate Security (RBAC)**
1. Log in as ASHA worker `anita.devi` (Password: `Asha@123`).
2. Open DevTools console and attempt to trigger an admin user fetch:
```javascript
   fetch('/api/users', { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } })
```
3. Show console logs: API Gateway / backend returns status **`403 Forbidden`** (Verifies server-side RBAC validation).

### **Step 5: Demonstrate ASHA Offline Sync**
1. Go to **Sync** screen and toggle **Simulate Offline Mode**.
2. Go to **Patients** worksheet, add a new patient: `TEST_OFFLINE_PATIENT`.
3. Show **Sync Queue** $\rightarrow$ patient is listed as `Pending`.
4. Turn off **Simulate Offline Mode**, click **Sync Now**.
5. Show Network tab: `POST /patients` returned status **`201 Created`** (Verifies offline queue sync).

---

## 📦 Final Git Commit Recommendation
Commit message syntax:
```text
feat(release): freeze stable final version of ASHA Companion
```