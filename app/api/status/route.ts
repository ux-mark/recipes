import { NextResponse } from 'next/server';

// Consistent function to check if edit interface is enabled
// Using the same pattern across all API routes
function isEditEnabled() {
  return process.env.EDIT_INTERFACE === '1';
}

// Function to check if design system is enabled
function isDesignSystemEnabled() {
  // More flexible check: accept 'true' or '1'
  const designSystemFlag = process.env.ENABLE_DESIGN_SYSTEM;
  return designSystemFlag === 'true' || 
         designSystemFlag === '1';
}

export async function GET() {
  // This endpoint simply returns the status of the edit interface
  // It's a lightweight way for the client to check if the feature is enabled
  return NextResponse.json({
    editInterfaceEnabled: isEditEnabled(),
    designSystemEnabled: isDesignSystemEnabled(),
    env: process.env.NODE_ENV,
  });
}