import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Assuming apiClient is used for API calls, similar to ProfessionalShahidEngine
// import { apiClient } from '@/lib/api-client';
// import { useToast } from '@/hooks/use-toast'; // If toasts are needed

interface SeriesPlannerProps {
  projectId: string; // Assuming project ID is passed as a prop
  onSeriesPlanSubmitted: (planData: any) => void; // Callback to pass data to parent or next component
  onCancel: () => void; // Callback to go back to the choice screen
}

export const SeriesPlanner: React.FC<SeriesPlannerProps> = ({ projectId, onSeriesPlanSubmitted, onCancel }) => {
  const [numEpisodes, setNumEpisodes] = useState<number>(10); // Default to 10 episodes
  const [episodeDuration, setEpisodeDuration] = useState<string>('45'); // Default to 45 minutes
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const { toast } = useToast(); // Uncomment if using toasts

  const handlePlanSeries = async () => {
    setIsLoading(true);
    console.log('Planning series with:', { projectId, numEpisodes, episodeDuration });
    // Placeholder for API call
    // try {
    //   const response = await apiClient.post('/api/screenplay/plan-series', {
    //     project_id: projectId,
    //     num_episodes: numEpisodes,
    //     target_episode_duration: parseInt(episodeDuration, 10)
    //   });
    //   if (response.data) {
    //     onSeriesPlanSubmitted(response.data); // Pass the outline data
    //     toast({ title: 'تم تخطيط المسلسل بنجاح!', description: 'يمكنك الآن عرض مخطط الحلقات.' });
    //   }
    // } catch (error) {
    //   console.error('Error planning series:', error);
    //   toast({
    //     title: 'خطأ في تخطيط المسلسل',
    //     description: 'حدث خطأ أثناء محاولة الاتصال بالخادم. يرجى المحاولة مرة أخرى.',
    //     variant: 'destructive',
    //   });
    // } finally {
    //   setIsLoading(false);
    // }

    // For now, simulate a delay and call with mock data
    setTimeout(() => {
      const mockPlanData = {
        seriesTitle: "مغامرات الفضاء السحيق (مخطط مبدئي)",
        totalEpisodes: numEpisodes,
        episodes: Array.from({ length: numEpisodes }, (_, i) => ({
          episode_number: i + 1,
          title: `الحلقة ${i + 1}: بداية جديدة`,
          logline: `ملخص مثير للحلقة ${i + 1} حيث يواجه الأبطال تحديًا غير متوقع.`,
          key_events: ['حدث رئيسي 1', 'حدث رئيسي 2', 'حدث رئيسي 3'],
          cliffhanger: 'نهاية مشوقة تترك الجمهور متلهفًا للمزيد.'
        }))
      };
      onSeriesPlanSubmitted(mockPlanData);
      setIsLoading(false);
      alert(`Series plan submitted (mock): ${numEpisodes} episodes, ${episodeDuration} min each. Project ID: ${projectId}`);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <span className="text-3xl">🎬</span> مخطط بنية المسلسل
        </CardTitle>
        <CardDescription>
          قم بتحديد عدد الحلقات والمدة التقريبية لكل حلقة لبدء عملية التخطيط الهيكلي لمسلسلك.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="num-episodes">عدد الحلقات المتوقعة</Label>
          <Input
            id="num-episodes"
            type="number"
            value={numEpisodes}
            onChange={(e) => setNumEpisodes(Math.max(1, parseInt(e.target.value, 10) || 1))} // Ensure positive number
            placeholder="مثال: 10"
            min="1"
            className="text-lg p-3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="episode-duration">المدة التقريبية للحلقة (بالدقائق)</Label>
          <Select value={episodeDuration} onValueChange={setEpisodeDuration}>
            <SelectTrigger id="episode-duration" className="text-lg p-3 h-auto">
              <SelectValue placeholder="اختر مدة الحلقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 دقيقة</SelectItem>
              <SelectItem value="45">45 دقيقة</SelectItem>
              <SelectItem value="60">60 دقيقة</SelectItem>
              <SelectItem value="90">90 دقيقة (حلقة خاصة / فيلم تلفزيوني)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
        <Button variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
          إلغاء / العودة
        </Button>
        <Button onClick={handlePlanSeries} disabled={isLoading || numEpisodes < 1} className="w-full sm:w-auto text-lg py-3 px-6">
          {isLoading ? 'جاري التخطيط...' : 'ابدأ تخطيط بنية المسلسل'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SeriesPlanner;
