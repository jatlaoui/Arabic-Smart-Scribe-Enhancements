
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Clock,
  BookOpen,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

interface ComprehensiveAnalysis {
  structure_analysis: {
    paragraph_consistency: number;
    logical_flow: number;
    transition_quality: number;
    organization_score: number;
  };
  style_analysis: {
    tone: string;
    formality_level: number;
    rhythm_score: number;
    figurative_language: {
      metaphors: number;
      similes: number;
      imagery_density: number;
    };
    stylistic_signature: {
      sentence_variety: number;
      vocabulary_richness: number;
      unique_voice_strength: number;
    };
  };
  clarity_analysis: {
    readability_score: number;
    complexity_appropriate: boolean;
    ambiguity_instances: Array<{
      text: string;
      issue: string;
      suggestion: string;
    }>;
    coherence_score: number;
  };
  problem_detection: {
    spelling_errors: Array<{
      word: string;
      position: number;
      suggestions: string[];
    }>;
    formatting_issues: Array<{
      type: string;
      description: string;
      line: number;
    }>;
    style_issues: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestion: string;
    }>;
    flow_problems: Array<{
      paragraph: number;
      issue: string;
      impact: string;
    }>;
  };
  detailed_metrics: {
    word_count: number;
    sentence_count: number;
    paragraph_count: number;
    average_sentence_length: number;
    reading_time_minutes: number;
    complexity_level: string;
    grade_level: number;
    passive_voice_percentage: number;
    dialogue_percentage: number;
  };
  smart_suggestions: Array<{
    category: string;
    suggestion: string;
    impact: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface AdvancedTextAnalysisProps {
  content: string;
  onSuggestionApply?: (suggestion: string) => void;
}

export const AdvancedTextAnalysis: React.FC<AdvancedTextAnalysisProps> = ({
  content,
  onSuggestionApply
}) => {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (content && content.trim().length > 50) {
      performAnalysis();
    }
  }, [content]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-text-comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          analysis_type: 'comprehensive',
          include_suggestions: true
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Lightbulb className="w-4 h-4 text-blue-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">جاري التحليل المتقدم</h3>
            <p className="text-gray-600">يرجى الانتظار بينما نحلل النص بشكل شامل...</p>
            <Progress value={33} className="mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">تحليل النص المتقدم</h3>
          <p className="text-gray-600">اكتب نصاً أطول من 50 كلمة لبدء التحليل الشامل</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>التحليل المتقدم للنص</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="style">تحليل الأسلوب</TabsTrigger>
          <TabsTrigger value="problems">كشف المشاكل</TabsTrigger>
          <TabsTrigger value="suggestions">الاقتراحات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quality Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.structure_analysis.organization_score)}`}>
                  {Math.round(analysis.structure_analysis.organization_score * 100)}%
                </div>
                <p className="text-sm text-gray-600">تنظيم الهيكل</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.clarity_analysis.readability_score)}`}>
                  {Math.round(analysis.clarity_analysis.readability_score * 100)}%
                </div>
                <p className="text-sm text-gray-600">وضوح النص</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.style_analysis.stylistic_signature.unique_voice_strength)}`}>
                  {Math.round(analysis.style_analysis.stylistic_signature.unique_voice_strength * 100)}%
                </div>
                <p className="text-sm text-gray-600">قوة الأسلوب</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(analysis.clarity_analysis.coherence_score)}`}>
                  {Math.round(analysis.clarity_analysis.coherence_score * 100)}%
                </div>
                <p className="text-sm text-gray-600">التماسك</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-5 h-5" />
                <span>المقاييس المفصلة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{analysis.detailed_metrics.word_count.toLocaleString()}</div>
                    <p className="text-sm text-gray-600">كلمة</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Eye className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{analysis.detailed_metrics.sentence_count}</div>
                    <p className="text-sm text-gray-600">جملة</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{analysis.detailed_metrics.reading_time_minutes}</div>
                    <p className="text-sm text-gray-600">دقيقة قراءة</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Target className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{analysis.detailed_metrics.grade_level}</div>
                    <p className="text-sm text-gray-600">مستوى التعقيد</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>مقاييس إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>متوسط طول الجملة</span>
                    <span>{analysis.detailed_metrics.average_sentence_length.toFixed(1)} كلمة</span>
                  </div>
                  <Progress value={Math.min(analysis.detailed_metrics.average_sentence_length * 5, 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>نسبة المبني للمجهول</span>
                    <span>{analysis.detailed_metrics.passive_voice_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysis.detailed_metrics.passive_voice_percentage} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>نسبة الحوار</span>
                    <span>{analysis.detailed_metrics.dialogue_percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={analysis.detailed_metrics.dialogue_percentage} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Style Analysis Tab */}
        <TabsContent value="style" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأسلوب والنبرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">النبرة والرسمية</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">النبرة المهيمنة:</span>
                      <Badge className="mr-2">{analysis.style_analysis.tone}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">مستوى الرسمية:</span>
                      <div className="flex items-center space-x-2 space-x-reverse mt-1">
                        <Progress value={analysis.style_analysis.formality_level * 100} className="flex-1" />
                        <span className="text-sm">{Math.round(analysis.style_analysis.formality_level * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">البصمة الأسلوبية</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.style_analysis.stylistic_signature.sentence_variety)}`}>
                        {Math.round(analysis.style_analysis.stylistic_signature.sentence_variety * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">تنوع الجمل</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.style_analysis.stylistic_signature.vocabulary_richness)}`}>
                        {Math.round(analysis.style_analysis.stylistic_signature.vocabulary_richness * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">ثراء المفردات</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getScoreColor(analysis.style_analysis.stylistic_signature.unique_voice_strength)}`}>
                        {Math.round(analysis.style_analysis.stylistic_signature.unique_voice_strength * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">قوة الصوت</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">اللغة المجازية</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{analysis.style_analysis.figurative_language.metaphors}</div>
                      <p className="text-sm text-gray-600">استعارات</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">{analysis.style_analysis.figurative_language.similes}</div>
                      <p className="text-sm text-gray-600">تشبيهات</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">{Math.round(analysis.style_analysis.figurative_language.imagery_density * 100)}%</div>
                      <p className="text-sm text-gray-600">كثافة الصور</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Problems Detection Tab */}
        <TabsContent value="problems" className="space-y-6">
          {analysis.problem_detection.spelling_errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>أخطاء إملائية</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.problem_detection.spelling_errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <span className="font-semibold text-red-800">{error.word}</span>
                        <span className="text-sm text-gray-600 mr-2">الموضع: {error.position}</span>
                      </div>
                      <div className="text-sm">
                        اقتراحات: {error.suggestions.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.problem_detection.style_issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>مشاكل الأسلوب</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.problem_detection.style_issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{issue.severity}</span>
                      </div>
                      <p className="text-sm mb-2">{issue.description}</p>
                      <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                        💡 {issue.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.problem_detection.flow_problems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>مشاكل التدفق</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.problem_detection.flow_problems.map((problem, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <span className="font-semibold">الفقرة {problem.paragraph}</span>
                        <p className="text-sm text-gray-600">{problem.issue}</p>
                      </div>
                      <div className="text-sm text-blue-600">{problem.impact}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Smart Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span>الاقتراحات الذكية</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.smart_suggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getPriorityIcon(suggestion.priority)}
                        <Badge variant="outline">{suggestion.category}</Badge>
                      </div>
                      <Badge className={
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {suggestion.priority === 'high' ? 'عالي' :
                         suggestion.priority === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{suggestion.suggestion}</p>
                    <p className="text-sm text-green-600">
                      <strong>التأثير المتوقع:</strong> {suggestion.impact}
                    </p>
                    {onSuggestionApply && (
                      <button
                        onClick={() => onSuggestionApply(suggestion.suggestion)}
                        className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        تطبيق الاقتراح
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
