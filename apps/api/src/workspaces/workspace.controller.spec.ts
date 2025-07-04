import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guards';
import { JwtService } from '@nestjs/jwt';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import { getModelToken } from '@nestjs/mongoose';
import { Workspace } from '../schemas/workspace.schema';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  const mockWorkspaceService = {
    getOneWorkspace: jest.fn(),
  };
  const mockAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockJwtService = { verify: jest.fn().mockReturnValue({ userId: '123' }) };
  const mockWorkspaceAuthorizationGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockWorkspaceModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: AuthGuard, useValue: mockAuthGuard },
        { provide: JwtService, useValue: mockJwtService },
        { provide: WorkspaceAuthorizationGuard, useValue: mockWorkspaceAuthorizationGuard },
        { provide: getModelToken(Workspace.name), useValue: mockWorkspaceModel },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(WorkspaceAuthorizationGuard)
      .useValue(mockWorkspaceAuthorizationGuard)
      .compile();
    controller = module.get<WorkspaceController>(WorkspaceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOneWorkspace', () => {
    it('should return workspace if found', async () => {
      const workspace = { _id: '507f1f77bcf86cd799439011', name: 'Test' };
      mockWorkspaceService.getOneWorkspace.mockResolvedValue({ success: true, data: workspace });
      const result = await controller.getOneWorkspace('507f1f77bcf86cd799439011');
      expect(result.data).toEqual(workspace);
      expect(mockWorkspaceService.getOneWorkspace).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
    it('should throw if not found', async () => {
      mockWorkspaceService.getOneWorkspace.mockRejectedValue(new NotFoundException());
      await expect(controller.getOneWorkspace('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });
}); 