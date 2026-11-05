export type DrawingDownloadContext = 'drawing' | 'business';
export type DrawingDownloadHandler = (
  url: string,
  fileName: string,
  context?: DrawingDownloadContext,
) => Promise<string>;
let downloadHandler: DrawingDownloadHandler | undefined;

export function configureDrawingFileDownload(handler: DrawingDownloadHandler): void {
  downloadHandler = handler;
}

export async function downloadAndShareDrawingFile(url: string, fileName: string): Promise<string> {
  if (!downloadHandler) {
    throw new Error('The host app must configure drawing file download and sharing.');
  }
  return downloadHandler(url, fileName, 'drawing');
}

export async function downloadAndShareBusinessFile(url: string, fileName: string): Promise<string> {
  if (!downloadHandler) {
    throw new Error('The host app must configure business file download and sharing.');
  }
  return downloadHandler(url, fileName, 'business');
}
