export const getImageUrl = (iconPath?: string) => {
  if (!iconPath) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const staticBaseUrl = baseUrl.replace('/api', '');

  return `${staticBaseUrl}${iconPath}`;
};
