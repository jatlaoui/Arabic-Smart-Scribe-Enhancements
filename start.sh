#!/bin/bash

# نظام الكتابة الذكي المتقدم - المشغل الرئيسي
# الإصدار: 3.0 (بنية موحدة ومبسطة)

# --- التكوينات الأساسية ---
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
export APP_ENV="${APP_ENV:-development}"
export RUN_MODE="${RUN_MODE:-uv}" # uv (uvicorn) أو podman

# تحديد مسارات المجلدات الرئيسية (بنية المشروع النظيفة)
# يتم افتراض أن هذا السكريبت موجود في جذر المشروع
export BACKEND_DIR="${SCRIPT_DIR}/arabic-smart-scribe-main/backend"
export FRONTEND_DIR="${SCRIPT_DIR}/arabic-smart-scribe-main"
export REQUIREMENTS_FILE="$BACKEND_DIR/requirements.txt" # مسار ثابت لملف المتطلبات
export VENV_PATH="$BACKEND_DIR/.venv"

# منافذ الخدمات
export FRONTEND_PORT="${FRONTEND_PORT:-5173}"
export BACKEND_PORT="${BACKEND_PORT:-8000}"
export REDIS_PORT="${REDIS_PORT:-6379}"
export NGINX_PORT="${NGINX_PORT:-80}" # لـ Podman

# إعدادات Podman
export PODMAN_PROJECT_NAME="arabic_smart_scribe_project"
export PODMAN_NETWORK_NAME="${PODMAN_PROJECT_NAME}_network"
export PODMAN_DB_VOLUME="${PODMAN_PROJECT_NAME}_db_data"
export PODMAN_REDIS_VOLUME="${PODMAN_PROJECT_NAME}_redis_data"


# ألوان للطباعة
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- دوال مساعدة ---
log() { echo -e "${BLUE}[INFO] $(date '+%Y-%m-%d %H:%M:%S'): $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $(date '+%Y-%m-%d %H:%M:%S'): $1${NC}"; }
error() { echo -e "${RED}[ERROR] $(date '+%Y-%m-%d %H:%M:%S'): $1${NC}" >&2; }

check_command() { command -v "$1" >/dev/null 2>&1; }

ACTIVE_RUN_MODE=""
BACKEND_PID=""
FRONTEND_PID=""
CELERY_PID=""

cleanup() {
    log "بدء عملية التنظيف..."

    if [ -n "$BACKEND_PID" ]; then kill "$BACKEND_PID" 2>/dev/null; log "Backend (PID: $BACKEND_PID) stopped."; fi
    if [ -n "$FRONTEND_PID" ]; then kill "$FRONTEND_PID" 2>/dev/null; log "Frontend (PID: $FRONTEND_PID) stopped."; fi
    if [ -n "$CELERY_PID" ]; then kill "$CELERY_PID" 2>/dev/null; log "Celery (PID: $CELERY_PID) stopped."; fi

    if [ "$ACTIVE_RUN_MODE" == "podman" ]; then
        log "Stopping Podman services for ${PODMAN_PROJECT_NAME}..."
        # Assuming docker-compose.yml is in FRONTEND_DIR as per previous structure
        if [ -f "$FRONTEND_DIR/docker-compose.yml" ]; then
             (cd "$FRONTEND_DIR" && \
             PODMAN_PROJECT_NAME="$PODMAN_PROJECT_NAME" \
             podman-compose -f docker-compose.yml -p "$PODMAN_PROJECT_NAME" down --volumes 2>/dev/null || true)
             log "Podman services for project ${PODMAN_PROJECT_NAME} requested to stop."
        else
            warn "docker-compose.yml not found in $FRONTEND_DIR for Podman cleanup."
        fi
    fi
    log "تم الانتهاء من التنظيف."
}
trap cleanup SIGINT SIGTERM EXIT

# --- التحقق من المتطلبات الأساسية ---
check_requirements() {
    log "التحقق من المتطلبات الأساسية..."
    local missing_reqs=0
    if ! check_command "python3"; then error "Python 3 غير مثبت." && missing_reqs=1; fi
    if ! check_command "pip3"; then error "pip3 غير مثبت." && missing_reqs=1; fi
    if ! check_command "npm"; then warn "npm غير مثبت (مطلوب للواجهة الأمامية)."; fi # Warning for frontend
    if [ "$RUN_MODE" == "uv" ] && ! check_command "uv"; then
        warn "أداة 'uv' غير مثبتة. سيتم استخدام 'pip' كبديل أبطأ."
    fi
    if [ "$RUN_MODE" == "podman" ]; then
      if ! check_command "podman"; then error "Podman is required for 'podman' run mode." && missing_reqs=1; fi
      if ! check_command "podman-compose"; then warn "podman-compose not found. Podman mode might not work as expected."; fi
    fi
    if [ "$missing_reqs" -eq 1 ]; then exit 1; fi
    log "تم التحقق من المتطلبات."
}

# --- إعداد البيئة وملف .env ---
setup_environment() {
    log "إعداد البيئة لـ APP_ENV=${APP_ENV}..."

    if [ ! -d "$BACKEND_DIR" ]; then
        error "مجلد الخلفية '$BACKEND_DIR' غير موجود! تأكد من أن السكريبت يعمل من جذر المشروع الصحيح."
        exit 1
    fi
    if [ ! -d "$FRONTEND_DIR" ]; then
        warn "مجلد الواجهة الأمامية '$FRONTEND_DIR' غير موجود، سيتم تخطي إعداده."
    fi

    # إعداد ملف .env للخلفية
    if [ ! -f "$BACKEND_DIR/.env" ] && [ -f "$BACKEND_DIR/.env.example" ]; then
        log "إنشاء ملف .env للخلفية من $BACKEND_DIR/.env.example..."
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        warn "تم إنشاء ملف .env. يرجى مراجعته وتحديث مفاتيح API والإعدادات الأخرى في $BACKEND_DIR/.env"
    elif [ -f "$BACKEND_DIR/.env" ]; then
        log "ملف .env للخلفية موجود بالفعل."
    else
        warn "ملف $BACKEND_DIR/.env.example غير موجود، لا يمكن إنشاء .env تلقائياً. قد تحتاج لإنشائه يدوياً."
    fi

    # تثبيت متطلبات الواجهة الأمامية (إذا كان المجلد موجودًا)
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        log "تثبيت متطلبات الواجهة الأمامية من '$FRONTEND_DIR'..."
        (cd "$FRONTEND_DIR" && npm install)
        if [ $? -ne 0 ]; then error "فشل تثبيت متطلبات الواجهة الأمامية." && exit 1; fi
    fi
    
    # إعداد البيئة الافتراضية للخلفية وتثبيت المتطلبات
    log "إعداد البيئة الافتراضية للخلفية في '$VENV_PATH'..."
    if [ ! -d "$VENV_PATH" ]; then
        python3 -m venv "$VENV_PATH"
        log "تم إنشاء البيئة الافتراضية."
    fi

    # shellcheck source=/dev/null
    source "$VENV_PATH/bin/activate"
    
    PIP_TOOL="$VENV_PATH/bin/pip" # Use pip from venv
    PYTHON_INTERPRETER_PATH="$VENV_PATH/bin/python"

    if [ "$RUN_MODE" == "uv" ] && check_command "uv"; then # Check RUN_MODE as well for uv
      PIP_TOOL="uv pip"
      log "استخدام 'uv' لتثبيت أسرع لمتطلبات Python."
    fi

    if [ -f "$REQUIREMENTS_FILE" ]; then
        log "تثبيت متطلبات الخلفية من '$REQUIREMENTS_FILE'..."
        if [ "$PIP_TOOL" == "uv pip" ]; then
            $PIP_TOOL install -r "$REQUIREMENTS_FILE" --python "$PYTHON_INTERPRETER_PATH"
        else
            $PIP_TOOL install -r "$REQUIREMENTS_FILE"
        fi
        if [ $? -ne 0 ]; then error "فشل تثبيت متطلبات الخلفية." && exit 1; fi
    else
        error "ملف المتطلبات '$REQUIREMENTS_FILE' غير موجود!"
        exit 1
    fi

    # تشغيل ترحيل قاعدة البيانات (Alembic)
    log "تشغيل ترحيل قاعدة البيانات (Alembic) من '$BACKEND_DIR'..."
    (cd "$BACKEND_DIR" && alembic upgrade head)
    if [ $? -ne 0 ]; then warn "فشل ترحيل قاعدة البيانات. تأكد من أن قاعدة البيانات متاحة ومعدة في .env (داخل $BACKEND_DIR)"; fi

    log "اكتمل إعداد البيئة."
}


# --- طرق التشغيل ---

# الخيار 1: التشغيل باستخدام Podman (وضع الإنتاج المحاكى)
run_podman() {
    log "بدء تشغيل التطبيق باستخدام Podman..."
    ACTIVE_RUN_MODE="podman"
    
    if ! check_command "podman-compose"; then
        error "podman-compose is required for this mode. Please install it (e.g., 'pip3 install podman-compose')."
        exit 1
    fi
    
    # Assuming docker-compose.yml is in FRONTEND_DIR (which is project root in this v3.0 context)
    if [ -f "$FRONTEND_DIR/docker-compose.yml" ]; then
        log "Using docker-compose.yml from $FRONTEND_DIR"
        (cd "$FRONTEND_DIR" && \
         PODMAN_PROJECT_NAME="$PODMAN_PROJECT_NAME" \
         PODMAN_NETWORK_NAME="$PODMAN_NETWORK_NAME" \
         PODMAN_DB_VOLUME="$PODMAN_DB_VOLUME" \
         PODMAN_REDIS_VOLUME="$PODMAN_REDIS_VOLUME" \
         FRONTEND_PORT="$FRONTEND_PORT" \
         BACKEND_PORT="$BACKEND_PORT" \
         NGINX_PORT="$NGINX_PORT" \
         APP_ENV="$APP_ENV" \
         podman-compose -f docker-compose.yml -p "$PODMAN_PROJECT_NAME" up --build --remove-orphans)
    else
        error "docker-compose.yml not found in $FRONTEND_DIR. Cannot start Podman mode."
        exit 1
    fi
    # Cleanup will be triggered by trap
}

# الخيار 2: التشغيل باستخدام UV (وضع التطوير) - الآن مبسط جداً
run_uv() {
    log "بدء تشغيل التطبيق باستخدام UVicorn و Celery (وضع التطوير)..."
    ACTIVE_RUN_MODE="uv"

    if [ ! -d "$BACKEND_DIR" ]; then error "مجلد الخلفية '$BACKEND_DIR' غير موجود!" && exit 1; fi
    
    log "تنشيط البيئة الافتراضية من $VENV_PATH..."
    # shellcheck source=/dev/null
    source "$VENV_PATH/bin/activate"

    log "بدء خادم Uvicorn للخلفية على المنفذ $BACKEND_PORT..."
    (cd "$BACKEND_DIR" && uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT") &
    BACKEND_PID=$!
    log "Backend PID: $BACKEND_PID"
    
    sleep 3

    log "بدء عامل Celery..."
    (cd "$BACKEND_DIR" && celery -A app.celery_worker:celery_app worker --loglevel=info) &
    CELERY_PID=$!
    log "Celery PID: $CELERY_PID"

    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        log "بدء خادم تطوير الواجهة الأمامية على المنفذ $FRONTEND_PORT..."
        (cd "$FRONTEND_DIR" && npm run dev -- --port "$FRONTEND_PORT") &
        FRONTEND_PID=$!
        log "Frontend PID: $FRONTEND_PID"
    else
        warn "لم يتم بدء الواجهة الأمامية، المجلد '$FRONTEND_DIR' أو 'package.json' غير موجود."
    fi
    
    log "${GREEN}التطبيق يعمل الآن!${NC}"
    log "الخلفية (API): http://localhost:${BACKEND_PORT}"
    if [ -n "$FRONTEND_PID" ]; then log "الواجهة الأمامية: http://localhost:${FRONTEND_PORT}"; fi
    log "اضغط Ctrl+C لإنهاء جميع العمليات."
    
    wait # انتظر حتى يتم إيقاف العمليات يدويًا (Ctrl+C)
}

# --- منطق التشغيل الرئيسي ---
main() {
    log "=== المشغل الرئيسي لنظام الكتابة الذكي المتقدم (الإصدار 3.0) ==="

    # Parse command-line arguments
    if [[ "$#" -gt 0 ]]; then
        case $1 in
            --podman) RUN_MODE="podman" ;;
            --uv) RUN_MODE="uv" ;;
            --cleanup) cleanup; exit 0 ;;
            -h|--help)
                echo "Usage: $0 [--uv | --podman | --cleanup | --help]"
                echo "Options:"
                echo "  --uv          Run in development mode using Uvicorn and Vite (default)."
                echo "  --podman      Run in production-like mode using Podman."
                echo "  --cleanup     Stop services and clean up resources."
                echo "  -h, --help    Show this help message."
                exit 0
                ;;
            *) error "خيار غير معروف: $1"; exit 1 ;;
        esac
    fi
    log "نمط التشغيل المحدد: $RUN_MODE"

    check_requirements
    setup_environment

    if [ "$RUN_MODE" == "podman" ]; then
        run_podman
    elif [ "$RUN_MODE" == "uv" ]; then
        run_uv
    else
        error "نمط تشغيل داخلي غير صالح: '$RUN_MODE'." # Should not happen if arg parsing is correct
        exit 1
    fi
    log "انتهى عمل المشغل."
}

main "$@"
exit 0
