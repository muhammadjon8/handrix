import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'], example: 'user' })
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({ example: 'My kitchen sink is leaking under the pipes.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class IntakeChatDto {
  @ApiProperty({
    type: [ChatMessageDto],
    description: 'Full conversation history including the latest user message',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
