// Fetches an image from a given URL and converts it to a data URL (Base64 string).
export default async function fetchImageAsDataUrl(url: string): Promise<string | null> {

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get("Content-Type") || "";
    if (!ct.startsWith("image/")) {
      console.error(`Invalid content type for ${url}: ${ct}`);
      return null;
    }

    const blob = await res.blob();

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
      reader.onerror = () => {
        console.error(`FileReader error for ${url}`);
        resolve(null);
      };
    });
  } catch (err) {
    console.error(`Error fetching image from ${url}:`, err);
    return null;
  }
}