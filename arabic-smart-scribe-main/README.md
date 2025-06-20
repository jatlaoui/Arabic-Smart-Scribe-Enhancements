
# الشاهد الاحترافي 2.5 - نظام الكتابة الذكية المتكامل

## نظرة عامة

الشاهد الاحترافي 2.5 هو نظام كتابة ذكي متكامل يجمع بين قوة الذكاء الاصطناعي وأدوات التحرير المتقدمة لتوفير تجربة كتابة احترافية فريدة. يدعم النظام تحويل الفيديوهات إلى كتب، الكتابة الذكية، وأدوات التحرير المتقدمة مع دعم كامل لأسلوب الجطلاوي.

## المميزات الرئيسية

### 🎯 أدوات التحرير الذكية
- **إعادة الصياغة المتقدمة**: مبسطة، رسمية، إبداعية
- **تطبيق أسلوب الجطلاوي**: تحويل النصوص إلى أسلوب شاعري فلسفي
- **الإطالة الذكية**: إضافة أمثلة وتفاصيل حسية
- **التحسين**: تحسين الوضوح، التدقيق النحوي، تحسين التدفق

### 📚 محول الفيديو إلى كتاب
- تحليل فيديوهات YouTube
- استخراج النص التلقائي
- توليد مخططات شاملة
- كتابة فصول مفصلة

### 🎨 مركز التحكم في الأسلوب
- ضبط ملف الأسلوب الشخصي
- عدسة الجطلاوي المتقدمة
- تخصيص مستويات الرسمية والإبداع
- حفظ واستيراد ملفات الأسلوب

### 📁 إدارة المشاريع المتقدمة
- إنشاء وإدارة مشاريع متعددة
- تتبع التقدم والإحصائيات
- نظام علامات وتصنيف
- مشاركة وتصدير المشاريع

## متطلبات النظام

### الواجهة الخلفية (Backend)
- Python 3.11+
- FastAPI
- Google Gemini API Key
- متطلبات إضافية في `backend/requirements.txt`

### الواجهة الأمامية (Frontend)
- Node.js 18+
- React 18
- TypeScript
- Vite

## طريقة التثبيت

### التثبيت السريع باستخدام Docker

1. **استنساخ المشروع**:
```bash
git clone <repository-url>
cd al-shahid-professional
```

2. **إعداد متغيرات البيئة**:
```bash
cp backend/.env.example backend/.env
# قم بتحرير .env وإضافة مفتاح Google Gemini API
```

3. **تشغيل النظام**:
```bash
docker-compose up -d
```

4. **فتح التطبيق**:
- الواجهة الأمامية: http://localhost:3000
- API الخلفي: http://localhost:8000

### التثبيت اليدوي

#### 1. إعداد الواجهة الخلفية

```bash
cd backend
python -m venv venv
source venv/bin/activate  # أو venv\Scripts\activate على Windows
pip install -r requirements.txt

# إعداد متغيرات البيئة
cp .env.example .env
# قم بتحرير .env وإضافة المفاتيح المطلوبة

# تشغيل الخادم
uvicorn main:app --reload
```

#### 2. إعداد الواجهة الأمامية

```bash
# في مجلد المشروع الرئيسي
npm install
npm run dev
```

## الإعدادات المطلوبة

### متغيرات البيئة

قم بإنشاء ملف `.env` في مجلد `backend` مع المتغيرات التالية:

```env
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./al_shahid.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=True
```

### إعداد Google Gemini API

1. اذهب إلى [Google AI Studio](https://makersuite.google.com/app/apikey)
2. أنشئ مفتاح API جديد
3. أضف المفتاح إلى ملف `.env` كـ `GEMINI_API_KEY`
4. تأكد من تفعيل خدمة Gemini API في حسابك

## دليل الاستخدام

### البدء السريع

1. **إنشاء مشروع جديد**:
   - انقر على "مشروع جديد" في لوحة التحكم
   - اختر نوع المشروع (كتابة ذكية أو فيديو إلى كتاب)

2. **استخدام أدوات التحرير الذكية**:
   - حدد أي نص في المحرر
   - ستظهر أدوات التحرير تلقائياً
   - اختر الأداة المناسبة وانتظر النتيجة

3. **تطبيق أسلوب الجطلاوي**:
   - اذهب إلى "مركز التحكم في الأسلوب"
   - فعل "عدسة الجطلاوي"
   - اضبط المستويات حسب تفضيلك

### أدوات التحرير المتاحة

| الأداة | الوصف | الاستخدام |
|--------|--------|---------|
| إعادة صياغة مبسطة | تبسيط النص مع الحفاظ على المعنى | للنصوص المعقدة |
| إعادة صياغة رسمية | تحويل إلى أسلوب أكاديمي | للكتابات الرسمية |
| أسلوب الجطلاوي | تحويل شاعري فلسفي | للنصوص الأدبية |
| إطالة بالأمثلة | إضافة أمثلة توضيحية | لتوضيح المفاهيم |
| تحسين الوضوح | جعل النص أوضح | للنصوص الغامضة |
| التدقيق النحوي | تصحيح الأخطاء | للمراجعة النهائية |

## API Documentation

### نقاط النهاية الرئيسية

- `GET /api/editing-tools` - جلب أدوات التحرير
- `POST /api/edit-text` - تحرير النص
- `POST /api/analyze-video` - تحليل فيديو
- `GET /api/projects` - جلب المشاريع
- `POST /api/projects` - إنشاء مشروع جديد

### مثال على استخدام API

```javascript
// تحرير نص
const response = await fetch('/api/edit-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'النص المراد تحريره',
    tool_type: 'improve'
  })
});

const result = await response.json();
console.log(result.edited_text);
```

## التطوير والمساهمة

### هيكل المشروع

```
al-shahid-professional/
├── backend/                 # FastAPI backend
│   ├── main.py             # نقطة الدخول الرئيسية
│   ├── requirements.txt    # متطلبات Python
│   └── .env.example       # مثال على متغيرات البيئة
├── src/                    # React frontend
│   ├── components/         # مكونات React
│   ├── lib/               # مكتبات مساعدة
│   └── hooks/             # React hooks
├── Dockerfile             # إعداد Docker
├── docker-compose.yml     # تكوين Docker Compose
└── README.md             # هذا الملف
```

### إضافة أدوات تحرير جديدة

1. أضف نوع الأداة الجديد في `backend/services/gemini_service.py`
2. أضف منطق التحرير في دالة `edit_text`
3. أضف الأداة إلى قائمة `get_editing_tools`
4. اختبر الأداة الجديدة

### تشغيل الاختبارات

```bash
# اختبارات الواجهة الخلفية
cd backend
pytest

# اختبارات الواجهة الأمامية
npm test
```

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال بـ API**:
   - تأكد من تشغيل الخادم الخلفي
   - تحقق من إعدادات CORS

2. **عدم عمل أدوات التحرير**:
   - تأكد من صحة مفتاح Gemini API
   - تحقق من حدود الاستخدام في حسابك

3. **مشاكل في الأداء**:
   - راقب استخدام الذاكرة
   - تحقق من سرعة الاتصال بالإنترنت

### السجلات والتشخيص

```bash
# عرض سجلات Docker
docker-compose logs -f

# عرض سجلات التطبيق
tail -f backend/app.log
```

## النشر في الإنتاج

### استخدام Docker

```bash
# بناء الصورة
docker build -t al-shahid-professional .

# تشغيل الحاوية
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key al-shahid-professional
```

### ملاحظات مهمة للإنتاج

- **قاعدة البيانات**: SQLite مناسب للتطوير، لكن للإنتاج يُنصح باستخدام PostgreSQL
- **المتغيرات**: تأكد من أن جميع متغيرات البيئة محددة بشكل صحيح
- **الأمان**: استخدم HTTPS وحماية مفاتيح API

### النشر على خدمات السحابة

يدعم النظام النشر على:
- AWS (ECS, EC2)
- Google Cloud Platform
- DigitalOcean
- Heroku

## الأمان

- استخدم HTTPS في الإنتاج
- احم مفاتيح API بعناية
- فعل مصادقة المستخدمين للاستخدام العام
- راقب استخدام API لتجنب التكاليف الزائدة

## الدعم والمجتمع

- [الوثائق الكاملة](docs/)
- [تقارير الأخطاء](issues/)
- [طلبات الميزات](features/)

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الشكر والتقدير

- فريق Google للذكاء الاصطناعي لتوفير نماذج Gemini المتقدمة
- مجتمع React وFastAPI
- جميع المساهمين في المشروع

---

**ملاحظة**: هذا النظام يتطلب مفتاح API صالح من Google Gemini للعمل بكامل إمكانياته. تأكد من مراجعة أسعار Google AI قبل الاستخدام المكثف.
