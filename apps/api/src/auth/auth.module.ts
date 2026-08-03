import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../config';
import { FarmEntity, UserEntity } from '../database/entities';
import { AuthController } from './auth.controller';
import { JwtAuthGuard, AdminGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({ secret: config.jwtSecret }), TypeOrmModule.forFeature([UserEntity, FarmEntity])],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard, JwtModule],
})
export class AuthModule {}
