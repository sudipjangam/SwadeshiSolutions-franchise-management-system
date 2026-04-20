import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

/**
 * useRestaurantId — org-aware restaurant ID hook
 *
 * Single restaurant: returns profile.restaurant_id (unchanged behavior)
 * Multi-branch: returns the currently selected branch from OrganizationContext
 * If currentBranch === 'all': returns null (caller decides how to handle aggregate view)
 */
export const useRestaurantId = () => {
  let orgContext: ReturnType<typeof useOrganizationContext> | null = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    orgContext = useOrganizationContext();
  } catch {
    // OrganizationProvider not mounted — fallback to profile-based lookup
    orgContext = null;
  }

  const isMultiBranch = orgContext?.isMultiBranch ?? false;
  const currentBranch = orgContext?.currentBranch ?? null;
  const branches = orgContext?.branches ?? [];

  // Fallback: fetch from profile if not multi-branch or context not available
  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurant-info'],
    queryFn: async () => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('No user found');

      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', profile.user.id)
        .single();

      if (error) throw error;

      if (userProfile?.restaurant_id) {
        const { data: restaurant, error: restError } = await supabase
          .from('restaurants')
          .select('id, name')
          .eq('id', userProfile.restaurant_id)
          .single();

        if (restError) throw restError;

        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        };
      }

      return { restaurantId: null, restaurantName: null };
    },
    // Skip query if we're in multi-branch mode (context has what we need)
    enabled: !isMultiBranch,
    staleTime: 1000 * 60 * 30,
  });

  // Multi-branch mode: drive from OrganizationContext
  if (isMultiBranch && orgContext) {
    if (currentBranch === 'all') {
      // Franchise aggregate view — no single restaurant
      return {
        restaurantId: null,
        restaurantName: 'All Branches',
        isAllBranches: true,
        branches,
        isLoading: orgContext.isLoading,
        error: null,
      };
    }

    const branch = branches.find(b => b.id === currentBranch);
    return {
      restaurantId: currentBranch as string,
      restaurantName: branch?.name ?? null,
      isAllBranches: false,
      branches,
      isLoading: orgContext.isLoading,
      error: null,
    };
  }

  // Single restaurant fallback
  return {
    restaurantId: data?.restaurantId ?? null,
    restaurantName: data?.restaurantName ?? null,
    isAllBranches: false,
    branches: [],
    isLoading,
    error,
  };
};
