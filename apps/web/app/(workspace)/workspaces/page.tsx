"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users, Calendar, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { InviteMembersDialog } from "@/components/workspace/invite-members-dialog";

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
const mockWorkspaces = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "Building a modern e-commerce solution with React and Node.js",
    members: 8,
    createdAt: "2024-01-15",
    role: "Manager",
    releases: 3,
  },
  {
    id: "2",
    name: "Mobile Banking App",
    description: "Secure mobile banking application for iOS and Android",
    members: 12,
    createdAt: "2024-02-01",
    role: "Developer",
    releases: 2,
  },
  {
    id: "3",
    name: "AI Dashboard",
    description: "Analytics dashboard with AI-powered insights",
    members: 6,
    createdAt: "2024-02-10",
    role: "Manager",
    releases: 1,
  },
];

export default function WorkspacesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  const filteredWorkspaces = mockWorkspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">Manage your project workspaces and collaborate with your team</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="w-fit">
          <Plus className="w-4 h-4" />
          Create Workspace
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search workspaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Workspaces Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkspaces.map((workspace) => (
          <motion.div
            key={workspace.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{workspace.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedWorkspace(workspace.id);
                        setShowInviteDialog(true);
                      }}
                    >
                      Invite Members
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Workspace</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Workspace</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{workspace.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={workspace.role === "Manager" ? "default" : "secondary"}>{workspace.role}</Badge>
                  <span className="text-sm text-muted-foreground">{workspace.releases} releases</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredWorkspaces.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <p className="text-muted-foreground">No workspaces found matching your search.</p>
        </motion.div>
      )}

      {/* Dialogs */}
      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      <InviteMembersDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} workspaceId={selectedWorkspace} />
    </motion.div>
  );
}
