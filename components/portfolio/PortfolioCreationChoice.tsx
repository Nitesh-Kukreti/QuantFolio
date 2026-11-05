"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Bot, Sparkles, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PortfolioCreationChoice() {
  const router = useRouter()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Create your portfolio
        </h1>

        <p className="mx-auto max-w-2xl text-muted-foreground">
          Choose how you want to build your investment portfolio.
          Pick your own investments or let QuantFolio create one for you.
        </p>
      </div>

      {/* Choices */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual */}
        <Card
          className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          onClick={() => router.push("/portfolio/new/create")}
        >
          <CardContent className="flex h-full flex-col p-7">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <SlidersHorizontal className="size-6" />
              </div>

              <Badge variant="secondary">
                Full Control
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Build manually
              </h2>

              <p className="text-sm leading-6 text-muted-foreground">
                Search for stocks and add exactly the investments you want
                to your portfolio.
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-foreground">✓</span>
                Choose individual stocks
              </div>

              <div className="flex items-center gap-2">
                <span className="text-foreground">✓</span>
                Control your allocation
              </div>

              <div className="flex items-center gap-2">
                <span className="text-foreground">✓</span>
                Build your own strategy
              </div>
            </div>

            <Button
              className="mt-8 w-full"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                router.push("/portfolio/new/create")
              }}
            >
              Start building
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* AI */}
        <Card
          className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          onClick={() => router.push("/portfolio/new/generate")}
        >
          <CardContent className="flex h-full flex-col p-7">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>

              <Badge>
                Recommended
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Generate with QuantFolio
              </h2>

              <p className="text-sm leading-6 text-muted-foreground">
                Tell us about your goals, risk tolerance, and investment
                preferences. QuantFolio will suggest a portfolio for you.
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Personalized recommendations
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Based on your risk profile
              </div>

              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Portfolio diversification
              </div>
            </div>

            <Button
              className="mt-8 w-full"
              onClick={(e) => {
                e.stopPropagation()
                router.push("/portfolio/new/generate")
              }}
            >
              Generate portfolio
              <Sparkles className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom hint */}
      <div className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
        <Bot className="size-4" />
        <span>
          You can analyze and customize your portfolio after creating it.
        </span>
      </div>
    </div>
  )
}