export interface Business {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  website?: string;
  phone?: string;
  businessType?: string;
  description?: string;
  googleMapsUri?: string;
}

export interface SearchState {
  isSearching: boolean;
  error: string | null;
  data: Business[];
  hasSearched: boolean;
  progress?: {
    current: number;
    total: number;
    currentArea: string;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  industry: string;
  location: string;
  count: number;
  data: Business[];
}

export enum SortOption {
  RATING_DESC = 'RATING_DESC',
  REVIEWS_DESC = 'REVIEWS_DESC',
  NAME_ASC = 'NAME_ASC',
}