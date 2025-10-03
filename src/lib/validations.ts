import { z } from 'zod';

// Booking validation schema
export const bookingSchema = z.object({
  checkIn: z.date({
    required_error: "يرجى تحديد تاريخ تسجيل الوصول",
  }),
  checkOut: z.date({
    required_error: "يرجى تحديد تاريخ تسجيل المغادرة",
  }),
  guests: z.number()
    .int({ message: "عدد الضيوف يجب أن يكون رقماً صحيحاً" })
    .min(1, { message: "يجب أن يكون هناك ضيف واحد على الأقل" })
    .max(50, { message: "الحد الأقصى للضيوف هو 50" }),
  rooms: z.number()
    .int({ message: "عدد الغرف يجب أن يكون رقماً صحيحاً" })
    .min(1, { message: "يجب حجز غرفة واحدة على الأقل" })
    .max(20, { message: "الحد الأقصى للغرف هو 20" }),
  notes: z.string()
    .max(500, { message: "الملاحظات يجب أن تكون أقل من 500 حرف" })
    .optional(),
  paymentMethod: z.enum([
    'apple_pay',
    'stc_pay',
    'google_pay',
    'mada',
    'visa',
    'mastercard'
  ], {
    required_error: "يرجى اختيار وسيلة دفع",
  }),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول",
  path: ["checkOut"],
});

// Employee validation schema
export const employeeSchema = z.object({
  email: z.string()
    .email({ message: "البريد الإلكتروني غير صحيح" })
    .max(255, { message: "البريد الإلكتروني طويل جداً" }),
  fullName: z.string()
    .trim()
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الاسم طويل جداً" }),
  phone: z.string()
    .regex(/^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/, { 
      message: "رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)" 
    }),
  password: z.string()
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .max(100, { message: "كلمة المرور طويلة جداً" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "يجب أن تحتوي كلمة المرور على حروف كبيرة وصغيرة وأرقام"
    }),
  permissions: z.object({
    manage_hotels: z.boolean().optional(),
    manage_bookings: z.boolean().optional(),
    manage_complaints: z.boolean().optional(),
    view_reports: z.boolean().optional(),
    manage_employees: z.boolean().optional(),
  }).optional(),
});

// Auth validation schema
export const authSchema = z.object({
  email: z.string()
    .email({ message: "البريد الإلكتروني غير صحيح" })
    .max(255, { message: "البريد الإلكتروني طويل جداً" }),
  password: z.string()
    .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" })
    .max(100, { message: "كلمة المرور طويلة جداً" }),
  fullName: z.string()
    .trim()
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الاسم طويل جداً" })
    .optional(),
  phone: z.string()
    .regex(/^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/, { 
      message: "رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)" 
    })
    .optional(),
});

// Search validation schema
export const searchSchema = z.object({
  city: z.string().uuid({ message: "المدينة المحددة غير صحيحة" }),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "تاريخ الوصول غير صحيح" 
  }),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: "تاريخ المغادرة غير صحيح" 
  }),
  guests: z.number()
    .int()
    .min(1, { message: "يجب أن يكون هناك ضيف واحد على الأقل" })
    .max(50, { message: "الحد الأقصى للضيوف هو 50" }),
  rooms: z.number()
    .int()
    .min(1, { message: "يجب حجز غرفة واحدة على الأقل" })
    .max(20, { message: "الحد الأقصى للغرف هو 20" }),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
