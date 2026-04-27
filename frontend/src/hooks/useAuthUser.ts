import { useQuery } from '@tanstack/react-query';
import { useAPIClient } from '@/api/useAPIClient';

export function useAuthUser() {
    const apiClient = useAPIClient();
    return useQuery({
        queryKey: ['auth-user'],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/auth/me');
                return response.data?.user;
            } catch (err) {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000,
    });
}
