export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function snippetAroundWord(text: string, word: string, context = 50) {
  const index = text.toLowerCase().indexOf(word.toLowerCase());
  if (index === -1) return text.slice(0, context * 2) + (text.length > context * 2 ? '...' : '');

  const start = Math.max(0, index - context);
  const end = Math.min(text.length, index + word.length + context);

  let snippet = text.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet += '...';

  return snippet;
}