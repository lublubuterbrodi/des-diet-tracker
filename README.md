# 🥗 Diet Tracker

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-20232A?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=neon)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-000000?logo=auth0)
![bcrypt](https://img.shields.io/badge/bcrypt-Password_Hashing-003A70)

A full-stack nutrition tracking application built with **Next.js, TypeScript, PostgreSQL, Auth.js, and Neon**.

Users can create a personalized daily diet, track food intake and body weight, search nutrition data through the USDA FoodData Central API, and manage their own products.

🔗 **Live Demo:** [Open Diet Tracker](https://des-diet-tracker.vercel.app/)

### Demo Account

```text
Email: test@example.com
Password: 123456789
```

> Use the demo account to explore the application without creating a new account.

## ✨ Features

- 🔐 Authentication and user registration with isolated user data
- 🥦 Create and manage a personalized daily diet
- 🔎 Search and import products from USDA FoodData Central
- ➕ Add custom food products
- 🍽 Log, edit, and delete consumed food
- 📅 Browse previous food history
- ⚖️ Save and update daily body weight
- 📈 Browse weight history
- 🎯 Set individual daily food limits

## 🚀 Tech Stack

**Frontend**
- Next.js (App Router)
- React
- TypeScript

**Backend**
- Next.js Route Handlers
- Service Layer
- Repository Pattern

**Database**
- PostgreSQL
- Neon

**Authentication**
- Auth.js (NextAuth v5)
- Credentials Provider
- bcrypt

**External API**
- USDA FoodData Central API

## 🏗 Architecture

The application uses a layered architecture to separate API handling, business logic, and database access.

```text
Client
  ↓
Route Handlers
  ↓
Services
  ↓
Repositories
  ↓
PostgreSQL
```

This keeps database queries isolated in repositories while application logic remains in the service layer.

## 📂 Project Structure

```text
app/
├── api/
├── components/
├── history/
├── hooks/
├── login/
├── register/
├── HomeClient.tsx
├── layout.tsx
└── page.tsx

lib/
repositories/
services/
types/
public/
```

## 🌎 USDA Integration

The application integrates with the **USDA FoodData Central API**, allowing users to search food products and import nutrition data directly into their diet.

Custom products can also be created manually.

## 🔐 Authentication & Data Isolation

Authentication is implemented with **Auth.js (NextAuth v5)** using the Credentials Provider.

Passwords are hashed with **bcrypt**, and all diet, food log, and weight data is associated with the authenticated user.

## ⚙️ Running Locally

```bash
git clone YOUR_REPOSITORY_URL
cd diet-tracker

npm install
```

Create `.env.local`:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
USDA_API_KEY=
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 📸 Screenshots

### Dashboard

[SCREENSHOT]

### History

[SCREENSHOT]

### Login

[SCREENSHOT]

## 💡 Future Improvements

- Nutrition statistics and charts
- Weight progress visualization
- Weekly and monthly reports
- Meal planning
- Favorite products
- Barcode scanning
- Dark mode

## 📄 License

MIT License
