# Database Setup

This project uses **PostgreSQL**. The database schema is split into **4 SQL files**. Run them in the following order to avoid foreign key errors.

## 1. Create Database

```bash
psql -U postgres -c "CREATE DATABASE hostelcom;"
```

## 2. Run Migrations

### **Step 1: Core tables & extensions**

```bash
psql -U postgres -d hostelcom -f 001_create_tables.sql
```

### **Step 2: Seed Roles & Permissions**

```bash
psql -U postgres -d hostelcom -f 002_seed_roles_permissions.sql
```

### **Step 3: Seed Facilities & Room Charges**

```bash
psql -U postgres -d hostelcom -f 003_seed_facilities.sql
```

### **Step 4: Seed Menus, Kitchens & Complaints**

```bash
psql -U postgres -d hostelcom -f 004_seed_menus_kitchens_complaints.sql
```

> **Note:** Make sure the `.sql` files are in the same folder where you run these commands, or provide the full path.
