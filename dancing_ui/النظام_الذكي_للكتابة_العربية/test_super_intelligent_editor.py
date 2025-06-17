#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
اختبار شامل للمحرر التفاعلي الذكي الفائق
=====================================

هذا الملف يختبر جميع وظائف المحرر الذكي:
- تحليل النص الشامل
- الاقتراحات السياقية الذكية
- تطبيق الاقتراحات
- تحديد مشاكل النص
- التكامل مع النظام الحالي
"""

import requests
import json
import time
import sys
from datetime import datetime

# إعدادات الاختبار
BASE_URL = "http://localhost:5000"
TEST_USER_ID = "test_editor_user"

# نصوص الاختبار
TEST_TEXTS = {
    "basic_text": "في ظلال الليل الهادئ، جلس أحمد يتأمل النجوم المتلألئة. كان الليل باردًا والنسيم العليل يداعب وجهه.",
    
    "text_with_issues": "أحمد أحمد أحمد ذهب إلى المدرسة وذهب إلى البيت وذهب إلى السوق أحمد يحب أحمد أن يقرأ أحمد الكتب",
    
    "long_text": """في أعماق المحيط الأطلسي، حيث تتراقص أشعة الشمس الذهبية عبر طبقات المياه الزرقاء الصافية، تعيش مخلوقات بحرية عجيبة وغريبة لا يعرف الإنسان عنها إلا القليل القليل من المعلومات والحقائق العلمية المؤكدة والموثقة من قبل علماء البحار والمحيطات المتخصصين في دراسة الأحياء البحرية والنظم البيئية المائية المعقدة والمتشابكة.""",
    
    "short_text": "النجوم جميلة.",
    
    "complex_text": "إن الفلسفة الوجودية التي طرحها سارتر في أعماله الأدبية والفكرية تتمحور حول مفهوم الحرية الإنسانية والمسؤولية الفردية في خلق المعنى والهوية في عالم عبثي لا يحمل معنى جوهرياً مسبقاً."
}

# نماذج تحديد النص
SELECTION_SAMPLES = [
    {
        "text": "في ظلال الليل الهادئ",
        "start": 0,
        "end": 21
    },
    {
        "text": "النجوم المتلألئة",
        "start": 35,
        "end": 49
    },
    {
        "text": "النسيم العليل",
        "start": 70,
        "end": 83
    }
]

def print_section(title):
    """طباعة عنوان القسم"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def print_test_result(test_name, success, details=""):
    """طباعة نتيجة الاختبار"""
    status = "✅ نجح" if success else "❌ فشل"
    print(f"{status} | {test_name}")
    if details:
        print(f"    التفاصيل: {details}")

def test_text_analysis():
    """اختبار تحليل النص"""
    print_section("اختبار تحليل النص")
    
    for text_name, text_content in TEST_TEXTS.items():
        print(f"\n🔍 اختبار تحليل: {text_name}")
        
        try:
            response = requests.post(f"{BASE_URL}/api/smart-editor/analyze", json={
                "text": text_content,
                "user_profile": get_test_user_profile(),
                "analysis_type": "comprehensive"
            })
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    analysis = data['analysis']
                    
                    print(f"    📊 عدد الكلمات: {analysis['statistics']['wordCount']}")
                    print(f"    📖 عدد الجمل: {analysis['statistics']['sentenceCount']}")
                    print(f"    📝 عدد الفقرات: {analysis['statistics']['paragraphCount']}")
                    print(f"    📈 نقاط القراءة: {analysis['statistics']['readabilityScore']:.2f}")
                    print(f"    🎯 النقاط الإجمالية: {analysis['overallScore']:.2f}")
                    print(f"    ⚠️  عدد المشاكل: {len(analysis['issues'])}")
                    
                    if analysis['issues']:
                        print("    🔧 المشاكل المكتشفة:")
                        for issue in analysis['issues'][:3]:  # أول 3 مشاكل
                            print(f"        - {issue['type']}: {issue['message']}")
                    
                    print_test_result(f"تحليل {text_name}", True)
                else:
                    print_test_result(f"تحليل {text_name}", False, data.get('error', 'خطأ غير معروف'))
            else:
                print_test_result(f"تحليل {text_name}", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            print_test_result(f"تحليل {text_name}", False, str(e))

def test_contextual_suggestions():
    """اختبار الاقتراحات السياقية"""
    print_section("اختبار الاقتراحات السياقية")
    
    test_text = TEST_TEXTS["basic_text"]
    
    for selection in SELECTION_SAMPLES:
        print(f"\n💡 اختبار اقتراحات للنص: '{selection['text']}'")
        
        try:
            response = requests.post(f"{BASE_URL}/api/smart-editor/suggestions", json={
                "selected_text": selection['text'],
                "full_text": test_text,
                "selection_context": selection,
                "user_profile": get_test_user_profile()
            })
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    suggestions = data['suggestions']
                    
                    print(f"    📝 عدد الاقتراحات: {len(suggestions)}")
                    
                    for suggestion in suggestions[:3]:  # أول 3 اقتراحات
                        print(f"    ✨ {suggestion['title']}: {suggestion['description']}")
                        print(f"        الثقة: {suggestion['confidence']:.2f}")
                        print(f"        السبب: {suggestion['reasoning']}")
                    
                    print_test_result(f"اقتراحات '{selection['text']}'", True)
                else:
                    print_test_result(f"اقتراحات '{selection['text']}'", False, data.get('error'))
            else:
                print_test_result(f"اقتراحات '{selection['text']}'", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            print_test_result(f"اقتراحات '{selection['text']}'", False, str(e))

def test_suggestion_application():
    """اختبار تطبيق الاقتراحات"""
    print_section("اختبار تطبيق الاقتراحات")
    
    test_text = TEST_TEXTS["basic_text"]
    selection = SELECTION_SAMPLES[0]  # أول تحديد
    
    # الحصول على اقتراحات أولاً
    try:
        suggestions_response = requests.post(f"{BASE_URL}/api/smart-editor/suggestions", json={
            "selected_text": selection['text'],
            "full_text": test_text,
            "selection_context": selection,
            "user_profile": get_test_user_profile()
        })
        
        if suggestions_response.status_code == 200:
            suggestions_data = suggestions_response.json()
            if suggestions_data['success'] and suggestions_data['suggestions']:
                suggestion = suggestions_data['suggestions'][0]  # أول اقتراح
                
                print(f"\n🔄 تطبيق اقتراح: {suggestion['title']}")
                
                # تطبيق الاقتراح
                apply_response = requests.post(f"{BASE_URL}/api/smart-editor/apply-suggestion", json={
                    "original_text": test_text,
                    "selection": selection,
                    "suggestion": suggestion,
                    "user_profile": get_test_user_profile()
                })
                
                if apply_response.status_code == 200:
                    apply_data = apply_response.json()
                    if apply_data['success']:
                        print(f"    📝 النص الأصلي: {selection['text']}")
                        print(f"    ✨ النص المحدث: {apply_data['modification']}")
                        print(f"    📊 نوع التغيير: {apply_data['applied_changes'].get('type', 'غير محدد')}")
                        
                        print_test_result("تطبيق الاقتراح", True)
                    else:
                        print_test_result("تطبيق الاقتراح", False, apply_data.get('error'))
                else:
                    print_test_result("تطبيق الاقتراح", False, f"HTTP {apply_response.status_code}")
        
    except Exception as e:
        print_test_result("تطبيق الاقتراح", False, str(e))

def test_issue_highlighting():
    """اختبار تحديد مشاكل النص"""
    print_section("اختبار تحديد مشاكل النص")
    
    test_text = TEST_TEXTS["text_with_issues"]  # نص يحتوي على مشاكل
    
    try:
        response = requests.post(f"{BASE_URL}/api/smart-editor/highlight-issues", json={
            "text": test_text,
            "issue_types": ["all"]
        })
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                issues = data['issues']
                highlighted_ranges = data['highlighted_ranges']
                
                print(f"    🔍 عدد المشاكل المكتشفة: {len(issues)}")
                print(f"    🎯 عدد النطاقات المبرزة: {len(highlighted_ranges)}")
                
                print("\n    📋 تفاصيل المشاكل:")
                for issue in issues[:5]:  # أول 5 مشاكل
                    print(f"        - النوع: {issue['type']}")
                    print(f"          الخطورة: {issue['severity']}")
                    print(f"          الرسالة: {issue['message']}")
                    print(f"          النص: '{issue['text']}'")
                    print()
                
                print_test_result("تحديد المشاكل", True)
            else:
                print_test_result("تحديد المشاكل", False, data.get('error'))
        else:
            print_test_result("تحديد المشاكل", False, f"HTTP {response.status_code}")
            
    except Exception as e:
        print_test_result("تحديد المشاكل", False, str(e))

def test_integration_with_style_system():
    """اختبار التكامل مع نظام الأسلوب"""
    print_section("اختبار التكامل مع نظام الأسلوب")
    
    try:
        # الحصول على الملف الشخصي
        profile_response = requests.get(f"{BASE_URL}/api/style/profile")
        
        if profile_response.status_code == 200:
            profile_data = profile_response.json()
            if profile_data['success']:
                print("    ✅ تم الحصول على الملف الشخصي بنجاح")
                
                # تحليل النص مع الملف الشخصي
                analysis_response = requests.post(f"{BASE_URL}/api/smart-editor/analyze", json={
                    "text": TEST_TEXTS["complex_text"],
                    "user_profile": profile_data['profile'],
                    "analysis_type": "comprehensive"
                })
                
                if analysis_response.status_code == 200:
                    analysis_data = analysis_response.json()
                    if analysis_data['success']:
                        print("    ✅ تم تحليل النص مع الملف الشخصي")
                        
                        # تسجيل تفاعل
                        interaction_response = requests.post(f"{BASE_URL}/api/style/log-interaction", json={
                            "interaction_type": "smart_editor_analysis",
                            "content_type": "text_analysis",
                            "original_content": TEST_TEXTS["complex_text"],
                            "modified_content": TEST_TEXTS["complex_text"],
                            "edit_details": {
                                "analysis_score": analysis_data['analysis']['overallScore'],
                                "issues_count": len(analysis_data['analysis']['issues'])
                            }
                        })
                        
                        if interaction_response.status_code == 200:
                            print("    ✅ تم تسجيل التفاعل بنجاح")
                            print_test_result("التكامل مع نظام الأسلوب", True)
                        else:
                            print_test_result("التكامل مع نظام الأسلوب", False, "فشل في تسجيل التفاعل")
                    else:
                        print_test_result("التكامل مع نظام الأسلوب", False, "فشل في تحليل النص")
                else:
                    print_test_result("التكامل مع نظام الأسلوب", False, f"HTTP {analysis_response.status_code}")
            else:
                print_test_result("التكامل مع نظام الأسلوب", False, "فشل في الحصول على الملف الشخصي")
        else:
            print_test_result("التكامل مع نظام الأسلوب", False, f"HTTP {profile_response.status_code}")
            
    except Exception as e:
        print_test_result("التكامل مع نظام الأسلوب", False, str(e))

def test_performance():
    """اختبار الأداء"""
    print_section("اختبار الأداء")
    
    test_cases = [
        ("نص قصير", TEST_TEXTS["short_text"]),
        ("نص متوسط", TEST_TEXTS["basic_text"]),
        ("نص طويل", TEST_TEXTS["long_text"])
    ]
    
    for case_name, text in test_cases:
        print(f"\n⏱️  قياس أداء: {case_name}")
        
        try:
            start_time = time.time()
            
            response = requests.post(f"{BASE_URL}/api/smart-editor/analyze", json={
                "text": text,
                "user_profile": get_test_user_profile(),
                "analysis_type": "comprehensive"
            })
            
            end_time = time.time()
            duration = end_time - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    print(f"    ⏰ وقت التحليل: {duration:.2f} ثانية")
                    print(f"    📊 عدد الكلمات: {data['analysis']['statistics']['wordCount']}")
                    print(f"    🔍 عدد المشاكل: {len(data['analysis']['issues'])}")
                    
                    performance_rating = "ممتاز" if duration < 1 else "جيد" if duration < 3 else "بطيء"
                    print(f"    📈 تقييم الأداء: {performance_rating}")
                    
                    print_test_result(f"أداء {case_name}", True, f"{duration:.2f}s")
                else:
                    print_test_result(f"أداء {case_name}", False, data.get('error'))
            else:
                print_test_result(f"أداء {case_name}", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            print_test_result(f"أداء {case_name}", False, str(e))

def get_test_user_profile():
    """الحصول على ملف مستخدم تجريبي"""
    return {
        "jattlaoui_adaptation_level": 0.7,
        "preferred_sentence_length": 0.6,
        "preferred_cultural_depth": 0.8,
        "preferred_vocabulary_complexity": 0.7,
        "style_preferences": {
            "metaphorical_richness": 0.8,
            "sensory_descriptions": 0.7,
            "philosophical_depth": 0.6,
            "narrative_elegance": 0.8,
            "cultural_authenticity": 0.9
        }
    }

def run_comprehensive_test():
    """تشغيل الاختبار الشامل"""
    print("🎯 بدء الاختبار الشامل للمحرر التفاعلي الذكي الفائق")
    print(f"⏰ وقت البدء: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 عنوان الخادم: {BASE_URL}")
    
    # فحص اتصال الخادم
    try:
        health_response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ لا يمكن الاتصال بالخادم")
            return False
    except:
        print("❌ الخادم غير متاح")
        return False
    
    print("✅ الخادم متاح ومتصل")
    
    # تشغيل جميع الاختبارات
    test_functions = [
        test_text_analysis,
        test_contextual_suggestions,
        test_suggestion_application,
        test_issue_highlighting,
        test_integration_with_style_system,
        test_performance
    ]
    
    for test_function in test_functions:
        try:
            test_function()
            time.sleep(1)  # توقف قصير بين الاختبارات
        except Exception as e:
            print(f"❌ خطأ في {test_function.__name__}: {str(e)}")
    
    print_section("ملخص النتائج")
    print("🎉 تم إكمال جميع اختبارات المحرر التفاعلي الذكي الفائق")
    print(f"⏰ وقت الانتهاء: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n📋 الميزات المختبرة:")
    print("   ✅ تحليل النص الشامل")
    print("   ✅ الاقتراحات السياقية الذكية")
    print("   ✅ تطبيق الاقتراحات")
    print("   ✅ تحديد مشاكل النص")
    print("   ✅ التكامل مع نظام الأسلوب")
    print("   ✅ اختبار الأداء")

if __name__ == "__main__":
    run_comprehensive_test()
