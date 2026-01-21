import { Test, TestingModule } from '@nestjs/testing';
import { DungeonsController } from './dungeons.controller';
import { DungeonsService } from './dungeons.service';

describe('DungeonsController', () => {
  let controller: DungeonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DungeonsController],
      providers: [DungeonsService],
    }).compile();

    controller = module.get<DungeonsController>(DungeonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
