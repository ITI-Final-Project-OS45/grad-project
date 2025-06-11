import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guards';
import { AppService } from './app.service';

@UseGuards(AuthGuard)
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  protectedRoutes(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return { message: 'Accessed Resource', userId: req.userId };
  }
}
