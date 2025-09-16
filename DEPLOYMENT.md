# Production Deployment Guide

This guide explains how to deploy the Acronis Key Validator application to a production environment.

## Prerequisites

1. Node.js 18+ installed
2. MySQL database server
3. SMTP server for email notifications
4. Domain name with SSL certificate

## Environment Configuration

### 1. Environment Variables

Create a `.env.production` file in the root directory with the following variables:

```env
# Database connection - Update with your production database URL
DATABASE_URL="mysql://username:password@production-host:3306/acronis_db"

# API URL - Update with your production domain
NEXT_PUBLIC_API_URL="https://your-production-domain.com/api"

# JWT Secret - Use a strong secret in production
JWT_SECRET="your-production-jwt-secret-here"

# SMTP Settings - Update with your production email settings
SMTP_HOST=mail.yourproductiondomain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-production-email@yourdomain.com
SMTP_PASS=your-production-email-password
SMTP_FROM=your-production-email@yourdomain.com

# Admin Email - Update with your production admin email
ADMIN_EMAIL=admin@yourproductiondomain.com
```

### 2. Database Setup

1. Create a MySQL database for the application
2. Update the DATABASE_URL in `.env.production` with your database credentials
3. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

This will create an optimized production build in the `.next` directory.

## Deployment Options

### Option 1: Using Node.js Server

After building, start the application:

```bash
npm run start
```

The application will be available on port 3000 by default.

### Option 2: Using PM2 (Recommended for Production)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the application with PM2:
   ```bash
   pm2 start npm --name "acronis-key-validator" -- run start
   ```

### Option 3: Docker Deployment

Create a Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

Build and run the Docker container:

```bash
docker build -t acronis-key-validator .
docker run -p 3000:3000 acronis-key-validator
```

## SSL Configuration

For production deployment, you should use HTTPS. You can:

1. Use a reverse proxy like Nginx with Let's Encrypt SSL certificates
2. Deploy to a platform that provides automatic SSL (Vercel, Netlify, etc.)

## Security Considerations

1. Use strong passwords for all accounts
2. Regularly update dependencies
3. Use environment variables for sensitive data
4. Implement proper firewall rules
5. Regular database backups
6. Monitor logs for suspicious activity

## Monitoring and Maintenance

1. Set up log rotation to prevent disk space issues
2. Monitor application performance
3. Regularly check for security updates
4. Monitor database performance and optimize queries if needed

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify DATABASE_URL in environment variables
2. **Email Not Sending**: Check SMTP settings in environment variables
3. **Authentication Issues**: Verify JWT_SECRET is consistent across environments
4. **Build Failures**: Check Node.js version compatibility

### Logs

Check application logs for errors:
- Console output when running with Node.js
- PM2 logs: `pm2 logs`
- Docker logs: `docker logs <container-id>`

## Backup and Recovery

1. Regularly backup the MySQL database
2. Backup the `.env.production` file (store securely)
3. Keep a copy of the latest successful build