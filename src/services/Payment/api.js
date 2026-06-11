export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? "/api" : "http://localhost:5001");
const DEFAULT_TIMEOUT_MS = 25000;

function connectionErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "הבקשה ארכה יותר מדי זמן. בדקו חיבור לאינטרנט ושהשרת פועל.";
  }
  return "שגיאה בחיבור לשרת. ודאו שבטרמינל רץ: cd server && npm run dev";
}

export async function apiGet(path, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("תשובה לא תקינה מהשרת");
    }

    return { response, data };
  } catch (error) {
    if (error.message === "תשובה לא תקינה מהשרת") {
      throw error;
    }
    throw new Error(connectionErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiPost(path, body, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("תשובה לא תקינה מהשרת");
    }

    return { response, data };
  } catch (error) {
    if (error.message === "תשובה לא תקינה מהשרת") {
      throw error;
    }
    throw new Error(connectionErrorMessage(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

