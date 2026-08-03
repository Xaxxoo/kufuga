import { IsIn, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReadingsQueryDto {
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
  @IsOptional() @IsIn(['raw', 'hour', 'day']) resolution: 'raw' | 'hour' | 'day' = 'raw';
}

export class SinceQueryDto {
  @IsOptional() @IsString() since?: string;
}

export class IdParamDto { @IsUUID() id!: string; }
