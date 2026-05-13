/*
========================
SECTION: MODULE OVERVIEW
========================
*/

export function toUserMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;
  const message = error.message || fallback;
  if (message.toLowerCase().includes("failed to fetch")) {
    return "Network error. Check your internet and try again.";
  }
  return message;
}

export async function withRetry(fn, retries = 1) {
  let lastError;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

