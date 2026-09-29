import { IsString, MaxLength, MinLength } from 'class-validator';

// docs/05 Ask AI: { message }.
export class ChatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message!: string;
}
