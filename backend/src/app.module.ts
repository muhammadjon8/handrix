import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { IntakeModule } from './intake/intake.module';
import { PricingModule } from './pricing/pricing.module';
import { JobsModule } from './jobs/jobs.module';
import { SocketModule } from './socket/socket.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [AuthModule, IntakeModule, PricingModule, JobsModule, SocketModule, DispatchModule, NotificationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
