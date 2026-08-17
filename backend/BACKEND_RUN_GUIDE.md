# ASHA Companion Backend - Run Guide (VS Code / Windows)

This run guide provides step-by-step instructions to run and present the **ASHA Companion** microservices backend directly from VS Code on Windows.

---

## 1. Prerequisites

- **JDK**: Java 17 (OpenJDK or Oracle JDK)
- **Build Tool**: Apache Maven (included via `mvnw.cmd` wrapper in each microservice)
- **Database**: Oracle Database 11g Express Edition (XE) running on `localhost:1521/XE`
- **IDE**: Visual Studio Code (with Java Extension Pack recommended)

---

## 2. Infrastructure & Port Breakdown

| Service Name | Directory | Port | Description |
|---|---|---|---|
| **Discovery Server** | `backend/discovery-server` | `8761` | Eureka Service Registration & Discovery |
| **API Gateway** | `backend/api-gateway` | `8081` | Spring Cloud Gateway (Single Entry Point) |
| **Auth & Healthcare Service** | `backend/auth-service` | `8082` | Core Business & Authentication Service |
| **Oracle 11g XE DB** | Localhost Service | `1521` | Database (`jdbc:oracle:thin:@localhost:1521:XE`, Schema: `ASHA`) |

---

## 3. Step-by-Step Startup Sequence in VS Code

Open VS Code and launch **3 separate integrated terminal panels** (`Ctrl + Shift + \`` or `Terminal -> New Terminal`).

### Terminal 1: Discovery Server (Port 8761)
```powershell
cd "c:\Projects\ASHA Companion\backend\discovery-server"
.\mvnw.cmd spring-boot:run
```
*Wait ~10 seconds until you see `Started DiscoveryServerApplication`.*
Verify in browser: `http://localhost:8761`

### Terminal 2: Auth & Healthcare Service (Port 8082)
```powershell
cd "c:\Projects\ASHA Companion\backend\auth-service"
.\mvnw.cmd spring-boot:run
```
*Wait ~15 seconds until you see `Started AuthServiceApplication`.*

### Terminal 3: API Gateway (Port 8081)
```powershell
cd "c:\Projects\ASHA Companion\backend\api-gateway"
.\mvnw.cmd spring-boot:run
```
*Wait ~10 seconds until you see `Started ApiGatewayApplication`.*

---

## 4. Confirm Service Health & Eureka Registration

1. Open `http://localhost:8761` in your web browser.
2. Confirm the **Instances currently registered with Eureka** table shows:
   - `API-GATEWAY` -> Status: `UP (1) - 8081`
   - `AUTH-SERVICE` -> Status: `UP (1) - 8082`
3. Call the health endpoint through API Gateway:
   ```bash
   curl http://localhost:8081/health
   ```
   Output: `{"status": "UP", "service": "auth-service"}`

---

## 5. API Documentation & Interactive Testing (Swagger UI)

Navigate to:
```text
http://localhost:8081/swagger-ui.html
```

### Authorization Procedure:
1. Execute `POST /auth/login` with credentials:
   ```json
   {
     "username": "admin",
     "password": "Admin@123"
   }
   ```
2. Copy the `token` field from the JSON response.
3. Click **Authorize** (top right of Swagger UI).
4. Paste the JWT token into the `Value` box and click **Authorize**.
5. All protected endpoints are now fully authorized.

---

## 6. Automated Verification Suite Execution

To run the complete 33-point end-to-end regression and security verification suite:
```powershell
python "c:\Projects\ASHA Companion\backend\final_backend_verification.py"
```
Expected result: **`PASSED: 33 / 33`**
