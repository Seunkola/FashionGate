# 🛍️ FashionGate API

The **FashionGate API** is a SaaS platform that enables users to discover, hire, and collaborate with tailors and fashion designers, while empowering developers to seamlessly integrate these services into their applications.

Built for scalability, modularity, and performance, the API powers the next generation of fashion intelligence — offering endpoints for product management, trend analytics, and AI-driven recommendations.

## 📘 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [System Requirements](#system-requirements)
- [Contributing](#contributing)
- [License](#license)

---

## 🧠 Overview

The **FashionGate API** acts as the central data and intelligence layer for the FashionGate ecosystem — connecting frontend clients, machine learning services, and data pipelines.

It provides endpoints for:

- 🧾 Product and category management
- 👗 Fashion trend analysis
- 👤 User and profile management
- 🤖 AI-powered recommendations
- 📊 Data analytics and insights

---

## 🏗️ Architecture

The API is designed around a modular service architecture with independent layers for data, logic, and presentation.

📊 **System Architecture Diagram:**  
[View in diagrams.net →](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=FashionGate.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1aKurqpl8cqW_NpjHIZAhKfJaDqhCe0E_%26export%3Ddownload)

### Core Components

| Component                | Description                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| **API Gateway**          | Entry point for all external requests; handles routing and load balancing. |
| **Service Layer**        | Handles domain logic for products, users, and analytics.                   |
| **Database**             | Stores persistent entities like products, users, and trends.               |
| **ML Engine (Optional)** | Consumes API data for training and generating fashion predictions.         |

---

## ✨ Features

- RESTful architecture with clean JSON responses
- JWT-based authentication and role-based access
- Swagger (OpenAPI) documentation
- Centralized error handling and logging
- Extensible module design
- Dockerized for consistent deployment

---

## 🧰 Tech Stack

| Layer         | Technology                    |
| ------------- | ----------------------------- |
| **Language**  | Node.js / TypeScript          |
| **Framework** | Express.js / fastify          |
| **Database**  | PostgreSQL / Prisma ORM       |
| **Auth**      | JWT                           |
| **Docs**      | Swagger (OpenAPI 3.0)         |
| **DevOps**    | Docker / GitHub Actions / AWS |

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Seunkola/FashionGate.git
cd FashionGate-API
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a .env file in the api-gateway and set the following:

```bash
RATE_LIMIT=100
PORT=3005
RATE_LIMIT_WINDOW= 1 minute
SUPABASE_URL=https://<yoursupabseurl>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AUTH_SERVICE_URL=http://localhost:4001
CLIENT_SERVICE_URL=http://localhost:4002
DESIGNER_TAILOR_SERVICE_URL=http://localhost:4003
```

Create a .env file in the auth-service microservice and set the following:

```bash
SUPABASE_URL=https://<yoursupabseurl>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PASSWORD_RESET_REDIRECT_URL=http://localhost:3000/reset-password
PORT=4001
DATABASE_URL="your_postgresql_database_url"
```

Create a .env file in the client-service microservice and set the following:

```bash
PORT=4002
DATABASE_URL="your_postgresql_database_url"
SUPABASE_URL=https://<yoursupabseurl>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STORAGE_BUCKET="profile-images"
```

Create a .env file in the designer-tailor-service microservice and set the following:

```bash
PORT=4003
DATABASE_URL="your_postgresql_database_url"
SUPABASE_URL=https://<yoursupabseurl>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STORAGE_BUCKET="portfolio-images"
```

## 4️⃣ Run Database Migrations

Run the prisma migrate command on each microservice

```bash
npx prisma migrate
```

## 5️⃣ Start the Development Server

Run the node command below on each service

```bash
npm run dev
```

Each microservice should now be live at:

```bash
AUTH_SERVICE_URL=http://localhost:4001
CLIENT_SERVICE_URL=http://localhost:4002
DESIGNER_TAILOR_SERVICE_URL=http://localhost:4003
```

Run the node command on the API-gateway

```bash
npm run dev
```

Your API-Gateway should now be live at:

```bash
http://localhost:3000/api
```

## 🧩 System Requirements

Refer to the system-level design and requirements diagram for deployment dependencies and infrastructure layout:

🖼️ View System Requirements Diagram →
[View in diagrams.net →](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=FashionGate.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1aKurqpl8cqW_NpjHIZAhKfJaDqhCe0E_%26export%3Ddownload)

### Minimum Requirements

Node.js 18+

PostgreSQL 14+

Docker (optional)

2 GB RAM (local dev)

## 🤝 Contributing

Contributions are welcome!

1. Fork this repository

2. Create a feature branch (git checkout -b feature/new-module)

3. Commit your changes

4. Push to the branch and open a Pull Request
