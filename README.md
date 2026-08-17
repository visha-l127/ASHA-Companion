🩺 ASHA Companion
Electronic Health Record and Field Coordination Platform for ASHA Workers

ASHA Companion is a healthcare management platform designed to support ASHA (Accredited Social Health Activist) workers, PHC Supervisors, Pharmacists, and Administrators in managing community healthcare activities.

The project combines a React + TypeScript frontend with a Spring Boot microservices backend, Oracle Database, role-based access control, healthcare record management, pharmacy inventory management, offline data synchronization, and AI-assisted healthcare analytics.

📌 Problem Statement

ASHA workers often perform healthcare activities in environments where network connectivity may be limited or unreliable. Managing patient information, maternal health records, immunization schedules, nutrition data, field visits, and medicine-related information manually can make follow-up and coordination difficult.

ASHA Companion provides a centralized digital platform that supports:

Patient and household management
Maternal healthcare tracking
Immunization management
Child nutrition and growth monitoring
Field visit recording
Priority visit delegation
Pharmacy inventory management
Offline data collection and synchronization
Healthcare analytics and decision support
Role-based access control
🎯 Objectives

The main objectives of ASHA Companion are to:

Digitize community healthcare workflows
Maintain electronic patient records
Support ASHA workers during field visits
Enable data collection during network interruptions
Synchronize offline records when connectivity is restored
Improve maternal and child health monitoring
Track immunization and nutrition information
Improve coordination between ASHA workers and PHC supervisors
Manage medicines and pharmacy inventory
Provide healthcare analytics and forecasting
Enforce secure, role-based access to healthcare information
🏗️ System Architecture

The project follows a microservices-based architecture.

                         ┌──────────────────────────┐
                         │     React Frontend       │
                         │   TypeScript + Vite      │
                         └────────────┬─────────────┘
                                      │
                                      │ REST APIs
                                      ▼
                         ┌──────────────────────────┐
                         │      API Gateway         │
                         │ Spring Cloud Gateway     │
                         │        :8081             │
                         └────────────┬─────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
             │    Auth     │  │  Clinical   │  │  Pharmacy   │
             │   Service   │  │   Service   │  │   Service   │
             └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │ Oracle Database  │
                           │      :1521       │
                           └──────────────────┘


                           ┌──────────────────┐
                           │ Eureka Discovery │
                           │      :8761       │
                           └──────────────────┘


             ┌────────────────────────────────────────────┐
             │              Supporting Services           │
🧩 System Components
Frontend

The frontend provides role-specific dashboards and workflows for the different users of the system.

Frontend Roles
ASHA Worker
PHC Supervisor
Pharmacist
Administrator
ASHA Worker Modules
Dashboard
Household Management
Patient Management
Health Visits
Maternal Health
Immunization
Nutrition
Medicine Information
Offline Synchronization
Profile
PHC Supervisor Modules
Dashboard
Patient Monitoring
ASHA Management
Pharmacist Management
Priority Visits
Alerts
Analytics
Reports
Pharmacist Modules
Dashboard
Medicine Management
Medicine Batches
Stock Transactions
Medicine Requests
Alerts
Forecasting
Reports
Administrator Modules
Dashboard
System Users
User Management
PHC Management
Role & Permission Management
Reports
Audit Logs
System Settings
⚙️ Backend Microservices

The backend is organized into multiple Spring Boot services.

Service	Responsibility
discovery-server	Service discovery using Eureka
api-gateway	Central API entry point and request routing
auth-service	Authentication, users and security
clinical-service	Clinical and patient-related operations
pharmacy-service	Medicine and inventory operations
admin-service	Administrative operations
ai-service	Healthcare analytics and prediction
👥 User Roles
ADMIN

Provides system-wide administrative capabilities.

Manage PHCs
Manage system users
Manage roles and permissions
View system-wide reports
Access audit information
PHC SUPERVISOR

Works within an assigned Primary Health Centre.

Monitor patients
Manage ASHA workers
Manage pharmacists
Delegate priority visits
Monitor healthcare activities
View PHC-level reports and analytics
ASHA WORKER

Responsible for community-level healthcare activities.

Manage households
Register patients
Record health visits
Manage maternal health information
Record immunizations
Record child nutrition and growth information
Work with offline records
Synchronize collected data
PHARMACIST

Responsible for PHC medicine inventory.

Manage medicines
Manage medicine batches
Record stock transactions
Monitor stock
Monitor expiry alerts
Handle medicine requests
View medicine reports
Generate demand forecasts
🔐 Security

The backend uses role-based security to restrict access to protected operations.

Security technologies include:

Spring Security
JWT Authentication
BCrypt Password Encoding
Stateless Authentication
Role-Based Access Control (RBAC)

Supported roles include:

ADMIN
PHC_SUPERVISOR
ASHA
PHARMACIST

Unauthorized requests are rejected by the backend rather than relying only on frontend restrictions.

🏥 Healthcare Modules
Household Management

Household information can be maintained and associated with patients.

Patient Management

The patient module manages electronic health information such as:

Patient details
Date of birth
Gender
Contact information
Address
PHC association
Healthcare-related records
Maternal Health

The application supports:

Pregnancy records
Antenatal information
Antenatal visits
Maternal health monitoring
Immunization

The immunization module allows healthcare workers to:

Record immunizations
Track vaccination schedules
Monitor vaccination status
Identify records requiring follow-up
Nutrition & Child Growth

The nutrition module records child growth information such as:

Weight
Height
MUAC
Age

These records can be used for nutrition-related monitoring and alerts.

Health Visits

ASHA workers can record field visits and maintain visit information.

Supervisors can also delegate priority visits to ASHA workers.

💊 Pharmacy & Inventory

The pharmacy module manages medicine-related operations including:

Medicine catalogue
Medicine batches
Stock transactions
Inventory levels
Medicine requests
Expiry alerts
Demand forecasting
Pharmacy reports
📴 Offline Data Synchronization

The frontend contains an offline workflow designed for ASHA field activities.

When offline mode is enabled, relevant records can be stored locally and marked as pending.

              ASHA Worker
                   │
                   ▼
          Enter Healthcare Data
                   │
                   ▼
             Offline Mode
                   │
                   ▼
             Local Storage
                   │
                   ▼
             Pending Queue
                   │
             Internet Returns
                   │
                   ▼
               Sync Now
                   │
                   ▼
             Backend APIs
                   │
                   ▼
          Oracle Database

The synchronization workflow processes related records in dependency order, including:

Patients
   ↓
Pregnancies
   ↓
Antenatal Visits
   ↓
Immunizations
   ↓
Nutrition Records
🤖 AI & Analytics

The project includes an AI/analytics layer for healthcare decision support.

Current areas include:

Maternal Health Risk

Healthcare risk evaluation based on recorded patient information.

Immunization Alerts

Identification of vaccination records requiring attention.

Nutrition Alerts

Nutrition-related classification and monitoring based on child growth information.

Medicine Demand Forecasting

Forecasting future medicine requirements using historical transaction information.

Medicine Expiry Risk

Identification of medicines requiring attention because of approaching expiry.

These features are intended as decision-support functionality and are not a replacement for professional medical diagnosis or treatment.

🗄️ Database

The backend uses Oracle Database as its relational database.

Major data domains include:

Users
 │
 ├── PHCs
 │
 ├── Patients
 │      ├── Pregnancies
 │      │       └── Antenatal Visits
 │      │
 │      ├── Immunization Records
 │      │
 │      └── Nutrition Records
 │
 ├── Priority Visits
 │
 └── Pharmacy
        ├── Medicines
        ├── Medicine Batches
        └── Medicine Transactions
🛠️ Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
React Hook Form
Zod
Lucide React
Recharts
Motion
Google GenAI SDK
Backend
Java 17
Spring Boot
Spring Security
Spring Data JPA
Hibernate
JWT
BCrypt
Spring Cloud Gateway
Netflix Eureka
Springdoc OpenAPI / Swagger
Database
Oracle Database
Oracle JDBC
Hibernate ORM
Development & Testing
Git
GitHub
VS Code
Maven
npm
Postman
Swagger UI
📁 Project Structure
ASHA-Companion/
│
├── backend/
│   ├── admin-service/
│   ├── ai-service/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── clinical-service/
│   ├── discovery-server/
│   ├── pharmacy-service/
│   │
│   ├── ASHA_Companion_Final.postman_collection.json
│   ├── BACKEND_RUN_GUIDE.md
│   ├── PRESENTATION_DEMO.md
│   ├── PRESENTATION_FLOW.md
│   ├── README.md
│   └── final_backend_verification.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── ASHA/
│   │   │   ├── Pharmacist/
│   │   │   └── Supervisor/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
🔌 Service Ports
Component	Port
Frontend	3002
API Gateway	8081
Auth Service	8082
Eureka Discovery Server	8761
Oracle Database	1521
🚀 Getting Started
Prerequisites

Install the following:

Java 17
Node.js
npm
Maven
Oracle Database 11g XE
Git
VS Code
1. Clone the Repository
git clone https://github.com/visha-l127/ASHA-Companion.git
cd ASHA-Companion
2. Configure Oracle Database

Make sure Oracle Database is running.

Configure the database username and password according to your local environment.

Do not commit real database credentials to GitHub.

3. Start Eureka Discovery Server
cd backend/discovery-server
.\mvnw.cmd spring-boot:run

Eureka Dashboard:

http://localhost:8761
4. Start Backend Services

Start the required Spring Boot services from their respective directories.

Example:

cd backend/auth-service
.\mvnw.cmd spring-boot:run

Then start:

admin-service
ai-service
clinical-service
pharmacy-service
api-gateway
5. Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend runs on:

http://localhost:3002
📖 API Documentation

The backend provides Swagger/OpenAPI documentation.

After the backend is running, Swagger UI can be accessed through the configured API Gateway.

http://localhost:8081/swagger-ui.html

Protected endpoints require a valid JWT obtained through the authentication flow.

🧪 API Testing

A Postman collection is included in the repository:

backend/ASHA_Companion_Final.postman_collection.json

Import the collection into Postman to test the backend APIs.

🔄 Typical Application Workflow
ASHA Worker
Login
  ↓
Dashboard
  ↓
Households
  ↓
Patients
  ↓
Health Visits
  ↓
Maternal / Immunization / Nutrition
  ↓
Offline Queue
  ↓
Synchronize
PHC Supervisor
Login
  ↓
Dashboard
  ↓
Patient Monitoring
  ↓
Alerts / Analytics
  ↓
Priority Visits
  ↓
ASHA / Pharmacist Management
  ↓
Reports
Pharmacist
Login
  ↓
Pharmacy Dashboard
  ↓
Medicine Management
  ↓
Medicine Batches
  ↓
Stock Transactions
  ↓
Alerts
  ↓
Forecast
  ↓
Reports
Administrator
Login
  ↓
Admin Dashboard
  ↓
User Management
  ↓
PHC Management
  ↓
Role & Permissions
  ↓
Reports
  ↓
Audit Logs
  ↓
System Settings
🔒 Security & Configuration Notes

This application handles healthcare-related information.

For development and deployment:

Do not commit passwords or API keys.
Do not commit production database credentials.
Store secrets in environment variables or secure configuration.
Use HTTPS in production.
Apply appropriate access controls for healthcare data.
Do not use development credentials in production.
Do not expose sensitive patient information in logs or screenshots.
📌 Current Project Status

The repository currently contains:

React frontend
Role-specific dashboards
ASHA healthcare workflows
Supervisor workflows
Pharmacist workflows
Administrator workflows
Spring Boot backend services
API Gateway
Eureka service discovery
JWT-based authentication
Role-based authorization
Oracle database integration
Healthcare records
Pharmacy inventory
Offline synchronization workflow
AI/analytics functionality
Swagger/OpenAPI documentation
Postman API collection
Backend verification tooling
🚧 Future Improvements

Potential areas for further development include:

Improved offline conflict resolution
Enhanced synchronization reliability
Advanced AI model validation
Multilingual support
Push notifications
Mobile application support
CI/CD automation
Cloud deployment
Additional healthcare-system integrations
Enhanced monitoring and observability
👥 Contributors

Developed collaboratively as a healthcare technology project.

📄 License

This project is currently developed for educational, research, and demonstration purposes.