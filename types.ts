export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  enum?: (string | number)[];
  description: string;
  example?: any;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  fullPath: string;
  method: 'GET' | 'POST' | string;
  category: string;
  description: string;
  parameters: ApiParameter[];
  sample?: any;
}

export interface DownloadResult {
  id: string;
  url: string;
  platform: string;
  title: string;
  author?: string;
  duration?: string;
  thumbnail?: string;
  cover?: string;
  videoUrl?: string;
  type: 'video' | 'audio' | 'image' | 'gallery' | 'file';
  downloads: DownloadOption[];
  images?: string[];
  audioUrl?: string;
  caption?: string;
  stats?: {
    views?: number | string;
    likes?: number | string;
    comments?: number | string;
    shares?: number | string;
  };
  raw?: any;
  timestamp: number;
}

export interface DownloadOption {
  label: string;
  quality?: string;
  format?: string;
  url: string;
  size?: string;
  ext?: string;
  isAudio?: boolean;
}

export interface HistoryItem {
  id: string;
  url: string;
  platform: string;
  title: string;
  thumbnail?: string;
  type: string;
  downloadUrl: string;
  timestamp: number;
}

export type SubscriptionTier = 'free' | 'vip' | 'vip_plus';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: SubscriptionTier;
  quotaUsed: number;
  quotaLimit: number;
  tierExpiresAt?: number;
  createdAt: number;
  ageVerified21Plus?: boolean;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  price: number;
  priceFormatted: string;
  billingPeriod: string;
  dailyQuota: number;
  badge?: string;
  popular?: boolean;
  features: { text: string; included: boolean; highlight?: boolean }[];
  accentColor: string;
  apiProvider: string;
}

export type ActiveTab = 
  | 'downloader' 
  | 'bulk-downloader' 
  | 'all-tools' 
  | 'ai-studio' 
  | 'spotify' 
  | 'pricing'
  | 'history' 
  | 'services' 
  | 'api-docs';

export interface QrisInvoice {
  depositId: string;
  amount: number;
  uniqueCode: number;
  totalAmount: number;
  qrImage: string;
  qrString: string;
  status: 'pending' | 'success' | 'already' | 'expired' | 'failed';
  expiredAt: string;
  planId: SubscriptionTier;
  planName: string;
  createdAt: number;
}

