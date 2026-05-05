

export function formatRupiah(n) {
  if (!n && n !== 0) return "Rp0";
  if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}K`;
  return `Rp${n}`;
}

export function formatNumber(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
