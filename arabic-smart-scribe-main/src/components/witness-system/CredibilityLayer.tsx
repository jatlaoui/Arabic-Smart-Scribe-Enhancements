
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Info,
  TrendingUp,
  Eye,
  FileText
} from 'lucide-react';

interface AnalysisResult {
  credibility_assessment: {
    overall_score: number;
    factors: {
      consistency: number;
      detail_level: number;
      emotional_authenticity: number;
      factual_accuracy: number;
    };
    level: string;
  };
}

interface CredibilityLayerProps {
  analysisResult: AnalysisResult;
  faithfulMode: boolean;
}

export const CredibilityLayer: React.FC<CredibilityLayerProps> = ({
  analysisResult,
  faithfulMode
}) => {
  const { credibility_assessment } = analysisResult;

  const getCredibilityIcon = (score: number) => {
    if (score >= 0.9) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 0.7) return <Shield className="w-5 h-5 text-blue-500" />;
    if (score >= 0.5) return <Info className="w-5 h-5 text-yellow-500" />;
    if (score >= 0.3) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 0.3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCredibilityLabel = (score: number) => {
    if (score >= 0.9) return 'عالية جداً';
    if (score >= 0.7) return 'عالية';
    if (score >= 0.5) return 'متوسطة';
    if (score >= 0.3) return 'منخفضة';
    return 'مشكوك فيها';
  };

  const getFactorLabel = (factor: string) => {
    switch (factor) {
      case 'consistency': return 'التماسك';
      case 'detail_level': return 'مستوى التفاصيل';
      case 'emotional_authenticity': return 'الأصالة العاطفية';
      case 'factual_accuracy': return 'الدقة الواقعية';
      default: return factor;
    }
  };

  const getFactorDescription = (factor: string) => {
    switch (factor) {
      case 'consistency': return 'مدى تماسك الشهادة وعدم تناقضها';
      case 'detail_level': return 'مستوى التفاصيل والمعلومات المقدمة';
      case 'emotional_authenticity': return 'مصداقية المشاعر والتفاعل العاطفي';
      case 'factual_accuracy': return 'دقة المعلومات والحقائق المذكورة';
      default: return '';
    }
  };

  return (
    <Card className={`border-2 ${getCredibilityColor(credibility_assessment.overall_score)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            {getCredibilityIcon(credibility_assessment.overall_score)}
            <span>طبقة التحقق والمصداقية</span>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge className={getCredibilityColor(credibility_assessment.overall_score)}>
              {getCredibilityLabel(credibility_assessment.overall_score)}
            </Badge>
            <Badge variant="outline">
              {Math.round(credibility_assessment.overall_score * 100)}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* التقييم العام */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: credibility_assessment.overall_score >= 0.7 ? '#10b981' : credibility_assessment.overall_score >= 0.5 ? '#f59e0b' : '#ef4444' }}>
                {Math.round(credibility_assessment.overall_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">النتيجة الإجمالية</div>
              <Progress 
                value={credibility_assessment.overall_score * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-1 text-blue-600">
                {credibility_assessment.level}
              </div>
              <div className="text-sm text-gray-600">مستوى الثقة</div>
              <div className="flex items-center justify-center mt-2">
                {getCredibilityIcon(credibility_assessment.overall_score)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: faithfulMode ? '#10b981' : '#8b5cf6' }}>
                {faithfulMode ? 'أمين' : 'إبداعي'}
              </div>
              <div className="text-sm text-gray-600">وضع التحرير</div>
              <div className="flex items-center justify-center mt-2">
                {faithfulMode ? <Shield className="w-5 h-5 text-green-500" /> : <Eye className="w-5 h-5 text-purple-500" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تفصيل العوامل */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
            <TrendingUp className="w-5 h-5" />
            <span>تحليل عوامل المصداقية</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(credibility_assessment.factors).map(([factor, value]) => (
              <Card key={factor} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{getFactorLabel(factor)}</h4>
                    <Badge variant="outline">{Math.round(value * 100)}%</Badge>
                  </div>
                  
                  <Progress value={value * 100} className="mb-2" />
                  
                  <p className="text-xs text-gray-600">
                    {getFactorDescription(factor)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* إرشادات الاستخدام */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
            <FileText className="w-5 h-5" />
            <span>إرشادات الاستخدام</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-green-600">في الوضع الأمين:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• حافظ على الحقائق الأساسية</li>
                <li>• لا تغير الأسماء والتواريخ</li>
                <li>• احترم سياق الأحداث</li>
                <li>• استخدم العناصر عالية المصداقية</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 text-purple-600">في الوضع الإبداعي:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• حرية في التطوير الأدبي</li>
                <li>• إمكانية إضافة تفاصيل خيالية</li>
                <li>• تطوير الشخصيات إبداعياً</li>
                <li>• الحفاظ على الشفافية في التغييرات</li>
              </ul>
            </div>
          </div>
        </div>

        {/* تحذيرات ونصائح */}
        {credibility_assessment.overall_score < 0.7 && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">تنبيه: مستوى مصداقية متوسط</h4>
            </div>
            <p className="text-sm text-yellow-700">
              يُنصح بالحذر عند استخدام هذه المعلومات. تأكد من التحقق من المصادر الإضافية قبل الاستخدام في الأعمال التاريخية أو الوثائقية.
            </p>
          </div>
        )}

        {credibility_assessment.overall_score < 0.5 && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800">تحذير: مصداقية منخفضة</h4>
            </div>
            <p className="text-sm text-red-700">
              هذه المعلومات قد تحتوي على تناقضات أو عدم دقة. يُنصح بشدة بالاستخدام للأغراض الإبداعية فقط مع الإشارة الواضحة لطبيعة المحتوى.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
