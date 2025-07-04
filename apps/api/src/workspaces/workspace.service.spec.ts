/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { getModelToken } from '@nestjs/mongoose';
import { Workspace } from '../schemas/workspace.schema';
import { User } from '../schemas/user.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guards';
import { JwtService } from '@nestjs/jwt';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let workspaceModel: any;
  let userModel: any;

  beforeEach(async () => {
    workspaceModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };
    userModel = {
      findByIdAndUpdate: jest.fn(),
    };
    const mockAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
    const mockJwtService = { verify: jest.fn().mockReturnValue({ userId: '123' }) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: getModelToken(Workspace.name), useValue: workspaceModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: AuthGuard, useValue: mockAuthGuard },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();
    service = module.get<WorkspaceService>(WorkspaceService);
    jest.clearAllMocks();
  });

  describe('createWorkspace', () => {
    it('should create a workspace and update user', async () => {
      const workspaceData = { name: 'Test', description: 'desc' };
      const createdBy = 'userId';
      const newWorkspace = { _id: 'ws1', ...workspaceData, members: [], createdBy };
      workspaceModel.create.mockResolvedValue(newWorkspace);
      userModel.findByIdAndUpdate.mockResolvedValue({ _id: createdBy });
      const result = await service.createWorkspace(workspaceData as any, createdBy);
      expect(result.success).toBe(true);
      expect(workspaceModel.create).toHaveBeenCalled();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
    });
    it('should throw if workspace creation fails', async () => {
      workspaceModel.create.mockResolvedValue(null);
      await expect(service.createWorkspace({} as any, 'userId')).rejects.toThrow(BadRequestException);
    });
    it('should throw if user update fails', async () => {
      workspaceModel.create.mockResolvedValue({ _id: 'ws1' });
      userModel.findByIdAndUpdate.mockResolvedValue(null);
      await expect(service.createWorkspace({} as any, 'userId')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOneWorkspace', () => {
    it('should return a workspace if found', async () => {
      const workspace = { _id: '507f1f77bcf86cd799439011', name: 'Test' };
      const validId = '507f1f77bcf86cd799439011';
      workspaceModel.findById.mockReturnValue({ populate: () => ({ exec: () => Promise.resolve(workspace) }) });
      const result = await service.getOneWorkspace(validId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(workspace);
    });
    it('should throw if workspace not found', async () => {
      const validId = '507f1f77bcf86cd799439011';
      workspaceModel.findById.mockReturnValue({ populate: () => ({ exec: () => Promise.resolve(null) }) });
      await expect(service.getOneWorkspace(validId)).rejects.toThrow(NotFoundException);
    });
  });
}); 