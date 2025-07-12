import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { ReleaseService } from './release.service';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  CreateReleaseDto,
  QAStatus,
  ReleaseStatus,
  UserRole,
} from '@repo/types';
import {
  WorkspaceNotFoundException,
  ReleaseNotFoundException,
  UserNotMemberException,
  InsufficientPermissionsException,
} from '../exceptions/domain.exceptions';

interface MockQuery {
  populate: jest.Mock;
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
}

describe('ReleaseService', () => {
  let service: ReleaseService;
  let releaseModel: MockModel<ReleaseDocument>;
  let workspaceModel: MockModel<WorkspaceDocument>;

  // Test data
  const mockUserId = new Types.ObjectId();
  const mockWorkspaceId = new Types.ObjectId();
  const mockReleaseId = new Types.ObjectId();

  const mockCreateReleaseDto: CreateReleaseDto = {
    versionTag: 'v1.0.0',
    workspaceId: mockWorkspaceId.toString(),
    description: 'Test release description',
    plannedDate: '2025-12-31T00:00:00.000Z',
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
    releases: [],
  };

  const mockRelease = {
    _id: mockReleaseId,
    versionTag: 'v1.0.0',
    workspaceId: mockWorkspaceId,
    description: 'Test release description',
    plannedDate: new Date('2025-12-31'),
    createdBy: mockUserId,
    qaStatus: QAStatus.PENDING,
    status: ReleaseStatus.PLANNED,
    bugs: [],
    hotfixes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleaseService,
        {
          provide: getModelToken(Release.name),
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
          },
        },
        {
          provide: getModelToken(Workspace.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReleaseService>(ReleaseService);
    releaseModel = module.get<MockModel<ReleaseDocument>>(
      getModelToken(Release.name),
    );
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
    it('should create a release successfully', async () => {
      // Mock workspace exists and user is member
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      // Mock the new model instance creation
      const mockSavedRelease = { ...mockRelease };
      const mockReleaseInstance = {
        ...mockRelease,
        save: jest.fn().mockResolvedValue(mockSavedRelease),
      };

      // Create a mock constructor function
      const MockReleaseModel = jest
        .fn()
        .mockImplementation(() => mockReleaseInstance);

      // Replace the service's releaseModel temporarily using Object.defineProperty
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        service,
        'releaseModel',
      );
      Object.defineProperty(service, 'releaseModel', {
        value: MockReleaseModel,
        writable: true,
        configurable: true,
      });

      // Mock workspace update
      workspaceModel.findByIdAndUpdate.mockResolvedValue(mockWorkspace);

      const result = await service.create(
        mockCreateReleaseDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Release created successfully');
      expect(workspaceModel.findById).toHaveBeenCalledWith(
        mockCreateReleaseDto.workspaceId,
      );
      expect(MockReleaseModel).toHaveBeenCalledWith({
        ...mockCreateReleaseDto,
        createdBy: mockUserId.toString(),
      });
      expect(mockReleaseInstance.save).toHaveBeenCalled();

      // Restore the original descriptor
      if (originalDescriptor) {
        Object.defineProperty(service, 'releaseModel', originalDescriptor);
      }
    });

    it('should throw WorkspaceNotFoundException when workspace does not exist', async () => {
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.create(mockCreateReleaseDto, mockUserId.toString()),
      ).rejects.toThrow(WorkspaceNotFoundException);
    });

    it('should throw UserNotMemberException when user is not a workspace member', async () => {
      const workspaceWithoutUser = { ...mockWorkspace, members: [] };
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(workspaceWithoutUser),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.create(mockCreateReleaseDto, 'non-member-user-id'),
      ).rejects.toThrow(UserNotMemberException);
    });
  });

  describe('findByWorkspace', () => {
    it('should return releases for workspace successfully', async () => {
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const releaseQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockRelease]),
      };
      releaseModel.find.mockReturnValue(releaseQuery);

      const result = await service.findByWorkspace(mockWorkspaceId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Releases retrieved successfully');
      expect(result.data).toEqual([mockRelease]);
      expect(releaseModel.find).toHaveBeenCalledWith({
        workspaceId: mockWorkspaceId.toString(),
      });
    });

    it('should return empty array when no releases found', async () => {
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const releaseQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      releaseModel.find.mockReturnValue(releaseQuery);

      const result = await service.findByWorkspace(mockWorkspaceId.toString());

      expect(result.success).toBe(true);
      expect(result.message).toBe('No releases found for this workspace');
      expect(result.data).toEqual([]);
    });

    it('should throw WorkspaceNotFoundException when workspace does not exist', async () => {
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.findByWorkspace(mockWorkspaceId.toString()),
      ).rejects.toThrow(WorkspaceNotFoundException);
    });
  });

  describe('findById', () => {
    it('should return release by id successfully', async () => {
      const releaseQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockRelease),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const result = await service.findById(mockReleaseId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Release retrieved successfully');
      expect(result.data).toEqual(mockRelease);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const releaseQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(service.findById(mockReleaseId.toString())).rejects.toThrow(
        ReleaseNotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      versionTag: 'v1.1.0',
      description: 'Updated description',
    };

    it('should update release successfully', async () => {
      // Mock release exists and user is creator
      const findByIdQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(findByIdQuery);

      // Mock workspace exists and user is manager
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const updatedRelease = { ...mockRelease, ...updateDto };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedRelease),
      };
      releaseModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockReleaseId.toString(),
        updateDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Release updated successfully');
      expect(result.data).toEqual(updatedRelease);
    });

    it('should throw ReleaseNotFoundException when release not found or user not creator', async () => {
      const findByIdQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(findByIdQuery);

      await expect(
        service.update(
          mockReleaseId.toString(),
          updateDto,
          'different-user-id',
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });
  });

  describe('deploy', () => {
    it('should deploy release successfully', async () => {
      const findByIdQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(findByIdQuery);

      // Mock workspace exists and user is manager
      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const deployedRelease = {
        ...mockRelease,
        deployedBy: mockUserId,
        deployedDate: new Date(),
      };
      releaseModel.findByIdAndUpdate.mockResolvedValue(deployedRelease);

      const result = await service.deploy(
        mockReleaseId.toString(),
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Release deployed successfully');
      expect(result.data).toEqual(deployedRelease);
    });

    it('should throw ReleaseNotFoundException when release not found', async () => {
      const findByIdQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(findByIdQuery);

      await expect(
        service.deploy(mockReleaseId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });
  });

  describe('updateQAStatus', () => {
    it('should update QA status successfully for manager', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const updatedRelease = { ...mockRelease, qaStatus: QAStatus.PASSED };
      releaseModel.findByIdAndUpdate.mockResolvedValue(updatedRelease);

      const result = await service.updateQAStatus(
        mockReleaseId.toString(),
        QAStatus.PASSED,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('QA status updated successfully');
      expect(result.data).toEqual(updatedRelease);
    });

    it('should update QA status successfully for QA role', async () => {
      const qaWorkspace = {
        ...mockWorkspace,
        members: [
          { userId: mockUserId, role: UserRole.QA, joinedAt: new Date() },
        ],
      };

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(qaWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      const updatedRelease = { ...mockRelease, qaStatus: QAStatus.PASSED };
      releaseModel.findByIdAndUpdate.mockResolvedValue(updatedRelease);

      const result = await service.updateQAStatus(
        mockReleaseId.toString(),
        QAStatus.PASSED,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedRelease);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.updateQAStatus(
          mockReleaseId.toString(),
          QAStatus.PASSED,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw WorkspaceNotFoundException when workspace does not exist', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.updateQAStatus(
          mockReleaseId.toString(),
          QAStatus.PASSED,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(WorkspaceNotFoundException);
    });

    it('should throw UserNotMemberException when user is not a member', async () => {
      const workspaceWithoutUser = { ...mockWorkspace, members: [] };

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(workspaceWithoutUser),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.updateQAStatus(
          mockReleaseId.toString(),
          QAStatus.PASSED,
          'non-member-user-id',
        ),
      ).rejects.toThrow(UserNotMemberException);
    });

    it('should throw InsufficientPermissionsException when user is not manager or QA', async () => {
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

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(developerWorkspace),
        populate: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.updateQAStatus(
          mockReleaseId.toString(),
          QAStatus.PASSED,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(InsufficientPermissionsException);
    });
  });

  describe('delete', () => {
    it('should delete release successfully', async () => {
      const findOneQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findOne.mockReturnValue(findOneQuery);

      releaseModel.findByIdAndDelete.mockResolvedValue(mockRelease);
      workspaceModel.findByIdAndUpdate.mockResolvedValue(mockWorkspace);

      const result = await service.delete(
        mockReleaseId.toString(),
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Release deleted successfully');
      expect(result.data).toBe(null);

      // Check the workspace update call properly
      expect(workspaceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRelease.workspaceId,
        { $pull: { releases: mockReleaseId.toString() } },
        { new: true },
      );
    });

    it('should throw ReleaseNotFoundException when release not found or user not creator', async () => {
      const findOneQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
      };
      releaseModel.findOne.mockReturnValue(findOneQuery);

      await expect(
        service.delete(mockReleaseId.toString(), 'different-user-id'),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw ReleaseNotFoundException when delete operation fails', async () => {
      const findOneQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
      };
      releaseModel.findOne.mockReturnValue(findOneQuery);

      releaseModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        service.delete(mockReleaseId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });
  });
});
