import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { config } from '../config';
import { FarmEntity, UserEntity } from '../database/entities';
import { LoginDto, RegisterDto } from './dto';
import { PushTokenDto } from './push-token.dto';
import { AdminLoginDto } from './admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(FarmEntity) private readonly farms: Repository<FarmEntity>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (await this.users.findOneBy({ phone: dto.phone })) throw new ConflictException('Phone already registered');
    const farm = await this.farms.save(this.farms.create({
      ownerName: dto.ownerName, phone: dto.phone, region: dto.region, flockSize: dto.flockSize, birdType: dto.birdType,
    }));
    const user = await this.users.save(this.users.create({ phone: dto.phone, pinHash: await hash(dto.pin, 10), farmId: farm.id, role: 'farmer' }));
    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOneBy({ phone: dto.phone });
    if (!user || !(await compare(dto.pin, user.pinHash))) throw new UnauthorizedException('Invalid phone or PIN');
    return this.issueToken(user);
  }

  async savePushToken(userId: string, dto: PushTokenDto): Promise<{ registered: true }> {
    await this.users.update(userId, { pushToken: dto.token, pushPlatform: dto.platform });
    return { registered: true };
  }

  async adminLogin(dto: AdminLoginDto) {
    const user = await this.users.findOneBy({ email: dto.email.toLowerCase(), role: 'admin' });
    if (!user?.passwordHash || !(await compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid admin credentials');
    return this.issueToken(user);
  }

  private issueToken(user: UserEntity) {
    const payload = { id: user.id, phone: user.phone, email: user.email, role: user.role, farmId: user.farmId };
    return { accessToken: this.jwt.sign(payload, { secret: config.jwtSecret }), user: payload };
  }
}
