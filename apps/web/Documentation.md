# TeamFlow Web Application

TeamFlow is a comprehensive project management platform built with Next.js that streamlines your entire project lifecycle from requirements gathering to deployment. This web application provides a modern, responsive interface for cross-functional teams to collaborate effectively.

## 🚀 Features

### Core Functionality

#### 🔐 Authentication & Authorization

- **Secure Login/Registration**: Email or username-based authentication
- **JWT Token Management**: Automatic token refresh and secure session handling
- **Role-Based Access Control**: Manager, Developer, Designer, and QA roles with specific permissions
- **Workspace-Level Permissions**: Granular access control within project workspaces

#### 🏢 Project Workspaces

- **Centralized Project Hubs**: Create and manage multiple project workspaces
- **Team Member Management**: Invite team members with role assignments
- **Workspace Permissions**: Role-based access control for different workspace features
- **Cross-Functional Collaboration**: Support for diverse team roles and responsibilities

#### 📝 PRD Management

- **Markdown Editor**: Rich text editing with real-time preview
- **Version Control**: Save and track document versions with incremented numbering
- **PDF Export**: Export documents for stakeholder review
- **Collaborative Editing**: Real-time collaboration on requirements documents

#### ✅ Task Management

- **Kanban Board**: Visual task management with drag-and-drop functionality
- **Task Assignment**: Assign tasks to team members with priorities and due dates
- **Status Tracking**: Monitor task progress through different stages
- **Due Date Alerts**: Automated notifications for overdue tasks
- **Priority Management**: Set and track task priorities

#### 🎨 Design Collaboration

- **Figma Integration**: Embed Figma designs directly in the platform
- **File Upload**: Upload mockups and design assets
- **Version History**: Track design iterations and changes
- **Asset Organization**: Organize and categorize design files

#### 🚀 Release Management

- **Release Planning**: Plan and coordinate product releases
- **Semantic Versioning**: Track versions with proper tagging
- **Deployment Tracking**: Monitor deployment status and progress
- **QA Integration**: QA approval workflow for releases
- **Release Notes**: Generate and manage release documentation

#### 🐛 Bug & Hotfix Management

- **Bug Reporting**: Submit and track bug reports
- **Bug Status Management**: Update and track bug resolution progress
- **Hotfix Management**: Handle urgent fixes and patches
- **QA Verification**: Quality assurance workflow integration

## 🛠 Technology Stack

### Frontend Framework

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development

### UI & Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library

### State Management & Data Fetching

- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turborepo**: Monorepo build system

## 📁 Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Public landing pages
│   ├── (user)/            # User profile routes
│   └── (workspace)/       # Workspace management routes
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── bugs/              # Bug management components
│   ├── design/            # Design asset components
│   ├── hotfixes/          # Hotfix management components
│   ├── kanban/            # Task management components
│   ├── members/           # Team member components
│   ├── prd/               # PRD management components
│   ├── releases/          # Release management components
│   ├── ui/                # Base UI components
│   ├── user/              # User profile components
│   └── workspace/         # Workspace components
├── constants/             # Application constants
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── providers/             # React context providers
├── services/              # API service layer
└── types/                 # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
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
   Create a `.env.local` file in the `apps/web` directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm check-types
```

## 🔧 Configuration

### Environment Variables

| Variable              | Description              | Default                        |
| --------------------- | ------------------------ | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | Backend API URL          | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | `http://localhost:3000`        |

### Theme Configuration

The application supports both light and dark themes with automatic system preference detection. Theme configuration can be found in:

- `providers/theme-provider.tsx` - Theme context provider
- `components/ui/theme-toggle-dropdown.tsx` - Theme switcher component

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full-featured experience with all capabilities
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with simplified navigation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Built-in Next.js security features
- **CSRF Protection**: Automatic CSRF token handling

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: WCAG compliant components
- **Dark Mode**: Complete dark theme support
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages

## 🔄 State Management

- **Server State**: TanStack Query for API data management
- **Client State**: React hooks for local state
- **Form State**: React Hook Form for form management
- **Theme State**: Context API for theme management

## 📊 Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Intelligent caching strategies
- **Lazy Loading**: Component and route lazy loading

**TeamFlow** - Streamlining project management for modern teams 🚀
