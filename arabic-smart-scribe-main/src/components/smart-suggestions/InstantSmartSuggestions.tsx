
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  BookOpen, 
  Zap, 
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartSuggestion {
  id: string;
  type: 'context' | 'vocabulary' | 'flow' | 'content';
  category: string;
  suggestion: string;
  original_text?: string;
  improved_text?: string;
  confidence: number;
  impact: string;
  reasoning: string;
  position?: {
    start: number;
    end: number;
  };
}

interface SuggestionResponse {
  suggestions: SmartSuggestion[];
  context_analysis: {
    topic: string;
    audience: string;
    tone: string;
    genre: string;
  };
  vocabulary_insights: {
    complexity_level: number;
    repetitive_words: string[];
    suggested_alternatives: Array<{
      word: string;
      alternatives: string[];
    }>;
  };
  flow_analysis: {
    transition_quality: number;
    paragraph_coherence: number;
    overall_flow_score: number;
  };
}

interface InstantSmartSuggestionsProps {
  content: string;
  selectedText?: string;
  onSuggestionApply: (suggestion: SmartSuggestion) => void;
  onTextImprovement: (originalText: string, improvedText: string) => void;
}

export const InstantSmartSuggestions: React.FC<InstantSmartSuggestionsProps> = ({
  content,
  selectedText,
  onSuggestionApply,
  onTextImprovement
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [contextAnalysis, setContextAnalysis] = useState<SuggestionResponse['context_analysis'] | null>(null);
  const [vocabularyInsights, setVocabularyInsights] = useState<SuggestionResponse['vocabulary_insights'] | null>(null);
  const [flowAnalysis, setFlowAnalysis] = useState<SuggestionResponse['flow_analysis'] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const suggestionCategories = [
    { id: 'all', name: 'الكل', icon: Lightbulb },
    { id: 'context', name: 'السياق', icon: BookOpen },
    { id: 'vocabulary', name: 'المفردات', icon: Zap },
    { id: 'flow', name: 'التدفق', icon: TrendingUp },
    { id: 'content', name: 'المحتوى', icon: RefreshCw }
  ];

  const generateSuggestions = useCallback(async () => {
    if (!content || content.trim().length < 20) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-smart-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          selected_text: selectedText,
          suggestion_types: ['context', 'vocabulary', 'flow', 'content'],
          max_suggestions: 10
        }),
      });

      if (response.ok) {
        const data: SuggestionResponse = await response.json();
        setSuggestions(data.suggestions);
        setContextAnalysis(data.context_analysis);
        setVocabularyInsights(data.vocabulary_insights);
        setFlowAnalysis(data.flow_analysis);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "خطأ في توليد الاقتراحات",
        description: "حدث خطأ أثناء توليد الاقتراحات الذكية",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, selectedText]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateSuggestions();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [generateSuggestions]);

  const handleApplySuggestion = (suggestion: SmartSuggestion) => {
    onSuggestionApply(suggestion);
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    
    if (suggestion.original_text && suggestion.improved_text) {
      onTextImprovement(suggestion.original_text, suggestion.improved_text);
    }

    toast({
      title: "تم تطبيق الاقتراح",
      description: suggestion.suggestion,
    });
  };

  const filteredSuggestions = suggestions.filter(suggestion => 
    activeCategory === 'all' || suggestion.type === activeCategory
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'context': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'vocabulary': return <Zap className="w-4 h-4 text-purple-600" />;
      case 'flow': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'content': return <RefreshCw className="w-4 h-4 text-orange-600" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'context': return 'bg-blue-100 text-blue-800';
      case 'vocabulary': return 'bg-purple-100 text-purple-800';
      case 'flow': return 'bg-green-100 text-green-800';
      case 'content': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              <span>الاقتراحات الذكية الفورية</span>
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={generateSuggestions}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 ml-1 ${isGenerating ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Context Analysis */}
      {contextAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تحليل السياق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-gray-600">الموضوع:</span>
                <Badge className="mr-1">{contextAnalysis.topic}</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">الجمهور:</span>
                <Badge className="mr-1">{contextAnalysis.audience}</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">النبرة:</span>
                <Badge className="mr-1">{contextAnalysis.tone}</Badge>
              </div>
              <div>
                <span className="text-sm text-gray-600">النوع:</span>
                <Badge className="mr-1">{contextAnalysis.genre}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flow Analysis */}
      {flowAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تحليل التدفق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-xl font-bold ${getConfidenceColor(flowAnalysis.transition_quality)}`}>
                  {Math.round(flowAnalysis.transition_quality * 100)}%
                </div>
                <p className="text-sm text-gray-600">جودة الانتقالات</p>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getConfidenceColor(flowAnalysis.paragraph_coherence)}`}>
                  {Math.round(flowAnalysis.paragraph_coherence * 100)}%
                </div>
                <p className="text-sm text-gray-600">تماسك الفقرات</p>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getConfidenceColor(flowAnalysis.overall_flow_score)}`}>
                  {Math.round(flowAnalysis.overall_flow_score * 100)}%
                </div>
                <p className="text-sm text-gray-600">التدفق العام</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex space-x-2 space-x-reverse overflow-x-auto pb-2">
        {suggestionCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center space-x-2 space-x-reverse whitespace-nowrap"
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Suggestions List */}
      {isGenerating ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">جاري توليد الاقتراحات</h3>
              <p className="text-gray-600">يرجى الانتظار بينما نحلل النص ونولد اقتراحات ذكية...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredSuggestions.length > 0 ? (
        <div className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className={appliedSuggestions.has(suggestion.id) ? 'bg-green-50 border-green-200' : ''}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getTypeIcon(suggestion.type)}
                      <Badge className={getTypeColor(suggestion.type)}>
                        {suggestion.category}
                      </Badge>
                      <Badge variant="outline" className={getConfidenceColor(suggestion.confidence)}>
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                    {appliedSuggestions.has(suggestion.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  {/* Suggestion Content */}
                  <div>
                    <p className="text-sm font-medium mb-1">{suggestion.suggestion}</p>
                    <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                  </div>

                  {/* Before/After Text */}
                  {suggestion.original_text && suggestion.improved_text && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-500 font-medium">النص الأصلي:</span>
                          <p className="text-sm bg-red-50 p-2 rounded mt-1">{suggestion.original_text}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 font-medium">النص المحسن:</span>
                          <p className="text-sm bg-green-50 p-2 rounded mt-1">{suggestion.improved_text}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Impact */}
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <span className="font-medium text-blue-800">التأثير المتوقع:</span>
                    <span className="text-blue-700 mr-1">{suggestion.impact}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      size="sm"
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={appliedSuggestions.has(suggestion.id)}
                      className="flex-1"
                    >
                      {appliedSuggestions.has(suggestion.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 ml-1" />
                          تم التطبيق
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 ml-1" />
                          تطبيق الاقتراح
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 ml-1" />
                      معاينة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد اقتراحات متاحة</h3>
            <p className="text-gray-600">اكتب المزيد من النص للحصول على اقتراحات ذكية</p>
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Insights */}
      {vocabularyInsights && vocabularyInsights.suggested_alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">اقتراحات المفردات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vocabularyInsights.suggested_alternatives.slice(0, 5).map((alternative, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="font-medium">{alternative.word}</span>
                  <div className="flex space-x-1 space-x-reverse">
                    {alternative.alternatives.slice(0, 3).map((alt, altIndex) => (
                      <Badge key={altIndex} variant="outline" className="text-xs">
                        {alt}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
