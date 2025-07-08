import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { HotfixesService } from './hotfixes.service';
import { Hotfix, HotfixDocument } from '../schemas/hotfix.schema';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  CreateHotfixDto,
  UpdateHotfixDto,
  UserRole,
} from '@repo/types';
import {
  ReleaseNotFoundException,
  HotfixNotFoundException,
  UnauthorizedActionException,
} from '../exceptions/domain.exceptions';

// Create proper mock types for Mongoose queries
interface MockQuery {
  populate: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock;
}

interface MockModel<T> extends Partial<Model<T>> {
  find: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  exec: jest.Mock;
  populate: jest.Mock;
  lean: jest.Mock;
}

describe('HotfixesService', () => {
  let service: HotfixesService;
  let hotfixModel: MockModel<HotfixDocument>;
  let releaseModel: MockModel<ReleaseDocument>;
  let userModel: MockModel<UserDocument>;
  let workspaceModel: MockModel<WorkspaceDocument>;

  // Test data
  const mockUserId = new Types.ObjectId();
  const mockReleaseId = new Types.ObjectId();
  const mockWorkspaceId = new Types.ObjectId();
  const mockHotfixId = new Types.ObjectId();

  const mockCreateHotfixDto: CreateHotfixDto = {
    title: 'Critical Login Hotfix',
    description: 'Fix for authentication bypass vulnerability',
    attachedCommits: ['abc123', 'def456'],
    deploymentNotes: 'Deploy after business hours',
  };

  const mockUpdateHotfixDto: UpdateHotfixDto = {
    title: 'Updated Hotfix Title',
    description: 'Updated hotfix description',
    attachedCommits: ['xyz789'],
    deploymentNotes: 'Updated deployment notes',
  };

  const mockRelease = {
    _id: mockReleaseId,
    versionTag: 'v1.0.0',
    description: 'Test release',
    workspaceId: mockWorkspaceId,
    hotfixes: [],
  };

  const mockWorkspace = {
    _id: mockWorkspaceId,
    name: 'Test Workspace',
    members: [
      {
        userId: mockUserId,
        role: UserRole.Manager,
        joinedAt: new Date(),
      },
    ],
  };

  const mockHotfix = {
    _id: mockHotfixId,
    title: 'Critical Login Hotfix',
    description: 'Fix for authentication bypass vulnerability',
    attachedCommits: ['abc123', 'def456'],
    releaseId: mockReleaseId,
    fixedBy: mockUserId,
    fixedDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotfixesService,
        {
          provide: getModelToken(Hotfix.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            populate: jest.fn(),
            lean: jest.fn(),
          },
        },
        {
          provide: getModelToken(Release.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(Workspace.name),
          useValue: {
            findById: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HotfixesService>(HotfixesService);
    hotfixModel = module.get<MockModel<HotfixDocument>>(
      getModelToken(Hotfix.name),
    );
    releaseModel = module.get<MockModel<ReleaseDocument>>(
      getModelToken(Release.name),
    );
    userModel = module.get<MockModel<UserDocument>>(getModelToken(User.name));
    workspaceModel = module.get<MockModel<WorkspaceDocument>>(
      getModelToken(Workspace.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a hotfix successfully', async () => {
      // Mock release exists
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      // Mock hotfix creation
      const mockSavedHotfix = { ...mockHotfix };
      const mockHotfixInstance = {
        ...mockHotfix,
        save: jest.fn().mockResolvedValue(mockSavedHotfix),
      };

      // Store original hotfixModel methods
      const originalHotfixModel = service['hotfixModel'];

      const MockHotfixModel = jest.fn().mockImplementation(() => mockHotfixInstance);
      Object.setPrototypeOf(MockHotfixModel, originalHotfixModel);
      Object.assign(MockHotfixModel, originalHotfixModel);

      Object.defineProperty(service, 'hotfixModel', {
        value: MockHotfixModel,
        writable: true,
        configurable: true,
      });

      // Mock release update
      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      // Mock populated hotfix retrieval
      const populatedHotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHotfix),
      };
      hotfixModel.findById.mockReturnValue(populatedHotfixQuery);

      const result = await service.create(
        mockCreateHotfixDto,
        mockUserId.toString(),
        mockReleaseId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Hotfix created successfully');
      expect(result.data).toEqual(mockHotfix);
      expect(releaseModel.findById).toHaveBeenCalledWith(
        mockReleaseId.toString(),
      );
      expect(MockHotfixModel).toHaveBeenCalledWith({
        ...mockCreateHotfixDto,
        releaseId: mockReleaseId.toString(),
        fixedBy: mockUserId.toString(),
        fixedDate: expect.any(Date) as Date,
      });
      expect(mockHotfixInstance.save).toHaveBeenCalled();

      // Restore the original hotfixModel
      Object.defineProperty(service, 'hotfixModel', {
        value: originalHotfixModel,
        writable: true,
        configurable: true,
      });
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.create(
          mockCreateHotfixDto,
          mockUserId.toString(),
          mockReleaseId.toString(),
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw HotfixNotFoundException when populated hotfix retrieval fails', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const mockSavedHotfix = { ...mockHotfix };
      const mockHotfixInstance = {
        ...mockHotfix,
        save: jest.fn().mockResolvedValue(mockSavedHotfix),
      };

      const originalHotfixModel = service['hotfixModel'];

      const MockHotfixModel = jest
        .fn()
        .mockImplementation(() => mockHotfixInstance);
      Object.setPrototypeOf(MockHotfixModel, originalHotfixModel);
      Object.assign(MockHotfixModel, originalHotfixModel);

      Object.defineProperty(service, 'hotfixModel', {
        value: MockHotfixModel,
        writable: true,
        configurable: true,
      });

      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      // Mock populated hotfix retrieval to return null
      const populatedHotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      hotfixModel.findById.mockReturnValue(populatedHotfixQuery);

      await expect(
        service.create(
          mockCreateHotfixDto,
          mockUserId.toString(),
          mockReleaseId.toString(),
        ),
      ).rejects.toThrow(HotfixNotFoundException);

      // Restore the original hotfixModel
      Object.defineProperty(service, 'hotfixModel', {
        value: originalHotfixModel,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('findByRelease', () => {
    it('should return hotfixes for release successfully', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const hotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockHotfix]),
      };
      hotfixModel.find.mockReturnValue(hotfixQuery);

      const result = await service.findByRelease(mockReleaseId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Hotfixes retrieved successfully');
      expect(result.data).toEqual([mockHotfix]);
      expect(hotfixModel.find).toHaveBeenCalledWith({
        releaseId: mockReleaseId.toString(),
      });
    });

    it('should return empty array when no hotfixes found', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const hotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      hotfixModel.find.mockReturnValue(hotfixQuery);

      const result = await service.findByRelease(mockReleaseId.toString());

      expect(result.success).toBe(true);
      expect(result.message).toBe('No hotfixes found for this release');
      expect(result.data).toEqual([]);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.findByRelease(mockReleaseId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });
  });

  describe('findById', () => {
    it('should return hotfix by id successfully', async () => {
      const hotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockHotfix),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const result = await service.findById(mockHotfixId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Hotfix retrieved successfully');
      expect(result.data).toEqual(mockHotfix);
    });

    it('should throw HotfixNotFoundException when hotfix does not exist', async () => {
      const hotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      await expect(service.findById(mockHotfixId.toString())).rejects.toThrow(
        HotfixNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update hotfix successfully for manager', async () => {
      // Mock hotfix exists
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      // Mock release exists
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      // Mock workspace permissions
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const updatedHotfix = { ...mockHotfix, ...mockUpdateHotfixDto };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedHotfix),
      };
      hotfixModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockHotfixId.toString(),
        mockUpdateHotfixDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Hotfix updated successfully');
      expect(result.data).toEqual(updatedHotfix);
    });

    it('should update hotfix successfully for QA role', async () => {
      const qaWorkspace = {
        ...mockWorkspace,
        members: [
          { userId: mockUserId, role: UserRole.QA, joinedAt: new Date() },
        ],
      };

      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(qaWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const updatedHotfix = { ...mockHotfix, ...mockUpdateHotfixDto };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedHotfix),
      };
      hotfixModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockHotfixId.toString(),
        mockUpdateHotfixDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedHotfix);
    });

    it('should throw HotfixNotFoundException when hotfix does not exist', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      await expect(
        service.update(
          mockHotfixId.toString(),
          mockUpdateHotfixDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(HotfixNotFoundException);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.update(
          mockHotfixId.toString(),
          mockUpdateHotfixDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw ReleaseNotFoundException when workspace not found during permission check', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.update(
          mockHotfixId.toString(),
          mockUpdateHotfixDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw UnauthorizedActionException when user is not a workspace member', async () => {
      const workspaceWithoutUser = { ...mockWorkspace, members: [] };

      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(workspaceWithoutUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.update(
          mockHotfixId.toString(),
          mockUpdateHotfixDto,
          'non-member-user-id',
        ),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('should throw UnauthorizedActionException for insufficient permissions', async () => {
      const developerWorkspace = {
        ...mockWorkspace,
        members: [
          {
            userId: mockUserId,
            role: UserRole.Developer,
            joinedAt: new Date(),
          },
        ],
      };

      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(developerWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.update(
          mockHotfixId.toString(),
          mockUpdateHotfixDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('should throw HotfixNotFoundException when update operation fails', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      hotfixModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      await expect(
        service.update(
          mockHotfixId.toString(),
          mockUpdateHotfixDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(HotfixNotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete hotfix successfully for manager', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      const deleteQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findByIdAndDelete.mockReturnValue(deleteQuery);

      const result = await service.delete(
        mockHotfixId.toString(),
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Hotfix deleted successfully');
      expect(result.data).toBe(null);
      expect(releaseModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockHotfix.releaseId,
        { $pull: { hotfixes: mockHotfixId.toString() } },
        { new: true },
      );
    });

    it('should delete hotfix successfully for QA role', async () => {
      const qaWorkspace = {
        ...mockWorkspace,
        members: [
          { userId: mockUserId, role: UserRole.QA, joinedAt: new Date() },
        ],
      };

      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(qaWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      const deleteQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findByIdAndDelete.mockReturnValue(deleteQuery);

      const result = await service.delete(
        mockHotfixId.toString(),
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });

    it('should throw UnauthorizedActionException for Developer role', async () => {
      const developerWorkspace = {
        ...mockWorkspace,
        members: [
          {
            userId: mockUserId,
            role: UserRole.Developer,
            joinedAt: new Date(),
          },
        ],
      };

      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(developerWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.delete(mockHotfixId.toString(), mockUserId.toString()),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('should throw HotfixNotFoundException when hotfix does not exist', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      await expect(
        service.delete(mockHotfixId.toString(), mockUserId.toString()),
      ).rejects.toThrow(HotfixNotFoundException);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.delete(mockHotfixId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw ReleaseNotFoundException when workspace not found during permission check', async () => {
      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.delete(mockHotfixId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw UnauthorizedActionException when user is not a workspace member', async () => {
      const workspaceWithoutUser = { ...mockWorkspace, members: [] };

      const hotfixQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockHotfix),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      hotfixModel.findById.mockReturnValue(hotfixQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(workspaceWithoutUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.delete(mockHotfixId.toString(), 'non-member-user-id'),
      ).rejects.toThrow(UnauthorizedActionException);
    });
  });

  describe('findAll', () => {
    it('should return all hotfixes successfully', async () => {
      const hotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockHotfix]),
      };
      hotfixModel.find.mockReturnValue(hotfixQuery);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Hotfixes retrieved successfully');
      expect(result.data).toEqual([mockHotfix]);
    });

    it('should return empty array when no hotfixes found', async () => {
      const hotfixQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      hotfixModel.find.mockReturnValue(hotfixQuery);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('No hotfixes found');
      expect(result.data).toEqual([]);
    });
  });

  describe('validateWorkspacePermission', () => {
    it('should validate workspace permission successfully for manager', async () => {
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service['validateWorkspacePermission'](
          mockWorkspaceId.toString(),
          mockUserId.toString(),
        ),
      ).resolves.not.toThrow();
    });

    it('should validate workspace permission successfully for QA', async () => {
      const qaWorkspace = {
        ...mockWorkspace,
        members: [
          { userId: mockUserId, role: UserRole.QA, joinedAt: new Date() },
        ],
      };

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(qaWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service['validateWorkspacePermission'](
          mockWorkspaceId.toString(),
          mockUserId.toString(),
        ),
      ).resolves.not.toThrow();
    });

    it('should throw ReleaseNotFoundException when workspace does not exist', async () => {
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service['validateWorkspacePermission'](
          mockWorkspaceId.toString(),
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw UnauthorizedActionException when user is not a member', async () => {
      const workspaceWithoutUser = { ...mockWorkspace, members: [] };

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(workspaceWithoutUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service['validateWorkspacePermission'](
          mockWorkspaceId.toString(),
          'non-member-user-id',
        ),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('should throw UnauthorizedActionException for insufficient permissions', async () => {
      const developerWorkspace = {
        ...mockWorkspace,
        members: [
          {
            userId: mockUserId,
            role: UserRole.Developer,
            joinedAt: new Date(),
          },
        ],
      };

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(developerWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service['validateWorkspacePermission'](
          mockWorkspaceId.toString(),
          mockUserId.toString(),
        ),
      ).rejects.toThrow(UnauthorizedActionException);
    });
  });
});
