# Notion Dashboard - Full-Stack React Architecture ⚛️⚡

A professional-grade Client Portal and Administrative Dashboard built with a modern, scalable architecture. This project bridges **Notion API** data with a custom-built interface, providing a seamless experience for project visualization and client management.

## ⚛️ Frontend Architecture (Core)

The frontend is a high-performance Single Page Application (SPA) designed with a focus on state management, modular components, and modern CSS practices.

- **Stack**: React 18 + Vite (ESM) + TanStack Query.
- **Styling**: Tailwind CSS v4 utilizing advanced design tokens and glassmorphism techniques.
- **State Management**: Optimized data fetching and caching using React Query to minimize API overhead.
- **Security**: Implementation of custom guards to prevent browser credential caching and ensure secure data handling.
- **UX/UI**: Native Dark Mode, fluid animations with Lucide icons, and responsive layouts.

[Explore Frontend Technical Details ➔](./frontend/README.md)

---

## 🛠️ Backend Infrastructure

A lightweight, efficient PHP 8.x + MySQL engine designed for high availability and secure data persistence.

- **API Design**: RESTful architecture for user orchestration and Notion API mediation.
- **Security Persistence**: Encrypted storage for API credentials and BCrypt password hashing.
- **Dynamic Configuration**: A database-driven settings engine allowing real-time system updates without redeployment.
- **Access Control**: Robust Role-Based Access Control (RBAC) system for Admin and Client isolation.

[Explore Backend Technical Details ➔](./backend/README.md)

---

## 🚀 Technical Implementation

1. **Database Orchestration**: Initialize via `setup_schema.sql` (automatic resets and seed data).
2. **Environment Management**: Decoupled secret management through PHP defines and UI-driven settings.
3. **Notion Integration**: Custom Project Controller layer for managing complex API filtering and client-tag isolation.

## 🔒 Security & Performance Features

- **Asynchronous Execution**: Optimized UI responsiveness during heavy API operations.
- **Action Guarding**: 412 Precondition Failed logic to prevent system execution during partial configuration states.
- **Privacy Design**: User-specific data filtering based on Notion external IDs.

---
Developed by [Fran Ferrer](https://github.com/franferrerrodriguez) — Focused on Modern Web Architecture and Scalable Solutions.
