import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IntakeService } from './intake.service';
import { IntakeChatDto } from './intake.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Job Intake')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('intake')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Send a message to the AI intake assistant',
    description:
      'Pass the full conversation history each time. The AI will either ask a follow-up question (type: "message") or return a classification (type: "classification") when it has enough information.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI reply or job classification',
    schema: {
      oneOf: [
        {
          properties: {
            type: { type: 'string', example: 'message' },
            message: { type: 'string', example: 'Where exactly is the leak? Under the sink or at the wall joint?' },
          },
        },
        {
          properties: {
            type: { type: 'string', example: 'classification' },
            message: { type: 'string' },
            classified_job: {
              properties: {
                job_type: { type: 'string', example: 'pipe_leak' },
                description: { type: 'string' },
                estimated_duration_hours: { type: 'number', example: 1.5 },
                materials: { type: 'array' },
              },
            },
          },
        },
      ],
    },
  })
  async chat(@Body() body: IntakeChatDto) {
    return this.intakeService.chat(body.messages);
  }
}
