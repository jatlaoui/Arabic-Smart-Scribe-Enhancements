
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  Brain, 
  Wand2, 
  Palette,
  FileText, 
  Video, 
  Lightbulb
} from 'lucide-react';

interface UploadPhaseProps {
  onFileUpload: (files: FileList) => void;
}

export const UploadPhase: React.FC<UploadPhaseProps> = ({ onFileUpload }) => {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.srt,.vtt,.json,.mp4,.webm';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) onFileUpload(files);
    };
    input.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onFileUpload(e.dataTransfer.files);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Upload className="w-5 h-5" />
          <span>رفع محتوى الشاهد</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleClick}
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">ارفع محتوى الشاهد</h3>
          <p className="text-gray-600 mb-4">
            ملف فيديو، ترانسكريبت، أو ترجمات - سنقوم بالتحليل العميق لتحويله إلى رواية احترافية
          </p>
          <div className="flex justify-center space-x-4 space-x-reverse text-sm text-gray-500">
            <div className="flex items-center space-x-1 space-x-reverse">
              <Video className="w-4 h-4" />
              <span>فيديو</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <FileText className="w-4 h-4" />
              <span>نص</span>
            </div>
            <div className="flex items-center space-x-1 space-x-reverse">
              <FileText className="w-4 h-4" />
              <span>ترجمات</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">التحليل العميق</h4>
            <p className="text-sm text-gray-600">فهم السياق التاريخي والعاطفي</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Lightbulb className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">تعزيز المحتوى</h4>
            <p className="text-sm text-gray-600">إضافة التفاصيل والاستعارات</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Wand2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">بناء المشاهد</h4>
            <p className="text-sm text-gray-600">تحويل الأحداث إلى مشاهد أدبية</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold mb-1">التحرير الفني</h4>
            <p className="text-sm text-gray-600">صقل الأسلوب والبنية السردية</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
