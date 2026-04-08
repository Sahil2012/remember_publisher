import { useQuery } from '@tanstack/react-query';
import { useAPIClient } from '@/api/useAPIClient';

export function useSubscription() {
    const apiClient = useAPIClient();
    return useQuery({
        queryKey: ['subscription'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/auth/me');
                return response.data?.user?.isSubscribed || false;
            } catch (err) {
                return false;
            }
        },
        staleTime: 5 * 60 * 1000,
    });
}
