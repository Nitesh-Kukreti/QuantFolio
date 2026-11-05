import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.upstox.com/v2/market-quote/quotes?instrument_key=NSE_EQ%7CINE467B01029",
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTOX_ANALYTICS_TOKEN}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Upstox" },
      { status: 500 }
    );
  }
}