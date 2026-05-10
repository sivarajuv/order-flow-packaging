# OrderFlow Production Deployment Guide

## Overview

This document explains the complete end-to-end production deployment process for the OrderFlow application.

Tech Stack:

* React Frontend
* Spring Boot Backend
* PostgreSQL Database
* AWS EC2 Ubuntu Server
* Nginx Reverse Proxy
* HTTPS SSL using Let's Encrypt
* GoDaddy DNS
* Anthropic AI Integration

\---

# 1\. AWS EC2 Setup

## Step 1 — Launch Ubuntu EC2 Instance

AWS Console:

* EC2 → Launch Instance

Recommended:

* Ubuntu 24.04 LTS
* t2.micro or t3.micro
* Allow:

  * SSH (22)
  * HTTP (80)
  * HTTPS (443)

\---

# 2\. Generate PEM Key

During EC2 creation:

1. Create new key pair
2. Select:

   * RSA
   * PEM format
3. Download:

Example:

```text
customer\_name.pem
```

Store safely.

Example path:

```text
C:\\Users\\SCGBS\\Downloads\\customer\_name.pem
```

\---

# 3\. Connect to EC2 Ubuntu Server

From Windows CMD / PowerShell:

```bash
ssh -i C:\\Users\\SCGBS\\Downloads\\customer\_name.pem ubuntu@YOUR\_PUBLIC\_IP
```

Example:

```bash
ssh -i C:\\Users\\SCGBS\\Downloads\\customer\_name.pem ubuntu@13.201.68.62
```

\---

# 4\. Install Java

```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
```

Verify:

```bash
java -version
```

\---

# 5\. Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
```

Start PostgreSQL:

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Verify:

```bash
sudo systemctl status postgresql
```

\---

# 6\. Configure PostgreSQL

Login:

```bash
sudo -u postgres psql
```

Set password:

```sql
ALTER USER postgres PASSWORD 'postgres';
```

Create database:

```sql
CREATE DATABASE orderflow;
```

Exit:

```sql
\\q
```

Test:

```bash
psql -U postgres -d orderflow -h localhost
```

\---

# 7\. Install Nginx

```bash
sudo apt install nginx -y
```

Enable:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

Verify:

```bash
sudo systemctl status nginx
```

\---

# 8\. Build Spring Boot Application

Local machine:

```bash
mvn clean package -DskipTests
```

Generated JAR:

```text
target/orderflow-backend-1.0.0.jar
```

\---

# 9\. Upload JAR to EC2

```bash
scp -i C:\\Users\\SCGBS\\Downloads\\customer\_name.pem target/orderflow-backend-1.0.0.jar ubuntu@13.201.68.62:/home/ubuntu/
```

\---

# 10\. Spring Boot application.properties

```properties
spring.application.name=orderflow

spring.datasource.url=jdbc:postgresql://localhost:5432/orderflow
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

server.address=0.0.0.0
server.port=5000

cors.allowed-origins=\*

anthropic.api.key=${ANTHROPIC\_API\_KEY}
anthropic.model=claude-sonnet-4-20250514
anthropic.api.max-tokens=1024
```

\---

# 11\. Configure systemd Service

Create service file:

```bash
sudo nano /etc/systemd/system/orderflow.service
```

Paste:

```ini
\[Unit]
Description=OrderFlow Spring Boot Application
After=network.target

\[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/java -jar /home/ubuntu/orderflow-backend-1.0.0.jar
SuccessExitStatus=143
Restart=always
RestartSec=5

Environment=ANTHROPIC\_API\_KEY=YOUR\_ANTHROPIC\_KEY

\[Install]
WantedBy=multi-user.target
```

Replace:

```text
YOUR\_ANTHROPIC\_KEY
```

with actual Anthropic API key.

\---

# 12\. Enable \& Start Application

```bash
sudo systemctl daemon-reload
sudo systemctl enable orderflow
sudo systemctl start orderflow
```

Verify:

```bash
sudo systemctl status orderflow
```

Logs:

```bash
sudo journalctl -u orderflow -f
```

\---

# 13\. Configure Nginx Reverse Proxy

Open:

```bash
sudo nano /etc/nginx/sites-available/default
```

Add:

```nginx
server {

    server\_name packaging.in www.packaging.in;

    location /uploads/ {
        alias /var/www/uploads/;
    }

    location / {
        proxy\_pass http://localhost:5000;
        proxy\_http\_version 1.1;

        proxy\_set\_header Upgrade $http\_upgrade;
        proxy\_set\_header Connection 'upgrade';
        proxy\_set\_header Host $host;
        proxy\_cache\_bypass $http\_upgrade;
    }

    listen 80;
}
```

Validate:

```bash
sudo nginx -t
```

Restart:

```bash
sudo systemctl restart nginx
```

\---

# 14\. Configure Upload Directory

Create upload folders:

```bash
sudo mkdir -p /var/www/uploads/client-designs
```

Permissions:

```bash
sudo chown -R www-data:www-data /var/www/uploads
sudo chmod -R 755 /var/www/uploads
```

\---

# 15\. Configure GoDaddy DNS

GoDaddy → DNS Management

Add:

## Root Domain

Type:

```text
A
```

Host:

```text
@
```

Points To:

```text
13.201.68.62
```

## WWW

Type:

```text
CNAME
```

Host:

```text
www
```

Points To:

```text
packaging.in
```

\---

# 16\. Install SSL HTTPS

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Run:

```bash
sudo certbot --nginx
```

Select:

* Domain names
* Redirect HTTP → HTTPS

Verify:

```bash
sudo systemctl status certbot.timer
```

\---

# 17\. MySQL → PostgreSQL Migration

Install pgloader:

```bash
sudo apt install pgloader -y
```

Migration:

```bash
pgloader mysql://USER:PASSWORD@MYSQL\_HOST/orderflow postgresql://postgres:postgres@localhost/orderflow
```

\---

# 18\. Fix PostgreSQL Sequences

After migration:

```bash
psql -U postgres -d orderflow -h localhost
```

Run:

```sql
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT
            c.relname AS sequence\_name,
            t.relname AS table\_name,
            a.attname AS column\_name
        FROM pg\_class c
        JOIN pg\_depend d ON d.objid = c.oid
        JOIN pg\_class t ON d.refobjid = t.oid
        JOIN pg\_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
        WHERE c.relkind = 'S'
    LOOP
        EXECUTE format(
            'SELECT setval(''%I'', COALESCE((SELECT MAX(%I) FROM %I), 1) + 1)',
            r.sequence\_name,
            r.column\_name,
            r.table\_name
        );
    END LOOP;
END $$;
```

\---

# 19\. Useful Commands

## Restart Application

```bash
sudo systemctl restart orderflow
```

## Restart Nginx

```bash
sudo systemctl restart nginx
```

## View Application Logs

```bash
sudo journalctl -u orderflow -f
```

## Check Port Usage

```bash
sudo ss -ltnp
```

## PostgreSQL Login

```bash
psql -U postgres -d orderflow -h localhost
```

\---

# 20\. Final Production Architecture

```text
Users
   ↓
HTTPS SSL
   ↓
Nginx Reverse Proxy
   ↓
Spring Boot Application
   ↓
PostgreSQL Database
   ↓
AWS EC2 Ubuntu
```

\---

# 21\. Security Recommendations

EC2 Security Group:

Allow:

* 22 → SSH
* 80 → HTTP
* 443 → HTTPS

Remove:

* 5000 public access
* 5432 public access

\---

# 22\. Production URL

```text
https://www.packaging.in
```

\---

# 23\. Future Improvements

* Docker deployment
* GitHub Actions CI/CD
* Automated backups
* AWS CloudWatch monitoring
* AWS WAF security
* CDN integration
* Load balancing
* Kubernetes deployment

\---

# Completed Production Features

✅ HTTPS SSL
✅ PostgreSQL migration
✅ Nginx reverse proxy
✅ Anthropic AI integration
✅ File upload support
✅ Persistent Linux service
✅ Custom domain setup
✅ Production deployment
✅ Low-cost AWS architecture

