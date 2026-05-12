-- Schema for Client Portal (Generic App Dashboard)
-- WARNING: This script will RESET all data. It drops existing tables and recreates them.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS interaction_reads;
DROP TABLE IF EXISTS user_files;
DROP TABLE IF EXISTS user_apps;
DROP TABLE IF EXISTS apps;
DROP TABLE IF EXISTS client_links;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS settings;
SET FOREIGN_KEY_CHECKS = 1;

-- Roles table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Apps table
CREATE TABLE apps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'AppWindow'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Apps mapping (which apps are enabled for which user)
CREATE TABLE user_apps (
    user_id INT NOT NULL,
    app_id INT NOT NULL,
    PRIMARY KEY (user_id, app_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Files table
CREATE TABLE user_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    category VARCHAR(50) DEFAULT 'General',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Client Mapping table (Links portal user with Central DB identifier)
CREATE TABLE client_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    external_client_id VARCHAR(100) NOT NULL, -- The ID/Tag in Notion/Main DB
    logo_url TEXT DEFAULT NULL,               -- URL to the client's company logo
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings table for dynamic configuration
CREATE TABLE settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Interaction Reads table (Tracks seen interactions per user)
CREATE TABLE IF NOT EXISTS interaction_reads (
    user_id INT NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    last_read_at DATETIME NOT NULL,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial data seed
INSERT INTO roles (id, name) VALUES (1, 'Admin'), (2, 'Client');

-- Initial apps
INSERT INTO apps (name, slug, description, icon) VALUES 
('Project Dashboard', 'notion-dashboard', 'Acceso a proyectos, facturas y tareas', 'LayoutDashboard'),
('Gestor de Archivos', 'file-dashboard', 'Documentos y archivos compartidos', 'FolderOpen');

-- Initial settings seed
INSERT INTO settings (`key`, `value`, description) VALUES 
('notion_integration_token', '', 'Secret Notion API Token'),
('notion_projects_database_id', '', 'Main Notion Projects Database ID'),
('notion_offers_database_id', '', 'Notion Offers Database ID'),
('notion_invoices_database_id', '', 'Notion Invoices Database ID'),
('notion_tasks_database_id', '', 'Notion Tasks Database ID');

-- Create Default Root User (password: root)
INSERT INTO users (email, password_hash, role_id) VALUES 
('root@root.com', '$2y$12$6ot1AlzpOOsz7K7iX04jx.WTrRECxQkFwogIeX.QOpnoyVitjLo.6', 1);

-- Root has all apps by default
INSERT INTO user_apps (user_id, app_id) SELECT 1, id FROM apps;

-- Optional: Add index for performance on external mapping
CREATE INDEX idx_external_client_id ON client_links(external_client_id);
