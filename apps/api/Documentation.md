# TeamFlow API Backend

TeamFlow API is a robust NestJS-based backend service that powers the TeamFlow project management platform. Built with TypeScript and MongoDB, it provides a comprehensive REST API for managing projects, tasks, users, and collaborative workflows.

## 🏗 Architecture Overview

### Technology Stack

- **Framework**: NestJS 11 - Progressive Node.js framework
- **Language**: TypeScript - Type-safe development
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary for design assets
- **Validation**: Class-validator and class-transformer
- **Testing**: Jest for unit and e2e testing

### Core Modules

#### 🔐 Authentication Module (`/auth`)

- User registration and login
- JWT token generation and refresh
- Password hashing with bcrypt
- Session management

#### 👥 Users Module (`/users`)

- User profile management
- User CRUD operations
- Profile updates and deletion

#### 🏢 Workspaces Module (`/workspaces`)

- Workspace creation and management
- Workspace settings and configuration
- Workspace-level permissions

#### 👥 Workspace Members Module (`/workspace-member`)

- Team member management
- Role assignments and permissions
- Member invitations and removal

#### 📝 PRD Module (`/prd`)

- Project Requirements Document management
- Document versioning and history
- Workspace-based document organization

#### ✅ Tasks Module (`/tasks`)

- Task creation and management
- Kanban board data structure
- Task assignment and status tracking
- Priority and due date management

#### 🎨 Design Assets Module (`/design-assets`)

- Design file upload and management
- Cloudinary integration for file storage
- Asset versioning and organization
- Figma embedding support

#### 🚀 Releases Module (`/releases`)

- Release planning and management
- Semantic versioning
- QA approval workflow
- Deployment tracking

#### 🐛 Bugs Module (`/bugs`)

- Bug reporting and tracking
- Bug status management
- Release-specific bug organization

#### 🔧 Hotfixes Module (`/hotfixes`)

- Hotfix creation and management
- Urgent fix tracking
- QA verification workflow

#### 📨 Invites Module (`/invites`)

- Workspace invitation system
- Email-based invitations
- Invitation status tracking

## 📁 Project Structure

```
apps/api/src/
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   └── auth.module.ts      # Auth module configuration
├── users/                  # User management
├── workspaces/             # Workspace management
├── workspace-members/      # Team member management
├── prds/                   # PRD management
├── tasks/                  # Task management
├── design-asset/           # Design asset management
├── releases/               # Release management
├── bugs/                   # Bug tracking
├── hotfixes/               # Hotfix management
├── invites/                # Invitation system
├── schemas/                # MongoDB schemas
├── guards/                 # Authentication guards
├── filters/                # Exception filters
├── interfaces/             # TypeScript interfaces
├── config/                 # Configuration management
└── main.ts                 # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB instance
- Cloudinary account (for file uploads)
- pnpm package manager

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
   Create a `.env` file in the `apps/api` directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/teamflow

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Server
   PORT=8080
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Verify the server is running**
   The API will be available at `http://localhost:8080/api/v1`

### Development Commands

```bash
# Start development server with hot reload
pnpm dev

# Start in debug mode
pnpm start:debug

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🔌 API Endpoints

### Authentication (`/api/v1/auth`)

```
POST /auth/signup          # User registration
POST /auth/login           # User login
POST /auth/refresh         # Refresh JWT token
```

### Users (`/api/v1/users`)

```
GET    /users/:id          # Get user profile
PATCH  /users/:id          # Update user profile
DELETE /users/:id          # Delete user account
```

### Workspaces (`/api/v1/workspaces`)

```
POST   /workspaces         # Create workspace
GET    /workspaces         # Get user workspaces
GET    /workspaces/:id     # Get workspace details
PATCH  /workspaces/:id     # Update workspace
DELETE /workspaces/:id     # Delete workspace
```

### Workspace Members (`/api/v1/workspace-member`)

```
POST   /workspace-member   # Add member to workspace
GET    /workspace-member/workspace/:id  # Get workspace members
PATCH  /workspace-member/:id            # Update member role
DELETE /workspace-member/:id            # Remove member
```

### PRDs (`/api/v1/prd`)

```
POST   /prd/workspace/:workspaceId     # Create PRD
GET    /prd/workspace/:workspaceId     # Get workspace PRDs
PUT    /prd/:prdId                     # Update PRD
DELETE /prd/:prdId                     # Delete PRD
```

### Tasks (`/api/v1/tasks`)

```
POST   /tasks              # Create task
GET    /tasks/workspace/:workspaceId  # Get workspace tasks
PUT    /tasks/:id          # Update task
DELETE /tasks/:id          # Delete task
```

### Design Assets (`/api/v1/design-assets`)

```
POST   /design-assets      # Upload design asset
GET    /design-assets/workspaces/:id   # Get workspace assets
GET    /design-assets/:id  # Get asset details
PATCH  /design-assets/:id  # Update asset
DELETE /design-assets/:id  # Delete asset
```

### Releases (`/api/v1/releases`)

```
POST   /releases           # Create release
GET    /releases           # Get all releases
GET    /releases/:id       # Get release details
PUT    /releases/:id       # Update release
DELETE /releases/:id       # Delete release
```

### Bugs (`/api/v1/bugs`)

```
POST   /bugs               # Create bug report
GET    /bugs               # Get all bugs
GET    /bugs/release/:releaseId  # Get release bugs
GET    /bugs/:id           # Get bug details
PATCH  /bugs/:id           # Update bug
DELETE /bugs/:id           # Delete bug
```

### Hotfixes (`/api/v1/hotfixes`)

```
POST   /hotfixes           # Create hotfix
GET    /hotfixes           # Get all hotfixes
GET    /hotfixes/:id       # Get hotfix details
PATCH  /hotfixes/:id       # Update hotfix
DELETE /hotfixes/:id       # Delete hotfix
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh mechanism
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access Control**: Granular permission system
- **Workspace Guards**: Workspace-level authorization

### Input Validation

- **DTO Validation**: Class-validator for request validation
- **Type Safety**: TypeScript for compile-time type checking
- **Sanitization**: Automatic input sanitization
- **Whitelist Validation**: Only allow expected fields

### Error Handling

- **Global Exception Filter**: Centralized error handling
- **Custom Exceptions**: Domain-specific error types
- **Validation Errors**: Detailed validation error messages
- **Security Headers**: CORS and security middleware

## 📊 Database Schema

### Core Entities

- **User**: User accounts and profiles
- **Workspace**: Project workspaces
- **WorkspaceMember**: Team member relationships
- **Task**: Project tasks and assignments
- **PRD**: Project requirements documents
- **DesignAsset**: Design files and assets
- **Release**: Product releases
- **Bug**: Bug reports and tracking
- **Hotfix**: Urgent fixes
- **Invite**: Workspace invitations

### Relationships

- Users belong to multiple workspaces through WorkspaceMember
- Tasks are assigned to users within workspaces
- PRDs, DesignAssets, and Releases belong to workspaces
- Bugs and Hotfixes are associated with releases

## 🔧 Configuration

### Environment Variables

| Variable                | Description               | Required           |
| ----------------------- | ------------------------- | ------------------ |
| `MONGODB_URI`           | MongoDB connection string | Yes                |
| `JWT_SECRET`            | JWT signing secret        | Yes                |
| `JWT_REFRESH_SECRET`    | JWT refresh secret        | Yes                |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | Yes                |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | Yes                |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | Yes                |
| `PORT`                  | Server port               | No (default: 8080) |
| `CORS_ORIGIN`           | CORS allowed origin       | No (default: \*)   |

### Database Configuration

- **MongoDB**: Primary database with Mongoose ODM
- **Connection Pooling**: Optimized connection management
- **Indexes**: Performance-optimized database indexes
- **Validation**: Schema-level data validation

## 📈 Performance & Monitoring

### Performance Optimizations

- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries

## 🔄 API Versioning

The API uses URL versioning (`/api/v1/`) to ensure backward compatibility and smooth upgrades.

## 📚 API Documentation

### Request/Response Format

All API endpoints follow a standardized format:

**Success Response:**

```json
{
  "success": true,
  "status": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "status": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [ ... ]
  }
}
```

**TeamFlow API** - Powering modern project management 🚀
