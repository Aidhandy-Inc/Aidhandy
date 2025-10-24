import { NextResponse } from 'next/server';
import { SmsService } from '@/libs/sms-service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, body: messageBody } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: to (phone number)' 
        },
        { status: 400 }
      );
    }

    if (!messageBody) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: body (message content)' 
        },
        { status: 400 }
      );
    }

    // Validate phone number format (basic E.164 format check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid phone number format. Must be E.164 format: +1234567890' 
        },
        { status: 400 }
      );
    }

    console.log('📱 SMS API Called');
    console.log('📱 To:', to);
    console.log('📱 Message:', messageBody);

    // Send the SMS
    const result = await SmsService.sendSMS({
      to,
      body: messageBody
    });

    // Return the result
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ SMS API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use POST to send SMS.' 
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use POST to send SMS.' 
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use POST to send SMS.' 
    },
    { status: 405 }
  );
}