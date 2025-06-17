
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Star, 
  Heart, 
  Frown, 
  Smile,
  Meh,
  Angry,
  Filter,
  Copy,
  Play,
  FileText,
  GripVertical
} from 'lucide-react';

interface Dialogue {
  id: string;
  speaker: string;
  content: string;
  emotional_tone: string;
  literary_value: number;
  context: string;
  credibility_score: number;
  participants: string[];
}

interface DialogueGalleryProps {
  dialogues: Dialogue[];
  onDialogueSelect: (dialogue: Dialogue) => void;
  selectedDialogues: Dialogue[];
  showCredibilityLayer: boolean;
  onDialogueToScene: (dialogue: Dialogue) => void;
  onDialogueDrag: (dialogue: Dialogue, type: 'dialogue') => void;
}

export const DialogueGallery: React.FC<DialogueGalleryProps> = ({
  dialogues,
  onDialogueSelect,
  selectedDialogues,
  showCredibilityLayer,
  onDialogueToScene,
  onDialogueDrag
}) => {
  const [sortBy, setSortBy] = useState<'literary_value' | 'emotional_tone' | 'speaker' | 'credibility'>('literary_value');
  const [filterTone, setFilterTone] = useState<string>('all');
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);

  const getEmotionalIcon = (tone: string) => {
    switch (tone.toLowerCase()) {
      case 'سعيد':
      case 'مبهج':
      case 'متفائل':
        return <Smile className="w-4 h-4 text-green-500" />;
      case 'حزين':
      case 'كئيب':
      case 'محبط':
        return <Frown className="w-4 h-4 text-blue-500" />;
      case 'غاضب':
      case 'منفعل':
      case 'ثائر':
        return <Angry className="w-4 h-4 text-red-500" />;
      case 'عاطفي':
      case 'رومانسي':
      case 'حنون':
        return <Heart className="w-4 h-4 text-pink-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.9) return 'border-green-500 bg-green-50';
    if (score >= 0.7) return 'border-blue-500 bg-blue-50';
    if (score >= 0.5) return 'border-yellow-500 bg-yellow-50';
    if (score >= 0.3) return 'border-orange-500 bg-orange-50';
    return 'border-red-500 bg-red-50';
  };

  const getLiteraryValueStars = (value: number) => {
    const stars = Math.round(value * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const sortedDialogues = [...dialogues]
    .filter(dialogue => filterTone === 'all' || dialogue.emotional_tone.toLowerCase().includes(filterTone.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'literary_value':
          return b.literary_value - a.literary_value;
        case 'credibility':
          return b.credibility_score - a.credibility_score;
        case 'speaker':
          return a.speaker.localeCompare(b.speaker);
        case 'emotional_tone':
          return a.emotional_tone.localeCompare(b.emotional_tone);
        default:
          return 0;
      }
    });

  const handleDialogueClick = (dialogue: Dialogue) => {
    setSelectedDialogue(dialogue);
    onDialogueSelect(dialogue);
  };

  const handleDragStart = (dialogue: Dialogue) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...dialogue,
      elementType: 'dialogue'
    }));
    onDialogueDrag(dialogue, 'dialogue');
  };

  const copyDialogue = (dialogue: Dialogue) => {
    const text = `${dialogue.speaker}: "${dialogue.content}"\n\nالسياق: ${dialogue.context}\nالنبرة العاطفية: ${dialogue.emotional_tone}\nالقيمة الأدبية: ${Math.round(dialogue.literary_value * 100)}%`;
    navigator.clipboard.writeText(text);
  };

  const uniqueTones = Array.from(new Set(dialogues.map(d => d.emotional_tone)));

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4 space-x-reverse">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="literary_value">القيمة الأدبية</option>
                  <option value="credibility">المصداقية</option>
                  <option value="speaker">المتحدث</option>
                  <option value="emotional_tone">النبرة العاطفية</option>
                </select>
              </div>
              
              <select
                value={filterTone}
                onChange={(e) => setFilterTone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">جميع النبرات</option>
                {uniqueTones.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600">
              عرض {sortedDialogues.length} من {dialogues.length} حوار
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معرض الحوارات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDialogues.map((dialogue) => {
          const isSelected = selectedDialogues.some(d => d.id === dialogue.id);
          const credibilityClass = showCredibilityLayer ? getCredibilityColor(dialogue.credibility_score) : '';

          return (
            <Card 
              key={dialogue.id}
              className={`hover:shadow-lg transition-all cursor-pointer relative ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${credibilityClass}`}
              onClick={() => handleDialogueClick(dialogue)}
              draggable
              onDragStart={handleDragStart(dialogue)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium flex items-center space-x-2 space-x-reverse">
                      <MessageSquare className="w-4 h-4" />
                      <span>{dialogue.speaker}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                      {getEmotionalIcon(dialogue.emotional_tone)}
                      <span className="text-xs text-gray-600">{dialogue.emotional_tone}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    {showCredibilityLayer && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(dialogue.credibility_score * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* نص الحوار */}
                <div className="bg-gray-50 p-3 rounded-lg border-r-4 border-blue-500">
                  <p className="text-sm italic leading-relaxed">"{dialogue.content}"</p>
                </div>

                {/* السياق */}
                <div className="text-xs text-gray-600">
                  <span className="font-medium">السياق: </span>
                  {dialogue.context}
                </div>

                {/* المشاركون */}
                {dialogue.participants.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dialogue.participants.map((participant, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {participant}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* القيمة الأدبية */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span className="text-xs text-gray-600">القيمة الأدبية:</span>
                    <div className="flex space-x-1">
                      {getLiteraryValueStars(dialogue.literary_value)}
                    </div>
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round(dialogue.literary_value * 100)}%
                  </span>
                </div>

                {/* الأزرار */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyDialogue(dialogue);
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDialogueToScene(dialogue);
                    }}
                  >
                    <FileText className="w-3 h-3 ml-1" />
                    إلى مشهد
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* إحصائيات سريعة */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {dialogues.filter(d => d.literary_value >= 0.8).length}
              </div>
              <div className="text-sm text-gray-600">قيمة أدبية عالية</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                {dialogues.filter(d => d.credibility_score >= 0.8).length}
              </div>
              <div className="text-sm text-gray-600">مصداقية عالية</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {uniqueTones.length}
              </div>
              <div className="text-sm text-gray-600">نبرة عاطفية مختلفة</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Array.from(new Set(dialogues.map(d => d.speaker))).length}
              </div>
              <div className="text-sm text-gray-600">متحدث مختلف</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نافذة تفاصيل الحوار المنبثقة */}
      {selectedDialogue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <MessageSquare className="w-5 h-5" />
                  <span>حوار مع {selectedDialogue.speaker}</span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDialogue(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* النص الكامل */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-r-4 border-blue-500">
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">{selectedDialogue.speaker}</span>
                </div>
                <p className="text-lg leading-relaxed italic">"{selectedDialogue.content}"</p>
              </div>

              {/* التفاصيل */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">السياق:</h4>
                  <p className="text-sm text-gray-600">{selectedDialogue.context}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">النبرة العاطفية:</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {getEmotionalIcon(selectedDialogue.emotional_tone)}
                    <span className="text-sm">{selectedDialogue.emotional_tone}</span>
                  </div>
                </div>
              </div>

              {/* المشاركون */}
              {selectedDialogue.participants.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">المشاركون في الحوار:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDialogue.participants.map((participant, i) => (
                      <Badge key={i} variant="outline">{participant}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* التقييمات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">القيمة الأدبية:</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="flex space-x-1">
                      {getLiteraryValueStars(selectedDialogue.literary_value)}
                    </div>
                    <span className="font-medium">{Math.round(selectedDialogue.literary_value * 100)}%</span>
                  </div>
                </div>
                
                {showCredibilityLayer && (
                  <div>
                    <h4 className="font-semibold mb-2">المصداقية:</h4>
                    <Badge className={getCredibilityColor(selectedDialogue.credibility_score)}>
                      {Math.round(selectedDialogue.credibility_score * 100)}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* الأزرار */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button 
                    size="sm"
                    onClick={() => copyDialogue(selectedDialogue)}
                  >
                    <Copy className="w-4 h-4 ml-1" />
                    نسخ النص
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onDialogueToScene(selectedDialogue);
                      setSelectedDialogue(null);
                    }}
                  >
                    <FileText className="w-4 h-4 ml-1" />
                    تحويل إلى مشهد
                  </Button>
                </div>
                
                <Button 
                  size="sm"
                  onClick={() => {
                    onDialogueSelect(selectedDialogue);
                    setSelectedDialogue(null);
                  }}
                >
                  <Play className="w-4 h-4 ml-1" />
                  إضافة للمشهد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
