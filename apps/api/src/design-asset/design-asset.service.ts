import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiError, ApiResponse, CreateDesignAssetDto, DesignAssetDto, UpdateDesignAssetDto, UserRole } from '@repo/types';
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
    const member = workspaceExists.members.find(member => member.userId.toString() === userId);
    if (!member || (member.role !== UserRole.Designer && member.role !== UserRole.Manager)) {
      throw new ForbiddenException({
        success: false,
        status: HttpStatus.FORBIDDEN,
        message: 'User is not a designer or manager',
        error: 'User does not have permission to create design assets',
      });
    }

    let url:string;
    if(file){
      const {secure_url} = await this.cloudinaryService.uploadFile(file);
      url = secure_url;
    }else{
      url = designAssetDto?.assetUrl || ''; //todo add embed link
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
    const data = await this.DesignAssetModel.find({workspaceId: workspaceId});
    return {
      success: true,
      status: HttpStatus.FOUND,
      message: 'data gotten successfully',
      data: data,
    }
  }

  async findOne(id: string) {
    const data = await this.DesignAssetModel.findById(id);
    return {
      success: true,
      status: HttpStatus.FOUND,
      message: 'data gotten successfully',
      data: data,
    }
  }

  async update(id: string, updateDesignAsset: UpdateDesignAssetDto, file: Express.Multer.File, userId: string) {
    console.log(updateDesignAsset);
    let data: DesignAssetDocument | null

    // is the user the uploader of the design asset?
    const user = await this.userModel.findById(userId).exec();
    const designAsset = await this.DesignAssetModel.findById(id).exec();
    const uploadedBy = designAsset?.uploadedBy;
    if (user?.username !== uploadedBy) {
      throw new ForbiddenException({
        success: false,
        status: HttpStatus.FORBIDDEN,
        message: 'User is not the uploader',
        error: 'User does not have permission to update this design asset',
      });
    }

    let url:string;
    if(file){
      const {secure_url} = await this.cloudinaryService.uploadFile(file);
      url = secure_url;
    }else{
      url = updateDesignAsset?.assetUrl || ''; //todo add embed link
    }
    data = await this.DesignAssetModel.findByIdAndUpdate(id, { $set: {...updateDesignAsset, assetUrl:url} }, { new: true } );

    return {
      success: true,
      status: HttpStatus.FOUND,
      message: 'data gotten successfully',
      data: data,
    }
  }

  async remove(id: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    const designAsset = await this.DesignAssetModel.findById(id).exec();

    // does the design asset exist?
    if (!designAsset) {
      throw new NotFoundException({
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Design asset not found',
        error: 'Design asset does not exist',
      });
    }

    // is the user the uploader of the design asset?
    const uploadedBy = designAsset?.uploadedBy;
    if (user?.username !== uploadedBy) {
      throw new ForbiddenException({
        success: false,
        status: HttpStatus.FORBIDDEN,
        message: 'User is not the uploader',
        error: 'User does not have permission to update this design asset',
      });
    }


    const data = await this.DesignAssetModel.findByIdAndDelete(id);

    return {
      success: true,
      status: HttpStatus.FOUND,
      message: 'data gotten successfully',
      data: data,
    }
  }
}
