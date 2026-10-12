const fs = require('fs');
const path = require('path');

function parseCSV(content) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i++; // skip escaped quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
            currentRow.push(currentField);
            currentField = '';
            if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
        } else {
            currentField += char;
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
}

const dir = __dirname;
const assetCsv = fs.readFileSync(path.join(dir, 'ims_asset_inventory_2026-08-16 (1).csv'), 'utf8');
const vendorCsv = fs.readFileSync(path.join(dir, 'ims_vendors_list_2026-08-16.csv'), 'utf8');
const maintCsv = fs.readFileSync(path.join(dir, 'ims_maintenance_logs_2026-08-16.csv'), 'utf8');

const assetRows = parseCSV(assetCsv);
const vendorRows = parseCSV(vendorCsv);
const maintRows = parseCSV(maintCsv);

// 1. Vendors
const vendors = [];
const vendorHeaders = vendorRows[0].map(h => h.trim());
for (let i = 1; i < vendorRows.length; i++) {
    const r = vendorRows[i];
    if (!r[0]) continue;
    vendors.push({
        id: 'v-' + String(i).padStart(2, '0'),
        name: r[0].trim(),
        contactPerson: r[1] ? r[1].trim() : '',
        mobile: r[2] ? r[2].trim() : '',
        email: r[3] ? r[3].trim() : '',
        address: r[4] ? r[4].trim() : '',
        notes: r[5] ? r[5].trim() : ''
    });
}
// Add Organ Technology BD if not in vendors list
if (!vendors.some(v => v.name.toLowerCase().includes('organ technology'))) {
    vendors.push({
        id: 'v-02',
        name: 'Organ Technology BD',
        contactPerson: 'Support',
        mobile: '',
        email: '',
        address: 'Dhaka, Bangladesh',
        notes: 'Display & hardware parts supplier'
    });
}

// 2. Assets
const assets = [];
const assetHeaders = assetRows[0].map(h => h.trim());
const categories = new Set();
const departments = new Set();
const employeesMap = new Map();

for (let i = 1; i < assetRows.length; i++) {
    const row = assetRows[i];
    if (row.length < 2 || !row[0]) continue;

    const getVal = (colName) => {
        const idx = assetHeaders.indexOf(colName);
        return idx !== -1 && row[idx] !== undefined ? row[idx].trim() : '';
    };

    const tag = getVal('Asset Tag');
    const name = getVal('Asset Name');
    if (!tag || !name) continue;

    const cat = getVal('Category') || 'Computer';
    const dept = getVal('Department');
    const user = getVal('Assigned User');

    if (cat) categories.add(cat);
    if (dept) departments.add(dept);
    if (user && dept) {
        employeesMap.set(user, dept);
    }

    // Default vendor ID (GOTech Computer)
    const vendorId = vendors[0].id;

    assets.push({
        id: 'a-' + String(i).padStart(3, '0'),
        name: name,
        tag: tag,
        category: cat,
        brand: getVal('Brand') || 'Generic',
        model: getVal('Model'),
        serial: getVal('Serial Number'),
        specs: getVal('Specs'),
        price: parseFloat(getVal('Valuation Cost')) || 0,
        status: getVal('Status') || 'Available',
        assignedUser: user,
        department: dept,
        vendorId: vendorId,
        purchaseDate: getVal('Purchase Date') || '2024-01-01',
        warrantyExpiry: getVal('Warranty Expiry'),
        notes: getVal('Notes'),
        attachedPhoto: '',
        attachedInvoice: ''
    });
}

// 3. Maintenance Logs
const maintHeaders = maintRows[0].map(h => h.trim());
const maintenance = [];
for (let i = 1; i < maintRows.length; i++) {
    const row = maintRows[i];
    if (!row[0]) continue;

    const getVal = (colName) => {
        const idx = maintHeaders.indexOf(colName);
        return idx !== -1 && row[idx] !== undefined ? row[idx].trim() : '';
    };

    const tag = getVal('Asset Tag');
    const matchedAsset = assets.find(a => a.tag === tag);
    const vName = getVal('Supplier/Vendor Name') || 'GOTech Computer';
    const matchedVendor = vendors.find(v => v.name.toLowerCase() === vName.toLowerCase()) || vendors[0];

    maintenance.push({
        id: 'm-' + String(i).padStart(2, '0'),
        assetId: matchedAsset ? matchedAsset.id : 'a-unknown',
        assetName: matchedAsset ? matchedAsset.name : tag,
        assetTag: tag,
        partReplaced: getVal('Part Replaced'),
        cost: parseFloat(getVal('Cost')) || 0,
        vendorId: matchedVendor.id,
        vendorName: matchedVendor.name,
        date: getVal('Date Performed'),
        status: getVal('Status') || 'Completed',
        description: getVal('Description'),
        reason: getVal('Reason'),
        completedEdits: 0
    });
}

// 4. Employees
const employees = [];
for (const [name, dept] of employeesMap.entries()) {
    employees.push({ name, department: dept });
}

// 5. Initial Transactions based on real maintenance
const transactions = [];
maintenance.forEach((m, idx) => {
    transactions.push({
        id: 't-' + String(idx + 1).padStart(2, '0'),
        timestamp: new Date(m.date).toISOString(),
        type: 'Maintenance',
        assetTag: m.assetTag,
        assetName: m.assetName,
        details: `Hardware upgrade/repair: "${m.partReplaced}" status [${m.status}] supplied by ${m.vendorName}. Reason: ${m.reason}.`,
        operator: 'IT Admin (ADMIN)'
    });
});

console.log('Processed Assets:', assets.length);
console.log('Processed Categories:', Array.from(categories));
console.log('Processed Departments:', Array.from(departments));
console.log('Processed Employees:', employees.length);
console.log('Processed Maintenance Logs:', maintenance.length);
console.log('Processed Vendors:', vendors.length);

// Generate demo-data.js
const jsContent = `// IMS IT Asset & Inventory Manager - Real Production Database
// Auto-generated from user production records

const DEFAULT_VENDORS = ${JSON.stringify(vendors, null, 4)};

const DEFAULT_EMPLOYEES = ${JSON.stringify(employees, null, 4)};

const DEFAULT_CATEGORIES = ${JSON.stringify(Array.from(categories), null, 4)};

const DEFAULT_DEPARTMENTS = ${JSON.stringify(Array.from(departments), null, 4)};

const DEFAULT_ASSETS = ${JSON.stringify(assets, null, 4)};

const DEFAULT_MAINTENANCE_LOGS = ${JSON.stringify(maintenance, null, 4)};

const DEFAULT_TRANSACTIONS = ${JSON.stringify(transactions, null, 4)};

// Helper variables for global state
window.IMS_SEED_DATA = {
    vendors: DEFAULT_VENDORS,
    employees: DEFAULT_EMPLOYEES,
    categories: DEFAULT_CATEGORIES,
    departments: DEFAULT_DEPARTMENTS,
    assets: DEFAULT_ASSETS,
    maintenance: DEFAULT_MAINTENANCE_LOGS,
    transactions: DEFAULT_TRANSACTIONS
};
console.log("Real IMS Production Dataset (${assets.length} assets) loaded into window.IMS_SEED_DATA");
`;

fs.writeFileSync(path.join(dir, 'demo-data.js'), jsContent, 'utf8');
console.log('Successfully wrote real production dataset to demo-data.js!');
