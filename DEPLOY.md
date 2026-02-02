# نشر تطبيق الواجهة (Frontend) على Linux VPS

تطبيق React/Vite — يُبنى ثم يُقدّم كملفات ثابتة عبر Nginx.

## المتطلبات على السيرفر

- **Node.js** (إصدار 18 أو أحدث) و **npm**
- **Nginx** (لخدمة الملفات الثابتة)

---

## 1. تثبيت Node.js و Nginx (Ubuntu/Debian)

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx
sudo apt-get update
sudo apt-get install -y nginx
```

---

## 2. رفع المشروع إلى السيرفر

من جهازك المحلي (استبدل `user@your-vps-ip` بعنوان السيرفر والمستخدم):

```bash
cd /path/to/point-digital-marketing-manager-4
rsync -avz --exclude node_modules --exclude dist . user@your-vps-ip:/var/www/pm4-frontend/
```

أو استخدم `git clone` إذا كان المشروع على Git:

```bash
sudo mkdir -p /var/www/pm4-frontend
sudo chown $USER:$USER /var/www/pm4-frontend
git clone <your-repo-url> /var/www/pm4-frontend
cd /var/www/pm4-frontend
```

---

## 3. ملف البيئة (.env) على السيرفر

أنشئ ملف `.env` في مجلد المشروع (نفس المستوى مع `package.json`):

```bash
cd /var/www/pm4-frontend
nano .env
```

المحتوى (عدّل القيم حسب سيرفرك):

```env
# عنوان الـ API على السيرفر (بدون / في النهاية)
VITE_API_URL=https://api.yourdomain.com

# مفتاح API — يجب أن يطابق أحد مفاتيح ALLOWED_API_KEYS في مشروع الـ API
VITE_API_KEY=your-api-key-from-api-project-env

# اختياري: مفتاح Gemini للـ AI
GEMINI_API_KEY=
```

احفظ الملف (في nano: `Ctrl+O` ثم `Enter` ثم `Ctrl+X`).

---

## 4. البناء (Build)

```bash
cd /var/www/pm4-frontend
npm ci
npm run build
```

سيُنشأ مجلد `dist/` يحتوي على الملفات الجاهزة للنشر.

---

## 5. إعداد Nginx لخدمة الواجهة

أنشئ ملف تكوين لموقعك:

```bash
sudo nano /etc/nginx/sites-available/pm4-frontend
```

المحتوى (استبدل `yourdomain.com` ونطاقك):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/pm4-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # تخزين مؤقت للملفات الثابتة
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

تفعيل الموقع واختبار Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/pm4-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. (اختياري) HTTPS مع Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

بعد ذلك سيُحدَّث التكوين تلقائياً لاستخدام HTTPS.

---

## 7. تحديث التطبيق لاحقاً

```bash
cd /var/www/pm4-frontend
git pull   # إن كنت تستخدم Git
# أو أعد رفع الملفات بـ rsync
npm ci
npm run build
sudo systemctl reload nginx
```

---

## ملخص المتغيرات المهمة

| المتغير       | الوصف |
|---------------|--------|
| `VITE_API_URL` | عنوان الـ API الكامل (مثلاً `https://api.yourdomain.com`) |
| `VITE_API_KEY` | مفتاح API مطابق لـ `ALLOWED_API_KEYS` في مشروع الـ API |
| `GEMINI_API_KEY` | اختياري — للوظائف المعتمدة على Gemini |

**ملاحظة:** قيم `VITE_*` تُضمَّن في البناء عند تشغيل `npm run build`. بعد أي تعديل على `.env` أعد تشغيل `npm run build`.
