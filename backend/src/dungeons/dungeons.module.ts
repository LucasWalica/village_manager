import { Module } from '@nestjs/common';
import { DungeonsService } from './dungeons.service';
import { DungeonsController } from './dungeons.controller';

@Module({
  controllers: [DungeonsController],
  providers: [DungeonsService],
})
export class DungeonsModule {}
