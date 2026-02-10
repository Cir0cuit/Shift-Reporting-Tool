let currentReportId = null;

// Initialize App
async function initApp() {
    try {
        await DB.init();

        // Default to today/morning or today/evening based on time
        const now = new Date();
        const today = now.toISOString().substring(0, 10);
        const hour = now.getHours();
        const defaultShift = hour >= 14 ? 'evening' : 'morning';

        document.getElementById('date').value = today;
        document.getElementById('shift').value = defaultShift;

        await loadReportForCurrentContext();
        setupEventListeners();
    } catch (error) {
        console.error("Failed to initialize app:", error);
        alert("Failed to initialize database. Please check console.");
    }
}

// Load Report based on selected Date and Shift
async function loadReportForCurrentContext() {
    const date = document.getElementById('date').value;
    const shift = document.getElementById('shift').value;

    // Try to find existing report
    const report = await DB.getReportByDateAndShift(date, shift);

    if (report) {
        currentReportId = report.id;
        // Don't overwrite date/shift inputs here, they are the source of truth for navigation.
        // Just update other header fields if needed (e.g. reporter)
        document.getElementById('reporter').value = report.reporter || '';

        await loadProducts(currentReportId);
    } else {
        // No report exists for this date/shift yet.
        currentReportId = null;
        document.getElementById('reporter').value = ''; // Clear reporter
        renderTable([]); // Clear table
    }
}

// Create report only when first interaction happens (add product or save header)
async function getOrCreateReportId() {
    if (currentReportId) return currentReportId;

    const date = document.getElementById('date').value;
    const shift = document.getElementById('shift').value;
    const reporter = document.getElementById('reporter').value;

    const report = await DB.createReport(date, shift);
    report.reporter = reporter; // Save reporter if entered
    await DB.updateReport(report);

    currentReportId = report.id;
    return currentReportId;
}


async function loadProducts(reportId) {
    const products = await DB.getProducts(reportId);
    renderTable(products);
}

function renderTable(products) {
    const tbody = document.getElementById('productTable').querySelector('tbody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${product.productionOrder}</td>
      <td>${product.name}</td>
      <td>${product.hCode}</td>
      <td>${product.twelvNC || ''}</td>
      <td>${product.comment}</td>
      <td>${product.timeSpent || ''}</td>
      <td>${product.technicianName || ''}</td>
      <td class="action-column"><button class="remove-btn" data-id="${product.id}">Remove</button></td>
    `;
        tbody.appendChild(row);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.dataset.id); // IndexedDB AutoIncrement keys are integers
            if (confirm('Are you sure you want to remove this item?')) {
                await DB.removeProduct(id);
                await loadProducts(currentReportId);
            }
        });
    });
}

async function handleAddProduct() {
    const reportId = await getOrCreateReportId();

    const productionOrder = document.getElementById('productionOrder').value.trim();
    const name = document.getElementById('productName').value.trim();
    const hCode = document.getElementById('hCode').value.trim();
    const comment = document.getElementById('comment').value.trim();
    const twelvNC = document.getElementById('twelvNC').value.trim();
    const timeSpent = document.getElementById('timeSpent').value.trim();
    const technicianName = document.getElementById('technicianName').value.trim();

    if (!productionOrder || !name || !hCode) {
        alert('Please fill in all required fields (Production Order, Name, H-Code).');
        return;
    }

    const product = {
        reportId: reportId,
        productionOrder,
        name,
        hCode,
        comment,
        twelvNC,
        timeSpent,
        technicianName
    };

    await DB.addProduct(product);

    // Clear form
    document.getElementById('productionOrder').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('hCode').value = '';
    document.getElementById('comment').value = '';
    document.getElementById('twelvNC').value = '';
    document.getElementById('timeSpent').value = '';
    document.getElementById('technicianName').value = '';

    await loadProducts(reportId);
}

async function handleHeaderChange(e) {
    // If date or shift changed, we switch context
    if (e.target.id === 'date' || e.target.id === 'shift') {
        await loadReportForCurrentContext();
        return;
    }

    // If reporter changed, update the current report if it exists
    if (currentReportId) {
        const reporter = document.getElementById('reporter').value;
        const shift = document.getElementById('shift').value;
        const date = document.getElementById('date').value;

        const report = {
            id: currentReportId,
            reporter,
            shift,
            date
        };

        await DB.updateReport(report);
    }
}

async function handleResetReport() {
    if (!currentReportId) return;
    if (!confirm('Are you sure you want to DELETE this report? This cannot be undone.')) return;

    await DB.deleteReportAndProducts(currentReportId);
    // After delete, reload context (which will now be empty)
    await loadReportForCurrentContext();
}

async function handleGeneratePDF() {
    if (!currentReportId) return;
    const report = {
        reporter: document.getElementById('reporter').value,
        shift: document.getElementById('shift').value,
        date: document.getElementById('date').value
    };
    const products = await DB.getProducts(currentReportId);
    Export.generatePDF(report, products);
}

async function handleGenerateCSV() {
    if (!currentReportId) return;
    const report = {
        reporter: document.getElementById('reporter').value,
        shift: document.getElementById('shift').value,
        date: document.getElementById('date').value
    };
    const products = await DB.getProducts(currentReportId);
    Export.generateCSV(report, products);
}

function setupEventListeners() {
    document.getElementById('addProduct').addEventListener('click', handleAddProduct);
    document.getElementById('generatePDF').addEventListener('click', handleGeneratePDF);
    document.getElementById('generateCSV').addEventListener('click', handleGenerateCSV);
    document.getElementById('resetReport').addEventListener('click', handleResetReport);

    document.getElementById('reporter').addEventListener('change', handleHeaderChange);
    document.getElementById('shift').addEventListener('change', handleHeaderChange);
    document.getElementById('date').addEventListener('change', handleHeaderChange);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);
