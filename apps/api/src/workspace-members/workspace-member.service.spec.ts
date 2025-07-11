/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceMemberService } from './workspace-member.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { WorkspaceMember } from '../schemas/workspace-member.schema';
import { 
  BadRequestException, 
  NotFoundException, 
  InternalServerErrorException,
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@repo/types';

interface MockModel<T> extends Partial<Model<T>> {
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findOneAndUpdate: jest.Mock;
  updateOne: jest.Mock;
  findOne: jest.Mock;
  exec: jest.Mock;
  select: jest.Mock;
  populate: jest.Mock;
  lean: jest.Mock;
}

function mockExecResolvedValue(value: any) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

function mockPopulateChain(returnValue: any) {
  const exec = jest.fn().mockResolvedValue(returnValue);
  const populate = jest.fn().mockReturnThis();
  return { populate, exec };
}

describe('WorkspaceMemberService', () => {
  let service: WorkspaceMemberService;
  let workspaceModel: MockModel<WorkspaceDocument>;
  let userModel: MockModel<UserDocument>;
  let jwtService: JwtService;

  const mockUserId = new Types.ObjectId().toString();
  const mockWorkspaceId = new Types.ObjectId().toString();
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

  const mockWorkspace = {
    _id: mockWorkspaceId,
    name: 'Test Workspace',
    description: 'Test Description',
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMember: WorkspaceMember = {
    userId: mockUserId,
    role: UserRole.Manager,
    joinedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMemberService,
        {
          provide: getModelToken(Workspace.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceMemberService>(WorkspaceMemberService);
    workspaceModel = module.get<MockModel<WorkspaceDocument>>(getModelToken(Workspace.name));
    userModel = module.get<MockModel<UserDocument>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addMember', () => {
    it('should throw BadRequestException for invalid workspace ID', async () => {
      await expect(service.addMember('invalid', 'testuser', UserRole.Designer))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid user role', async () => {
      await expect(service.addMember(mockWorkspaceId, 'testuser', 'INVALID_ROLE' as UserRole))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addMember(mockWorkspaceId, 'nonexistent', UserRole.Manager))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if workspace not found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is already a member', async () => {
      const workspaceWithMember = {
        ...mockWorkspace,
        members: [{ userId: new Types.ObjectId(mockUserId), role: UserRole.Developer }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(workspaceWithMember),
      });

      await expect(service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if adding member fails', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should successfully add member to workspace', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [mockMember],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer);

      expect(result.success).toBe(true);
      expect(result.status).toBe(202);
      expect(result.message).toBe('Member added successfully');
      expect(result.data?.userId).toBe(mockUserId);
      expect(result.data?.role).toBe(UserRole.Developer);
    });

    it('should find user by email', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockWorkspace, members: [mockMember] }),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.addMember(mockWorkspaceId, 'test@example.com', UserRole.Developer);

      expect(userModel.findOne).toHaveBeenCalledWith({
        $or: [{ username: 'test@example.com' }, { email: 'test@example.com' }],
      });
    });

    it('should add workspace to user workspaces array', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockWorkspace, members: [mockMember] }),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer);

      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId, workspaces: { $ne: mockWorkspaceId } },
        { $push: { workspaces: mockWorkspaceId } }
      );
    });

    it('should throw if userModel.findOne throws', async () => {
      userModel.findOne.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer))
        .rejects.toThrow('DB error');
    });

    it('should throw if workspaceModel.findById throws', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.addMember(mockWorkspaceId, 'testuser', UserRole.Developer))
        .rejects.toThrow('DB error');
    });

    it('should successfully add member with Manager role', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [{ ...mockMember, role: UserRole.Manager }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.addMember(mockWorkspaceId, 'testuser', UserRole.Manager);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.Manager);
    });

    it('should successfully add member with Designer role', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [{ ...mockMember, role: UserRole.Designer }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.addMember(mockWorkspaceId, 'testuser', UserRole.Designer);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.Designer);
    });

    it('should successfully add member with QA role', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [{ ...mockMember, role: UserRole.QA }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });
      workspaceModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.addMember(mockWorkspaceId, 'testuser', UserRole.QA);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.QA);
    });
  });

  describe('updateMember', () => {
    it('should throw BadRequestException for invalid workspace ID', async () => {
      await expect(service.updateMember('invalid', 'testuser', UserRole.Manager))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid user role', async () => {
      await expect(service.updateMember(mockWorkspaceId, 'testuser', 'INVALID_ROLE' as UserRole))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateMember(mockWorkspaceId, 'nonexistent', UserRole.Manager))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateMember(mockWorkspaceId, 'testuser', UserRole.Manager))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should successfully update member role', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [{ ...mockMember, role: UserRole.Manager }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });

      const result = await service.updateMember(mockWorkspaceId, 'testuser', UserRole.Manager);

      expect(result.success).toBe(true);
      expect(result.status).toBe(202);
      expect(result.message).toBe('Member role updated successfully');
      expect(result.data?.userId).toBe(mockUserId);
      expect(result.data?.role).toBe(UserRole.Manager);
    });

    it('should handle ObjectId conversion for userId', async () => {
      const userWithStringId = { ...mockUser, _id: mockUserId };
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithStringId),
      });
      workspaceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });

      await service.updateMember(mockWorkspaceId, 'testuser', UserRole.Manager);

      expect(workspaceModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockWorkspaceId },
        { $set: { 'members.$[elem].role': UserRole.Manager } },
        { arrayFilters: [{ 'elem.userId': expect.any(Types.ObjectId) }], new: true }
      );
    });

    it('should successfully update member to Designer role', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [{ ...mockMember, role: UserRole.Designer }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });

      const result = await service.updateMember(mockWorkspaceId, 'testuser', UserRole.Designer);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.Designer);
    });

    it('should successfully update member to QA role', async () => {
      const updatedWorkspace = {
        ...mockWorkspace,
        members: [{ ...mockMember, role: UserRole.QA }],
      };

      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWorkspace),
      });

      const result = await service.updateMember(mockWorkspaceId, 'testuser', UserRole.QA);

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe(UserRole.QA);
    });

    it('should throw if userModel.findOne throws', async () => {
      userModel.findOne.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.updateMember(mockWorkspaceId, 'testuser', UserRole.Manager))
        .rejects.toThrow('DB error');
    });

    it('should throw if workspaceModel.findOneAndUpdate throws', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.findOneAndUpdate.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.updateMember(mockWorkspaceId, 'testuser', UserRole.Manager))
        .rejects.toThrow('DB error');
    });
  });

  describe('deleteMember', () => {
    it('should throw BadRequestException for invalid workspace ID', async () => {
      await expect(service.deleteMember('invalid', 'testuser'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteMember(mockWorkspaceId, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteMember(mockWorkspaceId, 'testuser'))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should successfully delete member from workspace', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.deleteMember(mockWorkspaceId, 'testuser');

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe('User deleted from the workspace successfully');
      expect(result.data).toBeNull();
    });

    it('should remove workspace from user workspaces array', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.deleteMember(mockWorkspaceId, 'testuser');

      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        { $pull: { workspaces: mockWorkspaceId } }
      );
    });

    it('should handle ObjectId conversion for userId', async () => {
      const userWithStringId = { ...mockUser, _id: mockUserId };
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithStringId),
      });
      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });
      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.deleteMember(mockWorkspaceId, 'testuser');

      expect(workspaceModel.updateOne).toHaveBeenCalledWith(
        { _id: mockWorkspaceId },
        { $pull: { members: { userId: expect.any(Types.ObjectId) } } }
      );
    });

    it('should throw if userModel.findOne throws', async () => {
      userModel.findOne.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.deleteMember(mockWorkspaceId, 'testuser'))
        .rejects.toThrow('DB error');
    });

    it('should throw if workspaceModel.updateOne throws', async () => {
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      workspaceModel.updateOne.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.deleteMember(mockWorkspaceId, 'testuser'))
        .rejects.toThrow('DB error');
    });
  });

  describe('getAllWorkspaceMembers', () => {
    it('should throw BadRequestException for invalid workspace ID', async () => {
      await expect(service.getAllWorkspaceMembers('invalid'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if workspace not found', async () => {
      workspaceModel.findById.mockReturnValue(mockPopulateChain(null));

      await expect(service.getAllWorkspaceMembers(mockWorkspaceId))
        .rejects.toThrow(NotFoundException);
    });

    it('should successfully return workspace members', async () => {
      const workspaceWithMembers = {
        ...mockWorkspace,
        members: [
          {
            userId: {
              _id: mockUserId,
              username: 'testuser',
              displayName: 'Test User',
              email: 'test@example.com',
            },
            role: UserRole.Developer,
            joinedAt: new Date(),
          },
        ],
      };

      workspaceModel.findById.mockReturnValue(mockPopulateChain(workspaceWithMembers));

      const result = await service.getAllWorkspaceMembers(mockWorkspaceId);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe('Members found successfully');
      expect(result.data).toEqual(workspaceWithMembers.members);
    });

    it('should populate member userId with correct fields', async () => {
      workspaceModel.findById.mockReturnValue(mockPopulateChain(mockWorkspace));

      await service.getAllWorkspaceMembers(mockWorkspaceId);

      expect(workspaceModel.findById).toHaveBeenCalledWith(mockWorkspaceId);
      expect(workspaceModel.findById().populate).toHaveBeenCalledWith({
        path: 'members.userId',
        select: 'username displayName email',
      });
    });

    it('should return empty members array if no members', async () => {
      workspaceModel.findById.mockReturnValue(mockPopulateChain(mockWorkspace));

      const result = await service.getAllWorkspaceMembers(mockWorkspaceId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should throw if workspaceModel.findById throws', async () => {
      workspaceModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.getAllWorkspaceMembers(mockWorkspaceId))
        .rejects.toThrow('DB error');
    });
  });

  describe('getOneMemberByWorkspace', () => {
    it('should throw BadRequestException for invalid workspace ID', async () => {
      await expect(service.getOneMemberByWorkspace('invalid', mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if workspace not found', async () => {
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getOneMemberByWorkspace(mockWorkspaceId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if member not found in workspace', async () => {
      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });

      await expect(service.getOneMemberByWorkspace(mockWorkspaceId, mockUserId))
        .rejects.toThrow(NotFoundException);
    });

    it('should successfully return workspace member', async () => {
      const workspaceWithMember = {
        ...mockWorkspace,
        members: [{ userId: new Types.ObjectId(mockUserId), role: UserRole.Developer, joinedAt: new Date() }],
      };

      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(workspaceWithMember),
      });

      const result = await service.getOneMemberByWorkspace(mockWorkspaceId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(result.message).toBe('Member found successfully');
      expect(result.data).toEqual(workspaceWithMember.members[0]);
    });

    it('should handle string userId comparison', async () => {
      const workspaceWithMember = {
        ...mockWorkspace,
        members: [{ userId: mockUserId, role: UserRole.Developer, joinedAt: new Date() }],
      };

      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(workspaceWithMember),
      });

      const result = await service.getOneMemberByWorkspace(mockWorkspaceId, mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(workspaceWithMember.members[0]);
    });

    it('should throw if workspaceModel.findById throws', async () => {
      workspaceModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.getOneMemberByWorkspace(mockWorkspaceId, mockUserId))
        .rejects.toThrow('DB error');
    });
  });

  describe('private methods', () => {
    describe('isValidUserRole', () => {
      it('should not throw for valid user roles', () => {
        expect(() => service['isValidUserRole'](UserRole.Developer)).not.toThrow();
        expect(() => service['isValidUserRole'](UserRole.Manager)).not.toThrow();
        expect(() => service['isValidUserRole'](UserRole.Manager)).not.toThrow();
      });

      it('should throw BadRequestException for invalid user role', () => {
        expect(() => service['isValidUserRole']('INVALID_ROLE')).toThrow(BadRequestException);
      });
    });

    describe('getMemberId', () => {
      it('should throw UnauthorizedException for invalid token', () => {
        jwtService.verify = jest.fn().mockReturnValue({});

        expect(() => service['getMemberId']('Bearer invalid-token')).toThrow(UnauthorizedException);
      });

      it('should return userId from valid token', () => {
        jwtService.verify = jest.fn().mockReturnValue({ userId: mockUserId });

        const result = service['getMemberId'](`Bearer valid-token`);

        expect(result).toBe(mockUserId);
      });

      it('should handle token without Bearer prefix', () => {
        jwtService.verify = jest.fn().mockReturnValue({ userId: mockUserId });

        const result = service['getMemberId'](`valid-token`);

        expect(result).toBe(mockUserId);
      });
    });

    describe('isValidId', () => {
      it('should not throw for valid ObjectId', () => {
        expect(() => service['isValidId'](mockUserId)).not.toThrow();
      });

      it('should throw NotFoundException for invalid ObjectId', () => {
        expect(() => service['isValidId']('invalid')).toThrow(NotFoundException);
      });
    });

    describe('getUser', () => {
      it('should throw NotFoundException if user not found', async () => {
        userModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(service['getUser']('nonexistent')).rejects.toThrow(NotFoundException);
      });

      it('should return user if found by username', async () => {
        userModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        });

        const result = await service['getUser']('testuser');

        expect(result).toEqual(mockUser);
        expect(userModel.findOne).toHaveBeenCalledWith({
          $or: [{ username: 'testuser' }, { email: 'testuser' }],
        });
      });

      it('should return user if found by email', async () => {
        userModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        });

        const result = await service['getUser']('test@example.com');

        expect(result).toEqual(mockUser);
        expect(userModel.findOne).toHaveBeenCalledWith({
          $or: [{ username: 'test@example.com' }, { email: 'test@example.com' }],
        });
      });

      it('should throw if userModel.findOne throws', async () => {
        userModel.findOne.mockImplementation(() => {
          throw new Error('DB error');
        });

        await expect(service['getUser']('testuser')).rejects.toThrow('DB error');
      });
    });

    describe('getWorkspace', () => {
      it('should throw NotFoundException if workspace not found', async () => {
        workspaceModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(service['getWorkspace'](mockWorkspaceId)).rejects.toThrow(NotFoundException);
      });

      it('should return workspace if found', async () => {
        workspaceModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockWorkspace),
        });

        const result = await service['getWorkspace'](mockWorkspaceId);

        expect(result).toEqual(mockWorkspace);
        expect(workspaceModel.findById).toHaveBeenCalledWith(mockWorkspaceId);
      });

      it('should throw if workspaceModel.findById throws', async () => {
        workspaceModel.findById.mockImplementation(() => {
          throw new Error('DB error');
        });

        await expect(service['getWorkspace'](mockWorkspaceId)).rejects.toThrow('DB error');
      });
    });
  });
});