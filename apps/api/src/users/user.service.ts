import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserDocument, User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(
    userId: string,
    data: Partial<UserDto>,
  ): Promise<Partial<User>> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: data }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<string> {
    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return `The ${deletedUser.username} deleted successfully`;
  }
}
