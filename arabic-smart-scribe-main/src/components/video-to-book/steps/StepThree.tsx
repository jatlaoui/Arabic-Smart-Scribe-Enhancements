
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, BookOpen, FileText, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Chapter {
  chapter_number: number;
  title: string;
  purpose: string;
  key_points: string[];
  estimated_words: number;
}

interface BookOutline {
  book_title: string;
  introduction: {
    title: string;
    purpose: string;
    content_summary: string;
    estimated_words: number;
  };
  chapters: Chapter[];
  conclusion: {
    title: string;
    purpose: string;
    content_summary: string;
    estimated_words: number;
  };
  total_estimated_words: number;
}

interface StepThreeProps {
  cleanedText: string;
  onNext: (outline: BookOutline) => void;
  onBack: () => void;
}

export const StepThree: React.FC<StepThreeProps> = ({ cleanedText, onNext, onBack }) => {
  const [outline, setOutline] = useState<BookOutline | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    generateOutline();
  }, []);

  const generateOutline = async () => {
    setIsProcessing(true);
    try {
      // First extract key points
      const keyPointsResult = await apiClient.videoProcessing.extractKeyPoints({
        cleaned_text: cleanedText
      });
      
      // Then generate outline
      const outlineResult = await apiClient.videoProcessing.generateBookOutline({
        key_points: keyPointsResult
      });
      
      setOutline(outlineResult);
    } catch (error) {
      console.error('خطأ في إنشاء المخطط:', error);
      // Fallback outline
      setOutline({
        book_title: 'كتاب جديد',
        introduction: {
          title: 'المقدمة',
          purpose: 'تقديم الموضوع',
          content_summary: 'نظرة عامة على محتوى الكتاب',
          estimated_words: 500
        },
        chapters: [
          {
            chapter_number: 1,
            title: 'الفصل الأول',
            purpose: 'بداية القصة',
            key_points: ['نقطة أساسية'],
            estimated_words: 2000
          }
        ],
        conclusion: {
          title: 'الخاتمة',
          purpose: 'خلاصة الأفكار',
          content_summary: 'الخلاصات النهائية',
          estimated_words: 700
        },
        total_estimated_words: 3200
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateChapterTitle = (chapterIndex: number, newTitle: string) => {
    if (!outline) return;
    const updatedChapters = [...outline.chapters];
    updatedChapters[chapterIndex].title = newTitle;
    setOutline({ ...outline, chapters: updatedChapters });
  };

  const addChapter = () => {
    if (!outline) return;
    const newChapter: Chapter = {
      chapter_number: outline.chapters.length + 1,
      title: `الفصل ${outline.chapters.length + 1}`,
      purpose: 'وصف الهدف من الفصل',
      key_points: ['نقطة رئيسية'],
      estimated_words: 2000
    };
    setOutline({
      ...outline,
      chapters: [...outline.chapters, newChapter],
      total_estimated_words: outline.total_estimated_words + 2000
    });
  };

  const removeChapter = (chapterIndex: number) => {
    if (!outline || outline.chapters.length <= 1) return;
    const updatedChapters = outline.chapters.filter((_, index) => index !== chapterIndex);
    // Renumber chapters
    const renumberedChapters = updatedChapters.map((chapter, index) => ({
      ...chapter,
      chapter_number: index + 1
    }));
    setOutline({
      ...outline,
      chapters: renumberedChapters,
      total_estimated_words: outline.total_estimated_words - 2000
    });
  };

  const handleNext = () => {
    if (outline) {
      onNext(outline);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span>الخطوة 3: مراجعة مخطط الكتاب</span>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 ml-1" />
            رجوع
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isProcessing ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>جاري إنشاء مخطط الكتاب واستخراج النقاط الرئيسية...</p>
          </div>
        ) : outline ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Input
                    value={outline.book_title}
                    onChange={(e) => setOutline({ ...outline, book_title: e.target.value })}
                    className="text-xl font-bold border-none p-0 h-auto"
                    disabled={!isEditing}
                  />
                  <Badge variant="secondary" className="mt-2">
                    إجمالي الكلمات المقدرة: {outline.total_estimated_words.toLocaleString()}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 ml-1" />
                  {isEditing ? 'حفظ' : 'تعديل'}
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">هيكل الكتاب:</h3>
                
                {/* Introduction */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{outline.introduction.title}</span>
                    <Badge variant="secondary">{outline.introduction.estimated_words} كلمة</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{outline.introduction.content_summary}</p>
                </div>

                {/* Chapters */}
                <div className="space-y-2">
                  {outline.chapters.map((chapter, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {isEditing ? (
                            <Input
                              value={chapter.title}
                              onChange={(e) => updateChapterTitle(index, e.target.value)}
                              className="font-medium"
                            />
                          ) : (
                            <span className="font-medium">{chapter.title}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Badge variant="secondary">{chapter.estimated_words} كلمة</Badge>
                          {isEditing && outline.chapters.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeChapter(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{chapter.purpose}</p>
                    </div>
                  ))}
                  
                  {isEditing && (
                    <Button variant="outline" onClick={addChapter} className="w-full">
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة فصل جديد
                    </Button>
                  )}
                </div>

                {/* Conclusion */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{outline.conclusion.title}</span>
                    <Badge variant="secondary">{outline.conclusion.estimated_words} كلمة</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{outline.conclusion.content_summary}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} className="px-8">
                <FileText className="w-4 h-4 ml-2" />
                التالي: بدء كتابة الفصول
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};
