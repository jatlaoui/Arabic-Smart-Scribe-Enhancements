
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  FileText, 
  Video, 
  Pen,
  Trash2,
  Download,
  Share
} from 'lucide-react';

interface LocalProject {
  id: string;
  title: string;
  type: 'video-book' | 'smart-writing';
  status: 'draft' | 'in-progress' | 'completed';
  lastModified: string;
  wordCount?: number;
  sourceUrl?: string;
}

interface ProjectManagerProps {
  projects: LocalProject[];
  onOpenProject: (project: LocalProject) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onOpenProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesType = filterType === 'all' || project.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: LocalProject['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: LocalProject['status']) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'in-progress': return 'قيد العمل';
      case 'completed': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  const getTypeIcon = (type: LocalProject['type']) => {
    return type === 'video-book' ? 
      <Video className="w-5 h-5 text-green-600" /> : 
      <Pen className="w-5 h-5 text-blue-600" />;
  };

  const getTypeText = (type: LocalProject['type']) => {
    return type === 'video-book' ? 'فيديو إلى كتاب' : 'كتابة ذكية';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">إدارة المشاريع</h2>
          <p className="text-gray-600">جميع مشاريعك في مكان واحد</p>
        </div>
        <div className="flex space-x-3 space-x-reverse">
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Search className="w-5 h-5" />
            <span>البحث والتصفية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث في المشاريع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="in-progress">قيد العمل</option>
              <option value="completed">مكتمل</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأنواع</option>
              <option value="video-book">فيديو إلى كتاب</option>
              <option value="smart-writing">كتابة ذكية</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-lg ${project.type === 'video-book' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {getTypeIcon(project.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-gray-600">{getTypeText(project.type)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="w-4 h-4" />
                  <span>{project.lastModified}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <FileText className="w-4 h-4" />
                  <span>{project.wordCount?.toLocaleString() || 0} كلمة</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(project.status)} text-white`}>
                  {getStatusText(project.status)}
                </Badge>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenProject(project)}
                  >
                    فتح
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {project.sourceUrl && (
                <div className="text-xs text-gray-500 truncate">
                  المصدر: {project.sourceUrl}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مشاريع</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'لم يتم العثور على مشاريع تطابق معايير البحث'
                : 'ابدأ بإنشاء مشروعك الأول'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
