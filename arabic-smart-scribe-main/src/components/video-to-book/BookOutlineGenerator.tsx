
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Target, 
  FileText,
  ChevronRight,
  Wand2
} from 'lucide-react';

interface BookOutlineGeneratorProps {
  videoInfo: any;
  outline: any;
  onGenerateOutline: () => void;
}

export const BookOutlineGenerator: React.FC<BookOutlineGeneratorProps> = ({ 
  videoInfo, 
  outline, 
  onGenerateOutline 
}) => {
  if (!videoInfo) return null;

  return (
    <div className="space-y-6">
      {/* Video Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FileText className="w-6 h-6 text-green-600" />
            <span>تحليل الفيديو مكتمل</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{videoInfo.title}</h3>
            <p className="text-gray-600 mt-1">{videoInfo.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm">
                <strong>المدة:</strong> {videoInfo.duration}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm">
                <strong>المحاضر:</strong> {videoInfo.speaker}
              </span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm">
                <strong>المستوى:</strong> {videoInfo.complexity}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">الموضوعات الرئيسية:</h4>
            <div className="flex flex-wrap gap-2">
              {videoInfo.topics.map((topic: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">
              <strong>الجمهور المستهدف:</strong> {videoInfo.targetAudience}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generate Outline or Show Result */}
      {!outline ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span>إنشاء مخطط الكتاب</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">جاهز لإنشاء مخطط الكتاب</h3>
              <p className="text-gray-600 mb-6">
                سنقوم بإنشاء مخطط شامل للكتاب بناءً على محتوى الفيديو المحلل
              </p>
              <Button 
                onClick={onGenerateOutline}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Wand2 className="w-4 h-4 ml-2" />
                إنشاء المخطط
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <BookOpen className="w-6 h-6 text-green-600" />
              <span>مخطط الكتاب</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{outline.title}</h2>
              <p className="text-gray-600 mt-1">{outline.subtitle}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{outline.chapters.length}</div>
                  <div className="text-sm text-gray-600">فصول</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {outline.totalEstimatedWords.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">كلمة متوقعة</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">180-200</div>
                  <div className="text-sm text-gray-600">صفحة متوقعة</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">فصول الكتاب:</h3>
              {outline.chapters.map((chapter: any) => (
                <Card key={chapter.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          الفصل {chapter.id}: {chapter.title}
                        </h4>
                        <div className="mt-2 space-y-1">
                          {chapter.sections.map((section: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                              <ChevronRight className="w-3 h-3" />
                              <span>{section}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {chapter.estimatedWords.toLocaleString()} كلمة
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
