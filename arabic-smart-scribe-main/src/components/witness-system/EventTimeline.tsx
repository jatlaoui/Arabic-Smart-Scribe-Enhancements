
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle,
  GripVertical,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  participants: string[];
  location: string;
  timeframe: string;
  significance_level: number;
  credibility_score: number;
  original_excerpt: string;
  timestamp?: string;
}

interface EventTimelineProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  selectedEvents: Event[];
  showCredibilityLayer: boolean;
  onEventDrag: (event: Event, type: 'event') => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  onEventSelect,
  selectedEvents,
  showCredibilityLayer,
  onEventDrag
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterSignificance, setFilterSignificance] = useState<number>(0);
  const dragRef = useRef<HTMLDivElement>(null);

  const getCredibilityColor = (score: number) => {
    if (score >= 0.9) return 'border-green-500 bg-green-50';
    if (score >= 0.7) return 'border-blue-500 bg-blue-50';
    if (score >= 0.5) return 'border-yellow-500 bg-yellow-50';
    if (score >= 0.3) return 'border-orange-500 bg-orange-50';
    return 'border-red-500 bg-red-50';
  };

  const getSignificanceSize = (level: number) => {
    if (level >= 0.8) return 'w-6 h-6';
    if (level >= 0.6) return 'w-5 h-5';
    if (level >= 0.4) return 'w-4 h-4';
    return 'w-3 h-3';
  };

  const sortedEvents = events
    .filter(event => event.significance_level >= filterSignificance)
    .sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      return a.timeframe.localeCompare(b.timeframe);
    });

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onEventSelect(event);
  };

  const handleDragStart = (event: Event) => (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...event,
      elementType: 'event'
    }));
    onEventDrag(event, 'event');
  };

  const copyEventToClipboard = (event: Event) => {
    const text = `**${event.title}**\n\n${event.description}\n\nالمكان: ${event.location}\nالزمان: ${event.timeframe}\nالمشاركون: ${event.participants.join(', ')}\n\nمن الشهادة الأصلية:\n"${event.original_excerpt}"`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <label className="text-sm font-medium">مستوى الأهمية:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filterSignificance}
                onChange={(e) => setFilterSignificance(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600">
                {Math.round(filterSignificance * 100)}%+
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              عرض {sortedEvents.length} من {events.length} حدث
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الخط الزمني */}
      <div className="relative">
        {/* خط الزمن */}
        <div className="absolute right-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 rounded-full"></div>
        
        {/* الأحداث */}
        <div className="space-y-8">
          {sortedEvents.map((event, index) => {
            const isSelected = selectedEvents.some(e => e.id === event.id);
            const credibilityClass = showCredibilityLayer ? getCredibilityColor(event.credibility_score) : '';
            const sizeClass = getSignificanceSize(event.significance_level);
            
            return (
              <div key={event.id} className="relative flex items-start space-x-4 space-x-reverse">
                {/* نقطة الحدث */}
                <div className={`relative z-10 flex items-center justify-center ${sizeClass} rounded-full bg-white border-4 ${credibilityClass} cursor-pointer transition-all hover:scale-110`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                  
                  {/* مؤشر الأهمية */}
                  {event.significance_level >= 0.8 && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                {/* بطاقة الحدث */}
                <Card 
                  className={`flex-1 cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${credibilityClass}`}
                  onClick={() => handleEventClick(event)}
                  draggable
                  onDragStart={handleDragStart(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        {showCredibilityLayer && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(event.credibility_score * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Clock className="w-3 h-3" />
                        <span>{event.timeframe}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Users className="w-3 h-3" />
                        <span>{event.participants.join(', ')}</span>
                      </div>
                    </div>

                    {/* الأدوات */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {event.participants.map((participant, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyEventToClipboard(event);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* نافذة تفاصيل الحدث المنبثقة */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">وصف الحدث:</h3>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">الزمان:</h4>
                    <p className="text-sm text-gray-600">{selectedEvent.timeframe}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">المكان:</h4>
                    <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">المشاركون:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.participants.map((participant, i) => (
                      <Badge key={i} variant="outline">{participant}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">من الشهادة الأصلية:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border-r-4 border-blue-500">
                    <p className="italic text-gray-700">"{selectedEvent.original_excerpt}"</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Badge className={getCredibilityColor(selectedEvent.credibility_score)}>
                      مصداقية: {Math.round(selectedEvent.credibility_score * 100)}%
                    </Badge>
                    <Badge variant="outline">
                      أهمية: {Math.round(selectedEvent.significance_level * 100)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button 
                      size="sm"
                      onClick={() => copyEventToClipboard(selectedEvent)}
                    >
                      <Copy className="w-4 h-4 ml-1" />
                      نسخ
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        onEventSelect(selectedEvent);
                        setSelectedEvent(null);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 ml-1" />
                      إضافة للمشهد
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
