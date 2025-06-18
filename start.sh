#!/bin/bash

# نظام الكتابة الذكي المتقدم - المشغل الرئيسي
# الإصدار: 4.0 (معالجة ذكية لخدمة Docker/Podman)

# --- التكوينات الأساسية ---
SCRIPT_DIR_REAL=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# يتم افتراض أن هذا السكريبت موجود في جذر المشروع
# وأن مجلدات backend و frontend هي مجلدات فرعية مباشرة
export BACKEND_DIR="${SCRIPT_DIR_REAL}/arabic-smart-scribe-main/backend"
export FRONTEND_DIR="${SCRIPT_DIR_REAL}/arabic-smart-scribe-main"

export REQUIREMENTS_FILE_PATTERN="requirements*.txt" # نمط للبحث عن ملف المتطلبات
export VENV_DIR=".venv" # اسم مجلد البيئة الافتراضية داخل مجلد الخلفية
export VENV_PATH="$BACKEND_DIR/$VENV_DIR"

export APP_ENV="${APP_ENV:-development}"
# Default RUN_MODE is now interactive choice, but can be overridden for non-interactive use
export RUN_MODE="${RUN_MODE}"

# منافذ الخدمات
export FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export BACKEND_PORT="${BACKEND_PORT:-8000}"
export NGINX_PORT="${NGINX_PORT:-80}" # لـ Podman (إذا كنت تستخدم Nginx)

# إعدادات Docker/Podman Compose
export DOCKER_COMPOSE_FILE="docker-compose.yml" # Standard name for compose file
# PODMAN_PROJECT_NAME is used by podman-compose -p flag, define it if needed
export PODMAN_PROJECT_NAME="arabic_smart_scribe_dc"


# --- دوال مساعدة (جديدة للإصدار 3.0, مستمرة في 4.0) ---
NC='\033[0m' # No Color
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE_BOLD='\033[1;34m'

print_header() { echo -e "\n${BLUE_BOLD}=== $1 ===${NC}"; }
print_success() { echo -e "${GREEN}[SUCCESS] $1${NC}"; }
print_warning() { echo -e "${YELLOW}[WARNING] $1${NC}"; }
print_error() { echo -e "${RED}[ERROR] $1${NC}" >&2; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

# --- متغيرات لتتبع العمليات ---
BACKEND_PID=""
FRONTEND_PID=""
CELERY_PID=""
ACTIVE_RUN_MODE=""

cleanup() {
    print_header "بدء عملية التنظيف عند الخروج"

    # UV Mode Cleanup
    if [ "$ACTIVE_RUN_MODE" == "uv" ]; then
        if [ -n "$BACKEND_PID" ]; then
            kill "$BACKEND_PID" 2>/dev/null
            print_success "تم إيقاف خادم الخلفية (PID: $BACKEND_PID)."
        fi
        if [ -n "$FRONTEND_PID" ]; then
            kill "$FRONTEND_PID" 2>/dev/null
            print_success "تم إيقاف خادم الواجهة الأمامية (PID: $FRONTEND_PID)."
        fi
        if [ -n "$CELERY_PID" ]; then
            kill "$CELERY_PID" 2>/dev/null
            print_success "تم إيقاف عامل Celery (PID: $CELERY_PID)."
        fi
    fi

    # Container Mode Cleanup (Docker/Podman)
    # This will be triggered when the script exits, even if 'up -d' was used.
    # For detached mode, user might want to stop containers manually.
    # This cleanup stops containers started by this script's 'up' command if not detached.
    # If 'up -d' is used, this trap might run immediately after, which is not ideal.
    # The user's v4.0 runs 'up -d', so this cleanup for container mode might need refinement
    # or be invoked via a specific --cleanup flag for detached services.
    # For now, it attempts to run 'down' if it was started in foreground by this script.
    # If 'up -d' is used, 'down' should ideally be a separate command/script.
    if [ "$ACTIVE_RUN_MODE" == "container_foreground" ]; then # Only if not detached
        print_warning "محاولة إيقاف خدمات الحاويات (إذا كانت تعمل في المقدمة)..."
        local COMPOSE_CMD_CLEANUP=""
        local FINAL_DOCKER_COMPOSE_PATH_CLEANUP=""

        if command_exists docker-compose; then COMPOSE_CMD_CLEANUP="docker-compose";
        elif command_exists docker compose; then COMPOSE_CMD_CLEANUP="docker compose";
        elif command_exists podman-compose; then COMPOSE_CMD_CLEANUP="podman-compose"; fi

        if [ -f "$FRONTEND_DIR/$DOCKER_COMPOSE_FILE" ]; then FINAL_DOCKER_COMPOSE_PATH_CLEANUP="$FRONTEND_DIR/$DOCKER_COMPOSE_FILE"; cd "$FRONTEND_DIR" || exit;
        elif [ -f "$SCRIPT_DIR_REAL/$DOCKER_COMPOSE_FILE" ]; then FINAL_DOCKER_COMPOSE_PATH_CLEANUP="$SCRIPT_DIR_REAL/$DOCKER_COMPOSE_FILE"; cd "$SCRIPT_DIR_REAL" || exit; fi

        if [ -n "$COMPOSE_CMD_CLEANUP" ] && [ -n "$FINAL_DOCKER_COMPOSE_PATH_CLEANUP" ]; then
            sudo "$COMPOSE_CMD_CLEANUP" -f "$FINAL_DOCKER_COMPOSE_PATH_CLEANUP" -p "$PODMAN_PROJECT_NAME" down --volumes 2>/dev/null
            print_success "تم طلب إيقاف خدمات الحاويات للمشروع ${PODMAN_PROJECT_NAME}."
        fi
    elif [ "$ACTIVE_RUN_MODE" == "container_detached" ]; then
        print_warning "الخدمات تعمل في وضع منفصل (detached). لإيقافها استخدم:"
        print_warning "  sudo <docker-compose/podman-compose> -f <path_to_compose_file> -p $PODMAN_PROJECT_NAME down"
    fi
    print_success "اكتملت عملية التنظيف."
}
trap cleanup SIGINT SIGTERM EXIT


# --- التحقق من المتطلبات الأساسية ---
check_requirements() {
    print_header "التحقق من المتطلبات الأساسية"
    local critical_error=0
    if ! command_exists "python3"; then print_error "Python 3 غير مثبت." && critical_error=1; fi
    if ! command_exists "pip3"; then print_error "pip3 غير مثبت." && critical_error=1; fi
    if ! command_exists "npm"; then print_warning "npm غير مثبت (مطلوب للواجهة الأمامية إذا كانت ستُستخدم)."; fi

    if [[ "$RUN_MODE" == "uv" || -z "$RUN_MODE" ]]; then # Default to UV if RUN_MODE is empty
        if ! command_exists "uv"; then print_warning "أداة 'uv' غير مثبتة. سيتم استخدام 'pip' كبديل أبطأ."; fi
        if ! command_exists "redis-server"; then print_warning "Redis server غير مثبت محلياً. قد لا تعمل مهام Celery بشكل صحيح بدون Redis."; fi
    fi
    if [ "$critical_error" -eq 1 ]; then print_error "بعض المتطلبات الحرجة مفقودة. يرجى تثبيتها والمحاولة مرة أخرى." && exit 1; fi
    print_success "تم التحقق من المتطلبات."
}

# --- إعداد البيئة وملف .env ---
setup_environment() {
    print_header "إعداد البيئة لـ APP_ENV=${APP_ENV}"

    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "مجلد الخلفية '$BACKEND_DIR' غير موجود! تأكد من أن السكريبت يعمل من جذر المشروع الصحيح وأن المجلدات بالأسماء المتوقعة (backend, frontend)."
        exit 1
    fi
    print_success "تم العثور على مجلد الخلفية: $BACKEND_DIR"

    if [ -d "$FRONTEND_DIR" ]; then
        print_success "تم العثور على مجلد الواجهة الأمامية: $FRONTEND_DIR"
    else
        print_warning "مجلد الواجهة الأمامية '$FRONTEND_DIR' غير موجود، سيتم تخطي إعداد الواجهة الأمامية."
    fi

    if [ ! -f "$BACKEND_DIR/.env" ] && [ -f "$BACKEND_DIR/.env.example" ]; then
        print_warning "إنشاء ملف .env للخلفية من $BACKEND_DIR/.env.example..."
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        print_warning "تم إنشاء ملف .env. يرجى مراجعته وتحديث مفاتيح API والإعدادات الأخرى في $BACKEND_DIR/.env"
    elif [ -f "$BACKEND_DIR/.env" ]; then
        print_success "ملف .env للخلفية موجود بالفعل."
    else
        print_warning "ملف $BACKEND_DIR/.env.example غير موجود، لا يمكن إنشاء .env تلقائياً. سيعتمد التطبيق على القيم الافتراضية أو متغيرات البيئة."
    fi

    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        print_header "تثبيت متطلبات الواجهة الأمامية من '$FRONTEND_DIR'"
        (cd "$FRONTEND_DIR" && npm install)
        if [ $? -ne 0 ]; then print_error "فشل تثبيت متطلبات الواجهة الأمامية." && exit 1; fi
        print_success "تم تثبيت متطلبات الواجهة الأمامية."
    fi

    print_header "إعداد البيئة الافتراضية للخلفية في '$VENV_PATH'"
    if [ ! -d "$VENV_PATH" ]; then
        python3 -m venv "$VENV_PATH"
        print_success "تم إنشاء البيئة الافتراضية."
    else
        print_success "البيئة الافتراضية موجودة بالفعل."
    fi

    # shellcheck source=/dev/null
    source "$VENV_PATH/bin/activate"
    print_success "تم تنشيط البيئة الافتراضية."
    
    PIP_TOOL="$VENV_PATH/bin/pip"
    PYTHON_INTERPRETER_PATH="$VENV_PATH/bin/python"

    if [[ "$RUN_MODE" == "uv" || -z "$RUN_MODE" ]]; then
        if command_exists "uv"; then
            PIP_TOOL="uv pip"
            print_success "استخدام 'uv' لتثبيت أسرع لمتطلبات Python."
        else
            print_warning "'uv' غير موجود أو لم يتم اختياره, سيتم استخدام 'pip'."
        fi
    fi

    print_header "البحث عن ملف المتطلبات '$REQUIREMENTS_FILE_PATTERN' في '$BACKEND_DIR' وضمن مجلداته الفرعية"
    REQUIREMENTS_FILE_FOUND=$(find "$BACKEND_DIR" -maxdepth 2 -type f -name "$REQUIREMENTS_FILE_PATTERN" -print -quit)

    if [ -z "$REQUIREMENTS_FILE_FOUND" ]; then
        print_error "لم يتم العثور على ملف '$REQUIREMENTS_FILE_PATTERN' في '$BACKEND_DIR' أو مجلداته الفرعية المباشرة."
        exit 1
    else
        print_success "تم العثور على ملف المتطلبات: $REQUIREMENTS_FILE_FOUND"
        REQUIREMENTS_FILE="$REQUIREMENTS_FILE_FOUND"
    fi

    print_header "تثبيت متطلبات الخلفية من '$REQUIREMENTS_FILE'"
    if [ "$PIP_TOOL" == "uv pip" ]; then
        $PIP_TOOL install -r "$REQUIREMENTS_FILE" --python "$PYTHON_INTERPRETER_PATH"
    else
        $PIP_TOOL install -r "$REQUIREMENTS_FILE"
    fi
    if [ $? -ne 0 ]; then print_error "فشل تثبيت متطلبات الخلفية." && exit 1; fi
    print_success "تم تثبيت متطلبات الخلفية."

    if [ "$APP_ENV" == "development" ]; then
        DEV_REQUIREMENTS_FILE="$BACKEND_DIR/requirements.dev.txt"
        if [ -f "$DEV_REQUIREMENTS_FILE" ]; then
            print_header "تثبيت متطلبات التطوير من '$DEV_REQUIREMENTS_FILE'"
            if [ "$PIP_TOOL" == "uv pip" ]; then
                $PIP_TOOL install -r "$DEV_REQUIREMENTS_FILE" --python "$PYTHON_INTERPRETER_PATH"
            else
                $PIP_TOOL install -r "$DEV_REQUIREMENTS_FILE"
            fi
            if [ $? -ne 0 ]; then print_warning "فشل تثبيت متطلبات التطوير."; else print_success "تم تثبيت متطلبات التطوير."; fi
        else
            print_warning "ملف متطلبات التطوير '$DEV_REQUIREMENTS_FILE' غير موجود، تم التخطي."
        fi
    fi

    print_header "تشغيل ترحيل قاعدة البيانات (Alembic) من '$BACKEND_DIR'"
    (cd "$BACKEND_DIR" && alembic upgrade head)
    if [ $? -ne 0 ]; then print_warning "فشل ترحيل قاعدة البيانات."; else print_success "اكتمل ترحيل قاعدة البيانات."; fi

    print_success "اكتمل إعداد البيئة بشكل كامل."
}

# --- طرق التشغيل ---

# الخيار 1: التشغيل باستخدام Docker أو Podman (v4.0 logic)
run_container_engine() {
    print_header "محاولة التشغيل باستخدام Docker/Podman"
    local CONTAINER_ENGINE=""
    local COMPOSE_CMD=""

    if command_exists docker; then
        CONTAINER_ENGINE="docker"
        if command_exists docker-compose; then
            COMPOSE_CMD="docker-compose"
        elif command_exists docker compose; then # Check for Docker Compose V2
            COMPOSE_CMD="docker compose"
        else
            print_error "docker-compose (v1 or v2) غير موجود. يرجى تثبيته."
            return 1
        fi
    elif command_exists podman; then
        CONTAINER_ENGINE="podman"
        if command_exists podman-compose; then
            COMPOSE_CMD="podman-compose"
        else
            print_error "podman-compose غير موجود. يرجى تثبيته لتشغيل هذا الوضع."
            return 1
        fi
    else
        print_error "لم يتم العثور على Docker أو Podman. يرجى تثبيت أحدهما."
        return 1
    fi
    print_success "تم تحديد محرك الحاويات: $CONTAINER_ENGINE"
    print_success "أمر Compose المحدد: $COMPOSE_CMD"

    # التحقق من أن خدمة الحاويات تعمل
    if ! sudo "$CONTAINER_ENGINE" ps > /dev/null 2>&1; then
        print_warning "خدمة $CONTAINER_ENGINE لا تعمل. جاري محاولة التشغيل..."
        if command_exists systemctl; then
            sudo systemctl start "$CONTAINER_ENGINE"
            sleep 5
            if ! sudo "$CONTAINER_ENGINE" ps > /dev/null 2>&1; then
                print_error "فشل بدء خدمة $CONTAINER_ENGINE. يرجى التحقق من التالي:"
                print_error "1. هل لديك صلاحيات sudo؟"
                print_error "2. هل الخدمة مثبتة بشكل صحيح؟ (sudo systemctl status $CONTAINER_ENGINE)"
                print_error "3. إذا كنت تستخدم Docker، هل المستخدم الحالي ضمن مجموعة 'docker'؟ (sudo usermod -aG docker \$USER). قد تحتاج لإعادة تسجيل الدخول."
                return 1
            fi
            print_success "تم بدء خدمة $CONTAINER_ENGINE بنجاح."
        else
            print_error "systemctl غير موجود. لا يمكن بدء خدمة $CONTAINER_ENGINE تلقائياً. يرجى تشغيلها يدوياً."
            return 1
        fi
    else
        print_success "خدمة $CONTAINER_ENGINE تعمل بالفعل."
    fi
    
    # Determine path for docker-compose.yml (assuming it's in FRONTEND_DIR which is project root)
    FINAL_DOCKER_COMPOSE_PATH="$FRONTEND_DIR/$DOCKER_COMPOSE_FILE"
    if [ ! -f "$FINAL_DOCKER_COMPOSE_PATH" ]; then
        print_error "ملف '$DOCKER_COMPOSE_FILE' غير موجود في المسار المتوقع: '$FINAL_DOCKER_COMPOSE_PATH'."
        return 1
    fi
    
    print_success "استخدام $FINAL_DOCKER_COMPOSE_PATH"
    print_header "بناء وتشغيل الخدمات باستخدام $COMPOSE_CMD... (قد يتطلب صلاحيات sudo)"

    export APP_ENV FRONTEND_PORT BACKEND_DIR FRONTEND_DIR NGINX_PORT

    # Change to directory containing docker-compose.yml
    (cd "$FRONTEND_DIR" && sudo "$COMPOSE_CMD" -f "$DOCKER_COMPOSE_FILE" -p "$PODMAN_PROJECT_NAME" up --build -d)
    if [ $? -ne 0 ]; then
        print_error "فشل $COMPOSE_CMD في بناء أو تشغيل الحاويات."
        print_error "حاول تشغيل الأمر يدويًا لمزيد من التفاصيل: cd $FRONTEND_DIR && sudo $COMPOSE_CMD -f $DOCKER_COMPOSE_FILE -p $PODMAN_PROJECT_NAME up --build"
        return 1
    fi

    ACTIVE_RUN_MODE="container_detached" # For cleanup info
    print_success "تم بدء الخدمات في الخلفية باستخدام $COMPOSE_CMD."
    print_success "الوصول إلى التطبيق (عبر Nginx إذا كان متاحاً): http://localhost:$NGINX_PORT"
    print_warning "لمتابعة سجلات الحاويات: sudo $COMPOSE_CMD -f $FINAL_DOCKER_COMPOSE_PATH -p $PODMAN_PROJECT_NAME logs -f"
    print_warning "لإيقاف الخدمات: sudo $COMPOSE_CMD -f $FINAL_DOCKER_COMPOSE_PATH -p $PODMAN_PROJECT_NAME down"
}


# الخيار 2: التشغيل باستخدام UV (وضع التطوير) - (v3.0 logic - user confirmed this is fine)
run_uv() {
    print_header "بدء تشغيل التطبيق باستخدام UVicorn و Celery (وضع التطوير)"
    ACTIVE_RUN_MODE="uv"

    if [ ! -d "$BACKEND_DIR" ]; then print_error "مجلد الخلفية '$BACKEND_DIR' غير موجود!" && exit 1; fi

    print_success "تنشيط البيئة الافتراضية من $VENV_PATH..."
    # shellcheck source=/dev/null
    source "$VENV_PATH/bin/activate"

    print_header "البحث عن main.py لتحديد مسار تطبيق Uvicorn..."
    MAIN_APP_PATH=$(find "$BACKEND_DIR" -path "$VENV_PATH" -prune -o -name "main.py" -type f -print -quit)

    if [ -z "$MAIN_APP_PATH" ]; then
        print_error "'main.py' not found within '$BACKEND_DIR' (باستثناء '$VENV_PATH'). لا يمكن تحديد مسار تطبيق Uvicorn."
        exit 1
    else
        print_success "تم العثور على main.py في: $MAIN_APP_PATH"
    fi

    RELATIVE_MAIN_APP_PATH=${MAIN_APP_PATH#$BACKEND_DIR/}
    RELATIVE_MAIN_APP_PATH=${RELATIVE_MAIN_APP_PATH#/}
    UVICORN_MODULE_PATH=${RELATIVE_MAIN_APP_PATH%.py}
    UVICORN_APP_PATH=$(echo "$UVICORN_MODULE_PATH" | tr '/' '.')":app"
    print_success "مسار تطبيق Uvicorn المُنشأ: $UVICORN_APP_PATH"

    print_header "بدء خادم Uvicorn للخلفية على المنفذ $BACKEND_PORT..."
    (cd "$BACKEND_DIR" && uvicorn "$UVICORN_APP_PATH" --reload --host 0.0.0.0 --port "$BACKEND_PORT") &
    BACKEND_PID=$!
    print_success "خادم الخلفية يعمل. PID: $BACKEND_PID"

    sleep 3

    print_header "بدء عامل Celery..."
    (cd "$BACKEND_DIR" && celery -A app.celery_worker:celery_app worker --loglevel=INFO) &
    CELERY_PID=$!
    print_success "عامل Celery يعمل. PID: $CELERY_PID"

    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        print_header "بدء خادم تطوير الواجهة الأمامية على المنفذ $FRONTEND_PORT..."
        (cd "$FRONTEND_DIR" && npm run dev -- --port "$FRONTEND_PORT") &
        FRONTEND_PID=$!
        print_success "خادم الواجهة الأمامية يعمل. PID: $FRONTEND_PID"
    else
        print_warning "لم يتم بدء الواجهة الأمامية، المجلد '$FRONTEND_DIR' أو 'package.json' غير موجود."
    fi

    print_success "${GREEN}التطبيق يعمل الآن!${NC}"
    print_success "الخلفية (API): http://localhost:${BACKEND_PORT}"
    if [ -n "$FRONTEND_PID" ]; then print_success "الواجهة الأمامية: http://localhost:${FRONTEND_PORT}"; fi
    print_warning "اضغط Ctrl+C لإنهاء جميع العمليات."

    wait
}

# --- منطق التشغيل الرئيسي ---
main() {
    print_header "المشغل الرئيسي لنظام الكتابة الذكي المتقدم (الإصدار 4.0)"

    # Determine run mode if passed as argument, otherwise prompt
    if [ -n "$1" ]; then
        case $1 in
            --uv) RUN_MODE="uv" ;;
            --podman) RUN_MODE="container" ;;
            --cleanup)
                print_warning "سيتم محاولة تنظيف الموارد. قد تحتاج لتحديد RUN_MODE للوضع الذي تم تشغيله."
                # Attempt to determine last run mode if possible, or ask
                # For now, this will only clean PIDs if they were set by current script instance
                # Podman 'down' needs to be more explicit or based on project name
                cleanup
                exit 0 ;;
            -h|--help)
                echo "Usage: $0 [--uv | --podman | --cleanup | --help]"
                echo "Options:"
                echo "  --uv          Run in development mode using Uvicorn and Vite (default if no arg)."
                echo "  --podman      Run in production-like mode using Docker/Podman."
                echo "  --cleanup     Attempt to stop running services and clean up resources."
                echo "  -h, --help    Show this help message."
                exit 0
                ;;
            *) print_error "خيار غير معروف: $1"; exit 1 ;;
        esac
    else
        # Interactive choice if no argument
        echo "الرجاء اختيار طريقة التشغيل:"
        echo "  1) Docker / Podman (محاكاة للإنتاج، يتطلب Docker أو Podman و docker-compose/podman-compose)"
        echo "  2) UV / Python (وضع التطوير، يتطلب Python, Node.js, Redis)"
        read -rp "ادخل اختيارك (1 أو 2، الافتراضي هو 2 إذا تركت فارغاً): " choice
        case $choice in
            1) RUN_MODE="container" ;;
            2|"") RUN_MODE="uv" ;; # Default to UV if empty
            *) print_error "اختيار غير صالح." && exit 1 ;;
        esac
    fi
    print_success "نمط التشغيل المحدد: $RUN_MODE"

    check_requirements
    setup_environment

    if [ "$RUN_MODE" == "container" ]; then
        run_container_engine
        if [ $? -ne 0 ]; then
            print_error "فشل تشغيل وضع الحاويات. يرجى مراجعة الأخطاء."
            exit 1
        fi
    elif [ "$RUN_MODE" == "uv" ]; then
        run_uv
    else
        print_error "نمط تشغيل داخلي غير صالح: '$RUN_MODE'."
        exit 1
    fi
    print_header "انتهى عمل المشغل."
}

main "$@"
exit 0
