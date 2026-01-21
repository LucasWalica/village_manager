import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

export class UpdateCharacterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  experience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentHp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentMp?: number;

  @IsOptional()
  @IsBoolean()
  isAlive?: boolean;

  @IsOptional()
  @IsArray()
  skillIds?: number[];

  @IsOptional()
  position?: { x: number; y: number };
}
