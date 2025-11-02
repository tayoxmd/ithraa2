import type { Email } from '@/types/email';

export async function exportEmailToPDF(email: Email): Promise<void> {
  try {
    // استخدام مكتبة jsPDF بشكل ديناميكي
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // إضافة العنوان
    doc.setFontSize(16);
    doc.text('Email Details', 14, 20);
    
    // إضافة معلومات البريد
    doc.setFontSize(12);
    let y = 30;
    
    doc.text(`From: ${email.from_name} <${email.from_email}>`, 14, y);
    y += 7;
    doc.text(`To: ${email.to_name} <${email.to_email}>`, 14, y);
    y += 7;
    doc.text(`Subject: ${email.subject}`, 14, y);
    y += 7;
    doc.text(`Date: ${new Date(email.created_at).toLocaleString()}`, 14, y);
    y += 10;
    
    // إضافة المحتوى
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(email.body, 180);
    doc.text(lines, 14, y);
    
    // حفظ الملف
    doc.save(`email-${email.id}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    // Fallback: تصدير نصي
    const content = `
Email Details
=============
From: ${email.from_name} <${email.from_email}>
To: ${email.to_name} <${email.to_email}>
Subject: ${email.subject}
Date: ${new Date(email.created_at).toLocaleString()}

Content:
${email.body}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `email-${email.id}.txt`);
    link.click();
  }
}

export function exportEmailsToCSV(emails: Email[]): void {
  const headers = ['ID', 'Subject', 'From', 'To', 'Date', 'Status', 'Priority'];
  const rows = emails.map((email) => [
    email.id,
    email.subject,
    `${email.from_name} <${email.from_email}>`,
    `${email.to_name} <${email.to_email}>`,
    new Date(email.created_at).toLocaleString(),
    email.status,
    email.priority || 'normal',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `emails-${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportEmailsToJSON(emails: Email[]): void {
  const jsonContent = JSON.stringify(emails, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `emails-${new Date().toISOString()}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

