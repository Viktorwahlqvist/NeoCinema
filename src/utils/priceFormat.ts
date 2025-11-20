export default function priceFormat(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00A0/g, " ");
}
