# 🛒 Noon E-Commerce API — Scalable Multi-Vendor Backend

A feature-rich, high-performance E-Commerce Backend API built using **Node.js**, **Express 5**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. Engineered for high-concurrency inventory operations, multi-vendor support, strict input validations, and hybrid checkout workflows.

---

## ⚡ Key Features

- **Multi-Vendor Inventory Engine**: Concurrent stock management backed by **PostgreSQL Transactions** to eliminate race conditions and overselling.
- **Dynamic Coupon & Promo System**: Flexible rule engine handling percentage/fixed discounts, usage caps, expiration windows, and cart minimums.
- **Strict Input Validation**: End-to-end request validation powered by **Zod** schemas for type-safe data pipelines.
- **Hybrid Payment & Verification**: Offline payment workflows supporting manual receipt processing via **Cloudinary** uploads.
- **Hardened API Security**: Multi-layered defense using **Helmet**, **CORS**, **Rate-Limiting**, and **JWT** bearer tokens.
- **Email Notifications**: Automated transactional emails (order updates, account verification) using **Nodemailer**.

---

## 🛠️ Tech Stack

- **Runtime & Language**: Node.js, TypeScript
- **Framework**: Express.js (v5)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Validation**: Zod
- **Media Uploads**: Multer, Cloudinary
- **Security & Auth**: Helmet, Express-Rate-Limit, Bcrypt, JWT
- **Email**: Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL Database Instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/noon-ecommerce-api.git](https://github.com/YOUR_USERNAME/noon-ecommerce-api.git)
   cd noon-ecommerce-api
