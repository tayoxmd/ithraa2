import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Hijri date converter (basic implementation)
function toHijri(gregorianDate: Date): string {
  // This is a simplified conversion - in production, use a proper library like hijri-date
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();
  
  // Approximate conversion (622 lunar years = 604 solar years)
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
}

export function generateBookingPDF(data: PDFBookingData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors matching the uploaded PDF
  const primaryColor: [number, number, number] = [75, 0, 130]; // Darker purple/indigo
  const lightGray: [number, number, number] = [245, 245, 245];
  const borderGray: [number, number, number] = [200, 200, 200];
  const darkText: [number, number, number] = [0, 0, 0];
  
  // Header with booking number
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Booking number in top right corner with white background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 45, 8, 35, 10, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${data.bookingNumber}`, pageWidth - 27.5, 15, { align: 'center' });
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMATION', 15, 20);
  
  // Main title
  let yPos = 38;
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel Booking Confirmation', 15, yPos);
  yPos += 10;
  
  // Greeting section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dear Sir:', 15, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Greeting From Ethraa Company for Tourist Accommodation', 15, yPos);
  yPos += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('First of All, We would like to take this opportunity to welcome you at Ethraa Company for Tourist', 15, yPos);
  yPos += 4;
  doc.text('Accommodation. We are pleased to confirm the following reservation on a definite basis.', 15, yPos);
  yPos += 10;
  
  // Client Information Table
  const infoTableHeight = 30;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, pageWidth - 30, infoTableHeight, 'S');
  
  // Draw horizontal lines
  const lineSpacing = infoTableHeight / 5;
  for (let i = 1; i < 5; i++) {
    doc.line(15, yPos + (i * lineSpacing), pageWidth - 15, yPos + (i * lineSpacing));
  }
  
  // Draw vertical line
  doc.line(pageWidth / 2, yPos, pageWidth / 2, yPos + infoTableHeight);
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(8);
  
  // Left column labels and values
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel:', 18, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.text(data.hotelNameEn, 35, yPos + 4);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 18, yPos + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName, 35, yPos + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Guest Name:', 18, yPos + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(data.guestName, 45, yPos + 16);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Nationality:', 18, yPos + 22);
  doc.setFont('helvetica', 'normal');
  doc.text('-', 45, yPos + 22);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Mail:', 18, yPos + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientEmail, 35, yPos + 28);
  
  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('Mobile:', pageWidth / 2 + 3, yPos + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientPhone, pageWidth / 2 + 20, yPos + 28);
  
  yPos += infoTableHeight + 8;
  
  // Booking Details Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, yPos, pageWidth - 30, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  
  // Adjusted column widths for better fit
  const colWidths = [30, 18, 20, 22, 22, 12, 15, 18, 18];
  let xPos = 17;
  const headers = ['ROOM TYPE', 'VIEW', 'MEAL', 'CHECK IN', 'CHECK OUT', 'NIGHTS', 'GUESTS', 'RATE', 'TOTAL'];
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 4.5);
    xPos += colWidths[i];
  });
  
  yPos += 7;
  
  // Table Row with border
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, pageWidth - 30, 8, 'S');
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  xPos = 17;
  const values = [
    `${data.rooms} ${data.roomType}`,
    'Non View',
    'Room only',
    format(data.checkIn, 'dd/MM/yyyy'),
    format(data.checkOut, 'dd/MM/yyyy'),
    data.nights.toString(),
    data.guests.toString(),
    data.pricePerNight.toFixed(2),
    data.subtotal.toFixed(2)
  ];
  
  values.forEach((value, i) => {
    doc.text(value, xPos, yPos + 5);
    xPos += colWidths[i];
  });
  
  yPos += 12;
  
  // Price Breakdown
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Accommodation Charge:', 15, yPos);
  doc.text(data.netAmount.toFixed(2), pageWidth - 40, yPos);
  yPos += 6;
  
  doc.text('VAT Charge:', 15, yPos);
  doc.text(data.vatAmount.toFixed(2), pageWidth - 40, yPos);
  yPos += 8;
  
  // Total with light yellow background
  doc.setFillColor(255, 251, 230);
  doc.rect(15, yPos - 4, pageWidth - 30, 8, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(15, yPos - 4, pageWidth - 30, 8, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('(SAR) Total:', 18, yPos + 1);
  doc.text(`${data.totalAmount.toFixed(2)} including VAT`, pageWidth - 40, yPos + 1);
  
  yPos += 10;
  
  // Bank Details Section
  const boxWidth = (pageWidth - 35) / 2;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, boxWidth, 32, 'S');
  
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details', 18, yPos + 5);
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  let bankY = yPos + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Bank name:', 18, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('ANB Bank', 45, bankY);
  
  bankY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Account Name:', 18, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('Ithraa Tourist Accommodation Company', 45, bankY);
  
  bankY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Account number:', 18, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('SA9630400108095640510010', 45, bankY);
  
  bankY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('IBAN:', 18, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('SA9630400108095640510010', 45, bankY);
  
  bankY += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Swift Code:', 18, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('ARNBSARI', 45, bankY);
  
  yPos += 38;
  
  // Terms & Conditions Section
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions', 15, yPos);
  
  yPos += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    '1. Cancellation must be made 7 days before arrival, notice period 48 hours in advance.',
    '2. No refund for no-shows or early departures.',
    '3. Hotel reserves the right to cancel unconfirmed bookings.'
  ];
  
  terms.forEach(term => {
    const lines = doc.splitTextToSize(term, (pageWidth - 35));
    lines.forEach((line: string) => {
      doc.text(line, 15, yPos);
      yPos += 4;
    });
  });
  
  yPos += 3;
  
  // Hotel Location
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel Location:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 255);
  const locationText = data.hotelLocation.length > 80 ? data.hotelLocation.substring(0, 80) + '...' : data.hotelLocation;
  if (data.hotelLocationUrl) {
    doc.textWithLink(locationText, 40, yPos, { url: data.hotelLocationUrl });
  } else {
    doc.text(locationText, 40, yPos);
  }
  
  yPos += 4;
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('My Bookings Page:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 255);
  doc.textWithLink(data.customerPageUrl, 40, yPos, { url: data.customerPageUrl });
  
  // Footer section
  const footerY = pageHeight - 20;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Official Business Name: Ethraa Company for Tourist Accommodation', pageWidth / 2, footerY + 4, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  const today = new Date();
  
  // Left column
  doc.text(`Date: ${format(today, 'dd/MM/yyyy')}`, 15, footerY + 9);
  doc.text(`Hijri Date: ${toHijri(today)}`, 15, footerY + 13);
  
  // Center column
  doc.text('CR N°: 4031285856', pageWidth / 2 - 25, footerY + 9);
  doc.text('VAT N°: 302006094600003', pageWidth / 2 - 25, footerY + 13);
  
  // Right column
  doc.text('LIC N°: 73105372', pageWidth - 40, footerY + 9);
  doc.text('Class: 5 Star', pageWidth - 40, footerY + 13);
  
  return doc;
}

export function downloadBookingPDF(data: PDFBookingData) {
  const doc = generateBookingPDF(data);
  const fileName = `Confirmation_${data.bookingNumber}_${data.guestName.toUpperCase().replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

export function sharePDFViaEmail(data: PDFBookingData) {
  const doc = generateBookingPDF(data);
  const pdfBlob = doc.output('blob');
  
  // Create email with PDF as attachment
  // Note: Browser limitations prevent direct attachment, so we'll provide the download link
  const subject = `Booking Confirmation - ${data.guestName}`;
  const body = `Dear ${data.clientName},\n\nYour booking has been confirmed.\nBooking Number: ${data.bookingNumber}\nGuest Name: ${data.guestName}\nHotel: ${data.hotelNameEn}\nCheck-in: ${format(data.checkIn, 'dd/MM/yyyy')}\nCheck-out: ${format(data.checkOut, 'dd/MM/yyyy')}\n\nPlease download the PDF confirmation for full details.\n\nThank you for choosing Ethraa Company.`;
  
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
  // Generate PDF
  const doc = generateBookingPDF(data);
  const pdfBlob = doc.output('blob');
  
  // Create file from blob
  const fileName = `Confirmation_${data.bookingNumber}_${data.guestName.toUpperCase().replace(/\s+/g, '_')}.pdf`;
  const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const baseGuests = data.baseGuests;
  const extraGuests = data.extraGuests;
  const includedPersons = (options.mealPlanMaxPersons || 0) * data.rooms;
  const extraMealsRequired = Math.max(0, data.guests - includedPersons);
  
  // Build message based on language
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
  
  // Check if Web Share API is available and supports files
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: options.language === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation',
        text: message
      });
      return;
    } catch (error) {
      console.log('Share failed or was cancelled, falling back to URL method');
    }
  }
  
  // Fallback: Open WhatsApp with message only (file must be sent separately)
  const whatsappUrl = `https://wa.me/${data.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
