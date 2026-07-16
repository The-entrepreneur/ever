import React, { createContext, useContext, useState } from "react";

export type Currency = "USD" | "NGN";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  formatMoney: (amountInUSD: number, decimals?: number, showCode?: boolean) => string;
  rate: number;
  symbol: string;
  code: string;
}

const EXCHANGE_RATE = 1500; // 1 USD = 1,500 NGN

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem("ever_currency");
      return saved === "NGN" || saved === "USD" ? saved : "USD";
    } catch {
      return "USD";
    }
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("ever_currency", c);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === "USD" ? "NGN" : "USD");
  };

  const rate = currency === "USD" ? 1 : EXCHANGE_RATE;
  const symbol = currency === "USD" ? "$" : "₦";
  const code = currency === "USD" ? "USD" : "NGN";

  const formatMoney = (amountInUSD: number, decimals = 0, showCode = false) => {
    const converted = amountInUSD * rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${symbol}${formatted}${showCode ? ` ${code}` : ""}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatMoney,
        rate,
        symbol,
        code,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
