
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Palette, 
  Eye, 
  Settings, 
  Wand2, 
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

export const StyleControlCenter = () => {
  const [styleProfile, setStyleProfile] = useState({
    formality: 65,
    emotion: 45,
    complexity: 55,
    creativity: 70,
    clarity: 80,
    rhythm: 60,
    imagery: 75,
    dialogue: 40
  });

  const [jatlawiProfile, setJatlawiProfile] = useState({
    visualMetaphors: 85,
    sensoryDetails: 90,
    poeticRhythm: 95,
    innerDialogue: 80,
    philosophicalDepth: 88,
    realismBlend: 75
  });

  const [testText, setTestText] = useState('');
  const [analyzedText, setAnalyzedText] = useState('');

  const handleStyleChange = (key: keyof typeof styleProfile, value: number[]) => {
    setStyleProfile(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleJatlawiChange = (key: keyof typeof jatlawiProfile, value: number[]) => {
    setJatlawiProfile(prev => ({ ...prev, [key]: value[0] }));
  };

  const analyzeText = () => {
    // Simulate text analysis with Jatlawi style
    const jatlawiText = `تتراقص الكلمات في "${testText}" كأنها نجوم في سماء الليل البهيم، تحمل في طياتها عبق الحكمة وشذا المعرفة. إنها ليست مجرد حروف متراصة، بل كائنات حية تتنفس بإيقاع الشاعرية، وتهمس بأسرار الوجود...`;
    
    setAnalyzedText(jatlawiText);
  };

  const exportProfile = () => {
    const profile = {
      general: styleProfile,
      jatlawi: jatlawiProfile,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'style-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Palette className="w-6 h-6 text-purple-600" />
              <span>مركز التحكم في الأسلوب</span>
            </CardTitle>
            <div className="flex space-x-2 space-x-reverse">
              <Button variant="outline" onClick={exportProfile}>
                <Download className="w-4 h-4 ml-1" />
                تصدير الملف الشخصي
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 ml-1" />
                استيراد ملف شخصي
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">التحكم العام</TabsTrigger>
          <TabsTrigger value="jatlawi">عدسة الجطلاوي</TabsTrigger>
          <TabsTrigger value="testing">منطقة الاختبار</TabsTrigger>
        </TabsList>

        {/* General Style Controls */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">خصائص الأسلوب الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formality */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">الرسمية</span>
                    <Badge variant="outline">{styleProfile.formality}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.formality]}
                    onValueChange={(value) => handleStyleChange('formality', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>عامي</span>
                    <span>رسمي</span>
                  </div>
                </div>

                {/* Emotion */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">العاطفة</span>
                    <Badge variant="outline">{styleProfile.emotion}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.emotion]}
                    onValueChange={(value) => handleStyleChange('emotion', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>موضوعي</span>
                    <span>عاطفي</span>
                  </div>
                </div>

                {/* Complexity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">التعقيد</span>
                    <Badge variant="outline">{styleProfile.complexity}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.complexity]}
                    onValueChange={(value) => handleStyleChange('complexity', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>بسيط</span>
                    <span>معقد</span>
                  </div>
                </div>

                {/* Creativity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">الإبداع</span>
                    <Badge variant="outline">{styleProfile.creativity}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.creativity]}
                    onValueChange={(value) => handleStyleChange('creativity', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>مباشر</span>
                    <span>إبداعي</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">خصائص متقدمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Clarity */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">الوضوح</span>
                    <Badge variant="outline">{styleProfile.clarity}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.clarity]}
                    onValueChange={(value) => handleStyleChange('clarity', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>غامض</span>
                    <span>واضح</span>
                  </div>
                </div>

                {/* Rhythm */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">الإيقاع</span>
                    <Badge variant="outline">{styleProfile.rhythm}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.rhythm]}
                    onValueChange={(value) => handleStyleChange('rhythm', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>نثري</span>
                    <span>إيقاعي</span>
                  </div>
                </div>

                {/* Imagery */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">الصور البلاغية</span>
                    <Badge variant="outline">{styleProfile.imagery}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.imagery]}
                    onValueChange={(value) => handleStyleChange('imagery', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>حرفي</span>
                    <span>مجازي</span>
                  </div>
                </div>

                {/* Dialogue */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">الحوار الداخلي</span>
                    <Badge variant="outline">{styleProfile.dialogue}%</Badge>
                  </div>
                  <Slider
                    value={[styleProfile.dialogue]}
                    onValueChange={(value) => handleStyleChange('dialogue', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>سردي</span>
                    <span>تأملي</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jatlawi Lens Controls */}
        <TabsContent value="jatlawi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Eye className="w-6 h-6 text-amber-600" />
                <span>عدسة الجطلاوي - التحكم المتقدم</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Visual Metaphors */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">الاستعارات البصرية</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {jatlawiProfile.visualMetaphors}%
                      </Badge>
                    </div>
                    <Slider
                      value={[jatlawiProfile.visualMetaphors]}
                      onValueChange={(value) => handleJatlawiChange('visualMetaphors', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      تحويل المفاهيم المجردة إلى صور بصرية قوية
                    </p>
                  </div>

                  {/* Sensory Details */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">التفاصيل الحسية</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {jatlawiProfile.sensoryDetails}%
                      </Badge>
                    </div>
                    <Slider
                      value={[jatlawiProfile.sensoryDetails]}
                      onValueChange={(value) => handleJatlawiChange('sensoryDetails', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      إثراء النص بالأصوات والروائح والملمس
                    </p>
                  </div>

                  {/* Poetic Rhythm */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">الإيقاع الشاعري</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {jatlawiProfile.poeticRhythm}%
                      </Badge>
                    </div>
                    <Slider
                      value={[jatlawiProfile.poeticRhythm]}
                      onValueChange={(value) => handleJatlawiChange('poeticRhythm', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      إضافة موسيقى داخلية للجمل والعبارات
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Inner Dialogue */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">الحوار الداخلي</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {jatlawiProfile.innerDialogue}%
                      </Badge>
                    </div>
                    <Slider
                      value={[jatlawiProfile.innerDialogue]}
                      onValueChange={(value) => handleJatlawiChange('innerDialogue', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      إضافة التأمل والاستبطان الفلسفي
                    </p>
                  </div>

                  {/* Philosophical Depth */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">العمق الفلسفي</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {jatlawiProfile.philosophicalDepth}%
                      </Badge>
                    </div>
                    <Slider
                      value={[jatlawiProfile.philosophicalDepth]}
                      onValueChange={(value) => handleJatlawiChange('philosophicalDepth', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      إضافة أبعاد فلسفية ووجودية
                    </p>
                  </div>

                  {/* Realism Blend */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">مزج الواقعية</span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {jatlawiProfile.realismBlend}%
                      </Badge>
                    </div>
                    <Slider
                      value={[jatlawiProfile.realismBlend]}
                      onValueChange={(value) => handleJatlawiChange('realismBlend', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      التوازن بين الواقعية والشاعرية
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">خصائص أسلوب الجطلاوي</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• الاستعارات البصرية القوية التي تجعل المجرد محسوساً</li>
                  <li>• التفاصيل الحسية الغنية (الأصوات، الروائح، الملمس)</li>
                  <li>• الجمل المتدفقة بإيقاع شاعري منسجم</li>
                  <li>• المزج الفريد بين الواقعية والشاعرية</li>
                  <li>• الحوار الداخلي والتأمل العميق</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Area */}
        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>منطقة الاختبار</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">النص الأصلي</label>
                  <Textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="أدخل نصاً لاختبار تطبيق الأسلوب عليه..."
                    className="h-32"
                  />
                </div>
                
                <div className="flex space-x-2 space-x-reverse">
                  <Button onClick={analyzeText} className="flex-1">
                    <Wand2 className="w-4 h-4 ml-1" />
                    تطبيق أسلوب الجطلاوي
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 ml-1" />
                    إعادة تعيين
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>النتيجة المحولة</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">النص بأسلوب الجطلاوي</label>
                  <Textarea
                    value={analyzedText}
                    readOnly
                    placeholder="ستظهر النتيجة هنا بعد التحليل..."
                    className="h-32 bg-amber-50"
                  />
                </div>
                
                {analyzedText && (
                  <div className="mt-4 flex space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4 ml-1" />
                      حفظ النتيجة
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 ml-1" />
                      تطبيق مرة أخرى
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Style Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الملف الشخصي الحالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{styleProfile.formality}%</div>
                  <div className="text-sm text-gray-600">الرسمية</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{styleProfile.creativity}%</div>
                  <div className="text-sm text-gray-600">الإبداع</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{styleProfile.clarity}%</div>
                  <div className="text-sm text-gray-600">الوضوح</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{jatlawiProfile.poeticRhythm}%</div>
                  <div className="text-sm text-gray-600">الإيقاع الشاعري</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
