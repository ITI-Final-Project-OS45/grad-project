"use client";

import { CreateDesignDialog } from '@/components/design/create-design-dialog';
import { UpdateDesignDialog } from '@/components/design/update-design-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDesign, useDesigns } from '@/hooks/use-designs'
import { DesignResponse } from '@repo/types';
import { useParams } from 'next/navigation';
import React from 'react'
import Link from 'next/link';
import { Edit, MoreHorizontal, Palette, Sparkles, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';


export default function DesignsPage() {

    const {id:workspaceId}: {id:string}  = useParams();


    const { data:designs , error, isLoading } = useDesigns(workspaceId);
    const {createDesign, updateDesign, deleteDesign} = useDesign(workspaceId)

    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [editingDesign, setEditingDesign] = React.useState<DesignResponse | null>(null);


    function onDeleteDesign(designId: string) {
        console.log("Delete design  of ID:", designId);
        deleteDesign.mutateAsync(designId)
    }

    function onEditDesign(designId: string) {
        const design = designs?.find((d) => d._id === designId) || null;
        setEditingDesign(design);
        setEditDialogOpen(true);
    }

    return (
        <div>
            <div
                // variants={headerVariants}
                className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50"
            >
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
                <div className="container mx-auto px-6 py-12 relative">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl  bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50">
                                <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <Badge variant="secondary" className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Project Visuals
                            </Badge>
                        </div>
                        <h1
                            className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
                            >
                            Your Brilliant{" "}
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Design Assets
                            </span>
                            <span
                                className="inline-block ml-2"
                            >
                                🖌️
                            </span>
                        </h1>
                        <p
                            className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl"
                            >
                            Collect, manage, and reuse your creative visuals in one place.
                            From logos to mockups, keep everything ready to spark your next big idea.
                        </p>
                        <div
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <div>
                        <CreateDesignDialog
                            workspacesId={workspaceId}
                            createDesign={createDesign}
                        />
                        {/* Edit Design Dialog */}
                        <UpdateDesignDialog
                            open={editDialogOpen}
                            onOpenChange={setEditDialogOpen}
                            design={editingDesign}
                            updateDesign={updateDesign}
                        />
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* main content: design cards */}
            <div className="px-96 mt-9">
                {isLoading && <div>Loading...</div>}
                {error && <div>Error loading designs: {error.message}</div>}
                {!isLoading && !error && designs && designs.length === 0 && <div>No designs found.</div>}

                

                <DesignsList>
                    {designs?.map((design) => (
                        <DesignItem
                            key={design._id}
                            design={design}
                            workspacesId={workspaceId}
                            onEditDesign={onEditDesign}
                            onDeleteDesign={onDeleteDesign}
                        />
                    ))}
                    {/* <UpdateDesignDialog /> */}
                    {/* <DeleteDesignDialog /> */}
                </DesignsList>

            </div>
        </div>
    )
}


export function DesignsList({ children }: { children: React.ReactNode }) {

    return (
        <div>  
            <div className="my-2">
                {children}
            </div>
            
        </div>
    );
}

export function DesignItem({ design, workspacesId, onEditDesign, onDeleteDesign, isDeleting }: { design: DesignResponse, workspacesId: string, onEditDesign: (designId: string) => void, onDeleteDesign: (designId: string) => void, isDeleting?: boolean }) {

    return (
        <Link href={`/workspaces/${workspacesId}/designs/${design._id}`}>
            <Card key={design._id} className="my-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-red-400">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>Design: {design._id}</CardTitle>
                            <CardDescription>
                                {design.type === "figma" ? "Figma Design" : "Mockup Design"}
                            </CardDescription>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={(event) =>{event.stopPropagation(); onEditDesign(design._id)}} className="text-sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                onClick={(event) =>{event.stopPropagation(); onDeleteDesign(design._id)}}
                                className="text-sm text-destructive focus:text-destructive"
                                disabled={isDeleting}
                                >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </CardHeader>
                <CardContent>
                    <div className="flex justify-between">
                        <div>{design.description}</div>
                        <div>
                            <img src={design.assetUrl} alt="" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}


