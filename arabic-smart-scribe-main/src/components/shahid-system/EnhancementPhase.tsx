
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SensoryDetailEngine } from './SensoryDetailEngine';
import { MetaphorEngine } from './MetaphorEngine';
import { InternalMonologueEngine } from './InternalMonologueEngine';
import { 
  Sparkles, 
  Eye, 
  MessageSquare,
  Wand2
} from 'lucide-react';

interface EnhancementPhaseProps {
  selectedText: string;
  sensoryDetails: any[];
  metaphors: any[];
  internalThoughts: any[];
  onSensoryDetailsGenerated: (details: any[]) => void;
  onMetaphorsGenerated: (metaphors: any[]) => void;
  onInternalThoughtsGenerated: (thoughts: any[]) => void;
  onEnhancementComplete: () => void;
}

export const EnhancementPhase: React.FC<EnhancementPhaseProps> = ({
  selectedText,
  sensoryDetails,
  metaphors,
  internalThoughts,
  onSensoryDetailsGenerated,
  onMetaphorsGenerated,
  onInternalThoughtsGenerated,
  onEnhancementComplete
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <span>تعزيز المحتوى الأدبي</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            إثراء النص بالتفاصيل الحسية، الاستعارات، والحوار الداخلي لتحويله إلى عمل أدبي راقي
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="sensory" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sensory" className="flex items-center space-x-1 space-x-reverse">
            <Eye className="w-4 h-4" />
            <span>التفاصيل الحسية</span>
          </TabsTrigger>
          <TabsTrigger value="metaphors" className="flex items-center space-x-1 space-x-reverse">
            <Sparkles className="w-4 h-4" />
            <span>الاستعارات</span>
          </TabsTrigger>
          <TabsTrigger value="monologue" className="flex items-center space-x-1 space-x-reverse">
            <MessageSquare className="w-4 h-4" />
            <span>الحوار الداخلي</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensory">
          <SensoryDetailEngine
            context={{
              location: "جبال الشعانبي، تونس",
              timeperiod: "1950-1956",
              weather: "شتاء بارد",
              timeOfDay: "ليل"
            }}
            onDetailsGenerated={onSensoryDetailsGenerated}
          />
        </TabsContent>

        <TabsContent value="metaphors">
          <MetaphorEngine
            themes={["الحرية والتضحية", "الهوية الوطنية", "صراع الأجيال"]}
            context="النضال التونسي ضد الاستعمار"
            onMetaphorsGenerated={onMetaphorsGenerated}
          />
        </TabsContent>

        <TabsContent value="monologue">
          <InternalMonologueEngine
            selectedText={selectedText || "نص الشهادة المحدد..."}
            characters={[
              {
                name: "حمادي غرس",
                role: "مقاتل في المقاومة",
                psychological_profile: "شاب مثالي تحول إلى مقاتل صلب"
              },
              {
                name: "لزهر الشرايطي",
                role: "قائد المجموعة",
                psychological_profile: "قائد حكيم ومتمرس"
              }
            ]}
            onMonologueGenerated={onInternalThoughtsGenerated}
          />
        </TabsContent>
      </Tabs>

      {(sensoryDetails.length > 0 || metaphors.length > 0 || internalThoughts.length > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                تم توليد: {sensoryDetails.length} تفصيل حسي، {metaphors.length} استعارة، {internalThoughts.length} فكرة داخلية
              </div>
              <Button onClick={onEnhancementComplete}>
                <Wand2 className="w-4 h-4 ml-2" />
                الانتقال لبناء المشاهد
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
