import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { DesignAssetType } from "@repo/types";
import { Document, Types } from "mongoose";

export interface DesignAssetDocument extends DesignAsset, Document {
    createdAt: Date;
    updatedAt: Date;
}

@Schema({ timestamps: true })
export class DesignAsset {
    @Prop({ required:true, type: Types.ObjectId, ref: 'Workspace' })
    workspaceId!: Types.ObjectId;

    @Prop({type: String, required:true, enum: DesignAssetType})
    type!: string; // Figma, Mockup

    @Prop({type: String, required: true})
    assetUrl!: string;

    @Prop({type: String})
    uploadedBy!: string; // users.username
    
    @Prop({type: String})
    description!: string;
}

export const DesignAssetSchema = SchemaFactory.createForClass(DesignAsset);