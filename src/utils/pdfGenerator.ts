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
  
  // Colors
  const primaryColor: [number, number, number] = [138, 43, 226]; // Purple
  const yellowColor: [number, number, number] = [255, 215, 0];
  const darkGray: [number, number, number] = [64, 64, 64];
  
  // Header - Company Logo and Title
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMATION', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Hotel Booking Confirmation', pageWidth / 2, 25, { align: 'center' });
  
  // Booking Number (Company)
  doc.setFontSize(10);
  doc.setFillColor(yellowColor[0], yellowColor[1], yellowColor[2]);
  doc.roundedRect(pageWidth - 50, 5, 40, 8, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${data.bookingNumber}`, pageWidth - 30, 10, { align: 'center' });
  
  // Hotel Confirmation Number (if exists)
  let yPos = 45;
  if (data.hotelConfirmationNumber) {
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(2);
    doc.roundedRect(15, yPos, 50, 10, 2, 2, 'S');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Hotel Conf#:', 17, yPos + 4);
    doc.text(data.hotelConfirmationNumber, 17, yPos + 8);
    yPos += 15;
  }
  
  // Greeting
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dear Sir:', 15, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Greeting From Ethraa Company for Tourist Accommodation', 15, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.text('First of All, We would like to take this opportunity to welcome you at Ethraa Company', 15, yPos);
  yPos += 5;
  doc.text('for Tourist Accommodation. We are pleased to confirm the following reservation on a definite basis.', 15, yPos);
  yPos += 12;
  
  // Client Information Box
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 35, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, pageWidth - 30, 35, 'S');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Left column
  doc.text('Hotel:', 20, yPos + 6);
  doc.text('Guest Name:', 20, yPos + 14);
  doc.text('Mail:', 20, yPos + 22);
  
  // Right column
  doc.text('Client:', pageWidth / 2 + 5, yPos + 6);
  doc.text('Nationality:', pageWidth / 2 + 5, yPos + 14);
  doc.text('Mobile:', pageWidth / 2 + 5, yPos + 22);
  
  doc.setFont('helvetica', 'normal');
  // Values - Left
  doc.text(data.hotelNameEn, 20, yPos + 10);
  doc.text(data.guestName, 20, yPos + 18);
  doc.text(data.clientEmail, 20, yPos + 26);
  
  // Values - Right
  doc.text(data.clientName, pageWidth / 2 + 5, yPos + 10);
  doc.text('-', pageWidth / 2 + 5, yPos + 18); // Nationality placeholder
  doc.text(data.clientPhone, pageWidth / 2 + 5, yPos + 26);
  
  yPos += 42;
  
  // Booking Details Table
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  const colWidths = [25, 20, 20, 25, 25, 15, 20, 25, 25];
  let xPos = 18;
  const headers = ['ROOM TYPE', 'VIEW', 'MEAL', 'CHECK IN', 'CHECK OUT', 'NIGHTS', 'GUESTS', 'RATE', 'TOTAL'];
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos + 5);
    xPos += colWidths[i];
  });
  
  yPos += 8;
  
  // Table Row
  doc.setFillColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 10, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, pageWidth - 30, 10, 'S');
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  xPos = 18;
  const values = [
    `${data.rooms} ${data.roomType}`,
    'Non View',
    'Room only',
    format(data.checkIn, 'dd/MM/yyyy'),
    format(data.checkOut, 'dd/MM/yyyy'),
    data.nights.toString(),
    `${data.guests}`,
    data.pricePerNight.toFixed(2),
    data.subtotal.toFixed(2)
  ];
  
  values.forEach((value, i) => {
    doc.text(value, xPos, yPos + 6);
    xPos += colWidths[i];
  });
  
  yPos += 15;
  
  // Price Breakdown
  doc.setFont('helvetica', 'bold');
  doc.text('Net Accommodation Charge:', 15, yPos);
  doc.text(`${data.netAmount.toFixed(2)}`, pageWidth - 40, yPos);
  yPos += 6;
  
  doc.text('VAT Charge:', 15, yPos);
  doc.text(`${data.vatAmount.toFixed(2)}`, pageWidth - 40, yPos);
  yPos += 8;
  
  doc.setFillColor(yellowColor[0], yellowColor[1], yellowColor[2]);
  doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('(SAR) Total:', 20, yPos);
  doc.text(`${data.totalAmount.toFixed(2)}`, pageWidth - 40, yPos);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('including VAT', 20, yPos + 3);
  
  yPos += 12;
  
  // Bank Details
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, (pageWidth - 35) / 2, 35, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, yPos, (pageWidth - 35) / 2, 35, 'S');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details', 20, yPos + 6);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Bank name: ANB Bank', 20, yPos + 12);
  doc.text('Account Name: Ithraa Tourist Accommodation Company', 20, yPos + 17);
  doc.text('Account number: SA9630400108095640510010', 20, yPos + 22);
  doc.text('IBAN: SA9630400108095640510010', 20, yPos + 27);
  doc.text('Swift Code: ARNBSARI', 20, yPos + 32);
  
  // Hotel Details
  const hotelDetailsX = (pageWidth + 5) / 2;
  doc.rect(hotelDetailsX, yPos, (pageWidth - 35) / 2, 35, 'F');
  doc.rect(hotelDetailsX, yPos, (pageWidth - 35) / 2, 35, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Hotel Details', hotelDetailsX + 5, yPos + 6);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Children: Two children under 6 years are allowed.', hotelDetailsX + 5, yPos + 12);
  doc.text('Check In: 00:00:00', hotelDetailsX + 5, yPos + 17);
  doc.text('Check Out: 00:00:00', hotelDetailsX + 5, yPos + 22);
  
  yPos += 42;
  
  // Confirmed By (if available)
  if (data.confirmedBy) {
    doc.setFillColor(240, 240, 255);
    doc.rect(15, yPos, pageWidth - 30, 20, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPos, pageWidth - 30, 20, 'S');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.confirmedBy.name, pageWidth / 2, yPos + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('reservation', pageWidth / 2, yPos + 11, { align: 'center' });
    doc.text(data.confirmedBy.email, pageWidth / 2, yPos + 15, { align: 'center' });
    doc.text(data.confirmedBy.phone, pageWidth / 2, yPos + 19, { align: 'center' });
    
    yPos += 25;
  }
  
  // Terms & Conditions and Cancellation Policy
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions', 15, yPos);
  doc.text('شروط وأحكام', pageWidth - 40, yPos);
  
  yPos += 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  // English Terms (Left)
  const englishTerms = [
    '1. Cancellation must be made 7 days before',
    '   arrival, notice period 48 hours in advance.',
    '2. No refund for no-shows or early departures.',
    '3. Hotel reserves the right to cancel unconfirmed',
    '   bookings.'
  ];
  
  let termsY = yPos;
  englishTerms.forEach(term => {
    doc.text(term, 15, termsY);
    termsY += 4;
  });
  
  // Arabic Terms (Right)
  // Note: Arabic text rendering in jsPDF requires special fonts
  // For now, using placeholder - in production, use arabic-support plugin
  const arabicTerms = [
    'يجب الإلغاء قبل 7 أيام من الوصول',
    'فترة الإشعار 48 ساعة مسبقاً',
    'لا يوجد استرداد في حالة عدم الحضور',
    'يحتفظ الفندق بالحق في إلغاء الحجوزات',
    'غير المؤكدة'
  ];
  
  termsY = yPos;
  arabicTerms.forEach(term => {
    doc.text(term, pageWidth - 15, termsY, { align: 'right' });
    termsY += 4;
  });
  
  // Vertical separator line
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2, yPos - 2, pageWidth / 2, yPos + 18);
  
  yPos += 25;
  
  // Hotel Location and Customer Page
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel Location:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 255);
  if (data.hotelLocationUrl) {
    doc.textWithLink(data.hotelLocation, 45, yPos, { url: data.hotelLocationUrl });
  } else {
    doc.text(data.hotelLocation, 45, yPos);
  }
  
  yPos += 5;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('My Bookings Page:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 255);
  doc.textWithLink(data.customerPageUrl, 45, yPos, { url: data.customerPageUrl });
  
  // Footer
  const footerY = pageHeight - 25;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Official Business Name: Ethraa Company for Tourist Accommodation', pageWidth / 2, footerY + 5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  const today = new Date();
  doc.text(`Date: ${format(today, 'dd/MM/yyyy')}`, 15, footerY + 10);
  doc.text(`Hijri Date: ${toHijri(today)}`, 15, footerY + 15);
  
  doc.text('CR N°: 4031285856', pageWidth / 2 - 20, footerY + 10);
  doc.text('VAT N°: 302006094600003', pageWidth / 2 - 20, footerY + 15);
  
  doc.text('LIC N°: 73105372', pageWidth - 50, footerY + 10);
  doc.text('Class: 5 Star', pageWidth - 50, footerY + 15);
  
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

export function sharePDFViaWhatsApp(data: PDFBookingData) {
  const message = `*Booking Confirmation*\n\nBooking Number: ${data.bookingNumber}\nGuest Name: ${data.guestName}\nHotel: ${data.hotelNameEn}\nLocation: ${data.hotelLocation}\nCheck-in: ${format(data.checkIn, 'dd/MM/yyyy')}\nCheck-out: ${format(data.checkOut, 'dd/MM/yyyy')}\nNights: ${data.nights}\nRooms: ${data.rooms}\nGuests: ${data.guests}\nTotal: ${data.totalAmount.toFixed(2)} SAR\n\nView your bookings: ${data.customerPageUrl}`;
  
  const whatsappUrl = `https://wa.me/${data.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
