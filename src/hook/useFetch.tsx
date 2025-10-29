import { useEffect, useState } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface Options<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: TBody;
  skip?: boolean;
}

export default function useFetch<TResponse = unknown, TBody = unknown>(
  url: string,
  options: Options<TBody> = {}
) {
  const { method = "GET", headers = {}, body, skip = false } = options;

  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!skip);
  const [error, setError] = useState("");

  useEffect(() => {
    if (skip) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        // warm-up only for GET and not the warm-up call itself
        if (method === "GET" && !url.endsWith("/api")) {
          await fetch("/api", { signal });
        }

        const res = await fetch(url, {
          method,
          headers: method === "GET" ? headers : { "Content-Type": "application/json", ...headers },
          body: body ? JSON.stringify(body) : undefined,
          signal,
        });

        if (!res.ok) throw new Error(res.statusText || "Request failed");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [url, method, JSON.stringify(headers), JSON.stringify(body), skip]);


  const doFetch = async (
    body?: TBody,
    customMethod: HttpMethod = "POST"
  ) => {
    const res = await fetch(url, {
      method: customMethod,
      headers: { "Content-Type": "application/json", ...headers },
      body: customMethod === "GET" ? undefined : body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || res.statusText);
    return json as TResponse;
  };

  return { data, isLoading, error, doFetch };
}