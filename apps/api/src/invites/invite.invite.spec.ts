/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { Invite, InviteDocument } from '../schemas/invite.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import { InviteStatus, UserRole } from '@repo/types';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';
import { 
  BadRequestException, 
  NotFoundException, 
  ForbiddenException,
  HttpStatus 
} from '@nestjs/common';

interface MockModel<T> extends Partial<Model<T>> {
  find: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  findByIdAndDelete: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  exec: jest.Mock;
  lean: jest.Mock;
  updateOne: jest.Mock;
  populate: jest.Mock;
}

function mockPopulateChain(returnValue: unknown) {
  const exec = jest.fn().mockResolvedValue(returnValue);
  const populate = jest.fn().mockReturnThis();
  return { populate, exec };
}

// Mock data
const mockUserId = new Types.ObjectId();
const mockWorkspaceId = new Types.ObjectId();
const mockInvitedBy = new Types.ObjectId();
const mockInviteId = new Types.ObjectId();

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
  members: [
    { userId: mockInvitedBy, role: 'manager', joinedAt: new Date() }
  ],
  createdBy: mockInvitedBy.toString(),
  releases: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockInvite = {
  _id: mockInviteId,
  userId: mockUserId,
  workspaceId: mockWorkspaceId,
  invitedBy: mockInvitedBy,
  role: UserRole.Developer,
  status: InviteStatus.PENDING,
  sentAt: new Date(),
  acceptedAt: null,
};

describe('InviteService', () => {
  let service: InviteService;
  let inviteModel: MockModel<InviteDocument>;
  let workspaceModel: MockModel<WorkspaceDocument>;
  let userModel: MockModel<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        {
          provide: getModelToken(Invite.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn(),
            updateOne: jest.fn(),
            populate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Workspace.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn(),
            updateOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    inviteModel = module.get<MockModel<InviteDocument>>(getModelToken(Invite.name));
    workspaceModel = module.get<MockModel<WorkspaceDocument>>(getModelToken(Workspace.name));
    userModel = module.get<MockModel<UserDocument>>(getModelToken(User.name));
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Reset all mocks before each test to prevent state leakage
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createInvite', () => {
    it('should throw NotFoundException if workspace not found', async () => {
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a manager', async () => {
      const workspaceWithoutManager = {
        ...mockWorkspace,
        members: [{ userId: new Types.ObjectId(), role: 'developer', joinedAt: new Date() }],
      };

      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(workspaceWithoutManager),
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user not found', async () => {
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWorkspace),
      });

      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'nonexistent',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is already a member', async () => {
      const workspaceWithUser = {
        ...mockWorkspace,
        members: [
          { userId: mockInvitedBy, role: 'manager', joinedAt: new Date() },
          { userId: mockUserId, role: 'developer', joinedAt: new Date() }
        ],
      };

      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(workspaceWithUser),
      });

      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if invite already pending', async () => {
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWorkspace),
      });

      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      inviteModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow(BadRequestException);
    });

    it('should create invite successfully', async () => {
      inviteModel.findOne.mockResolvedValue(null);
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWorkspace),
      });

      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      inviteModel.create.mockResolvedValue(mockInvite);

      const result = await service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Invite created');
      expect(result.data).toEqual(mockInvite);
    });

    it('should find user by email', async () => {
      inviteModel.findOne.mockResolvedValue(null);
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWorkspace),
      });

      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      inviteModel.create.mockResolvedValue(mockInvite);

      await service.createInvite(
        mockWorkspaceId.toString(),
        'test@example.com',
        mockInvitedBy.toString(),
        UserRole.Developer
      );

      expect(userModel.findOne).toHaveBeenCalledWith({
        $or: [{ username: 'test@example.com' }, { email: 'test@example.com' }],
      });
    });

    it('should throw if inviteModel.create throws', async () => {
      inviteModel.findOne.mockResolvedValue(null);
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWorkspace),
      });

      userModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      inviteModel.create.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow('DB error');
    });

    it('should throw if workspaceModel.findById throws', async () => {
      workspaceModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow('DB error');
    });

    it('should throw if userModel.findOne throws', async () => {
      workspaceModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockWorkspace),
      });

      userModel.findOne.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.createInvite(
        mockWorkspaceId.toString(),
        'testuser',
        mockInvitedBy.toString(),
        UserRole.Developer
      )).rejects.toThrow('DB error');
    });
  });

  describe('respondToInvite', () => {
    it('should throw NotFoundException if invite not found', async () => {
      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      )).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not user\'s invite', async () => {
      const otherUserId = new Types.ObjectId();
      const otherUserInvite = {
        ...mockInvite,
        userId: otherUserId,
        save: jest.fn(),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherUserInvite),
      });

      await expect(service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      )).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if invite already responded', async () => {
      const acceptedInvite = {
        ...mockInvite,
        status: InviteStatus.ACCEPTED,
        userId: mockUserId,
        save: jest.fn(),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(acceptedInvite),
      });

      await expect(service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      )).rejects.toThrow(BadRequestException);
    });

    it('should accept invite successfully', async () => {
      const inviteToAccept = {
        ...mockInvite,
        userId: mockUserId,
        save: jest.fn().mockResolvedValue({
          ...mockInvite,
          status: InviteStatus.ACCEPTED,
          acceptedAt: new Date(),
        }),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inviteToAccept),
      });

      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Invite accepted');
      expect(result.data?.status).toBe(InviteStatus.ACCEPTED);
    });

    it('should decline invite successfully', async () => {
      const inviteToDecline = {
        ...mockInvite,
        userId: mockUserId,
        save: jest.fn().mockResolvedValue({
          ...mockInvite,
          status: InviteStatus.DECLINED,
        }),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inviteToDecline),
      });

      const result = await service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'decline'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Invite declined');
      expect(result.data?.status).toBe(InviteStatus.DECLINED);
    });

    it('should add user to workspace members when accepting', async () => {
      const inviteToAccept = {
        ...mockInvite,
        userId: mockUserId,
        save: jest.fn().mockResolvedValue({
          ...mockInvite,
          status: InviteStatus.ACCEPTED,
          acceptedAt: new Date(),
        }),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inviteToAccept),
      });

      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      );

      expect(workspaceModel.updateOne).toHaveBeenCalledWith(
        { _id: mockWorkspaceId, 'members.userId': { $ne: mockUserId.toString() } },
        {
          $push: {
            members: {
              userId: mockUserId,
              role: UserRole.Developer,
              joinedAt: expect.any(Date) as Date,
            },
          },
        }
      );
    });

    it('should add workspace to user workspaces when accepting', async () => {
      const inviteToAccept = {
        ...mockInvite,
        userId: mockUserId,
        save: jest.fn().mockResolvedValue({
          ...mockInvite,
          status: InviteStatus.ACCEPTED,
          acceptedAt: new Date(),
        }),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inviteToAccept),
      });

      workspaceModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      userModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      );

      expect(userModel.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId.toString(), workspaces: { $ne: mockWorkspaceId } },
        { $push: { workspaces: mockWorkspaceId } }
      );
    });

    it('should throw if inviteModel.findById throws', async () => {
      inviteModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      )).rejects.toThrow('DB error');
    });

    it('should throw if invite.save throws', async () => {
      const inviteToAccept = {
        ...mockInvite,
        userId: mockUserId,
        save: jest.fn().mockImplementation(() => {
          throw new Error('DB error');
        }),
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inviteToAccept),
      });

      await expect(service.respondToInvite(
        mockInviteId.toString(),
        mockUserId.toString(),
        'accept'
      )).rejects.toThrow('DB error');
    });
  });

  describe('getInvitesForUser', () => {
    it('should return invites for user successfully', async () => {
      const populatedInvites = [
        {
          ...mockInvite,
          workspaceId: {
            _id: mockWorkspaceId,
            name: 'Test Workspace',
            description: 'Test Description',
          },
          invitedBy: {
            _id: mockInvitedBy,
            username: 'manager',
            displayName: 'Manager User',
            email: 'manager@example.com',
          },
        },
      ];

      inviteModel.find.mockReturnValue(mockPopulateChain(populatedInvites));

      const result = await service.getInvitesForUser(mockUserId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Invites fetched');
      expect(result.data).toEqual(populatedInvites);
    });

    it('should return empty array when no invites found', async () => {
      inviteModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.getInvitesForUser(mockUserId.toString());

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should throw if inviteModel.find throws', async () => {
      inviteModel.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.getInvitesForUser(mockUserId.toString())).rejects.toThrow('DB error');
    });
  });

  describe('getInvitesForWorkspace', () => {
    it('should return invites for workspace successfully', async () => {
      const populatedInvites = [
        {
          ...mockInvite,
          userId: {
            _id: mockUserId,
            username: 'testuser',
            displayName: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      inviteModel.find.mockReturnValue(mockPopulateChain(populatedInvites));

      const result = await service.getInvitesForWorkspace(mockWorkspaceId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Invites fetched');
      expect(result.data).toEqual(populatedInvites);
    });

    it('should return empty array when no invites found', async () => {
      inviteModel.find.mockReturnValue(mockPopulateChain([]));

      const result = await service.getInvitesForWorkspace(mockWorkspaceId.toString());

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should throw if inviteModel.find throws', async () => {
      inviteModel.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.getInvitesForWorkspace(mockWorkspaceId.toString())).rejects.toThrow('DB error');
    });
  });

  describe('deleteInvite', () => {
    it('should throw NotFoundException if invite not found', async () => {
      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      )).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if workspace not found', async () => {
      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      )).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a manager', async () => {
      const workspaceWithoutManager = {
        ...mockWorkspace,
        members: [{ userId: new Types.ObjectId(), role: 'developer', joinedAt: new Date() }],
      };

      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(workspaceWithoutManager),
      });

      await expect(service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      )).rejects.toThrow(ForbiddenException);
    });

    it('should delete invite successfully', async () => {
      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });

      inviteModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      const result = await service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Invite deleted successfully');
      expect(result.data).toBeNull();
    });

    it('should throw if inviteModel.findById throws', async () => {
      inviteModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      )).rejects.toThrow('DB error');
    });

    it('should throw if workspaceModel.findById throws', async () => {
      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      workspaceModel.findById.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      )).rejects.toThrow('DB error');
    });

    it('should throw if inviteModel.findByIdAndDelete throws', async () => {
      inviteModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvite),
      });

      workspaceModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWorkspace),
      });

      inviteModel.findByIdAndDelete.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.deleteInvite(
        mockInviteId.toString(),
        mockInvitedBy.toString()
      )).rejects.toThrow('DB error');
    });
  });
});

describe('InviteController', () => {
  let controller: InviteController;
  const mockInviteService = {
    createInvite: jest.fn(),
    respondToInvite: jest.fn(),
    getInvitesForUser: jest.fn(),
    getInvitesForWorkspace: jest.fn(),
    deleteInvite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteController],
      providers: [
        { provide: InviteService, useValue: mockInviteService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(WorkspaceAuthorizationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<InviteController>(InviteController);
    jest.clearAllMocks();
  });

  const req = { userId: mockUserId.toString() } as RequestWithUser;
  const workspaceId = mockWorkspaceId.toString();
  const inviteId = mockInviteId.toString();
  const inviteResponse = { success: true, data: mockInvite, status: 200, message: 'ok' };

  describe('createInvite', () => {
    it('should return invite on success', async () => {
      mockInviteService.createInvite.mockResolvedValue(inviteResponse);
      const result = await controller.createInvite(
        workspaceId,
        'testuser',
        UserRole.Developer,
        req
      );
      expect(result).toEqual(inviteResponse);
      expect(mockInviteService.createInvite).toHaveBeenCalledWith(
        workspaceId,
        'testuser',
        req.userId,
        UserRole.Developer
      );
    });

    it('should throw error from service', async () => {
      mockInviteService.createInvite.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.createInvite(
        workspaceId,
        'testuser',
        UserRole.Developer,
        req
      )).rejects.toThrow('Unexpected');
    });
  });

  describe('respondToInvite', () => {
    it('should return response on accept', async () => {
      mockInviteService.respondToInvite.mockResolvedValue(inviteResponse);
      const result = await controller.respondToInvite(inviteId, 'accept', req);
      expect(result).toEqual(inviteResponse);
      expect(mockInviteService.respondToInvite).toHaveBeenCalledWith(inviteId, req.userId, 'accept');
    });

    it('should return response on decline', async () => {
      mockInviteService.respondToInvite.mockResolvedValue(inviteResponse);
      const result = await controller.respondToInvite(inviteId, 'decline', req);
      expect(result).toEqual(inviteResponse);
      expect(mockInviteService.respondToInvite).toHaveBeenCalledWith(inviteId, req.userId, 'decline');
    });

    it('should throw error from service', async () => {
      mockInviteService.respondToInvite.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.respondToInvite(inviteId, 'accept', req)).rejects.toThrow('Unexpected');
    });
  });

  describe('getInvitesForUser', () => {
    it('should return invites on success', async () => {
      mockInviteService.getInvitesForUser.mockResolvedValue(inviteResponse);
      const result = await controller.getInvitesForUser(req);
      expect(result).toEqual(inviteResponse);
      expect(mockInviteService.getInvitesForUser).toHaveBeenCalledWith(req.userId);
    });

    it('should throw error from service', async () => {
      mockInviteService.getInvitesForUser.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.getInvitesForUser(req)).rejects.toThrow('Unexpected');
    });
  });

  describe('getInvitesForWorkspace', () => {
    it('should return invites on success', async () => {
      mockInviteService.getInvitesForWorkspace.mockResolvedValue(inviteResponse);
      const result = await controller.getInvitesForWorkspace(workspaceId);
      expect(result).toEqual(inviteResponse);
      expect(mockInviteService.getInvitesForWorkspace).toHaveBeenCalledWith(workspaceId);
    });

    it('should throw error from service', async () => {
      mockInviteService.getInvitesForWorkspace.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.getInvitesForWorkspace(workspaceId)).rejects.toThrow('Unexpected');
    });
  });

  describe('deleteInvite', () => {
    it('should return success on delete', async () => {
      mockInviteService.deleteInvite.mockResolvedValue(inviteResponse);
      const result = await controller.deleteInvite(inviteId, req);
      expect(result).toEqual(inviteResponse);
      expect(mockInviteService.deleteInvite).toHaveBeenCalledWith(inviteId, req.userId);
    });

    it('should throw error from service', async () => {
      mockInviteService.deleteInvite.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.deleteInvite(inviteId, req)).rejects.toThrow('Unexpected');
    });
  });
});
