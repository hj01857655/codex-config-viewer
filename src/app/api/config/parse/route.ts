import { NextResponse } from "next/server";

import { safelyParseConfigToml } from "@/lib/config/toml";

export async function POST(request: Request) {
  const body = (await request.json()) as { toml?: unknown };

  if (typeof body.toml !== "string") {
    return NextResponse.json(
      {
        error: {
          message: "Expected a `toml` string in the request body.",
        },
      },
      { status: 400 },
    );
  }

  const result = safelyParseConfigToml(body.toml);

  if ("error" in result) {
    return NextResponse.json(
      {
        error: result.error,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(result);
}
