# Shift Reporting Tool

**A lightweight, browser-based report management system for shift workers.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)

This tool was originally developed to streamline shift handovers and production reporting for my team. It is now open-source and available for anyone needing a simple, offline-capable solution for tracking shift activities, defects, and production metrics.

## 🚀 Features

*   **Zero Dependencies (Run Locally)**: Built with vanilla HTML, CSS, and JavaScript. No server or backend required. Just open `index.html`.
*   **Offline First**: Uses the browser's **IndexedDB** to store all reports locally on your device. Your data persists even if you close the browser.
*   **Multi-Report History**: Automatically archives reports by **Date** and **Shift**. Easily navigate back to view or edit past reports.
*   **Responsive Design**: optimized for desktops, tablets, and mobile devices.
*   **Professional Exports**:
    *   **PDF**: Generates landscape-formatted PDF reports suitable for printing and archiving.
    *   **CSV**: Exports flat-table CSV files compatible with **Microsoft Excel** (includes BOM and correct separators) for data analysis and pivoting.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+)
*   **Storage**: IndexedDB (Client-side database)
*   **Libraries**:
    *   [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
    *   [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) - Valid HTML table to PDF conversion

## 📖 How to Use

1.  **Download** or **Clone** the repository.
2.  **Open** the `index.html` file in any modern web browser (Chrome, Edge, Firefox, Safari).
3.  **Start Reporting**:
    *   Select the **Date** and **Shift** (Morning/Evening).
    *   Enter your name in the **Reporter** field.
    *   Add items using the **Add Product** form.
4.  **Export**:
    *   Click **Generate PDF** for a printable version.
    *   Click **Generate CSV** for an Excel-ready data file.

## 🤝 Contributing

This project is released as-is. Feel free to **fork** this repository and customize it for your own team's needs!

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
