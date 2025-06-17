
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedBackground } from '@/components/advanced-ui/AnimatedBackground';
import { PremiumDashboard } from '@/components/premium-dashboard/PremiumDashboard';
import { AutoWritingEngine } from '@/components/writing-automation/AutoWritingEngine';
import { PremiumTextEditor } from '@/components/premium-editor/PremiumTextEditor';
import { VideoToBookConverter } from '@/components/video-to-book/VideoToBookConverter';
import { 
  Crown, 
  Wand2, 
  FileText, 
  Video,
  BarChart3,
  Settings
} from 'lucide-react';

const PremiumWritingPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video-converter');

  return (
    <div className="min-h-screen relative" dir="rtl">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-black/20 backdrop-blur-md border border-white/20">
            <TabsTrigger 
              value="video-converter" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Video className="w-4 h-4 ml-2" />
              محول الفيديو لرواية
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Crown className="w-4 h-4 ml-2" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger 
              value="auto-writing" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Wand2 className="w-4 h-4 ml-2" />
              الكتابة التلقائية
            </TabsTrigger>
            <TabsTrigger 
              value="editor" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <FileText className="w-4 h-4 ml-2" />
              المحرر الذكي
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <BarChart3 className="w-4 h-4 ml-2" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="video-converter" className="space-y-6">
              <VideoToBookConverter currentProject={null} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <PremiumDashboard />
            </TabsContent>

            <TabsContent value="auto-writing" className="space-y-6">
              <AutoWritingEngine />
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <PremiumTextEditor />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center text-white py-16">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-green-400" />
                <h2 className="text-2xl font-bold mb-2">تحليلات متقدمة قريباً</h2>
                <p className="text-white/70">تحليلات شاملة لأدائك وإنتاجيتك</p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="text-center text-white py-16">
                <Settings className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h2 className="text-2xl font-bold mb-2">إعدادات عامة للمنصة</h2>
                <p className="text-white/70">إعدادات شاملة لتخصيص تجربة الكتابة</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PremiumWritingPlatform;
