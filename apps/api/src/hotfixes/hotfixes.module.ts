import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hotfix, HotfixSchema } from '../schemas/hotfix.schema';
import { Release, ReleaseSchema } from '../schemas/release.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { HotfixesController } from './hotfixes.controller';
import { HotfixesService } from './hotfixes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotfix.name, schema: HotfixSchema },
      { name: Release.name, schema: ReleaseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [HotfixesController],
  providers: [HotfixesService],
  exports: [HotfixesService],
})
export class HotfixesModule {}
