# Project Domain Mapping

This document serves as the permanent source of truth for the Nescafe IITPKD project's network configuration.

| Layer | URL / Domain | Purpose |
|---|---|---|
| **Frontend** | `https://nescafeiitpkd.vercel.app` | The user-facing web application. |
| **Backend** | `https://nescafe-iitpkd.vercel.app` | The API server, Razorpay integration, and Supabase Proxy. |

---

## Technical Configuration Summary

### 🔌 Connectivity & Proxying
To bypass ISP blocking (Jio/Airtel) of `supabase.co`, all database and authentication traffic is routed through the **Backend Proxy**:
- **Target**: `https://nescafe-iitpkd.vercel.app/supabase`
- **Location**: Configured in `frontend/src/supabaseClient.js`

### 🔑 Authentication Flow
The system uses a **Hybrid Domain Flow** for authentication:
1. **Initiation**: User signs up on the frontend (`nescafeiitpkd`).
2. **Confirmation**: Verification email link points to the backend proxy (`nescafe-iitpkd`) to ensure reachability.
3. **Completion**: Upon successful verification, the proxy redirects the user back to the frontend (`nescafeiitpkd/login`).

### 📦 API Architecture
- Front-end API calls (Create Order, Verify Payment) are directed to the backend:
  `https://nescafe-iitpkd.vercel.app/api/...`
