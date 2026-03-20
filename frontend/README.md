# Notion Client Dashboard - Frontend 🎨✨

An administrative interface and client portal for visualizing Notion projects. A modern, fast, and premium SPA inspired by Notion's design but enhanced with dark mode and fluid animations.

## 🚀 Features

- **Admin Panel**: Full management of users, roles (Admin/Client), and API settings.
- **Project Visualization**: Dynamic list of Notion projects including statuses and tags.
- **Multi-client Access**: "Client" users only see projects linked to their specific Notion tag.
- **Premium Experience**: Dark mode by default, glassmorphism aesthetics, icons powered by `lucide-react`, and a **vertical timeline for project interactions**.
- **Password Visibility**: Integrated "show/hide" toggles in all sensitive fields (Login, User Management, Settings, etc.).
- **"View As" Mode**: Administrators can preview the dashboard exactly as any client would see it.

## 🛠️ Tech Stack

- **Core**: React 18 + Vite
- **State Management**: TanStack Query (React Query) for efficient API interaction.
- **Styling**: Tailwind CSS v4 with custom "Notion-style" color tokens.
- **Icons**: Lucide React.
- **Routing**: React Router.

## 📦 Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch development mode**:
   ```bash
   npm run dev
   ```
3. **Generate production build**:
   ```bash
   npm run build
   ```
   Files will be generated in the `dist/` folder.

## 🧪 Testing & Quality

### Run Unit Tests
```bash
npm run test
```
Powered by **Vitest** and **React Testing Library**.

### Code Quality (Linter)
```bash
npm run lint
```
Strict **ESLint** rules and **Prettier** formatting are enforced.

### Automation
- **Husky**: Pre-commit hooks to ensure quality before every push.
- **Lint-staged**: Only formats and lints files modified in the commit.

## ⚙️ Configuration

The frontend is configured to communicate with the backend using relative paths (managed in `api.js`). Ensure the backend is reachable for login and management features to work correctly.

## 📂 SRC Structure

- `components/`: Reusable components and modals (`UserModal`, `SettingsModal`, `ConfirmModal`).
- `context/`: Global states like `AuthContext`.
- `services/`: API communication layering (`api.js`).
- `constants/`: Role and ID definitions.
- `AdminPanel.jsx`: Main administrative view.
- `App.jsx`: Primary orchestrator and routes.

## 💎 Design Philosophy

The project uses a curated color palette and modern typography (Inter/Outfit) to deliver a high-end product feel. Security "hacks" have been implemented to block browser autofill on sensitive fields, alongside smooth state transitions.

---

Part of the Notion Client Ecosystem.
