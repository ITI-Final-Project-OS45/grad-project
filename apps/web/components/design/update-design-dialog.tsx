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
import { useDesign } from "@/hooks/use-designs";
import { DesignResponse } from "@repo/types";

export function UpdateDesignDialog( {workspacesId, editingDesign, open, setOpen }: {workspacesId: string, editingDesign: DesignResponse, open: boolean, setOpen: (open: boolean) => void }) {
    const form = useForm<ZDesignsFormData>({
        resolver: zodResolver(ZDesignsSchema),
        defaultValues: {
            type: editingDesign.type || "figma",
            description: editingDesign.description || "",
            assetUrl: editingDesign.assetUrl || "",
        }
    })

    // Reset form values when editingDesign changes
    React.useEffect(() => {
        form.reset({
            type: editingDesign.type || "figma",
            description: editingDesign.description || "",
            assetUrl: editingDesign.assetUrl || "",
        });
    }, [editingDesign]);

    const updateDesign = useDesign(workspacesId).updateDesign;
    const closeDialog = () => setOpen(false)

    const handleSubmit = async (data: ZDesignsFormData) => {
        const formData = new FormData();
        formData.append("type", data.type);
        formData.append("description", data.description || "");
        if (data.file && data.file.length > 0 && data.file[0]) {
            formData.append("file", data.file[0]);
        }else if (data.assetUrl !== undefined && data.assetUrl !== "") {
            formData.append("assetUrl", data.assetUrl);
        }


        try {
            form.reset(); // Clear the form fields after successful submit
            await updateDesign.mutateAsync({ designId: editingDesign._id, data: formData as any });
            closeDialog(); // Close the dialog after successful submit
        } catch (error) {
            console.error("Error creating design:", error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Design</DialogTitle>
                    <DialogDescription>
                        Update this design of your workspace. You can update a design by uploading a file or providing a Figma link.
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
                        <Button type="submit">Update</Button>
                    </DialogFooter>


                </form>          
            </DialogContent>

        </Dialog>
    )
}