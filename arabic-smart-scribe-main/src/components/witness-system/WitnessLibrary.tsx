
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Trash2,
  FileText,
  Video,
  Mic,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';

interface WitnessSource {
  id: number;
  title: string;
  description: string;
  source_type: 'video' | 'audio' | 'written';
  created_at: string;
  analysis_stats: {
    word_count: number;
    estimated_duration: number;
  };
  credibility_score?: number;
  events_count?: number;
  characters_count?: number;
  dialogues_count?: number;
}

interface WitnessLibraryProps {
  sources: WitnessSource[];
  onSelectSource: (source: WitnessSource) => void;
  onDeleteSource: (id: number) => void;
}

export const WitnessLibrary: React.FC<WitnessLibraryProps> = ({
  sources,
  onSelectSource,
  onDeleteSource
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'written'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'credibility'>('date');
  const [filteredSources, setFilteredSources] = useState(sources);

  useEffect(() => {
    let filtered = sources.filter(source => {
      const matchesSearch = source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || source.source_type === filterType;
      return matchesSearch && matchesFilter;
    });

    // الترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'credibility':
          return (b.credibility_score || 0) - (a.credibility_score || 0);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredSources(filtered);
  }, [sources, searchTerm, filterType, sortBy]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Mic className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCredibilityBadge = (score?: number) => {
    if (!score) return <Badge variant="secondary">غير محلل</Badge>;
    if (score >= 0.9) return <Badge className="bg-green-500">عالية جداً</Badge>;
    if (score >= 0.7) return <Badge className="bg-blue-500">عالية</Badge>;
    if (score >= 0.5) return <Badge className="bg-yellow-500">متوسطة</Badge>;
    if (score >= 0.3) return <Badge className="bg-orange-500">منخفضة</Badge>;
    return <Badge variant="destructive">مشكوك فيها</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FileText className="w-5 h-5" />
            <span>مكتبة ترانسكريبت الشهود ({sources.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* أدوات البحث والتصفية */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث في الترانسكريبت..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="all">جميع الأنواع</option>
              <option value="video">مقاطع فيديو</option>
              <option value="audio">تسجيلات صوتية</option>
              <option value="written">شهادات مكتوبة</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="date">الأحدث أولاً</option>
              <option value="title">ترتيب أبجدي</option>
              <option value="credibility">الأعلى مصداقية</option>
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              <Filter className="w-4 h-4 ml-1" />
              {filteredSources.length} من {sources.length} مصدر
            </div>
          </div>

          {/* قائمة المصادر */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSources.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getSourceIcon(source.source_type)}
                      <h3 className="font-semibold text-sm">{source.title}</h3>
                    </div>
                    {getCredibilityBadge(source.credibility_score)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {source.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold">{source.analysis_stats.word_count}</div>
                      <div className="text-gray-600">كلمة</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold">{source.events_count || 0}</div>
                      <div className="text-gray-600">حدث</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold">{source.characters_count || 0}</div>
                      <div className="text-gray-600">شخصية</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center space-x-1 space-x-reverse">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(source.created_at)}</span>
                    </span>
                    <span>{source.analysis_stats.estimated_duration} دقيقة</span>
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <Button
                      size="sm"
                      onClick={() => onSelectSource(source)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 ml-1" />
                      عرض التحليل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-3 h-3 ml-1" />
                      تصدير
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteSource(source.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSources.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مصادر شاهد'}
              </h3>
              <p className="text-gray-400">
                {searchTerm ? 'جرب تغيير مصطلح البحث أو المرشحات' : 'ابدأ برفع أول ترانسكريبت شاهد'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
