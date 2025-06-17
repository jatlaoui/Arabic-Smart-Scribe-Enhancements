
# خدمات التحليل متعدد الوسائط
import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio
import aiofiles
from pathlib import Path

# مكتبات التحليل
import whisper  # لتحويل الصوت إلى نص
import cv2  # لمعالجة الفيديو
from PIL import Image
import pytesseract  # لـ OCR
import PyPDF2  # لاستخراج نص PDF
from geopy.geocoders import Nominatim  # لتحويل الأماكن لإحداثيات
import requests
from pydub import AudioSegment  # لمعالجة الصوت

class MultimediaAnalysisService:
    """خدمة التحليل متعدد الوسائط"""
    
    def __init__(self):
        self.whisper_model = None  # سيتم تحميله عند الحاجة
        self.storage_path = Path("data/multimedia")
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    async def analyze_video_source(self, source_id: str, file_path: str) -> Dict[str, Any]:
        """تحليل مصدر الفيديو"""
        results = {
            "source_id": source_id,
            "source_type": "video",
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "extracted_data": {}
        }
        
        try:
            # استخراج الصوت من الفيديو
            audio_path = await self._extract_audio_from_video(file_path)
            
            # تحويل الصوت إلى نص
            transcript = await self._transcribe_audio(audio_path)
            results["extracted_data"]["transcript"] = transcript
            
            # استخراج إطارات رئيسية للتحليل البصري
            key_frames = await self._extract_key_frames(file_path)
            results["extracted_data"]["key_frames_count"] = len(key_frames)
            
            # تحليل النص المستخرج باستخدام المحرك الموجود
            text_analysis = await self._analyze_text_content(transcript)
            results["extracted_data"]["narrative_analysis"] = text_analysis
            
            return results
            
        except Exception as e:
            results["error"] = str(e)
            return results
    
    async def analyze_audio_source(self, source_id: str, file_path: str) -> Dict[str, Any]:
        """تحليل مصدر الصوت"""
        results = {
            "source_id": source_id,
            "source_type": "audio",
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "extracted_data": {}
        }
        
        try:
            # تحويل الصوت إلى نص
            transcript = await self._transcribe_audio(file_path)
            results["extracted_data"]["transcript"] = transcript
            
            # تحليل النص
            text_analysis = await self._analyze_text_content(transcript)
            results["extracted_data"]["narrative_analysis"] = text_analysis
            
            # تحليل خصائص الصوت
            audio_properties = await self._analyze_audio_properties(file_path)
            results["extracted_data"]["audio_properties"] = audio_properties
            
            return results
            
        except Exception as e:
            results["error"] = str(e)
            return results
    
    async def analyze_pdf_source(self, source_id: str, file_path: str) -> Dict[str, Any]:
        """تحليل مصدر PDF"""
        results = {
            "source_id": source_id,
            "source_type": "pdf",
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "extracted_data": {}
        }
        
        try:
            # استخراج النص من PDF
            extracted_text = await self._extract_text_from_pdf(file_path)
            results["extracted_data"]["text_content"] = extracted_text
            
            # تحليل النص المستخرج
            text_analysis = await self._analyze_text_content(extracted_text)
            results["extracted_data"]["narrative_analysis"] = text_analysis
            
            return results
            
        except Exception as e:
            results["error"] = str(e)
            return results
    
    async def analyze_image_source(self, source_id: str, file_path: str) -> Dict[str, Any]:
        """تحليل مصدر الصورة"""
        results = {
            "source_id": source_id,
            "source_type": "image",
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "extracted_data": {}
        }
        
        try:
            # OCR لاستخراج النص من الصورة
            text_from_image = await self._extract_text_from_image(file_path)
            if text_from_image.strip():
                results["extracted_data"]["ocr_text"] = text_from_image
                text_analysis = await self._analyze_text_content(text_from_image)
                results["extracted_data"]["text_analysis"] = text_analysis
            
            # تحليل محتوى الصورة (يتطلب API خارجي)
            visual_analysis = await self._analyze_image_content(file_path)
            results["extracted_data"]["visual_analysis"] = visual_analysis
            
            return results
            
        except Exception as e:
            results["error"] = str(e)
            return results
    
    async def correlate_sources(self, project_id: str, analysis_results: List[Dict]) -> Dict[str, Any]:
        """ربط وتحليل المصادر المتعددة"""
        correlation_prompt = self._build_correlation_prompt(analysis_results)
        
        try:
            # استخدام Gemini لربط المعلومات
            from advanced_context_engine import AdvancedContextEngine
            engine = AdvancedContextEngine()
            
            correlation_result = await engine.analyze_cross_references(correlation_prompt)
            
            return {
                "project_id": project_id,
                "correlation_timestamp": datetime.utcnow().isoformat(),
                "sources_analyzed": len(analysis_results),
                "correlation_data": correlation_result,
                "confidence_score": correlation_result.get("overall_confidence", 0.0)
            }
            
        except Exception as e:
            return {"error": f"فشل في ربط المصادر: {str(e)}"}
    
    # الدوال المساعدة
    async def _extract_audio_from_video(self, video_path: str) -> str:
        """استخراج الصوت من الفيديو"""
        audio_path = video_path.replace('.mp4', '_audio.wav').replace('.avi', '_audio.wav')
        
        # استخدام ffmpeg (يتطلب تثبيته على النظام)
        import subprocess
        cmd = [
            'ffmpeg', '-i', video_path, 
            '-ab', '160k', '-ac', '2', '-ar', '44100', 
            '-vn', audio_path, '-y'
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()
        
        return audio_path
    
    async def _transcribe_audio(self, audio_path: str) -> str:
        """تحويل الصوت إلى نص باستخدام Whisper"""
        if self.whisper_model is None:
            self.whisper_model = whisper.load_model("base")
        
        result = self.whisper_model.transcribe(audio_path, language="ar")
        return result["text"]
    
    async def _extract_key_frames(self, video_path: str) -> List[str]:
        """استخراج إطارات رئيسية من الفيديو"""
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # استخراج 10 إطارات موزعة على طول الفيديو
        frames_to_extract = min(10, frame_count // 10)
        frame_paths = []
        
        for i in range(frames_to_extract):
            frame_number = (frame_count // frames_to_extract) * i
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            ret, frame = cap.read()
            
            if ret:
                frame_path = self.storage_path / f"frame_{i}_{uuid.uuid4().hex[:8]}.jpg"
                cv2.imwrite(str(frame_path), frame)
                frame_paths.append(str(frame_path))
        
        cap.release()
        return frame_paths
    
    async def _analyze_text_content(self, text: str) -> Dict[str, Any]:
        """تحليل النص باستخدام المحرك الموجود"""
        # استخدام المحرك الموجود في المشروع
        from advanced_context_engine import analyze_narrative_architecture
        return analyze_narrative_architecture(text)
    
    async def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """استخراج النص من PDF"""
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    async def _extract_text_from_image(self, image_path: str) -> str:
        """استخراج النص من الصورة باستخدام OCR"""
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image, lang='ara+eng')
            return text
        except Exception:
            return ""
    
    async def _analyze_image_content(self, image_path: str) -> Dict[str, Any]:
        """تحليل محتوى الصورة (placeholder لـ API خارجي)"""
        # هنا يمكن دمج Google Vision API أو AWS Rekognition
        return {
            "detected_objects": [],
            "detected_faces": 0,
            "detected_text": "",
            "landmarks": [],
            "dominant_colors": []
        }
    
    async def _analyze_audio_properties(self, audio_path: str) -> Dict[str, Any]:
        """تحليل خصائص الصوت"""
        try:
            audio = AudioSegment.from_file(audio_path)
            return {
                "duration_seconds": len(audio) / 1000,
                "sample_rate": audio.frame_rate,
                "channels": audio.channels,
                "loudness": audio.dBFS
            }
        except Exception:
            return {}
    
    def _build_correlation_prompt(self, analysis_results: List[Dict]) -> str:
        """بناء موجه لربط المصادر المتعددة"""
        prompt = """أنت مؤرخ ومحلل استخباراتي متخصص في ربط المعلومات من مصادر متنوعة.

لديك البيانات التالية من مصادر مختلفة:\n\n"""
        
        for i, result in enumerate(analysis_results, 1):
            source_type = result.get("source_type", "unknown")
            extracted_data = result.get("extracted_data", {})
            
            prompt += f"المصدر {i} ({source_type}):\n"
            
            if "narrative_analysis" in extracted_data:
                analysis = extracted_data["narrative_analysis"]
                if "characters" in analysis:
                    chars = [c.get("name", "") for c in analysis["characters"][:3]]
                    prompt += f"- الشخصيات: {', '.join(chars)}\n"
                if "events" in analysis:
                    events = [e.get("title", "") for e in analysis["events"][:2]]
                    prompt += f"- الأحداث: {', '.join(events)}\n"
                if "places" in analysis:
                    places = [p.get("name", "") for p in analysis["places"][:2]]
                    prompt += f"- الأماكن: {', '.join(places)}\n"
            
            prompt += "\n"
        
        prompt += """المطلوب (اكتب النتيجة بصيغة JSON):
{
  "cross_references": [
    {
      "type": "character_match",
      "entity_1": {"source": 1, "name": "اسم الشخصية"},
      "entity_2": {"source": 2, "name": "اسم مماثل"},
      "confidence": 0.85,
      "reasoning": "السبب في الربط"
    }
  ],
  "unified_timeline": [
    {
      "event": "اسم الحدث",
      "sources": [1, 3],
      "estimated_date": "التاريخ المقدر",
      "importance": 0.9
    }
  ],
  "character_mapping": {
    "القائد محمود": ["القائد محمود عبد الرازق", "أبو محمود"]
  },
  "location_mapping": {
    "القناة": ["قناة السويس", "منطقة القناة"]
  },
  "overall_confidence": 0.78
}"""
        
        return prompt

# خدمة توليد المخرجات المتعددة
class MultimediaOutputService:
    """خدمة توليد المخرجات متعددة الوسائط"""
    
    def __init__(self):
        self.storage_path = Path("data/outputs")
        self.storage_path.mkdir(parents=True, exist_ok=True)
    
    async def generate_audiobook(self, project_id: str, voice_mapping: Dict[str, str]) -> Dict[str, Any]:
        """توليد كتاب صوتي"""
        # هنا سيتم دمج ElevenLabs API أو مكتبة TTS أخرى
        # للتبسيط، سنرجع بنية البيانات المتوقعة
        
        return {
            "audiobook_id": str(uuid.uuid4()),
            "project_id": project_id,
            "status": "generating",
            "chapters": [],
            "total_duration": 0,
            "voice_mapping": voice_mapping
        }
    
    async def generate_movie_treatment(self, project_id: str, narrative_data: Dict) -> Dict[str, Any]:
        """توليد موجز سينمائي"""
        treatment_prompt = f"""
أنت كاتب سيناريو محترف. بناءً على البيانات السردية التالية، اكتب موجز سينمائي احترافي:

{json.dumps(narrative_data, ensure_ascii=False, indent=2)}

المطلوب (بصيغة JSON):
{{
  "title": "عنوان الفيلم المقترح",
  "genre": "النوع (دراما، تاريخي، إلخ)",
  "logline": "ملخص القصة في جملة واحدة",
  "main_characters": [
    {{"name": "اسم الشخصية", "description": "وصف الشخصية", "role": "الدور"}}
  ],
  "three_act_structure": {{
    "act_1": "وصف الفصل الأول",
    "act_2": "وصف الفصل الثاني", 
    "act_3": "وصف الفصل الثالث"
  }},
  "key_scenes": [
    {{"scene_number": 1, "description": "وصف المشهد", "location": "المكان", "importance": "عالية"}}
  ]
}}
"""
        
        # استخدام Gemini لتوليد الموجز
        from advanced_context_engine import AdvancedContextEngine
        engine = AdvancedContextEngine()
        
        try:
            treatment = await engine.generate_movie_treatment(treatment_prompt)
            return {
                "treatment_id": str(uuid.uuid4()),
                "project_id": project_id,
                "content": treatment,
                "generated_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {"error": f"فشل في توليد الموجز السينمائي: {str(e)}"}
    
    async def generate_interactive_map(self, project_id: str, places_data: List[Dict]) -> Dict[str, Any]:
        """توليد خريطة تفاعلية"""
        geolocator = Nominatim(user_agent="arabic_smart_scribe")
        
        geojson_features = []
        map_bounds = {"min_lat": 90, "max_lat": -90, "min_lng": 180, "max_lng": -180}
        
        for place in places_data:
            place_name = place.get("name", "")
            if not place_name:
                continue
            
            try:
                # تحويل اسم المكان إلى إحداثيات
                location = geolocator.geocode(place_name)
                if location:
                    lat, lng = location.latitude, location.longitude
                    
                    # تحديث حدود الخريطة
                    map_bounds["min_lat"] = min(map_bounds["min_lat"], lat)
                    map_bounds["max_lat"] = max(map_bounds["max_lat"], lat)
                    map_bounds["min_lng"] = min(map_bounds["min_lng"], lng)
                    map_bounds["max_lng"] = max(map_bounds["max_lng"], lng)
                    
                    # إنشاء feature GeoJSON
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lng, lat]
                        },
                        "properties": {
                            "name": place_name,
                            "description": place.get("description", ""),
                            "significance": place.get("significance", ""),
                            "events": place.get("related_events", [])
                        }
                    }
                    geojson_features.append(feature)
                    
            except Exception as e:
                print(f"تعذر تحديد موقع {place_name}: {str(e)}")
                continue
        
        # حساب مركز الخريطة
        if geojson_features:
            center_lat = (map_bounds["min_lat"] + map_bounds["max_lat"]) / 2
            center_lng = (map_bounds["min_lng"] + map_bounds["max_lng"]) / 2
        else:
            center_lat, center_lng = 30.0444, 31.2357  # القاهرة كافتراضي
        
        geojson_data = {
            "type": "FeatureCollection",
            "features": geojson_features
        }
        
        return {
            "map_id": str(uuid.uuid4()),
            "project_id": project_id,
            "geojson": geojson_data,
            "center": {"lat": center_lat, "lng": center_lng},
            "zoom_level": 8,
            "locations_count": len(geojson_features)
        }
