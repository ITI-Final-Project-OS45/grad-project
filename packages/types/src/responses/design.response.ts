export interface DesignResponse {
    _id: string;

    workspaceId: string;
    type: string; // Figma, Mockup
    assetUrl: string;
    uploadedBy: string; // users.username    
    version: string;    
    description: string;

    createdAt: string;
    updatedAt: string;
}