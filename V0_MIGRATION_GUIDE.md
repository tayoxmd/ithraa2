# دليل نقل المشروع إلى v0

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نقل مشروع Ithraa من Lovable (Vite + React) إلى v0 (Next.js).

## 🎯 استراتيجية النقل

### الخيار 1: استخدام v0 لإعادة البناء (موصى به)
1. افتح [v0.dev](https://v0.dev)
2. استخدم الأوامر التالية لإنشاء صفحات مشابهة
3. انقل المنطق التجاري يدوياً

### الخيار 2: النقل اليدوي الكامل

---

## 📦 الخطوة 1: تصدير الكود الحالي

### 1.1 تصدير عبر GitHub
<lov-actions>
  <lov-link url="https://docs.lovable.dev/user-guides/github-integration">ربط المشروع مع GitHub</lov-link>
</lov-actions>

بعد الربط:
```bash
git clone [your-repo-url]
cd [your-project]
```

### 1.2 تصدير قاعدة البيانات
<lov-actions>
  <lov-open-backend>فتح Backend لتصدير البيانات</lov-open-backend>
</lov-actions>

في Backend:
1. اذهب إلى **SQL Editor**
2. نفذ هذا الأمر لتصدير المخطط:
```sql
-- احفظ هذا في ملف schema.sql
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

3. لتصدير البيانات من كل جدول:
```sql
-- كرر لكل جدول
COPY (SELECT * FROM table_name) TO STDOUT WITH CSV HEADER;
```

---

## 🔧 الخطوة 2: إنشاء مشروع Next.js

```bash
# إنشاء مشروع Next.js جديد
npx create-next-app@latest ithraa-nextjs --typescript --tailwind --app

cd ithraa-nextjs
```

---

## 📁 الخطوة 3: نقل الملفات

### 3.1 ملفات قابلة للنقل المباشر

#### ✅ المكونات (Components)
انقل من `src/components/` إلى `components/` أو `app/components/`:

```bash
# المكونات التي يمكن نقلها مباشرة
cp -r src/components/ui components/
cp -r src/components/*.tsx components/
```

**ملاحظة**: بعض المكونات قد تحتاج تعديلات طفيفة:
- استبدل `import { Link } from 'react-router-dom'` بـ `import Link from 'next/link'`
- استبدل `useNavigate()` بـ `import { useRouter } from 'next/navigation'`

#### ✅ الأنماط (Styles)
```bash
# نقل ملفات CSS
cp src/index.css app/globals.css
cp tailwind.config.ts tailwind.config.ts
cp src/themes.css app/themes.css
```

في `app/globals.css` أضف:
```css
@import './themes.css';
```

#### ✅ الأصول (Assets)
```bash
# نقل الصور
cp -r src/assets public/assets
cp -r public/images public/images
```

**تحديث المسارات في الكود:**
- من: `import heroImage from '@/assets/hero.jpg'`
- إلى: `import heroImage from '@/public/assets/hero.jpg'`
- أو استخدم: `<Image src="/assets/hero.jpg" />`

#### ✅ الأنواع (Types)
```bash
cp -r src/types types/
# أو ضعها في
cp -r src/types app/types/
```

### 3.2 ملفات تحتاج إعادة كتابة

#### ❌ التوجيه (Routing)
**القديم (React Router):**
```typescript
// src/App.tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/hotels/:id" element={<HotelDetails />} />
  <Route path="/booking" element={<Booking />} />
</Routes>
```

**الجديد (Next.js App Router):**
```bash
# إنشاء البنية
app/
  page.tsx                    # الصفحة الرئيسية (/)
  hotels/
    [id]/
      page.tsx               # تفاصيل الفندق (/hotels/123)
  booking/
    page.tsx                 # صفحة الحجز (/booking)
```

#### ❌ الصفحات (Pages)

**مثال - الصفحة الرئيسية:**

القديم (`src/pages/Index.tsx`):
```typescript
export default function Index() {
  const navigate = useNavigate();
  return <div>المحتوى</div>;
}
```

الجديد (`app/page.tsx`):
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إثراء - منصة حجز الفنادق',
  description: 'احجز فندقك بسهولة',
};

export default function Home() {
  // بدون useNavigate - استخدم Link أو useRouter
  return <div>المحتوى</div>;
}
```

**مثال - صفحة ديناميكية:**

القديم (`src/pages/HotelDetails.tsx`):
```typescript
import { useParams } from 'react-router-dom';

export default function HotelDetails() {
  const { id } = useParams();
  return <div>فندق {id}</div>;
}
```

الجديد (`app/hotels/[id]/page.tsx`):
```typescript
export default function HotelDetails({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <div>فندق {params.id}</div>;
}
```

#### ❌ التنقل (Navigation)

**القديم:**
```typescript
import { useNavigate, Link } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  return (
    <>
      <Link to="/hotels">الفنادق</Link>
      <button onClick={() => navigate('/booking')}>احجز الآن</button>
    </>
  );
}
```

**الجديد:**
```typescript
'use client'; // مطلوب لـ useRouter

import Link from 'next/link';
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  
  return (
    <>
      <Link href="/hotels">الفنادق</Link>
      <button onClick={() => router.push('/booking')}>احجز الآن</button>
    </>
  );
}
```

#### ❌ السياقات (Contexts)

**القديم (`src/contexts/AuthContext.tsx`):**
```typescript
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**الجديم (`app/providers/AuthProvider.tsx`):**
```typescript
'use client'; // ✅ مطلوب

import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

ثم في `app/layout.tsx`:
```typescript
import { AuthProvider } from './providers/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🗄️ الخطوة 4: إعداد Supabase

### 4.1 تثبيت المكتبات
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 4.2 إنشاء Supabase Client

**للمكونات Client-Side (`lib/supabase/client.ts`):**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**للمكونات Server-Side (`lib/supabase/server.ts`):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### 4.3 متغيرات البيئة

أنشئ `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://orqhoejabexcdjmdgzxg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycWhvZWphYmV4Y2RqbWRnenhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODIwODEsImV4cCI6MjA3NDk1ODA4MX0.0bcMBptCUmdxuH-bIyy9o8zkzYH1CphBFj6P8nrrzjM
```

### 4.4 استخدام Supabase

**في Server Components:**
```typescript
// app/hotels/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function HotelsPage() {
  const supabase = createClient();
  const { data: hotels } = await supabase
    .from('hotels')
    .select('*');
  
  return <div>{/* عرض الفنادق */}</div>;
}
```

**في Client Components:**
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function HotelsList() {
  const [hotels, setHotels] = useState([]);
  const supabase = createClient();
  
  useEffect(() => {
    async function fetchHotels() {
      const { data } = await supabase
        .from('hotels')
        .select('*');
      setHotels(data || []);
    }
    fetchHotels();
  }, []);
  
  return <div>{/* عرض الفنادق */}</div>;
}
```

---

## 🔐 الخطوة 5: نقل المصادقة

### 5.1 إنشاء Middleware للمصادقة

`middleware.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 5.2 صفحة تسجيل الدخول

`app/auth/login/page.tsx`:
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="البريد الإلكتروني"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة المرور"
      />
      <button type="submit">تسجيل الدخول</button>
    </form>
  );
}
```

---

## 🎨 الخطوة 6: تحويل الصفحات الرئيسية

### جدول التحويل

| الصفحة القديمة | الصفحة الجديدة | الملاحظات |
|----------------|----------------|-----------|
| `src/pages/Index.tsx` | `app/page.tsx` | الصفحة الرئيسية |
| `src/pages/Auth.tsx` | `app/auth/page.tsx` | المصادقة |
| `src/pages/HotelDetails.tsx` | `app/hotels/[id]/page.tsx` | صفحة ديناميكية |
| `src/pages/Booking.tsx` | `app/booking/page.tsx` | - |
| `src/pages/AdminDashboard.tsx` | `app/admin/page.tsx` | محمية بـ middleware |
| `src/pages/Profile.tsx` | `app/profile/page.tsx` | محمية بـ middleware |

### نموذج التحويل - صفحة الحجز

**القديم (`src/pages/Booking.tsx`):**
```typescript
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotel');
  const navigate = useNavigate();
  
  async function handleBooking(data) {
    const { error } = await supabase
      .from('bookings')
      .insert(data);
    
    if (!error) {
      navigate('/success');
    }
  }
  
  return <div>{/* محتوى الحجز */}</div>;
}
```

**الجديد (`app/booking/page.tsx`):**
```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotel');
  const router = useRouter();
  const supabase = createClient();
  
  async function handleBooking(data) {
    const { error } = await supabase
      .from('bookings')
      .insert(data);
    
    if (!error) {
      router.push('/success');
    }
  }
  
  return <div>{/* محتوى الحجز */}</div>;
}
```

---

## 📱 الخطوة 7: PWA في Next.js

### 7.1 تثبيت next-pwa
```bash
npm install next-pwa
```

### 7.2 تحديث next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // إعدادات Next.js الأخرى
});
```

### 7.3 نقل ملفات PWA
```bash
# نقل الملفات
cp public/manifest.json public/manifest.json
cp public/icon-192.png public/icon-192.png
cp public/icon-512.png public/icon-512.png
```

### 7.4 تحديث metadata في layout
```typescript
// app/layout.tsx
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'إثراء',
  },
};
```

---

## 🔄 الخطوة 8: Edge Functions

انقل Edge Functions من `supabase/functions/` كما هي:

```bash
# إنشاء مجلد supabase في المشروع الجديد
mkdir -p supabase/functions

# نقل جميع Edge Functions
cp -r supabase/functions/* [new-project]/supabase/functions/
cp supabase/config.toml [new-project]/supabase/config.toml
```

**ملاحظة:** Edge Functions تعمل بنفس الطريقة في Next.js.

---

## 🧪 الخطوة 9: الاختبار

### 9.1 تشغيل المشروع محلياً
```bash
npm run dev
```

### 9.2 قائمة فحص الوظائف

- [ ] الصفحة الرئيسية تعرض بشكل صحيح
- [ ] التنقل بين الصفحات يعمل
- [ ] المصادقة تعمل (تسجيل دخول/خروج)
- [ ] عرض قائمة الفنادق
- [ ] تفاصيل الفندق
- [ ] عملية الحجز
- [ ] لوحة تحكم المشرف
- [ ] الصور تُعرض بشكل صحيح
- [ ] PWA قابل للتثبيت
- [ ] الوضع دون اتصال يعمل

---

## 🚀 الخطوة 10: النشر

### خيارات النشر:

#### 1. Vercel (موصى به لـ Next.js)
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

أو:
1. ادفع الكود إلى GitHub
2. اربط المستودع في [vercel.com](https://vercel.com)
3. سيتم النشر تلقائياً

#### 2. Netlify
1. ادفع إلى GitHub
2. اربط في [netlify.com](https://netlify.com)
3. اختر Next.js كإطار عمل

### إعداد متغيرات البيئة:
في لوحة تحكم Vercel/Netlify، أضف:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📊 جدول مقارنة التقنيات

| العنصر | Lovable (القديم) | Next.js (الجديد) |
|--------|-----------------|------------------|
| **الإطار** | Vite + React | Next.js |
| **التوجيه** | React Router | App Router |
| **التنقل** | `useNavigate()` | `useRouter()` |
| **الروابط** | `<Link to="">` | `<Link href="">` |
| **الصفحات** | `src/pages/*.tsx` | `app/**/page.tsx` |
| **Server-Side** | ❌ | ✅ |
| **API Routes** | Edge Functions فقط | Route Handlers + Edge Functions |
| **الصور** | `<img>` | `<Image>` (محسّن) |
| **البناء** | `npm run build` | `npm run build` |
| **التشغيل** | `npm run dev` | `npm run dev` |

---

## 🎯 نصائح إضافية

### 1. استخدم v0 للصفحات الجديدة
بدلاً من إعادة كتابة كل شيء، يمكنك:
```
1. افتح v0.dev
2. اكتب: "create a hotel booking page in Arabic with these fields..."
3. استخدم الكود المُولد كنقطة بداية
```

### 2. استخدم Server Components عندما تستطيع
```typescript
// ✅ أفضل - Server Component
async function HotelsList() {
  const supabase = createClient();
  const { data } = await supabase.from('hotels').select();
  return <div>...</div>;
}

// ⚠️ استخدم فقط عند الحاجة - Client Component
'use client';
function InteractiveHotel() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>...</button>;
}
```

### 3. استفد من Image Optimization
```typescript
// القديم
<img src="/hotels/hotel-1.jpg" alt="فندق" />

// الجديد - محسّن تلقائياً
import Image from 'next/image';
<Image 
  src="/hotels/hotel-1.jpg" 
  alt="فندق"
  width={800}
  height={600}
  priority
/>
```

### 4. استخدم Metadata API
```typescript
// في كل صفحة
export const metadata = {
  title: 'عنوان الصفحة',
  description: 'وصف الصفحة',
  openGraph: {
    images: ['/og-image.jpg'],
  },
};
```

---

## 🆘 مشاكل شائعة وحلولها

### المشكلة 1: "document is not defined"
**السبب:** محاولة استخدام DOM في Server Component

**الحل:**
```typescript
'use client'; // أضف في بداية الملف
```

### المشكلة 2: "useRouter is not a function"
**السبب:** استخدام `useRouter` من `next/router` بدلاً من `next/navigation`

**الحل:**
```typescript
// ❌ خطأ
import { useRouter } from 'next/router';

// ✅ صحيح
import { useRouter } from 'next/navigation';
```

### المشكلة 3: الصور لا تظهر
**السبب:** المسارات غير صحيحة

**الحل:**
```typescript
// القديم
import image from '@/assets/image.jpg';

// الجديد
// ضع الصورة في public/assets/image.jpg
<Image src="/assets/image.jpg" ... />
```

### المشكلة 4: Supabase Auth لا يعمل
**السبب:** عدم تحديث الكوكيز

**الحل:** تأكد من استخدام Middleware (الخطوة 5.1)

---

## 📚 مصادر مفيدة

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Next.js App Router Tutorial](https://nextjs.org/docs/app)
- [v0.dev Documentation](https://v0.dev/docs)

---

## ✅ قائمة المراجعة النهائية

### قبل البدء
- [ ] نسخة احتياطية من الكود الحالي
- [ ] تصدير قاعدة البيانات
- [ ] حفظ متغيرات البيئة
- [ ] تصدير الصور والأصول

### أثناء النقل
- [ ] إنشاء مشروع Next.js
- [ ] نقل المكونات
- [ ] تحويل الصفحات
- [ ] إعداد Supabase
- [ ] نقل الأنماط
- [ ] تحديث التوجيه
- [ ] إعداد PWA
- [ ] نقل Edge Functions

### بعد النقل
- [ ] اختبار جميع الصفحات
- [ ] اختبار المصادقة
- [ ] اختبار الحجوزات
- [ ] اختبار PWA
- [ ] اختبار الوضع دون اتصال
- [ ] النشر على Vercel
- [ ] إعداد النطاق
- [ ] مراقبة الأخطاء

---

## 💬 هل تحتاج مساعدة؟

إذا واجهت أي مشكلة أثناء النقل:
1. راجع قسم "مشاكل شائعة وحلولها"
2. تحقق من وثائق Next.js
3. ابحث في [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
4. اسأل في [Next.js Discord](https://nextjs.org/discord)

---

## 🎉 الخلاصة

النقل إلى Next.js يستغرق وقتاً ولكنه يمنحك:
- ✅ أداء أفضل (SSR/SSG)
- ✅ SEO محسّن
- ✅ تحسين تلقائي للصور
- ✅ API Routes مدمجة
- ✅ نشر سهل على Vercel

**الوقت المتوقع للنقل:** 3-5 أيام عمل لمشروع بهذا الحجم.

**نصيحة أخيرة:** ابدأ بصفحة واحدة، تأكد من عملها، ثم انتقل للتالية. لا تحاول نقل كل شيء دفعة واحدة! 🚀
