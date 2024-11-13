// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (result, type) => {
  try {
    const doc = new jsPDF();
    const now = new Date().toLocaleString();

    // Add title
    doc.setFontSize(16);
    doc.text(`${type} Experiment Results`, 14, 15);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${now}`, 14, 25);
    doc.text(`Experiment Date: ${new Date(result.createdAt.seconds * 1000).toLocaleString()}`, 14, 30);

    // Add experiment data
    doc.setFontSize(12);
    doc.text('Parameters:', 14, 40);

    const data = [];
    if (result.data) {
      Object.entries(result.data).forEach(([key, value]) => {
        if (key !== 'timestamp') {
          data.push([key, value.toString()]);
        }
      });
    }

    doc.autoTable({
      startY: 45,
      head: [['Parameter', 'Value']],
      body: data,
    });

    // Save PDF
    doc.save(`${type.toLowerCase()}-experiment-${Date.now()}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};