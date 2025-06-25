import { IsMongoId, IsOptional, IsString, IsUrl } from "class-validator";

export class DesignAssetDto {
    @IsMongoId()
    workspaceId!: string;

    @IsString()
    type!: string; // Figma, Mockup

    
    @IsString()
    version!: string;
    
    @IsString()
    description!: string;
}

export class CreateDesignAssetDto extends DesignAssetDto {
    @IsString()
    uploadedBy!: string;

    @IsUrl()
    assetUrl!: string;
}

export class UpdateDesignAssetDto  {
    @IsString()
    @IsOptional()
    type?: string; // Figma, Mockup
    
    @IsOptional()
    @IsString()
    version!: string;
    
    @IsOptional()
    @IsString()
    description!: string;

    @IsOptional()
    @IsUrl()
    assetUrl?: string;
}

