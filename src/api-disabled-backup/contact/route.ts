import { NextRequest, NextResponse } from 'next/server';
import { FormHandler, FormSubmissionData } from '@/lib/form-handler';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: Partial<FormSubmissionData> = await request.json();

    // Get client information
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || request.ip;

    // Process the form submission
    const result = await FormHandler.processSubmission(formData, {
      userAgent,
      ipAddress,
    });

    // Return appropriate response
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('API route error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
