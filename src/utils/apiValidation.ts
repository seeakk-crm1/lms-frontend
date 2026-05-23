export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return fallback;
  }

  const data = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response
    ?.data;

  if (data?.errors && typeof data.errors === 'object') {
    const firstFieldError = Object.values(data.errors)
      .flat()
      .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
    if (firstFieldError) return firstFieldError;
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  return fallback;
};
