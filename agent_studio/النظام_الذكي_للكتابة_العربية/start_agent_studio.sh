#!/bin/bash

# 🤖 سكريبت تشغيل استوديو الوكلاء والأدوات المتقدمة
# النظام الذكي للكتابة العربية - السردي الخارق

echo "🚀 بدء تشغيل استوديو الوكلاء والأدوات المتقدمة..."
echo "=========================================================="

# متغيرات البيئة
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
SRC_DIR="$PROJECT_DIR/src"

# ألوان للعرض
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# دالة لطباعة الرسائل بألوان
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# دالة للتحقق من وجود الأوامر المطلوبة
check_dependencies() {
    print_header "🔍 فحص التبعيات المطلوبة..."
    
    # التحقق من Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 غير مثبت. يرجى تثبيته أولاً."
        exit 1
    fi
    print_success "Python 3 موجود"
    
    # التحقق من Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js غير مثبت. يرجى تثبيته أولاً."
        exit 1
    fi
    print_success "Node.js موجود"
    
    # التحقق من npm
    if ! command -v npm &> /dev/null; then
        print_error "npm غير مثبت. يرجى تثبيته أولاً."
        exit 1
    fi
    print_success "npm موجود"
    
    echo ""
}

# دالة تهيئة Backend
setup_backend() {
    print_header "🐍 إعداد الخادم الخلفي (Backend)..."
    
    cd "$BACKEND_DIR" || exit 1
    
    # التحقق من وجود البيئة الافتراضية
    if [ ! -d "venv" ]; then
        print_status "إنشاء البيئة الافتراضية..."
        python3 -m venv venv
    fi
    
    # تفعيل البيئة الافتراضية
    print_status "تفعيل البيئة الافتراضية..."
    source venv/bin/activate
    
    # تثبيت التبعيات
    print_status "تثبيت تبعيات Python..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
    
    # التحقق من وجود ملف .env
    if [ ! -f ".env" ]; then
        print_warning "ملف .env غير موجود. إنشاء ملف افتراضي..."
        cat > .env << EOF
# مفاتيح APIs الخاصة بنماذج الذكاء الاصطناعي
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
GEMINI_API_KEY=your_gemini_key_here

# إعدادات استوديو الوكلاء
AGENT_STUDIO_ENABLED=true
AGENT_COLLABORATION_MAX_MESSAGES=100
AGENT_ARBITRATOR_MODEL=openai_gpt4
EOF
    fi
    
    # التحقق من وجود مجلد advanced
    if [ ! -d "advanced" ]; then
        print_warning "مجلد advanced غير موجود. إنشاء مجلد..."
        mkdir -p advanced
    fi
    
    # التحقق من وجود مجلد logs
    if [ ! -d "logs" ]; then
        mkdir -p logs
    fi
    
    print_success "تم إعداد الخادم الخلفي بنجاح"
    echo ""
}

# دالة تهيئة Frontend
setup_frontend() {
    print_header "🎨 إعداد واجهة المستخدم (Frontend)..."
    
    cd "$PROJECT_DIR" || exit 1
    
    # تثبيت تبعيات npm
    print_status "تثبيت تبعيات npm..."
    npm install
    
    print_success "تم إعداد واجهة المستخدم بنجاح"
    echo ""
}

# دالة تهيئة قاعدة بيانات الوكلاء
init_agent_database() {
    print_header "🗃️ تهيئة قاعدة بيانات الوكلاء..."
    
    cd "$BACKEND_DIR" || exit 1
    source venv/bin/activate
    
    # تشغيل سكريبت تهيئة قاعدة البيانات
    python -c "from agent_database import init_agent_database; init_agent_database()"
    
    print_success "تم تهيئة قاعدة بيانات الوكلاء بنجاح"
    echo ""
}

# دالة تشغيل الخادم الخلفي
start_backend() {
    print_header "🚀 تشغيل الخادم الخلفي..."
    
    cd "$BACKEND_DIR" || exit 1
    source venv/bin/activate
    
    # تشغيل الخادم الخلفي في الخلفية
    python app.py > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    # حفظ PID لاستخدامه لاحقاً عند الإيقاف
    echo $BACKEND_PID > "$BACKEND_DIR/backend.pid"
    
    print_success "تم تشغيل الخادم الخلفي بنجاح (PID: $BACKEND_PID)"
    echo ""
}

# دالة تشغيل واجهة المستخدم
start_frontend() {
    print_header "🌐 تشغيل واجهة المستخدم..."
    
    cd "$PROJECT_DIR" || exit 1
    
    # تشغيل واجهة المستخدم
    npm run dev > backend/logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # حفظ PID لاستخدامه لاحقاً عند الإيقاف
    echo $FRONTEND_PID > "$BACKEND_DIR/frontend.pid"
    
    print_success "تم تشغيل واجهة المستخدم بنجاح (PID: $FRONTEND_PID)"
    echo ""
}

# دالة الانتظار حتى جاهزية الخادم
wait_for_backend() {
    print_status "انتظار حتى يصبح الخادم الخلفي جاهزاً..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:5000/api/health > /dev/null; then
            print_success "الخادم الخلفي جاهز للاستخدام!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 1
    done
    
    print_error "تجاوز الوقت المحدد لانتظار الخادم الخلفي"
    return 1
}

# دالة فتح المتصفح
open_browser() {
    print_header "🌐 فتح المتصفح..."
    
    # انتظار قليلاً قبل فتح المتصفح
    sleep 3
    
    # فتح المتصفح حسب نظام التشغيل
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        open http://localhost:5173/agent-studio
    elif [ "$(uname)" == "Linux" ]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:5173/agent-studio
        else
            print_warning "تعذر فتح المتصفح تلقائياً. يرجى فتح الرابط التالي يدوياً:"
            print_status "http://localhost:5173/agent-studio"
        fi
    else
        # Windows أو أنظمة أخرى
        print_warning "تعذر فتح المتصفح تلقائياً. يرجى فتح الرابط التالي يدوياً:"
        print_status "http://localhost:5173/agent-studio"
    fi
    
    echo ""
}

# دالة عرض تعليمات الاستخدام
show_usage() {
    print_header "📋 استوديو الوكلاء والأدوات المتقدمة - تعليمات الاستخدام"
    echo ""
    echo "الصفحات المتاحة:"
    echo "- استوديو الوكلاء: http://localhost:5173/agent-studio"
    echo "- لوحة القيادة: http://localhost:5173/"
    echo "- رحلة الكتابة الذكية: http://localhost:5173/ai-journey"
    echo "- المدير الفني للرواية: http://localhost:5173/workflow-builder"
    echo ""
    echo "نقاط نهاية API:"
    echo "- الصحة: http://localhost:5000/api/health"
    echo "- الوكلاء: http://localhost:5000/api/agents"
    echo "- الأدوات: http://localhost:5000/api/tools"
    echo "- التعاون: http://localhost:5000/api/agent-collaborations"
    echo ""
    echo "لإيقاف النظام:"
    echo "./stop_agent_studio.sh"
    echo ""
}

# الدالة الرئيسية
main() {
    check_dependencies
    setup_backend
    setup_frontend
    init_agent_database
    start_backend
    wait_for_backend
    start_frontend
    open_browser
    show_usage
    
    print_header "✨ تم تشغيل استوديو الوكلاء والأدوات المتقدمة بنجاح!"
    print_status "يمكنك الآن استخدام النظام من خلال المتصفح"
}

# تنفيذ الدالة الرئيسية
main