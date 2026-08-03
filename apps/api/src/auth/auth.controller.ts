import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard, type AuthUser } from './auth.guard';
import { PushTokenDto } from './push-token.dto';
import { AdminLoginDto } from './admin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Post('admin/login') adminLogin(@Body() dto: AdminLoginDto) { return this.auth.adminLogin(dto); }
  @Post('push-token') @UseGuards(JwtAuthGuard) savePushToken(@Req() request: { user: AuthUser }, @Body() dto: PushTokenDto) { return this.auth.savePushToken(request.user.id, dto); }
}
