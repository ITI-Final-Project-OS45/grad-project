import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiError, ApiResponse, CreateDesignAssetDto, DesignAssetDto, UpdateDesignAssetDto } from '@repo/types';
import { Model } from 'mongoose';
import { CloudinaryService } from 'nestjs-cloudinary';
import { DesignAsset, DesignAssetDocument } from 'src/schemas/design-asset.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Workspace, WorkspaceDocument } from 'src/schemas/workspace.schema';

@Injectable()
export class DesignAssetService {
  constructor(
    @InjectModel(DesignAsset.name) private readonly DesignAssetModel: Model<DesignAssetDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService
  ){}

  async create(designAssetDto: DesignAssetDto, userId: string, file: Express.Multer.File): Promise<ApiResponse<DesignAsset, ApiError>> {
    const workspaceExists = await this.workspaceModel.findById(designAssetDto.workspaceId).exec();
    if (!workspaceExists) {
      throw new NotFoundException({
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Workspace not found',
        error: 'Workspace does not exist',
      });
    }
    
    const user = await this.userModel.findById(userId).exec();
    let url:string;
    if(file){
      const {secure_url} = await this.cloudinaryService.uploadFile(file);
      url = secure_url;
    }else{
      url = 'null' //todo add embed link
    }
      
    const createDesignAssetDto: CreateDesignAssetDto  = {...designAssetDto, assetUrl:url, uploadedBy:user!.username};
    
    const designAsset =  await this.DesignAssetModel.create(createDesignAssetDto);

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Desing asset created successfully',
      data: designAsset,
    }
      
  }

  async findAll(workspaceId: string) {
    return await this.DesignAssetModel.find({workspaceId: workspaceId});
  }

  async findOne(id: string) {
    return await this.DesignAssetModel.findById(id);
  }

  async update(id: string, updateDesignAsset: UpdateDesignAssetDto, file: Express.Multer.File) {
    console.log(updateDesignAsset);
    
    if(file){
      const {secure_url:assetUrl} = await this.cloudinaryService.uploadFile(file);
      return await this.DesignAssetModel.findByIdAndUpdate(id, { $set: {...updateDesignAsset, assetUrl} }, { new: true } );
    }else{
      return await this.DesignAssetModel.findByIdAndUpdate(id, { $set: updateDesignAsset }, { new: true } );
    }
  }

  async remove(id: string) {
    return await this.DesignAssetModel.findByIdAndDelete(id);
  }
}
