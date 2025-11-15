/**
 * Health Check Endpoint
 *
 * Used by Digital Ocean App Platform to monitor application health.
 * Returns 200 OK if the application is running correctly.
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check - can be extended to check database, external services, etc.
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      service: "leadscout-web",
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    const errorStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
