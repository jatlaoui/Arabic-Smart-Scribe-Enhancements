
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Users, 
  Heart, 
  Swords, 
  Minus,
  Home,
  UserPlus,
  Filter,
  Search,
  Copy,
  Quote
} from 'lucide-react';

interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
  quotes: string[];
  credibility_assessment: number;
  relationships: Array<{
    target_id: string;
    relationship_type: 'ally' | 'enemy' | 'neutral' | 'family' | 'friend';
    strength: number;
  }>;
}

interface CharacterRelationWebProps {
  characters: Character[];
  onCharacterSelect: (character: Character) => void;
  selectedCharacters: Character[];
  showCredibilityLayer: boolean;
  onCharacterDrag: (character: Character, type: 'character') => void;
}

interface Position {
  x: number;
  y: number;
}

export const CharacterRelationWeb: React.FC<CharacterRelationWebProps> = ({
  characters,
  onCharacterSelect,
  selectedCharacters,
  showCredibilityLayer,
  onCharacterDrag
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [filterRelation, setFilterRelation] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // تهيئة مواقع الشخصيات
  useEffect(() => {
    if (characters.length === 0) return;

    const newPositions = new Map<string, Position>();
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.3;

    characters.forEach((character, index) => {
      const angle = (index / characters.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      newPositions.set(character.id, { x, y });
    });

    setPositions(newPositions);
  }, [characters, dimensions]);

  // تحديث أبعاد SVG
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 800, height: rect.height || 600 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getCredibilityColor = (score: number) => {
    if (score >= 0.9) return '#10b981'; // green-500
    if (score >= 0.7) return '#3b82f6'; // blue-500
    if (score >= 0.5) return '#f59e0b'; // yellow-500
    if (score >= 0.3) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'ally': return <Users className="w-3 h-3" />;
      case 'enemy': return <Swords className="w-3 h-3" />;
      case 'family': return <Home className="w-3 h-3" />;
      case 'friend': return <Heart className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'ally': return '#10b981';
      case 'enemy': return '#ef4444';
      case 'family': return '#8b5cf6';
      case 'friend': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRelation === 'all') return matchesSearch;
    
    const hasRelation = character.relationships.some(rel => rel.relationship_type === filterRelation);
    return matchesSearch && hasRelation;
  });

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    onCharacterSelect(character);
  };

  const handleDragStart = (character: Character) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...character,
      elementType: 'character'
    }));
    onCharacterDrag(character, 'character');
  };

  const copyCharacterDescription = (character: Character) => {
    const text = `**${character.name}**\n\nالدور: ${character.role}\n\nالخصائص:\n${character.traits.map(trait => `- ${trait}`).join('\n')}\n\nأقوال مهمة:\n${character.quotes.map(quote => `"${quote}"`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    filteredCharacters.forEach(character => {
      const sourcePos = positions.get(character.id);
      if (!sourcePos) return;

      character.relationships.forEach(relationship => {
        const targetChar = characters.find(c => c.id === relationship.target_id);
        const targetPos = positions.get(relationship.target_id);
        
        if (!targetChar || !targetPos || !filteredCharacters.includes(targetChar)) return;

        const isHighlighted = selectedCharacter?.id === character.id || selectedCharacter?.id === targetChar.id;
        const opacity = isHighlighted ? 0.8 : 0.3;
        const strokeWidth = relationship.strength * 3 + 1;

        connections.push(
          <line
            key={`${character.id}-${relationship.target_id}`}
            x1={sourcePos.x}
            y1={sourcePos.y}
            x2={targetPos.x}
            y2={targetPos.y}
            stroke={getRelationshipColor(relationship.relationship_type)}
            strokeWidth={strokeWidth}
            opacity={opacity}
            strokeDasharray={relationship.relationship_type === 'enemy' ? '5,5' : 'none'}
            className="transition-all duration-300"
          />
        );
      });
    });

    return connections;
  };

  const renderCharacterNodes = () => {
    return filteredCharacters.map(character => {
      const position = positions.get(character.id);
      if (!position) return null;

      const isSelected = selectedCharacters.some(c => c.id === character.id);
      const isHighlighted = selectedCharacter?.id === character.id;
      const nodeColor = showCredibilityLayer ? getCredibilityColor(character.credibility_assessment) : '#3b82f6';
      const nodeSize = isHighlighted ? 50 : isSelected ? 45 : 40;

      return (
        <g key={character.id} className="cursor-pointer transition-all duration-300">
          {/* دائرة الشخصية */}
          <circle
            cx={position.x}
            cy={position.y}
            r={nodeSize / 2}
            fill={nodeColor}
            stroke={isSelected ? '#1d4ed8' : '#ffffff'}
            strokeWidth={isSelected ? 3 : 2}
            opacity={isHighlighted ? 1 : 0.8}
            onClick={() => handleCharacterClick(character)}
            className="hover:opacity-100 transition-opacity"
          />
          
          {/* أيقونة المستخدم */}
          <foreignObject
            x={position.x - 8}
            y={position.y - 8}
            width={16}
            height={16}
            className="pointer-events-none"
          >
            <User className="w-4 h-4 text-white" />
          </foreignObject>
          
          {/* اسم الشخصية */}
          <text
            x={position.x}
            y={position.y + nodeSize / 2 + 15}
            textAnchor="middle"
            className="text-sm font-medium fill-gray-700 pointer-events-none"
            fontSize="12"
          >
            {character.name}
          </text>
          
          {/* دور الشخصية */}
          <text
            x={position.x}
            y={position.y + nodeSize / 2 + 30}
            textAnchor="middle"
            className="text-xs fill-gray-500 pointer-events-none"
            fontSize="10"
          >
            {character.role}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between space-x-4 space-x-reverse">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="بحث في الشخصيات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 pl-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <select
                value={filterRelation}
                onChange={(e) => setFilterRelation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">جميع العلاقات</option>
                <option value="ally">حلفاء</option>
                <option value="enemy">أعداء</option>
                <option value="family">عائلة</option>
                <option value="friend">أصدقاء</option>
                <option value="neutral">محايدون</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              عرض {filteredCharacters.length} من {characters.length} شخصية
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الشبكة التفاعلية */}
      <Card>
        <CardContent className="p-6">
          <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="absolute inset-0"
            >
              {/* الروابط */}
              <g>{renderConnections()}</g>
              
              {/* العقد */}
              <g>{renderCharacterNodes()}</g>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* مفتاح الألوان */}
      {showCredibilityLayer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">مفتاح ألوان المصداقية</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center space-x-6 space-x-reverse text-xs">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>عالية جداً (90%+)</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>عالية (70-89%)</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>متوسطة (50-69%)</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span>منخفضة (30-49%)</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>مشكوك فيها (أقل من 30%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* لوحة تفاصيل الشخصية */}
      {selectedCharacter && (
        <div className="fixed left-4 top-20 bottom-4 w-80 z-40">
          <Card className="h-full overflow-y-auto">
            <CardHeader className="sticky top-0 bg-white z-10 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedCharacter.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCharacter(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">الدور:</h4>
                <p className="text-sm text-gray-600">{selectedCharacter.role}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">الخصائص:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCharacter.traits.map((trait, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">أقوال مميزة:</h4>
                <div className="space-y-2">
                  {selectedCharacter.quotes.map((quote, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border-r-4 border-purple-500">
                      <p className="text-sm italic">"{quote}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">العلاقات:</h4>
                <div className="space-y-2">
                  {selectedCharacter.relationships.map((rel, i) => {
                    const targetChar = characters.find(c => c.id === rel.target_id);
                    if (!targetChar) return null;

                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          {getRelationshipIcon(rel.relationship_type)}
                          <span>{targetChar.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rel.relationship_type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {showCredibilityLayer && (
                <div>
                  <h4 className="font-semibold mb-2">تقييم المصداقية:</h4>
                  <Badge className="text-xs" style={{ 
                    backgroundColor: getCredibilityColor(selectedCharacter.credibility_assessment),
                    color: 'white' 
                  }}>
                    {Math.round(selectedCharacter.credibility_assessment * 100)}%
                  </Badge>
                </div>
              )}

              <div className="flex items-center space-x-2 space-x-reverse pt-4 border-t">
                <Button 
                  size="sm"
                  onClick={() => copyCharacterDescription(selectedCharacter)}
                >
                  <Copy className="w-4 h-4 ml-1" />
                  نسخ
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  draggable
                  onDragStart={handleDragStart(selectedCharacter)}
                >
                  <UserPlus className="w-4 h-4 ml-1" />
                  سحب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
