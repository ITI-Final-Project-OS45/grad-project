import { IsMongoId, IsOptional, IsString, IsUrl } from "class-validator";

export class DesignAssetDto {
    @IsMongoId()
    workspaceId!: string;

    @IsString()
    type!: string; // Figma, Mockup
    
    @IsString()
    description!: string;

    @IsUrl()
    @IsOptional()
    assetUrl?: string;
}

export class CreateDesignAssetDto extends DesignAssetDto {
    @IsString()
    uploadedBy!: string;
}

export class UpdateDesignAssetDto  {
    @IsString()
    @IsOptional()
    type?: string; // Figma, Mockup
    
    @IsOptional()
    @IsString()
    description!: string;

    @IsOptional()
    @IsUrl()
    assetUrl?: string;
}

