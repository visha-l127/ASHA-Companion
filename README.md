🩺 ASHA Companion
Digital Healthcare Management Platform for ASHA Workers

ASHA Companion is a digital healthcare platform designed to support ASHA Workers, PHC Supervisors, Pharmacists, and Administrators in managing community healthcare activities.

The system provides healthcare record management, maternal and child health monitoring, pharmacy inventory management, offline data synchronization, role-based access control, and AI-assisted healthcare analytics.

🎯 Project Overview

ASHA workers often work in areas with limited or unreliable internet connectivity. Managing patient records, household information, maternal health data, immunization records, nutrition information, and medicine-related activities can become difficult when relying on manual processes.

ASHA Companion provides a centralized platform that helps digitize these activities and improves coordination between ASHA workers, PHC supervisors, pharmacists, and administrators.

✨ Key Features
🏠 Household Management
👤 Patient Management
👩‍⚕️ ASHA Worker Management
🤰 Maternal Health Monitoring
💉 Immunization Tracking
🥗 Child Nutrition & Growth Monitoring
📝 Healthcare Visit Management
🔄 Offline Data Synchronization
💊 Medicine & Pharmacy Management
📦 Medicine Batch & Stock Management
⚠️ Healthcare and Inventory Alerts
📊 Reports & Analytics
🤖 AI-assisted Healthcare Analytics
🔐 JWT Authentication & Role-Based Access Control
🏥 PHC Management
📋 Audit and Administrative Management
👥 User Roles
👩‍⚕️ ASHA Worker

ASHA workers manage community-level healthcare activities.

Responsibilities include:

Managing households
Registering patients
Recording healthcare visits
Maintaining maternal health records
Recording immunizations
Recording child nutrition data
Working with offline records
Synchronizing collected data
🏥 PHC Supervisor

PHC Supervisors monitor and coordinate healthcare activities within their assigned PHC.

Responsibilities include:

Monitoring patients
Managing ASHA workers
Managing pharmacists
Assigning priority visits
Monitoring alerts
Viewing analytics
Generating reports
💊 Pharmacist

Pharmacists manage medicines and pharmacy inventory.

Responsibilities include:

Managing medicines
Managing medicine batches
Recording stock transactions
Monitoring inventory
Managing medicine requests
Monitoring expiry alerts
Viewing demand forecasts
Generating pharmacy reports
🛡️ Administrator

Administrators manage the overall platform.

Responsibilities include:

User management
PHC management
Role and permission management
System reports
Audit logs
System settings
🏥 Healthcare Modules
🏠 Household Management

Maintains household information and associates patients with their respective households.

👤 Patient Management

Maintains patient information and healthcare-related records.

🤰 Maternal Health

Supports maternal healthcare workflows including:

Pregnancy records
Antenatal information
Antenatal visits
Maternal health monitoring
💉 Immunization

Supports:

Immunization records
Vaccination schedules
Vaccination status
Follow-up identification
🥗 Nutrition & Child Growth

Records child growth information such as:

Weight
Height
MUAC
Age
📝 Health Visits

Allows ASHA workers to record field visits and maintain healthcare visit history.

PHC Supervisors can also assign priority visits to ASHA workers.

💊 Pharmacy Management

The pharmacy module provides:

Medicine management
Medicine batch management
Stock management
Stock transactions
Medicine requests
Inventory monitoring
Expiry alerts
Demand forecasting
Pharmacy reports
📴 Offline Data Synchronization

ASHA workers may need to collect healthcare information in areas with limited network connectivity.

The application provides an offline workflow where data can be stored locally and synchronized when connectivity becomes available.

ASHA Worker
     │
     ▼
Healthcare Data Entry
     │
     ▼
Offline Storage
     │
     ▼
Pending Records
     │
     ▼
Internet Available
     │
     ▼
Synchronization
     │
     ▼
Backend APIs
     │
     ▼
Oracle Database
🤖 AI & Analytics

The project includes an AI/analytics service to provide healthcare decision support.

The system includes functionality related to:

Maternal health risk analysis
Immunization alerts
Nutrition monitoring
Medicine demand forecasting
Medicine expiry monitoring

AI-based features are intended for decision support and should not replace professional medical judgment.

🔐 Security

The application implements secure authentication and authorization using:

Spring Security
JWT Authentication
BCrypt Password Hashing
Role-Based Access Control (RBAC)
Stateless Authentication
Supported Roles
ADMIN
PHC_SUPERVISOR
ASHA
PHARMACIST
🏗️ System Architecture

ASHA Companion follows a microservices architecture.

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
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
       │    Auth     │        │  Clinical   │        │  Pharmacy   │
       │   Service   │        │   Service   │        │   Service   │
       └─────────────┘        └─────────────┘        └─────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────┐
                           │ Oracle Database  │
                           └──────────────────┘


                           ┌──────────────────┐
                           │ Eureka Discovery │
                           └──────────────────┘


                    ┌──────────────────────────┐
                    │ Admin Service / AI Service│
                    └──────────────────────────┘
⚙️ Backend Services
Service	Purpose
discovery-server	Service discovery using Eureka
api-gateway	Central API gateway and request routing
auth-service	Authentication and security
clinical-service	Patient and clinical operations
pharmacy-service	Medicine and inventory operations
admin-service	Administrative operations
ai-service	Healthcare analytics and prediction
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
Springdoc OpenAPI
Database
Oracle Database
Oracle JDBC
Hibernate ORM
Tools
Git & GitHub
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
│   └── pharmacy-service/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── data/
│       ├── layouts/
│       ├── pages/
│       │   ├── Admin/
│       │   ├── ASHA/
│       │   ├── Pharmacist/
│       │   └── Supervisor/
│       ├── routes/
│       └── utils/
│
├── .gitignore
├── ASHA_Companion.code-workspace
└── README.md
🔌 Main Service Ports
Component	Port
Frontend	3002
API Gateway	8081
Auth Service	8082
Eureka Discovery Server	8761
Oracle Database	1521
🧪 API Testing

The project includes a Postman collection for testing the backend APIs:

backend/ASHA_Companion_Final.postman_collection.json

The backend also provides API documentation through Swagger/OpenAPI.

🔄 Application Workflow
ASHA Worker
Login
  ↓
Dashboard
  ↓
Households
  ↓
Patients
  ↓
Healthcare Visits
  ↓
Maternal / Immunization / Nutrition
  ↓
Offline Data
  ↓
Synchronization
PHC Supervisor
Login
  ↓
Dashboard
  ↓
Patient Monitoring
  ↓
Alerts & Analytics
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
Forecasting
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
Roles & Permissions
  ↓
Reports
  ↓
Audit Logs
🔒 Security Notes

As the application handles healthcare-related information:

Sensitive credentials should not be committed to the repository.
Database passwords and API keys should be stored securely.
Production deployments should use HTTPS.
Patient information should not be exposed in logs or public screenshots.
Development credentials should not be used in production.
📌 Project Status

ASHA Companion currently includes:

Role-based healthcare dashboards
ASHA worker workflows
PHC Supervisor workflows
Pharmacist workflows
Administrator workflows
Spring Boot microservices
API Gateway
Eureka service discovery
JWT authentication
Role-based authorization
Oracle database integration
Patient and healthcare records
Pharmacy inventory management
Offline synchronization
AI/analytics functionality
Swagger/OpenAPI documentation
Postman API collection
📄 License

This project is developed for educational, research, and demonstration purposes.