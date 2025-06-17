
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Brain, 
  Globe, 
  BookOpen, 
  Users, 
  Target,
  Zap,
  Save,
  RefreshCw
} from 'lucide-react';
import { GlassmorphicCard } from '../advanced-ui/GlassmorphicCard';

interface AdvancedSettingsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState({
    geminiEnabled: true,
    webSearchEnabled: true,
    autoResearch: false,
    writingStyle: 'روائي',
    complexity: 'متوسط',
    targetAudience: 'عام',
    chapterLength: 2000,
    includeDialogue: true,
    includeDescriptions: true,
    includeSources: true,
    autoCorrection: true,
    realTimeAssistance: true,
    ...settings
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      geminiEnabled: true,
      webSearchEnabled: true,
      autoResearch: false,
      writingStyle: 'روائي',
      complexity: 'متوسط',
      targetAudience: 'عام',
      chapterLength: 2000,
      includeDialogue: true,
      includeDescriptions: true,
      includeSources: true,
      autoCorrection: true,
      realTimeAssistance: true
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <div className="space-y-6">
      <GlassmorphicCard variant="primary" className="p-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
            <Brain className="w-6 h-6" />
            <span>مساعد الذكاء الاصطناعي Gemini</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-200">
              نشط
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">تفعيل مساعد Gemini</Label>
              <p className="text-white/70 text-sm">مساعد ذكي لتحسين الكتابة والبحث</p>
            </div>
            <Switch
              checked={localSettings.geminiEnabled}
              onCheckedChange={(checked) => handleSettingChange('geminiEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">البحث في الويب</Label>
              <p className="text-white/70 text-sm">البحث التلقائي عن معلومات إضافية</p>
            </div>
            <Switch
              checked={localSettings.webSearchEnabled}
              onCheckedChange={(checked) => handleSettingChange('webSearchEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">البحث التلقائي</Label>
              <p className="text-white/70 text-sm">بحث تلقائي أثناء الكتابة</p>
            </div>
            <Switch
              checked={localSettings.autoResearch}
              onCheckedChange={(checked) => handleSettingChange('autoResearch', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">التصحيح التلقائي</Label>
              <p className="text-white/70 text-sm">تصحيح الأخطاء أثناء الكتابة</p>
            </div>
            <Switch
              checked={localSettings.autoCorrection}
              onCheckedChange={(checked) => handleSettingChange('autoCorrection', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">المساعدة الفورية</Label>
              <p className="text-white/70 text-sm">اقتراحات فورية أثناء الكتابة</p>
            </div>
            <Switch
              checked={localSettings.realTimeAssistance}
              onCheckedChange={(checked) => handleSettingChange('realTimeAssistance', checked)}
            />
          </div>
        </CardContent>
      </GlassmorphicCard>

      <GlassmorphicCard className="p-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
            <BookOpen className="w-6 h-6" />
            <span>إعدادات الكتابة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">أسلوب الكتابة</Label>
              <select 
                value={localSettings.writingStyle}
                onChange={(e) => handleSettingChange('writingStyle', e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="روائي">روائي - سرد متدفق وجذاب</option>
                <option value="أدبي">أدبي - لغة راقية ومعبرة</option>
                <option value="بسيط">بسيط - واضح ومباشر</option>
                <option value="أكاديمي">أكاديمي - علمي ومنهجي</option>
                <option value="صحفي">صحفي - إخباري ومختصر</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">مستوى التعقيد</Label>
              <select 
                value={localSettings.complexity}
                onChange={(e) => handleSettingChange('complexity', e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="بسيط">بسيط - لغة سهلة ومفهومة</option>
                <option value="متوسط">متوسط - لغة متوازنة</option>
                <option value="متقدم">متقدم - لغة غنية ومعقدة</option>
                <option value="أكاديمي">أكاديمي - مصطلحات متخصصة</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">الجمهور المستهدف</Label>
              <select 
                value={localSettings.targetAudience}
                onChange={(e) => handleSettingChange('targetAudience', e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <option value="عام">عام - جميع الأعمار</option>
                <option value="شباب">شباب - 18-35 سنة</option>
                <option value="متخصص">متخصص - خبراء المجال</option>
                <option value="طلاب">طلاب - بيئة تعليمية</option>
                <option value="أطفال">أطفال - لغة مبسطة</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">طول الفصل (كلمة)</Label>
              <Input
                type="number"
                value={localSettings.chapterLength}
                onChange={(e) => handleSettingChange('chapterLength', parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
                min="500"
                max="5000"
                step="100"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/20">
            <Label className="text-white text-base">عناصر إضافية</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={localSettings.includeDialogue}
                  onCheckedChange={(checked) => handleSettingChange('includeDialogue', checked)}
                />
                <Label className="text-white/80">حوارات</Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={localSettings.includeDescriptions}
                  onCheckedChange={(checked) => handleSettingChange('includeDescriptions', checked)}
                />
                <Label className="text-white/80">أوصاف تفصيلية</Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={localSettings.includeSources}
                  onCheckedChange={(checked) => handleSettingChange('includeSources', checked)}
                />
                <Label className="text-white/80">مصادر ومراجع</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassmorphicCard>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetToDefaults}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 ml-1" />
          إعادة تعيين
        </Button>
        
        <Button 
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Save className="w-4 h-4 ml-1" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
};
