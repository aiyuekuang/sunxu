import { getMesHostHooks } from './adapters';
export function useFileDisplayNames(urls: string[]) {
  const hook = getMesHostHooks().useFileDisplayNames;
  if (!hook) throw new Error('The host app must configure useFileDisplayNames before rendering attachment fields.');
  return hook(urls);
}
