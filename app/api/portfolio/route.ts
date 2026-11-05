import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Prisma } from "@src/generated/prisma/client";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            holdings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ portfolios }, { status: 200 });
  } catch (error) {
    console.error("Fetch portfolios error:", error);

    return NextResponse.json(
      { error: "Failed to fetch portfolios" },
      { status: 500 },
    );
  }
}

import zlib from "zlib";
import path from "path";
import fs from "fs";
import { gunzipSync } from "zlib";


const filePath = path.join(process.cwd(), "data", "upstox-instruments.json.gz");

const compressedData = fs.readFileSync(filePath);
const jsonData = zlib.gunzipSync(compressedData).toString("utf-8");

const instruments = JSON.parse(jsonData);


type UpstoxInstrument = {
  instrument_key: string;
  trading_symbol: string;
  name: string;
  exchange: string;
  isin?: string;
  segment: string;
  instrument_type: string;
};

type UpstoxQuote = {
  instrument_token: string;
  last_price: number;
};

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 2. Parse request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;
    const { name, type, totalCapital, holdings } = data;

    // 3. Validate portfolio details
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return NextResponse.json(
        { error: "Portfolio name is required and must be at most 100 characters" },
        { status: 400 },
      );
    }

    if (type !== "manual" && type !== "ai") {
      return NextResponse.json(
        { error: "Type must be manual or ai" },
        { status: 400 },
      );
    }

    if (
      typeof totalCapital !== "number" ||
      !Number.isFinite(totalCapital) ||
      totalCapital <= 0 ||
      totalCapital > 9999999999999.99
    ) {
      return NextResponse.json(
        { error: "Total capital must be a valid positive number" },
        { status: 400 },
      );
    }

    if (!Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json(
        { error: "At least one holding is required" },
        { status: 400 },
      );
    }

    // 4. Validate holdings
    const seenInstrumentKeys = new Set<string>();

    const validatedHoldings: {
      instrumentKey: string;
      quantity: number;
    }[] = [];

    for (const holding of holdings) {
      if (
        typeof holding !== "object" ||
        holding === null ||
        Array.isArray(holding)
      ) {
        return NextResponse.json(
          { error: "Each holding must be a valid object" },
          { status: 400 },
        );
      }

      const item = holding as Record<string, unknown>;

      const instrumentKey =
        typeof item.instrumentKey === "string"
          ? item.instrumentKey.trim()
          : "";

      const quantity = item.quantity;

      if (!instrumentKey) {
        return NextResponse.json(
          { error: "Every holding must have a valid instrumentKey" },
          { status: 400 },
        );
      }

      if (seenInstrumentKeys.has(instrumentKey)) {
        return NextResponse.json(
          { error: "A stock can only appear once in a portfolio" },
          { status: 400 },
        );
      }

      if (
        typeof quantity !== "number" ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Quantity must be a positive integer" },
          { status: 400 },
        );
      }

      seenInstrumentKeys.add(instrumentKey);

      validatedHoldings.push({
        instrumentKey,
        quantity,
      });
    }

    // Upstox Full Market Quotes supports up to 500 instruments per request.
    if (validatedHoldings.length > 500) {
      return NextResponse.json(
        { error: "A maximum of 500 holdings is allowed per request" },
        { status: 400 },
      );
    }

    // 5. Read and decompress Upstox instrument master
    
    const filePath = path.join(
      process.cwd(),
      "data",
      "upstox-instruments.json.gz",
    );

    console.log("Current working directory:", process.cwd());
console.log("Instrument file path:", filePath);
console.log("File exists:", fs.existsSync(filePath));

    const compressedData = fs.readFileSync(filePath);

    const instruments = JSON.parse(
      gunzipSync(compressedData).toString("utf-8"),
    ) as UpstoxInstrument[];

    // 6. Find selected instruments in the master file
    const instrumentMap = new Map(
      instruments
        .filter(
          (instrument) =>
            (instrument.segment === "NSE_EQ" ||
              instrument.segment === "BSE_EQ") &&
            instrument.instrument_type === "EQ",
        )
        .map((instrument) => [
          instrument.instrument_key,
          instrument,
        ]),
    );

    const selectedInstruments: UpstoxInstrument[] = [];

    for (const holding of validatedHoldings) {
      const instrument = instrumentMap.get(holding.instrumentKey);

      if (!instrument) {
        return NextResponse.json(
          {
            error: `Invalid or unsupported equity instrument: ${holding.instrumentKey}`,
          },
          { status: 400 },
        );
      }

      selectedInstruments.push(instrument);
    }

    // 7. Fetch LTP for all selected instruments in ONE API request
    const accessToken = process.env.UPSTOX_ANALYTICS_TOKEN;

    if (!accessToken) {
      throw new Error("Upstox analytics token is not configured");
    }

    const instrumentKeys = validatedHoldings
      .map((holding) => holding.instrumentKey)
      .join(",");

    const quoteUrl = new URL(
      "https://api.upstox.com/v2/market-quote/quotes",
    );

    quoteUrl.searchParams.set("instrument_key", instrumentKeys);

    const quoteResponse = await fetch(quoteUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!quoteResponse.ok) {
      const errorText = await quoteResponse.text();

      console.error("Upstox quote error:", errorText);

      return NextResponse.json(
        { error: "Unable to fetch current market prices from Upstox" },
        { status: 502 },
      );
    }

    const quoteResult = await quoteResponse.json();

    if (
      quoteResult.status !== "success" ||
      typeof quoteResult.data !== "object" ||
      quoteResult.data === null
    ) {
      return NextResponse.json(
        { error: "Invalid quote response from Upstox" },
        { status: 502 },
      );
    }

    // Match each quote using its instrument_token
    const quoteMap = new Map<string, UpstoxQuote>();

    for (const quote of Object.values(
      quoteResult.data as Record<string, UpstoxQuote>,
    )) {
      if (
        quote &&
        typeof quote.instrument_token === "string" &&
        typeof quote.last_price === "number" &&
        Number.isFinite(quote.last_price) &&
        quote.last_price > 0
      ) {
        quoteMap.set(quote.instrument_token, quote);
      }
    }

    // 8. Calculate total investment using fetched LTP
    let totalInvestment = new Prisma.Decimal(0);

    const holdingRecords: {
      stockId: string;
      quantity: number;
      purchasePrice: Prisma.Decimal;
    }[] = [];

    const capital = new Prisma.Decimal(totalCapital);

    // Store prices separately for use inside the transaction
    const priceMap = new Map<string, Prisma.Decimal>();

    for (const holding of validatedHoldings) {
      const quote = quoteMap.get(holding.instrumentKey);

      if (!quote) {
        return NextResponse.json(
          {
            error: `Current price unavailable for ${holding.instrumentKey}`,
          },
          { status: 400 },
        );
      }

      const purchasePrice = new Prisma.Decimal(
        quote.last_price.toString(),
      );

      priceMap.set(holding.instrumentKey, purchasePrice);

      const investment = purchasePrice.mul(holding.quantity);

      totalInvestment = totalInvestment.add(investment);
    }

    if (totalInvestment.greaterThan(capital)) {
      return NextResponse.json(
        {
          error: "Total investment exceeds the available capital",
          totalInvestment: totalInvestment.toString(),
          totalCapital: capital.toString(),
        },
        { status: 400 },
      );
    }

    // 9. Populate stock table and create portfolio atomically
    const portfolio = await prisma.$transaction(async (tx) => {
      for (const instrument of selectedInstruments) {
        await tx.stock.upsert({
          where: {
            instrumentKey: instrument.instrument_key,
          },
          update: {
            symbol: instrument.trading_symbol,
            name: instrument.name,
            exchange: instrument.exchange,
            isin: instrument.isin || null,
          },
          create: {
            instrumentKey: instrument.instrument_key,
            symbol: instrument.trading_symbol,
            name: instrument.name,
            exchange: instrument.exchange,
            isin: instrument.isin || null,
          },
        });
      }

      // Fetch the IDs of the stocks after upserting them
      const stocks = await tx.stock.findMany({
        where: {
          instrumentKey: {
            in: validatedHoldings.map(
              (holding) => holding.instrumentKey,
            ),
          },
        },
        select: {
          id: true,
          instrumentKey: true,
        },
      });

      const stockMap = new Map(
        stocks.map((stock) => [
          stock.instrumentKey,
          stock,
        ]),
      );

      for (const holding of validatedHoldings) {
        const stock = stockMap.get(holding.instrumentKey);
        const purchasePrice = priceMap.get(holding.instrumentKey);

        if (!stock || !purchasePrice) {
          throw new Error(
            `Unable to prepare holding: ${holding.instrumentKey}`,
          );
        }

        holdingRecords.push({
          stockId: stock.id,
          quantity: holding.quantity,
          purchasePrice,
        });
      }

      return tx.portfolio.create({
        data: {
          name: name.trim(),
          type,
          totalCapital: capital,
          userId: session.user.id,

          holdings: {
            create: holdingRecords,
          },
        },
        include: {
          holdings: {
            include: {
              stock: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Portfolio created successfully",
        portfolio,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create portfolio error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A duplicate record was detected" },
        { status: 409 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { error: "A referenced record does not exist" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create portfolio" },
      { status: 500 },
    );
  }
}

