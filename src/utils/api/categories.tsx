// Project Categories API - Mock version (no Supabase)
// Returns static categories only

import { STATIC_CATEGORIES } from '../api-constants';
import type { ProjectCategory } from '../../types/api-types';

export const fetchProjectCategories = async (): Promise<ProjectCategory[]> => {
  try {
    console.log('📋 Fetching project categories (static data)...');
    console.log('✅ Categories loaded:', STATIC_CATEGORIES.length, 'categories');
    return STATIC_CATEGORIES;
  } catch (error) {
    console.warn('⚠️ Categories fetch error, using fallback:', error);
    return STATIC_CATEGORIES;
  }
};
