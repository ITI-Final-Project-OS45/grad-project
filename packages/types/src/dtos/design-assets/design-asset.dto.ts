import { IsMongoId, IsOptional, IsString, IsUrl } from "class-validator";
import { DesignAssetType } from "../../enums";

export class DesignAssetDto {
    @IsMongoId()
    workspaceId!: string;

    @IsString()
    type!: DesignAssetType; // Figma, Mockup
    
    @IsString()
    description!: string;

    @IsUrl()
    @IsOptional()
    assetUrl?: string;

    @IsOptional()
    file?: File; // This will be used for file uploads, e.g., mockup images
}

export class CreateDesignAssetDto extends DesignAssetDto {
    @IsString()
    uploadedBy!: string;
}

export class UpdateDesignAssetDto  {
    @IsString()
    @IsOptional()
    type?: DesignAssetType; // Figma, Mockup
    
    @IsOptional()
    @IsString()
    description!: string;

    @IsOptional()
    @IsUrl()
    assetUrl?: string;
}

