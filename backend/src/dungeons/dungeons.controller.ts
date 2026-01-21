import { Controller } from '@nestjs/common';
import { DungeonsService } from './dungeons.service';

@Controller('dungeons')
export class DungeonsController {
  constructor(private readonly dungeonsService: DungeonsService) {}
}
