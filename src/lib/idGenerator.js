export default function generateId(
  abbreviation,
  totalGacha,
  cardOrder,
  packageNumber,
) {
  const total = String(totalGacha).padStart(2, "0");
  const order = String(cardOrder).padStart(2, "0");
  const pkg = String(packageNumber).padStart(3, "0");
  const suffix = Math.random().toString(16).slice(2, 5).toUpperCase();
  return `${abbreviation}-${total}-${order}-${pkg}-${suffix}`;
}
