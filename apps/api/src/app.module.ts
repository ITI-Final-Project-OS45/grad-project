import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthGuard } from './guards/auth.guards';

import config from './config/config';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ReleasesModule } from './releases/releases.module';
import { WorkspaceMembersModule } from './workspace-members/workspace-members.module';
import { DesignAssetModule } from './design-asset/design-asset.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [config],
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
      }),
      inject: [ConfigService],
      global: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.connectionString'),
      }),

      inject: [ConfigService],
    }),
    AuthModule, // This needs to come before providers that use its exports
    UsersModule,
    WorkspacesModule,
    DesignAssetModule,
    ReleasesModule,
    WorkspaceMembersModule, // Assuming this is the module for workspace members
    DesignAssetModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
