import { useEffect, useState } from "react";

const STORAGE_KEY = "freightflow_display_currency";

export const currencyRates = {
  BDT: 1,
  USD: 1 / 110,
  CAD: 1 / 81,
};

export const currencySymbols = {
  BDT: "৳",
  USD: "$",
  CAD: "C$",
};

export default function useDisplayCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "BDT";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = (value) => {
    setCurrencyState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const formatCurrency = (amountInBdt) => {
    const convertedAmount = Number(amountInBdt || 0) * currencyRates[currency];

    return `${currencySymbols[currency]}${convertedAmount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return {
    currency,
    setCurrency,
    formatCurrency,
  };
}