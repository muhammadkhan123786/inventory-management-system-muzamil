export function convertToArray(input: string): string[] {
  if (!input) return [];
  
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function convertToString(array: string[]): string {
  return array.join(', ');
}

export function addTag(tags: string[], newTag: string): string[] {
  const trimmedTag = newTag.trim();
  if (!trimmedTag || tags.includes(trimmedTag)) return tags;
  return [...tags, trimmedTag];
}

export function removeTag(tags: string[], tagToRemove: string): string[] {
  return tags.filter(tag => tag !== tagToRemove);
}