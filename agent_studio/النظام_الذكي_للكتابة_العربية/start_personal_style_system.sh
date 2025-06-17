#!/bin/bash

# 🎨 سكريبت تشغيل النظام مع لوحة التحكم الشخصية
# يشغل النظام الكامل مع التركيز على ميزات التخصيص الشخصي

echo "🎨 بدء تشغيل النظام مع لوحة التحكم الشخصية"
echo "=================================================="

# التحقق من المتطلبات الأساسية
echo "🔍 التحقق من المتطلبات..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مُنصب. يرجى تنصيب Node.js أولاً"
    exit 1
fi

if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python غير مُنصب. يرجى تنصيب Python أولاً"
    exit 1
fi

# تحديد أمر Python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ المتطلبات الأساسية متوفرة"

# التحقق من وجود المكتبات المطلوبة للواجهة الأمامية
echo "📦 التحقق من مكتبات الواجهة الأمامية..."

if [ ! -d "node_modules" ]; then
    echo "📥 تنصيب packages الواجهة الأمامية..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ فشل في تنصيب packages الواجهة الأمامية"
        exit 1
    fi
fi

# التحقق من وجود recharts (مطلوبة للرسوم البيانية)
if ! npm list recharts &> /dev/null; then
    echo "📊 تنصيب مكتبة الرسوم البيانية..."
    npm install recharts @radix-ui/react-slider
    if [ $? -ne 0 ]; then
        echo "❌ فشل في تنصيب مكتبة الرسوم البيانية"
        exit 1
    fi
fi

echo "✅ مكتبات الواجهة الأمامية جاهزة"

# التحقق من متطلبات الخلفية
echo "🐍 التحقق من متطلبات Python..."

if [ -f "backend/requirements.txt" ]; then
    cd backend
    
    # التحقق من وجود المكتبات المطلوبة
    if ! $PYTHON_CMD -c "import flask, flask_cors, sqlite3" &> /dev/null; then
        echo "📥 تنصيب متطلبات Python..."
        $PYTHON_CMD -m pip install -r requirements.txt
        if [ $? -ne 0 ]; then
            echo "❌ فشل في تنصيب متطلبات Python"
            exit 1
        fi
    fi
    
    cd ..
fi

echo "✅ متطلبات Python جاهزة"

# إنشاء ملفات PID
PID_DIR=".pids"
mkdir -p $PID_DIR
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"

# دالة التنظيف
cleanup() {
    echo ""
    echo "🛑 إيقاف النظام..."
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "🔥 إيقاف الخادم الخلفي (PID: $BACKEND_PID)"
            kill $BACKEND_PID 2>/dev/null
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "🔥 إيقاف الواجهة الأمامية (PID: $FRONTEND_PID)"
            kill $FRONTEND_PID 2>/dev/null
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    rm -rf $PID_DIR 2>/dev/null
    echo "✅ تم إيقاف النظام بنجاح"
    exit 0
}

# تسجيل دالة cleanup
trap cleanup SIGINT SIGTERM

# بدء الخادم الخلفي
echo "🔧 بدء الخادم الخلفي مع APIs التخصيص الشخصي..."
cd backend

# تشغيل الخادم في الخلفية
$PYTHON_CMD app.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "../$BACKEND_PID_FILE"

cd ..

# إنشاء مجلد السجلات إذا لم يكن موجوداً
mkdir -p logs

# انتظار بدء الخادم الخلفي
echo "⏳ انتظار بدء الخادم الخلفي..."
sleep 4

# التحقق من عمل الخادم الخلفي
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✅ الخادم الخلفي يعمل على http://localhost:5000"
else
    echo "❌ فشل في بدء الخادم الخلفي"
    echo "📋 آخر رسائل الخطأ:"
    tail -10 logs/backend.log 2>/dev/null || echo "لا توجد سجلات متاحة"
    exit 1
fi

# اختبار APIs لوحة التحكم الشخصية
echo "🧪 اختبار APIs لوحة التحكم الشخصية..."
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ الخادم يستجيب بشكل صحيح"
    
    # اختبار API التخصيص الشخصي
    if curl -s http://localhost:5000/api/style/profile > /dev/null; then
        echo "✅ APIs التخصيص الشخصي متاحة"
    else
        echo "⚠️  APIs التخصيص الشخصي غير متاحة - سيتم المتابعة"
    fi
else
    echo "⚠️  الخادم لا يستجيب - سيتم المتابعة"
fi

# بدء الواجهة الأمامية
echo "🎨 بدء الواجهة الأمامية مع لوحة التحكم الشخصية..."

# تشغيل الواجهة الأمامية في الخلفية
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"

# انتظار بدء الواجهة الأمامية
echo "⏳ انتظار بدء الواجهة الأمامية..."
sleep 6

# التحقق من عمل الواجهة الأمامية
if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "✅ الواجهة الأمامية تعمل على http://localhost:5173"
else
    echo "❌ فشل في بدء الواجهة الأمامية"
    echo "📋 آخر رسائل الخطأ:"
    tail -10 logs/frontend.log 2>/dev/null || echo "لا توجد سجلات متاحة"
    cleanup
    exit 1
fi

echo ""
echo "🎉 تم تشغيل النظام مع لوحة التحكم الشخصية بنجاح!"
echo "=================================================="
echo "🌐 الروابط المتاحة:"
echo "   📊 لوحة القيادة: http://localhost:5173"
echo "   🎨 لوحة التحكم الشخصية: http://localhost:5173/personal-style"
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
echo "   📄 الخلفية: $(pwd)/logs/backend.log"
echo "   📄 الأمامية: $(pwd)/logs/frontend.log"
echo ""
echo "🎨 ميزات لوحة التحكم الشخصية:"
echo "   • تخصيص أسلوب الجطلاوي (كثافة الوصف، التركيز الفلسفي)"
echo "   • ضبط التفضيلات الأسلوبية (المفردات، طول الجمل، العمق الثقافي)"
echo "   • رؤى التعلم مع رسوم بيانية تفاعلية"
echo "   • تتبع تطور الأسلوب عبر الوقت"
echo "   • تكامل مع نظام التعلم التكيفي"
echo ""
echo "💡 نصائح الاستخدام:"
echo "   • ابدأ بزيارة لوحة التحكم الشخصية لضبط تفضيلاتك"
echo "   • استخدم التقييمات لتحسين جودة المحتوى المولد"
echo "   • راجع رؤى التعلم لفهم تطور أسلوبك"
echo "   • جرب الإعدادات المختلفة لتجد الأسلوب المناسب"
echo ""
echo "🧪 اختبار النظام:"
echo "   python test_personal_style_dashboard.py"
echo ""
echo "⚠️  للإيقاف: اضغط Ctrl+C"
echo "=================================================="

# تشغيل اختبار سريع للنظام
echo "🧪 تشغيل اختبار سريع للتحكم الشخصي..."
if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    timeout 30 $PYTHON_CMD test_personal_style_dashboard.py --quick 2>/dev/null || echo "⚠️  تعذر تشغيل الاختبار السريع"
fi

# انتظار إشارة الإيقاف
echo "✨ النظام جاهز! لوحة التحكم الشخصية متاحة الآن"
echo "   (استخدم Ctrl+C لإيقاف النظام)"

# حلقة مراقبة النظام
while true; do
    # التحقق من أن العمليات ما زالت تعمل
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "❌ الخادم الخلفي توقف بشكل غير متوقع"
        echo "📋 آخر رسائل الخطأ:"
        tail -5 logs/backend.log 2>/dev/null || echo "لا توجد سجلات متاحة"
        cleanup
        exit 1
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "❌ الواجهة الأمامية توقفت بشكل غير متوقع"
        echo "📋 آخر رسائل الخطأ:"
        tail -5 logs/frontend.log 2>/dev/null || echo "لا توجد سجلات متاحة"
        cleanup
        exit 1
    fi
    
    sleep 15
done
