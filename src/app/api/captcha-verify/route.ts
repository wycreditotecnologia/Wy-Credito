import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Turnstile secret key no configurada" },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return NextResponse.json({ success: !!data?.success });
  } catch (error) {
    return NextResponse.json(
      { error: "Fallo al verificar Captcha" },
      { status: 500 }
    );
  }
}