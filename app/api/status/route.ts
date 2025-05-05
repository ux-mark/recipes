import { NextResponse } from 'next/server';

// Consistent function to check if edit interface is enabled
// Using the same pattern across all API routes
function isEditEnabled() {
  return process.env.EDIT_INTERFACE === '1';
}

export async function GET() {
  // This endpoint simply returns the status of the edit interface
  // It's a lightweight way for the client to check if the feature is enabled
  return NextResponse.json({
    editInterfaceEnabled: isEditEnabled(),
    env: process.env.NODE_ENV,
  });
}