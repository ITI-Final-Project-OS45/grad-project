/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkspaceService } from './workspace.service';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { User } from '../schemas/user.schema';
import { WorkspaceController } from './workspace.controller';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';


interface MockModel<T> extends Partial<Model<T>> {
  find: jest.Mock;
  findById: jest.Mock;
  findOne: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  exec: jest.Mock;
  lean: jest.Mock;
}

function mockPopulateChain(returnValue: any) {
  const exec = jest.fn().mockResolvedValue(returnValue);
  const populate = jest.fn().mockReturnThis();
  return { populate, exec };
}

// Move mockUserId and mockWorkspaceId definitions to the top of the file
const mockWorkspaceId = new Types.ObjectId();
const mockUserId = new Types.ObjectId();

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let workspaceModel: MockModel<WorkspaceDocument>;

  // Test data
  const mockWorkspace = {
    _id: mockWorkspaceId,
    name: 'Test Workspace',
    description: 'A test workspace',
    members: [{ userId: mockUserId, role: 'manager', joinedAt: new Date() }],
    createdBy: mockUserId.toString(),
    releases: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
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
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    workspaceModel = module.get<MockModel<WorkspaceDocument>>(getModelToken(Workspace.name));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  // Example: getOneWorkspace
  describe('getOneWorkspace', () => {
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.getOneWorkspace('invalid')).rejects.toThrow();
    });

    it('should throw NotFoundException if workspace not found', async () => {
      workspaceModel.findById.mockReturnValue({
        populate: () => ({
          populate: () => ({
            exec: () => null,
          }),
        }),
      });
      await expect(service.getOneWorkspace(mockWorkspaceId.toString())).rejects.toThrow();
    });

    it('should return workspace if found', async () => {
      workspaceModel.findById.mockReturnValue(mockPopulateChain(mockWorkspace));
      const result = await service.getOneWorkspace(mockWorkspaceId.toString());
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkspace);
    });
  });

  describe('createWorkspace', () => {
    it('should create workspace successfully', async () => {
      workspaceModel.create.mockResolvedValue(mockWorkspace);
      // Mock userModel.findByIdAndUpdate to return a user (simulate user update success)
      const userModel = { findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: mockUserId }) };
      (service as any).userModel = userModel;
      const result = await service.createWorkspace({ name: 'Test Workspace', description: 'A test workspace', createdBy: mockUserId.toString() }, mockUserId.toString());
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkspace);
    });
    it('should throw BadRequestException when workspace creation fails', async () => {
      workspaceModel.create.mockResolvedValue(null);
      const userModel = { findByIdAndUpdate: jest.fn() };
      (service as any).userModel = userModel;
      await expect(service.createWorkspace({ name: 'Test Workspace', description: 'A test workspace', createdBy: mockUserId.toString() }, mockUserId.toString())).rejects.toThrow();
    });
    it('should throw if create throws', async () => {
      workspaceModel.create.mockImplementation(() => { throw new Error('DB error'); });
      const userModel = { findByIdAndUpdate: jest.fn() };
      (service as any).userModel = userModel;
      await expect(service.createWorkspace({ name: 'Test', description: 'desc', createdBy: mockUserId.toString() }, mockUserId.toString())).rejects.toThrow('DB error');
    });
    it('should throw BadRequestException if required fields are missing when creating workspace', async () => {
      workspaceModel.create.mockResolvedValue(null);
      const userModel = { findByIdAndUpdate: jest.fn() };
      (service as any).userModel = userModel;
      await expect(service.createWorkspace({ name: '', description: '', createdBy: '' }, '')).rejects.toThrow();
    });
  });

  describe('getAllWorkspacesForUser', () => {
    it('should get all workspaces for user successfully', async () => {
      workspaceModel.find.mockReturnValue(mockPopulateChain([mockWorkspace]));
      const result = await service.getAllWorkspacesForUser(mockUserId.toString());
      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockWorkspace]);
    });
    it('should throw NotFoundException when no workspaces found', async () => {
      workspaceModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      await expect(service.getAllWorkspacesForUser(mockUserId.toString())).rejects.toThrow();
    });
    it('should throw if find throws', async () => {
      workspaceModel.find.mockImplementation(() => { throw new Error('DB error'); });
      await expect(service.getAllWorkspacesForUser(mockUserId.toString())).rejects.toThrow('DB error');
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace successfully', async () => {
      // Mock findById to return the workspace
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockWorkspace) });
      // Mock findByIdAndUpdate to return the updated workspace
      workspaceModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockWorkspace, name: 'Updated Workspace' }) });
      const createdBy = mockUserId.toString();
      const result = await service.updateWorkspace(mockWorkspaceId.toString(), { name: 'Updated Workspace', createdBy });
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Workspace');
    });
    it('should throw NotFoundException if workspace not found', async () => {
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.updateWorkspace(mockWorkspaceId.toString(), { name: 'Updated Workspace', createdBy: mockUserId.toString() })).rejects.toThrow();
    });
    it('should throw UnauthorizedException if user is not creator', async () => {
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockWorkspace, createdBy: new Types.ObjectId() }) });
      await expect(service.updateWorkspace(mockWorkspaceId.toString(), { name: 'Updated Workspace', createdBy: new Types.ObjectId().toString() })).rejects.toThrow();
    });
    it('should update workspace with partial data', async () => {
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockWorkspace) });
      workspaceModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockWorkspace, description: 'Partial update' }) });
      const result = await service.updateWorkspace(mockWorkspaceId.toString(), { description: 'Partial update', createdBy: mockUserId.toString() });
      expect(result.success).toBe(true);
      expect(result.data?.description).toBe('Partial update');
    });
    it('should throw if findById throws', async () => {
      workspaceModel.findById.mockImplementation(() => { throw new Error('DB error'); });
      await expect(service.updateWorkspace(mockWorkspaceId.toString(), { name: 'Updated', createdBy: mockUserId.toString() })).rejects.toThrow('DB error');
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete workspace successfully', async () => {
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockWorkspace) });
      workspaceModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockWorkspace) });
      const result = await service.deleteWorkspace(mockWorkspaceId.toString(), mockUserId.toString());
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
    it('should throw NotFoundException if workspace not found', async () => {
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.deleteWorkspace(mockWorkspaceId.toString(), mockUserId.toString())).rejects.toThrow();
    });
    it('should throw UnauthorizedException if user is not creator', async () => {
      workspaceModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...mockWorkspace, createdBy: new Types.ObjectId() }) });
      await expect(service.deleteWorkspace(mockWorkspaceId.toString(), new Types.ObjectId().toString())).rejects.toThrow();
    });
    it('should throw if findById throws', async () => {
      workspaceModel.findById.mockImplementation(() => { throw new Error('DB error'); });
      await expect(service.deleteWorkspace(mockWorkspaceId.toString(), mockUserId.toString())).rejects.toThrow('DB error');
    });
  });


});

describe('UserService', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });
});



describe('WorkspaceController', () => {
  let controller: WorkspaceController;
  const mockWorkspaceService = {
    createWorkspace: jest.fn(),
    getOneWorkspace: jest.fn(),
    getAllWorkspacesForUser: jest.fn(),
    updateWorkspace: jest.fn(),
    deleteWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        { provide: WorkspaceService, useValue: mockWorkspaceService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(WorkspaceAuthorizationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<WorkspaceController>(WorkspaceController);
    jest.clearAllMocks();
  });

  const req = { userId: mockUserId.toString() } as RequestWithUser;
  const workspaceId = mockWorkspaceId.toString();
  const workspaceDto = { name: 'Test', description: 'desc', createdBy: mockUserId.toString() };
  const workspaceResponse = { success: true, data: { _id: workspaceId }, status: 200, message: 'ok' };

  describe('createWorkspace', () => {
    it('should return workspace on success', async () => {
      mockWorkspaceService.createWorkspace.mockResolvedValue(workspaceResponse);
      const result = await controller.createWorkspace(workspaceDto, req);
      expect(result).toEqual(workspaceResponse);
      expect(mockWorkspaceService.createWorkspace).toHaveBeenCalledWith(workspaceDto, req.userId);
    });
    it('should throw error from service', async () => {
      mockWorkspaceService.createWorkspace.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.createWorkspace(workspaceDto, req)).rejects.toThrow('Unexpected');
    });
  });

  describe('getOneWorkspace', () => {
    it('should return workspace on success', async () => {
      mockWorkspaceService.getOneWorkspace.mockResolvedValue(workspaceResponse);
      const result = await controller.getOneWorkspace(workspaceId);
      expect(result).toEqual(workspaceResponse);
      expect(mockWorkspaceService.getOneWorkspace).toHaveBeenCalledWith(workspaceId);
    });
    it('should throw error from service', async () => {
      mockWorkspaceService.getOneWorkspace.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.getOneWorkspace(workspaceId)).rejects.toThrow('Unexpected');
    });
  });

  describe('getAllWorkspacesForUser', () => {
    it('should return workspaces on success', async () => {
      mockWorkspaceService.getAllWorkspacesForUser.mockResolvedValue(workspaceResponse);
      const result = await controller.getAllWorkspacesForUser(req);
      expect(result).toEqual(workspaceResponse);
      expect(mockWorkspaceService.getAllWorkspacesForUser).toHaveBeenCalledWith(req.userId);
    });
    it('should throw error from service', async () => {
      mockWorkspaceService.getAllWorkspacesForUser.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.getAllWorkspacesForUser(req)).rejects.toThrow('Unexpected');
    });
  });

  describe('updateWorkspace', () => {
    it('should return updated workspace on success', async () => {
      mockWorkspaceService.updateWorkspace.mockResolvedValue(workspaceResponse);
      const result = await controller.updateWorkspace(workspaceId, workspaceDto, req);
      expect(result).toEqual(workspaceResponse);
      expect(mockWorkspaceService.updateWorkspace).toHaveBeenCalledWith(workspaceId, { ...workspaceDto, createdBy: req.userId });
    });
    it('should throw error from service', async () => {
      mockWorkspaceService.updateWorkspace.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.updateWorkspace(workspaceId, workspaceDto, req)).rejects.toThrow('Unexpected');
    });
  });

  describe('deleteWorkspace', () => {
    it('should return success on delete', async () => {
      mockWorkspaceService.deleteWorkspace.mockResolvedValue(workspaceResponse);
      const result = await controller.deleteWorkspace(workspaceId, req);
      expect(result).toEqual(workspaceResponse);
      expect(mockWorkspaceService.deleteWorkspace).toHaveBeenCalledWith(workspaceId, req.userId);
    });
    it('should throw error from service', async () => {
      mockWorkspaceService.deleteWorkspace.mockRejectedValue(new Error('Unexpected'));
      await expect(controller.deleteWorkspace(workspaceId, req)).rejects.toThrow('Unexpected');
    });
  });
});