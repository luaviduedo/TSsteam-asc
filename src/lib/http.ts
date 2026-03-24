import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function failure(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details ?? null,
      },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled error:", error);

  return NextResponse.json(
    {
      error: "Erro interno do servidor.",
      code: "INTERNAL_ERROR",
      details: null,
    },
    { status: 500 },
  );
}
