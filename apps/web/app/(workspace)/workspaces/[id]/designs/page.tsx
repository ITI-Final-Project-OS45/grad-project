"use client";

import { Dialog } from '@/components/ui/dialog';
import { useDesign, useDesigns } from '@/hooks/use-designs'
import { ZDesignsFormData, ZDesignsSchema } from '@/lib/schemas/design-schemas';
import { CreateDesingData } from '@/services/design.service';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';

export default function DesignsPage() {

    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const workspacesId = path.split('/')[2] || ''
    console.log(workspacesId);

    const [selectedType, setSelectedType] = React.useState("figma");

    

    const { data:designs , error, isLoading } = useDesigns(workspacesId);
    const {createDesign} = useDesign(workspacesId)
    console.log('[DesignPAge component] desingns:', designs);
    
    const form = useForm<ZDesignsFormData>({
        resolver: zodResolver(ZDesignsSchema)
    })

    useEffect(() => {
        setSelectedType(form.watch("type") ?? "figma");
    }, [form.watch("type")]);
    
    const handleSubmit = async (data: ZDesignsFormData) => {
        console.log("❓❓Form data submitted:", data);
        
        const formData = new FormData();
        formData.append("workspaceId", workspacesId);
        formData.append("type", data.type);
        formData.append("description", data.description || "");
        if (data.assetUrl) {
            formData.append("assetUrl", data.assetUrl);
        }

        if (data.file && data.file.length > 0 && data.file[0]) {
            formData.append("file", data.file[0]);
        }

        try {
            await createDesign.mutateAsync(formData as any);
        } catch (error) {
            console.error("Error creating design:", error);
        }
    }

    return (
        <div>  
            <h1 className="text-3xl">Desingns Page</h1>

            {/* to be dialog */}
            <div>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-4 p-4 border-1 border-white bg-gray-800 rounded-md"
                >
                    {/* Zod error messages */}
                    {form.formState.errors.type && (
                        <div className="text-red-500 text-sm mb-2">{form.formState.errors.type.message as string}</div>
                    )}
                    {form.formState.errors.description && (
                        <div className="text-red-500 text-sm mb-2">{form.formState.errors.description.message as string}</div>
                    )}
                    {form.formState.errors.assetUrl && (
                        <div className="text-red-500 text-sm mb-2">{form.formState.errors.assetUrl.message as string}</div>
                    )}
                    {form.formState.errors.file && (
                        <div className="text-red-500 text-sm mb-2">{form.formState.errors.file.message as string}</div>
                    )}
                    <select
                        // name="designType"
                        id="designType"
                        {...form.register("type")}
                    >
                        <option value="figma">Figma</option>
                        <option value="mockup">Mockup</option>
                    </select>
                    <textarea
                        {...form.register("description")}
                        id="description"
                        rows={4}
                        placeholder="description"
                        className="border-1 border-white"
                    />
                    {selectedType === "figma" && (
                        <div>
                            <input
                                type="text"
                                {...form.register("assetUrl")}
                                placeholder="Figma specific input"
                                className="border-1 border-white bg-red-400"
                            />
                        </div>
                    )}
                    {selectedType === "mockup" && (
                        <div className="flex flex-col mb-2">
                            <label htmlFor="mockup-file" className="mb-1 font-semibold">File</label>
                            <input
                                id="mockup-file"
                                type="file"
                                {...form.register("file")}
                                className="border-1 border-white bg-red-400"
                            />
                        </div>
                    )}
                    <button type="submit" className="border-1 border-white">
                        Create Design
                    </button>
                </form>
            </div>
            
            <iframe style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }} width="800" height="450" src="https://embed.figma.com/design/g4VkKaDaE8TMkp0JlnNFUI/Hotel-reservation?node-id=0-1&embed-host=share" allowFullScreen></iframe>

            {designs && designs.map((d)=>{
                // if (d.type === "figma") {
                //     return <iframe style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }} width="800" height="450" src="https://embed.figma.com/design/g4VkKaDaE8TMkp0JlnNFUI/Hotel-reservation?node-id=0-1&embed-host=share" allowFullScreen></iframe>
                // }
                return (
                    <div key={d._id} className="border-1 border-white p-4 my-2">
                        <div>{d.description}</div>
                        <div><img src={d.assetUrl} alt="" /></div>
                    </div>
                )
            })} 
        </div>
    )
}
