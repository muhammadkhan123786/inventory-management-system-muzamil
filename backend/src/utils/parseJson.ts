export const parseSafeJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON from AI');
  }
};
