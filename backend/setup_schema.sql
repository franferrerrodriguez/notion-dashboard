-- Schema for Client Portal (Notion-Client Dashboard)
-- WARNING: This script will RESET all data. It drops existing tables and recreates them.

SET FOREIGN_KEY_CHECKS = 0;
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

-- Client Mapping table (Links portal user with Central DB identifier)
CREATE TABLE client_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    external_client_id VARCHAR(100) NOT NULL, -- The ID/Tag in Notion/Main DB
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings table for dynamic configuration
CREATE TABLE settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial data seed
INSERT INTO roles (id, name) VALUES (1, 'Admin'), (2, 'Client');

-- Initial settings seed
-- Note: Replace empty values with your actual Notion credentials
INSERT INTO settings (`key`, `value`, description) VALUES 
('notion_integration_token', '', 'Secret Notion API Token'),
('notion_database_id', '', 'Main Notion Database ID');

-- Create Default Root User (password: root)
INSERT INTO users (email, password_hash, role_id) VALUES 
('root@root.com', '$2y$12$6ot1AlzpOOsz7K7iX04jx.WTrRECxQkFwogIeX.QOpnoyVitjLo.6', 1);

-- Optional: Add index for performance on external mapping
CREATE INDEX idx_external_client_id ON client_links(external_client_id);
