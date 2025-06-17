
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Send, 
  Globe, 
  Search, 
  BookOpen, 
  Copy,
  Download,
  Sparkles,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { GlassmorphicCard } from '../advanced-ui/GlassmorphicCard';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}

interface GeminiAssistantProps {
  onContentGenerated: (content: string) => void;
  context?: string;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  onContentGenerated,
  context
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [activeMode, setActiveMode] = useState<'chat' | 'research' | 'enhance'>('chat');

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: 'مرحباً! أنا مساعدك الذكي المدعوم بـ Gemini. يمكنني مساعدتك في الكتابة والبحث وتطوير المحتوى. كيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const simulateGeminiResponse = async (userMessage: string): Promise<string> => {
    // محاكاة استجابة Gemini
    setIsLoading(true);
    
    // محاكاة البحث في الويب
    if (activeMode === 'research' || userMessage.includes('ابحث') || userMessage.includes('معلومات')) {
      const mockSources: Source[] = [
        {
          title: "مصدر موثوق للمعلومات",
          url: "https://example.com/source1",
          snippet: "معلومات مفيدة حول الموضوع المطلوب...",
          relevance: 0.95
        },
        {
          title: "مرجع أكاديمي متخصص",
          url: "https://example.com/source2", 
          snippet: "دراسة شاملة حول الموضوع مع إحصائيات دقيقة...",
          relevance: 0.89
        }
      ];
      setSources(mockSources);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    if (activeMode === 'research') {
      return `تم البحث عن "${userMessage}" ووجدت معلومات مفيدة من ${sources.length} مصادر موثوقة. يمكنني تلخيص المعلومات وإدراجها في النص بطريقة منظمة. هل تريد مني إنشاء محتوى يتضمن هذه المعلومات؟`;
    } else if (activeMode === 'enhance') {
      return `تم تحليل النص وإليك اقتراحات للتحسين:\n\n• إضافة تفاصيل وصفية أكثر\n• تحسين التدفق السردي\n• إثراء الحوارات\n• إضافة عمق نفسي للشخصيات\n\nهل تريد مني تطبيق هذه التحسينات؟`;
    } else {
      return `شكراً لك على سؤالك. بناءً على السياق المتوفر، يمكنني مساعدتك في:\n\n• تطوير الأفكار وتوسيعها\n• إضافة معلومات من مصادر موثوقة\n• تحسين الأسلوب والسرد\n• إنشاء حوارات طبيعية\n\nما هو التحديد الذي تحتاجه؟`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const assistantResponse = await simulateGeminiResponse(inputMessage);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: assistantResponse,
      timestamp: new Date(),
      sources: sources.length > 0 ? sources.map(s => s.url) : undefined
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex space-x-2 space-x-reverse">
        <Button
          variant={activeMode === 'chat' ? 'default' : 'outline'}
          onClick={() => setActiveMode('chat')}
          className={activeMode === 'chat' ? 'bg-blue-500' : 'border-white/20 text-white'}
        >
          <MessageCircle className="w-4 h-4 ml-1" />
          محادثة
        </Button>
        <Button
          variant={activeMode === 'research' ? 'default' : 'outline'}
          onClick={() => setActiveMode('research')}
          className={activeMode === 'research' ? 'bg-green-500' : 'border-white/20 text-white'}
        >
          <Search className="w-4 h-4 ml-1" />
          بحث
        </Button>
        <Button
          variant={activeMode === 'enhance' ? 'default' : 'outline'}
          onClick={() => setActiveMode('enhance')}
          className={activeMode === 'enhance' ? 'bg-purple-500' : 'border-white/20 text-white'}
        >
          <Sparkles className="w-4 h-4 ml-1" />
          تحسين
        </Button>
      </div>

      <GlassmorphicCard className="p-4">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
            <Brain className="w-5 h-5" />
            <span>مساعد Gemini الذكي</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-200">
              متصل
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-64 w-full">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500/20 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.sources && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-xs text-white/70 mb-1">مصادر:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <ExternalLink className="w-3 h-3 ml-1" />
                              مصدر {index + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/50">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.type === 'assistant' && (
                        <div className="flex space-x-1 space-x-reverse">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 w-6 p-0 text-white/50 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onContentGenerated(message.content)}
                            className="h-6 w-6 p-0 text-white/50 hover:text-white"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white p-3 rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Gemini يفكر...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('ساعدني في كتابة مقدمة جذابة')}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              كتابة مقدمة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('ابحث عن معلومات إضافية حول الموضوع')}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              بحث معلومات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('حسن الأسلوب والسرد')}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              تحسين الأسلوب
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('أضف حوارات طبيعية')}
              className="border-white/20 text-white hover:bg-white/10 text-xs"
            >
              إضافة حوارات
            </Button>
          </div>

          {/* Input */}
          <div className="flex space-x-2 space-x-reverse">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </GlassmorphicCard>

      {/* Sources Panel */}
      {sources.length > 0 && (
        <GlassmorphicCard className="p-4">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2 space-x-reverse">
              <Globe className="w-5 h-5" />
              <span>مصادر من الويب</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{source.title}</h4>
                      <p className="text-white/70 text-xs mt-1">{source.snippet}</p>
                      <div className="flex items-center mt-2 space-x-2 space-x-reverse">
                        <Badge variant="outline" className="text-xs">
                          دقة: {Math.round(source.relevance * 100)}%
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-white/70 hover:text-white"
                        >
                          <ExternalLink className="w-3 h-3 ml-1" />
                          فتح المصدر
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassmorphicCard>
      )}
    </div>
  );
};
