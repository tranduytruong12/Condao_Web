# E-commerce Website Backend

A Node.js backend application for an e-commerce website using Express, Sequelize, MySQL, and Docker.

## Prerequisites

- Node.js (v14 or higher)
- Docker
- DBeaver (or any MySQL client)
- npm or yarn

## Tech Stack

- Express.js - Web framework
- Sequelize - ORM for MySQL
- MySQL - Database
- Docker - Container for MySQL
- express-fileupload - File upload middleware
- JWT - Authentication
- Babel - JavaScript compiler

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>


2. Install dependencies
open terminal: npm install

3. Set up MySQL using Docker

# Pull MySQL image
docker pull mysql:8.0

# Run MySQL container
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=danh3000 -e MYSQL_DATABASE=Web -p 3307:3306 -d mysql:8.0
dowload file setup docker: https://drive.google.com/drive/folders/1nfKIJpETxxwA-RKyM5BJkj8Q7Ye08zGk?usp=sharing


5. Database Migration

# Run migrations to create database tables
npx sequelize-cli db:migrate

npm run dev
