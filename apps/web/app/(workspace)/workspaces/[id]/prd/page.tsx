"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Download, History, Edit3, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRDEditor } from "@/components/prd/prd-editor";
import { PRDPreview } from "@/components/prd/prd-preview";
import { PRDVersionHistory } from "@/components/prd/prd-version-history";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Mock data
const mockPRD = {
  id: "1",
  workspaceId: "1",
  title: "E-commerce Platform PRD",
  content: `# E-commerce Platform Project Requirements Document

## 1. Project Overview

### 1.1 Purpose
This document outlines the requirements for building a modern e-commerce platform that enables businesses to sell products online with a seamless user experience.

> **Note**: This is a comprehensive document that will guide the development process from start to finish.

### 1.2 Scope
The platform will include:
- Customer-facing storefront
- Admin dashboard for store management
- Payment processing integration
- Inventory management system
- Order fulfillment workflow

## 2. Functional Requirements

### 2.1 User Authentication
- [x] User registration and login
- [x] Social media authentication (Google, Facebook)
- [ ] Password reset functionality
- [ ] Email verification

### 2.2 Product Catalog
- Product listing with search and filters
- Product detail pages with images and descriptions
- Category-based navigation
- Product recommendations

For more information, visit our [documentation](https://docs.example.com).

### 2.3 Shopping Cart & Checkout
- Add/remove items from cart
- Guest checkout option
- Multiple payment methods:
  1. Credit card
  2. PayPal
  3. Apple Pay
  4. Google Pay

## 3. Technical Requirements

### 3.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Next.js | 14.x | Full-stack Framework |

### 3.2 Backend
- **Node.js** with Express.js
- **RESTful API** architecture
- **JWT-based** authentication

### 3.3 Database
\`\`\`sql
-- Example user table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time < 3 seconds
- Support for 10,000 concurrent users
- 99.9% uptime availability

### 4.2 Security
- HTTPS encryption
- PCI DSS compliance for payment processing
- Regular security audits

## 5. User Stories

### 5.1 Customer Stories
- **As a customer**, I want to browse products by category so I can find what I'm looking for easily
- **As a customer**, I want to add items to my cart and checkout securely
- **As a customer**, I want to track my order status after purchase

### 5.2 Admin Stories
- **As an admin**, I want to add and manage products in the catalog
- **As an admin**, I want to view sales analytics and reports
- **As an admin**, I want to manage customer orders and fulfillment

## 6. Acceptance Criteria

### 6.1 Product Search
- Users can search products by name, category, or keywords
- Search results are displayed within 2 seconds
- Filters can be applied to narrow down results

### 6.2 Checkout Process
- Checkout can be completed in under 5 steps
- Payment processing is secure and PCI compliant
- Order confirmation is sent via email within 1 minute

## 7. Timeline and Milestones

### Phase 1: Foundation (Weeks 1-4)
- User authentication system
- Basic product catalog
- Shopping cart functionality

### Phase 2: Core Features (Weeks 5-8)
- Payment integration
- Order management
- Admin dashboard

### Phase 3: Enhancement (Weeks 9-12)
- Advanced search and filters
- Product recommendations
- Performance optimization

## 8. Risks and Mitigation

### 8.1 Technical Risks
- **Risk**: Third-party payment integration delays
- **Mitigation**: Start integration early and have backup payment providers

### 8.2 Business Risks
- **Risk**: Changing requirements during development
- **Mitigation**: Regular stakeholder reviews and change control process

---

**Contact**: For questions about this PRD, contact the product team at [product@example.com](mailto:product@example.com)`,
  currentVersion: 3,
  versions: [
    {
      version: 1,
      createdAt: "2024-01-15T10:00:00Z",
      createdBy: "Mohamed Hesham",
      title: "Initial PRD Draft",
    },
    {
      version: 2,
      createdAt: "2024-01-20T14:30:00Z",
      createdBy: "Mohamed Hesham",
      title: "Added technical requirements",
    },
    {
      version: 3,
      createdAt: "2024-01-25T09:15:00Z",
      createdBy: "Mohamed Hesham",
      title: "Updated timeline and acceptance criteria",
    },
  ],
  lastModified: "2024-01-25T09:15:00Z",
  modifiedBy: "Mohamed Hesham",
};

export default function PRDPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [prd, setPrd] = useState(mockPRD);
  const [currentEditTitle, setCurrentEditTitle] = useState(prd.title);
  const [currentEditContent, setCurrentEditContent] = useState(prd.content);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  // Initialize edit state when PRD loads
  useEffect(() => {
    setCurrentEditTitle(prd.title);
    setCurrentEditContent(prd.content);
  }, [prd.title, prd.content]);

  // Handle editor changes - this preserves the content across tab switches
  const handleEditorChange = (title: string, content: string) => {
    setCurrentEditTitle(title);
    setCurrentEditContent(content);
  };

  const handleSave = async (content: string, title: string) => {};
  const handleSaveAsNewVersion = async (content: string, title: string) => {};

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast.success("Your PRD is being exported to PDF");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl">{prd.title}</CardTitle>
                  <Badge variant="secondary">v{prd.currentVersion}</Badge>
                </div>
                <CardDescription>
                  Last modified {new Date(prd.lastModified).toLocaleDateString()} by {prd.modifiedBy}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <PRDEditor
              title={currentEditTitle}
              content={currentEditContent}
              onSave={handleSave}
              onSaveAsNewVersion={handleSaveAsNewVersion}
              onChange={handleEditorChange}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <PRDPreview title={currentEditTitle} content={currentEditContent} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <PRDVersionHistory
              versions={prd.versions}
              currentVersion={prd.currentVersion}
              onRestoreVersion={(version) => {
                // TODO: Implement version restoration
                console.log("Restoring version:", version);
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
