import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added Select for type
import { PlusCircle, Edit3, Trash2, Search, Palette, LinkIcon, ExternalLink, MapPin, User as UserIcon } from 'lucide-react'; // Added MapPin, UserIcon
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

// Matches Pydantic schemas (CharacterResponse, PlaceResponse)
export interface KnowledgeEntity {
  id: string;
  name: string;
  project_id: string;
  description?: string | null;
  aliases?: string[] | null;
  color?: string | null;
  link_url?: string | null;
  is_external_link?: boolean | null;
  type: 'character' | 'place'; // Simplified for now, can add 'event' later
  // Character-specific
  role?: string | null;
  // Place-specific
  latitude?: number | null;
  longitude?: number | null;
}

interface EntityPanelProps {
  projectId: string;
  // onSelectEntity?: (entity: KnowledgeEntity) => void;
}

const ENTITY_TYPES_CONFIG = {
  character: { label: 'شخصية', icon: <UserIcon className="w-4 h-4" />, endpointSuffix: 'characters' },
  place: { label: 'مكان', icon: <MapPin className="w-4 h-4" />, endpointSuffix: 'places' },
  // event: { label: 'حدث', icon: <Calendar className="w-4 h-4" />, endpointSuffix: 'events' },
};

export const EntityPanel: React.FC<EntityPanelProps> = ({ projectId }) => {
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<KnowledgeEntity | null>(null);

  const [entityTypeToAdd, setEntityTypeToAdd] = useState<'character' | 'place'>('character');
  const [currentFormValues, setCurrentFormValues] = useState<Partial<KnowledgeEntity>>({});

  const { toast } = useToast();

  const fetchEntities = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // Fetch all entity types in parallel
      const promises = Object.values(ENTITY_TYPES_CONFIG).map(config =>
        apiClient.get(`/api/entities/projects/${projectId}/${config.endpointSuffix}`)
      );
      const responses = await Promise.all(promises);

      let allFetchedEntities: KnowledgeEntity[] = [];
      responses.forEach((response, index) => {
        const entityType = Object.keys(ENTITY_TYPES_CONFIG)[index] as 'character' | 'place';
        const fetched = response.data.map((item: any) => ({ ...item, type: entityType })) || [];
        allFetchedEntities = allFetchedEntities.concat(fetched);
      });

      setEntities(allFetchedEntities);
    } catch (error) {
      console.error("Failed to fetch entities:", error);
      toast({ title: "خطأ في جلب الكيانات", description: "لم نتمكن من تحميل قائمة الكيانات.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle checkbox type explicitly
    if (e.target.type === 'checkbox' && e.target instanceof HTMLInputElement) {
        setCurrentFormValues(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
        setCurrentFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAliasChange = (index: number, value: string) => {
    const updatedAliases = [...(currentFormValues.aliases || [])];
    updatedAliases[index] = value;
    setCurrentFormValues(prev => ({ ...prev, aliases: updatedAliases }));
  };

  const addAliasField = () => {
    setCurrentFormValues(prev => ({ ...prev, aliases: [...(prev.aliases || []), ""] }));
  };

  const removeAliasField = (index: number) => {
    setCurrentFormValues(prev => ({ ...prev, aliases: (prev.aliases || []).filter((_, i) => i !== index) }));
  };

  const handleOpenForm = (entity?: KnowledgeEntity) => {
    if (entity) {
      setEditingEntity(entity);
      // Ensure all fields defined in KnowledgeEntity are present in currentFormValues
      const formVals: Partial<KnowledgeEntity> = {
        name: entity.name,
        description: entity.description || "",
        aliases: entity.aliases || [],
        color: entity.color || "#FFFFFF", // Default color if null
        link_url: entity.link_url || "",
        is_external_link: entity.is_external_link || false,
        type: entity.type,
        role: entity.type === 'character' ? entity.role || "" : undefined,
        latitude: entity.type === 'place' ? entity.latitude || undefined : undefined,
        longitude: entity.type === 'place' ? entity.longitude || undefined : undefined,
      };
      setCurrentFormValues(formVals);
      setEntityTypeToAdd(entity.type);
    } else {
      setEditingEntity(null);
      setCurrentFormValues({
        project_id: projectId,
        type: entityTypeToAdd,
        aliases: [],
        color: "#FFFFFF",
        is_external_link: false
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFormValues.name || !currentFormValues.type) {
      toast({ title: "بيانات ناقصة", description: "الاسم ونوع الكيان مطلوبان.", variant: "destructive" });
      return;
    }

    const entityConfig = ENTITY_TYPES_CONFIG[currentFormValues.type];
    if (!entityConfig) {
        toast({ title: "نوع كيان غير صالح", variant: "destructive"});
        return;
    }

    const payload: any = { // Build payload based on type
      project_id: projectId,
      name: currentFormValues.name,
      description: currentFormValues.description,
      aliases: (currentFormValues.aliases || []).filter(alias => alias.trim() !== ''),
      color: currentFormValues.color,
      link_url: currentFormValues.link_url,
      is_external_link: currentFormValues.is_external_link,
      type: currentFormValues.type, // Pydantic schema expects 'type'
    };

    if (currentFormValues.type === 'character') {
      payload.role = currentFormValues.role;
    } else if (currentFormValues.type === 'place') {
      payload.latitude = currentFormValues.latitude ? parseFloat(String(currentFormValues.latitude)) : undefined;
      payload.longitude = currentFormValues.longitude ? parseFloat(String(currentFormValues.longitude)) : undefined;
    }

    setIsLoading(true);
    try {
      const apiUrlBase = `/api/entities/${entityConfig.endpointSuffix}`;
      if (editingEntity && editingEntity.id) {
        await apiClient.put(`${apiUrlBase}/${editingEntity.id}`, payload);
        toast({ title: "تم تحديث الكيان بنجاح!" });
      } else {
        await apiClient.post(apiUrlBase, payload); // POST to /api/entities/characters or /places
        toast({ title: "تم إنشاء الكيان بنجاح!" });
      }
      setIsFormOpen(false);
      fetchEntities();
    } catch (error: any) {
      console.error("Failed to save entity:", error);
      const errorMsg = error.response?.data?.detail || "فشل حفظ الكيان.";
      toast({ title: "خطأ في حفظ الكيان", description: errorMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntity = async (entity: KnowledgeEntity) => {
    if (!confirm(`هل أنت متأكد أنك تريد حذف الكيان: "${entity.name}"؟\nلا يمكن التراجع عن هذا الإجراء.`)) return;

    const entityConfig = ENTITY_TYPES_CONFIG[entity.type];
    if (!entityConfig) {
        toast({ title: "نوع كيان غير صالح للحذف", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
      await apiClient.delete(`/api/entities/${entityConfig.endpointSuffix}/${entity.id}`);
      toast({ title: "تم حذف الكيان بنجاح" });
      fetchEntities();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "فشل حذف الكيان.";
      toast({ title: "خطأ في حذف الكيان", description: errorMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entity.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entity.aliases || []).some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderEntityFields = () => (
    <>
      <div className="space-y-1">
        <Label htmlFor="entity-name">اسم الكيان</Label>
        <Input id="entity-name" name="name" value={currentFormValues.name || ""} onChange={handleFormInputChange} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="entity-description">الوصف</Label>
        <Textarea id="entity-description" name="description" value={currentFormValues.description || ""} onChange={handleFormInputChange} rows={3} />
      </div>
      <div className="space-y-1">
        <Label>الأسماء المستعارة (Aliases)</Label>
        {(currentFormValues.aliases || []).map((alias, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <Input name={`alias-${index}`} value={alias} onChange={(e) => handleAliasChange(index, e.target.value)} placeholder={`اسم مستعار ${index + 1}`} />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeAliasField(index)} aria-label="Remove alias">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addAliasField} className="mt-1 text-xs">
          <PlusCircle className="w-3 h-3 mr-1" /> إضافة اسم مستعار
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
            <Label htmlFor="entity-color">اللون المميز</Label>
            <Input id="entity-color" name="color" type="color" value={currentFormValues.color || "#FFFFFF"} onChange={handleFormInputChange} className="p-1 h-10 w-full"/>
        </div>
        <div className="space-y-1">
            <Label htmlFor="entity-link_url">رابط (URL)</Label>
            <Input id="entity-link_url" name="link_url" type="url" value={currentFormValues.link_url || ""} onChange={handleFormInputChange} placeholder="https://example.com"/>
        </div>
      </div>
      <div className="flex items-center space-x-2 pt-2">
          <input type="checkbox" id="entity-is_external_link" name="is_external_link" checked={currentFormValues.is_external_link || false} onChange={handleFormInputChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
          <Label htmlFor="entity-is_external_link" className="text-sm font-medium">رابط خارجي؟</Label>
      </div>
      {/* Entity type specific fields */}
      {currentFormValues.type === 'character' && (
        <div className="space-y-1 pt-2">
          <Label htmlFor="character-role">دور الشخصية</Label>
          <Input id="character-role" name="role" value={currentFormValues.role || ""} onChange={handleFormInputChange} placeholder="مثال: بطل، خصم، مساند"/>
        </div>
      )}
      {currentFormValues.type === 'place' && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="place-latitude">خط العرض (Latitude)</Label>
            <Input id="place-latitude" name="latitude" type="number" step="any" value={currentFormValues.latitude || ""} onChange={handleFormInputChange} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="place-longitude">خط الطول (Longitude)</Label>
            <Input id="place-longitude" name="longitude" type="number" step="any" value={currentFormValues.longitude || ""} onChange={handleFormInputChange} />
          </div>
        </div>
      )}
    </>
  );

  return (
    <Card className="w-full h-full flex flex-col" dir="rtl">
      <CardHeader className="border-b sticky top-0 bg-white z-10">
        <CardTitle className="text-lg">إدارة الكيانات المعرفية</CardTitle>
        <CardDescription>عرض، إضافة، وتعديل الشخصيات والأماكن المتعلقة بمشروعك.</CardDescription>
        <div className="flex items-center gap-2 pt-2">
            <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="ابحث في الكيانات..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10 h-9"/>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleOpenForm()}>
                  <PlusCircle className="w-4 h-4 ml-2" /> إضافة كيان
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>{editingEntity ? 'تعديل كيان' : 'إضافة كيان جديد'}</DialogTitle>
                  <DialogDescription>
                    {editingEntity ? `تعديل تفاصيل '${editingEntity.name}'` : 'أدخل تفاصيل الكيان الجديد.'}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-2"> {/* Added ScrollArea for form content */}
                  <form onSubmit={handleSubmitForm} className="space-y-4 py-1 pr-4">
                    {!editingEntity && (
                      <div className="space-y-1">
                        <Label htmlFor="entity-type">نوع الكيان</Label>
                        <Select value={entityTypeToAdd} onValueChange={(val) => {
                            setEntityTypeToAdd(val as 'character' | 'place');
                            setCurrentFormValues(prev => ({ ...prev, type: val as 'character' | 'place', name: prev.name, project_id: projectId, aliases: prev.aliases || [], color: prev.color || "#FFFFFF", is_external_link: prev.is_external_link || false }));
                        }}>
                          <SelectTrigger id="entity-type">
                            <SelectValue placeholder="اختر نوع الكيان" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ENTITY_TYPES_CONFIG).map(([value, {label}]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {renderEntityFields()}
                    <DialogFooter className="pt-4 sticky bottom-0 bg-white pb-2">
                      <DialogClose asChild>
                          <Button type="button" variant="outline">إلغاء</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading}>{isLoading ? 'جاري الحفظ...' : 'حفظ الكيان'}</Button>
                    </DialogFooter>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-2 sm:p-4">
          {isLoading && entities.length === 0 && <p className="text-center py-4">جاري تحميل الكيانات...</p>}
          {!isLoading && entities.length === 0 && <p className="text-center py-4">لم يتم العثور على كيانات. ابدأ بإضافة كيان جديد.</p>}
          <div className="space-y-2">
          {filteredEntities.map(entity => (
            <Card key={entity.id} className="hover:shadow-lg transition-shadow duration-150 ease-in-out">
              <CardHeader className="p-3 flex flex-row justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full text-white" style={{ backgroundColor: entity.color || '#cccccc' }}>
                        {ENTITY_TYPES_CONFIG[entity.type]?.icon || <Edit3 className="w-3 h-3" />}
                    </span>
                    <CardTitle className="text-base font-semibold">{entity.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-gray-200" onClick={() => handleOpenForm(entity)}>
                        <Edit3 className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-red-100" onClick={() => handleDeleteEntity(entity)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
              </CardHeader>
              {(entity.description || (entity.aliases && entity.aliases.length > 0) || entity.link_url) && (
                <CardContent className="p-3 pt-0 text-xs text-gray-600">
                    {entity.description && <p className="line-clamp-2 mb-1">{entity.description}</p>}
                    {entity.aliases && entity.aliases.length > 0 && (
                        <p className="text-gray-500 italic mb-1">أسماء مستعارة: {entity.aliases.join(', ')}</p>
                    )}
                    {entity.link_url && (
                        <a href={entity.link_url} target={entity.is_external_link ? "_blank" : "_self"} rel="noopener noreferrer"
                           className="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1">
                            {entity.is_external_link ? <ExternalLink className="w-3 h-3"/> : <LinkIcon className="w-3 h-3"/>}
                            رابط إضافي
                        </a>
                    )}
                </CardContent>
              )}
            </Card>
          ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default EntityPanel;
