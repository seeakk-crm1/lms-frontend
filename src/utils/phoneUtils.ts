import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Country } from 'country-state-city';

const countryRules: Record<string, { name: string; digits?: number; message?: string }> = {
  IN: { name: 'Indian', digits: 10 },
  AE: { name: 'UAE', digits: 9 },
  SA: { name: 'Saudi Arabia', digits: 9 },
  QA: { name: 'Qatar', digits: 8 },
  OM: { name: 'Oman', digits: 8 },
  KW: { name: 'Kuwait', digits: 8 },
  US: { name: 'US', digits: 10 },
  CA: { name: 'Canadian', digits: 10 },
  GB: { name: 'UK', message: 'Invalid UK mobile number.' },
};

export interface CountryPhoneData {
  name: string;
  isoCode: string;
  flag: string;
  dialCode: string;
}

export function getCountryDataList(): CountryPhoneData[] {
  return Country.getAllCountries()
    .map((c) => {
      let cleanCode = c.phonecode.replace(/[^0-9]/g, '');
      if (cleanCode && !cleanCode.startsWith('+')) {
        cleanCode = '+' + cleanCode;
      }
      return {
        name: c.name,
        isoCode: c.isoCode,
        flag: c.flag || '🏳️',
        dialCode: cleanCode,
      };
    })
    .filter((c) => c.dialCode && c.dialCode !== '+');
}

export function validatePhoneStr(phoneStr: string | null | undefined): { isValid: boolean; message?: string } {
  if (!phoneStr) return { isValid: true };
  const clean = phoneStr.trim();
  if (clean === '') return { isValid: true };

  // Must start with +
  if (!clean.startsWith('+')) {
    return { isValid: false, message: 'Phone number must start with + followed by the country code.' };
  }

  const parsed = parsePhoneNumberFromString(clean);
  if (!parsed) {
    return { isValid: false, message: 'Invalid phone number format.' };
  }

  const country = parsed.country;
  if (!country) {
    return { isValid: false, message: 'Invalid country dial code.' };
  }

  const rule = countryRules[country];
  if (rule) {
    if (rule.digits !== undefined) {
      const national = parsed.nationalNumber;
      if (national.length !== rule.digits) {
        const countryLabel = rule.name;
        return {
          isValid: false,
          message: `${countryLabel} mobile numbers must contain exactly ${rule.digits} digits.`,
        };
      }
    }
  }

  if (!parsed.isValid()) {
    const countryName = rule?.name || country;
    return {
      isValid: false,
      message: rule?.message || `Invalid phone number format for ${countryName}.`,
    };
  }

  return { isValid: true };
}

export function formatPhoneStr(phoneStr: string | null | undefined): string {
  if (!phoneStr) return '';
  const clean = phoneStr.trim();
  if (clean === '') return '';

  if (clean.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(clean);
    if (parsed && parsed.isValid()) {
      return parsed.formatInternational();
    }
  } else {
    const parsed = parsePhoneNumberFromString(clean, 'IN');
    if (parsed && parsed.isValid()) {
      return parsed.formatInternational();
    }
  }
  return clean;
}

export function formatPhoneWithFlag(phoneStr: string | null | undefined): string {
  if (!phoneStr) return '';
  const clean = phoneStr.trim();
  if (clean === '') return '';

  const getPhoneFlag = (iso: string): string =>
    iso
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

  const parsed = parsePhoneNumberFromString(clean.startsWith('+') ? clean : '+' + clean);
  if (parsed && parsed.isValid() && parsed.country) {
    const flag = getPhoneFlag(parsed.country);
    return `${flag} ${parsed.formatInternational()}`;
  }

  if (clean.startsWith('+')) {
    const parsedGeneric = parsePhoneNumberFromString(clean);
    if (parsedGeneric && parsedGeneric.country) {
      const flag = getPhoneFlag(parsedGeneric.country);
      return `${flag} ${clean}`;
    }
  }

  return clean;
}
