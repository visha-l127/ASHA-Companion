# 🩺 ASHA Companion — Full-System Documentation

ASHA Companion is a microservices-based EHR and field-coordination platform designed to support ASHA (Accredited Social Health Activist) volunteers, Primary Health Center (PHC) Supervisors, and Pharmacists in rural and low-connectivity environments.

---

## 📋 Problem Statement

In rural sectors, community health workers (ASHAs) face:
* **Poor Network Connectivity**: Standard cloud EHRs fail during offline field home visits.
* **Complex Patient Monitoring**: Tracking pregnant mothers, child immunizations, and malnutrition growth trends manually leads to high risk of missed follow-ups.
* **Supplies Shortages**: Poor communication of medicine inventory stockouts at sub-centers.
* **Coordination Gaps**: PHC Supervisors lack direct channels to delegate high-urgency tasks directly to community volunteers.

**ASHA Companion** solves these issues by providing an **offline-first field collection worksheet** for volunteers, coupled with a **real-time backend coordination board** for Supervisors and Pharmacists, backed by **AI-assisted diagnostic risk alerts**.

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
                 │   Spring Boot Auth Service     │
                 │          (Port 8082)           │
                 └───────────────┬────────────────┘
                                 │ Spring Security / JWT / RBAC
                                 ▼
                 ┌────────────────────────────────┐
                 │       JPA / Hibernate          │
                 └───────────────┬────────────────┘
                                 │ JDBC Driver
                                 ▼
                 ┌────────────────────────────────┐
                 │       Oracle Database          │
                 │         (Port 1521)            │
                 └────────────────────────────────┘
```

### **Architecture Component Roles:**
1. **React / Vite Frontend**: Provides a responsive, glassmorphic UI using Tailwind CSS. Stores local logs in browser sandbox `localStorage` during offline use.
2. **API Gateway (Spring Cloud Gateway)**: Serves as the single entry point. Centralizes routing, logs, and forwards CORS headers.
3. **Eureka Discovery Server**: Registers dynamic instances and resolves target IP addresses for backend load-balancing.
4. **Auth Service**: Manages accounts, encrypts passwords using BCrypt, generates JWT keys, and processes patient, maternal, immunization, inventory, and AI workloads.
5. **Oracle Database (XE)**: The central relational database schema.

---

## 💻 Technology Stack

### **Frontend**
- React 18, TypeScript, Vite.
- Tailwind CSS (Vanilla themes).
- Lucide React (Icons library), Recharts (Growth charts visualization).

### **Backend**
- Java 17, Spring Boot 3.x.
- Spring Security (JWT filter chain, BCrypt encoder).
- Spring Data JPA, Hibernate ORM.
- Spring Cloud Netflix Eureka Client, Spring Cloud Gateway.

### **Database & AI**
- Oracle Database 11g/12c/19c Express Edition.
- Linear Regression and Decision Trees (native Java models) for healthcare trend analysis.

---

## 🔐 Role-Based Access Control (RBAC)

Spring Security enforces authorization boundaries at the microservice controllers layer:

| Role | Enforced Permissions | Scope Boundary |
|---|---|---|
| **ADMIN** | PHC Directory creation/updates, system-level user creation. | Global Administrative |
| **PHC_SUPERVISOR** | User creation (ASHA, Pharmacists), Priority Visits delegation, patient monitoring. | PHC Local Sector Only |
| **ASHA** | Patient logs, maternal cards, visits records, immunizations, child growth. | Community Field Work |
| **PHARMACIST** | Medicine catalog, receiving batches, stock transactions. | PHC Pharmacy Inventory |

*Note: All endpoints return `403 Forbidden` if requested with an unauthorized role token.*

---

## 🔌 API Catalog

| Module | Method | Endpoint | Required Role | Expected Status |
|---|---|---|---|---|
| **Auth** | `POST` | `/auth/login` | Public | `200 OK` |
| **Profile** | `GET` | `/users/profile` | `ADMIN`, `SUPERVISOR`, `ASHA`, `PHARMACIST` | `200 OK` |
| **User Mgmt** | `POST` | `/users` | `ADMIN`, `PHC_SUPERVISOR` | `200 OK` (Upsert) |
| **User Mgmt** | `DELETE`| `/users/{id}` | `ADMIN`, `PHC_SUPERVISOR` | `204 No Content`|
| **PHC Mgmt** | `POST` | `/phcs` | `ADMIN` | `201 Created` |
| **Patients** | `POST` | `/patients` | `ASHA` | `201 Created` |
| **Maternal** | `POST` | `/pregnancies` | `ASHA` | `201 Created` |
| **Maternal** | `POST` | `/pregnancies/{id}/visits` | `ASHA` | `201 Created` |
| **Immunize** | `POST` | `/immunizations` | `ASHA` | `201 Created` |
| **Nutrition** | `POST` | `/nutrition-records` | `ASHA` | `201 Created` |
| **Priority** | `POST` | `/priority-visits` | `PHC_SUPERVISOR` | `201 Created` |
| **Priority** | `PUT` | `/priority-visits/{id}` | `PHC_SUPERVISOR` | `200 OK` |
| **Priority** | `DELETE`| `/priority-visits/{id}` | `PHC_SUPERVISOR` | `204 No Content`|
| **AI Assessment** | `GET`| `/ai/dashboard/summary` | `SUPERVISOR`, `ASHA`, `PHARMACIST`| `200 OK` |

---

## 💾 Database Schema

The central Oracle Database schema maps the following primary tables:
- **`users`**: Stores security accounts, passwords, and phcId associations.
- **`phcs`**: Primary Health Center directories.
- **`patients`**: EHR demographics (name, dob, gender, phone, address).
- **`pregnancies` & `antenatal_visits`**: Maternal health tracks mapping patient antenatal followups.
- **`immunization_records`**: Child immunization schedules.
- **`nutrition_records`**: Malnutrition tracking tables (weight, height, MUAC, age).
- **`medicines`, `medicine_batches`, `medicine_transactions`**: Inventory and transaction logs.
- **`priority_visits`**: Table mapping priority delegations from supervisors to ASHA workers.

---

## 📴 Offline-First Synchronization Workflow

ASHA workers operate in rural areas with weak networks using local database caching:
1. **Offline Mode Enabled**: App caches logs locally using `localStorage` keys.
2. **Worksheets Entry**: Household, patient, maternal, immunization, and growth records are stored in browser memory with status `'pending'`.
3. **Data Synchronize**: When internet returns, ASHA triggers the **Sync Now** button:
   - Evaluates offline array collections.
   - Triggers `POST` requests in order: Patients $\rightarrow$ Active Pregnancies $\rightarrow$ Antenatal Visits $\rightarrow$ Immunizations $\rightarrow$ Nutrition.
   - Resolves database generated IDs to maintain referential integrity.
   - Cleans the queue and marks records as `'synced'`.

---

## 🧠 AI Decision Support Models

The application runs native predictive analytics engines:
- **Maternal Health Risk**: Identifies severe hypertension or anemia risks.
- **Immunization Alerts**: Scans schedules and flags overdue booster doses.
- **Nutrition/Malnutrition Alerts**: Classifies children as SAM (Severe Acute Malnutrition) or MAM (Moderate Acute Malnutrition).
- **Medicine Forecast**: Uses linear regression on historic transaction data to project stock demands.
- **Medicine Expiry Risk**: Computes early alert logs on critical drugs.

---

## 🛠️ Local Development Setup

### **1. Discovery Server**
```bash
cd backend/discovery-server
mvn clean package -DskipTests
java -jar target/discovery-server-0.0.1-SNAPSHOT.jar
```
*Port: `8761`*

### **2. Auth Service**
```bash
cd backend/auth-service
mvn clean package -DskipTests
java -jar target/auth-service-0.0.1-SNAPSHOT.jar
```
*Port: `8082`*

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
