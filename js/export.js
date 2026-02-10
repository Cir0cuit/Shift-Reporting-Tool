const Export = {
    generatePDF(report, products) {
        if (!products || products.length === 0) {
            alert("No data to export.");
            return;
        }

        // Use the global jsPDF and autoTable
        const { jsPDF } = window.jspdf;
        // Landscape orientation
        const doc = new jsPDF({ orientation: 'landscape' });

        // Prepare data
        const pdfData = products.map(p => [
            p.productionOrder,
            p.name,
            p.hCode,
            p.twelvNC || '',
            p.comment,
            p.timeSpent || '',
            p.technicianName || ''
        ]);

        // Define column widths (in mm) - Total width ~275mm (A4 Landscape is 297mm width)
        const columnStyles = {
            0: { cellWidth: 25 },  // Production Order
            1: { cellWidth: 35 },  // Name  
            2: { cellWidth: 20 },  // H-Code
            3: { cellWidth: 30 },  // 12NC Code
            4: { cellWidth: 110 }, // Actions & Status (Much wider now)
            5: { cellWidth: 20 },  // Time spent
            6: { cellWidth: 35 }   // Technician
        };

        // Add header text (Single Line)
        doc.setFontSize(12);
        const headerText = `Shift Report  |  Reporter: ${report.reporter}  |  Shift: ${report.shift}  |  Date: ${report.date}`;
        doc.text(headerText, 15, 15);

        // Generate the table
        doc.autoTable({
            startY: 25,
            head: [['Production\nOrder', 'Name', 'H-Code', '12NC Code', 'Performed actions & status', 'Time spent', 'Technician']],
            body: pdfData,
            columnStyles: columnStyles,
            styles: {
                overflow: 'linebreak',
                cellPadding: 3,
                fontSize: 8,
                valign: 'middle'
            },
            didDrawCell: (data) => {
                // Increase row height if text is very long
                if (data.column.dataKey === 4 && data.cell.raw && data.cell.raw.length > 80) {
                    // autoTable handles height automatically mostly, but we can hint if needed
                }
            }
        });

        const fileName = `ShiftReport_${report.date}.pdf`;
        doc.save(fileName);
    },

    generateCSV(report, products) {
        if (!products || products.length === 0) {
            alert("No data to export.");
            return;
        }

        // Flat structure: Report Meta data in every row
        const headers = [
            'Date',
            'Shift',
            'Reporter',
            'Production Order',
            'Name',
            'H-Code',
            '12NC Code',
            'Performed actions & status',
            'Time spent',
            'Technician'
        ];

        // Add 'sep=;' hint for Excel to force it to recognize the separator
        let csvContent = 'sep=;\r\n' + headers.map(h => this.escapeCSV(h)).join(';') + '\r\n';

        products.forEach(p => {
            const row = [
                report.date,
                report.shift,
                report.reporter,
                p.productionOrder,
                p.name,
                p.hCode,
                p.twelvNC || '',
                p.comment || '',
                p.timeSpent || '',
                p.technicianName || ''
            ];
            csvContent += row.map(field => this.escapeCSV(field)).join(';') + '\r\n';
        });

        // Create download link with BOM for Excel compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ShiftReport_${report.date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    escapeCSV(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const stringField = String(field);
        // Escape if contains delimiter, quote, or newline
        if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    }
};
