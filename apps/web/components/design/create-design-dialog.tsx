'use client';

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ZDesignsFormData } from "@/lib/schemas/design-schemas"
import { ZDesignsSchema } from "@/lib/schemas/design-schemas"
import { useForm, Controller } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Plus } from "lucide-react"
import React, { useState } from "react";

export function CreateDesignDialog( {workspacesId, createDesign}: {workspacesId: string, createDesign: any } /* { form, handleSubmit }: { form: ReturnType<typeof useForm<ZDesignsFormData>>, handleSubmit: (data: ZDesignsFormData) => void} */) {

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<ZDesignsFormData>({
        resolver: zodResolver(ZDesignsSchema),
        defaultValues: {
            type: "figma", // Default to figma
            description: "",
        }
    })

     const closeDialog = () => setOpen(false)

    const handleSubmit = async (data: ZDesignsFormData) => {
        setLoading(true)
        const formData = new FormData();
        formData.append("workspaceId", workspacesId);
        formData.append("type", data.type);
        formData.append("description", data.description || "");
        if (data.assetUrl !== undefined && data.assetUrl !== "") {
            formData.append("assetUrl", data.assetUrl);
        }

        if (data.file && data.file.length > 0 && data.file[0]) {
            formData.append("file", data.file[0]);
        }

        try {
            form.reset(); // Clear the form fields after successful submit

            await createDesign.mutateAsync(formData as any);
            closeDialog(); // Close the dialog after successful submit
        } catch (error) {
            console.error("Error creating design:", error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* <Button variant="outline">Create New Design</Button> */}
                <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                >
                    <div className="mr-2">
                        <Plus className="h-5 w-5" />
                    </div>
                    Create New Design
                    <div
                        className="ml-2"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </div>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Design</DialogTitle>
                    <DialogDescription>
                        Create a new design for your workspace. You can create a design by uploading a file or providing a Figma link.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    
                    {/* form controls */}
                    <div className="grid gap-4">
                        {/* type */}
                        <div className="grid gap-3">
                            <Label htmlFor="designType">Design Type</Label>
                            <Controller
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-[180px]" id="designType">
                                            <SelectValue placeholder="Select a design type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Design Types</SelectLabel>
                                                <SelectItem value="figma">Figma</SelectItem>
                                                <SelectItem value="mockup">Mockup</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* description */}
                        <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                {...form.register("description")}
                                id="description"
                                placeholder="description"
                            />
                        </div>

                        {/* assetUrl */}
                        <div className="grid gap-3">
                            {form.watch("type") === "figma" && (
                                <>
                                    <Label htmlFor="assetUrl">Figma URL</Label>
                                    <Input
                                        id="assetUrl"
                                        type="text"
                                        {...form.register("assetUrl")}
                                        placeholder="Figma specific input"
                                    />
                                </>
                            )}
                            {form.watch("type") === "mockup" && (
                                <>
                                    <Label htmlFor="mockup-file">File</Label>
                                    <Input
                                        id="mockup-file"
                                        type="file"
                                        {...form.register("file")}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Zod error messages */}
                    {form.formState.errors.type && (
                        <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">{form.formState.errors.type.message as string}</div>
                    )}
                    {form.formState.errors.description && (
                        <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">{form.formState.errors.description.message as string}</div>
                    )}
                    {form.formState.errors.assetUrl && (
                        <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">{form.formState.errors.assetUrl.message as string}</div>
                    )}
                    {form.formState.errors.file && (
                        <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">{form.formState.errors.file.message as string}</div>
                    )}
                
                    <DialogFooter className="mt-4"> 
                        <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
                    </DialogFooter>


                </form>          
            </DialogContent>

        </Dialog>
    )
}