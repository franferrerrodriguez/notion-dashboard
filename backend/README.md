# Notion Client Dashboard - Backend 🚀

A robust client and project management system integrated with the Notion API. This backend provides a secure REST API built with PHP to manage users, roles, and project data synchronization.

## 🛠️ Tech Stack
- **Language**: PHP 8.x
- **Database**: MySQL / MariaDB
- **Authentication**: Native PHP Sessions + Password Hashing (BCrypt)
- **Integration**: Notion API (v1)

## 📁 Project Structure
- `index.php`: Single entry point (Router & Controller).
- `config/`: System configuration.
    - `db.php`: PDO database connection.
    - `secrets.php`: Database credentials (Not included in version control).
- `controllers/`: Business logic.
    - `ProjectController.php`: Handles Notion API requests.
- `setup_schema.sql`: Database initialization script.

## ⚙️ Installation & Configuration

1. **Requirements**: Apache/Nginx server with PHP 7.4+ and MySQL.
2. **Database Setup**:
    - Create a new MySQL database.
    - Run the `setup_schema.sql` script to create tables and insert the initial root user.
3. **Secrets**:
    - Copy `config/secrets.php.example` to `config/secrets.php` (or create it manually).
    - Define your database credentials:
    ```php
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'your_database_name');
    define('DB_USER', 'your_username');
    define('DB_PASS', 'your_password');
    ```
4. **Notion Configuration** (via UI):
    - Once deployed, log in as admin (`root@root.com` / `root`) and use the Settings panel to provide your **Notion Integration Token** and **Database ID**.

## 🔒 Security
- Notion API keys are stored securely in the `settings` database table.
- User passwords are obfuscated using `password_hash()`.
- Configuration Guard: The API automatically blocks user creation and other sensitive actions if Notion keys are missing.
- `isAdmin()` middleware protects administrative routes.

## 📡 Key Endpoints
- `POST ?action=login`: Authentication.
- `GET ?action=me`: Current user data.
- `GET ?action=projects_list`: Notion projects (filtered by client if applicable).
- `GET ?action=settings_get` / `POST ?action=settings_save`: Configuration management (Admin).
- `GET ?action=users_list` / `POST ?action=users_create`: User management (Admin).

---
Developed with ❤️ for efficient project and client management.
