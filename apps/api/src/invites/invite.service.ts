import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invite, InviteDocument } from '../schemas/invite.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ApiResponse, ApiError, UserRole } from '@repo/types';
import { InviteStatus } from '@repo/types';

@Injectable()
export class InviteService {
  constructor(
    @InjectModel(Invite.name)
    private readonly inviteModel: Model<InviteDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createInvite(
    workspaceId: string,
    usernameOrEmail: string,
    invitedBy: string,
    role: UserRole,
  ): Promise<ApiResponse<Invite, ApiError>> {
    // Only manager can invite
    const workspace = await this.workspaceModel.findById(workspaceId).lean();
    if (!workspace) throw new NotFoundException('Workspace not found');

    const manager = workspace.members.find(
      (m: { userId: string | { toString(): string }; role: string }) =>
        (typeof m.userId === 'string' ? m.userId : m.userId?.toString?.()) ===
          invitedBy && m.role === 'manager',
    );
    if (!manager) throw new ForbiddenException('Only manager can invite');

    // Find user by username or email
    const user = await this.userModel
      .findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    const userId = user._id.toString();

    // User must not be a member
    const isMember = workspace.members.some(
      (m: { userId: string | { toString(): string } }) =>
        (typeof m.userId === 'string' ? m.userId : m.userId?.toString?.()) ===
        userId,
    );
    if (isMember) throw new BadRequestException('User is already a member');

    // Check for existing pending invite
    const existingInvite = await this.inviteModel.findOne({
      userId,
      workspaceId,
      status: InviteStatus.PENDING,
    });
    if (existingInvite) throw new BadRequestException('Invite already pending');

    const invite = await this.inviteModel.create({
      userId,
      workspaceId,
      invitedBy,
      role,
      status: InviteStatus.PENDING,
      sentAt: new Date(),
    });

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Invite created',
      data: invite,
    };
  }

  async respondToInvite(
    inviteId: string,
    userId: string,
    action: 'accept' | 'decline',
  ): Promise<ApiResponse<Invite, ApiError>> {
    const invite = await this.inviteModel.findById(inviteId).exec();
    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.userId.toString() !== userId)
      throw new ForbiddenException('Not your invite');

    if (invite.status !== InviteStatus.PENDING)
      throw new BadRequestException('Invite already responded');

    if (action === 'accept') {
      invite.status = InviteStatus.ACCEPTED;
      invite.acceptedAt = new Date();
      // Add user to workspace members with the invited role
      await this.workspaceModel.updateOne(
        { _id: invite.workspaceId, 'members.userId': { $ne: userId } },
        {
          $push: {
            members: {
              userId: invite.userId,
              role: invite.role, // use the role from the invite
              joinedAt: new Date(),
            },
          },
        },
      );
      // Add workspace to user's workspaces
      await this.userModel.updateOne(
        { _id: userId, workspaces: { $ne: invite.workspaceId } },
        { $push: { workspaces: invite.workspaceId } },
      );
    } else if (action === 'decline') {
      invite.status = InviteStatus.DECLINED;
    }
    await invite.save();

    return {
      success: true,
      status: HttpStatus.OK,
      message: action === 'accept' ? 'Invite accepted' : 'Invite declined',
      data: invite,
    };
  }

  async getInvitesForUser(
    userId: string,
  ): Promise<ApiResponse<Invite[], ApiError>> {
    const invites = await this.inviteModel
      .find({ userId })
      .populate({
        path: 'workspaceId',
        select: 'name description',
      })
      .populate({
        path: 'invitedBy',
        select: 'username displayName email',
      })
      .exec();
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Invites fetched',
      data: invites,
    };
  }

  async getInvitesForWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<Invite[], ApiError>> {
    const invites = await this.inviteModel
      .find({ workspaceId })
      .populate({
        path: 'userId',
        select: 'username displayName email',
      })
      .exec();
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Invites fetched',
      data: invites,
    };
  }

  async deleteInvite(
    inviteId: string,
    managerId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    // Find the invite and its workspace
    const invite = await this.inviteModel.findById(inviteId).exec();
    if (!invite) throw new NotFoundException('Invite not found');

    const workspace = await this.workspaceModel
      .findById(invite.workspaceId)
      .exec();
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Check if the requester is a manager in the workspace
    const isManager = workspace.members.some(
      (m: { userId: string | { toString(): string }; role: string }) =>
        (typeof m.userId === 'string' ? m.userId : m.userId?.toString()) ===
          managerId && m.role === 'manager',
    );
    if (!isManager)
      throw new ForbiddenException('Only manager can delete invites');

    await this.inviteModel.findByIdAndDelete(inviteId);

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Invite deleted successfully',
      data: null,
    };
  }
}
