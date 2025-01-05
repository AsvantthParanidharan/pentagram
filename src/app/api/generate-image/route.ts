import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { blob } from "stream/consumers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text
    const modal_generate_url = process.env.MODAL_GENERATE_URL;
    const url = new URL(modal_generate_url || "");

    url.searchParams.set("prompt", text);

    console.log("Requesting URL", url.toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY": process.env.API_KEY || "",
        Accept: "image/jpeg",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Reponse:", errorText);
      throw new Error(
        `HTTP error! statusL ${response.status}, message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();

    const filename = `${crypto.randomUUID()}.jpg`;

    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
