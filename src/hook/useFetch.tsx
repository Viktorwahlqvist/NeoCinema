import React, { useEffect, useState } from "react";

// Hook to fetch data with an url, gets loading states and errors if fetch couldn't success.
// AbortController used to cancel the fetch if the component unmounts
export default function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchData = async () => {
      try {
        await fetch("/api");
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Fetch failed");
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, isLoading, error };
}