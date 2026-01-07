const STATIC_URL = "http://localhost:3000/uploads";

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "";

  // Nếu là URL đầy đủ (http/https)
  if (imagePath.startsWith("http")) return imagePath;

  // Nếu đã có /uploads prefix (từ upload API)
  if (imagePath.startsWith("/uploads"))
    return `http://localhost:3000${imagePath}`;

  // Nếu chỉ là filename
  return `${STATIC_URL}/${imagePath}`;
};

export const formatCurrency = (
  amount: number | string | null | undefined
): string => {
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "0 ₫";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numAmount);
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
