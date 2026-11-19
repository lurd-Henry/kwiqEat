# kwiQeat

> A modern Nigerian food delivery platform connecting customers, restaurants, and delivery operations through a scalable web application.

![kwiQeat](https://img.shields.io/badge/kwiQeat-Food%20Delivery-orange)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express.js](https://img.shields.io/badge/Express.js-API-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-yellow)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20Storage-blue)
![Render](https://img.shields.io/badge/Render-Deployment-purple)

## Overview

**kwiQeat** is a full-stack food delivery platform built for the Nigerian market.

The platform allows customers to discover restaurants, browse menus, manage carts, place orders, track order status, and manage their accounts.

Restaurants have dedicated dashboards for managing menus, availability, incoming orders, and restaurant information.

Administrators have access to platform-level management tools for monitoring restaurants, customers, orders, categories, and overall platform activity.

The project was designed with a production-oriented architecture rather than a single-page demo approach, separating the frontend application from a RESTful backend API and PostgreSQL database.

---

## ✨ Features

### Customer

- Account registration and authentication
- JWT-based authentication
- Restaurant discovery
- Restaurant menu browsing
- Food item browsing
- Cart management
- Address management
- Order creation
- Order history
- Order status tracking
- Account management
- Responsive mobile-first interface

### Restaurant

- Restaurant registration
- Restaurant approval workflow
- Restaurant profile management
- Restaurant availability control
- Menu management
- Food item creation
- Food item editing
- Food item deletion
- Food availability management
- Image uploads through Cloudinary
- Incoming order management
- Order status updates
- Sales overview
- Restaurant dashboard

### Administration

- Platform overview
- Customer management
- Restaurant management
- Restaurant approval/rejection
- Restaurant suspension
- Order monitoring
- Food category management
- Platform statistics

### Engineering

- RESTful API architecture
- JWT authentication
- Role-based authorization
- PostgreSQL relational database
- Password hashing with bcrypt
- Request validation
- Security headers with Helmet
- Rate limiting
- CORS configuration
- Cloudinary image storage
- Environment-based configuration
- GitHub-based CI/CD
- Production deployment with Render
- Separation of frontend and backend services

---

# 🏗️ Architecture

kwiQeat follows a client-server architecture.

```text
                         ┌─────────────────────┐
                         │      Customer       │
                         │   Mobile / Desktop  │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │     Frontend        │
                         │ HTML / CSS / JS     │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │     Express.js      │
                         │      REST API       │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      ┌───────────────┐     ┌───────────────┐    ┌───────────────┐
      │  PostgreSQL   │     │   Cloudinary   │    │ Authentication│
      │   Database    │     │     Images     │    │     JWT       │
      └───────────────┘     └───────────────┘    └───────────────┘
