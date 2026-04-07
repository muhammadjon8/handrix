import { Module } from '@nestjs/common';
import { HandymenService } from './handymen.service';
import { HandymenController } from './handymen.controller';

@Module({
  providers: [HandymenService],
  controllers: [HandymenController]
})
export class HandymenModule {}
