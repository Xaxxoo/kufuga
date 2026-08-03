import { IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

export class RegisterDto {
  @IsString() @Length(2, 120) ownerName!: string;
  @IsString() @Matches(/^\+?[0-9]{7,15}$/) phone!: string;
  @IsString() @Length(4, 8) pin!: string;
  @IsString() @Length(2, 120) region!: string;
  @IsInt() @Min(1) flockSize!: number;
  @IsString() @Matches(/^(broiler|layer)$/) birdType!: 'broiler' | 'layer';
}

export class LoginDto {
  @IsString() @Matches(/^\+?[0-9]{7,15}$/) phone!: string;
  @IsString() @Length(4, 8) pin!: string;
}

export class ProvisionDeviceDto {
  @IsString() farmId!: string;
  @IsString() @Length(1, 120) label!: string;
  @IsString() simNumber!: string;
  @IsString() @Matches(/^(KE|GH)$/) country!: 'KE' | 'GH';
  @IsOptional() @IsInt() @Min(0) calibrationR0?: number;
}
