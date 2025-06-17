from typing import List, Dict, Any, Optional
import aiohttp
import asyncio

class WebSearchService:
    """خدمة البحث على الويب لإثراء السياق"""
    
    def __init__(self):
        self.search_engines = {
            "google": "https://www.googleapis.com/customsearch/v1",
            "wikipedia": "https://ar.wikipedia.org/api/rest_v1"
        }
    
    async def search_entity_context(self, entity_name: str, entity_type: str) -> Dict[str, Any]:
        """البحث عن سياق كيان معين"""
        
        search_results = await self._search_multiple_sources(
            f"{entity_name} {entity_type} تاريخ"
        )
        
        return {
            "entity": entity_name,
            "type": entity_type,
            "context": search_results,
            "relevance_score": self._calculate_relevance(search_results, entity_name)
        }
    
    async def _search_multiple_sources(self, query: str) -> List[Dict[str, Any]]:
        """البحث في مصادر متعددة"""
        
        results = []
        
        # البحث في ويكيبيديا العربية
        wikipedia_results = await self._search_wikipedia(query)
        results.extend(wikipedia_results)
        
        # يمكن إضافة مصادر أخرى هنا
        
        return results
    
    async def _search_wikipedia(self, query: str) -> List[Dict[str, Any]]:
        """البحث في ويكيبيديا العربية"""
        
        try:
            async with aiohttp.ClientSession() as session:
                # البحث في المقالات
                search_url = f"{self.search_engines['wikipedia']}/page/search/{query}"
                
                async with session.get(search_url) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for page in data.get('pages', [])[:3]:  # أول 3 نتائج
                            # جلب محتوى المقالة
                            content = await self._get_wikipedia_content(session, page['key'])
                            if content:
                                results.append({
                                    'title': page['title'],
                                    'content': content,
                                    'source': 'wikipedia_ar',
                                    'url': f"https://ar.wikipedia.org/wiki/{page['key']}"
                                })
                        
                        return results
                        
        except Exception as e:
            print(f"خطأ في البحث في ويكيبيديا: {e}")
            
        return []
    
    async def _get_wikipedia_content(self, session: aiohttp.ClientSession, page_key: str) -> Optional[str]:
        """جلب محتوى مقالة ويكيبيديا"""
        
        try:
            content_url = f"{self.search_engines['wikipedia']}/page/summary/{page_key}"
            
            async with session.get(content_url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('extract', '')
                    
        except Exception as e:
            print(f"خطأ في جلب محتوى ويكيبيديا: {e}")
            
        return None
    
    def _calculate_relevance(self, search_results: List[Dict[str, Any]], entity_name: str) -> float:
        """حساب مدى صلة النتائج بالكيان"""
        
        if not search_results:
            return 0.0
        
        total_relevance = 0.0
        
        for result in search_results:
            # حساب بسيط بناءً على تكرار اسم الكيان في المحتوى
            content = result.get('content', '').lower()
            entity_mentions = content.count(entity_name.lower())
            
            # نقاط إضافية للعنوان
            title_mentions = result.get('title', '').lower().count(entity_name.lower())
            
            relevance = (entity_mentions + title_mentions * 2) / max(len(content.split()), 1)
            total_relevance += relevance
        
        return min(total_relevance / len(search_results), 1.0)
