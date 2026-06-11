-- GitHub Profile Analyzer - Database Schema
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

DROP TABLE IF EXISTS profile_languages;
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    html_url VARCHAR(500) DEFAULT NULL,
    blog VARCHAR(500) DEFAULT NULL,
    company VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    twitter_username VARCHAR(255) DEFAULT NULL,
    public_repos INT DEFAULT 0,
    public_gists INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    total_stars INT DEFAULT 0,
    total_forks INT DEFAULT 0,
    account_created_at DATETIME DEFAULT NULL,
    account_updated_at DATETIME DEFAULT NULL,
    hireable TINYINT(1) DEFAULT 0,
    last_analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE profile_languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_id INT NOT NULL,
    language VARCHAR(100) NOT NULL,
    repo_count INT DEFAULT 0,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;