import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  displayName: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  workspaces: [],
};

const userModelMock = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('findOneUser', () => {
    it('should throw ForbiddenException if requester is not user', async () => {
      await expect(service.findOneUser('id1', 'id2')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOneUser('invalid', 'invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModelMock.findById.mockReturnValueOnce({ select: () => ({ populate: () => ({ lean: () => ({ exec: () => null }) }) }) });
      await expect(service.findOneUser('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });

    it('should return user if found', async () => {
      userModelMock.findById.mockReturnValueOnce({
        select: () => ({
          populate: () => ({
            lean: () => ({
              exec: () => mockUser,
            }),
          }),
        }),
      });
      const result = await service.findOneUser('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439011');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });
  });

  // Add similar tests for updateUser and deleteUser as needed
});
