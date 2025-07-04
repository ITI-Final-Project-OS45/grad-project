/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from '../schemas/user.schema';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthGuard } from '../guards/auth.guards';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';

interface MockModel<T> extends Partial<Model<T>> {
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  exec: jest.Mock;
  select: jest.Mock;
  populate: jest.Mock;
  lean: jest.Mock;
}

describe('UserService', () => {
  let service: UserService;
  let userModel: MockModel<UserDocument>;

  const mockUserId = new Types.ObjectId().toString();
  const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    displayName: 'Test User',
    email: 'test@example.com',
    workspaces: [],
    password: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userModel = module.get<MockModel<UserDocument>>(getModelToken(User.name));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findOneUser', () => {
    it('should throw ForbiddenException if requesterId !== userId', async () => {
      await expect(service.findOneUser('id1', 'id2')).rejects.toThrow(ForbiddenException);
    });
    it('should throw BadRequestException for invalid userId', async () => {
      await expect(service.findOneUser('invalid', 'invalid')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOneUser(mockUserId, mockUserId)).rejects.toThrow(NotFoundException);
    });
    it('should throw if userModel.findById throws', async () => {
      userModel.findById.mockImplementation(() => { throw new Error('DB error'); });
      await expect(service.findOneUser(mockUserId, mockUserId)).rejects.toThrow('DB error');
    });
    it('should return user if found', async () => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.findOneUser(mockUserId, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
    it('should return correct status and message on success', async () => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.findOneUser(mockUserId, mockUserId);
      expect(result.status).toBe(200);
      expect(result.message).toBe('User retrieved successfully');
    });
    it('should return user with populated workspaces', async () => {
      const userWithWorkspaces = { ...mockUser, workspaces: [{ _id: 'w1' }, { _id: 'w2' }] };
      userModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(userWithWorkspaces),
      });
      const result = await service.findOneUser(mockUserId, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data?.workspaces.length).toBe(2);
    });
  });

  describe('updateUser', () => {
    it('should throw ForbiddenException if requesterId !== userId', async () => {
      await expect(service.updateUser('id1', {}, 'id2')).rejects.toThrow(ForbiddenException);
    });
    it('should throw BadRequestException for invalid userId', async () => {
      await expect(service.updateUser('invalid', {}, 'invalid')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if user not found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.updateUser(mockUserId, {}, mockUserId)).rejects.toThrow(NotFoundException);
    });
    it('should throw if userModel.findByIdAndUpdate throws', async () => {
      userModel.findByIdAndUpdate.mockImplementation(() => { throw new Error('DB error'); });
      await expect(service.updateUser(mockUserId, {}, mockUserId)).rejects.toThrow('DB error');
    });
    it('should return updated user if found', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.updateUser(mockUserId, { displayName: 'New Name' }, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
    it('should return correct status and message on success', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.updateUser(mockUserId, { displayName: 'New Name' }, mockUserId);
      expect(result.status).toBe(200);
      expect(result.message).toBe('User updated successfully');
    });
    it('should update user with empty data object', async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.updateUser(mockUserId, {}, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
    it('should update user with partial data', async () => {
      const partial = { displayName: 'Partial Name' };
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockUser, ...partial }),
      });
      const result = await service.updateUser(mockUserId, partial, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBe('Partial Name');
    });
  });

  describe('deleteUser', () => {
    it('should throw ForbiddenException if requesterId !== userId', async () => {
      await expect(service.deleteUser('id1', 'id2')).rejects.toThrow(ForbiddenException);
    });
    it('should throw BadRequestException for invalid userId', async () => {
      await expect(service.deleteUser('invalid', 'invalid')).rejects.toThrow(BadRequestException);
    });
    it('should throw NotFoundException if user not found', async () => {
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.deleteUser(mockUserId, mockUserId)).rejects.toThrow(NotFoundException);
    });
    it('should throw if userModel.findByIdAndDelete throws', async () => {
      userModel.findByIdAndDelete.mockImplementation(() => { throw new Error('DB error'); });
      await expect(service.deleteUser(mockUserId, mockUserId)).rejects.toThrow('DB error');
    });
    it('should return success if user deleted', async () => {
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.deleteUser(mockUserId, mockUserId);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
    it('should return correct status and message on success', async () => {
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.deleteUser(mockUserId, mockUserId);
      expect(result.status).toBe(200);
      expect(result.message).toBe('User deleted successfully');
    });
  });
});

describe('UserController', () => {
  let controller: UserController;
  const mockUserService = {
    findOneUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  const req = { userId: 'user123' } as RequestWithUser;
  const userId = 'user123';
  const userDto = { displayName: 'Test' };
  const userResponse = { success: true, data: { _id: userId }, status: 200, message: 'ok' };

  describe('findOneUser', () => {
    it('should return user on success', async () => {
      mockUserService.findOneUser.mockResolvedValue(userResponse);
      const result = await controller.findOneUser(userId, req);
      expect(result).toEqual(userResponse);
      expect(mockUserService.findOneUser).toHaveBeenCalledWith(userId, req.userId);
    });
    it('should throw error from service', async () => {
      mockUserService.findOneUser.mockRejectedValue(new NotFoundException());
      await expect(controller.findOneUser(userId, req)).rejects.toThrow(NotFoundException);
    });
    it('should throw BadRequest if userId is missing', async () => {
      await expect(controller.findOneUser(undefined as any, { userId: 'user123' } as any)).rejects.toThrow();
    });
    it('should propagate generic error from service', async () => {
      mockUserService.findOneUser.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.findOneUser(userId, req)).rejects.toThrow('Unexpected');
    });
  });

  describe('updateUser', () => {
    it('should return updated user on success', async () => {
      mockUserService.updateUser.mockResolvedValue(userResponse);
      const result = await controller.updateUser(userId, userDto, req);
      expect(result).toEqual(userResponse);
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, userDto, req.userId);
    });
    it('should throw error from service', async () => {
      mockUserService.updateUser.mockRejectedValue(new ForbiddenException());
      await expect(controller.updateUser(userId, userDto, req)).rejects.toThrow(ForbiddenException);
    });
    it('should propagate generic error from service', async () => {
      mockUserService.updateUser.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.updateUser(userId, userDto, req)).rejects.toThrow('Unexpected');
    });
  });

  describe('deleteUser', () => {
    it('should return success on delete', async () => {
      mockUserService.deleteUser.mockResolvedValue(userResponse);
      const result = await controller.deleteUser(userId, req);
      expect(result).toEqual(userResponse);
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId, req.userId);
    });
    it('should throw error from service', async () => {
      mockUserService.deleteUser.mockRejectedValue(new BadRequestException());
      await expect(controller.deleteUser(userId, req)).rejects.toThrow(BadRequestException);
    });
    it('should propagate generic error from service', async () => {
      mockUserService.deleteUser.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.deleteUser(userId, req)).rejects.toThrow('Unexpected');
    });
    it('should return correct status code in response', async () => {
      mockUserService.deleteUser.mockResolvedValue({ ...userResponse, status: 204 });
      const result = await controller.deleteUser(userId, req);
      expect(result.status).toBe(204);
    });
  });
}); 