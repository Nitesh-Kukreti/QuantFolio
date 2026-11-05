"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Stock = {
  symbol: string
  name: string
  ltp: number
  instrumentKey: string
}

type Holding = {
  symbol: string
  name: string
  price: number
  quantity: number
  instrumentKey: string
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)

export default function CreatePortfolioPage() {
  const router = useRouter()

  const [totalCapital, setTotalCapital] = useState(100000)
  const [portfolioName, setPortfolioName] = useState("")
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [quantity, setQuantity] = useState(1)

  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [saveError, setSaveError] = useState("")

  // Portfolio calculations
  const investedAmount = useMemo(
    () =>
      holdings.reduce(
        (total, holding) => total + holding.price * holding.quantity,
        0
      ),
    [holdings]
  )

  const remainingCapital = totalCapital - investedAmount

  const allocationPercentage =
    totalCapital > 0 ? (investedAmount / totalCapital) * 100 : 0

  const existingHolding = selectedStock
    ? holdings.find(
        (holding) => holding.instrumentKey === selectedStock.instrumentKey
      )
    : undefined

  const selectedInvestment = selectedStock
    ? selectedStock.ltp * quantity
    : 0

  // Only the additional shares need to fit within remaining capital.
  const additionalInvestment = selectedStock
    ? selectedStock.ltp * quantity
    : 0

  const canAffordSelected =
    selectedStock !== null &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    additionalInvestment <= remainingCapital &&
    totalCapital > 0

  // Search stocks
  const handleSearch = async () => {
    const query = search.trim()

    if (query.length < 2) {
      setSearchError("Enter at least 2 characters")
      return
    }

    try {
      setIsSearching(true)
      setSearchError("")
      setHasSearched(true)

      const response = await fetch(
        `/api/market/search?q=${encodeURIComponent(query)}`
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to search stocks")
      }

      const normalizedStocks: Stock[] = (result.data || [])
        .filter(
          (stock: any) =>
            stock.instrument_key &&
            stock.trading_symbol &&
            stock.name &&
            typeof stock.ltp === "number" &&
            Number.isFinite(stock.ltp) &&
            stock.ltp > 0
        )
        .map((stock: any) => ({
          symbol: stock.trading_symbol,
          name: stock.name,
          ltp: stock.ltp,
          instrumentKey: stock.instrument_key,
        }))

      setSearchResults(normalizedStocks)
    } catch (error) {
      setSearchResults([])
      setSearchError(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setIsSearching(false)
    }
  }

  // Select a stock
  const selectStock = (stock: Stock) => {
    setSelectedStock(stock)
    setQuantity(1)
    setSaveError("")
  }

  // Add selected stock to portfolio
  const addToPortfolio = () => {
    if (!selectedStock || !canAffordSelected) return

    setHoldings((current) => {
      const existingIndex = current.findIndex(
        (holding) =>
          holding.instrumentKey === selectedStock.instrumentKey
      )

      if (existingIndex !== -1) {
        return current.map((holding, index) =>
          index === existingIndex
            ? {
                ...holding,
                quantity: holding.quantity + quantity,
                price: selectedStock.ltp,
              }
            : holding
        )
      }

      return [
        ...current,
        {
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          price: selectedStock.ltp,
          quantity,
          instrumentKey: selectedStock.instrumentKey,
        },
      ]
    })

    setSelectedStock(null)
    setQuantity(1)
  }

  // Remove a holding
  const removeHolding = (instrumentKey: string) => {
    setHoldings((current) =>
      current.filter(
        (holding) => holding.instrumentKey !== instrumentKey
      )
    )
  }

  // Save portfolio
  const handleSavePortfolio = async () => {
    if (
      !portfolioName.trim() ||
      holdings.length === 0 ||
      totalCapital <= 0 ||
      investedAmount > totalCapital ||
      isSaving
    ) {
      return
    }

    try {
      setIsSaving(true)
      setSaveError("")

      const payload = {
        name: portfolioName.trim(),
        type: "manual",
        totalCapital,
        holdings: holdings.map((holding) => ({
          instrumentKey: holding.instrumentKey,
          quantity: holding.quantity,
        })),
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create portfolio")
      }

      router.push("/portfolio")
      router.refresh()
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the portfolio"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        {/* Header */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Manual Portfolio
            </span>

            <span className="text-xs text-muted-foreground">
              Step 1 of 2
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            Build your portfolio
          </h1>

          <p className="text-sm text-muted-foreground">
            Select stocks and allocate your investment capital.
          </p>
        </div>

        {/* Capital Summary */}
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-semibold">Capital</p>
              <p className="text-xs text-muted-foreground">
                Manage your available investment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border bg-blue-500/5 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Total Capital
              </p>

              <Input
                type="number"
                min="0"
                value={totalCapital}
                onChange={(e) =>
                  setTotalCapital(Math.max(0, Number(e.target.value)))
                }
                className="h-8 border-blue-500/20 bg-background text-sm font-semibold"
              />
            </div>

            <div className="rounded-lg border bg-emerald-500/5 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Invested
              </p>

              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {formatINR(investedAmount)}
              </p>
            </div>

            <div className="rounded-lg border bg-amber-500/5 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Remaining
              </p>

              <p
                className={`text-lg font-semibold ${
                  remainingCapital < 0
                    ? "text-red-600"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {formatINR(remainingCapital)}
              </p>
            </div>

            <div className="rounded-lg border bg-violet-500/5 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                  Allocation
                </p>

                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  {allocationPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-500/10">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{
                    width: `${Math.min(allocationPercentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Search & Select */}
          <section className="rounded-xl border bg-card shadow-sm">
            <div className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Search & Select</p>
                  <p className="text-xs text-muted-foreground">
                    Find stocks and choose quantity
                  </p>
                </div>

                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {searchResults.length} stocks
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by stock name or symbol..."
                    className="h-9 pl-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                  />
                </div>

                <Button
                  size="sm"
                  className="h-9"
                  onClick={handleSearch}
                  disabled={!search.trim() || isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>

              {searchError && (
                <p className="mt-2 text-xs text-red-600">{searchError}</p>
              )}
            </div>

            <div className="divide-y">
              {searchResults.map((stock) => {
                const isSelected =
                  selectedStock?.instrumentKey === stock.instrumentKey

                const held = holdings.find(
                  (holding) =>
                    holding.instrumentKey === stock.instrumentKey
                )

                return (
                  <div
                    key={stock.instrumentKey}
                    className={`px-4 py-3 transition-colors ${
                      isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => selectStock(stock)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {stock.symbol}
                          </span>

                          {held && (
                            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                              {held.quantity} held
                            </span>
                          )}
                        </div>

                        <p className="truncate text-xs text-muted-foreground">
                          {stock.name}
                        </p>
                      </button>

                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatINR(stock.ltp)}
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          per share
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant={isSelected ? "default" : "outline"}
                        className="h-8 w-8 shrink-0"
                        onClick={() => selectStock(stock)}
                      >
                        {isSelected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {isSelected && (
                      <div className="mt-3 rounded-lg border bg-background p-3">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                          <div>
                            <p className="text-xs font-medium">
                              Additional quantity
                            </p>

                            <p className="text-[11px] text-muted-foreground">
                              Investment:{" "}
                              <span className="font-medium text-foreground">
                                {formatINR(selectedInvestment)}
                              </span>
                            </p>
                          </div>

                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => {
                              const value = Number(e.target.value)

                              setQuantity(
                                Number.isFinite(value)
                                  ? Math.max(0, Math.floor(value))
                                  : 0
                              )
                            }}
                            className="h-8 w-20 text-center text-sm font-semibold"
                          />

                          <Button
                            type="button"
                            size="sm"
                            className="h-8"
                            onClick={addToPortfolio}
                            disabled={!canAffordSelected}
                          >
                            Add
                            <Plus className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {!canAffordSelected && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />

                            <span>
                              Enter a valid quantity and ensure you have enough
                              remaining capital.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {searchResults.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium">
                    {isSearching
                      ? "Searching stocks..."
                      : hasSearched
                        ? "No stocks found"
                        : "Search for a stock"}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Try another stock name or symbol.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Portfolio */}
          <section className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Your Portfolio</p>
                <p className="text-xs text-muted-foreground">
                  {holdings.length}{" "}
                  {holdings.length === 1 ? "holding" : "holdings"}
                </p>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {formatINR(investedAmount)}
              </div>
            </div>

            {holdings.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
                <div>
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="text-sm font-medium">
                    Your portfolio is empty
                  </p>

                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Search for a stock and add shares to start building your
                    portfolio.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {holdings.map((holding) => {
                  const investment = holding.price * holding.quantity

                  return (
                    <div
                      key={holding.instrumentKey}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {holding.symbol.slice(0, 2)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">
                            {holding.symbol}
                          </p>

                          <span className="text-[11px] text-muted-foreground">
                            {holding.quantity} shares
                          </span>
                        </div>

                        <p className="truncate text-xs text-muted-foreground">
                          {holding.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatINR(investment)}
                        </p>

                        <p className="text-[10px] text-muted-foreground">
                          {formatINR(holding.price)} / share
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                        onClick={() =>
                          removeHolding(holding.instrumentKey)
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Save Portfolio */}
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold">Save Your Portfolio</p>
              <p className="text-xs text-muted-foreground">
                Give your portfolio a name before saving it.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="portfolioName" className="text-sm font-medium">
                Portfolio Name
              </label>

              <Input
                id="portfolioName"
                placeholder="e.g. Long-Term Growth Portfolio"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                maxLength={100}
              />
            </div>

            {saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}

            <Button
              type="button"
              className="h-10 w-full md:w-auto md:min-w-[190px]"
              disabled={
                isSaving ||
                holdings.length === 0 ||
                totalCapital <= 0 ||
                !portfolioName.trim() ||
                investedAmount > totalCapital
              }
              onClick={handleSavePortfolio}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Add to Portfolio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}