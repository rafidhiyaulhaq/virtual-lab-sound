// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (result, type) => {
 try {
   if (!result || !result.data) {
     throw new Error('No data to export');
   }

   const doc = new jsPDF();
   const now = new Date().toLocaleString();

   // Header styling
   doc.setFontSize(20);
   doc.setTextColor(55, 71, 79); // Primary color
   doc.text(`${type} Experiment Results`, 14, 20);

   // Metadata section
   doc.setFontSize(12);
   doc.setTextColor(84, 110, 122); // Secondary color
   doc.text(`Generated: ${now}`, 14, 30);
   doc.text(
     `Experiment Date: ${new Date(result.createdAt.seconds * 1000).toLocaleString()}`, 
     14, 
     40
   );

   // Parameters section
   doc.setFontSize(14);
   doc.setTextColor(55, 71, 79);
   doc.text('Experiment Parameters:', 14, 55);

   // Convert data to table format
   const data = Object.entries(result.data)
     .filter(([key]) => key !== 'timestamp')
     .map(([key, value]) => [
       key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
       typeof value === 'number' ? value.toFixed(2) : value.toString()
     ]);

   // Add table
   doc.autoTable({
     startY: 60,
     head: [['Parameter', 'Value']],
     body: data,
     styles: {
       fontSize: 12,
       cellPadding: 5,
       lineColor: [55, 71, 79],
       lineWidth: 0.1,
     },
     headStyles: {
       fillColor: [55, 71, 79],
       textColor: 255,
       fontSize: 12,
       fontStyle: 'bold',
     },
     alternateRowStyles: {
       fillColor: [245, 245, 245],
     },
     margin: { top: 60 },
   });

   // Add footer
   const pageCount = doc.internal.getNumberOfPages();
   doc.setFontSize(10);
   doc.setTextColor(128, 128, 128);
   for(let i = 1; i <= pageCount; i++) {
     doc.setPage(i);
     doc.text(
       `Page ${i} of ${pageCount}`,
       doc.internal.pageSize.getWidth() / 2, 
       doc.internal.pageSize.getHeight() - 10,
       { align: 'center' }
     );
   }

   // Save the PDF
   const filename = `${type.toLowerCase()}-experiment-${Date.now()}.pdf`;
   doc.save(filename);

   return true;
 } catch (error) {
   console.error('Error generating PDF:', error);
   throw error;
 }
};