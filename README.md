# Relay Platform

  Event-driven automation platform inspired by IFTTT and Zapier, designed to connect third-party services through configurable workflows.

  ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
  ![Node](https://img.shields.io/badge/node.js-green)
  ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
  ![License](https://img.shields.io/badge/license-MIT-green)

  ---

  ## Overview

  **Relay Platform** is a full-stack automation system that enables users to create workflows where **events** trigger **automated actions** across multiple external services.

  The platform focuses on **scalable backend architecture**, **secure OAuth2 authentication**, and **containerized deployments**, following modern software engineering best practices.

  ---

  ## Architecture

  Relay Platform is built on a **microservices-oriented architecture**, composed of three main layers:

  - **API Server**  
    Business logic, REST API, workflow engine, and third-party integrations

  - **Web Client**  
    Browser-based interface for managing services and automation rules

  - **Mobile Client**  
    Cross-platform mobile application consuming the same API

  External services are integrated via **OAuth2**, ensuring secure authentication and token management.

  ---

  ## Key Features

  - User authentication (JWT + OAuth2)
  - Third-party service integrations (Google, GitHub, Outlook, Discord, etc.)
  - Event-based automation (**Action → Reaction**)
  - Real-time workflow execution engine
  - Fully documented REST API
  - Web and mobile clients
  - Docker-based local and production environments

  ---

  ## Tech Stack

  **Backend**
  - Node.js, Express
  - REST APIs, OAuth2, JWT
  - PostgreSQL with Prisma ORM

  **Frontend**
  - Web client (modern JavaScript framework)
  - Mobile client consuming the same API

  **DevOps**
  - Docker & Docker Compose
  - Environment-based configuration
  - CI-ready project structure

  ---

  ## Getting Started

  ### Prerequisites
  - Docker
  - Docker Compose

  ### Run locally

  ```bash
  git clone git@github.com:danabenadel/Relay-platform.git
  cd Relay-platform
  docker-compose build
  docker-compose up
  ```

  Services will be available at:
  - Web client: http://localhost:8081
  - API server: http://localhost:8080

  ---

  ## Configuration

  Configuration is handled through environment variables.

  Example `.env`:
  ```env
  SERVER_PORT=8080
  DATABASE_URL=postgres://user:password@localhost:5432/db

  GOOGLE_CLIENT_ID=your_client_id
  GOOGLE_CLIENT_SECRET=your_client_secret

  JWT_SECRET=change_me
  ```

  > ⚠️ Never commit real secrets. Use `.env.example` as a template only.

  ---

  ## API Overview

  Base URL:
  ```
  http://localhost:8080
  ```

  Example endpoints:
  ```http
  POST /auth/login
  GET  /services
  POST /areas
  ```

  All protected routes require JWT authentication.

  ---

  ## Project Structure

  ```
  Relay-platform/
  ├── server/            # API & business logic
  ├── web-client/        # Web interface
  ├── mobile-client/     # Mobile application
  ├── docker-compose.yml
  ├── README.md
  └── docs/
  ```

  ---

  ## Security

  - OAuth2 authentication for external services
  - JWT-secured API endpoints
  - Input validation and rate limiting
  - Secrets managed via environment variables only

  ---

  ## License

  MIT License — see [LICENSE](LICENSE)

  ---

  ## Credits

  Developed by:
  - Dana Benadel — Backend & Architecture
  - Diego Lacroix — Frontend
  - Yasma Abd-elkhalek — Mobile
  - Nadia Benzaoui — DevOps & Integration

  ---

  *Initially developed in an academic context, Relay Platform is maintained as a professional full-stack engineering project.*