
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BriefcaseBusiness,
  Wallet,
  Layers3,
  ArrowUpRight,
  Rocket,
  PiggyBank,
  Coins,
} from "lucide-react";

type Holding = {
  quantity: number | string;
  purchasePrice: number | string;
  stock: {
    instrumentKey: string;
  };
  currentPrice?: number | string | null;
};

type Portfolio = {
  id: string;
  name: string;
  type: string;
  status: "draft" | "active" | "inactive" | "closed";
  totalCapital: number | string;
  currentValue?: number | string | null;
  holdings?: Holding[];
  _count?: {
    holdings: number;
  };
  createdAt: string;
};

export default function PortfolioList() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPortfolios = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/portfolio", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolios");
      }

      const data = await response.json();

      setPortfolios(data.portfolios ?? data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "draft":
        return "bg-yellow-500/10 text-yellow-500";
      case "closed":
        return "bg-gray-500/10 text-gray-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Calculate portfolio financial information
  const getPortfolioMetrics = (portfolio: Portfolio) => {
    const holdings = portfolio.holdings ?? [];


    const allocated = Number(portfolio.totalCapital) || 0;

    const invested = holdings.reduce((total, holding) => {
      return (
        total +
        Number(holding.purchasePrice) * Number(holding.quantity)
      );
    }, 0);

    const remaining = allocated - invested;

    // Current prices are supplied by the API, not Prisma.
    const hasMarketPrices =
      holdings.length > 0 &&
      holdings.every(
        (holding) => holding.currentPrice != null
      );

    const calculatedCurrentValue = hasMarketPrices
      ? holdings.reduce((total, holding) => {
          return (
            total +
            Number(holding.currentPrice) *
              Number(holding.quantity)
          );
        }, 0)
      : null;

    const currentValue =
      portfolio.currentValue != null
        ? Number(portfolio.currentValue)
        : calculatedCurrentValue;

    const profitLoss =
      currentValue !== null ? currentValue - invested : null;

    const profitLossPercentage =
      profitLoss !== null && invested > 0
        ? (profitLoss / invested) * 100
        : null;

    // Count distinct stocks using their instrument keys.
    const differentStocks = new Set(
      holdings.map((holding) => holding.stock.instrumentKey)
    ).size;

    return {
      allocated,
      invested,
      remaining,
      currentValue,
      profitLoss,
      profitLossPercentage,
      differentStocks,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        Loading portfolios...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            My Portfolios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your investment portfolios.
          </p>
        </div>

        <button
          onClick={() => fetchPortfolios(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
          <button
            onClick={() => fetchPortfolios()}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!error && portfolios.length === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <BriefcaseBusiness
            className="mx-auto mb-3 text-muted-foreground"
            size={32}
          />
          <h3 className="font-medium">No portfolios yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first portfolio to start tracking investments.
          </p>
        </div>
      )}

      {/* Portfolio Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {portfolios.map((portfolio) => {
          const metrics = getPortfolioMetrics(portfolio);

          const isProfit =
            metrics.profitLoss !== null &&
            metrics.profitLoss >= 0;

          return (
            <div
              key={portfolio.id}
              className="rounded-xl border bg-card p-5 space-y-5 hover:border-primary/40 transition-colors"
            >
              {/* Name and status */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {portfolio.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {portfolio.type} portfolio
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyle(
                    portfolio.status
                  )}`}
                >
                  {portfolio.status}
                </span>
              </div>

              {/* Current Value */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Current Portfolio Value
                </p>

                <h2 className="text-2xl font-semibold">
                  {metrics.currentValue !== null
                    ? formatCurrency(metrics.currentValue)
                    : "—"}
                </h2>

                <div className="flex items-center gap-2 pt-1">
                  {metrics.profitLoss !== null ? (
                    <>
                      {isProfit ? (
                        <TrendingUp size={17} className="text-green-500" />
                      ) : (
                        <TrendingDown size={17} className="text-red-500" />
                      )}

                      <span
                        className={`text-sm font-medium ${
                          isProfit ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {isProfit ? "+" : ""}
                        {formatCurrency(metrics.profitLoss)}
                        {" "}(
                        {metrics.profitLossPercentage?.toFixed(2)}%)
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Market value unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Capital Details */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Wallet size={14} />
                    Capital Allocated
                  </div>
                  <p className="font-medium mt-1">
                    {formatCurrency(metrics.allocated)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Coins size={14} />
                    Capital Invested
                  </div>
                  <p className="font-medium mt-1">
                    {formatCurrency(metrics.invested)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <PiggyBank size={14} />
                    Remaining Capital
                  </div>
                  <p className={`font-medium mt-1 ${
                    metrics.remaining < 0
                      ? "text-red-500"
                      : "text-foreground"
                  }`}>
                    {formatCurrency(metrics.remaining)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Layers3 size={14} />
                    Different Stocks
                  </div>
                  <p className="font-medium mt-1">
                    {metrics.differentStocks}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={() =>
                    window.location.href = `/portfolio/${portfolio.id}`
                  }
                  className="flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                  View Details
                  <ArrowUpRight size={15} />
                </button>

                {portfolio.status === "draft" && (
                  <button
                    disabled
                    title="Deployment functionality coming soon"
                    className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground opacity-60 cursor-not-allowed"
                  >
                    <Rocket size={15} />
                    Deploy
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
