export interface DesignResponse {
    
    type: string; // Figma, Mockup
    description: string;
    assetUrl: string;
    
    workspaceId: string;
    
    uploadedBy: string; // users.username    
    // version: string;    
    
    _id: string;
    createdAt: string;
    updatedAt: string;
}