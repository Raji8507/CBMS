# 🏛️ College Budget Management System (CBMS)

A comprehensive web-based budget management system designed specifically for educational institutions to streamline budget allocation, expenditure tracking, and financial reporting.

![CBMS Banner](https://img.shields.io/badge/CBMS-v1.0.0-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green?style=for-the-badge&logo=mongodb)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [User Roles](#user-roles)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🎯 Overview

The College Budget Management System (CBMS) is a full-stack web application that provides educational institutions with a comprehensive solution for managing budgets, tracking expenditures, and generating financial reports. The system supports multiple user roles with different levels of access and approval workflows.

### Key Benefits

- **Streamlined Budget Management**: Centralized budget allocation and tracking
- **Multi-level Approval Workflow**: Hierarchical approval system for expenditures
- **Real-time Reporting**: Comprehensive dashboards and analytics
- **Role-based Access Control**: Secure access based on user roles
- **Audit Trail**: Complete tracking of all financial activities
- **File Management**: Secure document upload and storage
- **Mobile Responsive**: Access from any device, anywhere

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management
- Multi-factor authentication ready

### 👥 User Management
- User registration and profile management
- Department-based user organization
- Role assignment and permissions
- User activity tracking
- Bulk user operations

### 🏢 Department Management
- Department creation and management
- Head of Department (HOD) assignment
- Department-specific budget allocation
- Department performance tracking

### 💰 Budget Management
- Budget head creation and categorization
- Financial year-based allocations
- Real-time budget tracking
- Budget utilization analytics
- Multi-level budget approval

### 📊 Expenditure Management
- Expenditure submission with attachments
- Multi-level approval workflow
- Status tracking and notifications
- Bulk expenditure upload
- Expenditure categorization

### 📈 Reporting & Analytics
- Real-time dashboards
- Graphical data visualization
- Year-over-year comparisons
- Department-wise reports
- Export functionality (PDF, Excel)
- Audit trail reports

### 🔔 Notifications
- Real-time notifications
- Email notifications
- Approval workflow alerts
- System announcements
- Custom notification preferences

### 📁 File Management
- Secure file upload
- Document attachment support
- File type validation
- Storage optimization
- Download tracking

## 🛠️ Tech Stack

### Frontend
- **React.js 19** - Modern UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **CSS3** - Styling with modern features
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **SendGrid** - Email service
- **bcryptjs** - Password hashing

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **Express Validator** - Input validation
- **JWT Authentication** - Token-based auth

### Development Tools
- **Nodemon** - Development server
- **Create React App** - React build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Components    │    │ • Controllers   │    │ • Collections   │
│ • Pages         │    │ • Routes        │    │ • Documents     │
│ • Context       │    │ • Middleware    │    │ • Indexes       │
│ • Services      │    │ • Models        │    │ • Aggregations  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### System Flow
1. **User Authentication** → JWT token generation
2. **Role-based Routing** → Feature access control
3. **API Requests** → Backend processing
4. **Database Operations** → Data persistence
5. **Response Handling** → Frontend updates
6. **Real-time Updates** → Notification system

## 👤 User Roles

### 🔧 System Administrator
- **Full System Access**: Complete control over all features
- **User Management**: Create, update, delete users
- **Department Management**: Manage departments and HODs
- **Budget Head Management**: Create and manage budget categories
- **System Settings**: Configure system parameters
- **Audit Access**: View all system activities

### 💼 Finance Officer
- **Budget Allocation**: Allocate budgets to departments
- **Expenditure Approval**: Approve/reject expenditure requests
- **Report Generation**: Generate financial reports
- **Bulk Operations**: Handle bulk data uploads
- **Department Overview**: Monitor department budgets

### 🏢 Department User
- **Expenditure Submission**: Submit expenditure requests
- **Document Upload**: Attach supporting documents
- **Status Tracking**: Monitor request status
- **History View**: View past expenditures
- **Budget Status**: Check available budget

### 👨‍💼 Head of Department (HOD)
- **Department Oversight**: Manage department activities
- **Expenditure Verification**: Verify department expenditures
- **User Management**: Manage department users
- **Department Reports**: Generate department-specific reports
- **Approval Authority**: Approve department expenditures

### 🎓 Vice Principal / Principal
- **High-value Approvals**: Approve large expenditures
- **Consolidated Reports**: View institution-wide reports
- **Budget Overview**: Monitor overall budget status
- **Strategic Planning**: Access analytical dashboards
- **Policy Decisions**: Make budget policy decisions

### 🔍 Auditor
- **Read-only Access**: View all financial data
- **Audit Trail**: Access complete audit logs
- **Compliance Reports**: Generate compliance reports
- **Data Export**: Export data for external analysis
- **Historical Analysis**: Access historical data

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cbms.git
cd cbms
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

### 4. Start the Application
```bash
# Start the server (from server directory)
npm run dev

# Start the client (from client directory, in a new terminal)
npm start
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api

## 📦 Installation

### Detailed Installation Guide

#### 1. System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v4.4.0 or higher
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 2GB free space

#### 2. Database Setup
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Install MongoDB (macOS)
brew install mongodb

# Install MongoDB (Windows)
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
# Windows: Start MongoDB service from Services
```

#### 3. Project Setup
```bash
# Clone repository
git clone https://github.com/your-username/cbms.git
cd cbms

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### 4. Environment Configuration
Create environment files with the following configurations:

**Server (.env)**
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/cbms

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

   # Email Configuration (SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=CBMS System

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx

# AWS S3 Configuration (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=cbms-attachments
```

**Client (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=CBMS
REACT_APP_VERSION=1.0.0
```

#### 5. Database Initialization
```bash
# Start MongoDB
mongod

# Create initial admin user (optional)
cd server
node scripts/createAdmin.js
```

#### 6. Start Development Servers
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend server
cd client
npm start
```

## ⚙️ Configuration

### Server Configuration
- **Port**: Default 5000, configurable via PORT environment variable
- **Database**: MongoDB connection string via MONGO_URI
- **JWT**: Secret key and expiration time
- **File Upload**: Size limits and allowed types
- **Email**: SendGrid API configuration for notifications

### Client Configuration
- **API URL**: Backend API endpoint
- **App Name**: Application display name
- **Version**: Application version
- **Theme**: Color scheme and styling

### Security Configuration
- **Password Policy**: Minimum length, complexity requirements
- **Session Timeout**: Automatic logout after inactivity
- **Rate Limiting**: API request limits
- **CORS**: Cross-origin resource sharing settings

## 📚 API Documentation

### Authentication Endpoints
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
POST /api/auth/register
```

### User Management
```http
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/role/:role
```

### Department Management
```http
GET    /api/departments
GET    /api/departments/:id
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id
```

### Budget Management
```http
GET    /api/budget-heads
GET    /api/budget-heads/:id
POST   /api/budget-heads
PUT    /api/budget-heads/:id
DELETE /api/budget-heads/:id
```

### Expenditure Management
```http
GET    /api/expenditures
GET    /api/expenditures/:id
POST   /api/expenditures
PUT    /api/expenditures/:id
DELETE /api/expenditures/:id
POST   /api/expenditures/bulk-upload
```

### Reporting
```http
GET /api/reports/dashboard
GET /api/reports/department/:id
GET /api/reports/expenditure
GET /api/reports/budget-utilization
GET /api/reports/audit-trail
```

### File Management
```http
POST /api/files/upload
GET  /api/files/:id
DELETE /api/files/:id
```

## 🚀 Deployment

### Production Deployment

#### 1. Environment Preparation
```bash
# Set production environment
export NODE_ENV=production

# Update environment variables
# Use production database URL
# Set secure JWT secret
# Configure production email settings
```

#### 2. Build Application
```bash
# Build client for production
cd client
npm run build

# The build folder contains production-ready files
```

#### 3. Server Deployment
```bash
# Install production dependencies
cd server
npm install --production

# Start production server
npm start
```

#### 4. Database Setup
```bash
# Create production database
# Set up database indexes
# Configure backup strategy
# Set up monitoring
```

### Docker Deployment
```dockerfile
# Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  cbms-server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/cbms
    depends_on:
      - mongo
  
  cbms-client:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - cbms-server
  
  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Cloud Deployment Options

#### AWS Deployment
- **EC2**: Virtual server hosting
- **RDS**: Managed MongoDB service
- **S3**: File storage
- **CloudFront**: CDN for static assets
- **Route 53**: DNS management

#### Azure Deployment
- **App Service**: Web app hosting
- **Cosmos DB**: NoSQL database
- **Blob Storage**: File storage
- **CDN**: Content delivery network

#### Google Cloud Deployment
- **Compute Engine**: Virtual machines
- **Cloud Firestore**: NoSQL database
- **Cloud Storage**: File storage
- **Cloud CDN**: Content delivery

## 🤝 Contributing

We welcome contributions to the CBMS project! Please follow these guidelines:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow coding standards
4. **Add tests**: Ensure code coverage
5. **Commit changes**: Use conventional commit messages
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Create Pull Request**: Provide detailed description

### Coding Standards
- **JavaScript**: Follow ESLint configuration
- **React**: Use functional components with hooks
- **Node.js**: Follow Express.js best practices
- **Database**: Use Mongoose schemas properly
- **Testing**: Write unit and integration tests
- **Documentation**: Update README and code comments

### Commit Message Format
```
type(scope): description

feat(auth): add JWT token refresh functionality
fix(api): resolve user creation validation error
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(db): optimize user query performance
test(auth): add login endpoint tests
```

### Pull Request Guidelines
- **Clear Description**: Explain what changes were made
- **Testing**: Include test results and coverage
- **Screenshots**: For UI changes, include before/after
- **Breaking Changes**: Clearly mark any breaking changes
- **Documentation**: Update relevant documentation

### Issue Reporting
When reporting issues, please include:
- **Environment**: OS, Node.js version, browser
- **Steps to Reproduce**: Clear reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Relevant error logs

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

### License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### Community
- **GitHub**: [Repository](https://github.com/your-username/cbms)
- **Issues**: [Bug Reports](https://github.com/your-username/cbms/issues)
- **Discussions**: [Community Forum](https://github.com/your-username/cbms/discussions)
- **Wiki**: [Documentation Wiki](https://github.com/your-username/cbms/wiki)

### Professional Support
For enterprise support, custom development, or consulting services, please contact:
- **Email**: support@cbms.com
- **Website**: https://cbms.com
- **Phone**: +1-800-CBMS-HELP

## 🔮 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting features
- [ ] Multi-language support
- [ ] API rate limiting improvements
- [ ] Performance optimizations

### Version 1.2 (Q3 2024)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Integration with accounting systems
- [ ] Automated backup system
- [ ] Enhanced security features

### Version 2.0 (Q4 2024)
- [ ] Microservices architecture
- [ ] Advanced workflow engine
- [ ] Machine learning insights
- [ ] Blockchain integration
- [ ] Advanced audit capabilities

## 📊 Project Statistics

![GitHub stars](https://img.shields.io/github/stars/your-username/cbms?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/cbms?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/cbms)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/cbms)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/cbms)

---

<div align="center">

**Made with ❤️ by the CBMS Development Team**

[⭐ Star this repo](https://github.com/your-username/cbms) | [🐛 Report Bug](https://github.com/your-username/cbms/issues) | [💡 Request Feature](https://github.com/your-username/cbms/issues)

</div>
#   C B M S  
 