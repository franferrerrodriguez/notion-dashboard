# Notion Dashboard - Premium React Portal ⚛️✨

A high-end, modern Client Portal and Administrative Dashboard built primarily with **React 18**, **Vite**, and **Tailwind CSS v4**. This project serves as a bridge between Notion and your clients, offering a premium "Notion-style" experience for project visualization and management.

## ⚛️ Frontend Highlight (The Core)

The heart of this project is a sophisticated Single Page Application (SPA) designed for visual excellence and smooth user experience.

- **Modern Stack**: React 18 + Vite + TanStack Query.
- **Tailwind CSS v4**: Utilizing the latest CSS capabilities for a high-performance, glassmorphism-inspired UI.
- **Dynamic Projects**: Real-time fetching and filtering of Notion Database items.
- **Admin & Client Modes**: Sophisticated role-based interfaces with secure, dynamic configuration.
- **Dark Mode Native**: A curated dark aesthetic that feels premium and easy on the eyes.

[Explore the Frontend Architecture & Installation ➔](./frontend/README.md)

---

## 🛠️ Backend Support

A lightweight, secure PHP 8.x + MySQL engine that powers the data persistence and secure communication with the Notion API.

- **Secure API**: Handles authentication, user management, and encrypted settings.
- **Notion Integration**: Centralized project fetching with client-tag filtering.
- **Database driven**: Dynamic storage for Notion API keys and system settings.

[Explore the Backend API & Database Setup ➔](./backend/README.md)

---

## 🚀 Quick Setup

1. **Backend**: Setup your MySQL database using `setup_schema.sql` and configure `config/secrets.php`.
2. **Frontend**: Install dependencies with `npm install` and launch with `npm run dev`.
3. **Connect**: Log in as admin, go to **Settings**, and paste your Notion Integration Token + Database ID.

## 🔒 Security First

Designed with privacy and security in mind:
- **Zero-AutoFill**: Custom hacks to block browser credential leakages.
- **Secret Separation**: API keys are managed via the UI and stored encrypted in DB, never hardcoded.
- **Admin Guard**: Critical functions are blocked until valid Notion credentials are provided.

---
Created by [Fran Ferrer](https://github.com/franferrerrodriguez) - Empowering Notion Workflows.
