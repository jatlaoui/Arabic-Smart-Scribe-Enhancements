
import { useQuery } from '@tanstack/react-query';
import { apiClient, EditingTool } from '@/lib/api';

export function useEditingTools() {
  return useQuery({
    queryKey: ['editingTools'],
    queryFn: async () => {
      const response = await apiClient.getEditingTools();
      return response.tools;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
