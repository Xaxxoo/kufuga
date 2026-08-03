import { IsIn, IsString, Length } from 'class-validator';

export class PushTokenDto {
  @IsString() @Length(10, 512) token!: string;
  @IsIn(['ios', 'android']) platform!: 'ios' | 'android';
}
