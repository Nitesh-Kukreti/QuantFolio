
type UpstoxQuote = {
  instrument_token: string;
  last_price: number;
};

export async function getLatestPrices(
  instrumentKeys: string[]
): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  if (instrumentKeys.length === 0) {
    return priceMap;
  }

  const accessToken = process.env.UPSTOX_ANALYTICS_TOKEN;

  if (!accessToken) {
    throw new Error("UPSTOX_ANALYTICS_TOKEN is missing");
  }

  // Remove duplicate instrument keys
  const uniqueKeys = [...new Set(instrumentKeys)];

  // Upstox supports up to 500 instruments per request
  for (let i = 0; i < uniqueKeys.length; i += 500) {
    const batch = uniqueKeys.slice(i, i + 500);

    const params = new URLSearchParams({
      instrument_key: batch.join(","),
    });

    const response = await fetch(
      `https://api.upstox.com/v2/market-quote/quotes?${params}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Upstox API error: ${response.status} ${await response.text()}`
      );
    }

    const result = await response.json();

    const quotes = Object.values(
      result.data as Record<string, UpstoxQuote>
    );

    for (const quote of quotes) {
      if (
        quote.instrument_token &&
        typeof quote.last_price === "number"
      ) {
        priceMap.set(quote.instrument_token, quote.last_price);
      }
    }
  }

  return priceMap;
}
