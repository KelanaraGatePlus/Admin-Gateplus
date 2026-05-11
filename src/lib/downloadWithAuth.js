export async function downloadWithAuth(url, fallbackFilename = "export.csv") {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download export");
  }

  const blob = await response.blob();
  const filename =
    getFilenameFromDisposition(response.headers.get("content-disposition")) ||
    fallbackFilename;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function getFilenameFromDisposition(disposition) {
  if (!disposition) return null;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] || null;
}
