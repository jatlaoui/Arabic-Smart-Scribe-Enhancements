
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, EditingRequest, EditingResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useTextEditing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EditingRequest): Promise<EditingResponse> => 
      apiClient.editText(request),
    onSuccess: (data) => {
      toast({
        title: "تم التحرير بنجاح",
        description: `تم تطبيق ${data.tool_used} على النص`,
      });
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: ['editingSessions'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحرير",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
}
