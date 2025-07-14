# TeamFlow - Modern Project Management Platform

<div align="center">

![TeamFlow Logo](./apps/web/public/assets/logo-dark.svg)

**Streamline Your Project Workflow That Flows Naturally** 🚀

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.15-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5-purple?style=flat-square&logo=turborepo)](https://turborepo.com/)

</div>

## 📖 Overview

TeamFlow is a comprehensive project management platform designed for modern cross-functional teams. It streamlines the entire project lifecycle from requirements gathering to deployment, providing a centralized hub for collaboration, task management, design collaboration, and release management.

### 🎯 Mission

To create a modern, cross-functional centralized hub that empowers teams to plan, execute, and track every aspect of their projects seamlessly. We believe that great products come from great collaboration.

## ✨ Key Features

### 🔐 Authentication & Authorization

- **Secure Login/Registration**: Email or username-based authentication
- **JWT Token Management**: Automatic token refresh and secure session handling
- **Role-Based Access Control**: Manager, Developer, Designer, and QA roles
- **Workspace-Level Permissions**: Granular access control within projects

### 🏢 Project Workspaces

- **Centralized Project Hubs**: Create and manage multiple project workspaces
- **Team Member Management**: Invite team members with role assignments
- **Cross-Functional Collaboration**: Support for diverse team roles

### 📝 PRD Management

- **Markdown Editor**: Rich text editing with real-time preview
- **Version Control**: Save and track document versions
- **PDF Export**: Export documents for stakeholder review
- **Collaborative Editing**: Real-time collaboration on requirements

### ✅ Task Management

- **Kanban Board**: Visual task management with drag-and-drop
- **Task Assignment**: Assign tasks with priorities and due dates
- **Status Tracking**: Monitor task progress through stages
- **Due Date Alerts**: Automated notifications for overdue tasks

### 🎨 Design Collaboration

- **Figma Integration**: Embed Figma designs directly
- **File Upload**: Upload mockups and design assets
- **Version History**: Track design iterations
- **Asset Organization**: Organize and categorize design files

### 🚀 Release Management

- **Release Planning**: Plan and coordinate product releases
- **Semantic Versioning**: Track versions with proper tagging
- **Deployment Tracking**: Monitor deployment status
- **QA Integration**: QA approval workflow for releases

### 🐛 Bug & Hotfix Management

- **Bug Reporting**: Submit and track bug reports
- **Bug Status Management**: Update and track resolution progress
- **Hotfix Management**: Handle urgent fixes and patches
- **QA Verification**: Quality assurance workflow integration

## 🏗 Architecture

TeamFlow is built as a monorepo using **Turborepo** with the following structure:

```
grad-project/
├── apps/
│   ├── web/                 # Next.js Frontend Application
│   └── api/                 # NestJS Backend API
├── packages/
│   ├── types/               # Shared TypeScript types
│   ├── eslint-config/       # Shared ESLint configuration
│   └── typescript-config/   # Shared TypeScript configuration
└── turbo.json               # Turborepo configuration
```

### 🎨 Frontend (Web App)

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with Radix UI components
- **State Management**: TanStack Query for server state
- **Animations**: Framer Motion for smooth transitions

### 🔧 Backend (API)

- **Framework**: NestJS 11 with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary for design assets
- **Validation**: Class-validator and class-transformer

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- MongoDB instance
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ITI-Final-Project-OS45/grad-project
   cd grad-project
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   **For Web App** (`apps/web/.env.local`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **For API** (`apps/api/.env`):

   ```env
   MONGODB_URI=mongodb://localhost:27017/teamflow
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   PORT=8080
   CORS_ORIGIN=http://localhost:3000
   GEMINI_API_SECRET_KEY=your-gemini-api
   ```

4. **Start the development servers**

   ```bash
   # Start both frontend and backend
   pnpm dev

   # Or start individually
   pnpm dev --filter=web    # Frontend only
   pnpm dev --filter=api    # Backend only
   ```

5. **Access the application**
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

## 📚 Documentation

### 📖 Detailed Documentation

- **[Web Application Documentation](./apps/web/Documentation.md)** - Complete guide to the frontend application
- **[API Documentation](./apps/api/Documentation.md)** - Comprehensive backend API documentation

### 🔗 Quick Links

- [Web App Features](./apps/web/Documentation.md#-features)
- [API Endpoints](./apps/api/Documentation.md#-api-endpoints)
- [Getting Started Guide](./apps/web/Documentation.md#-getting-started)
- 
## 🛠 Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev --filter=web       # Start only web app
pnpm dev --filter=api       # Start only API

# Building
pnpm build                  # Build all apps
pnpm build --filter=web     # Build only web app
pnpm build --filter=api     # Build only API

# Linting
pnpm lint                   # Lint all apps
pnpm lint --filter=web      # Lint only web app
pnpm lint --filter=api      # Lint only API

# Type checking
pnpm check-types            # Check types for all apps
```

### Project Structure

```
grad-project/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility libraries
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript types
│   └── api/                   # NestJS Backend
│       ├── src/
│       │   ├── auth/         # Authentication module
│       │   ├── users/        # User management
│       │   ├── workspaces/   # Workspace management
│       │   ├── tasks/        # Task management
│       │   ├── prds/         # PRD management
│       │   ├── releases/     # Release management
│       │   ├── bugs/         # Bug tracking
│       │   ├── hotfixes/     # Hotfix management
│       │   └── schemas/      # MongoDB schemas
│       └── test/             # Test files
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared TS config
└── turbo.json                # Turborepo configuration
```

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Follow the existing code style
- Update documentation as needed

## 👥 Team

TeamFlow is developed by a passionate team of developers:

- **Mohamed Hesham** - Project Lead & Full-Stack Developer
- **Moamen AlGhareeb** - Full-Stack Developer
- **Islam Tarek** - Full-Stack Developer
- **Amr ElSayed** - Full-Stack Developer
- **Ahmed Abdel-Nasser** - Full-Stack Developer

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Turborepo](https://turborepo.com/) - Monorepo build system
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

<div align="center">

**TeamFlow** - Streamlining project management for modern teams 🚀

[Get Started](#quick-start) • [Documentation](./apps/web/Documentation.md) • [API Docs](./apps/api/Documentation.md)

</div>
