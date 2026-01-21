import { Test, TestingModule } from '@nestjs/testing';
import { DungeonsService } from './dungeons.service';

describe('DungeonsService', () => {
  let service: DungeonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DungeonsService],
    }).compile();

    service = module.get<DungeonsService>(DungeonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
