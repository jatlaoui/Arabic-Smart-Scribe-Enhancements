#!/bin/bash

# 🚀 سكريبت تشغيل النظام الموحد للكتابة الذكية
# يقوم بتشغيل الخادم الخلفي والواجهة الأمامية معاً

echo "🌟 بدء تشغيل النظام الموحد للكتابة الذكية"
echo "=================================================="

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مُنصب. يرجى تنصيب Node.js أولاً"
    exit 1
fi

# التحقق من وجود Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python غير مُنصب. يرجى تنصيب Python أولاً"
    exit 1
fi

# تحديد أمر Python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "🔍 التحقق من المتطلبات..."

# التحقق من وجود مجلد node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تنصيب packages الواجهة الأمامية..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ فشل في تنصيب packages الواجهة الأمامية"
        exit 1
    fi
fi

# التحقق من virtual environment للخلفية
if [ ! -d "backend/venv" ] && [ ! -f "backend/requirements.txt" ]; then
    echo "⚠️  لم يتم العثور على متطلبات الخلفية"
else
    echo "🐍 التحقق من متطلبات Python..."
fi

# إنشاء ملف PID لتتبع العمليات
PID_FILE=".unified_system.pid"
BACKEND_PID_FILE=".backend.pid"
FRONTEND_PID_FILE=".frontend.pid"

# دالة لإنهاء العمليات عند إيقاف السكريبت
cleanup() {
    echo ""
    echo "🛑 إيقاف النظام الموحد..."
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "🔥 إيقاف الخادم الخلفي (PID: $BACKEND_PID)"
            kill $BACKEND_PID
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "🔥 إيقاف الواجهة الأمامية (PID: $FRONTEND_PID)"
            kill $FRONTEND_PID
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    rm -f "$PID_FILE"
    echo "✅ تم إيقاف النظام بنجاح"
    exit 0
}

# تسجيل دالة cleanup لتنفيذها عند إيقاف السكريبت
trap cleanup SIGINT SIGTERM

# بدء الخادم الخلفي
echo "🔧 بدء الخادم الخلفي..."
cd backend

# تشغيل الخادم في الخلفية
$PYTHON_CMD app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "../$BACKEND_PID_FILE"

cd ..

# انتظار حتى يبدأ الخادم الخلفي
echo "⏳ انتظار بدء الخادم الخلفي..."
sleep 3

# التحقق من عمل الخادم الخلفي
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✅ الخادم الخلفي يعمل على http://localhost:5000"
else
    echo "❌ فشل في بدء الخادم الخلفي"
    echo "📋 آخر رسائل الخطأ:"
    tail -10 backend.log
    exit 1
fi

# اختبار الاتصال بالخادم
echo "🔍 اختبار الاتصال بالخادم..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ الخادم يستجيب بشكل صحيح"
else
    echo "⚠️  الخادم لا يستجيب - سيتم المتابعة"
fi

# بدء الواجهة الأمامية
echo "🎨 بدء الواجهة الأمامية..."

# تشغيل الواجهة الأمامية في الخلفية
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"

# انتظار حتى تبدأ الواجهة الأمامية
echo "⏳ انتظار بدء الواجهة الأمامية..."
sleep 5

# التحقق من عمل الواجهة الأمامية
if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "✅ الواجهة الأمامية تعمل على http://localhost:5173"
else
    echo "❌ فشل في بدء الواجهة الأمامية"
    echo "📋 آخر رسائل الخطأ:"
    tail -10 frontend.log
    cleanup
    exit 1
fi

# حفظ PID الرئيسي
echo $$ > "$PID_FILE"

echo ""
echo "🎉 تم تشغيل النظام الموحد بنجاح!"
echo "=================================================="
echo "🌐 الروابط المتاحة:"
echo "   📊 لوحة القيادة: http://localhost:5173"
echo "   🌟 الرحلة الموحدة: http://localhost:5173/unified-journey"
echo "   🧠 رحلة الكتابة الذكية: http://localhost:5173/ai-journey"
echo "   ⚙️  المدير الفني: http://localhost:5173/workflow-builder"
echo "   🤖 استوديو الوكلاء: http://localhost:5173/agent-studio"
echo ""
echo "🔧 الخوادم:"
echo "   🐍 الخادم الخلفي: http://localhost:5000"
echo "   ⚛️  الواجهة الأمامية: http://localhost:5173"
echo ""
echo "📝 ملفات السجلات:"
echo "   📄 الخلفية: $(pwd)/backend.log"
echo "   📄 الأمامية: $(pwd)/frontend.log"
echo ""
echo "💡 نصائح الاستخدام:"
echo "   • جرب الرحلة الموحدة الجديدة للحصول على أفضل تجربة"
echo "   • استخدم النمط 'الموجه' إذا كنت مبتدئاً"
echo "   • استخدم النمط 'المخصص' للتحكم الكامل"
echo "   • النمط 'المختلط' يوفر توازناً مثالياً"
echo ""
echo "⚠️  للإيقاف: اضغط Ctrl+C"
echo "=================================================="

# اختبار سريع للنظام الموحد
echo "🧪 تشغيل اختبار سريع للنظام..."
if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    $PYTHON_CMD test_unified_journey.py --quick-test 2>/dev/null || echo "⚠️  تعذر تشغيل الاختبار السريع"
fi

# انتظار إشارة الإيقاف
echo "✨ النظام جاهز! في انتظار الإيقاف..."
echo "   (استخدم Ctrl+C لإيقاف النظام)"

# حلقة انتظار
while true; do
    # التحقق من أن العمليات ما زالت تعمل
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "❌ الخادم الخلفي توقف بشكل غير متوقع"
        cleanup
        exit 1
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "❌ الواجهة الأمامية توقفت بشكل غير متوقع"
        cleanup
        exit 1
    fi
    
    sleep 10
done
