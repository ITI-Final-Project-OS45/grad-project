import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiService {
    constructor(private config:ConfigService){}
    
    // static async generateText(prompt: string, file: File){
    async generateText(file: Express.Multer.File, fileType: string, workspaceDescription: string){
        // Prepare request payload
        const payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": `A design mockup part of the Software Project (${workspaceDescription}). generate a clear, short, plain text with no markdown formatting description for the other members of the project to understand the design.` // todo add as a context workspace description
                        },
                        {
                            inline_data: {
                                "mime_type": fileType,
                                "data":  this.fileToBase64(file)
                            }
                        }
                    ]
                }
            ]
        };
        console.log('[sendMessage] Sending payload:', payload);
        
        const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-goog-api-key': `${this.config.get('GEMINI_API_SECRET_KEY')}`
            },
            body: JSON.stringify(payload)
        });
        console.log('[sendMessage] Response status:', res.status);
        
        const data = await res.json();
        // console.log('[sendMessage] API response:', data);

        return data?.candidates[0]?.content?.parts[0].text || 'No Description.';
        // return data;
    }

     fileToBase64(file: Express.Multer.File) {
        const base64file = file.buffer.toString('base64');
        return base64file;
    }

    
 
}