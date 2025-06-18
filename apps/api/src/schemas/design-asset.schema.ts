import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export interface DesignAssetDocument extends DesignAsset, Document {
    createdAt: Date;
    updatedAt: Date;
}

@Schema({ timestamps: true })
export class DesignAsset {
    @Prop({ required:true, type: Types.ObjectId, ref: 'Workspace' })
    workspaceId!: Types.ObjectId;

    @Prop({type: String, required:true})
    type!: string; // Figma, Mockup

    @Prop({type: String, required: true})
    assetUrl!: string;

    @Prop({type: String})
    uploadedBy!: string; // users.username

    // @Prop()
    // uploadedAt!: Date;
    
    @Prop({type: String, required: true})
    version!: string;
    
    @Prop({type: String})
    description!: string;
}

export const DesignAssetSchema = SchemaFactory.createForClass(DesignAsset);