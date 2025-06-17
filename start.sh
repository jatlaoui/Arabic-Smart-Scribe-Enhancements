

# إضافات للتفعيل النهائي
configure_final_integration() {
    log "🔗 تكوين التكامل النهائي..."
    
    # إنشاء شبكة Docker إذا لم تكن موجودة
    docker network create scribe_network 2>/dev/null || true
    
    # تأكد من أن جميع الخدمات متصلة
    docker-compose ps | grep "Up" && info "✅ جميع الخدمات تعمل" || warning "⚠️ بعض الخدمات قد لا تعمل"
    
    # اختبار الاتصال بين الخدمات
    test_service_connectivity
    
    info "✅ تم تكوين التكامل النهائي"
}

test_service_connectivity() {
    log "🔍 اختبار الاتصال بين الخدمات..."
    
    # اختبار FastAPI
    curl -s http://localhost:8000/health > /dev/null && info "✅ FastAPI متصل" || warning "⚠️ FastAPI غير متاح"
    
    # اختبار Flask Agent Studio
    curl -s http://localhost:5000/health > /dev/null && info "✅ Agent Studio متصل" || warning "⚠️ Agent Studio غير متاح"
    
    # اختبار Frontend
    curl -s http://localhost:3000 > /dev/null && info "✅ Frontend متصل" || warning "⚠️ Frontend غير متاح"
    
    # اختبار Nginx
    curl -s http://localhost/health > /dev/null && info "✅ Nginx متصل" || warning "⚠️ Nginx غير متاح"
}

# تشغيل التكوين النهائي
configure_final_integration
