import { Body, Controller, Get, Patch, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './jobs.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Patch(':id/status')
  @Roles('admin', 'handyman') // Only admin or assigned handyman should update status
  @ApiOperation({ summary: 'Update job status (Real-time)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.jobsService.updateStatus(Number(id), status);
  }

  @Post(':id/accept')
  @Roles('handyman')
  @ApiOperation({ summary: 'Handyman accepts a job' })
  async acceptJob(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.acceptJob(Number(id), req.user.id);
  }

  @Post()
  @Roles('client')
  @ApiOperation({ summary: 'Create a new job (service request)' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async create(@Request() req: any, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user.id, dto);
  }

  @Get()
  @Roles('client')
  @ApiOperation({ summary: 'List all jobs for the authenticated client' })
  async list(@Request() req: any) {
    return this.jobsService.findByClient(req.user.id);
  }
}
