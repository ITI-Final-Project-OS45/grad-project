import { IsString, IsDate, IsMongoId, IsOptional, IsUrl } from "class-validator";

export class DessignAssetDto {
    // @IsString() //? @IsMongoId()
    // _id!: string;

    @IsString()
    workspaceId!: string;

    @IsString()
    type!: string; // Figma, Mockup

    @IsString()
    //? @IsOptional()
    uploadedBy!: string; // users.username

    // @IsDate()
    // uploadedAt!: Date;
    
    @IsString()
    version!: string;
    
    @IsString()
    description!: string;
}