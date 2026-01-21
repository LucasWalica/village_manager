import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DungeonsModule } from './dungeons/dungeons.module';
import { CharactersModule } from './characters/characters.module';
import { BuildingsModule } from './buildings/buildings.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, BuildingsModule, CharactersModule, DungeonsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
