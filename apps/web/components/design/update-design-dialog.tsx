import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ZDesignsFormData } from "@/lib/schemas/design-schemas";
import { ZDesignsSchema } from "@/lib/schemas/design-schemas";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { DesignResponse } from "@repo/types";
import React from "react";

export function UpdateDesignDialog({
  open,
  onOpenChange,
  design,
  updateDesign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  design: DesignResponse | null;
  updateDesign: any;
}) {
  const form = useForm<ZDesignsFormData>({
    resolver: zodResolver(ZDesignsSchema),
    defaultValues: design
      ? {
          type: design.type === "figma" || design.type === "mockup" ? design.type : "figma",
          description: design.description || "",
          assetUrl: design.assetUrl || "",
          file: undefined,
        }
      : {
          type: "figma",
          description: "",
          assetUrl: "",
          file: undefined,
        },
  });

  React.useEffect(() => {
    if (design) {
      form.reset({
        type: design.type === "figma" || design.type === "mockup" ? design.type : "figma",
        description: design.description || "",
        assetUrl: design.assetUrl || "",
        file: undefined,
      });
    }
  }, [design]);

  const handleSubmit = async (data: ZDesignsFormData) => {
    if (!design) return;
    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("description", data.description || "");
    if (data.assetUrl !== undefined && data.assetUrl !== "") {
      formData.append("assetUrl", data.assetUrl);
    }
    if (data.file && data.file.length > 0 && data.file[0]) {
      formData.append("file", data.file[0]);
    }
    try {
      await updateDesign.mutateAsync({ id: design._id, data: formData });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating design:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Design</DialogTitle>
          <DialogDescription>
            Update your design details. You can change the type, description, or asset.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="designType">Design Type</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...form.register("description")}
                id="description"
                placeholder="description"
              />
            </div>
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
          {form.formState.errors.type && (
            <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">
              {form.formState.errors.type.message as string}
            </div>
          )}
          {form.formState.errors.description && (
            <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">
              {form.formState.errors.description.message as string}
            </div>
          )}
          {form.formState.errors.assetUrl && (
            <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">
              {form.formState.errors.assetUrl.message as string}
            </div>
          )}
          {form.formState.errors.file && (
            <div className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20 mt-5">
              {form.formState.errors.file.message as string}
            </div>
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
  );
}
