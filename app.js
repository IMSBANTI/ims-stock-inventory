// IMS IT Asset & Inventory Manager - Core Application Engine (Upgraded v2.0)

// Global state holding database records and authentication role
let state = {
    assets: [],
    vendors: [],
    employees: [],
    maintenance: [],
    transactions: [],
    categories: ['Laptop', 'Computer', 'Printer', 'UPS', 'Accessory', 'Monitor', 'Scanner'],
    departments: ['IT Consultant', 'Studio', 'Human Resources', 'Finance & Accounts', 'IT', 'Operations', 'Business Development', 'Outsourcing', 'CLAN'],
    theme: 'dark',
    role: 'guest', // 'guest', 'admin', 'staff'
    isAdmin: false,
    authToken: '',
    adminPassword: 'queenbee',
    staffPassword: 'ims'
};

// Cloud database connectivity flags
window.IMS_NEON_ACTIVE = false;
let neonCloudInitialSyncDone = false;

// Global Chart instance references
let categoryChart = null;
let departmentChart = null;

// Table Sort configuration
let sortConfig = {
    column: 'tag',
    direction: 'asc'
};

// Pagination configurations
let paginationConfig = {
    currentPage: 1,
    pageSize: 20
};

let dashboardMaintPagination = {
    currentPage: 1,
    pageSize: 5
};

let logsPagination = {
    currentPage: 1,
    pageSize: 50
};

// Dashboard active maintenance tab ('logs' or 'cost')
let activeMaintTab = 'logs';

// Temporary Base64 stores for file attachments inside forms
let tempAttachedPhoto = '';
let tempAttachedInvoice = '';
let tempMaintInvoice = '';

// ================= SECURITY / ESCAPING HELPERS =================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatTaka(val) {
    const num = parseFloat(val) || 0;
    return '৳' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (state.authToken) {
        headers['Authorization'] = `Bearer ${state.authToken}`;
    }
    return headers;
}

// ================= DOM ELEMENT REFERENCES =================
const DOM = {
    // Auth elements
    loginOverlay: document.getElementById('login-overlay'),
    loginForm: document.getElementById('login-form'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    loginErrorMsg: document.getElementById('login-error-msg'),
    loginSubmitBtn: document.getElementById('login-submit-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    appWrapper: document.getElementById('app-wrapper'),
    roleDisplayBadge: document.getElementById('role-display-badge'),

    // Navigation
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIconPath: document.getElementById('theme-icon-path'),

    // Settings Operations
    settingsSeedBtn: document.getElementById('settings-seed-btn'),
    settingsResetBtn: document.getElementById('settings-reset-btn'),
    changePasswordForm: document.getElementById('change-password-form'),
    changePasswordRole: document.getElementById('change-password-role'),
    oldPasswordInput: document.getElementById('old-password'),
    newPasswordInput: document.getElementById('new-password'),
    confirmPasswordInput: document.getElementById('confirm-password'),
    neonSyncDetails: document.getElementById('neon-sync-details'),
    btnNeonPull: document.getElementById('btn-neon-pull'),
    btnNeonPush: document.getElementById('btn-neon-push'),

    // Cloud Sync Badge
    syncStatusBadge: document.getElementById('sync-status-badge'),

    // Dashboard KPIs
    dashLiveSummary: document.getElementById('dash-live-summary'),
    pillAvailableStock: document.getElementById('pill-available-stock'),
    pillAvailableText: document.getElementById('pill-available-text'),
    pillWarrantyAlerts: document.getElementById('pill-warranty-alerts'),
    pillWarrantyText: document.getElementById('pill-warranty-text'),
    dashQuickAddBtn: document.getElementById('dash-quick-add-btn'),
    dashQuickExportBtn: document.getElementById('dash-quick-export-btn'),
    kpiWorkstations: document.getElementById('kpi-workstations'),
    kpiDeploymentRate: document.getElementById('kpi-deployment-rate'),
    kpiDeploymentBar: document.getElementById('kpi-deployment-bar'),
    kpiDeploymentSub: document.getElementById('kpi-deployment-sub'),
    kpiMaintenance: document.getElementById('kpi-maintenance'),
    kpiVendors: document.getElementById('kpi-vendors'),
    kpiTotalValue: document.getElementById('kpi-total-value'),
    kpiUnpaidCost: document.getElementById('kpi-unpaid-cost'),
    kpiUnpaidCount: document.getElementById('kpi-unpaid-count'),
    dashboardMaintContainer: document.getElementById('dashboard-maint-container'),
    dashboardMaintPagination: document.getElementById('dashboard-maint-pagination'),
    dashboardMaintInfo: document.getElementById('dashboard-maint-info'),
    btnDashMaintPrev: document.getElementById('btn-dash-maint-prev'),
    btnDashMaintNext: document.getElementById('btn-dash-maint-next'),
    btnMaintTabLogs: document.getElementById('btn-maint-tab-logs'),
    btnMaintTabCost: document.getElementById('btn-maint-tab-cost'),
    dashboardMaintCostContainer: document.getElementById('dashboard-maint-cost-container'),

    // Inventory Controls
    inventorySearch: document.getElementById('inventory-search'),
    filterCategory: document.getElementById('filter-category'),
    filterDepartment: document.getElementById('filter-department'),
    filterStatus: document.getElementById('filter-status'),
    filterWarranty: document.getElementById('filter-warranty'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    inventoryTableBody: document.getElementById('inventory-table-body'),
    inventoryEmptyState: document.getElementById('inventory-empty-state'),
    inventoryPagination: document.getElementById('inventory-pagination'),
    paginationLimit: document.getElementById('pagination-limit'),
    paginationInfo: document.getElementById('pagination-info'),
    btnPagePrev: document.getElementById('btn-page-prev'),
    btnPageNext: document.getElementById('btn-page-next'),
    paginationPagesContainer: document.getElementById('pagination-pages-container'),
    addAssetBtn: document.getElementById('add-asset-btn'),
    exportCsvBtn: document.getElementById('export-csv-btn'),
    importCsvFile: document.getElementById('import-csv-file'),
    exportVendorsCsvBtn: document.getElementById('export-vendors-csv-btn'),
    importVendorsCsvFile: document.getElementById('import-vendors-csv-file'),
    exportMaintCsvBtn: document.getElementById('export-maint-csv-btn'),
    importMaintCsvFile: document.getElementById('import-maint-csv-file'),

    // Table Headers for sorting
    thTag: document.getElementById('th-tag'),
    thName: document.getElementById('th-name'),
    thCategory: document.getElementById('th-category'),
    thStatus: document.getElementById('th-status'),
    thUser: document.getElementById('th-user'),

    // Drawer Panel
    assetDrawer: document.getElementById('asset-drawer'),
    assetDrawerBackdrop: document.getElementById('asset-drawer-backdrop'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerTag: document.getElementById('drawer-tag'),
    drawerTitle: document.getElementById('drawer-title'),
    drawerStatus: document.getElementById('drawer-status'),
    drawerAssignmentDesc: document.getElementById('drawer-assignment-desc'),
    drawerAssignmentActions: document.getElementById('drawer-assignment-actions'),
    drawerBrandModel: document.getElementById('drawer-brand-model'),
    drawerSerial: document.getElementById('drawer-serial'),
    drawerSpecs: document.getElementById('drawer-specs'),
    drawerPrice: document.getElementById('drawer-price'),
    drawerVendorName: document.getElementById('drawer-vendor-name'),
    drawerVendorMobile: document.getElementById('drawer-vendor-mobile'),
    drawerPurchaseDate: document.getElementById('drawer-purchase-date'),
    drawerWarrantyExpiry: document.getElementById('drawer-warranty-expiry'),
    drawerWarrantyBadge: document.getElementById('drawer-warranty-badge'),
    btnDrawerExtendWarranty: document.getElementById('btn-drawer-extend-warranty'),
    drawerMaintenanceList: document.getElementById('drawer-maintenance-list'),
    drawerEditBtn: document.getElementById('drawer-edit-btn'),
    drawerRetireBtn: document.getElementById('drawer-retire-btn'),
    drawerDeleteBtn: document.getElementById('drawer-delete-btn'),
    drawerPrintHandoverBtn: document.getElementById('drawer-print-handover-btn'),
    btnDrawerAddMaintenance: document.getElementById('btn-drawer-add-maintenance'),

    // Attachments drawer display
    drawerPhotoContainer: document.getElementById('drawer-photo-container'),
    drawerPhotoImg: document.getElementById('drawer-photo-img'),
    drawerInvoiceRow: document.getElementById('drawer-invoice-row'),
    drawerInvoiceDownloadBtn: document.getElementById('drawer-invoice-download-btn'),
    drawerNotesRow: document.getElementById('drawer-notes-row'),
    drawerNotes: document.getElementById('drawer-notes'),

    // Lightbox modal elements
    lightboxOverlay: document.getElementById('lightbox-overlay'),
    lightboxImg: document.getElementById('lightbox-img'),

    // Vendors View
    vendorsSearch: document.getElementById('vendors-search'),
    vendorsGridContainer: document.getElementById('vendors-grid-container'),
    vendorsEmptyState: document.getElementById('vendors-empty-state'),
    addVendorBtn: document.getElementById('add-vendor-btn'),

    // Logs View
    logsSearch: document.getElementById('logs-search'),
    filterLogType: document.getElementById('filter-log-type'),
    logsTableBody: document.getElementById('logs-table-body'),
    logsEmptyState: document.getElementById('logs-empty-state'),
    logsPagination: document.getElementById('logs-pagination'),
    logsPaginationInfo: document.getElementById('logs-pagination-info'),
    btnLogsPrev: document.getElementById('btn-logs-prev'),
    btnLogsNext: document.getElementById('btn-logs-next'),
    clearLogsBtn: document.getElementById('clear-logs-btn'),

    // Asset Modal Elements
    assetModal: document.getElementById('asset-modal'),
    assetForm: document.getElementById('asset-form'),
    assetFormId: document.getElementById('asset-form-id'),
    assetModalTitle: document.getElementById('asset-modal-title'),
    assetNameInput: document.getElementById('asset-name'),
    assetTagPrefix: document.getElementById('asset-tag-prefix'),
    assetTagInput: document.getElementById('asset-tag'),
    assetTagHint: document.getElementById('asset-tag-hint'),
    btnAutoGenerateTag: document.getElementById('btn-auto-generate-tag'),
    assetCategoryInput: document.getElementById('asset-category'),
    assetBrandInput: document.getElementById('asset-brand'),
    assetModelInput: document.getElementById('asset-model'),
    assetSerialInput: document.getElementById('asset-serial'),
    assetSpecsInput: document.getElementById('asset-specs'),
    assetPriceInput: document.getElementById('asset-price'),
    assetVendorSelect: document.getElementById('asset-vendor'),
    assetPurchaseDateInput: document.getElementById('asset-purchase-date'),
    assetWarrantyInput: document.getElementById('asset-warranty'),
    assetNotesInput: document.getElementById('asset-notes'),

    // Upload controls inside form
    assetPhotoInput: document.getElementById('asset-photo-input'),
    assetInvoiceInput: document.getElementById('asset-invoice-input'),
    photoFileStatus: document.getElementById('photo-file-status'),
    invoiceFileStatus: document.getElementById('invoice-file-status'),
    btnRemovePhoto: document.getElementById('btn-remove-photo'),
    btnRemoveInvoice: document.getElementById('btn-remove-invoice'),

    // Assign Modal Elements
    assignModal: document.getElementById('assign-modal'),
    assignForm: document.getElementById('assign-form'),
    assignFormAssetId: document.getElementById('assign-form-asset-id'),
    assignAssetName: document.getElementById('assign-asset-name'),
    assignUserInput: document.getElementById('assign-user'),
    assignDeptSelect: document.getElementById('assign-dept'),
    employeesListDatalist: document.getElementById('employees-list'),

    // Maintenance Modal Elements
    maintenanceModal: document.getElementById('maintenance-modal'),
    maintenanceForm: document.getElementById('maintenance-form'),
    maintenanceFormAssetId: document.getElementById('maintenance-form-asset-id'),
    maintenanceFormLogId: document.getElementById('maintenance-form-log-id'),
    maintenanceModalTitle: document.getElementById('maintenance-modal-title'),
    maintenanceAssetDisplay: document.getElementById('maintenance-asset-display'),
    maintPartInput: document.getElementById('maint-part'),
    maintCostInput: document.getElementById('maint-cost'),
    maintVendorSelect: document.getElementById('maint-vendor'),
    maintDateInput: document.getElementById('maint-date'),
    maintStatusSelect: document.getElementById('maint-status'),
    maintDescInput: document.getElementById('maint-desc'),
    maintReasonInput: document.getElementById('maint-reason'),
    maintInvoiceInput: document.getElementById('maint-invoice-input'),
    maintInvoiceStatus: document.getElementById('maint-invoice-status'),
    btnRemoveMaintInvoice: document.getElementById('btn-remove-maint-invoice'),

    // Vendor Modal Elements
    vendorModal: document.getElementById('vendor-modal'),
    vendorForm: document.getElementById('vendor-form'),
    vendorFormId: document.getElementById('vendor-form-id'),
    vendorModalTitle: document.getElementById('vendor-modal-title'),
    vendorNameInput: document.getElementById('vendor-name'),
    vendorContactInput: document.getElementById('vendor-contact'),
    vendorMobileInput: document.getElementById('vendor-mobile'),
    vendorEmailInput: document.getElementById('vendor-email'),
    vendorAddressInput: document.getElementById('vendor-address'),
    vendorNotesInput: document.getElementById('vendor-notes')
};

// ================= APP INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
    loadState();
    setupEventListeners();
    checkCustomLogo();
    await checkServerStatus();
    await checkActiveSession();
});

// ================= AUTHENTICATION HANDLERS =================
function showLoginError(msg) {
    if (!DOM.loginErrorMsg) return;
    if (msg) {
        DOM.loginErrorMsg.textContent = msg;
        DOM.loginErrorMsg.style.display = 'block';
    } else {
        DOM.loginErrorMsg.textContent = '';
        DOM.loginErrorMsg.style.display = 'none';
    }
}

async function checkServerStatus() {
    try {
        const res = await fetch('/api/db/status');
        if (res.ok) {
            const status = await res.json();
            if (status && status.connected && status.mode === 'neon-postgresql') {
                window.IMS_NEON_ACTIVE = true;
                updateNeonSettingsInfo(true);
            } else {
                window.IMS_NEON_ACTIVE = false;
                updateNeonSettingsInfo(false);
            }
        }
    } catch {
        window.IMS_NEON_ACTIVE = false;
        updateNeonSettingsInfo(false);
    }
}

function updateNeonSettingsInfo(connected) {
    if (!DOM.neonSyncDetails) return;
    if (connected) {
        DOM.neonSyncDetails.innerHTML = '☁️ <strong>Connected to Neon PostgreSQL Cloud.</strong> Every change made by Admin is automatically saved to your cloud database and synced across all browsers & devices.';
    } else {
        DOM.neonSyncDetails.innerHTML = '💻 <strong>Running in Local Browser Mode.</strong> Connect <code>DATABASE_URL</code> on Render or in <code>.env</code> to activate Neon PostgreSQL cloud sync.';
    }
}

async function checkActiveSession() {
    const savedRole = localStorage.getItem('ims_role');
    const savedToken = localStorage.getItem('ims_auth_token') || '';
    state.authToken = savedToken;

    if (savedToken) {
        try {
            const res = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${savedToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.valid) {
                    await loginUser(data.role);
                    return;
                }
            } else if (res.status === 401) {
                // Token expired or invalid
                clearSessionStorage();
                showLoginScreen();
                return;
            }
        } catch {
            // Offline / static file mode fallback
            if (savedRole === 'admin' || savedRole === 'staff') {
                await loginUser(savedRole);
                return;
            }
        }
    } else if (!window.IMS_NEON_ACTIVE && (savedRole === 'admin' || savedRole === 'staff')) {
        // Offline local-only fallback when server is not running with Neon
        await loginUser(savedRole);
        return;
    }

    showLoginScreen();
}

function showLoginScreen() {
    DOM.loginOverlay.style.display = 'flex';
    DOM.appWrapper.style.display = 'none';
}

function clearSessionStorage() {
    state.role = 'guest';
    state.isAdmin = false;
    state.authToken = '';
    localStorage.removeItem('ims_role');
    localStorage.removeItem('ims_auth_token');
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    showLoginError('');

    const username = DOM.loginUsername.value.trim().toLowerCase();
    const password = DOM.loginPassword.value.trim();

    if (DOM.loginSubmitBtn) {
        DOM.loginSubmitBtn.disabled = true;
        DOM.loginSubmitBtn.textContent = 'Signing in...';
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await res.json();
        if (res.ok && result && result.success) {
            state.authToken = result.token || '';
            if (state.authToken) {
                localStorage.setItem('ims_auth_token', state.authToken);
            }
            await loginUser(result.role);
            return;
        } else {
            showLoginError(result.message || 'Invalid username or password.');
            return;
        }
    } catch {
        // Server genuinely unreachable (offline / opened directly via file://)
        const adminPass = state.adminPassword || 'queenbee';
        const staffPass = state.staffPassword || 'ims';
        if (username === 'admin' && password === adminPass) {
            await loginUser('admin');
        } else if (username === 'staff' && password === staffPass) {
            await loginUser('staff');
        } else {
            showLoginError('Invalid username or password.');
        }
    } finally {
        if (DOM.loginSubmitBtn) {
            DOM.loginSubmitBtn.disabled = false;
            DOM.loginSubmitBtn.textContent = 'Sign In';
        }
    }
}

async function loginUser(role) {
    state.role = role;
    state.isAdmin = (role === 'admin');
    localStorage.setItem('ims_role', role);

    DOM.loginOverlay.style.display = 'none';
    DOM.appWrapper.style.display = 'flex';

    const badge = DOM.roleDisplayBadge;
    badge.textContent = `${role} view`;
    badge.className = role === 'admin' ? 'role-badge' : 'role-badge role-staff';

    applyPrivilegeRestrictions();

    // ALWAYS pull live cloud data from Neon BEFORE checking local empty/seed state
    let loadedFromCloud = false;
    if (window.IMS_NEON_ACTIVE && state.authToken) {
        loadedFromCloud = await pullFromNeonCloud(false);
    }
    neonCloudInitialSyncDone = true;

    if (!loadedFromCloud) {
        const hasOldMockData = state.assets.some(a => a.tag === 'IMS-LAP-001' && a.name === 'Dell XPS 15');
        if ((state.assets.length === 0 && state.vendors.length === 0) || hasOldMockData) {
            seedDemoData(false);
            return;
        }
    }
    renderAll();
}

function logoutUser() {
    clearSessionStorage();
    DOM.loginUsername.value = '';
    DOM.loginPassword.value = '';
    showLoginError('');
    showLoginScreen();
}

function applyPrivilegeRestrictions() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        if (state.isAdmin) {
            el.classList.remove('staff-restricted');
        } else {
            el.classList.add('staff-restricted');
        }
    });

    const logsTabBtn = document.querySelector('.tab-btn[data-tab="logs-tab"]');
    const settingsTabBtn = document.querySelector('.tab-btn[data-tab="settings-tab"]');
    if (!state.isAdmin) {
        if (logsTabBtn) logsTabBtn.style.display = 'none';
        if (settingsTabBtn) settingsTabBtn.style.display = 'none';
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab && (activeTab.getAttribute('data-tab') === 'logs-tab' || activeTab.getAttribute('data-tab') === 'settings-tab')) {
            switchTab('dashboard-tab');
        }
    } else {
        if (logsTabBtn) logsTabBtn.style.display = 'flex';
        if (settingsTabBtn) settingsTabBtn.style.display = 'flex';
    }

    if (window.IMS_NEON_ACTIVE) {
        showSyncStatus('success', '☁️ NEON CLOUD SYNCED');
    } else {
        showSyncStatus('disabled', 'LOCAL VIEW');
    }
}

// ================= SMART AUTO-GENERATED ASSET TAG ENGINE =================
function getCategorySeriesConfig(prefix, category) {
    const p = (prefix || 'IMS').toUpperCase();
    const cat = (category || '').toLowerCase();

    // Matches your company's real numbering series from IMS production records
    if (p === 'IMS') {
        if (cat.includes('laptop')) return { min: 1000, max: 1999, start: 1001, pad: 4 };
        if (cat.includes('computer') || cat.includes('desktop') || cat.includes('pc')) return { min: 3000, max: 3999, start: 3001, pad: 4 };
        if (cat.includes('monitor')) return { min: 4000, max: 4999, start: 4001, pad: 4 };
        if (cat.includes('accessory') || cat.includes('spare')) return { min: 300, max: 999, start: 301, pad: 3 };
        if (cat.includes('printer') || cat.includes('scanner')) return { min: 5000, max: 5999, start: 5001, pad: 4 };
        if (cat.includes('ups')) return { min: 6000, max: 6999, start: 6001, pad: 4 };
        return { min: 1000, max: 9999, start: 1001, pad: 4 };
    }
    if (p === 'STU') {
        if (cat.includes('monitor')) return { min: 4000, max: 4999, start: 4001, pad: 4 };
        if (cat.includes('ups')) return { min: 5000, max: 5999, start: 5001, pad: 4 };
        return { min: 2000, max: 2999, start: 2001, pad: 4 };
    }
    if (p === 'OUT') {
        return { min: 2000, max: 2999, start: 2001, pad: 4 };
    }
    if (p === 'CLAN') {
        if (cat.includes('accessory') || cat.includes('spare')) return { min: 300, max: 399, start: 301, pad: 3 };
        if (cat.includes('monitor')) return { min: 400, max: 499, start: 401, pad: 3 };
        if (cat.includes('ups')) return { min: 500, max: 599, start: 501, pad: 3 };
        return { min: 200, max: 299, start: 201, pad: 3 };
    }
    if (p === 'ACC') {
        return { min: 100, max: 999, start: 101, pad: 3 };
    }
    return { min: 1000, max: 9999, start: 1001, pad: 4 };
}

function generateNextAssetTag(prefix, category) {
    const p = (prefix || 'IMS').toUpperCase();
    const series = getCategorySeriesConfig(p, category);
    const regex = new RegExp(`^${p}-(\\d+)$`, 'i');

    let highest = 0;
    let lastFoundTag = null;

    state.assets.forEach(a => {
        if (!a.tag) return;
        const m = a.tag.trim().toUpperCase().match(regex);
        if (m) {
            const num = parseInt(m[1], 10);
            if (num >= series.min && num <= series.max && num > highest) {
                highest = num;
                lastFoundTag = a.tag.trim().toUpperCase();
            }
        }
    });

    let nextNum = highest > 0 ? highest + 1 : series.start;
    let candidate = `${p}-${String(nextNum).padStart(series.pad, '0')}`;

    // Guarantee uniqueness against all existing tags
    while (state.assets.some(a => (a.tag || '').toUpperCase() === candidate)) {
        nextNum++;
        candidate = `${p}-${String(nextNum).padStart(series.pad, '0')}`;
    }

    return { tag: candidate, lastTag: lastFoundTag };
}

function applyAutoGeneratedTag() {
    const prefix = DOM.assetTagPrefix ? DOM.assetTagPrefix.value : 'IMS';
    const category = DOM.assetCategoryInput ? DOM.assetCategoryInput.value : 'Laptop';
    const { tag, lastTag } = generateNextAssetTag(prefix, category);

    if (DOM.assetTagInput) DOM.assetTagInput.value = tag;
    if (DOM.assetTagHint) {
        DOM.assetTagHint.textContent = lastTag
            ? `Last used in series: ${lastTag}`
            : `Starting new ${prefix} series`;
    }
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
    DOM.loginForm.addEventListener('submit', handleLoginSubmit);
    DOM.logoutBtn.addEventListener('click', logoutUser);

    DOM.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab === 'inventory-tab') {
                resetInventoryFilters();
            }
            switchTab(targetTab);
        });
    });

    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Settings actions
    if (DOM.settingsSeedBtn) DOM.settingsSeedBtn.addEventListener('click', () => seedDemoData(true));
    if (DOM.settingsResetBtn) DOM.settingsResetBtn.addEventListener('click', confirmResetDatabase);
    if (DOM.changePasswordForm) DOM.changePasswordForm.addEventListener('submit', handlePasswordChange);

    // Neon manual sync controls
    if (DOM.btnNeonPull) DOM.btnNeonPull.addEventListener('click', () => pullFromNeonCloud(true));
    if (DOM.btnNeonPush) DOM.btnNeonPush.addEventListener('click', () => triggerNeonCloudSync(true, true));
    if (DOM.syncStatusBadge) {
        DOM.syncStatusBadge.addEventListener('click', () => {
            if (window.IMS_NEON_ACTIVE && state.isAdmin && DOM.syncStatusBadge.classList.contains('sync-error')) {
                triggerNeonCloudSync(true, true);
            }
        });
    }

    // Modal Tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchModalTab(btn.getAttribute('data-modal-tab')));
    });

    // Smart Auto-Tag Controls
    if (DOM.btnAutoGenerateTag) {
        DOM.btnAutoGenerateTag.addEventListener('click', applyAutoGeneratedTag);
    }
    if (DOM.assetTagPrefix) {
        DOM.assetTagPrefix.addEventListener('change', () => {
            if (!DOM.assetFormId.value) applyAutoGeneratedTag();
        });
    }
    if (DOM.assetCategoryInput) {
        DOM.assetCategoryInput.addEventListener('change', () => {
            if (!DOM.assetFormId.value) {
                // Auto-suggest ACC prefix when choosing Accessory if currently on IMS
                if (DOM.assetCategoryInput.value === 'Accessory' && DOM.assetTagPrefix.value === 'IMS') {
                    DOM.assetTagPrefix.value = 'ACC';
                }
                applyAutoGeneratedTag();
            }
        });
    }

    // Search and Filter Listeners
    DOM.inventorySearch.addEventListener('input', () => {
        paginationConfig.currentPage = 1;
        renderInventoryTable();
    });
    DOM.filterCategory.addEventListener('change', () => {
        paginationConfig.currentPage = 1;
        renderInventoryTable();
    });
    if (DOM.filterDepartment) {
        DOM.filterDepartment.addEventListener('change', () => {
            paginationConfig.currentPage = 1;
            renderInventoryTable();
        });
    }
    DOM.filterStatus.addEventListener('change', () => {
        paginationConfig.currentPage = 1;
        renderInventoryTable();
    });
    if (DOM.filterWarranty) {
        DOM.filterWarranty.addEventListener('change', () => {
            paginationConfig.currentPage = 1;
            renderInventoryTable();
        });
    }
    if (DOM.btnClearFilters) {
        DOM.btnClearFilters.addEventListener('click', resetInventoryFilters);
    }

    // Inventory Pagination Listeners
    if (DOM.paginationLimit) {
        DOM.paginationLimit.addEventListener('change', (e) => {
            paginationConfig.pageSize = parseInt(e.target.value, 10);
            paginationConfig.currentPage = 1;
            renderInventoryTable();
        });
    }
    if (DOM.btnPagePrev) {
        DOM.btnPagePrev.addEventListener('click', () => {
            if (paginationConfig.currentPage > 1) {
                paginationConfig.currentPage--;
                renderInventoryTable();
            }
        });
    }
    if (DOM.btnPageNext) {
        DOM.btnPageNext.addEventListener('click', () => {
            paginationConfig.currentPage++;
            renderInventoryTable();
        });
    }

    // Vendors & Logs filters
    DOM.vendorsSearch.addEventListener('input', renderVendors);
    DOM.logsSearch.addEventListener('input', () => {
        logsPagination.currentPage = 1;
        renderLogs();
    });
    DOM.filterLogType.addEventListener('change', () => {
        logsPagination.currentPage = 1;
        renderLogs();
    });
    if (DOM.btnLogsPrev) {
        DOM.btnLogsPrev.addEventListener('click', () => {
            if (logsPagination.currentPage > 1) {
                logsPagination.currentPage--;
                renderLogs();
            }
        });
    }
    if (DOM.btnLogsNext) {
        DOM.btnLogsNext.addEventListener('click', () => {
            logsPagination.currentPage++;
            renderLogs();
        });
    }

    // Add Trigger Buttons
    DOM.addAssetBtn.addEventListener('click', () => openAssetModal());
    DOM.addVendorBtn.addEventListener('click', () => openVendorModal());
    DOM.clearLogsBtn.addEventListener('click', clearLogs);

    // Sort Listeners on Headers
    DOM.thTag.addEventListener('click', () => handleSort('tag'));
    DOM.thName.addEventListener('click', () => handleSort('name'));
    DOM.thCategory.addEventListener('click', () => handleSort('category'));
    DOM.thStatus.addEventListener('click', () => handleSort('status'));
    if (DOM.thUser) DOM.thUser.addEventListener('click', () => handleSort('assignedUser'));

    // Drawer Closer
    DOM.drawerCloseBtn.addEventListener('click', closeDrawer);
    DOM.assetDrawerBackdrop.addEventListener('click', closeDrawer);

    // Drawer Maintenance Logger Button
    DOM.btnDrawerAddMaintenance.addEventListener('click', () => {
        const assetId = DOM.maintenanceFormAssetId.value;
        closeDrawer();
        openMaintenanceModal(assetId);
    });

    // File Upload & Removal Triggers
    DOM.assetPhotoInput.addEventListener('change', (e) => handleFileUpload(e, 'photo'));
    DOM.assetInvoiceInput.addEventListener('change', (e) => handleFileUpload(e, 'invoice'));
    if (DOM.maintInvoiceInput) {
        DOM.maintInvoiceInput.addEventListener('change', (e) => handleFileUpload(e, 'maint-invoice'));
    }

    if (DOM.btnRemovePhoto) {
        DOM.btnRemovePhoto.addEventListener('click', () => {
            tempAttachedPhoto = '';
            DOM.assetPhotoInput.value = '';
            DOM.photoFileStatus.textContent = 'None';
            DOM.photoFileStatus.style.color = 'var(--text-muted)';
            DOM.btnRemovePhoto.style.display = 'none';
        });
    }
    if (DOM.btnRemoveInvoice) {
        DOM.btnRemoveInvoice.addEventListener('click', () => {
            tempAttachedInvoice = '';
            DOM.assetInvoiceInput.value = '';
            DOM.invoiceFileStatus.textContent = 'None';
            DOM.invoiceFileStatus.style.color = 'var(--text-muted)';
            DOM.btnRemoveInvoice.style.display = 'none';
        });
    }
    if (DOM.btnRemoveMaintInvoice) {
        DOM.btnRemoveMaintInvoice.addEventListener('click', () => {
            tempMaintInvoice = '';
            if (DOM.maintInvoiceInput) DOM.maintInvoiceInput.value = '';
            if (DOM.maintInvoiceStatus) {
                DOM.maintInvoiceStatus.textContent = 'None';
                DOM.maintInvoiceStatus.style.color = 'var(--text-muted)';
            }
            DOM.btnRemoveMaintInvoice.style.display = 'none';
        });
    }

    // Form Submissions
    DOM.assetForm.addEventListener('submit', handleAssetSubmit);
    DOM.assignForm.addEventListener('submit', handleAssignSubmit);
    DOM.maintenanceForm.addEventListener('submit', handleMaintenanceSubmit);
    DOM.vendorForm.addEventListener('submit', handleVendorSubmit);

    // Custom Configuration Manager Submit Listeners
    const catForm = document.getElementById('settings-category-form');
    if (catForm) catForm.addEventListener('submit', handleCategoryAdd);
    const deptForm = document.getElementById('settings-dept-form');
    if (deptForm) deptForm.addEventListener('submit', handleDeptAdd);

    // CSV Controls
    DOM.exportCsvBtn.addEventListener('click', exportInventoryToCSV);
    DOM.importCsvFile.addEventListener('change', importInventoryFromCSV);
    if (DOM.exportVendorsCsvBtn) DOM.exportVendorsCsvBtn.addEventListener('click', exportVendorsToCSV);
    if (DOM.importVendorsCsvFile) DOM.importVendorsCsvFile.addEventListener('change', importVendorsFromCSV);
    if (DOM.exportMaintCsvBtn) DOM.exportMaintCsvBtn.addEventListener('click', exportMaintenanceToCSV);
    if (DOM.importMaintCsvFile) DOM.importMaintCsvFile.addEventListener('change', importMaintenanceFromCSV);

    // Complete System Backup Controls
    const btnFullExport = document.getElementById('btn-export-full-backup');
    if (btnFullExport) btnFullExport.addEventListener('click', exportFullSystemBackup);
    const inputFullImport = document.getElementById('input-import-full-backup');
    if (inputFullImport) inputFullImport.addEventListener('change', importFullSystemBackup);

    // Interactive Logo Customizer Triggers
    document.querySelectorAll('.clickable-logo').forEach(el => {
        el.addEventListener('click', () => {
            if (state.role === 'admin') {
                document.getElementById('logo-file-input').click();
            }
        });
    });
    document.getElementById('logo-file-input').addEventListener('change', handleLogoUpload);

    // Dashboard Maintenance Pagination Listeners
    if (DOM.btnDashMaintPrev) {
        DOM.btnDashMaintPrev.addEventListener('click', () => {
            if (dashboardMaintPagination.currentPage > 1) {
                dashboardMaintPagination.currentPage--;
                renderDashboardMaintenanceLogs();
            }
        });
    }
    if (DOM.btnDashMaintNext) {
        DOM.btnDashMaintNext.addEventListener('click', () => {
            const totalPages = Math.ceil(state.maintenance.length / dashboardMaintPagination.pageSize);
            if (dashboardMaintPagination.currentPage < totalPages) {
                dashboardMaintPagination.currentPage++;
                renderDashboardMaintenanceLogs();
            }
        });
    }

    // Dashboard Maintenance Tab Listeners
    if (DOM.btnMaintTabLogs) DOM.btnMaintTabLogs.addEventListener('click', () => switchMaintTab('logs'));
    if (DOM.btnMaintTabCost) DOM.btnMaintTabCost.addEventListener('click', () => switchMaintTab('cost'));

    // Close modals on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && overlay.id !== 'lightbox-overlay') {
                closeModal(overlay.id);
            }
        });
    });

    // Dashboard Quick Actions, Health Pills & Clickable KPIs
    if (DOM.dashQuickAddBtn) DOM.dashQuickAddBtn.addEventListener('click', () => openAssetModal());
    if (DOM.dashQuickExportBtn) DOM.dashQuickExportBtn.addEventListener('click', exportInventoryToCSV);
    if (DOM.pillAvailableStock) {
        DOM.pillAvailableStock.addEventListener('click', () => navigateToFilteredInventory({ status: 'Available' }));
    }
    if (DOM.pillWarrantyAlerts) {
        DOM.pillWarrantyAlerts.addEventListener('click', () => navigateToFilteredInventory({ warranty: 'alerts' }));
    }

    const kpiWorkCard = document.getElementById('kpi-card-workstations');
    if (kpiWorkCard) kpiWorkCard.addEventListener('click', () => navigateToFilteredInventory({}));
    const kpiDeployCard = document.getElementById('kpi-card-deployment');
    if (kpiDeployCard) kpiDeployCard.addEventListener('click', () => navigateToFilteredInventory({ status: 'Assigned' }));
    const kpiMaintCard = document.getElementById('kpi-card-maintenance');
    if (kpiMaintCard) kpiMaintCard.addEventListener('click', () => navigateToFilteredInventory({ status: 'Maintenance' }));
    const kpiVendorsCard = document.getElementById('kpi-card-vendors');
    if (kpiVendorsCard) kpiVendorsCard.addEventListener('click', () => switchTab('vendors-tab'));
    const kpiValueCard = document.getElementById('kpi-card-value');
    if (kpiValueCard) kpiValueCard.addEventListener('click', () => navigateToFilteredInventory({}));
    const kpiUnpaidCard = document.getElementById('kpi-card-unpaid');
    if (kpiUnpaidCard) kpiUnpaidCard.addEventListener('click', () => {
        switchMaintTab('logs');
        if (DOM.dashboardMaintContainer) {
            DOM.dashboardMaintContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Global Escape key to close drawer and modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
        }
    });
}

function resetInventoryFilters() {
    if (DOM.inventorySearch) DOM.inventorySearch.value = '';
    if (DOM.filterStatus) DOM.filterStatus.value = 'all';
    if (DOM.filterCategory) DOM.filterCategory.value = 'all';
    if (DOM.filterDepartment) DOM.filterDepartment.value = 'all';
    if (DOM.filterWarranty) DOM.filterWarranty.value = 'all';
    paginationConfig.currentPage = 1;
    renderInventoryTable();
}

function navigateToFilteredInventory({ status = 'all', category = 'all', department = 'all', warranty = 'all' } = {}) {
    populateCategoriesAndDepartments();
    if (DOM.inventorySearch) DOM.inventorySearch.value = '';
    if (DOM.filterStatus) {
        DOM.filterStatus.value = [...DOM.filterStatus.options].some(o => o.value === status) ? status : 'all';
    }
    if (DOM.filterCategory) {
        DOM.filterCategory.value = [...DOM.filterCategory.options].some(o => o.value === category) ? category : 'all';
    }
    if (DOM.filterDepartment) {
        DOM.filterDepartment.value = [...DOM.filterDepartment.options].some(o => o.value === department) ? department : 'all';
    }
    if (DOM.filterWarranty) {
        DOM.filterWarranty.value = [...DOM.filterWarranty.options].some(o => o.value === warranty) ? warranty : 'all';
    }
    paginationConfig.currentPage = 1;
    switchTab('inventory-tab');
    renderInventoryTable();
}

// ================= THEME CONTROLLER =================
function loadTheme() {
    const savedTheme = localStorage.getItem('ims_theme') || 'dark';
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    state.theme = nextTheme;
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('ims_theme', nextTheme);
    updateThemeIcon(nextTheme);
    renderDashboardCharts();
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        DOM.themeIconPath.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z');
    } else {
        DOM.themeIconPath.setAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
    }
}

// ================= FILE UPLOAD CONTROLLERS =================
function handleFileUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800000) {
        alert('Attached file size exceeds 800KB. Please upload a smaller image or compressed PDF.');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        if (type === 'photo') {
            tempAttachedPhoto = base64;
            DOM.photoFileStatus.textContent = 'Attached ✓';
            DOM.photoFileStatus.style.color = 'var(--color-success)';
            if (DOM.btnRemovePhoto) DOM.btnRemovePhoto.style.display = 'inline-flex';
        } else if (type === 'invoice') {
            tempAttachedInvoice = base64;
            DOM.invoiceFileStatus.textContent = 'Attached ✓';
            DOM.invoiceFileStatus.style.color = 'var(--color-success)';
            if (DOM.btnRemoveInvoice) DOM.btnRemoveInvoice.style.display = 'inline-flex';
        } else if (type === 'maint-invoice') {
            tempMaintInvoice = base64;
            if (DOM.maintInvoiceStatus) {
                DOM.maintInvoiceStatus.textContent = 'Attached ✓';
                DOM.maintInvoiceStatus.style.color = 'var(--color-success)';
            }
            if (DOM.btnRemoveMaintInvoice) DOM.btnRemoveMaintInvoice.style.display = 'inline-flex';
        }
    };
    reader.readAsDataURL(file);
}

window.openPhotoLightbox = function() {
    const src = DOM.drawerPhotoImg.src;
    if (!src) return;
    DOM.lightboxImg.src = src;
    openModal('lightbox-overlay');
};

// ================= STATE & STORAGE HANDLERS =================
function saveState() {
    // Cap transaction history at 500 entries to prevent storage bloat
    if (state.transactions.length > 500) {
        state.transactions = state.transactions.slice(0, 500);
    }
    saveStateLocally();
    triggerNeonCloudSync(false, false);
}

function saveStateLocally() {
    try {
        localStorage.setItem('ims_assets', JSON.stringify(state.assets));
        localStorage.setItem('ims_vendors', JSON.stringify(state.vendors));
        localStorage.setItem('ims_employees', JSON.stringify(state.employees));
        localStorage.setItem('ims_maintenance', JSON.stringify(state.maintenance));
        localStorage.setItem('ims_transactions', JSON.stringify(state.transactions));
        localStorage.setItem('ims_categories', JSON.stringify(state.categories));
        localStorage.setItem('ims_departments', JSON.stringify(state.departments));
    } catch (err) {
        console.warn('LocalStorage quota warning:', err);
    }
}

function loadState() {
    try {
        state.assets = JSON.parse(localStorage.getItem('ims_assets')) || [];
        state.vendors = JSON.parse(localStorage.getItem('ims_vendors')) || [];
        state.employees = JSON.parse(localStorage.getItem('ims_employees')) || [];
        state.maintenance = JSON.parse(localStorage.getItem('ims_maintenance')) || [];
        state.transactions = JSON.parse(localStorage.getItem('ims_transactions')) || [];
        state.categories = JSON.parse(localStorage.getItem('ims_categories')) || ['Laptop', 'Computer', 'Printer', 'UPS', 'Accessory', 'Monitor', 'Scanner'];
        state.departments = JSON.parse(localStorage.getItem('ims_departments')) || ['IT Consultant', 'Studio', 'Human Resources', 'Finance & Accounts', 'IT', 'Operations', 'Business Development', 'Outsourcing', 'CLAN'];
    } catch {
        state.assets = [];
    }

    state.adminPassword = localStorage.getItem('ims_admin_password') || 'queenbee';
    state.staffPassword = localStorage.getItem('ims_staff_password') || 'ims';
}

function seedDemoData(notifyUser = true) {
    if (notifyUser && !confirm('This will replace your current inventory with the bundled baseline dataset (95 assets & 6 vendors). Continue?')) {
        return;
    }
    if (window.IMS_SEED_DATA) {
        state.vendors = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.vendors || []));
        state.employees = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.employees || []));
        state.assets = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.assets || []));
        state.maintenance = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.maintenance || []));
        state.transactions = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.transactions || []));
        if (window.IMS_SEED_DATA.categories) {
            state.categories = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.categories));
        }
        if (window.IMS_SEED_DATA.departments) {
            state.departments = JSON.parse(JSON.stringify(window.IMS_SEED_DATA.departments));
        }

        saveState();
        renderAll();

        if (notifyUser) {
            alert(`Baseline database restored: ${state.assets.length} assets, ${state.maintenance.length} maintenance records, and ${state.vendors.length} vendors loaded.`);
        }
    } else {
        alert('Error: Baseline database engine (demo-data.js) failed to load.');
    }
}

function confirmResetDatabase() {
    if (confirm('WARNING: Are you sure you want to wipe the IMS Asset database? This deletes all computers, laptops, parts, vendors, and assignments!')) {
        state.assets = [];
        state.vendors = [];
        state.employees = [];
        state.maintenance = [];
        state.transactions = [];
        saveState();
        renderAll();
        alert('Database wiped. Starting with an empty asset management console.');
    }
}

// ================= GENERAL UI CONTROLLER =================
function switchTab(tabId) {
    DOM.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    DOM.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
    if (tabId === 'dashboard-tab') {
        renderDashboardCharts();
    }
}

function renderAll() {
    populateCategoriesAndDepartments();
    populateVendorDropdowns();
    populateEmployeeDatalist();

    renderDashboardKPIs();
    renderDashboardCharts();
    if (activeMaintTab === 'logs') {
        renderDashboardMaintenanceLogs();
    } else {
        renderDashboardMonthlyCost();
    }

    renderInventoryTable();
    renderVendors();
    renderLogs();
    renderSettingsManagers();
}

function populateVendorDropdowns() {
    const prevAssetVendor = DOM.assetVendorSelect ? DOM.assetVendorSelect.value : '';
    const prevMaintVendor = DOM.maintVendorSelect ? DOM.maintVendorSelect.value : '';

    let assetOptions = '<option value="">None / Unknown Vendor</option>';
    let maintOptions = '<option value="" disabled selected>Choose a Supplier...</option>';
    state.vendors.forEach(v => {
        const label = `${escapeHtml(v.name)}${v.mobile ? ' (' + escapeHtml(v.mobile) + ')' : ''}`;
        const option = `<option value="${escapeHtml(v.id)}">${label}</option>`;
        assetOptions += option;
        maintOptions += option;
    });
    if (DOM.assetVendorSelect) {
        DOM.assetVendorSelect.innerHTML = assetOptions;
        if (prevAssetVendor) DOM.assetVendorSelect.value = prevAssetVendor;
    }
    if (DOM.maintVendorSelect) {
        DOM.maintVendorSelect.innerHTML = maintOptions;
        if (prevMaintVendor) DOM.maintVendorSelect.value = prevMaintVendor;
    }
}

function populateEmployeeDatalist() {
    let listItems = '';
    state.employees.forEach(emp => {
        listItems += `<option value="${escapeHtml(emp.name)}">${escapeHtml(emp.department)}</option>`;
    });
    DOM.employeesListDatalist.innerHTML = listItems;
}

function logTransaction(type, assetTag, assetName, details) {
    const transaction = {
        id: 't-' + Date.now() + Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
        type,
        assetTag,
        assetName,
        details,
        operator: `IT Admin (${state.role.toUpperCase()})`
    };
    state.transactions.unshift(transaction);
    saveState();
    renderLogs();
    renderDashboardKPIs();
}

// ================= WARRANTY HELPER =================
function getWarrantyStatus(expiryDateStr) {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr + 'T23:59:59');
    if (isNaN(expiry.getTime())) return null;

    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        return { label: 'Expired', cls: 'warranty-expired' };
    }
    if (diffDays <= 30) {
        return { label: `Expiring (${diffDays}d)`, cls: 'warranty-expiring' };
    }
    return { label: 'Active', cls: 'warranty-active' };
}

// ================= DASHBOARD CONTROLLERS =================
function renderDashboardKPIs() {
    const activeAssets = state.assets.filter(a => a.status !== 'Retired');
    const workstations = activeAssets.filter(a => a.category === 'Computer' || a.category === 'Laptop').length;
    DOM.kpiWorkstations.textContent = workstations;

    const totalAssets = activeAssets.length;
    const assignedAssets = activeAssets.filter(a => a.status === 'Assigned').length;
    const availableAssets = activeAssets.filter(a => a.status === 'Available').length;
    const rate = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;
    DOM.kpiDeploymentRate.textContent = `${rate}%`;
    if (DOM.kpiDeploymentBar) {
        DOM.kpiDeploymentBar.style.width = `${rate}%`;
    }
    if (DOM.kpiDeploymentSub) {
        DOM.kpiDeploymentSub.textContent = `${assignedAssets} of ${totalAssets} assigned`;
    }

    const maintenanceCount = state.assets.filter(a => a.status === 'Maintenance').length;
    DOM.kpiMaintenance.textContent = maintenanceCount;

    DOM.kpiVendors.textContent = state.vendors.length;

    // Total Inventory Valuation (excluding Retired)
    const totalValuation = activeAssets.reduce((sum, a) => sum + (parseFloat(a.price) || 0), 0);
    if (DOM.kpiTotalValue) {
        DOM.kpiTotalValue.textContent = '৳' + Math.round(totalValuation).toLocaleString('en-IN');
        DOM.kpiTotalValue.title = formatTaka(totalValuation);
    }

    // Unpaid Maintenance Dues
    const unpaidLogs = state.maintenance.filter(m => m.status === 'Unpaid');
    const unpaidTotal = unpaidLogs.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    if (DOM.kpiUnpaidCost) {
        DOM.kpiUnpaidCost.textContent = '৳' + Math.round(unpaidTotal).toLocaleString('en-IN');
        DOM.kpiUnpaidCost.title = formatTaka(unpaidTotal);
    }
    if (DOM.kpiUnpaidCount) {
        DOM.kpiUnpaidCount.textContent = `${unpaidLogs.length} pending ${unpaidLogs.length === 1 ? 'bill' : 'bills'}`;
    }

    // Hero Strip Live Summary & Health Pills
    if (DOM.dashLiveSummary) {
        const retiredCount = state.assets.filter(a => a.status === 'Retired').length;
        const retiredPart = retiredCount > 0 ? ` • ${retiredCount} retired` : '';
        DOM.dashLiveSummary.textContent = `Integrated Marketing Services Ltd. • ${totalAssets} active assets across ${state.departments.length} departments${retiredPart}`;
    }
    if (DOM.pillAvailableText) {
        DOM.pillAvailableText.textContent = `${availableAssets} Ready in Stock`;
    }
    if (DOM.pillWarrantyText && DOM.pillWarrantyAlerts) {
        let expiredCount = 0;
        let expiringSoonCount = 0;
        activeAssets.forEach(a => {
            const w = getWarrantyStatus(a.warrantyExpiry);
            if (!w) return;
            if (w.cls === 'warranty-expired') expiredCount++;
            else if (w.cls === 'warranty-expiring') expiringSoonCount++;
        });
        const totalAlerts = expiredCount + expiringSoonCount;
        DOM.pillWarrantyAlerts.className = 'health-pill ' + (expiredCount > 0 ? 'health-pill-danger' : (expiringSoonCount > 0 ? 'health-pill-warning' : 'health-pill-success'));
        DOM.pillWarrantyText.textContent = totalAlerts > 0
            ? `${expiredCount} Expired / ${expiringSoonCount} Expiring Warranties`
            : 'All Warranties Healthy';
    }
}

function renderDashboardMaintenanceLogs() {
    const container = DOM.dashboardMaintContainer;
    if (!container) return;
    container.innerHTML = '';

    if (state.maintenance.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔧</div>
                <p style="font-size: 13px;">No hardware upgrades or repairs logged yet.</p>
            </div>`;
        if (DOM.dashboardMaintPagination) DOM.dashboardMaintPagination.style.display = 'none';
        return;
    }

    const sortedLogs = [...state.maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalItems = sortedLogs.length;
    const totalPages = Math.ceil(totalItems / dashboardMaintPagination.pageSize);

    if (dashboardMaintPagination.currentPage > totalPages && totalPages > 0) {
        dashboardMaintPagination.currentPage = totalPages;
    }
    if (dashboardMaintPagination.currentPage < 1) {
        dashboardMaintPagination.currentPage = 1;
    }

    const startIdx = (dashboardMaintPagination.currentPage - 1) * dashboardMaintPagination.pageSize;
    const endIdx = Math.min(startIdx + dashboardMaintPagination.pageSize, totalItems);
    const pageLogs = sortedLogs.slice(startIdx, endIdx);

    pageLogs.forEach(log => {
        const linkedAsset = state.assets.find(a => a.id === log.assetId);
        const displayName = linkedAsset ? linkedAsset.name : (log.assetName || 'Removed Asset');
        const displayTag = linkedAsset ? linkedAsset.tag : (log.assetTag || 'N/A');

        const div = document.createElement('div');
        div.className = 'alert-item';
        div.style.cursor = linkedAsset ? 'pointer' : 'default';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'stretch';
        div.style.gap = '8px';
        if (linkedAsset) {
            div.addEventListener('click', () => openDrawer(linkedAsset.id));
        }

        let statusBadgeClass = 'maint-in-progress';
        if (log.status === 'Awaiting Parts') statusBadgeClass = 'maint-awaiting-parts';
        else if (log.status === 'Unpaid') statusBadgeClass = 'maint-unpaid';
        else if (log.status === 'Completed') statusBadgeClass = 'maint-completed';

        const costDisplay = log.cost ? ` (${formatTaka(log.cost)})` : '';

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <div>
                    <strong style="color:var(--text-primary); font-size:13.5px;">${escapeHtml(displayName)}</strong>
                    <span class="asset-tag-pill" style="font-size: 10px; padding: 1px 4px; margin-left: 6px;">${escapeHtml(displayTag)}</span>
                </div>
                <span class="status-badge ${statusBadgeClass}" style="padding:2px 6px; font-size:9.5px; font-weight:700;">${escapeHtml(log.status || 'Completed')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; border-top:1px dashed rgba(255,255,255,0.05); padding-top:6px; margin-top:2px;">
                <p style="font-size: 11.5px; color: var(--text-secondary); margin:0;">
                    <strong>${escapeHtml(log.partReplaced)}</strong>${costDisplay} — ${escapeHtml(log.description)}
                </p>
                <div style="font-size: 11px; color: var(--text-muted); font-weight:600; font-family:monospace; flex-shrink:0; margin-left:8px;">
                    ${escapeHtml(log.date)}
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    if (DOM.dashboardMaintPagination) {
        if (totalItems > dashboardMaintPagination.pageSize) {
            DOM.dashboardMaintPagination.style.display = 'flex';
            DOM.dashboardMaintInfo.textContent = `Page ${dashboardMaintPagination.currentPage} of ${totalPages}`;
            DOM.btnDashMaintPrev.disabled = (dashboardMaintPagination.currentPage === 1);
            DOM.btnDashMaintNext.disabled = (dashboardMaintPagination.currentPage === totalPages);
        } else {
            DOM.dashboardMaintPagination.style.display = 'none';
        }
    }
}

function switchMaintTab(tab) {
    activeMaintTab = tab;
    if (tab === 'logs') {
        DOM.btnMaintTabLogs.classList.add('active');
        DOM.btnMaintTabCost.classList.remove('active');
        DOM.dashboardMaintContainer.style.display = 'block';
        DOM.dashboardMaintCostContainer.style.display = 'none';
        renderDashboardMaintenanceLogs();
    } else {
        DOM.btnMaintTabCost.classList.add('active');
        DOM.btnMaintTabLogs.classList.remove('active');
        DOM.dashboardMaintContainer.style.display = 'none';
        DOM.dashboardMaintCostContainer.style.display = 'block';
        if (DOM.dashboardMaintPagination) DOM.dashboardMaintPagination.style.display = 'none';
        renderDashboardMonthlyCost();
    }
}

function renderDashboardMonthlyCost() {
    const container = DOM.dashboardMaintCostContainer;
    if (!container) return;
    container.innerHTML = '';

    if (state.maintenance.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <p style="font-size: 13px;">No maintenance costs recorded yet.</p>
            </div>`;
        return;
    }

    const monthlyCosts = {};
    let grandTotal = 0;

    state.maintenance.forEach(log => {
        if (!log.date) return;
        const dateObj = new Date(log.date);
        if (isNaN(dateObj.getTime())) return;

        const year = dateObj.getFullYear();
        const monthName = dateObj.toLocaleString('default', { month: 'long' });
        const key = `${monthName} ${year}`;
        const sortKey = `${year}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        const costVal = parseFloat(log.cost || 0);

        if (!monthlyCosts[key]) {
            monthlyCosts[key] = { cost: 0, sortKey };
        }
        monthlyCosts[key].cost += costVal;
        grandTotal += costVal;
    });

    const sortedCosting = Object.entries(monthlyCosts)
        .map(([label, data]) => ({ label, cost: data.cost, sortKey: data.sortKey }))
        .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    const totalDiv = document.createElement('div');
    totalDiv.style.background = 'rgba(var(--color-primary-rgb), 0.05)';
    totalDiv.style.border = '1px solid rgba(var(--color-primary-rgb), 0.15)';
    totalDiv.style.padding = '12px';
    totalDiv.style.borderRadius = 'var(--radius-sm)';
    totalDiv.style.marginBottom = '16px';
    totalDiv.style.textAlign = 'center';
    totalDiv.innerHTML = `
        <span style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Total Hardware Costing</span>
        <h3 style="font-size:22px; color:var(--text-primary); margin-top:4px; font-family:var(--font-header); font-weight:700;">${formatTaka(grandTotal)}</h3>
    `;
    container.appendChild(totalDiv);

    sortedCosting.forEach(item => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '12px';
        div.style.marginBottom = '8px';
        div.innerHTML = `
            <span style="font-weight:600; color:var(--text-primary); font-size:13.5px;">${escapeHtml(item.label)}</span>
            <span style="font-weight:700; color:var(--color-primary); font-family:monospace; font-size:14.5px;">${formatTaka(item.cost)}</span>
        `;
        container.appendChild(div);
    });
}

function renderDashboardCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textPrimaryColor = isDark ? '#f1f5f9' : '#0f172a';

    // 1. Dynamic Category Chart & Accurate Status Breakdown (Fixed: Available / Retired)
    const counts = {};
    const statusBreakdown = {};
    state.categories.forEach(cat => {
        counts[cat] = 0;
        statusBreakdown[cat] = { Assigned: 0, Available: 0, Maintenance: 0, Retired: 0 };
    });

    state.assets.forEach(a => {
        const cat = a.category || 'Other';
        if (counts[cat] === undefined) {
            counts[cat] = 0;
            statusBreakdown[cat] = { Assigned: 0, Available: 0, Maintenance: 0, Retired: 0 };
        }
        counts[cat]++;
        const st = a.status || 'Available';
        statusBreakdown[cat][st] = (statusBreakdown[cat][st] || 0) + 1;
    });

    const categoryLabels = Object.keys(counts);
    const categoryData = Object.values(counts);
    const coreColors = ['#ec2028', '#3b82f6', '#6e6f71', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4'];
    const categoryColors = categoryLabels.map((_, i) => coreColors[i % coreColors.length]);

    const detailsContainer = document.getElementById('category-details-list');
    if (detailsContainer) {
        detailsContainer.innerHTML = '';
        let renderedRows = 0;
        categoryLabels.forEach((cat, index) => {
            const total = counts[cat];
            if (total === 0) return;
            renderedRows++;

            const breakdown = statusBreakdown[cat];
            const color = categoryColors[index % categoryColors.length];

            const parts = [];
            if (breakdown.Assigned > 0) parts.push(`<span style="color: var(--text-primary); font-weight:600;">${breakdown.Assigned}</span> Assigned`);
            if (breakdown.Available > 0) parts.push(`<span style="color: var(--color-success); font-weight:600;">${breakdown.Available}</span> Available`);
            if (breakdown.Maintenance > 0) parts.push(`<span style="color: var(--color-warning); font-weight:600;">${breakdown.Maintenance}</span> Repair`);
            if (breakdown.Retired > 0) parts.push(`<span style="color: var(--color-danger); font-weight:600;">${breakdown.Retired}</span> Retired`);

            const statusString = parts.length > 0 ? parts.join(' • ') : 'No items';

            const rowEl = document.createElement('div');
            rowEl.className = 'category-row-item';
            rowEl.title = `Filter inventory by ${cat}`;
            rowEl.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:600; font-size:12.5px; display:flex; align-items:center; gap:6px; color:var(--text-primary);">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color};"></span>
                        ${escapeHtml(cat)}
                    </span>
                    <span style="font-weight:600; font-size:12px; color:var(--text-secondary);">${total} units</span>
                </div>
                <div style="font-size:11px; color:var(--text-secondary); padding-left: 14px; line-height: 1.3;">
                    ${statusString}
                </div>
            `;
            rowEl.addEventListener('click', () => navigateToFilteredInventory({ category: cat }));
            detailsContainer.appendChild(rowEl);
        });
        if (renderedRows === 0) {
            detailsContainer.innerHTML = '<div style="font-size:12px; color:var(--text-muted); text-align:center; padding-top:20px;">No categories recorded</div>';
        }
    }

    if (categoryChart) categoryChart.destroy();
    const canvas = document.getElementById('category-chart');
    if (canvas && typeof Chart !== 'undefined') {
        const ctx = canvas.getContext('2d');
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: categoryColors,
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? '#101625' : '#ffffff',
                    hoverOffset: 10
                }]
            },
            plugins: [{
                id: 'centerText',
                beforeDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;
                    const { left, right, top, bottom } = chartArea;
                    const centerX = (left + right) / 2;
                    const centerY = (top + bottom) / 2;
                    ctx.save();
                    ctx.font = 'bold 20px Inter';
                    ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(state.assets.length.toString(), centerX, centerY - 6);
                    ctx.font = '600 9px Inter';
                    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
                    ctx.fillText('TOTAL ASSETS', centerX, centerY + 12);
                    ctx.restore();
                }
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: (_evt, elements) => {
                    if (elements && elements.length > 0) {
                        const clickedCat = categoryLabels[elements[0].index];
                        if (clickedCat) navigateToFilteredInventory({ category: clickedCat });
                    }
                },
                onHover: (evt, elements) => {
                    if (evt.native && evt.native.target) {
                        evt.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#0c1221' : '#ffffff',
                        titleColor: textPrimaryColor,
                        bodyColor: textPrimaryColor,
                        borderColor: 'rgba(236, 32, 40, 0.2)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label(context) {
                                const label = context.label || '';
                                const val = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                return ` ${label}: ${val} units (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '75%'
            }
        });
    }

    // 2. Department Chart (Sorted Highest -> Lowest, Click-to-Filter)
    const deptCounts = {};
    state.departments.forEach(dept => { deptCounts[dept] = 0; });

    let unassignedCount = 0;
    state.assets.forEach(a => {
        if (a.status === 'Retired') return;
        if (a.assignedUser && a.department) {
            deptCounts[a.department] = (deptCounts[a.department] || 0) + 1;
        } else {
            unassignedCount++;
        }
    });

    const sortedDeptEntries = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    if (unassignedCount > 0) {
        sortedDeptEntries.push(['Unassigned', unassignedCount]);
    }

    const deptLabels = sortedDeptEntries.map(e => e[0]);
    const deptData = sortedDeptEntries.map(e => e[1]);
    const deptColors = deptLabels.map((label, i) => {
        if (label === 'Unassigned') return isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(100, 116, 139, 0.25)';
        return coreColors[(i + 1) % coreColors.length];
    });

    if (departmentChart) departmentChart.destroy();
    const deptCanvas = document.getElementById('department-chart');
    if (deptCanvas && typeof Chart !== 'undefined') {
        const deptCtx = deptCanvas.getContext('2d');
        departmentChart = new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: deptLabels,
                datasets: [{
                    label: 'Assets Count',
                    data: deptData,
                    indexAxis: 'y',
                    backgroundColor: deptColors,
                    borderWidth: 0,
                    borderRadius: 6,
                    maxBarThickness: 18
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                onClick: (_evt, elements) => {
                    if (elements && elements.length > 0) {
                        const clickedDept = deptLabels[elements[0].index];
                        if (clickedDept === 'Unassigned') {
                            navigateToFilteredInventory({ department: '__unassigned__' });
                        } else if (clickedDept) {
                            navigateToFilteredInventory({ department: clickedDept });
                        }
                    }
                },
                onHover: (evt, elements) => {
                    if (evt.native && evt.native.target) {
                        evt.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDark ? '#0c1221' : '#ffffff',
                        titleColor: textPrimaryColor,
                        bodyColor: textPrimaryColor,
                        borderColor: 'rgba(236, 32, 40, 0.2)',
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: textPrimaryColor, font: { family: 'Inter', size: 11 }, stepSize: 1, precision: 0 }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: textPrimaryColor, font: { family: 'Inter', size: 11, weight: 500 } }
                    }
                }
            }
        });
    }
}

// ================= SORT & TABLE HELPERS =================
function handleSort(column) {
    if (sortConfig.column === column) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = column;
        sortConfig.direction = 'asc';
    }

    const headers = [
        { el: DOM.thTag, col: 'tag', name: 'Asset Tag' },
        { el: DOM.thName, col: 'name', name: 'Asset Name' },
        { el: DOM.thCategory, col: 'category', name: 'Category' },
        { el: DOM.thStatus, col: 'status', name: 'Status' },
        { el: DOM.thUser, col: 'assignedUser', name: 'Assigned User' }
    ];

    headers.forEach(h => {
        if (!h.el) return;
        let suffix = '\u00A0⇅';
        if (h.col === column) {
            suffix = sortConfig.direction === 'asc' ? '\u00A0▲' : '\u00A0▼';
        }
        h.el.textContent = h.name + suffix;
    });

    renderInventoryTable();
}

function sortAssets(assetsList) {
    const col = sortConfig.column;
    const dir = sortConfig.direction === 'asc' ? 1 : -1;

    return [...assetsList].sort((a, b) => {
        const valA = String(a[col] || '');
        const valB = String(b[col] || '');
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * dir;
    });
}

function renderPaginationControls(totalPages) {
    const container = DOM.paginationPagesContainer;
    if (!container) return;
    container.innerHTML = '';

    const currentPage = paginationConfig.currentPage;
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        createPageButton(1);
        if (startPage > 2) createEllipsis();
    }
    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i);
    }
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) createEllipsis();
        createPageButton(totalPages);
    }

    function createPageButton(pageNum) {
        const btn = document.createElement('button');
        btn.className = 'btn-page-num' + (pageNum === currentPage ? ' active' : '');
        btn.textContent = pageNum;
        btn.addEventListener('click', () => {
            paginationConfig.currentPage = pageNum;
            renderInventoryTable();
        });
        container.appendChild(btn);
    }

    function createEllipsis() {
        const span = document.createElement('span');
        span.style.cssText = 'color: var(--text-muted); font-size: 13px; padding: 0 4px; display: inline-flex; align-items: center;';
        span.textContent = '...';
        container.appendChild(span);
    }
}

// ================= INVENTORY TABLE CONTROLLER =================
function renderInventoryTable() {
    const tableBody = DOM.inventoryTableBody;
    const query = (DOM.inventorySearch ? DOM.inventorySearch.value : '').trim().toLowerCase();
    const catFilter = (DOM.filterCategory && DOM.filterCategory.value) || 'all';
    const deptFilter = (DOM.filterDepartment && DOM.filterDepartment.value) || 'all';
    const statFilter = (DOM.filterStatus && DOM.filterStatus.value) || 'all';
    const warrantyFilter = (DOM.filterWarranty && DOM.filterWarranty.value) || 'all';

    // Show/hide 1-click Clear Filters button whenever any filter is active
    const hasActiveFilters = Boolean(query) || catFilter !== 'all' || deptFilter !== 'all' || statFilter !== 'all' || warrantyFilter !== 'all';
    if (DOM.btnClearFilters) {
        DOM.btnClearFilters.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }

    tableBody.innerHTML = '';

    let filtered = state.assets.filter(asset => {
        if (catFilter !== 'all' && asset.category !== catFilter) return false;
        if (deptFilter !== 'all') {
            if (deptFilter === '__unassigned__') {
                if (asset.department) return false;
            } else if (asset.department !== deptFilter) {
                return false;
            }
        }
        if (statFilter !== 'all' && asset.status !== statFilter) return false;

        if (warrantyFilter !== 'all') {
            const w = getWarrantyStatus(asset.warrantyExpiry);
            if (warrantyFilter === 'alerts') {
                if (asset.status === 'Retired' || !w || (w.cls !== 'warranty-expired' && w.cls !== 'warranty-expiring')) return false;
            } else if (warrantyFilter === 'expired') {
                if (!w || w.cls !== 'warranty-expired') return false;
            } else if (warrantyFilter === 'expiring') {
                if (!w || w.cls !== 'warranty-expiring') return false;
            } else if (warrantyFilter === 'active') {
                if (!w || w.cls !== 'warranty-active') return false;
            } else if (warrantyFilter === 'none') {
                if (w) return false;
            }
        }

        if (query) {
            return (
                (asset.name || '').toLowerCase().includes(query) ||
                (asset.tag || '').toLowerCase().includes(query) ||
                (asset.model || '').toLowerCase().includes(query) ||
                (asset.brand || '').toLowerCase().includes(query) ||
                (asset.assignedUser || '').toLowerCase().includes(query) ||
                (asset.department || '').toLowerCase().includes(query) ||
                (asset.serial || '').toLowerCase().includes(query)
            );
        }
        return true;
    });

    filtered = sortAssets(filtered);

    if (filtered.length === 0) {
        DOM.inventoryEmptyState.style.display = 'flex';
        if (DOM.inventoryPagination) DOM.inventoryPagination.style.display = 'none';
        return;
    } else {
        DOM.inventoryEmptyState.style.display = 'none';
        if (DOM.inventoryPagination) DOM.inventoryPagination.style.display = 'flex';
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / paginationConfig.pageSize);
    if (paginationConfig.currentPage > totalPages && totalPages > 0) paginationConfig.currentPage = totalPages;
    if (paginationConfig.currentPage < 1) paginationConfig.currentPage = 1;

    const startIdx = (paginationConfig.currentPage - 1) * paginationConfig.pageSize;
    const endIdx = Math.min(startIdx + paginationConfig.pageSize, totalItems);

    if (DOM.paginationInfo) {
        DOM.paginationInfo.textContent = `Showing ${totalItems > 0 ? startIdx + 1 : 0}-${endIdx} of ${totalItems} assets`;
    }
    if (DOM.btnPagePrev) DOM.btnPagePrev.disabled = (paginationConfig.currentPage === 1);
    if (DOM.btnPageNext) DOM.btnPageNext.disabled = (paginationConfig.currentPage === totalPages || totalPages === 0);

    renderPaginationControls(totalPages);
    const pageAssets = filtered.slice(startIdx, endIdx);

    pageAssets.forEach(asset => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', (e) => {
            if (e.target.closest('.action-prevent-drawer')) return;
            openDrawer(asset.id);
        });

        const safeId = escapeHtml(asset.id);
        const statusClass = `status-${(asset.status || 'available').toLowerCase()}`;
        const userDisplay = asset.assignedUser
            ? `<div style="font-weight: 600;">${escapeHtml(asset.assignedUser)}</div><div style="font-size:11px; color:var(--text-muted);">${escapeHtml(asset.department || '')}</div>`
            : `<span style="color: var(--text-muted);">Unassigned</span>`;

        const warrantyInfo = getWarrantyStatus(asset.warrantyExpiry);
        const warrantyPill = warrantyInfo && warrantyInfo.cls !== 'warranty-active'
            ? `<span class="warranty-badge ${warrantyInfo.cls}" style="margin-left:6px;">${warrantyInfo.label}</span>`
            : '';

        const assetUpgrades = state.maintenance.filter(m => m.assetId === asset.id);
        const upgradesTitle = assetUpgrades.map(u => `${u.partReplaced} (${u.status || 'Completed'})`).join(', ');
        const upgradesText = assetUpgrades.length > 0
            ? escapeHtml(upgradesTitle)
            : `<span style="color:var(--text-muted); font-size:12px;">None</span>`;

        let actionsHtml = '';
        if (state.isAdmin) {
            if (asset.status === 'Available') {
                actionsHtml = `<button class="btn btn-primary btn-sm" onclick="openAssignModal('${safeId}')">Assign</button>`;
            } else if (asset.status === 'Assigned') {
                actionsHtml = `<button class="btn btn-secondary btn-sm" onclick="returnAsset('${safeId}')">Return</button>`;
            }
        }

        tr.innerHTML = `
            <td><span class="asset-tag-pill">${escapeHtml(asset.tag)}</span></td>
            <td>
                <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(asset.name)}${warrantyPill}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${escapeHtml(asset.brand || '-')} ${escapeHtml(asset.model || '')}</div>
            </td>
            <td style="color:var(--text-secondary); font-size:13.5px;">${escapeHtml(asset.category)}</td>
            <td style="font-size:12px; color:var(--text-muted); max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(asset.specs || 'None')}">
                ${escapeHtml(asset.specs || 'N/A')}
            </td>
            <td><span class="status-badge ${statusClass}">${escapeHtml(asset.status)}</span></td>
            <td>${userDisplay}</td>
            <td style="font-size:12px; color:var(--text-secondary); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(upgradesTitle)}">
                ${upgradesText}
            </td>
            <td style="text-align: right;" class="action-prevent-drawer">
                <div style="display:flex; justify-content:flex-end; gap:6px;">
                    ${actionsHtml}
                    <button class="btn btn-secondary btn-sm" style="padding: 5px 8px;" onclick="openDrawer('${safeId}')" title="Inspect Asset">🔎</button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ================= DETAIL DRAWER CONTROLLERS =================
function openDrawer(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const safeId = escapeHtml(asset.id);
    DOM.drawerTag.textContent = asset.tag;
    DOM.drawerTitle.textContent = asset.name;
    DOM.drawerBrandModel.textContent = `${asset.brand || 'Generic'} ${asset.model || ''}`.trim();
    DOM.drawerSerial.textContent = asset.serial || 'N/A';
    DOM.drawerSpecs.textContent = asset.specs || 'None Specified';
    DOM.drawerPrice.textContent = formatTaka(asset.price || 0);
    DOM.drawerPurchaseDate.textContent = asset.purchaseDate || 'N/A';
    DOM.drawerWarrantyExpiry.textContent = asset.warrantyExpiry || 'No Warranty Recorded';

    // Warranty badge + Extend button
    if (DOM.drawerWarrantyBadge) {
        const wInfo = getWarrantyStatus(asset.warrantyExpiry);
        if (wInfo) {
            DOM.drawerWarrantyBadge.className = `warranty-badge ${wInfo.cls}`;
            DOM.drawerWarrantyBadge.textContent = wInfo.label;
            DOM.drawerWarrantyBadge.style.display = 'inline-flex';
        } else {
            DOM.drawerWarrantyBadge.style.display = 'none';
        }
    }
    if (DOM.btnDrawerExtendWarranty) {
        DOM.btnDrawerExtendWarranty.style.display = state.isAdmin ? 'inline-flex' : 'none';
        DOM.btnDrawerExtendWarranty.onclick = (e) => extendWarranty(asset.id, e);
    }

    DOM.drawerStatus.className = `status-badge status-${(asset.status || 'available').toLowerCase()}`;
    DOM.drawerStatus.textContent = asset.status;

    DOM.maintenanceFormAssetId.value = asset.id;
    DOM.maintenanceAssetDisplay.value = `${asset.name} (${asset.tag})`;

    // Photo preview
    if (asset.attachedPhoto) {
        DOM.drawerPhotoImg.src = asset.attachedPhoto;
        DOM.drawerPhotoContainer.style.display = 'block';
    } else {
        DOM.drawerPhotoImg.src = '';
        DOM.drawerPhotoContainer.style.display = 'none';
    }

    // Invoice preview
    if (asset.attachedInvoice) {
        DOM.drawerInvoiceRow.style.display = 'flex';
        DOM.drawerInvoiceDownloadBtn.onclick = () => openInvoice(asset.attachedInvoice, asset.tag);
    } else {
        DOM.drawerInvoiceRow.style.display = 'none';
    }

    // Notes display
    if (asset.notes) {
        DOM.drawerNotes.textContent = asset.notes;
        DOM.drawerNotesRow.style.display = 'flex';
    } else {
        DOM.drawerNotes.textContent = 'None';
        DOM.drawerNotesRow.style.display = 'none';
    }

    const vendor = state.vendors.find(v => v.id === asset.vendorId);
    if (vendor) {
        DOM.drawerVendorName.textContent = vendor.name;
        DOM.drawerVendorMobile.textContent = vendor.mobile || '-';
    } else {
        DOM.drawerVendorName.textContent = 'Unknown / None';
        DOM.drawerVendorMobile.textContent = '-';
    }

    const assignActions = DOM.drawerAssignmentActions;
    assignActions.innerHTML = '';

    if (state.isAdmin) {
        if (asset.status === 'Retired') {
            DOM.drawerAssignmentDesc.innerHTML = '<span style="color:var(--color-danger);">Retired / Out of service</span>';
            assignActions.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="toggleRetireAsset('${safeId}')">Restore Stock</button>`;
        } else if (asset.status === 'Assigned') {
            DOM.drawerAssignmentDesc.innerHTML = `Assigned to <strong>${escapeHtml(asset.assignedUser)}</strong> (${escapeHtml(asset.department)})`;
            assignActions.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="returnAsset('${safeId}'); closeDrawer();">Return Stock</button>`;
        } else if (asset.status === 'Maintenance') {
            const userSubtext = asset.assignedUser
                ? ` — Assigned to <strong>${escapeHtml(asset.assignedUser)}</strong> (${escapeHtml(asset.department)})`
                : '';
            DOM.drawerAssignmentDesc.innerHTML = `<span style="color:var(--color-warning);">Under repair / Parts Replacement</span>${userSubtext}`;
            assignActions.innerHTML = `<button class="btn btn-primary btn-sm" onclick="setAssetAvailable('${safeId}'); closeDrawer();">Mark Ready</button>`;
        } else {
            if (asset.assignedUser) {
                DOM.drawerAssignmentDesc.innerHTML = `Assigned to <strong>${escapeHtml(asset.assignedUser)}</strong> (${escapeHtml(asset.department)})`;
                assignActions.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="returnAsset('${safeId}'); closeDrawer();">Return Stock</button>`;
            } else {
                DOM.drawerAssignmentDesc.textContent = 'Device is available for assignment';
                assignActions.innerHTML = `<button class="btn btn-primary btn-sm" onclick="closeDrawer(); openAssignModal('${safeId}')">Deploy Workstation</button>`;
            }
        }
        DOM.drawerEditBtn.style.display = 'inline-flex';
        DOM.drawerDeleteBtn.style.display = 'inline-flex';
        DOM.btnDrawerAddMaintenance.style.display = 'inline-flex';
        if (DOM.drawerRetireBtn) {
            DOM.drawerRetireBtn.style.display = 'inline-flex';
            DOM.drawerRetireBtn.textContent = asset.status === 'Retired' ? '♻️ Restore to Stock' : '📦 Mark Retired';
            DOM.drawerRetireBtn.onclick = () => toggleRetireAsset(asset.id);
        }
    } else {
        if (asset.status === 'Retired') {
            DOM.drawerAssignmentDesc.innerHTML = '<span style="color:var(--color-danger);">Retired / Out of service</span>';
        } else if (asset.status === 'Assigned') {
            DOM.drawerAssignmentDesc.innerHTML = `Assigned to <strong>${escapeHtml(asset.assignedUser)}</strong> (${escapeHtml(asset.department)})`;
        } else if (asset.status === 'Maintenance') {
            const userSubtext = asset.assignedUser
                ? ` — Assigned to <strong>${escapeHtml(asset.assignedUser)}</strong> (${escapeHtml(asset.department)})`
                : '';
            DOM.drawerAssignmentDesc.innerHTML = `<span style="color:var(--color-warning);">Under Maintenance Repair</span>${userSubtext}`;
        } else {
            DOM.drawerAssignmentDesc.textContent = asset.assignedUser
                ? `Assigned to ${asset.assignedUser} (${asset.department})`
                : 'Device is available';
        }
        DOM.drawerEditBtn.style.display = 'none';
        DOM.drawerDeleteBtn.style.display = 'none';
        DOM.btnDrawerAddMaintenance.style.display = 'none';
        if (DOM.drawerRetireBtn) DOM.drawerRetireBtn.style.display = 'none';
    }

    // Print Handover / Gate Pass button
    if (DOM.drawerPrintHandoverBtn) {
        DOM.drawerPrintHandoverBtn.onclick = () => printAssetHandover(asset.id);
    }

    // Maintenance history list
    const maintList = DOM.drawerMaintenanceList;
    maintList.innerHTML = '';
    const assetUpgrades = state.maintenance.filter(m => m.assetId === asset.id);

    if (assetUpgrades.length === 0) {
        maintList.innerHTML = `<p style="font-size:12.5px; color:var(--text-muted); font-style:italic; padding: 10px 0;">No hardware repairs or upgrades recorded.</p>`;
    } else {
        assetUpgrades.forEach(upg => {
            const vInfo = state.vendors.find(v => v.id === upg.vendorId);
            const vMob = vInfo ? (vInfo.mobile || 'N/A') : 'N/A';
            const safeUpgId = escapeHtml(upg.id);
            const logItem = document.createElement('div');
            logItem.className = 'upgrade-log-item';

            let statusBadgeClass = 'maint-in-progress';
            if (upg.status === 'Awaiting Parts') statusBadgeClass = 'maint-awaiting-parts';
            else if (upg.status === 'Unpaid') statusBadgeClass = 'maint-unpaid';
            else if (upg.status === 'Completed') statusBadgeClass = 'maint-completed';

            let adminToggleHtml = '';
            if (state.isAdmin) {
                if (upg.status !== 'Completed') {
                    const statusButtons = [];
                    if (upg.status !== 'In Progress') {
                        statusButtons.push(`<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${safeUpgId}', 'In Progress', event)">In Progress</button>`);
                    }
                    if (upg.status !== 'Awaiting Parts') {
                        statusButtons.push(`<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${safeUpgId}', 'Awaiting Parts', event)">Awaiting Parts</button>`);
                    }
                    if (upg.status !== 'Unpaid') {
                        statusButtons.push(`<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${safeUpgId}', 'Unpaid', event)">Unpaid</button>`);
                    }
                    statusButtons.push(`<button class="btn btn-primary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${safeUpgId}', 'Completed', event)">Complete</button>`);

                    adminToggleHtml = `
                        <div style="margin-top:6px; display:flex; gap:6px; align-items:center; flex-wrap:wrap; width: 100%;">
                            <span style="font-size:11px; color:var(--text-muted);">Shift status:</span>
                            ${statusButtons.join('')}
                            <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px; margin-left: auto;" onclick="closeDrawer(); openEditMaintenanceModal('${safeUpgId}', event)">✏️ Edit</button>
                        </div>
                    `;
                } else if (!upg.completedEdits || upg.completedEdits < 1) {
                    adminToggleHtml = `
                        <div style="margin-top:6px; display:flex; gap:6px; align-items:center; width: 100%;">
                            <span style="font-size:11px; color:var(--text-muted); font-style:italic;">Completed (Can be edited 1 time):</span>
                            <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px; margin-left: auto;" onclick="closeDrawer(); openEditMaintenanceModal('${safeUpgId}', event)">✏️ Edit</button>
                        </div>
                    `;
                }
            }

            const billBtnHtml = upg.attachedInvoice
                ? `<div style="margin-top:6px;"><button type="button" class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:10.5px;" onclick="openMaintenanceInvoice('${safeUpgId}', event)">📄 View Repair Bill</button></div>`
                : '';

            logItem.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <div class="upgrade-log-date">${escapeHtml(upg.date)} — Cost: ${formatTaka(upg.cost)}</div>
                    <span class="status-badge ${statusBadgeClass}" style="padding:2px 6px; font-size:9.5px; font-weight:700;">${escapeHtml(upg.status || 'Completed')}</span>
                </div>
                <div class="upgrade-log-desc"><strong>${escapeHtml(upg.partReplaced)}</strong>: ${escapeHtml(upg.description)}</div>
                <div class="upgrade-log-vendor">
                    <span>Vendor: ${escapeHtml(upg.vendorName || 'Unknown')}</span>
                    <span style="font-family:monospace; color:var(--color-primary);">${escapeHtml(vMob)}</span>
                </div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:4px; border-top:1px dashed rgba(255,255,255,0.05); padding-top:4px;">
                    Reason: ${escapeHtml(upg.reason)}
                </div>
                ${billBtnHtml}
                ${adminToggleHtml}
            `;
            maintList.appendChild(logItem);
        });
    }

    renderAssignmentTimeline(asset);

    DOM.drawerEditBtn.onclick = () => {
        closeDrawer();
        openAssetModal(asset.id);
    };
    DOM.drawerDeleteBtn.onclick = () => {
        closeDrawer();
        deleteAsset(asset.id);
    };

    DOM.assetDrawerBackdrop.classList.add('active');
    DOM.assetDrawer.classList.add('active');
}

function closeDrawer() {
    DOM.assetDrawerBackdrop.classList.remove('active');
    DOM.assetDrawer.classList.remove('active');
}

// ================= PRINTABLE HANDOVER / GATE PASS =================
window.printAssetHandover = function(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const vendor = state.vendors.find(v => v.id === asset.vendorId);
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const logoSrc = localStorage.getItem('ims_custom_logo') || `${window.location.origin}/image/IMS-Logo-C.png`;

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>IMS Asset Handover - ${escapeHtml(asset.tag)}</title>
<style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; padding: 32px 40px; max-width: 820px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #ec2028; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand img { height: 50px; width: auto; object-fit: contain; }
    .brand h1 { margin: 0; font-size: 20px; color: #111827; }
    .brand p { margin: 2px 0 0; font-size: 12px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.6px; }
    .doc-meta { text-align: right; font-size: 12.5px; color: #374151; }
    .doc-meta strong { color: #ec2028; font-size: 14px; display: block; margin-bottom: 4px; }
    .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #ec2028; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin: 22px 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    td { padding: 9px 12px; border: 1px solid #d1d5db; vertical-align: top; }
    td.label { width: 26%; background: #f9fafb; font-weight: 600; color: #374151; }
    .terms { margin-top: 22px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #374151; line-height: 1.55; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 28px; margin-top: 56px; text-align: center; }
    .sig-box { border-top: 1px solid #374151; padding-top: 8px; font-size: 12.5px; }
    .sig-box small { display: block; color: #6b7280; font-size: 11px; margin-top: 2px; }
    @media print { body { padding: 16px; } .no-print { display: none; } }
</style>
</head>
<body>
    <div class="header">
        <div class="brand">
            <img src="${logoSrc}" alt="IMS Logo" onerror="this.style.display='none'">
            <div>
                <h1>Integrated Marketing Services Ltd.</h1>
                <p>IT Asset Handover &amp; Equipment Gate Pass</p>
            </div>
        </div>
        <div class="doc-meta">
            <strong>TAG: ${escapeHtml(asset.tag)}</strong>
            Date: ${todayStr}<br>
            Status: ${escapeHtml(asset.status)}
        </div>
    </div>

    <div class="section-title">1. Equipment / Asset Information</div>
    <table>
        <tr><td class="label">Asset Name</td><td>${escapeHtml(asset.name)}</td><td class="label">Category</td><td>${escapeHtml(asset.category)}</td></tr>
        <tr><td class="label">Brand &amp; Model</td><td>${escapeHtml(asset.brand || '-')} ${escapeHtml(asset.model || '')}</td><td class="label">Serial Number</td><td>${escapeHtml(asset.serial || 'N/A')}</td></tr>
        <tr><td class="label">Specifications</td><td colspan="3">${escapeHtml(asset.specs || 'N/A')}</td></tr>
        <tr><td class="label">Valuation Cost</td><td>${formatTaka(asset.price || 0)}</td><td class="label">Supplier / Vendor</td><td>${escapeHtml(vendor ? vendor.name : 'N/A')}</td></tr>
        <tr><td class="label">Purchase Date</td><td>${escapeHtml(asset.purchaseDate || 'N/A')}</td><td class="label">Warranty Expiry</td><td>${escapeHtml(asset.warrantyExpiry || 'N/A')}</td></tr>
        ${asset.notes ? `<tr><td class="label">Remarks / Condition</td><td colspan="3">${escapeHtml(asset.notes)}</td></tr>` : ''}
    </table>

    <div class="section-title">2. Custodian / Assignment Details</div>
    <table>
        <tr><td class="label">Assigned Employee</td><td><strong>${escapeHtml(asset.assignedUser || 'Unassigned / Event Pool')}</strong></td><td class="label">Department</td><td>${escapeHtml(asset.department || 'N/A')}</td></tr>
    </table>

    <div class="terms">
        <strong>Custodian Acknowledgement:</strong> I confirm receipt of the above company IT asset in good working condition. I agree to take reasonable care of the equipment, use it strictly for Integrated Marketing Services Ltd. duties/events, report any damage or malfunction promptly to IT, and return the asset upon request or separation.
    </div>

    <div class="sig-grid">
        <div class="sig-box">
            <strong>${escapeHtml(asset.assignedUser || 'Employee / Custodian')}</strong>
            <small>Received By (Signature &amp; Date)</small>
        </div>
        <div class="sig-box">
            <strong>IT Department</strong>
            <small>Issued / Verified By</small>
        </div>
        <div class="sig-box">
            <strong>Operations / HR</strong>
            <small>Authorized Approval</small>
        </div>
    </div>

    <div class="no-print" style="margin-top:32px; text-align:center;">
        <button onclick="window.print()" style="padding:10px 22px; background:#ec2028; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer; font-size:14px;">🖨️ Print / Save as PDF</button>
    </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=750');
    if (win) {
        win.document.open();
        win.document.write(printHtml);
        win.document.close();
        win.focus();
    } else {
        alert('Popup blocked! Please allow popups for this site to print the Handover / Gate Pass.');
    }
};

// ================= ASSET STATUS & LIFECYCLE ACTIONS =================
window.returnAsset = function(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const oldUser = asset.assignedUser;
    const oldDept = asset.department;

    asset.status = 'Available';
    asset.assignedUser = '';
    asset.department = '';

    saveState();
    logTransaction('Return', asset.tag, asset.name, `Device returned to base stock. Formerly used by ${oldUser} (${oldDept}).`);
    renderAll();
};

window.setAssetAvailable = function(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    asset.status = asset.assignedUser ? 'Assigned' : 'Available';
    saveState();
    logTransaction('Status Change', asset.tag, asset.name, `Device marked ${asset.status} (released from Maintenance repair).`);
    renderAll();
};

window.toggleRetireAsset = function(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    if (asset.status === 'Retired') {
        asset.status = asset.assignedUser ? 'Assigned' : 'Available';
        saveState();
        logTransaction('Status Change', asset.tag, asset.name, `Asset restored from Retired to [${asset.status}].`);
    } else {
        if (!confirm(`Mark "${asset.name}" (${asset.tag}) as Retired / Out of Service? Its history will be preserved.`)) return;
        const prevUser = asset.assignedUser ? ` (formerly assigned to ${asset.assignedUser})` : '';
        asset.status = 'Retired';
        asset.assignedUser = '';
        asset.department = '';
        saveState();
        logTransaction('Status Change', asset.tag, asset.name, `Asset marked as Retired / Out of Service${prevUser}.`);
    }
    renderAll();
    openDrawer(asset.id);
};

function deleteAsset(assetId) {
    const index = state.assets.findIndex(a => a.id === assetId);
    if (index === -1) return;

    const asset = state.assets[index];
    const linkedLogsCount = state.maintenance.filter(m => m.assetId === asset.id).length;
    const extraMsg = linkedLogsCount > 0 ? `\n\nThis will also remove ${linkedLogsCount} linked maintenance record(s).` : '';

    if (confirm(`Are you absolutely sure you want to permanently delete ${asset.name} (${asset.tag})?${extraMsg}\n\nTip: Use "Mark Retired" instead if you want to keep its history.`)) {
        state.assets.splice(index, 1);
        if (linkedLogsCount > 0) {
            state.maintenance = state.maintenance.filter(m => m.assetId !== asset.id);
        }
        saveState();
        logTransaction('Status Change', asset.tag, asset.name, `Asset permanently deleted from IMS records.`);
        renderAll();
    }
}

// ================= VENDORS RENDERER =================
function renderVendors() {
    const grid = DOM.vendorsGridContainer;
    const query = DOM.vendorsSearch.value.trim().toLowerCase();
    grid.innerHTML = '';

    const filtered = state.vendors.filter(v => {
        if (!query) return true;
        return (
            (v.name || '').toLowerCase().includes(query) ||
            (v.contactPerson || '').toLowerCase().includes(query) ||
            (v.mobile || '').toLowerCase().includes(query) ||
            (v.address || '').toLowerCase().includes(query)
        );
    });

    if (filtered.length === 0) {
        DOM.vendorsEmptyState.style.display = 'flex';
        return;
    } else {
        DOM.vendorsEmptyState.style.display = 'none';
    }

    filtered.forEach(vendor => {
        const card = document.createElement('div');
        card.className = 'card-vendor';
        const safeVId = escapeHtml(vendor.id);
        const countSupplied = state.assets.filter(a => a.vendorId === vendor.id).length;

        // Fix duplicate "(Sales Manager)" label
        const contactDisplay = (vendor.contactPerson || '').includes('(')
            ? vendor.contactPerson
            : `${vendor.contactPerson || 'N/A'} (Sales Manager)`;

        let actionsHtml = '';
        if (state.isAdmin) {
            actionsHtml = `
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="openVendorModal('${safeVId}')" title="Edit supplier profile">✏️</button>
                    <button class="btn btn-danger btn-sm" style="padding:4px 8px;" onclick="deleteVendor('${safeVId}')" title="Delete supplier">🗑️</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="vendor-title">
                <div>
                    <h3 class="vendor-name">${escapeHtml(vendor.name)}</h3>
                    <span style="font-size:11px; background:rgba(168, 85, 247, 0.15); border:1px solid rgba(168, 85, 247, 0.3); color:var(--color-secondary); padding: 2px 6px; border-radius:var(--radius-full); font-weight:600; text-transform:uppercase; margin-top: 6px; display:inline-block;">
                        ${countSupplied} assets supplied
                    </span>
                </div>
                ${actionsHtml}
            </div>
            <div class="vendor-contact-details">
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span>${escapeHtml(contactDisplay)}</span>
                </div>
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <a href="tel:${escapeHtml(vendor.mobile)}" style="font-family:monospace; font-weight:600; color:var(--color-primary); text-decoration:none;" title="Click to call vendor">${escapeHtml(vendor.mobile || 'N/A')}</a>
                </div>
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span>${escapeHtml(vendor.email || 'N/A')}</span>
                </div>
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span style="font-size:12.5px;">${escapeHtml(vendor.address || 'N/A')}</span>
                </div>
            </div>
            ${vendor.notes ? `<div class="vendor-notes">${escapeHtml(vendor.notes)}</div>` : ''}
        `;
        grid.appendChild(card);
    });
}

window.deleteVendor = function(vendorId) {
    const linked = state.assets.some(a => a.vendorId === vendorId);
    if (linked) {
        alert('Cannot delete vendor. This vendor is currently linked to physical assets in your inventory. Re-assign those assets to another supplier first.');
        return;
    }
    if (confirm('Are you sure you want to remove this vendor from IMS records?')) {
        const idx = state.vendors.findIndex(v => v.id === vendorId);
        if (idx !== -1) {
            state.vendors.splice(idx, 1);
            saveState();
            renderAll();
        }
    }
};

// ================= LOGS RENDERING (WITH PAGINATION) =================
function renderLogs() {
    if (!state.isAdmin) return;

    const tableBody = DOM.logsTableBody;
    const query = DOM.logsSearch.value.trim().toLowerCase();
    const typeFilter = DOM.filterLogType.value;
    tableBody.innerHTML = '';

    const filtered = state.transactions.filter(log => {
        if (typeFilter !== 'all' && log.type !== typeFilter) return false;
        if (query) {
            return (
                (log.assetName || '').toLowerCase().includes(query) ||
                (log.assetTag || '').toLowerCase().includes(query) ||
                (log.type || '').toLowerCase().includes(query) ||
                (log.details || '').toLowerCase().includes(query)
            );
        }
        return true;
    });

    if (filtered.length === 0) {
        DOM.logsEmptyState.style.display = 'flex';
        if (DOM.logsPagination) DOM.logsPagination.style.display = 'none';
        return;
    } else {
        DOM.logsEmptyState.style.display = 'none';
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / logsPagination.pageSize);
    if (logsPagination.currentPage > totalPages) logsPagination.currentPage = totalPages;
    if (logsPagination.currentPage < 1) logsPagination.currentPage = 1;

    const startIdx = (logsPagination.currentPage - 1) * logsPagination.pageSize;
    const endIdx = Math.min(startIdx + logsPagination.pageSize, totalItems);
    const pageLogs = filtered.slice(startIdx, endIdx);

    pageLogs.forEach(log => {
        const tr = document.createElement('tr');
        let actionClass = 'status-badge ';
        if (log.type === 'Purchase') actionClass += 'status-available';
        else if (log.type === 'Assignment') actionClass += 'status-assigned';
        else if (log.type === 'Return') actionClass += 'status-available';
        else if (log.type === 'Maintenance') actionClass += 'status-maintenance';
        else actionClass += 'status-retired';

        const date = new Date(log.timestamp).toLocaleString();
        tr.innerHTML = `
            <td style="color:var(--text-muted); font-size:12.5px; font-family:monospace;">${escapeHtml(date)}</td>
            <td><span class="${actionClass}">${escapeHtml(log.type)}</span></td>
            <td><span class="asset-tag-pill">${escapeHtml(log.assetTag)}</span></td>
            <td style="font-weight:600;">${escapeHtml(log.assetName)}</td>
            <td style="font-size:13px; color:var(--text-secondary); max-width:320px;">${escapeHtml(log.details)}</td>
            <td style="font-size:12px; color:var(--text-muted); font-weight:500;">${escapeHtml(log.operator)}</td>
        `;
        tableBody.appendChild(tr);
    });

    if (DOM.logsPagination) {
        if (totalItems > logsPagination.pageSize) {
            DOM.logsPagination.style.display = 'flex';
            DOM.logsPaginationInfo.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalItems} logs (Page ${logsPagination.currentPage}/${totalPages})`;
            DOM.btnLogsPrev.disabled = (logsPagination.currentPage === 1);
            DOM.btnLogsNext.disabled = (logsPagination.currentPage === totalPages);
        } else {
            DOM.logsPagination.style.display = 'none';
        }
    }
}

function clearLogs() {
    if (confirm('Are you sure you want to empty the activity trail logs?')) {
        state.transactions = [];
        saveState();
        renderLogs();
    }
}

// ================= MODAL OPEN/CLOSE UTILITIES =================
window.openModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
};

window.closeModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
};

function switchModalTab(tabId) {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-modal-tab') === tabId);
    });
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

function openAssetModal(assetId = null) {
    DOM.assetForm.reset();
    populateVendorDropdowns();
    switchModalTab('modal-tab-info');

    tempAttachedPhoto = '';
    tempAttachedInvoice = '';
    DOM.photoFileStatus.textContent = 'None';
    DOM.photoFileStatus.style.color = 'var(--text-muted)';
    DOM.invoiceFileStatus.textContent = 'None';
    DOM.invoiceFileStatus.style.color = 'var(--text-muted)';
    if (DOM.btnRemovePhoto) DOM.btnRemovePhoto.style.display = 'none';
    if (DOM.btnRemoveInvoice) DOM.btnRemoveInvoice.style.display = 'none';

    if (assetId) {
        const asset = state.assets.find(a => a.id === assetId);
        if (!asset) return;

        DOM.assetFormId.value = asset.id;
        DOM.assetModalTitle.textContent = 'Edit Asset Details';
        DOM.assetNameInput.value = asset.name;
        DOM.assetTagInput.value = asset.tag;

        // Detect existing prefix for the prefix selector
        if (DOM.assetTagPrefix && asset.tag) {
            const pMatch = asset.tag.match(/^([A-Z]+)-/i);
            if (pMatch) {
                const pVal = pMatch[1].toUpperCase();
                if ([...DOM.assetTagPrefix.options].some(o => o.value === pVal)) {
                    DOM.assetTagPrefix.value = pVal;
                }
            }
        }
        if (DOM.assetTagHint) DOM.assetTagHint.textContent = 'Editing existing asset tag';

        DOM.assetCategoryInput.value = asset.category;
        DOM.assetBrandInput.value = asset.brand || '';
        DOM.assetModelInput.value = asset.model || '';
        DOM.assetSerialInput.value = asset.serial || '';
        DOM.assetSpecsInput.value = asset.specs || '';
        DOM.assetPriceInput.value = asset.price || 0;
        DOM.assetVendorSelect.value = asset.vendorId || '';
        DOM.assetPurchaseDateInput.value = asset.purchaseDate || '';
        DOM.assetWarrantyInput.value = asset.warrantyExpiry || '';
        DOM.assetNotesInput.value = asset.notes || '';

        if (asset.attachedPhoto) {
            tempAttachedPhoto = asset.attachedPhoto;
            DOM.photoFileStatus.textContent = 'Has Photo ✓';
            DOM.photoFileStatus.style.color = 'var(--color-success)';
            if (DOM.btnRemovePhoto) DOM.btnRemovePhoto.style.display = 'inline-flex';
        }
        if (asset.attachedInvoice) {
            tempAttachedInvoice = asset.attachedInvoice;
            DOM.invoiceFileStatus.textContent = 'Has Invoice ✓';
            DOM.invoiceFileStatus.style.color = 'var(--color-success)';
            if (DOM.btnRemoveInvoice) DOM.btnRemoveInvoice.style.display = 'inline-flex';
        }
    } else {
        DOM.assetFormId.value = '';
        DOM.assetModalTitle.textContent = 'Register New IMS Asset';
        DOM.assetPurchaseDateInput.value = new Date().toISOString().split('T')[0];
        DOM.assetNotesInput.value = '';
        if (DOM.assetTagPrefix) DOM.assetTagPrefix.value = 'IMS';
        // Auto-generate next sequential Asset Tag immediately!
        applyAutoGeneratedTag();
    }

    openModal('asset-modal');
}

window.openAssignModal = function(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    DOM.assignForm.reset();
    DOM.assignFormAssetId.value = asset.id;
    DOM.assignAssetName.textContent = `${asset.name} (${asset.tag})`;
    openModal('assign-modal');
};

function openMaintenanceModal(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    DOM.maintenanceForm.reset();
    populateVendorDropdowns();

    tempMaintInvoice = '';
    if (DOM.maintInvoiceStatus) {
        DOM.maintInvoiceStatus.textContent = 'None';
        DOM.maintInvoiceStatus.style.color = 'var(--text-muted)';
    }
    if (DOM.btnRemoveMaintInvoice) DOM.btnRemoveMaintInvoice.style.display = 'none';

    DOM.maintenanceFormAssetId.value = asset.id;
    DOM.maintenanceFormLogId.value = '';
    DOM.maintenanceModalTitle.textContent = 'Log Hardware Upgrade / Replacement';
    DOM.maintenanceAssetDisplay.value = `${asset.name} (${asset.tag})`;
    DOM.maintVendorSelect.value = asset.vendorId || '';
    DOM.maintDateInput.value = new Date().toISOString().split('T')[0];

    openModal('maintenance-modal');
}

window.openEditMaintenanceModal = function(logId, event) {
    if (event) event.stopPropagation();
    const log = state.maintenance.find(m => m.id === logId);
    if (!log) return;

    if (log.status === 'Completed' && log.completedEdits >= 1) {
        alert('This completed record has already been edited once and cannot be modified again.');
        return;
    }

    const asset = state.assets.find(a => a.id === log.assetId);
    if (!asset) return;

    DOM.maintenanceForm.reset();
    populateVendorDropdowns();

    DOM.maintenanceFormAssetId.value = log.assetId;
    DOM.maintenanceFormLogId.value = log.id;
    DOM.maintenanceModalTitle.textContent = 'Edit Hardware Upgrade / Replacement';
    DOM.maintenanceAssetDisplay.value = `${asset.name} (${asset.tag})`;
    DOM.maintPartInput.value = log.partReplaced;
    DOM.maintCostInput.value = log.cost;
    DOM.maintVendorSelect.value = log.vendorId || '';
    DOM.maintDateInput.value = log.date;
    DOM.maintStatusSelect.value = log.status;
    DOM.maintDescInput.value = log.description;
    DOM.maintReasonInput.value = log.reason;

    if (log.attachedInvoice) {
        tempMaintInvoice = log.attachedInvoice;
        if (DOM.maintInvoiceStatus) {
            DOM.maintInvoiceStatus.textContent = 'Has Bill ✓';
            DOM.maintInvoiceStatus.style.color = 'var(--color-success)';
        }
        if (DOM.btnRemoveMaintInvoice) DOM.btnRemoveMaintInvoice.style.display = 'inline-flex';
    } else {
        tempMaintInvoice = '';
        if (DOM.maintInvoiceStatus) {
            DOM.maintInvoiceStatus.textContent = 'None';
            DOM.maintInvoiceStatus.style.color = 'var(--text-muted)';
        }
        if (DOM.btnRemoveMaintInvoice) DOM.btnRemoveMaintInvoice.style.display = 'none';
    }

    openModal('maintenance-modal');
};

window.openMaintenanceInvoice = function(logId, event) {
    if (event) event.stopPropagation();
    const log = state.maintenance.find(m => m.id === logId);
    if (log && log.attachedInvoice) {
        openInvoice(log.attachedInvoice, `${log.assetTag || 'REPAIR'}_${log.partReplaced || 'bill'}`);
    }
};

window.openVendorModal = function(vendorId = null) {
    DOM.vendorForm.reset();
    if (vendorId) {
        const vendor = state.vendors.find(v => v.id === vendorId);
        if (!vendor) return;

        DOM.vendorFormId.value = vendor.id;
        DOM.vendorModalTitle.textContent = 'Edit Supplier Details';
        DOM.vendorNameInput.value = vendor.name;
        DOM.vendorContactInput.value = vendor.contactPerson;
        DOM.vendorMobileInput.value = vendor.mobile;
        DOM.vendorEmailInput.value = vendor.email;
        DOM.vendorAddressInput.value = vendor.address || '';
        DOM.vendorNotesInput.value = vendor.notes || '';
    } else {
        DOM.vendorFormId.value = '';
        DOM.vendorModalTitle.textContent = 'Register New Supplier Contact';
    }
    openModal('vendor-modal');
};

// ================= FORM SUBMISSION HANDLERS =================
function handleAssetSubmit(e) {
    e.preventDefault();

    const id = DOM.assetFormId.value;
    const tag = DOM.assetTagInput.value.trim().toUpperCase();
    const name = DOM.assetNameInput.value.trim();
    const category = DOM.assetCategoryInput.value;
    const brand = DOM.assetBrandInput.value.trim();
    const model = DOM.assetModelInput.value.trim();
    const serial = DOM.assetSerialInput.value.trim();
    const specs = DOM.assetSpecsInput.value.trim();
    const price = parseFloat(DOM.assetPriceInput.value) || 0;
    const vendorId = DOM.assetVendorSelect.value;
    const purchaseDate = DOM.assetPurchaseDateInput.value;
    const warrantyExpiry = DOM.assetWarrantyInput.value;
    const notes = DOM.assetNotesInput.value.trim();

    const duplicateTag = state.assets.some(a => (a.tag || '').toUpperCase() === tag && a.id !== id);
    if (duplicateTag) {
        alert(`Duplicate Asset Tag: An asset with the tag "${tag}" is already registered. Click "🔄 Auto" to generate the next available tag.`);
        return;
    }

    if (id) {
        const asset = state.assets.find(a => a.id === id);
        if (!asset) return;

        const oldName = asset.name;
        const oldTag = asset.tag;

        asset.name = name;
        asset.tag = tag;
        asset.category = category;
        asset.brand = brand;
        asset.model = model;
        asset.serial = serial;
        asset.specs = specs;
        asset.price = price;
        asset.vendorId = vendorId;
        asset.purchaseDate = purchaseDate;
        asset.warrantyExpiry = warrantyExpiry;
        asset.notes = notes;
        asset.attachedPhoto = tempAttachedPhoto;
        asset.attachedInvoice = tempAttachedInvoice;

        // Cascade tag & name updates to all linked maintenance logs
        state.maintenance.forEach(m => {
            if (m.assetId === asset.id) {
                m.assetName = name;
                m.assetTag = tag;
            }
        });

        logTransaction('Status Change', tag, name, `Asset properties modified by administrator. Formerly ${oldName} (${oldTag}).`);
    } else {
        const newAsset = {
            id: 'a-' + Date.now() + Math.floor(Math.random() * 100),
            name,
            tag,
            category,
            brand,
            model,
            serial,
            specs,
            price,
            status: 'Available',
            assignedUser: '',
            department: '',
            vendorId,
            purchaseDate,
            warrantyExpiry,
            notes,
            attachedPhoto: tempAttachedPhoto,
            attachedInvoice: tempAttachedInvoice
        };
        state.assets.push(newAsset);
        logTransaction('Purchase', tag, name, `New system hardware registered.`);
    }

    saveState();
    closeModal('asset-modal');
    renderAll();
}

function handleAssignSubmit(e) {
    e.preventDefault();
    const assetId = DOM.assignFormAssetId.value;
    const username = DOM.assignUserInput.value.trim();
    const dept = DOM.assignDeptSelect.value;

    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    asset.status = 'Assigned';
    asset.assignedUser = username;
    asset.department = dept;

    const empExists = state.employees.some(emp => emp.name.toLowerCase() === username.toLowerCase());
    if (!empExists && username) {
        state.employees.push({ name: username, department: dept });
    }

    saveState();
    logTransaction('Assignment', asset.tag, asset.name, `Device successfully assigned to employee ${username} in the ${dept} department.`);
    closeModal('assign-modal');
    renderAll();
}

function handleMaintenanceSubmit(e) {
    e.preventDefault();

    const assetId = DOM.maintenanceFormAssetId.value;
    const logId = DOM.maintenanceFormLogId.value;
    const part = DOM.maintPartInput.value.trim();
    const cost = parseFloat(DOM.maintCostInput.value) || 0;
    const vendorId = DOM.maintVendorSelect.value;
    const date = DOM.maintDateInput.value;
    const status = DOM.maintStatusSelect.value;
    const desc = DOM.maintDescInput.value.trim();
    const reason = DOM.maintReasonInput.value.trim();

    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const vendor = state.vendors.find(v => v.id === vendorId);
    const vendorName = vendor ? vendor.name : 'Unknown Vendor';

    if (logId) {
        const log = state.maintenance.find(m => m.id === logId);
        if (!log) return;

        if (log.status === 'Completed') {
            if (log.completedEdits >= 1) {
                alert('This completed record has already been edited once and cannot be modified again.');
                return;
            }
            log.completedEdits = (log.completedEdits || 0) + 1;
        }

        const oldPart = log.partReplaced;
        const oldStatus = log.status;

        log.partReplaced = part;
        log.cost = cost;
        log.vendorId = vendorId;
        log.vendorName = vendorName;
        log.date = date;
        log.status = status;
        log.description = desc;
        log.reason = reason;
        log.attachedInvoice = tempMaintInvoice;

        if (status === 'Completed') {
            const activeLogs = state.maintenance.filter(m => m.assetId === asset.id && m.status !== 'Completed');
            if (activeLogs.length === 0) {
                asset.status = asset.assignedUser ? 'Assigned' : 'Available';
            }
        } else {
            asset.status = 'Maintenance';
        }

        logTransaction('Maintenance', asset.tag, asset.name, `Modified hardware upgrade: "${part}" (formerly "${oldPart}"), status [${status}] (formerly [${oldStatus}]) supplied by ${vendorName}.`);
    } else {
        const maintenanceLog = {
            id: 'm-' + Date.now(),
            assetId,
            assetName: asset.name,
            assetTag: asset.tag,
            date,
            partReplaced: part,
            description: desc,
            cost,
            vendorId,
            vendorName,
            status,
            reason,
            attachedInvoice: tempMaintInvoice,
            completedEdits: 0
        };

        state.maintenance.push(maintenanceLog);

        if (status === 'Completed') {
            const activeLogs = state.maintenance.filter(m => m.assetId === asset.id && m.status !== 'Completed');
            if (activeLogs.length === 0) {
                asset.status = asset.assignedUser ? 'Assigned' : 'Available';
            }
        } else {
            asset.status = 'Maintenance';
        }

        logTransaction('Maintenance', asset.tag, asset.name, `Logged hardware upgrade: "${part}" status [${status}] supplied by ${vendorName}. Reason: ${reason}.`);
    }

    saveState();
    closeModal('maintenance-modal');
    dashboardMaintPagination.currentPage = 1;
    renderAll();
}

function handleVendorSubmit(e) {
    e.preventDefault();

    const id = DOM.vendorFormId.value;
    const name = DOM.vendorNameInput.value.trim();
    const contact = DOM.vendorContactInput.value.trim();
    const mobile = DOM.vendorMobileInput.value.trim();
    const email = DOM.vendorEmailInput.value.trim();
    const address = DOM.vendorAddressInput.value.trim();
    const notes = DOM.vendorNotesInput.value.trim();

    if (id) {
        const vendor = state.vendors.find(v => v.id === id);
        if (!vendor) return;
        vendor.name = name;
        vendor.contactPerson = contact;
        vendor.mobile = mobile;
        vendor.email = email;
        vendor.address = address;
        vendor.notes = notes;
    } else {
        state.vendors.push({
            id: 'v-' + Date.now(),
            name,
            contactPerson: contact,
            mobile,
            email,
            address,
            notes
        });
    }

    saveState();
    closeModal('vendor-modal');
    renderAll();
}

// ================= ROBUST RFC-4180 CSV & BLOB DOWNLOAD ENGINE =================
function downloadFileBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Proper RFC-4180 CSV parser supporting multiline quoted fields & escaped quotes
function parseFullCSV(content) {
    const cleanContent = content.replace(/^\uFEFF/, '');
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < cleanContent.length; i++) {
        const char = cleanContent[i];
        const nextChar = cleanContent[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentField += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentRow.push(currentField.trim());
            currentField = '';
            if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
        } else {
            currentField += char;
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
            rows.push(currentRow);
        }
    }
    return rows;
}

function csvCell(val) {
    const s = val === null || val === undefined ? '' : String(val);
    return `"${s.replace(/"/g, '""')}"`;
}

function exportInventoryToCSV() {
    if (state.assets.length === 0) {
        alert('The inventory list is empty. Add assets before exporting.');
        return;
    }
    const headers = ['Asset Tag', 'Asset Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Specs', 'Valuation Cost', 'Status', 'Assigned User', 'Department', 'Purchase Date', 'Warranty Expiry', 'Notes'];
    const csvRows = [headers.join(',')];

    state.assets.forEach(asset => {
        csvRows.push([
            csvCell(asset.tag),
            csvCell(asset.name),
            csvCell(asset.category),
            csvCell(asset.brand || ''),
            csvCell(asset.model || ''),
            csvCell(asset.serial || ''),
            csvCell(asset.specs || ''),
            asset.price || 0,
            csvCell(asset.status),
            csvCell(asset.assignedUser || ''),
            csvCell(asset.department || ''),
            csvCell(asset.purchaseDate || ''),
            csvCell(asset.warrantyExpiry || ''),
            csvCell(asset.notes || '')
        ].join(','));
    });

    downloadFileBlob('\uFEFF' + csvRows.join('\n'), `ims_asset_inventory_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

function importInventoryFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const rows = parseFullCSV(evt.target.result);
            if (rows.length <= 1) throw new Error('File empty or invalid.');

            const headerRow = rows[0];
            if (!headerRow.includes('Asset Tag') || !headerRow.includes('Asset Name')) {
                alert("Invalid CSV format. Your CSV file must contain 'Asset Tag' and 'Asset Name' headers.");
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;
            const defaultVendorId = state.vendors.length > 0 ? state.vendors[0].id : 'v-default';

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i];
                if (cols.length < 2) continue;

                const getVal = (headerName, fallback = '') => {
                    const idx = headerRow.indexOf(headerName);
                    return idx !== -1 && cols[idx] !== undefined ? cols[idx] : fallback;
                };

                const tag = getVal('Asset Tag').toUpperCase();
                const name = getVal('Asset Name');
                if (!tag || !name || state.assets.some(a => (a.tag || '').toUpperCase() === tag)) {
                    skippedCount++;
                    continue;
                }

                const category = getVal('Category', 'Computer');
                const department = getVal('Department', '');
                if (category && !state.categories.includes(category)) state.categories.push(category);
                if (department && !state.departments.includes(department)) state.departments.push(department);

                state.assets.push({
                    id: 'a-' + Date.now() + '-' + i,
                    name,
                    tag,
                    category,
                    brand: getVal('Brand', 'Generic'),
                    model: getVal('Model', ''),
                    serial: getVal('Serial Number', ''),
                    specs: getVal('Specs', ''),
                    price: parseFloat(getVal('Valuation Cost', '0')) || 0,
                    status: getVal('Status', 'Available'),
                    assignedUser: getVal('Assigned User', ''),
                    department,
                    vendorId: defaultVendorId,
                    purchaseDate: getVal('Purchase Date', new Date().toISOString().split('T')[0]),
                    warrantyExpiry: getVal('Warranty Expiry', ''),
                    notes: getVal('Notes', ''),
                    attachedPhoto: '',
                    attachedInvoice: ''
                });
                addedCount++;
            }

            saveState();
            renderAll();
            alert(`CSV Import Finished! Added ${addedCount} new assets. (Skipped ${skippedCount} duplicates/invalid rows)`);
            logTransaction('Status Change', 'CSV-IMP', 'System Bulk Import', `Bulk registered ${addedCount} assets via CSV import file.`);
        } catch (err) {
            console.error(err);
            alert('Error parsing CSV file. Please make sure the structure is correct.');
        }
    };
    reader.readAsText(file);
    DOM.importCsvFile.value = '';
}

function exportVendorsToCSV() {
    if (state.vendors.length === 0) {
        alert('The vendors list is empty. Register vendors before exporting.');
        return;
    }
    const headers = ['Company Name', 'Contact Person', 'Mobile Number', 'Email Address', 'Office Address', 'Services & Notes'];
    const csvRows = [headers.join(',')];

    state.vendors.forEach(vendor => {
        csvRows.push([
            csvCell(vendor.name),
            csvCell(vendor.contactPerson || ''),
            csvCell(vendor.mobile || ''),
            csvCell(vendor.email || ''),
            csvCell(vendor.address || ''),
            csvCell(vendor.notes || '')
        ].join(','));
    });

    downloadFileBlob('\uFEFF' + csvRows.join('\n'), `ims_vendors_list_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

function importVendorsFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const rows = parseFullCSV(evt.target.result);
            if (rows.length <= 1) throw new Error('File empty or invalid.');

            const headerRow = rows[0];
            if (!headerRow.includes('Company Name') || !headerRow.includes('Mobile Number')) {
                alert("Invalid CSV format. Your CSV file must contain 'Company Name' and 'Mobile Number' headers.");
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i];
                if (cols.length < 2) continue;

                const getVal = (headerName, fallback = '') => {
                    const idx = headerRow.indexOf(headerName);
                    return idx !== -1 && cols[idx] !== undefined ? cols[idx] : fallback;
                };

                const name = getVal('Company Name');
                const mobile = getVal('Mobile Number');
                if (!name) {
                    skippedCount++;
                    continue;
                }
                if (state.vendors.some(v => v.name.toLowerCase() === name.toLowerCase() || (mobile && v.mobile === mobile))) {
                    skippedCount++;
                    continue;
                }

                state.vendors.push({
                    id: 'v-' + Date.now() + '-' + i,
                    name,
                    contactPerson: getVal('Contact Person', 'Admin'),
                    mobile,
                    email: getVal('Email Address', ''),
                    address: getVal('Office Address', ''),
                    notes: getVal('Services & Notes', '')
                });
                addedCount++;
            }

            saveState();
            renderAll();
            alert(`CSV Import Finished! Added ${addedCount} new vendors. (Skipped ${skippedCount} duplicates/invalid rows)`);
            logTransaction('Status Change', 'CSV-IMP', 'Vendors Bulk Import', `Bulk registered ${addedCount} vendors via CSV import file.`);
        } catch (err) {
            console.error(err);
            alert('Error parsing CSV file. Please make sure the structure is correct.');
        }
    };
    reader.readAsText(file);
    DOM.importVendorsCsvFile.value = '';
}

function exportMaintenanceToCSV() {
    if (state.maintenance.length === 0) {
        alert('The maintenance list is empty. Log upgrades before exporting.');
        return;
    }
    const headers = ['Asset Tag', 'Part Replaced', 'Cost', 'Supplier/Vendor Name', 'Date Performed', 'Status', 'Description', 'Reason'];
    const csvRows = [headers.join(',')];

    state.maintenance.forEach(maint => {
        const asset = state.assets.find(a => a.id === maint.assetId);
        const tag = asset ? asset.tag : (maint.assetTag || 'UNKNOWN');
        const vendor = state.vendors.find(v => v.id === maint.vendorId);
        const vendorName = vendor ? vendor.name : (maint.vendorName || 'Unknown Vendor');

        csvRows.push([
            csvCell(tag),
            csvCell(maint.partReplaced),
            maint.cost || 0,
            csvCell(vendorName),
            csvCell(maint.date || ''),
            csvCell(maint.status || 'Completed'),
            csvCell(maint.description || ''),
            csvCell(maint.reason || '')
        ].join(','));
    });

    downloadFileBlob('\uFEFF' + csvRows.join('\n'), `ims_maintenance_logs_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

function importMaintenanceFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const rows = parseFullCSV(evt.target.result);
            if (rows.length <= 1) throw new Error('File empty or invalid.');

            const headerRow = rows[0];
            if (!headerRow.includes('Asset Tag') || !headerRow.includes('Part Replaced')) {
                alert("Invalid CSV format. Your CSV file must contain 'Asset Tag' and 'Part Replaced' headers.");
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;
            const newTransactions = [];

            for (let i = 1; i < rows.length; i++) {
                const cols = rows[i];
                if (cols.length < 2) continue;

                const getVal = (headerName, fallback = '') => {
                    const idx = headerRow.indexOf(headerName);
                    return idx !== -1 && cols[idx] !== undefined ? cols[idx] : fallback;
                };

                const tag = getVal('Asset Tag').toUpperCase();
                const part = getVal('Part Replaced');
                const asset = state.assets.find(a => (a.tag || '').toUpperCase() === tag);
                if (!tag || !part || !asset) {
                    skippedCount++;
                    continue;
                }

                const vName = getVal('Supplier/Vendor Name', 'GOTech Computer');
                let vendor = state.vendors.find(v => v.name.toLowerCase() === vName.toLowerCase());
                if (!vendor && state.vendors.length > 0) vendor = state.vendors[0];

                const cost = parseFloat(getVal('Cost', '0')) || 0;
                const status = getVal('Status', 'Completed');
                const date = getVal('Date Performed', new Date().toISOString().split('T')[0]);
                const description = getVal('Description', part);
                const reason = getVal('Reason', 'Upgrade / Repair');

                state.maintenance.push({
                    id: 'm-' + Date.now() + '-' + i,
                    assetId: asset.id,
                    assetName: asset.name,
                    assetTag: asset.tag,
                    partReplaced: part,
                    cost,
                    vendorId: vendor ? vendor.id : '',
                    vendorName: vendor ? vendor.name : vName,
                    date,
                    status,
                    description,
                    reason,
                    completedEdits: 0
                });

                newTransactions.push({
                    id: 't-' + Date.now() + '-' + i,
                    timestamp: new Date().toISOString(),
                    type: 'Maintenance',
                    assetTag: asset.tag,
                    assetName: asset.name,
                    details: `[CSV Import] Logged hardware upgrade: "${part}" status [${status}] supplied by ${vendor ? vendor.name : vName}.`,
                    operator: `IT Admin (${state.role.toUpperCase()})`
                });

                if (status !== 'Completed') asset.status = 'Maintenance';
                addedCount++;
            }

            state.transactions = [...newTransactions, ...state.transactions];
            saveState();
            dashboardMaintPagination.currentPage = 1;
            renderAll();
            alert(`CSV Import Finished! Added ${addedCount} maintenance records. (Skipped ${skippedCount} unmatched rows)`);
        } catch (err) {
            console.error(err);
            alert('Error parsing CSV file. Please make sure the structure is correct.');
        }
    };
    reader.readAsText(file);
    DOM.importMaintCsvFile.value = '';
}

// ================= COMPLETE SYSTEM BACKUP (ALL-IN-ONE JSON) =================
function exportFullSystemBackup() {
    const backupObj = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        assets: state.assets,
        vendors: state.vendors,
        employees: state.employees,
        maintenance: state.maintenance,
        transactions: state.transactions,
        categories: state.categories,
        departments: state.departments
    };
    downloadFileBlob(JSON.stringify(backupObj, null, 2), `ims_complete_system_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json;charset=utf-8;');
}

function importFullSystemBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = JSON.parse(evt.target.result);
            if (!Array.isArray(data.assets) || !Array.isArray(data.vendors)) {
                alert('Invalid backup file. The selected file does not contain valid IMS inventory records.');
                return;
            }
            state.assets = data.assets || [];
            state.vendors = data.vendors || [];
            state.employees = data.employees || [];
            state.maintenance = data.maintenance || [];
            state.transactions = data.transactions || [];
            if (Array.isArray(data.categories)) state.categories = data.categories;
            if (Array.isArray(data.departments)) state.departments = data.departments;

            saveState();
            renderAll();
            alert(`Complete system restored:\n• ${state.assets.length} Assets\n• ${state.vendors.length} Vendors\n• ${state.maintenance.length} Maintenance Logs\n\nAll records saved and synced!`);
        } catch (err) {
            console.error(err);
            alert('Error reading backup file. Please ensure it is a valid JSON file.');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// ================= CUSTOM CORPORATE LOGO =================
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) {
        alert('Logo file is too large. Please upload an image under 500KB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        localStorage.setItem('ims_custom_logo', base64);
        applyCustomLogo(base64);
        logTransaction('Status Change', 'LOGO', 'Corporate Branding', 'Corporate logo customized by administrator.');
    };
    reader.readAsDataURL(file);
}

function applyCustomLogo(base64) {
    document.querySelectorAll('.clickable-logo').forEach(display => {
        display.innerHTML = `<img src="${base64}" alt="IMS Logo" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
        display.style.background = 'none';
        display.style.border = '1px solid var(--border-color)';
    });
}

function checkCustomLogo() {
    const savedLogo = localStorage.getItem('ims_custom_logo');
    if (savedLogo) applyCustomLogo(savedLogo);
}

// ================= SECURITY & CREDENTIALS UPDATE =================
async function handlePasswordChange(e) {
    e.preventDefault();
    const targetRole = DOM.changePasswordRole ? DOM.changePasswordRole.value : 'admin';
    const oldPassword = DOM.oldPasswordInput.value;
    const newPassword = DOM.newPasswordInput.value;
    const confirmPassword = DOM.confirmPasswordInput.value;

    if (newPassword.length < 4) {
        alert('New password must be at least 4 characters long.');
        return;
    }
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match.');
        return;
    }

    const payload = { currentPassword: oldPassword };
    if (targetRole === 'admin') payload.newAdminPassword = newPassword;
    else payload.newStaffPassword = newPassword;

    try {
        const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            alert(data.error || 'Failed to update password. Please verify your current Admin password.');
            return;
        }
        if (targetRole === 'admin') {
            state.adminPassword = newPassword;
            localStorage.setItem('ims_admin_password', newPassword);
        } else {
            state.staffPassword = newPassword;
            localStorage.setItem('ims_staff_password', newPassword);
        }
        logTransaction('Status Change', 'SECURITY', `${targetRole === 'admin' ? 'Admin' : 'Staff'} Credentials`, `${targetRole} password updated by administrator.`);
        alert(data.message || 'Password updated successfully!');
        DOM.changePasswordForm.reset();
    } catch {
        // Offline local-only fallback
        if (oldPassword !== (state.adminPassword || 'queenbee')) {
            alert('Incorrect current Admin password.');
            return;
        }
        if (targetRole === 'admin') {
            state.adminPassword = newPassword;
            localStorage.setItem('ims_admin_password', newPassword);
        } else {
            state.staffPassword = newPassword;
            localStorage.setItem('ims_staff_password', newPassword);
        }
        alert('Password updated locally.');
        DOM.changePasswordForm.reset();
    }
}

// ================= WARRANTY RENEWALS =================
window.extendWarranty = function(assetId, event) {
    if (event) event.stopPropagation();
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const newDate = prompt(`Enter new warranty expiry date for ${asset.name} (YYYY-MM-DD):`, asset.warrantyExpiry || '');
    if (newDate && /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        asset.warrantyExpiry = newDate;
        saveState();
        renderAll();
        openDrawer(asset.id);
        logTransaction('Status Change', asset.tag, asset.name, `Warranty coverage extended to ${newDate} by administrator.`);
    } else if (newDate) {
        alert('Invalid date format. Use YYYY-MM-DD (e.g. 2028-12-31).');
    }
};

// ================= DROPDOWNS POPULATOR (PRESERVES ACTIVE FILTERS!) =================
function populateCategoriesAndDepartments() {
    const allCategories = [...new Set([...state.categories, ...state.assets.map(a => a.category).filter(Boolean)])];
    const allDepartments = [...new Set([...state.departments, ...state.assets.map(a => a.department).filter(Boolean)])];

    const filterCatSelect = document.getElementById('filter-category');
    if (filterCatSelect) {
        const prevCat = filterCatSelect.value || 'all';
        let opts = '<option value="all">All Categories</option>';
        allCategories.forEach(cat => {
            opts += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
        });
        filterCatSelect.innerHTML = opts;
        filterCatSelect.value = [...filterCatSelect.options].some(o => o.value === prevCat) ? prevCat : 'all';
    }

    const filterDeptSelect = document.getElementById('filter-department');
    if (filterDeptSelect) {
        const prevDept = filterDeptSelect.value || 'all';
        let opts = '<option value="all">All Departments</option><option value="__unassigned__">Unassigned / Stock</option>';
        allDepartments.forEach(dept => {
            opts += `<option value="${escapeHtml(dept)}">${escapeHtml(dept)}</option>`;
        });
        filterDeptSelect.innerHTML = opts;
        filterDeptSelect.value = [...filterDeptSelect.options].some(o => o.value === prevDept) ? prevDept : 'all';
    }

    const assetCatSelect = document.getElementById('asset-category');
    if (assetCatSelect) {
        const prevModalCat = assetCatSelect.value;
        let opts = '';
        allCategories.forEach(cat => {
            opts += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
        });
        assetCatSelect.innerHTML = opts;
        if (prevModalCat && [...assetCatSelect.options].some(o => o.value === prevModalCat)) {
            assetCatSelect.value = prevModalCat;
        }
    }

    const assignDeptSelect = document.getElementById('assign-dept');
    if (assignDeptSelect) {
        const prevAssignDept = assignDeptSelect.value;
        let opts = '';
        allDepartments.forEach(dept => {
            opts += `<option value="${escapeHtml(dept)}">${escapeHtml(dept)}</option>`;
        });
        assignDeptSelect.innerHTML = opts;
        if (prevAssignDept && [...assignDeptSelect.options].some(o => o.value === prevAssignDept)) {
            assignDeptSelect.value = prevAssignDept;
        }
    }
}

// ================= SETTINGS CONFIG MANAGERS =================
function renderSettingsManagers() {
    if (!state.isAdmin) return;

    const catList = document.getElementById('settings-categories-list');
    if (catList) {
        catList.innerHTML = '';
        state.categories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'settings-manager-item';
            const span = document.createElement('span');
            span.textContent = cat;
            const btn = document.createElement('button');
            btn.className = 'btn-delete-item';
            btn.title = 'Delete Category';
            btn.innerHTML = '&times;';
            btn.addEventListener('click', () => deleteCategory(cat));
            div.appendChild(span);
            div.appendChild(btn);
            catList.appendChild(div);
        });
    }

    const deptList = document.getElementById('settings-depts-list');
    if (deptList) {
        deptList.innerHTML = '';
        state.departments.forEach(dept => {
            const div = document.createElement('div');
            div.className = 'settings-manager-item';
            const span = document.createElement('span');
            span.textContent = dept;
            const btn = document.createElement('button');
            btn.className = 'btn-delete-item';
            btn.title = 'Delete Department';
            btn.innerHTML = '&times;';
            btn.addEventListener('click', () => deleteDepartment(dept));
            div.appendChild(span);
            div.appendChild(btn);
            deptList.appendChild(div);
        });
    }
}

window.deleteCategory = function(catName) {
    if (state.assets.some(a => a.category === catName)) {
        alert(`Cannot delete category "${catName}" because it is currently assigned to assets in inventory.`);
        return;
    }
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
        state.categories = state.categories.filter(c => c !== catName);
        saveState();
        populateCategoriesAndDepartments();
        renderSettingsManagers();
        logTransaction('Status Change', 'CONFIG', 'Category Removed', `Category "${catName}" removed from configurations.`);
    }
};

window.deleteDepartment = function(deptName) {
    if (state.assets.some(a => a.department === deptName)) {
        alert(`Cannot delete department "${deptName}" because it is currently linked to active asset assignments.`);
        return;
    }
    if (confirm(`Are you sure you want to delete department "${deptName}"?`)) {
        state.departments = state.departments.filter(d => d !== deptName);
        saveState();
        populateCategoriesAndDepartments();
        renderSettingsManagers();
        logTransaction('Status Change', 'CONFIG', 'Department Removed', `Department "${deptName}" removed from directory.`);
    }
};

function handleCategoryAdd(e) {
    e.preventDefault();
    const input = document.getElementById('new-category-input');
    const newCat = input.value.trim();
    if (!newCat) return;
    if (state.categories.some(c => c.toLowerCase() === newCat.toLowerCase())) {
        alert('This category already exists.');
        return;
    }
    state.categories.push(newCat);
    saveState();
    input.value = '';
    populateCategoriesAndDepartments();
    renderSettingsManagers();
    logTransaction('Status Change', 'CONFIG', 'Category Added', `Category "${newCat}" added to inventory catalog.`);
}

function handleDeptAdd(e) {
    e.preventDefault();
    const input = document.getElementById('new-dept-input');
    const newDept = input.value.trim();
    if (!newDept) return;
    if (state.departments.some(d => d.toLowerCase() === newDept.toLowerCase())) {
        alert('This department already exists.');
        return;
    }
    state.departments.push(newDept);
    saveState();
    input.value = '';
    populateCategoriesAndDepartments();
    renderSettingsManagers();
    logTransaction('Status Change', 'CONFIG', 'Department Added', `Department "${newDept}" added to corporate directory.`);
}

// ================= TIMELINE HISTORICAL LOGGER =================
function renderAssignmentTimeline(asset) {
    const container = document.getElementById('drawer-timeline');
    if (!container) return;
    container.innerHTML = '';

    const history = state.transactions
        .filter(t => t.assetTag === asset.tag && (t.type === 'Assignment' || t.type === 'Return'))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (history.length === 0) {
        container.innerHTML = `<p style="font-size:12.5px; color:var(--text-muted); font-style:italic; padding: 10px 0;">No assignment changes logged for this asset.</p>`;
        return;
    }

    const timeline = document.createElement('div');
    timeline.className = 'timeline-container';

    history.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'timeline-item';
        const markerClass = item.type === 'Assignment' ? 'marker-assignment' : 'marker-return';
        const dateStr = new Date(item.timestamp).toLocaleString();

        itemDiv.innerHTML = `
            <div class="timeline-marker ${markerClass}"></div>
            <div class="timeline-content">
                <span class="timeline-date">${escapeHtml(dateStr)}</span>
                <span class="timeline-text">${escapeHtml(item.details)}</span>
                <span class="timeline-operator">Operator: ${escapeHtml(item.operator)}</span>
            </div>
        `;
        timeline.appendChild(itemDiv);
    });
    container.appendChild(timeline);
}

// ================= DYNAMIC MAINTENANCE STATUS TOGGLER =================
window.changeMaintStatus = function(logId, newStatus, event) {
    if (event) event.stopPropagation();
    const log = state.maintenance.find(m => m.id === logId);
    if (!log) return;

    if (log.status === 'Completed') {
        if (log.completedEdits >= 1) {
            alert('This completed record has already been edited once and cannot be modified again.');
            return;
        }
        log.completedEdits = (log.completedEdits || 0) + 1;
    }

    log.status = newStatus;
    const asset = state.assets.find(a => a.id === log.assetId);
    if (asset) {
        logTransaction('Maintenance', asset.tag, asset.name, `Hardware upgrade/repair status updated: "${log.partReplaced}" changed to [${newStatus}].`);
        if (newStatus === 'Completed') {
            const activeLogs = state.maintenance.filter(m => m.assetId === asset.id && m.status !== 'Completed');
            if (activeLogs.length === 0) {
                asset.status = asset.assignedUser ? 'Assigned' : 'Available';
                logTransaction('Status Change', asset.tag, asset.name, `Asset released from maintenance pipeline. Status updated to [${asset.status}].`);
            }
        } else {
            asset.status = 'Maintenance';
        }
    }

    saveState();
    renderAll();
    if (asset) openDrawer(asset.id);
};

// ================= ROBUST INVOICE FILE OPENER =================
window.openInvoice = function(invoiceBase64, assetTag) {
    if (!invoiceBase64) return;
    try {
        const parts = invoiceBase64.split(',');
        if (parts.length < 2) return;
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';

        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
        const fileURL = URL.createObjectURL(blob);

        let extension = 'pdf';
        if (mimeType.includes('png')) extension = 'png';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('svg')) extension = 'svg';

        const newWindow = window.open(fileURL, '_blank');
        if (!newWindow) {
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = `IMS_Invoice_${assetTag}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (err) {
        console.error('Error opening invoice:', err);
        alert('Failed to parse invoice file. Please try re-uploading.');
    }
};

// ================= NEON POSTGRESQL CLOUD SYNC ENGINE =================
function showSyncStatus(status, text) {
    const badge = DOM.syncStatusBadge;
    if (!badge) return;
    badge.textContent = text;
    badge.className = 'sync-badge';
    badge.style.cursor = status === 'error' ? 'pointer' : 'default';

    if (status === 'active' || status === 'success') badge.classList.add('sync-active');
    else if (status === 'syncing' || status === 'pending') badge.classList.add('sync-pending');
    else if (status === 'error' || status === 'warning') badge.classList.add('sync-error');
    else badge.classList.add('sync-disabled');

    badge.style.display = 'inline-flex';
}

let neonSyncDebounce = null;
function triggerNeonCloudSync(immediate = false, notifyUser = false) {
    if (!window.IMS_NEON_ACTIVE || !state.isAdmin || !state.authToken || !neonCloudInitialSyncDone) return;

    const doSync = () => {
        showSyncStatus('syncing', 'Saving to Cloud...');
        fetch('/api/db/sync-all', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                assets: state.assets,
                vendors: state.vendors,
                employees: state.employees,
                maintenance: state.maintenance,
                transactions: state.transactions,
                categories: state.categories,
                departments: state.departments
            })
        })
            .then(async res => {
                if (res.status === 401) {
                    showSyncStatus('error', 'Session Expired');
                    return;
                }
                const data = await res.json();
                if (res.ok && data && data.success) {
                    showSyncStatus('success', '☁️ NEON CLOUD SYNCED');
                    if (notifyUser) alert('Database successfully saved to Neon PostgreSQL cloud!');
                } else {
                    throw new Error(data.error || 'Sync failed');
                }
            })
            .catch(err => {
                console.warn('[Neon Sync] Cloud sync failed:', err);
                showSyncStatus('error', '⚠️ Sync Failed (Retry)');
                if (notifyUser) alert('Cloud sync failed. Check your connection and click the red Sync badge to retry.');
            });
    };

    clearTimeout(neonSyncDebounce);
    if (immediate) doSync();
    else neonSyncDebounce = setTimeout(doSync, 450);
}

async function pullFromNeonCloud(notifyUser = false) {
    if (!window.IMS_NEON_ACTIVE || !state.authToken) {
        if (notifyUser) alert('Not connected to Neon Cloud database.');
        return false;
    }
    showSyncStatus('syncing', 'Syncing from Cloud...');
    try {
        const res = await fetch('/api/db/state', { headers: getAuthHeaders() });
        if (res.status === 401) {
            clearSessionStorage();
            showLoginScreen();
            return false;
        }
        const stateData = await res.json();
        if (res.ok && stateData && stateData.success && stateData.data && Array.isArray(stateData.data.assets)) {
            state.assets = stateData.data.assets;
            if (Array.isArray(stateData.data.vendors)) state.vendors = stateData.data.vendors;
            if (Array.isArray(stateData.data.employees)) state.employees = stateData.data.employees;
            if (Array.isArray(stateData.data.maintenance)) state.maintenance = stateData.data.maintenance;
            if (Array.isArray(stateData.data.transactions)) state.transactions = stateData.data.transactions;
            if (Array.isArray(stateData.data.categories)) state.categories = stateData.data.categories;
            if (Array.isArray(stateData.data.departments)) state.departments = stateData.data.departments;

            saveStateLocally();
            renderAll();
            showSyncStatus('success', '☁️ NEON CLOUD SYNCED');
            if (notifyUser) alert(`Synced ${state.assets.length} assets & ${state.vendors.length} vendors from Neon Cloud!`);
            return true;
        }
    } catch (e) {
        console.warn('[Neon Pull] Failed:', e);
        showSyncStatus('warning', 'OFFLINE CACHE');
        if (notifyUser) alert('Could not reach cloud server. Showing local cached data.');
    }
    return false;
}
