import { NextResponse } from "next/server";

import { safelyGenerateConfigToml } from "@/lib/config/toml";
import type { ConfigDraft } from "@/lib/config/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    draft?: ConfigDraft;
    unsupportedToml?: unknown;
  };

  if (!body.draft || typeof body.draft !== "object") {
    return NextResponse.json(
      {
        error: {
          message: "Expected a `draft` object in the request body.",
        },
      },
      { status: 400 },
    );
  }

  if (body.unsupportedToml !== undefined && typeof body.unsupportedToml !== "string") {
    return NextResponse.json(
      {
        error: {
          message: "`unsupportedToml` must be a string when provided.",
        },
      },
      { status: 400 },
    );
  }

  const result = safelyGenerateConfigToml(body.draft, body.unsupportedToml);

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
