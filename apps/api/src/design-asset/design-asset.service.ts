import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DessignAssetDto } from '@repo/types';
import { Model } from 'mongoose';
import { DesignAsset, DesignAssetDocument } from 'src/schemas/design-asset.schema';

@Injectable()
export class DesignAssetService {
  constructor(
    @InjectModel(DesignAsset.name) private readonly DesignAssetModel: Model<DesignAssetDocument>,
  ){}

  create(createDesignAssetDto: DessignAssetDto) {
    //todo: upload the file to cloudinary and get the link and append the link to the 
    const assetUrl:string = 'https://assets.justinmind.com/wp-content/uploads/2020/02/free-website-mockups-lawyer.png'
    const theDocument = {...createDesignAssetDto, assetUrl};

    return this.DesignAssetModel.create(theDocument);
  }

  findAll() {
    return `This action returns all designAsset`;
  }

  findOne(id: number) {
    return `This action returns a #${id} designAsset`;
  }

  update(id: number, updateDesignAssetDto: DessignAssetDto) {
    return `This action updates a #${id} designAsset:\n${updateDesignAssetDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} designAsset`;
  }
}
