# Nescafe Online Ordering System - IIT Palakkad

A premium, full-stack digital ordering platform designed for the Nescafe outlet at IIT Palakkad. Built with **React**, **Node.js**, **Supabase**, and **Razorpay**.

![GitHub](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Supabase](https://img.shields.io/badge/Database-Supabase-emerald)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-blueviolet)

##  Overview
This system eliminates long queues at the Nescafe outlet by providing a seamless, mobile-first ordering experience. Key features include:

- **Real-time Order Tracking**: Watch your order progress from 'Preparing' to 'Ready'.
- **Secure Payments**: Integrated with Razorpay for UPI, Cards, and Netbanking.
- **Admin Command Center**: Real-time dashboard for staff with delivery batching logic.
- **Delivery Batching**: Optimized delivery routing by hostel block.
- **Dynamic Menu**: Real-time availability toggles for kitchen staff.

---

##  Tech Stack
- **Frontend**: React (Vite), Framer Motion, Tailwind CSS-like custom aesthetics.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (via Supabase).
- **Authentication**: Supabase Auth (Email validation for `@smail.iitpkd.ac.in`).
- **Payments**: Razorpay Gateway.

---

##  Installation & Setup

### Prerequisites
- Node.js (v18+)
- Supabase Account
- Razorpay Developer Account

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cafe
```

### 2. Install Dependencies
```bash
# Install root, frontend, and backend dependencies
npm run install-all
```

### 3. Environment Variables
Create a `.env` file in the `backend` folder and add:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Run Locally
```bash
# Runs both frontend and backend concurrently
npm run dev
```

---

##  System Architecture
The system uses a decoupled architecture for maximum stability and speed during peak hours.

```mermaid
graph LR
    User -->|React| Web
    Web -->|Auth/SQL| Supabase
    Web -->|Payment| Node_Server
    Node_Server -->|Verify| Razorpay
    Node_Server -->|Success| Supabase
    Supabase -.->|Real-time| Admin
```

---

##  Security & Reliability
- **RLS Policies**: Row Level Security ensures data privacy at the database level.
- **Webhook ID Verification**: Backend verification of Razorpay signatures prevents order manipulation.
- **Optimistic UI**: Smooth user experience during network fluctuations.

---

##  Future Scalability
- **Redis Caching**: To handle frequent menu searches.
- **DB Sharding**: Scalability for 10,000+ daily orders across multiple outlets.

---

##  Author
**Sai Kiran**
IIT Palakkad

