#!/usr/bin/env python3
"""
اختبار تكامل المرحلة الثانية من التحسينات المنهجية
يختبر جميع الميزات الجديدة المطورة في هذه المرحلة
"""

import os
import sys
import json
import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, List

# إضافة مسار المجلد الجذر للمشروع
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_database_setup():
    """اختبار إعداد قاعدة البيانات للميزات الجديدة"""
    print("🗄️ اختبار إعداد قاعدة البيانات للمرحلة الثانية...")
    
    try:
        from unified_database import UnifiedDatabase
        
        db = UnifiedDatabase()
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # اختبار وجود الجداول الجديدة
        new_tables = [
            'user_edits',
            'plot_preferences',
            'character_preferences',
            'style_patterns',
            'collaboration_sessions',
            'negotiation_rounds',
            'agent_learning_records',
            'error_analysis',
            'tool_usage_patterns',
            'smart_notifications',
            'notification_preferences',
            'theme_templates',
            'user_themes'
        ]
        
        for table in new_tables:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                print(f"   ✅ جدول {table} موجود")
            else:
                print(f"   ❌ جدول {table} غير موجود")
                return False
        
        conn.close()
        print("   ✅ جميع جداول قاعدة البيانات الجديدة موجودة")
        return True
        
    except Exception as e:
        print(f"   ❌ خطأ في إعداد قاعدة البيانات: {e}")
        return False

def test_advanced_adaptive_learning():
    """اختبار نظام التعلم التكيفي المتقدم"""
    print("🧠 اختبار نظام التعلم التكيفي المتقدم...")
    
    try:
        from advanced_adaptive_learning import AdvancedAdaptiveLearning
        
        learning_system = AdvancedAdaptiveLearning()
        user_id = "test_user_001"
        
        # اختبار تسجيل تعديل المستخدم
        edit_id = learning_system.log_user_edit(
            user_id=user_id,
            original_text="هذا نص أصلي بسيط",
            edited_text="هذا نص محسن ومطور بشكل جميل",
            context={"task_type": "enhancement", "stage": "editing"}
        )
        
        if edit_id:
            print("   ✅ تم تسجيل تعديل المستخدم بنجاح")
        else:
            print("   ❌ فشل في تسجيل تعديل المستخدم")
            return False
        
        # اختبار تحليل الأسلوب الشخصي
        text_samples = [
            "هذا نص تجريبي أول يحتوي على أسلوب معين.",
            "والنص الثاني يكمل نفس الأسلوب بطريقة متسقة.",
            "أما النص الثالث فيظهر تطور الأسلوب عبر الوقت."
        ]
        
        style_profile = learning_system.analyze_personal_style(user_id, text_samples)
        
        if style_profile and 'sentence_length' in style_profile:
            print("   ✅ تم تحليل الأسلوب الشخصي بنجاح")
        else:
            print("   ❌ فشل في تحليل الأسلوب الشخصي")
            return False
        
        # اختبار تخصيص أسلوب الجطلاوي
        customization = learning_system.customize_jattlaoui_style(user_id)
        
        if customization and 'metaphorical_intensity' in customization:
            print("   ✅ تم تخصيص أسلوب الجطلاوي بنجاح")
        else:
            print("   ❌ فشل في تخصيص أسلوب الجطلاوي")
            return False
        
        # اختبار توليد prompt مخصص
        prompt = learning_system.generate_personalized_prompt(
            user_id, "generate_chapter", {"theme": "رومانسي"}
        )
        
        if prompt and len(prompt) > 10:
            print("   ✅ تم توليد prompt مخصص بنجاح")
        else:
            print("   ❌ فشل في توليد prompt مخصص")
            return False
        
        print("   ✅ جميع اختبارات التعلم التكيفي المتقدم نجحت")
        return True
        
    except Exception as e:
        print(f"   ❌ خطأ في نظام التعلم التكيفي المتقدم: {e}")
        return False

def test_workflow_system():
    """اختبار نظام المدير الفني للرواية المتقدم"""
    print("⚙️ اختبار نظام المدير الفني للرواية المتقدم...")
    
    try:
        from advanced_workflow_system import AdvancedWorkflowSystem, NodeCategory
        
        workflow_system = AdvancedWorkflowSystem()
        
        # اختبار الحصول على قوالب العقد
        node_templates = workflow_system.get_node_templates_by_category()
        
        if node_templates and len(node_templates) > 0:
            print(f"   ✅ تم تحميل {len(node_templates)} فئات من قوالب العقد")
        else:
            print("   ❌ فشل في تحميل قوالب العقد")
            return False
        
        # اختبار إنشاء عقدة جديدة
        node = workflow_system.create_workflow_node(
            template_id="input_text",
            position={"x": 100, "y": 200},
            properties={"text": "نص تجريبي"}
        )
        
        if node and node.id:
            print("   ✅ تم إنشاء عقدة سير عمل بنجاح")
        else:
            print("   ❌ فشل في إنشاء عقدة سير عمل")
            return False
        
        # اختبار حفظ قالب سير عمل
        workflow_data = {
            "nodes": [node.__dict__],
            "connections": [],
            "metadata": {"version": "1.0"}
        }
        
        template_info = {
            "name": "سير عمل تجريبي",
            "description": "قالب تجريبي للاختبار",
            "category": "test",
            "author": "النظام"
        }
        
        template_id = workflow_system.save_workflow_template(workflow_data, template_info)
        
        if template_id:
            print("   ✅ تم حفظ قالب سير العمل بنجاح")
        else:
            print("   ❌ فشل في حفظ قالب سير العمل")
            return False
        
        # اختبار التحقق من صحة سير العمل
        validation = workflow_system.validate_workflow(workflow_data)
        
        if validation and validation.get('valid'):
            print("   ✅ تم التحقق من صحة سير العمل بنجاح")
        else:
            print("   ❌ فشل في التحقق من صحة سير العمل")
            return False
        
        print("   ✅ جميع اختبارات نظام سير العمل المتقدم نجحت")
        return True
        
    except Exception as e:
        print(f"   ❌ خطأ في نظام سير العمل المتقدم: {e}")
        return False

async def test_collaboration_system():
    """اختبار نظام التعاون الذكي للوكلاء"""
    print("🤝 اختبار نظام التعاون الذكي للوكلاء...")
    
    try:
        from intelligent_agent_collaboration import IntelligentAgentCollaboration
        
        collaboration = IntelligentAgentCollaboration()
        
        # اختبار بدء جلسة تعاون
        session_id = await collaboration.initiate_collaboration(
            task_description="كتابة فصل رومانسي مع عمق ثقافي",
            participating_agents=["idea_generator", "chapter_composer", "cultural_maestro"],
            initiator_agent="idea_generator",
            context={"genre": "romance", "cultural_theme": "heritage"}
        )
        
        if session_id:
            print("   ✅ تم بدء جلسة التعاون بنجاح")
        else:
            print("   ❌ فشل في بدء جلسة التعاون")
            return False
        
        # اختبار تسجيل أداء الوكيل
        await collaboration.record_agent_performance(
            agent_id="idea_generator",
            task_type="creative_writing",
            performance_score=0.85,
            errors=["lack_of_creativity"],
            improvements=["enhanced_metaphor_usage"],
            tool_usage={"text_generator": 0.9, "creativity_enhancer": 0.7}
        )
        
        print("   ✅ تم تسجيل أداء الوكيل بنجاح")
        
        # اختبار الحصول على ملخص الأداء
        performance_summary = collaboration.get_agent_performance_summary("idea_generator")
        
        if performance_summary and 'recent_performance' in performance_summary:
            print("   ✅ تم الحصول على ملخص الأداء بنجاح")
        else:
            print("   ❌ فشل في الحصول على ملخص الأداء")
            return False
        
        # اختبار اقتراح الأدوات
        recommended_tools = collaboration._recommend_tools_for_agent(
            "chapter_composer", 
            "كتابة فصل رومانسي"
        )
        
        if recommended_tools and len(recommended_tools) > 0:
            print(f"   ✅ تم اقتراح {len(recommended_tools)} أدوات للوكيل")
        else:
            print("   ❌ فشل في اقتراح الأدوات")
            return False
        
        print("   ✅ جميع اختبارات التعاون الذكي نجحت")
        return True
        
    except Exception as e:
        print(f"   ❌ خطأ في نظام التعاون الذكي: {e}")
        return False

def test_interactive_components():
    """اختبار المكونات التفاعلية"""
    print("🎨 اختبار المكونات التفاعلية...")
    
    try:
        # اختبار وجود ملفات المكونات التفاعلية
        component_files = [
            'src/components/interactive/AdvancedAgentStatusDisplay.tsx',
            'src/components/interactive/SmartNotificationSystem.tsx',
            'src/components/interactive/VoiceInteractionSystem.tsx',
            'src/components/interactive/AdvancedThemeCustomization.tsx'
        ]
        
        base_path = '/workspace/النظام_الذكي_للكتابة_العربية'
        
        for component_file in component_files:
            full_path = os.path.join(base_path, component_file)
            if os.path.exists(full_path):
                print(f"   ✅ مكون {component_file.split('/')[-1]} موجود")
            else:
                print(f"   ❌ مكون {component_file.split('/')[-1]} غير موجود")
                return False
        
        # اختبار قراءة محتوى المكونات
        for component_file in component_files:
            full_path = os.path.join(base_path, component_file)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if len(content) > 1000:  # تحقق أساسي من وجود محتوى
                        print(f"   ✅ مكون {component_file.split('/')[-1]} يحتوي على محتوى صالح")
                    else:
                        print(f"   ❌ مكون {component_file.split('/')[-1]} صغير جداً أو فارغ")
                        return False
            except Exception as e:
                print(f"   ❌ خطأ في قراءة مكون {component_file.split('/')[-1]}: {e}")
                return False
        
        print("   ✅ جميع المكونات التفاعلية متوفرة وصالحة")
        return True
        
    except Exception as e:
        print(f"   ❌ خطأ في اختبار المكونات التفاعلية: {e}")
        return False

def test_integration():
    """اختبار التكامل الشامل"""
    print("🔄 اختبار التكامل الشامل...")
    
    try:
        from unified_database import UnifiedDatabase
        from advanced_adaptive_learning import AdvancedAdaptiveLearning
        from advanced_workflow_system import AdvancedWorkflowSystem
        from intelligent_agent_collaboration import IntelligentAgentCollaboration
        
        db = UnifiedDatabase()
        learning = AdvancedAdaptiveLearning()
        workflow = AdvancedWorkflowSystem()
        collaboration = IntelligentAgentCollaboration()
        
        # محاكاة سيناريو متكامل
        user_id = "integration_test_user"
        
        # 1. حفظ بيانات المستخدم في قاعدة البيانات
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO users (user_id, username, email, role)
            VALUES (?, ?, ?, ?)
        ''', (user_id, "مستخدم الاختبار", "test@example.com", "user"))
        
        conn.commit()
        conn.close()
        
        # 2. تسجيل تعديل وتحليل أسلوب
        edit_id = learning.log_user_edit(
            user_id=user_id,
            original_text="نص أصلي",
            edited_text="نص محسن وأفضل",
            context={"integration_test": True}
        )
        
        # 3. إنشاء سير عمل وحفظه
        node = workflow.create_workflow_node(
            template_id="condition",
            position={"x": 0, "y": 0},
            properties={"condition_type": "equals", "value": "test"}
        )
        
        workflow_data = {"nodes": [node.__dict__], "connections": []}
        template_info = {
            "name": "سير عمل التكامل",
            "description": "اختبار التكامل",
            "author": user_id
        }
        
        template_id = workflow.save_workflow_template(workflow_data, template_info)
        
        # 4. التحقق من النتائج
        if edit_id and template_id:
            print("   ✅ التكامل بين جميع الأنظمة يعمل بنجاح")
            return True
        else:
            print("   ❌ فشل في التكامل بين الأنظمة")
            return False
        
    except Exception as e:
        print(f"   ❌ خطأ في اختبار التكامل: {e}")
        return False

async def run_all_tests():
    """تشغيل جميع الاختبارات"""
    print("=" * 60)
    print("🚀 بدء اختبار المرحلة الثانية من التحسينات المنهجية")
    print("=" * 60)
    
    results = []
    
    # اختبارات متسلسلة
    tests = [
        ("إعداد قاعدة البيانات", test_database_setup),
        ("التعلم التكيفي المتقدم", test_advanced_adaptive_learning),
        ("نظام سير العمل المتقدم", test_workflow_system),
        ("المكونات التفاعلية", test_interactive_components),
        ("التكامل الشامل", test_integration),
    ]
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}:")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"   ❌ خطأ في اختبار {test_name}: {e}")
            results.append((test_name, False))
    
    # اختبار التعاون (async)
    print(f"\n📋 التعاون الذكي للوكلاء:")
    try:
        result = await test_collaboration_system()
        results.append(("التعاون الذكي للوكلاء", result))
    except Exception as e:
        print(f"   ❌ خطأ في اختبار التعاون الذكي: {e}")
        results.append(("التعاون الذكي للوكلاء", False))
    
    # ملخص النتائج
    print("\n" + "=" * 60)
    print("📊 ملخص نتائج الاختبارات:")
    print("=" * 60)
    
    successful_tests = 0
    total_tests = len(results)
    
    for test_name, success in results:
        status = "✅ نجح" if success else "❌ فشل"
        print(f"   {test_name}: {status}")
        if success:
            successful_tests += 1
    
    print(f"\n📈 النتيجة الإجمالية: {successful_tests}/{total_tests} اختبارات نجحت")
    
    success_rate = (successful_tests / total_tests) * 100
    print(f"📊 معدل النجاح: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("\n🎉 المرحلة الثانية من التحسينات جاهزة للاستخدام!")
    elif success_rate >= 60:
        print("\n⚠️ المرحلة الثانية تحتاج إلى بعض التحسينات قبل الاستخدام")
    else:
        print("\n❌ المرحلة الثانية تحتاج إلى مراجعة شاملة")
    
    return successful_tests == total_tests

def main():
    """الدالة الرئيسية"""
    try:
        # تشغيل الاختبارات
        result = asyncio.run(run_all_tests())
        exit_code = 0 if result else 1
        
        print(f"\n🏁 انتهى الاختبار بكود الخروج: {exit_code}")
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        print("\n⏹️ تم إيقاف الاختبار بواسطة المستخدم")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 خطأ غير متوقع: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
