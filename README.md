# 🏟️ ArenaBooking — Sports Facility Reservation API

A robust, production-ready RESTful API built with **Node.js**, **Express 5**, **TypeScript**, and **MongoDB**. Designed for managing sports venues, scheduling slots, handling media processing, and automating background tasks with high security and performance.

---

## ⚡ Key Features

- **Slot Allocation & Booking Engine**: Handles real-time venue availability, prevents overlapping reservation slots, and validates duration metrics.
- **High-Performance Caching**: Uses **Redis** (`ioredis`) for rapid caching of venue queries and fast data retrieval.
- **Image Processing Pipeline**: Compresses and resizes uploads on the fly using **Sharp** before streaming assets to **Cloudinary**.
- **Automated Cron Jobs**: Background scheduling via `node-cron` for automated state maintenance and expired reservation cleanup.
- **Multi-Channel Email Service**: Dynamic HTML email rendering using **Pug** templates dispatched via **Resend** / **Nodemailer**.
- **Enterprise-Grade Security**: Protection against OWASP top vulnerabilities using **Helmet**, **HPP**, **Express Rate Limit**, and **Input Sanitization**.
- **Authentication & Cookies**: Secure JWT authentication delivered over **HTTP-only cookies**.

---

## 🛠️ Tech Stack

- **Runtime & Language**: Node.js, TypeScript
- **Framework**: Express.js (v5)
- **Database & Caching**: MongoDB, Mongoose, Redis (`ioredis`)
- **File Uploads & Media**: Multer, Sharp, Cloudinary
- **Tasks & Templating**: Node-Cron, Pug
- **Emails**: Resend, Nodemailer
- **Security**: Helmet, HPP, Express Rate Limit, Bcrypt, JWT

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Connection URI
- Redis Instance
- Cloudinary & Email Service API Keys

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/arenabooking.git](https://github.com/YOUR_USERNAME/arenabooking.git)
   cd arenabooking
