import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // For potential future actions

interface EpisodeOutlineData {
  episode_number: number;
  title: string;
  logline: string;
  key_events: string[];
  cliffhanger: string;
}

interface SeriesOutlineData {
  seriesTitle?: string; // Optional overall title for the series plan
  totalEpisodes: number;
  episodes: EpisodeOutlineData[];
}

interface SeriesOutlineViewerProps {
  outlineData: SeriesOutlineData | null;
  onEditEpisode?: (episodeNumber: number) => void; // For future editing
  onGenerateScenesForEpisode?: (episodeNumber: number) => void; // For future scene generation
  onGoBackToPlanner?: () => void; // To go back to the planner if needed
}

export const SeriesOutlineViewer: React.FC<SeriesOutlineViewerProps> = ({
  outlineData,
  onEditEpisode,
  onGenerateScenesForEpisode,
  onGoBackToPlanner
}) => {
  if (!outlineData || !outlineData.episodes || outlineData.episodes.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto my-8">
        <CardHeader>
          <CardTitle>مخطط المسلسل</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 py-8">
            لم يتم إنشاء مخطط للمسلسل بعد، أو أن البيانات غير متوفرة.
          </p>
          {onGoBackToPlanner && (
             <div className="mt-4 text-center">
                <Button variant="outline" onClick={onGoBackToPlanner}>العودة إلى مخطط بنية المسلسل</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-6" dir="rtl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            {outlineData.seriesTitle || 'مخطط حلقات المسلسل'}
          </CardTitle>
          <CardDescription className="text-lg">
            إجمالي عدد الحلقات: {outlineData.totalEpisodes}
          </CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {outlineData.episodes.map((episode, index) => (
          <AccordionItem value={`episode-${episode.episode_number}`} key={episode.episode_number} className="bg-white shadow rounded-lg">
            <AccordionTrigger className="p-6 text-xl font-semibold hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <span>الحلقة {episode.episode_number}: {episode.title}</span>
                <Badge variant="outline">ملخص الحلقة</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 text-gray-700 space-y-4">
              <div>
                <h4 className="font-semibold text-md mb-1 text-blue-600">ملخص الحلقة (Logline):</h4>
                <p className="text-sm leading-relaxed">{episode.logline}</p>
              </div>
              <div>
                <h4 className="font-semibold text-md mb-2 text-green-600">الأحداث الرئيسية:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {episode.key_events.map((event, idx) => (
                    <li key={idx}>{event}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-md mb-1 text-red-600">نقطة التشويق (Cliffhanger):</h4>
                <p className="text-sm italic">{episode.cliffhanger}</p>
              </div>
              {/* Future action buttons for each episode */}
              {(onEditEpisode || onGenerateScenesForEpisode) && (
                <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-3">
                  {onGenerateScenesForEpisode && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onGenerateScenesForEpisode(episode.episode_number)}
                      className="flex-1"
                    >
                      🎬 توليد مشاهد هذه الحلقة
                    </Button>
                  )}
                  {onEditEpisode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditEpisode(episode.episode_number)}
                      className="flex-1"
                    >
                      ✏️ تحرير تفاصيل الحلقة
                    </Button>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {onGoBackToPlanner && (
        <div className="mt-8 text-center">
            <Button variant="link" onClick={onGoBackToPlanner}>
                العودة إلى مخطط بنية المسلسل
            </Button>
        </div>
      )}
    </div>
  );
};

export default SeriesOutlineViewer;
