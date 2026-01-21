import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DungeonsModule } from './dungeons/dungeons.module';
import { CharactersModule } from './characters/characters.module';
import { BuildingsModule } from './buildings/buildings.module';
import { User } from './auth/entities/user.entity';
import { Character } from './characters/entities/character.entity';
import { CharacterTemplate } from './characters/entities/character-template.entity';
import { CharacterStats } from './characters/entities/character-stats.entity';
import { Skill } from './characters/entities/skill.entity';
import { Item } from './characters/entities/item.entity';
import { Inventory } from './characters/entities/inventory.entity';
import { Battle } from './combat/entities/battle.entity';
import { BattleParticipant } from './combat/entities/battle-participant.entity';
import { BattleTurn } from './combat/entities/battle-turn.entity';
import { BattleAction } from './combat/entities/battle-action.entity';
import { Enemy } from './enemies/entities/enemy.entity';
import { EnemyTemplate } from './enemies/entities/enemy-template.entity';
import { EnemyStats } from './enemies/entities/enemy-stats.entity';
import { Dungeon } from './dungeons/entities/dungeon.entity';
import { DungeonRoom } from './dungeons/entities/dungeon-room.entity';
import { DungeonEncounter } from './dungeons/entities/dungeon-encounter.entity';
import { DungeonRun } from './dungeons/entities/dungeon-run.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST') || 'postgres',
        port: configService.get<number>('DATABASE_PORT') || 5432,
        username: configService.get<string>('DATABASE_USER') || 'admin',
        password: configService.get<string>('DATABASE_PASSWORD') || 'password123',
        database: configService.get<string>('DATABASE_NAME') || 'village_manager',
        entities: [
          User,
          Character,
          CharacterTemplate,
          CharacterStats,
          Skill,
          Item,
          Inventory,
          Battle,
          BattleParticipant,
          BattleTurn,
          BattleAction,
          Enemy,
          EnemyTemplate,
          EnemyStats,
          Dungeon,
          DungeonRoom,
          DungeonEncounter,
          DungeonRun,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BuildingsModule,
    CharactersModule,
    DungeonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
