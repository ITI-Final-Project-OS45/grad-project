import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { BugsService } from './bugs.service';
import { Bug, BugDocument } from '../schemas/bug.schema';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  CreateBugDto,
  UpdateBugDto,
  BugSeverity,
  BugStatus,
  UserRole,
} from '@repo/types';
import {
  ReleaseNotFoundException,
  BugNotFoundException,
  UserNotFoundException,
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

describe('BugsService', () => {
  let service: BugsService;
  let bugModel: MockModel<BugDocument>;
  let releaseModel: MockModel<ReleaseDocument>;
  let userModel: MockModel<UserDocument>;
  let workspaceModel: MockModel<WorkspaceDocument>;

  // Test data
  const mockUserId = new Types.ObjectId();
  const mockAssignedUserId = new Types.ObjectId();
  const mockReleaseId = new Types.ObjectId();
  const mockWorkspaceId = new Types.ObjectId();
  const mockBugId = new Types.ObjectId();

  const mockCreateBugDto: CreateBugDto = {
    title: 'Critical Bug in Login System',
    description: 'Users cannot login with valid credentials',
    severity: BugSeverity.HIGH,
    releaseId: mockReleaseId.toString(),
    assignedTo: mockAssignedUserId.toString(),
    stepsToReproduce:
      'Step 1: Navigate to login page\nStep 2: Enter valid credentials\nStep 3: Click login',
    expectedBehavior: 'User should be redirected to dashboard',
    actualBehavior: 'Error message appears: Invalid credentials',
  };

  const mockUpdateBugDto: UpdateBugDto = {
    title: 'Updated Bug Title',
    description: 'Updated bug description',
    severity: BugSeverity.MEDIUM,
    status: BugStatus.IN_PROGRESS,
    assignedTo: mockAssignedUserId.toString(),
  };

  const mockAssignedUser = {
    _id: mockAssignedUserId,
    username: 'assigneduser',
    displayName: 'Assigned User',
    email: 'assigned@example.com',
  };

  const mockRelease = {
    _id: mockReleaseId,
    versionTag: 'v1.0.0',
    description: 'Test release',
    workspaceId: mockWorkspaceId,
    bugs: [],
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

  const mockBug = {
    _id: mockBugId,
    title: 'Critical Bug in Login System',
    description: 'Users cannot login with valid credentials',
    severity: BugSeverity.HIGH,
    status: BugStatus.OPEN,
    releaseId: mockReleaseId,
    reportedBy: mockUserId,
    assignedTo: mockAssignedUserId,
    stepsToReproduce:
      'Step 1: Navigate to login page\nStep 2: Enter valid credentials\nStep 3: Click login',
    expectedBehavior: 'User should be redirected to dashboard',
    actualBehavior: 'Error message appears: Invalid credentials',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BugsService,
        {
          provide: getModelToken(Bug.name),
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

    service = module.get<BugsService>(BugsService);
    bugModel = module.get<MockModel<BugDocument>>(getModelToken(Bug.name));
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
    it('should create a bug successfully', async () => {
      // Mock release exists
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      // Mock assigned user exists
      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockAssignedUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      // Mock bug creation using a different approach
      const mockSavedBug = { ...mockBug };
      const mockBugInstance = {
        ...mockBug,
        save: jest.fn().mockResolvedValue(mockSavedBug),
      };

      // Store original bugModel methods
      const originalBugModel = service['bugModel'];

      // Create a mock constructor that preserves the original methods
      const MockBugModel = jest.fn().mockImplementation(() => mockBugInstance);
      // Copy all original methods to the mock constructor
      Object.setPrototypeOf(MockBugModel, originalBugModel);
      Object.assign(MockBugModel, originalBugModel);

      // Replace the service's bugModel temporarily
      Object.defineProperty(service, 'bugModel', {
        value: MockBugModel,
        writable: true,
        configurable: true,
      });

      // Mock release update
      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      // Mock populated bug retrieval
      const populatedBugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBug),
      };
      bugModel.findById.mockReturnValue(populatedBugQuery);

      const result = await service.create(
        mockCreateBugDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Bug created successfully');
      expect(result.data).toEqual(mockBug);
      expect(releaseModel.findById).toHaveBeenCalledWith(
        mockCreateBugDto.releaseId,
      );
      expect(userModel.findById).toHaveBeenCalledWith(
        mockCreateBugDto.assignedTo,
      );
      expect(MockBugModel).toHaveBeenCalledWith({
        ...mockCreateBugDto,
        reportedBy: mockUserId.toString(),
      });
      expect(mockBugInstance.save).toHaveBeenCalled();

      // Restore the original bugModel
      Object.defineProperty(service, 'bugModel', {
        value: originalBugModel,
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
        service.create(mockCreateBugDto, mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw UserNotFoundException when assigned user does not exist', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      await expect(
        service.create(mockCreateBugDto, mockUserId.toString()),
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should create bug without assignedTo user', async () => {
      const createBugDtoWithoutAssignee = {
        ...mockCreateBugDto,
        assignedTo: undefined,
      };

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const mockSavedBug = { ...mockBug, assignedTo: undefined };
      const mockBugInstance = {
        ...mockBug,
        save: jest.fn().mockResolvedValue(mockSavedBug),
      };

      // Store original bugModel methods
      const originalBugModel = service['bugModel'];

      const MockBugModel = jest.fn().mockImplementation(() => mockBugInstance);
      Object.setPrototypeOf(MockBugModel, originalBugModel);
      Object.assign(MockBugModel, originalBugModel);

      Object.defineProperty(service, 'bugModel', {
        value: MockBugModel,
        writable: true,
        configurable: true,
      });

      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      const populatedBugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSavedBug),
      };
      bugModel.findById.mockReturnValue(populatedBugQuery);

      const result = await service.create(
        createBugDtoWithoutAssignee,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(userModel.findById).not.toHaveBeenCalled();

      // Restore the original bugModel
      Object.defineProperty(service, 'bugModel', {
        value: originalBugModel,
        writable: true,
        configurable: true,
      });
    });

    it('should throw BugNotFoundException when populated bug retrieval fails', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockAssignedUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      const mockSavedBug = { ...mockBug };
      const mockBugInstance = {
        ...mockBug,
        save: jest.fn().mockResolvedValue(mockSavedBug),
      };

      // Store original bugModel methods
      const originalBugModel = service['bugModel'];

      const MockBugModel = jest.fn().mockImplementation(() => mockBugInstance);
      Object.setPrototypeOf(MockBugModel, originalBugModel);
      Object.assign(MockBugModel, originalBugModel);

      Object.defineProperty(service, 'bugModel', {
        value: MockBugModel,
        writable: true,
        configurable: true,
      });

      releaseModel.findByIdAndUpdate.mockResolvedValue(mockRelease);

      // Mock populated bug retrieval to return null
      const populatedBugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      bugModel.findById.mockReturnValue(populatedBugQuery);

      await expect(
        service.create(mockCreateBugDto, mockUserId.toString()),
      ).rejects.toThrow(BugNotFoundException);

      // Restore the original bugModel
      Object.defineProperty(service, 'bugModel', {
        value: originalBugModel,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('findByRelease', () => {
    it('should return bugs for release successfully', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const bugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBug]),
      };
      bugModel.find.mockReturnValue(bugQuery);

      const result = await service.findByRelease(mockReleaseId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Bugs retrieved successfully');
      expect(result.data).toEqual([mockBug]);
      expect(bugModel.find).toHaveBeenCalledWith({
        releaseId: mockReleaseId.toString(),
      });
    });

    it('should return empty array when no bugs found', async () => {
      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const bugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      bugModel.find.mockReturnValue(bugQuery);

      const result = await service.findByRelease(mockReleaseId.toString());

      expect(result.success).toBe(true);
      expect(result.message).toBe('No bugs found for this release');
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
    it('should return bug by id successfully', async () => {
      const bugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockBug),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      const result = await service.findById(mockBugId.toString());

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Bug retrieved successfully');
      expect(result.data).toEqual(mockBug);
    });

    it('should throw BugNotFoundException when bug does not exist', async () => {
      const bugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      await expect(service.findById(mockBugId.toString())).rejects.toThrow(
        BugNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update bug successfully for manager', async () => {
      // Mock bug exists
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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

      // Mock assigned user exists
      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockAssignedUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      const updatedBug = { ...mockBug, ...mockUpdateBugDto };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedBug),
      };
      bugModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockBugId.toString(),
        mockUpdateBugDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Bug updated successfully');
      expect(result.data).toEqual(updatedBug);
    });

    it('should update bug successfully for QA role', async () => {
      const qaWorkspace = {
        ...mockWorkspace,
        members: [
          { userId: mockUserId, role: UserRole.QA, joinedAt: new Date() },
        ],
      };

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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

      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockAssignedUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      const updatedBug = { ...mockBug, ...mockUpdateBugDto };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedBug),
      };
      bugModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockBugId.toString(),
        mockUpdateBugDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedBug);
    });

    it('should update bug successfully for Developer role', async () => {
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

      // Create a bug where the Developer is the assigned user
      const bugAssignedToDeveloper = {
        ...mockBug,
        assignedTo: mockUserId, // Make the Developer the assigned user
      };

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(bugAssignedToDeveloper),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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

      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockAssignedUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      const updatedBug = { ...bugAssignedToDeveloper, ...mockUpdateBugDto };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedBug),
      };
      bugModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockBugId.toString(),
        mockUpdateBugDto,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedBug);
    });

    it('should throw BugNotFoundException when bug does not exist', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      await expect(
        service.update(
          mockBugId.toString(),
          mockUpdateBugDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(BugNotFoundException);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.update(
          mockBugId.toString(),
          mockUpdateBugDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw UnauthorizedActionException for non-workspace member', async () => {
      const workspaceWithoutUser = { ...mockWorkspace, members: [] };

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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
          mockBugId.toString(),
          mockUpdateBugDto,
          'non-member-user-id',
        ),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('should throw UserNotFoundException when assigned user does not exist', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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

      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      await expect(
        service.update(
          mockBugId.toString(),
          mockUpdateBugDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should throw BugNotFoundException when update operation fails', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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

      const userQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockAssignedUser),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      userModel.findById.mockReturnValue(userQuery);

      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      bugModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      await expect(
        service.update(
          mockBugId.toString(),
          mockUpdateBugDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(BugNotFoundException);
    });

    it('should update bug without assignedTo validation when not provided', async () => {
      const updateDtoWithoutAssignee = {
        ...mockUpdateBugDto,
        assignedTo: undefined,
      };

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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

      const updatedBug = { ...mockBug, ...updateDtoWithoutAssignee };
      const updateQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedBug),
      };
      bugModel.findByIdAndUpdate.mockReturnValue(updateQuery);

      const result = await service.update(
        mockBugId.toString(),
        updateDtoWithoutAssignee,
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedActionException for insufficient permissions', async () => {
      const designerWorkspace = {
        ...mockWorkspace,
        members: [
          {
            userId: mockUserId,
            role: UserRole.Designer,
            joinedAt: new Date(),
          },
        ],
      };

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockRelease),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      const workspaceQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(designerWorkspace),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      workspaceModel.findById.mockReturnValue(workspaceQuery);

      await expect(
        service.update(
          mockBugId.toString(),
          mockUpdateBugDto,
          mockUserId.toString(),
        ),
      ).rejects.toThrow(UnauthorizedActionException);
    });
  });

  describe('delete', () => {
    it('should delete bug successfully for manager', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findByIdAndDelete.mockReturnValue(deleteQuery);

      const result = await service.delete(
        mockBugId.toString(),
        mockUserId.toString(),
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Bug deleted successfully');
      expect(result.data).toBe(null);
      expect(releaseModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockBug.releaseId,
        { $pull: { bugs: mockBugId.toString() } },
        { new: true },
      );
    });

    it('should delete bug successfully for QA role', async () => {
      const qaWorkspace = {
        ...mockWorkspace,
        members: [
          { userId: mockUserId, role: UserRole.QA, joinedAt: new Date() },
        ],
      };

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findByIdAndDelete.mockReturnValue(deleteQuery);

      const result = await service.delete(
        mockBugId.toString(),
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

      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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
        service.delete(mockBugId.toString(), mockUserId.toString()),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('should throw BugNotFoundException when bug does not exist', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      await expect(
        service.delete(mockBugId.toString(), mockUserId.toString()),
      ).rejects.toThrow(BugNotFoundException);
    });

    it('should throw ReleaseNotFoundException when release does not exist', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

      const releaseQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      releaseModel.findById.mockReturnValue(releaseQuery);

      await expect(
        service.delete(mockBugId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });

    it('should throw ReleaseNotFoundException when workspace not found during permission check', async () => {
      const bugQuery: MockQuery = {
        exec: jest.fn().mockResolvedValue(mockBug),
        populate: jest.fn(),
        lean: jest.fn(),
      };
      bugModel.findById.mockReturnValue(bugQuery);

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
        service.delete(mockBugId.toString(), mockUserId.toString()),
      ).rejects.toThrow(ReleaseNotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all bugs successfully', async () => {
      const bugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockBug]),
      };
      bugModel.find.mockReturnValue(bugQuery);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Bugs retrieved successfully');
      expect(result.data).toEqual([mockBug]);
    });

    it('should return empty array when no bugs found', async () => {
      const bugQuery: MockQuery = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      bugModel.find.mockReturnValue(bugQuery);

      const result = await service.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('No bugs found');
      expect(result.data).toEqual([]);
    });
  });
});
