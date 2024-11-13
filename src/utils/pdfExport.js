// src/utils/pdfExport.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (experimentData, type) => {
  const doc = new jsPDF();
  const now = new Date().toLocaleString();

  // Add title
  doc.setFontSize(16);
  doc.text(`${type} Experiment Results`, 14, 15);

  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${now}`, 14, 25);

  // Add experiment data
  doc.setFontSize(12);
  doc.text('Parameters:', 14, 35);

  const data = [];
  Object.entries(experimentData.data).forEach(([key, value]) => {
    if (key !== 'timestamp') {
      data.push([key, value.toString()]);
    }
  });

  doc.autoTable({
    startY: 40,
    head: [['Parameter', 'Value']],
    body: data,
  });

  // Save PDF
  doc.save(`${type.toLowerCase()}-experiment-${Date.now()}.pdf`);
};