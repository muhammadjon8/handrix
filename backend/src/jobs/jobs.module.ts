import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { DispatchModule } from '../dispatch/dispatch.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DispatchModule, NotificationsModule],
  providers: [JobsService],
  controllers: [JobsController],
})
export class JobsModule {}
