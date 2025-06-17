
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  GripVertical, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  Heart,
  Lightbulb,
  MapPin
} from 'lucide-react';

interface StoryboardScene {
  id: string;
  title: string;
  summary: string;
  emotional_tone: 'joy' | 'sadness' | 'anger' | 'fear' | 'pride' | 'pain';
  dramatic_weight: number;
  estimated_pages: number;
  status: 'draft' | 'written' | 'edited' | 'finalized';
  character_focus: string[];
  key_elements: string[];
  visual_description: string;
  position: number;
}

interface VisualStoryboardProps {
  generatedScenes: any[];
  onSceneReorder: (scenes: StoryboardScene[]) => void;
  onSceneEdit: (sceneId: string) => void;
  onSceneAdd: (afterSceneId?: string) => void;
}

export const VisualStoryboard: React.FC<VisualStoryboardProps> = ({
  generatedScenes,
  onSceneReorder,
  onSceneEdit,
  onSceneAdd
}) => {
  const [scenes, setScenes] = useState<StoryboardScene[]>([
    {
      id: '1',
      title: 'قرار الانضمام للجبل',
      summary: 'اللحظة التي اتخذ فيها حمادي قرار ترك عائلته والانضمام للمقاومة المسلحة',
      emotional_tone: 'pride',
      dramatic_weight: 0.9,
      estimated_pages: 4,
      status: 'written',
      character_focus: ['حمادي غرس', 'الوالد', 'الأم'],
      key_elements: ['القرار الصعب', 'الوداع الصامت', 'رحلة إلى المجهول'],
      visual_description: 'مشهد ليلي في البيت التقليدي، نور الشمعة يرقص على الوجوه المتوترة',
      position: 1
    },
    {
      id: '2',
      title: 'أول لقاء مع لزهر الشرايطي',
      summary: 'تعرف حمادي على قائد المجموعة وبداية التدريب على حياة المقاومة',
      emotional_tone: 'pride',
      dramatic_weight: 0.7,
      estimated_pages: 3,
      status: 'draft',
      character_focus: ['حمادي غرس', 'لزهر الشرايطي'],
      key_elements: ['التدريب', 'بناء الثقة', 'تعلم قواعد الجبل'],
      visual_description: 'كهف طبيعي في الجبل، رجال مسلحون حول نار صغيرة',
      position: 2
    },
    {
      id: '3',
      title: 'كمين السكة الحديدية',
      summary: 'العملية الأولى التي شارك فيها حمادي - تفجير جسر السكة الحديدية',
      emotional_tone: 'fear',
      dramatic_weight: 0.85,
      estimated_pages: 5,
      status: 'written',
      character_focus: ['حمادي غرس', 'لزهر الشرايطي', 'المجموعة'],
      key_elements: ['التخطيط', 'التنفيذ', 'الانفجار', 'النجاة'],
      visual_description: 'ليلة مظلمة، ضوء القطار يقترب، انفجار مدوي',
      position: 3
    },
    {
      id: '4',
      title: 'الخيانة والمطاردة',
      summary: 'اكتشاف وجود خائن في المجموعة وهروب المقاتلين',
      emotional_tone: 'anger',
      dramatic_weight: 0.8,
      estimated_pages: 4,
      status: 'draft',
      character_focus: ['حمادي غرس', 'الخائن المجهول', 'لزهر الشرايطي'],
      key_elements: ['الشك', 'المواجهة', 'الهروب', 'فقدان الرفاق'],
      visual_description: 'مطاردة عبر الجبال الوعرة، أصوات الرصاص تتردد في الوديان',
      position: 4
    },
    {
      id: '5',
      title: 'لحظة الاستشهاد',
      summary: 'استشهاد لزهر الشرايطي وتأثير ذلك على حمادي والمجموعة',
      emotional_tone: 'sadness',
      dramatic_weight: 0.95,
      estimated_pages: 6,
      status: 'draft',
      character_focus: ['لزهر الشرايطي', 'حمادي غرس'],
      key_elements: ['المعركة الأخيرة', 'الوداع', 'تولي القيادة', 'الحزن والفخر'],
      visual_description: 'معركة ضارية في الفجر، دماء على الصخور، نظرة الوداع',
      position: 5
    }
  ]);

  const [draggedScene, setDraggedScene] = useState<string | null>(null);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: 'bg-yellow-100 text-yellow-800',
      sadness: 'bg-blue-100 text-blue-800',
      anger: 'bg-red-100 text-red-800',
      fear: 'bg-purple-100 text-purple-800',
      pride: 'bg-green-100 text-green-800',
      pain: 'bg-gray-100 text-gray-800'
    };
    return colors[emotion as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      written: 'bg-blue-100 text-blue-800',
      edited: 'bg-orange-100 text-orange-800',
      finalized: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEmotionIcon = (emotion: string) => {
    const icons = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😰',
      pride: '🦁',
      pain: '💔'
    };
    return icons[emotion as keyof typeof icons] || '😐';
  };

  const handleDragStart = (sceneId: string) => {
    setDraggedScene(sceneId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSceneId: string) => {
    if (!draggedScene || draggedScene === targetSceneId) return;

    const draggedSceneObj = scenes.find(s => s.id === draggedScene);
    const targetSceneObj = scenes.find(s => s.id === targetSceneId);
    
    if (!draggedSceneObj || !targetSceneObj) return;

    const newScenes = [...scenes];
    const draggedIndex = newScenes.findIndex(s => s.id === draggedScene);
    const targetIndex = newScenes.findIndex(s => s.id === targetSceneId);

    // إزالة المشهد المسحوب
    newScenes.splice(draggedIndex, 1);
    
    // إدراجه في الموقع الجديد
    newScenes.splice(targetIndex, 0, draggedSceneObj);

    // إعادة ترقيم المواقع
    const reorderedScenes = newScenes.map((scene, index) => ({
      ...scene,
      position: index + 1
    }));

    setScenes(reorderedScenes);
    onSceneReorder(reorderedScenes);
    setDraggedScene(null);
  };

  const addNewScene = (afterSceneId?: string) => {
    const newScene: StoryboardScene = {
      id: Date.now().toString(),
      title: 'مشهد جديد',
      summary: 'وصف المشهد...',
      emotional_tone: 'pride',
      dramatic_weight: 0.5,
      estimated_pages: 2,
      status: 'draft',
      character_focus: ['حمادي غرس'],
      key_elements: ['عنصر جديد'],
      visual_description: 'وصف بصري للمشهد',
      position: scenes.length + 1
    };

    let insertIndex = scenes.length;
    if (afterSceneId) {
      const afterIndex = scenes.findIndex(s => s.id === afterSceneId);
      insertIndex = afterIndex + 1;
    }

    const newScenes = [...scenes];
    newScenes.splice(insertIndex, 0, newScene);
    
    // إعادة ترقيم المواقع
    const reorderedScenes = newScenes.map((scene, index) => ({
      ...scene,
      position: index + 1
    }));

    setScenes(reorderedScenes);
    onSceneAdd(afterSceneId);
  };

  const deleteScene = (sceneId: string) => {
    const newScenes = scenes.filter(s => s.id !== sceneId)
      .map((scene, index) => ({
        ...scene,
        position: index + 1
      }));
    setScenes(newScenes);
  };

  const totalPages = scenes.reduce((sum, scene) => sum + scene.estimated_pages, 0);
  const completedScenes = scenes.filter(s => s.status === 'finalized').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span>لوحة القصة المرئية</span>
            </CardTitle>
            <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
              <span>{scenes.length} مشهد</span>
              <span>•</span>
              <span>{totalPages} صفحة متوقعة</span>
              <span>•</span>
              <span>{completedScenes} مكتمل</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                draggable
                onDragStart={() => handleDragStart(scene.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(scene.id)}
                className={`relative group cursor-move transition-all duration-200 hover:shadow-lg ${
                  draggedScene === scene.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-500">#{scene.position}</span>
                      </div>
                      <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => onSceneEdit(scene.id)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteScene(scene.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-2">{scene.title}</h3>
                      <div className="flex items-center space-x-2 space-x-reverse mt-1">
                        <Badge className={getEmotionColor(scene.emotional_tone)}>
                          {getEmotionIcon(scene.emotional_tone)}
                        </Badge>
                        <Badge className={getStatusColor(scene.status)}>
                          {scene.status === 'draft' ? 'مسودة' :
                           scene.status === 'written' ? 'مكتوب' :
                           scene.status === 'edited' ? 'محرر' : 'نهائي'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-xs text-gray-600 line-clamp-3">{scene.summary}</p>
                      
                      <div className="text-xs text-gray-500">
                        <div className="bg-gray-50 p-2 rounded italic">
                          "{scene.visual_description}"
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>الوزن الدرامي:</span>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                                style={{ width: `${scene.dramatic_weight * 100}%` }}
                              />
                            </div>
                            <span>{Math.round(scene.dramatic_weight * 100)}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <Clock className="w-3 h-3" />
                            <span>الصفحات:</span>
                          </span>
                          <span>{scene.estimated_pages}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">الشخصيات:</div>
                        <div className="flex flex-wrap gap-1">
                          {scene.character_focus.slice(0, 2).map((character, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {character}
                            </Badge>
                          ))}
                          {scene.character_focus.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{scene.character_focus.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">العناصر الرئيسية:</div>
                        <div className="text-xs text-gray-600">
                          {scene.key_elements.slice(0, 2).join(', ')}
                          {scene.key_elements.length > 2 && '...'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex space-x-2 space-x-reverse">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Eye className="w-3 h-3 ml-1" />
                        معاينة
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addNewScene(scene.id)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* بطاقة إضافة مشهد جديد */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
              <CardContent 
                className="flex flex-col items-center justify-center h-full p-8 text-center"
                onClick={() => addNewScene()}
              >
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">إضافة مشهد جديد</span>
              </CardContent>
            </Card>
          </div>

          {/* إحصائيات سريعة */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-semibold mb-2">ملخص المشروع</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-blue-600">{scenes.length}</div>
                <div className="text-gray-600">مشهد</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{totalPages}</div>
                <div className="text-gray-600">صفحة متوقعة</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600">{completedScenes}</div>
                <div className="text-gray-600">مشهد مكتمل</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600">
                  {Math.round((completedScenes / scenes.length) * 100)}%
                </div>
                <div className="text-gray-600">نسبة الإنجاز</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
