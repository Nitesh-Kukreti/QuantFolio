import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Enter at least 2 characters" },
        { status: 400 },
      );
    }

    if (query.length > 50) {
      return NextResponse.json(
        { error: "Search query is too long" },
        { status: 400 },
      );
    }

    const token = process.env.UPSTOX_ANALYTICS_TOKEN;

    if (!token) {
      throw new Error("Upstox token is missing");
    }

    const params = new URLSearchParams({
      query,
      exchanges: "NSE",
      segments: "EQ",
      page_number: "1",
      records: "5",
    });

    const response = await fetch(
      `https://api.upstox.com/v2/instruments/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    const instruments = data.data;
    const instrumentKeys = instruments
      .map((stock: any) => stock.instrument_key)
      .join(",");

    const quoteParams = new URLSearchParams({
      instrument_key: instrumentKeys,
    });

    const quoteResponse = await fetch(
      `https://api.upstox.com/v2/market-quote/quotes?${quoteParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const quoteData = await quoteResponse.json();

    if (!quoteResponse.ok) {
      console.error("Quote API error:", quoteData);

      throw new Error("Failed to fetch stock prices");
    }

    const stocksWithPrices = instruments.map((stock: any) => {
      const quoteKey = `${stock.segment}:${stock.trading_symbol}`;

      const quote = quoteData.data[quoteKey];

      return {
        ...stock,
        ltp: quote?.last_price ?? null,
      };
    });

    return NextResponse.json({
      data: stocksWithPrices,
    });
  } catch (error) {
    console.error("Stock search error:", error);

    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 },
    );
  }
}
