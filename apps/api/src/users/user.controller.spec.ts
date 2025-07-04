import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guards';
import { JwtService } from '@nestjs/jwt';


describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findOneUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };
  const mockJwtService = {
    verify: jest.fn().mockReturnValue({ userId: '123' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthGuard, useValue: mockAuthGuard },
        { provide: JwtService, useValue: mockJwtService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should call findOneUser with correct params', async () => {
    const req = { userId: '123' };
    await controller.findOneUser('123', req as any);
    expect(mockUserService.findOneUser).toHaveBeenCalledWith('123', '123');
  });

  it('should call updateUser with correct params', async () => {
    const data = { displayName: 'new' };
    await controller.updateUser('123', data, { userId: '123' } as any);
    expect(mockUserService.updateUser).toHaveBeenCalledWith('123', data, '123');
  });

  it('should call deleteUser with correct params', async () => {
    const req = { userId: '123' };
    await controller.deleteUser('123', req as any);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith('123', '123');
  });
});
