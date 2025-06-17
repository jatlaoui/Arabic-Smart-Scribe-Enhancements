#!/usr/bin/env python3
"""
اختبار شامل لنظام التحليلات الشخصية المركزة
يختبر جميع APIs والوظائف الجديدة المطورة

نظرة عامة على الاختبارات:
1. بدء وإنهاء جلسات الكتابة
2. تحليل النصوص وحفظ النتائج
3. جلب تحليلات التقدم
4. إنتاج التقارير الشخصية
5. تطور الأسلوب عبر الوقت
6. إحصائيات جلسات الكتابة
7. إحصائيات لوحة التحكم
"""

import requests
import json
import time
import sys
import os
from datetime import datetime

# إضافة مجلد backend إلى المسار للوصول إلى وحداته
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from personal_analytics_service import PersonalAnalyticsService

BASE_URL = "http://localhost:5000"
USER_ID = "test_user_analytics"
PROJECT_ID = 1

class PersonalAnalyticsTestSuite:
    """مجموعة اختبارات شاملة لنظام التحليلات الشخصية"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.user_id = USER_ID
        self.project_id = PROJECT_ID
        self.test_results = []
        self.analytics_service = PersonalAnalyticsService()
        
    def log_test(self, test_name: str, success: bool, message: str = "", data: dict = None):
        """تسجيل نتيجة اختبار"""
        status = "✅ نجح" if success else "❌ فشل"
        print(f"{status} | {test_name}")
        if message:
            print(f"   📝 {message}")
        if data and not success:
            print(f"   📊 البيانات: {json.dumps(data, ensure_ascii=False, indent=2)}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        print()
    
    def test_start_writing_session(self) -> str:
        """اختبار بدء جلسة كتابة"""
        try:
            data = {
                "user_id": self.user_id,
                "project_id": self.project_id,
                "stage_number": 1
            }
            
            response = requests.post(f"{self.base_url}/api/analytics/start-session", json=data)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                session_id = result.get('session_id')
                self.log_test(
                    "بدء جلسة كتابة",
                    True,
                    f"تم بدء الجلسة بنجاح: {session_id}"
                )
                return session_id
            else:
                self.log_test(
                    "بدء جلسة كتابة",
                    False,
                    f"فشل في بدء الجلسة: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                return None
                
        except Exception as e:
            self.log_test("بدء جلسة كتابة", False, f"خطأ في الشبكة: {str(e)}")
            return None
    
    def test_end_writing_session(self, session_id: str):
        """اختبار إنهاء جلسة كتابة"""
        try:
            session_data = {
                "duration_minutes": 25,
                "words_written": 350,
                "edits_count": 12,
                "ai_suggestions_used": 5,
                "ai_suggestions_rejected": 2,
                "quality_score": 4.2
            }
            
            data = {
                "user_id": self.user_id,
                "session_id": session_id,
                "session_data": session_data
            }
            
            response = requests.post(f"{self.base_url}/api/analytics/end-session", json=data)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                self.log_test(
                    "إنهاء جلسة كتابة",
                    True,
                    "تم إنهاء الجلسة وحفظ الإحصائيات بنجاح"
                )
            else:
                self.log_test(
                    "إنهاء جلسة كتابة",
                    False,
                    f"فشل في إنهاء الجلسة: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("إنهاء جلسة كتابة", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_analyze_text(self):
        """اختبار تحليل النصوص"""
        try:
            # نص تجريبي للتحليل
            test_text = """
            في ذلك اليوم الربيعي الجميل، كانت الشمس تتألق في السماء الزرقاء كأنها جوهرة ثمينة
            تضيء وجه الأرض بنورها الذهبي. سار أحمد في الحديقة وهو يتأمل جمال الطبيعة،
            حيث تتراقص الأزهار مع نسيم الصباح العليل. كان قلبه مفعماً بالأمل والتفاؤل،
            وعقله يخطط لمستقبل مشرق ينتظره. في هذه اللحظة، أدرك أن الحياة جميلة رغم
            كل التحديات التي قد تواجهنا، وأن السعادة الحقيقية تكمن في تقدير اللحظات
            البسيطة والجميلة التي نعيشها كل يوم.
            """
            
            data = {
                "user_id": self.user_id,
                "content": test_text,
                "content_type": "chapter",
                "project_id": self.project_id
            }
            
            response = requests.post(f"{self.base_url}/api/analytics/analyze-text", json=data)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                analysis = result.get('analysis', {})
                self.log_test(
                    "تحليل النص",
                    True,
                    f"تم تحليل النص - كلمات: {analysis.get('word_count', 0)}, "
                    f"استعارات: {analysis.get('metaphor_count', 0)}, "
                    f"درجة الإبداع: {analysis.get('creativity_score', 0):.2f}"
                )
            else:
                self.log_test(
                    "تحليل النص",
                    False,
                    f"فشل في تحليل النص: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("تحليل النص", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_progress_analytics(self):
        """اختبار جلب تحليلات التقدم"""
        try:
            params = {
                "user_id": self.user_id,
                "project_id": self.project_id,
                "days": 30
            }
            
            response = requests.get(f"{self.base_url}/api/analytics/progress", params=params)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                analytics = result.get('analytics', {})
                self.log_test(
                    "تحليلات التقدم",
                    True,
                    f"جلسات: {analytics.get('total_sessions', 0)}, "
                    f"كلمات: {analytics.get('total_words', 0)}, "
                    f"متوسط الجودة: {analytics.get('average_quality', 0):.1f}"
                )
            else:
                self.log_test(
                    "تحليلات التقدم",
                    False,
                    f"فشل في جلب التحليلات: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("تحليلات التقدم", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_personal_report(self):
        """اختبار إنتاج التقرير الشخصي"""
        try:
            params = {"user_id": self.user_id}
            
            response = requests.get(f"{self.base_url}/api/analytics/personal-report/{self.project_id}", params=params)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                report = result.get('report', {})
                project_info = report.get('project_info', {})
                self.log_test(
                    "التقرير الشخصي",
                    True,
                    f"تم إنتاج التقرير للمشروع: {project_info.get('title', 'غير محدد')}"
                )
            else:
                self.log_test(
                    "التقرير الشخصي",
                    False,
                    f"فشل في إنتاج التقرير: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("التقرير الشخصي", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_style_evolution(self):
        """اختبار جلب تطور الأسلوب"""
        try:
            params = {
                "user_id": self.user_id,
                "project_id": self.project_id
            }
            
            response = requests.get(f"{self.base_url}/api/analytics/style-evolution", params=params)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                evolution = result.get('evolution', [])
                self.log_test(
                    "تطور الأسلوب",
                    True,
                    f"تم جلب {len(evolution)} نقطة بيانات لتطور الأسلوب"
                )
            else:
                self.log_test(
                    "تطور الأسلوب",
                    False,
                    f"فشل في جلب تطور الأسلوب: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("تطور الأسلوب", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_writing_sessions(self):
        """اختبار جلب جلسات الكتابة"""
        try:
            params = {
                "user_id": self.user_id,
                "project_id": self.project_id,
                "days": 30
            }
            
            response = requests.get(f"{self.base_url}/api/analytics/writing-sessions", params=params)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                sessions = result.get('sessions', [])
                self.log_test(
                    "جلسات الكتابة",
                    True,
                    f"تم جلب {len(sessions)} جلسة كتابة"
                )
            else:
                self.log_test(
                    "جلسات الكتابة",
                    False,
                    f"فشل في جلب الجلسات: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("جلسات الكتابة", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_dashboard_stats(self):
        """اختبار جلب إحصائيات لوحة التحكم"""
        try:
            params = {"user_id": self.user_id}
            
            response = requests.get(f"{self.base_url}/api/analytics/dashboard-stats", params=params)
            result = response.json()
            
            if response.status_code == 200 and result.get('success'):
                stats = result.get('stats', {})
                self.log_test(
                    "إحصائيات لوحة التحكم",
                    True,
                    f"تم جلب إحصائيات الأسبوع والشهر الحالي"
                )
            else:
                self.log_test(
                    "إحصائيات لوحة التحكم",
                    False,
                    f"فشل في جلب الإحصائيات: {result.get('error', 'خطأ غير معروف')}",
                    result
                )
                
        except Exception as e:
            self.log_test("إحصائيات لوحة التحكم", False, f"خطأ في الشبكة: {str(e)}")
    
    def test_service_direct_methods(self):
        """اختبار وظائف الخدمة المباشرة"""
        try:
            # اختبار تحليل النص مباشرة
            test_text = "هذا نص تجريبي للتحليل يحتوي على استعارة جميلة كالنجم المتألق."
            analysis = self.analytics_service._perform_style_analysis(test_text)
            
            if analysis and 'word_count' in analysis:
                self.log_test(
                    "تحليل النص المباشر",
                    True,
                    f"كلمات: {analysis['word_count']}, استعارات: {analysis['metaphor_count']}"
                )
            else:
                self.log_test(
                    "تحليل النص المباشر",
                    False,
                    "فشل في تحليل النص مباشرة"
                )
                
        except Exception as e:
            self.log_test("تحليل النص المباشر", False, f"خطأ: {str(e)}")
    
    def test_invalid_requests(self):
        """اختبار الطلبات غير الصالحة"""
        try:
            # اختبار بدء جلسة بدون project_id
            response = requests.post(f"{self.base_url}/api/analytics/start-session", json={
                "user_id": self.user_id
            })
            
            if response.status_code == 400:
                self.log_test(
                    "التحقق من البيانات المطلوبة",
                    True,
                    "تم رفض الطلب بدون project_id بشكل صحيح"
                )
            else:
                self.log_test(
                    "التحقق من البيانات المطلوبة",
                    False,
                    "لم يتم رفض الطلب غير الصالح"
                )
                
        except Exception as e:
            self.log_test("التحقق من البيانات المطلوبة", False, f"خطأ: {str(e)}")
    
    def run_all_tests(self):
        """تشغيل جميع الاختبارات"""
        print("🚀 بدء اختبار نظام التحليلات الشخصية المركزة")
        print("=" * 60)
        print()
        
        # اختبار جلسات الكتابة
        session_id = self.test_start_writing_session()
        if session_id:
            time.sleep(1)  # انتظار قصير لمحاكاة جلسة حقيقية
            self.test_end_writing_session(session_id)
        
        # اختبار تحليل النص
        self.test_analyze_text()
        
        # اختبار جلب البيانات
        self.test_progress_analytics()
        self.test_personal_report()
        self.test_style_evolution()
        self.test_writing_sessions()
        self.test_dashboard_stats()
        
        # اختبار الوظائف المباشرة
        self.test_service_direct_methods()
        
        # اختبار التحقق من البيانات
        self.test_invalid_requests()
        
        # عرض النتائج النهائية
        self.display_results()
    
    def display_results(self):
        """عرض ملخص النتائج"""
        print("=" * 60)
        print("📊 ملخص نتائج الاختبار")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"إجمالي الاختبارات: {total_tests}")
        print(f"✅ نجح: {passed_tests}")
        print(f"❌ فشل: {failed_tests}")
        print(f"📈 معدل النجاح: {success_rate:.1f}%")
        print()
        
        if failed_tests > 0:
            print("🔍 الاختبارات الفاشلة:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
            print()
        
        # حفظ النتائج في ملف
        with open('test_personal_analytics_results.json', 'w', encoding='utf-8') as f:
            json.dump({
                'summary': {
                    'total_tests': total_tests,
                    'passed': passed_tests,
                    'failed': failed_tests,
                    'success_rate': success_rate,
                    'timestamp': datetime.now().isoformat()
                },
                'detailed_results': self.test_results
            }, f, ensure_ascii=False, indent=2)
        
        print("💾 تم حفظ النتائج التفصيلية في: test_personal_analytics_results.json")
        print()
        
        if success_rate >= 80:
            print("🎉 نظام التحليلات الشخصية يعمل بشكل ممتاز!")
        elif success_rate >= 60:
            print("⚠️ نظام التحليلات الشخصية يعمل بشكل جيد مع بعض المشاكل")
        else:
            print("❌ نظام التحليلات الشخصية يحتاج إلى إصلاحات مهمة")

if __name__ == "__main__":
    print("🔧 اختبار نظام التحليلات الشخصية المركزة")
    print("تأكد من تشغيل الخادم الخلفي على المنفذ 5000")
    print()
    
    # التحقق من وجود الخادم
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ الخادم الخلفي متاح ويعمل")
            print()
        else:
            print("⚠️ الخادم الخلفي لا يستجيب بشكل صحيح")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("❌ لا يمكن الوصول إلى الخادم الخلفي")
        print("تأكد من تشغيله بالأمر: python backend/app.py")
        sys.exit(1)
    
    # تشغيل الاختبارات
    test_suite = PersonalAnalyticsTestSuite()
    test_suite.run_all_tests()
