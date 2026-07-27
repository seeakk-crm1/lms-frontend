import useWorkspaceStore from '../store/useWorkspaceStore';

export interface FormatCurrencyOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}

const currencyToLocaleMap: Record<string, { locale: string; currency: string; symbol: string }> = {
  INR: { locale: 'en-IN', currency: 'INR', symbol: '₹' },
  USD: { locale: 'en-US', currency: 'USD', symbol: '$' },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
  GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£' },
  AED: { locale: 'en-AE', currency: 'AED', symbol: 'AED' },
  SAR: { locale: 'en-SA', currency: 'SAR', symbol: 'SAR' },
  AUD: { locale: 'en-AU', currency: 'AUD', symbol: 'A$' },
  CAD: { locale: 'en-CA', currency: 'CAD', symbol: 'C$' },
  SGD: { locale: 'en-SG', currency: 'SGD', symbol: 'S$' },
  JPY: { locale: 'ja-JP', currency: 'JPY', symbol: '¥' },
  CNY: { locale: 'zh-CN', currency: 'CNY', symbol: '¥' },
};

/**
 * Resolves the active currency code from workspace store or options.
 */
export const getActiveCurrencyCode = (overrideCurrency?: string): string => {
  if (overrideCurrency?.trim()) return overrideCurrency.trim().toUpperCase();
  const workspaceCurrency = useWorkspaceStore.getState().currencyLocale;
  return (workspaceCurrency || 'USD').trim().toUpperCase();
};

/**
 * Resolves the currency symbol for the active workspace currency.
 */
export const getWorkspaceCurrencySymbol = (overrideCurrency?: string): string => {
  const code = getActiveCurrencyCode(overrideCurrency);
  const mapped = currencyToLocaleMap[code];
  if (mapped) return mapped.symbol;

  try {
    const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: code });
    const parts = formatter.formatToParts(1);
    const currencyPart = parts.find((part) => part.type === 'currency');
    return currencyPart ? currencyPart.value : code;
  } catch {
    return code;
  }
};

/**
 * Universal Currency Formatter using workspace configuration and Intl.NumberFormat.
 */
export const formatCurrency = (
  val: number | string | null | undefined,
  options?: FormatCurrencyOptions,
): string => {
  const numericVal = typeof val === 'number' ? val : Number(val);
  if (val === null || val === undefined || Number.isNaN(numericVal)) {
    return formatCurrency(0, options);
  }

  const code = getActiveCurrencyCode(options?.currency);
  const mapped = currencyToLocaleMap[code];

  const locale = mapped?.locale || 'en-US';
  const currencyCode = mapped?.currency || (code.length === 3 ? code : 'USD');

  const minDecimals = options?.minimumFractionDigits ?? 0;
  const maxDecimals = options?.maximumFractionDigits ?? 2;

  try {
    if (options?.compact && Math.abs(numericVal) >= 1_000_000) {
      const millions = numericVal / 1_000_000;
      const formattedNum = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(millions);
      const symbol = getWorkspaceCurrencySymbol(code);
      return `${symbol}${formattedNum}M`;
    }

    if (options?.compact && Math.abs(numericVal) >= 1_000) {
      const thousands = numericVal / 1_000;
      const formattedNum = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(thousands);
      const symbol = getWorkspaceCurrencySymbol(code);
      return `${symbol}${formattedNum}K`;
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
    }).format(numericVal);
  } catch (error) {
    // Safe fallback if Intl.NumberFormat encounters invalid parameters
    const symbol = getWorkspaceCurrencySymbol(code);
    return `${symbol}${numericVal.toLocaleString()}`;
  }
};

export default formatCurrency;
