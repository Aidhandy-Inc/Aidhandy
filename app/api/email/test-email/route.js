import { NextResponse } from 'next/server';
import { EmailService } from '@/libs/email-service';
import { emailTemplates } from '@/libs/email-templates';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, name } = body;

    if (!to || !name) {
      return NextResponse.json(
        { error: 'Missing to or name' },
        { status: 400 }
      );
    }

    const template = emailTemplates.test(name);
    
    const result = await EmailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent!',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}