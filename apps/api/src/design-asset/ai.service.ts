import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTaskDto, TaskResponse, WorkspaceMemberDto } from '@repo/types';

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  // static async generateText(prompt: string, file: File){
  async generateText(
    file: Express.Multer.File,
    fileType: string,
    workspaceDescription: string,
  ) {
    // Prepare request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `A design mockup part of the Software Project (${workspaceDescription}). generate a clear, short, plain text with no markdown formatting description for the other members of the project to understand the design.`, // todo add as a context workspace description
            },
            {
              inline_data: {
                mime_type: fileType,
                data: this.fileToBase64(file),
              },
            },
          ],
        },
      ],
    };

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-goog-api-key': `${this.config.get('GEMINI_API_SECRET_KEY')}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    return data?.candidates[0]?.content?.parts[0].text || 'No Description.';
  }

  async generateTasks(
    prd: string,
    workspaceMembers: WorkspaceMemberDto[],
    workspaceId: string,
  ): Promise<string> {
    // Prepare request payload
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `for a software project (of workspaceId = ${workspaceId}) of the following PRD: ${prd} and the following members ${JSON.stringify(workspaceMembers)}, generate a list of tasks for the project in the form of (without any other text or markdown formatting) array of mongoose documents of the schema
@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, enum: ['todo', 'in-progress', 'done'] })
  status!: 'todo' | 'in-progress' | 'done';

  @Prop({ type: [String], required: true })
  assignedTo!: string[];

  @Prop()
  description?: string;

  @Prop({ required: true })
  workspaceId!: string;

  @Prop()
  dueDate?: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority?: 'low' | 'medium' | 'high';

  @Prop({ required: true })
  position!: number;
}
`,
            },
          ],
        },
      ],
    };
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-goog-api-key': `${this.config.get('GEMINI_API_SECRET_KEY')}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    return data?.candidates[0]?.content?.parts[0].text || 'No Description.';
  }

  fileToBase64(file: Express.Multer.File) {
    const base64file = file.buffer.toString('base64');
    return base64file;
  }
}
