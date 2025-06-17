
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Video, 
  Mic,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WitnessSource {
  title: string;
  description: string;
  transcript: string;
  source_type: 'video' | 'audio' | 'written';
  metadata: {
    duration?: number;
    location?: string;
    date?: string;
    witnesses?: string[];
  };
}

interface WitnessUploaderProps {
  onUploadSuccess: (source: any) => void;
}

export const WitnessUploader: React.FC<WitnessUploaderProps> = ({ onUploadSuccess }) => {
  const [source, setSource] = useState<WitnessSource>({
    title: '',
    description: '',
    transcript: '',
    source_type: 'written',
    metadata: {}
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!source.title || !source.transcript) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى إدخال العنوان والترانسكريبت",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // محاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const uploadedSource = {
        id: Date.now(),
        ...source,
        created_at: new Date().toISOString(),
        analysis_stats: {
          word_count: source.transcript.split(' ').length,
          estimated_duration: Math.ceil(source.transcript.split(' ').length / 150)
        }
      };
      
      onUploadSuccess(uploadedSource);
      
      toast({
        title: "تم رفع الترانسكريبت بنجاح",
        description: `تم حفظ "${source.title}" وسيتم تحليله قريباً`
      });
      
      // إعادة تعيين النموذج
      setSource({
        title: '',
        description: '',
        transcript: '',
        source_type: 'written',
        metadata: {}
      });
      
    } catch (error) {
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء رفع الترانسكريبت",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getSourceIcon = () => {
    switch (source.source_type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Mic className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse">
          <Upload className="w-5 h-5" />
          <span>رفع ترانسكريبت شاهد جديد</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant={source.source_type === 'video' ? 'default' : 'outline'}
            onClick={() => setSource({...source, source_type: 'video'})}
            className="h-16 flex flex-col space-y-1"
          >
            <Video className="w-6 h-6" />
            <span>مقطع فيديو</span>
          </Button>
          <Button
            variant={source.source_type === 'audio' ? 'default' : 'outline'}
            onClick={() => setSource({...source, source_type: 'audio'})}
            className="h-16 flex flex-col space-y-1"
          >
            <Mic className="w-6 h-6" />
            <span>تسجيل صوتي</span>
          </Button>
          <Button
            variant={source.source_type === 'written' ? 'default' : 'outline'}
            onClick={() => setSource({...source, source_type: 'written'})}
            className="h-16 flex flex-col space-y-1"
          >
            <FileText className="w-6 h-6" />
            <span>شهادة مكتوبة</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">العنوان</Label>
            <Input
              id="title"
              placeholder="عنوان الشهادة أو المقابلة"
              value={source.title}
              onChange={(e) => setSource({...source, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">المكان (اختياري)</Label>
            <Input
              id="location"
              placeholder="مكان تسجيل الشهادة"
              value={source.metadata.location || ''}
              onChange={(e) => setSource({
                ...source, 
                metadata: {...source.metadata, location: e.target.value}
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            placeholder="وصف مختصر عن محتوى الشهادة وسياقها..."
            value={source.description}
            onChange={(e) => setSource({...source, description: e.target.value})}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transcript">
            <span className="flex items-center space-x-2 space-x-reverse">
              {getSourceIcon()}
              <span>الترانسكريبت</span>
            </span>
          </Label>
          <Textarea
            id="transcript"
            placeholder="الصق هنا النص الكامل للشهادة أو المقابلة..."
            value={source.transcript}
            onChange={(e) => setSource({...source, transcript: e.target.value})}
            rows={12}
            className="font-mono text-sm"
          />
          {source.transcript && (
            <div className="text-sm text-gray-500 flex items-center space-x-2 space-x-reverse">
              <AlertCircle className="w-4 h-4" />
              <span>عدد الكلمات: {source.transcript.split(' ').length}</span>
              <span>•</span>
              <span>مدة القراءة المقدرة: {Math.ceil(source.transcript.split(' ').length / 150)} دقيقة</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !source.title || !source.transcript}
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 ml-2" />
                رفع الترانسكريبت
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
