// Mock Supabase Client - Not using real Supabase, just mockData
// This file exists only for compatibility, all data is stored in localStorage

export const supabase = {
  auth: {
    getSession: async () => ({ 
      data: { session: null }, 
      error: { message: 'No session - using localStorage' } 
    }),
    getUser: async () => ({ 
      data: { user: null }, 
      error: { message: 'No user - using localStorage' } 
    })
  },
  from: (table: string) => ({
    select: () => ({
      limit: () => ({
        data: null,
        error: { message: 'Using localStorage instead of Supabase' }
      })
    })
  })
};
