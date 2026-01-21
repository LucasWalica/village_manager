import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { CharacterType, CharacterClass } from '../entities/character-template.entity';

export class CreateCharacterDto {
  @IsString()
  name: string;

  @IsEnum(CharacterType)
  type: CharacterType;

  @IsEnum(CharacterClass)
  class: CharacterClass;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsString()
  avatarPath?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goldCost?: number;
}
