import { toast } from 'sonner';

export interface DownloadMediaOptions {
  url: string;
  filename?: string;
  title?: string;
  platform?: string;
  format?: string;
  isAudio?: boolean;
}

/**
 * Downloads a media file with native browser download triggers
 * and rich Sonner toast notifications.
 */
export async function downloadMediaFile(options: DownloadMediaOptions): Promise<boolean> {
  const { url, title, platform, format, isAudio } = options;

  if (!url) {
    toast.error('Gagal Mengunduh', {
      description: 'Tautan unduhan tidak valid atau kosong.'
    });
    return false;
  }

  const rawTitle = title || platform || 'media_file';
  const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_').trim().substring(0, 60);
  const ext = (format?.toLowerCase() || (isAudio ? 'mp3' : 'mp4')).replace(/^\./, '');
  const filename = options.filename || `${cleanTitle}.${ext}`;

  const toastId = `dl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  toast.loading('Menyiapkan berkas unduhan...', {
    id: toastId,
    description: `${rawTitle} (${ext.toUpperCase()}) • Mengambil stream dari server...`,
  });

  try {
    const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Create invisible anchor to trigger browser native download prompt & notification
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 2500);

    // Format human-readable file size if available
    let sizeStr = '';
    if (blob.size > 0) {
      const mb = (blob.size / (1024 * 1024)).toFixed(2);
      sizeStr = ` • ${mb} MB`;
    }

    toast.success('Unduhan Berhasil Dimulai!', {
      id: toastId,
      description: `"${rawTitle}" (${ext.toUpperCase()}${sizeStr}) sedang disimpan ke perangkat Anda. Periksa bilah notifikasi peramban.`,
      duration: 4500
    });

    return true;
  } catch (err: any) {
    console.warn('Proxy download error, executing direct tab fallback:', err);

    // Fallback: direct window open
    try {
      window.open(url, '_blank');
      toast.info('Membuka Tautan Unduhan Langsung', {
        id: toastId,
        description: `Browser mengalihkan ke server media untuk "${rawTitle}".`,
        duration: 4000
      });
      return true;
    } catch {
      toast.error('Gagal Memulai Unduhan', {
        id: toastId,
        description: 'Terjadi kendala jaringan saat mengunduh berkas. Silakan coba kembali.',
        duration: 4000
      });
      return false;
    }
  }
}
