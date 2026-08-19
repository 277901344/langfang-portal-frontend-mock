export function formatDateOnly(value?: string) {
  const text = value?.trim();
  if (!text) {
    return '-';
  }
  const matched = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (matched) {
    return matched[1];
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) {
    return text;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
