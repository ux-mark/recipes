import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint simply returns the status of the edit interface
  // It's a lightweight way for the client to check if the feature is enabled
  return NextResponse.json({
    editInterfaceEnabled: process.env.EDIT_INTERFACE === '1',
    env: process.env.NODE_ENV,
  });
}