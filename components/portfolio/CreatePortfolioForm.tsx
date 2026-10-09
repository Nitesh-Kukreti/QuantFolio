"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { ChevronsUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export function CreatePortfolioForm() {
  return (
    <form className="mx-auto w-full max-w-3xl space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Give your portfolio a name and define its primary investment goal.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="portfolio-name">Portfolio Name</Label>
            <Input
              id="portfolio-name"
              placeholder="e.g. Long Term Wealth"
            />
          </div>

          <div className="space-y-2">
            <Label>Investment Goal</Label>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select your investment goal" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="wealth">Wealth Creation</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="capital">Capital Preservation</SelectItem>
                <SelectItem value="general">General Investment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Investment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
          <CardDescription>
            Tell us how much you want to invest and for how long.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="capital">Initial Capital</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>

              <Input
                id="capital"
                type="number"
                placeholder="5,00,000"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sip">Monthly Investment</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>

              <Input
                id="sip"
                type="number"
                placeholder="10,000"
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Investment Duration</Label>

            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="10"
                className="max-w-32"
              />

              <Select defaultValue="years">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk & Return */}
      <Card>
        <CardHeader>
          <CardTitle>Risk & Return</CardTitle>
          <CardDescription>
            Define how much risk you're comfortable taking.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-7">
          <div className="space-y-4">
            <Label>Risk Level</Label>

            <RadioGroup
              defaultValue="moderate"
              className="grid gap-3 sm:grid-cols-3"
            >
              <label
                htmlFor="risk-low"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value="low" id="risk-low" />
                <div>
                  <p className="font-medium">Conservative</p>
                  <p className="text-sm text-muted-foreground">
                    Lower risk
                  </p>
                </div>
              </label>

              <label
                htmlFor="risk-moderate"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value="moderate" id="risk-moderate" />
                <div>
                  <p className="font-medium">Moderate</p>
                  <p className="text-sm text-muted-foreground">
                    Balanced risk
                  </p>
                </div>
              </label>

              <label
                htmlFor="risk-high"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value="high" id="risk-high" />
                <div>
                  <p className="font-medium">Aggressive</p>
                  <p className="text-sm text-muted-foreground">
                    Higher risk
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Return Preference</Label>

            <RadioGroup
              defaultValue="balanced"
              className="grid gap-3 sm:grid-cols-3"
            >
              <label
                htmlFor="return-conservative"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem
                  value="conservative"
                  id="return-conservative"
                />
                <span>Conservative</span>
              </label>

              <label
                htmlFor="return-balanced"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value="balanced" id="return-balanced" />
                <span>Balanced</span>
              </label>

              <label
                htmlFor="return-aggressive"
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem value="aggressive" id="return-aggressive" />
                <span>Aggressive</span>
              </label>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="max-loss">
              Maximum Acceptable Loss
            </Label>

            <div className="relative">
              <Input
                id="max-loss"
                type="number"
                placeholder="20"
                className="pr-10"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Maximum decline you're comfortable with during a difficult
              market period.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Preferences</CardTitle>
          <CardDescription>
            Choose the types of investments and companies you prefer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-7">
          <div className="space-y-4">
            <Label>Preferred Assets</Label>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["stocks", "Stocks"],
                ["etfs", "ETFs"],
                ["bonds", "Bonds"],
                ["gold", "Gold"],
                ["silver", "Silver"],
                ["other", "Other"],
              ].map(([id, label]) => (
                <div key={id} className="flex items-center gap-3">
                  <Checkbox id={id} />
                  <Label
                    htmlFor={id}
                    className="font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Market Cap Preference</Label>

            <div className="flex flex-wrap gap-5">
              {[
                ["large-cap", "Large Cap"],
                ["mid-cap", "Mid Cap"],
                ["small-cap", "Small Cap"],
              ].map(([id, label]) => (
                <div key={id} className="flex items-center gap-3">
                  <Checkbox id={id} />
                  <Label
                    htmlFor={id}
                    className="font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

<div className="space-y-3">
  <Label>Sector Preference</Label>

  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between font-normal"
      >
        Select preferred sectors
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-full p-0">
      <Command>
        <CommandInput placeholder="Search sectors..." />

        <CommandList>
          <CommandEmpty>No sector found.</CommandEmpty>

          <CommandGroup>
            {[
              "Information Technology",
              "Banking & Finance",
              "Healthcare",
              "FMCG",
              "Energy",
              "Automobile",
              "Pharmaceuticals",
              "Metals & Mining",
            ].map((sector) => (
              <CommandItem key={sector}>
                <Checkbox className="mr-2" />
                {sector}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</div>        </CardContent>
      </Card>

      {/* Diversification */}
      <Card>
        <CardHeader>
          <CardTitle>Diversification Constraints</CardTitle>
          <CardDescription>
            Control how concentrated your portfolio can become.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stock-limit">
              Maximum Allocation per Stock
            </Label>

            <div className="relative">
              <Input
                id="stock-limit"
                type="number"
                placeholder="10"
                className="pr-10"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector-limit">
              Maximum Allocation per Sector
            </Label>

            <div className="relative">
              <Input
                id="sector-limit"
                type="number"
                placeholder="25"
                className="pr-10"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Management */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Management</CardTitle>
          <CardDescription>
            Decide how frequently your portfolio should be rebalanced.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RadioGroup
            defaultValue="yearly"
            className="grid gap-3 sm:grid-cols-4"
          >
            {[
              ["none", "None"],
              ["quarterly", "Quarterly"],
              ["half-yearly", "Half-Yearly"],
              ["yearly", "Yearly"],
            ].map(([value, label]) => (
              <label
                key={value}
                htmlFor={`rebalance-${value}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted/50"
              >
                <RadioGroupItem
                  value={value}
                  id={`rebalance-${value}`}
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>

        <Button type="submit">
          Create Portfolio
        </Button>
      </div>
    </form>
  )
}