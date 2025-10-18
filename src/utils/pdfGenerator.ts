import jsPDF from 'jspdf';
import { format } from 'date-fns';

// Hijri date converter (basic implementation)
function toHijri(gregorianDate: Date): string {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();
  
  const hYear = Math.floor((gYear - 622) * 1.030684);
  
  return `${gDay.toString().padStart(2, '0')}/${gMonth.toString().padStart(2, '0')}/${hYear}`;
}

interface PDFBookingData {
  bookingNumber: number;
  hotelConfirmationNumber?: string;
  guestName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  hotelNameEn: string;
  hotelNameAr: string;
  hotelLocation: string;
  hotelLocationUrl?: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  rooms: number;
  guests: number;
  baseGuests: number;
  extraGuests: number;
  roomType: string;
  pricePerNight: number;
  subtotal: number;
  extraGuestCharge: number;
  discountAmount?: number;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  confirmedBy?: {
    name: string;
    email: string;
    phone: string;
  };
  customerPageUrl: string;
  pdfSettings?: any;
}

export function generateBookingPDF(data: PDFBookingData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // استخدام الإعدادات المخصصة أو القيم الافتراضية
  const settings = data.pdfSettings || {};
  
  const parseColor = (colorStr: string, defaultColor: [number, number, number]): [number, number, number] => {
    if (!colorStr) return defaultColor;
    const parts = colorStr.split(',').map(v => parseInt(v.trim()));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  };
  
  const primaryColor = parseColor(settings.primary_color, [75, 0, 130]);
  const lightGray = parseColor(settings.secondary_color, [245, 245, 245]);
  const borderGray: [number, number, number] = [200, 200, 200];
  const darkText = parseColor(settings.text_color, [0, 0, 0]);
  const headerBgColor = parseColor(settings.header_bg_color, [75, 0, 130]);
  const footerBgColor = parseColor(settings.footer_bg_color, [75, 0, 130]);
  
  // Font sizes
  const fontSizeHeader = settings.font_size_header || 18;
  const fontSizeTitle = settings.font_size_title || 14;
  const fontSizeBody = settings.font_size_body || 10;
  const fontSizeSmall = settings.font_size_small || 8;
  
  // Layout settings
  const headerHeight = settings.header_height || 30;
  const footerHeight = settings.footer_height || 20;
  const marginLeft = settings.page_margin_left || 15;
  const marginRight = settings.page_margin_right || 15;
  const sectionSpacing = settings.section_spacing || 10;
  const lineHeight = settings.line_height || 6;
  
  // Header with booking number
  if (settings.show_logo !== false) {
    doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Booking number in top right
    const bookingNumY = settings.booking_number_y || 15;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 45, 8, 35, 10, 2, 2, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(fontSizeBody);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${data.bookingNumber}`, pageWidth - 27.5, bookingNumY, { align: 'center' });
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(fontSizeHeader);
    doc.setFont('helvetica', 'bold');
    const headerText = settings.header_text_en || 'CONFIRMATION';
    doc.text(headerText, marginLeft, 20);
  }
  
  // Main title
  let yPos = settings.title_y || 38;
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(fontSizeTitle);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel Booking Confirmation', marginLeft, yPos);
  yPos += sectionSpacing;
  
  // Greeting section
  if (settings.show_company_description !== false) {
    doc.setFontSize(fontSizeBody);
    doc.setFont('helvetica', 'normal');
    doc.text('Dear Sir:', marginLeft, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    const companyName = settings.footer_company_name_en || 'Ethraa Company for Tourist Accommodation';
    doc.text(`Greeting From ${companyName}`, marginLeft, yPos);
    yPos += lineHeight + 1;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSizeSmall + 1);
    doc.text('We are pleased to confirm the following reservation.', marginLeft, yPos);
    yPos += sectionSpacing;
  }
  
  // Client Information Table
  yPos = settings.client_info_y || yPos;
  const infoTableHeight = 30;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(marginLeft, yPos, pageWidth - (marginLeft + marginRight), infoTableHeight, 'S');
  
  // Draw horizontal lines
  const lineSpacing = infoTableHeight / 5;
  for (let i = 1; i < 5; i++) {
    doc.line(marginLeft, yPos + (i * lineSpacing), pageWidth - marginRight, yPos + (i * lineSpacing));
  }
  
  // Draw vertical line
  doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + infoTableHeight);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(fontSizeSmall);
  
  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel:', marginLeft + 3, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(data.hotelNameEn, marginLeft + 20, yPos + 4);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', marginLeft + 3, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName, marginLeft + 20, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Guest Name:', marginLeft + 3, yPos + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(data.guestName, marginLeft + 30, yPos + 16);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Mail:', marginLeft + 3, yPos + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientEmail, marginLeft + 20, yPos + 22);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Mobile:', marginLeft + 3, yPos + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientPhone, marginLeft + 20, yPos + 28);
  
  yPos += infoTableHeight + sectionSpacing;
  
  // Booking Details Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(marginLeft, yPos, pageWidth - (marginLeft + marginRight), 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(fontSizeSmall - 1);
  doc.setFont('helvetica', 'bold');
  
  const colWidths = [30, 18, 22, 22, 12, 15, 18];
  let xPos = marginLeft + 2;
  const headers = ['ROOM TYPE', 'MEAL', 'CHECK IN', 'CHECK OUT', 'NIGHTS', 'GUESTS', 'TOTAL'];
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 4.5);
    xPos += colWidths[i];
  });
  
  yPos += 7;
  
  // Table Row
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(marginLeft, yPos, pageWidth - (marginLeft + marginRight), 8, 'S');
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(fontSizeSmall - 1);
  doc.setFont('helvetica', 'normal');
  
  xPos = marginLeft + 2;
  const values = [
    `${data.rooms} ${data.roomType}`,
    'Room only',
    format(data.checkIn, 'dd/MM/yyyy'),
    format(data.checkOut, 'dd/MM/yyyy'),
    data.nights.toString(),
    data.guests.toString(),
    data.subtotal.toFixed(2)
  ];
  
  values.forEach((value, i) => {
    doc.text(value, xPos, yPos + 5);
    xPos += colWidths[i];
  });
  
  yPos += 12;
  
  // Price Breakdown
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(fontSizeBody - 1);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Accommodation:', marginLeft, yPos);
  doc.text(data.netAmount.toFixed(2), pageWidth - marginRight - 30, yPos);
  yPos += lineHeight;
  
  doc.text('VAT:', marginLeft, yPos);
  doc.text(data.vatAmount.toFixed(2), pageWidth - marginRight - 30, yPos);
  yPos += lineHeight + 2;
  
  // Total with background
  doc.setFillColor(255, 251, 230);
  doc.rect(marginLeft, yPos - 4, pageWidth - (marginLeft + marginRight), 8, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(marginLeft, yPos - 4, pageWidth - (marginLeft + marginRight), 8, 'S');
  
  doc.setFontSize(fontSizeBody);
  doc.setFont('helvetica', 'bold');
  doc.text('Total (SAR):', marginLeft + 3, yPos + 1);
  doc.text(`${data.totalAmount.toFixed(2)} including VAT`, pageWidth - marginRight - 50, yPos + 1);
  
  yPos += sectionSpacing;
  
  // Bank Details
  if (settings.show_bank_details !== false) {
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft, yPos, pageWidth - (marginLeft + marginRight), 28, 'S');
    
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFontSize(fontSizeBody - 1);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details', marginLeft + 3, yPos + 5);
    
    doc.setFontSize(fontSizeSmall - 1);
    doc.setFont('helvetica', 'normal');
    let bankY = yPos + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Bank:', marginLeft + 3, bankY);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.bank_name || 'ANB Bank', marginLeft + 25, bankY);
    
    bankY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Account:', marginLeft + 3, bankY);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.bank_account_number || '108095640510010', marginLeft + 25, bankY);
    
    bankY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('IBAN:', marginLeft + 3, bankY);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.iban || 'SA9630400108095640510010', marginLeft + 25, bankY);
    
    yPos += 32;
  }
  
  // Terms & Conditions
  if (settings.show_terms !== false) {
    doc.setFontSize(fontSizeBody - 1);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', marginLeft, yPos);
    
    yPos += 5;
    doc.setFontSize(fontSizeSmall - 1);
    doc.setFont('helvetica', 'normal');
    
    const terms = settings.terms_en || '1. Cancellation must be made 7 days before arrival.\n2. No refund for no-shows.';
    const termLines = doc.splitTextToSize(terms, pageWidth - (marginLeft + marginRight));
    termLines.forEach((line: string) => {
      doc.text(line, marginLeft, yPos);
      yPos += 4;
    });
  }
  
  // Footer
  if (settings.show_footer_info !== false) {
    const footerY = pageHeight - footerHeight;
    doc.setFillColor(footerBgColor[0], footerBgColor[1], footerBgColor[2]);
    doc.rect(0, footerY, pageWidth, footerHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(fontSizeSmall - 1);
    doc.setFont('helvetica', 'bold');
    const footerCompanyName = settings.footer_company_name_en || 'Ethraa Company';
    doc.text(footerCompanyName, pageWidth / 2, footerY + 4, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSizeSmall - 2);
    const today = new Date();
    
    doc.text(`Date: ${format(today, 'dd/MM/yyyy')}`, marginLeft, footerY + 9);
    
    const crNumber = settings.company_cr || '4031285856';
    const vatNumber = settings.company_vat || '302006094600003';
    doc.text(`CR: ${crNumber}`, pageWidth / 2 - 20, footerY + 9);
    doc.text(`VAT: ${vatNumber}`, pageWidth / 2 - 20, footerY + 13);
    
    const licNumber = settings.company_license || '73105372';
    doc.text(`LIC: ${licNumber}`, pageWidth - marginRight - 30, footerY + 9);
  }
  
  return doc;
}

export function downloadBookingPDF(data: PDFBookingData) {
  const doc = generateBookingPDF(data);
  const fileName = `Confirmation_${data.bookingNumber}_${data.guestName.toUpperCase().replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

export function sharePDFViaEmail(data: PDFBookingData) {
  const doc = generateBookingPDF(data);
  const subject = `Booking Confirmation - ${data.guestName}`;
  const body = `Dear ${data.clientName},\n\nYour booking has been confirmed.\nBooking Number: ${data.bookingNumber}\n\nThank you!`;
  
  window.location.href = `mailto:${data.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

interface SharePDFWhatsAppOptions {
  language: 'ar' | 'en';
  mealPlanNameAr?: string;
  mealPlanNameEn?: string;
  mealPlanPrice?: number;
  mealPlanMaxPersons?: number;
  extraMeals?: number;
  paymentStatus?: 'paid' | 'partially_paid' | 'unpaid';
  amountPaid?: number;
}

export async function sharePDFViaWhatsApp(data: PDFBookingData, options: SharePDFWhatsAppOptions) {
  const doc = generateBookingPDF(data);
  const pdfBlob = doc.output('blob');
  
  const fileName = `Confirmation_${data.bookingNumber}_${data.guestName.toUpperCase().replace(/\s+/g, '_')}.pdf`;
  const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const baseGuests = data.baseGuests;
  const extraGuests = data.extraGuests;
  const includedPersons = (options.mealPlanMaxPersons || 0) * data.rooms;
  const extraMealsRequired = Math.max(0, data.guests - includedPersons);
  
  let message = '';
  
  if (options.language === 'ar') {
    message = `*تأكيد حجز فندقي*\n\n`;
    message += `رقم الحجز: ${data.bookingNumber}\n`;
    if (data.hotelConfirmationNumber) {
      message += `رقم حجز الفندق: ${data.hotelConfirmationNumber}\n`;
    }
    message += `اسم النزيل: ${data.guestName}\n`;
    message += `الفندق: ${data.hotelNameAr}\n`;
    message += `الموقع: ${data.hotelLocation}\n`;
    message += `تاريخ الوصول: ${format(data.checkIn, 'dd/MM/yyyy')}\n`;
    message += `تاريخ المغادرة: ${format(data.checkOut, 'dd/MM/yyyy')}\n`;
    message += `عدد الليالي: ${data.nights}\n`;
    message += `عدد الغرف: ${data.rooms}\n`;
    message += `عدد النزلاء: ${data.guests} أشخاص\n`;
    
    if (extraGuests > 0) {
      message += `أشخاص إضافيين: +${extraGuests} أشخاص\n`;
    }
    
    if (options.mealPlanNameAr) {
      message += `\n*الوجبات:* ${options.mealPlanNameAr}\n`;
      if ((options.mealPlanPrice || 0) > 0) {
        message += `مدفوعة: +${options.mealPlanPrice} ر.س\n`;
      }
      if ((options.mealPlanMaxPersons || 0) > 0) {
        message += `عدد الأشخاص: ${includedPersons} أشخاص\n`;
      }
      if (extraMealsRequired > 0 || (options.extraMeals && options.extraMeals > 0)) {
        message += `وجبات إضافية: +${options.extraMeals && options.extraMeals > 0 ? options.extraMeals : extraMealsRequired}\n`;
      }
    }
    
    message += `\n*المبلغ الإجمالي:* ${data.totalAmount.toFixed(2)} ر.س\n`;
    
    if (options.paymentStatus === 'partially_paid' && options.amountPaid) {
      message += `المبلغ المدفوع: ${options.amountPaid.toFixed(2)} ر.س\n`;
      message += `المبلغ المتبقي: ${(data.totalAmount - options.amountPaid).toFixed(2)} ر.س\n`;
    } else if (options.paymentStatus === 'paid') {
      message += `الدفع: مدفوع بالكامل\n`;
    }
    
    message += `\nعرض حجوزاتك: ${data.customerPageUrl}`;
  } else {
    message = `*Hotel Booking Confirmation*\n\n`;
    message += `Booking Number: ${data.bookingNumber}\n`;
    if (data.hotelConfirmationNumber) {
      message += `Hotel Booking#: ${data.hotelConfirmationNumber}\n`;
    }
    message += `Guest Name: ${data.guestName}\n`;
    message += `Hotel: ${data.hotelNameEn}\n`;
    message += `Location: ${data.hotelLocation}\n`;
    message += `Check-in: ${format(data.checkIn, 'dd/MM/yyyy')}\n`;
    message += `Check-out: ${format(data.checkOut, 'dd/MM/yyyy')}\n`;
    message += `Nights: ${data.nights}\n`;
    message += `Rooms: ${data.rooms}\n`;
    message += `Guests: ${data.guests} persons\n`;
    
    if (extraGuests > 0) {
      message += `Extra Guests: +${extraGuests} persons\n`;
    }
    
    if (options.mealPlanNameEn) {
      message += `\n*Meals:* ${options.mealPlanNameEn}\n`;
      if ((options.mealPlanPrice || 0) > 0) {
        message += `Paid: +${options.mealPlanPrice} SAR\n`;
      }
      if ((options.mealPlanMaxPersons || 0) > 0) {
        message += `Persons: ${includedPersons} persons\n`;
      }
      if (extraMealsRequired > 0 || (options.extraMeals && options.extraMeals > 0)) {
        message += `Extra Meals: +${options.extraMeals && options.extraMeals > 0 ? options.extraMeals : extraMealsRequired}\n`;
      }
    }
    
    message += `\n*Total Amount:* ${data.totalAmount.toFixed(2)} SAR\n`;
    
    if (options.paymentStatus === 'partially_paid' && options.amountPaid) {
      message += `Amount Paid: ${options.amountPaid.toFixed(2)} SAR\n`;
      message += `Remaining Amount: ${(data.totalAmount - options.amountPaid).toFixed(2)} SAR\n`;
    } else if (options.paymentStatus === 'paid') {
      message += `Payment: Fully Paid\n`;
    }
    
    message += `\nView your bookings: ${data.customerPageUrl}`;
  }
  
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: options.language === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation',
        text: message
      });
      return;
    } catch (error) {
      console.log('Share failed, falling back to URL method');
    }
  }
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}