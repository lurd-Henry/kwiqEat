System Architecture

1. Overview

kwiQeat is a full-stack food delivery platform built using a client-server architecture.

The application separates the customer-facing frontend from the backend API, allowing the frontend and backend to evolve independently.

The backend is responsible for authentication, authorization, business logic, database operations, restaurant management, menu management and order processing.

2. Technology Stack

Layer	Technology
Frontend	HTML5, CSS3, JavaScript
Backend	Node.js
API Framework	Express.js
Database	PostgreSQL
Authentication	JSON Web Tokens
Password Hashing	bcrypt
Image Storage	Cloudinary
Hosting	Render
Version Control	Git and GitHub
CI/CD	GitHub Actions

3. Application Components

Frontend

The frontend provides interfaces for customers, restaurant operators and administrators.

It communicates with the backend through HTTP requests and consumes JSON API responses.

Backend

The backend exposes RESTful API endpoints and handles application business logic.

Responsibilities include:

* User authentication.
* Role-based authorization.
* Restaurant registration and approval.
* Menu management.
* Cart operations.
* Order processing.
* Payment processing.
* Administrative operations.

Database

PostgreSQL stores application data, including users, restaurants, food items, carts, orders, payments and notifications.

Image Storage

Cloudinary handles uploaded restaurant and food images.

4. Request Lifecycle

A typical API request follows this flow:

Client → Route → Middleware → Validation → Controller → Service → Database → Response.

5. Deployment Architecture

The frontend and backend are deployed independently.

* Frontend: Render Static Site.
* Backend: Render Web Service.
* Database: PostgreSQL.
* Image Storage: Cloudinary.

6. Design Principles

* Separation of concerns.
* Secure backend authorization.
* Centralized business logic.
* Database integrity.
* Environment-based configuration.
* Reusable application components.
* API-first communication.

7. Future Architecture

Potential extensions include:

* Dedicated delivery rider application.
* Real-time order tracking.
* Notification service.
* Payment service.
* Mobile applications.
* Background job processing.
