import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Mobile-Session-Token",
  "Access-Control-Max-Age": "86400",
} as const;

function getAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin || "*";
}

export function withMobileCors(request: Request, response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", getAllowedOrigin(request));
  response.headers.set("Vary", "Origin");

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export function mobileJson(
  request: Request,
  body: unknown,
  init?: ConstructorParameters<typeof NextResponse.json>[1],
) {
  return withMobileCors(request, NextResponse.json(body, init));
}

export function mobileOptions(request: Request) {
  return withMobileCors(request, new NextResponse(null, { status: 204 }));
}
