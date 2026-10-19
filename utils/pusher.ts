export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "U";
  }

  const first = words[0][0] ?? "";
  const second = words[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}

export function formatChatTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
