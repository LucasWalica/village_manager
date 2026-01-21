import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { Character } from './entities/character.entity';
import { CharacterTemplate } from './entities/character-template.entity';
import { CharacterStats } from './entities/character-stats.entity';
import { Skill } from './entities/skill.entity';
import { Item } from './entities/item.entity';
import { Inventory } from './entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      CharacterTemplate,
      CharacterStats,
      Skill,
      Item,
      Inventory,
    ]),
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}
