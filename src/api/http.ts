import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:8080";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Basit hata normalize (frontend tutarlılığı için)
export function getErrorMessage(err: any): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (!data) return err.message;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    return `HTTP ${err.response?.status ?? ""}`.trim();
  }
  return String(err?.message ?? err);
}
