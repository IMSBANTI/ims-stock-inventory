// IMS IT Asset & Inventory Manager - Core Application Engine with Enterprise Upgrades

// Global state holding database records and authentication role
let state = {
    assets: [],
    vendors: [],
    employees: [],
    maintenance: [],
    transactions: [],
    theme: 'dark',
    role: 'guest', // 'guest', 'admin', 'staff'
    isAdmin: false,
    syncEnabled: false,
    syncBucketId: "",
    adminPassword: "ims",
    staffPassword: "ims"
};

// Global Chart instance references
let categoryChart = null;
let departmentChart = null;

// Table Sort configuration
let sortConfig = {
    column: 'tag',
    direction: 'asc'
};

// Pagination configuration
let paginationConfig = {
    currentPage: 1,
    pageSize: 20
};

// Dashboard Maintenance logs pagination
let dashboardMaintPagination = {
    currentPage: 1,
    pageSize: 5
};

// Dashboard active maintenance tab ('logs' or 'cost')
let activeMaintTab = 'logs';

// Temporary Base64 stores for file attachments inside forms
let tempAttachedPhoto = "";
let tempAttachedInvoice = "";

// ================= DOM ELEMENT REFERENCES =================
const DOM = {
    // Auth elements
    loginOverlay: document.getElementById('login-overlay'),
    loginForm: document.getElementById('login-form'),
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
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

    // Cloud Sync Elements
    syncStatusBadge: document.getElementById('sync-status-badge'),
    syncTokenInput: document.getElementById('sync-token-input'),
    btnCopySyncToken: document.getElementById('btn-copy-sync-token'),
    btnGenerateSyncToken: document.getElementById('btn-generate-sync-token'),
    btnConnectSync: document.getElementById('btn-connect-sync'),
    btnDisconnectSync: document.getElementById('btn-disconnect-sync'),
    loginSyncToggle: document.getElementById('login-sync-toggle'),
    loginSyncContainer: document.getElementById('login-sync-container'),
    loginSyncToken: document.getElementById('login-sync-token'),
    btnLoginConnectSync: document.getElementById('btn-login-connect-sync'),

    // Dashboard KPIs
    kpiWorkstations: document.getElementById('kpi-workstations'),
    kpiDeploymentRate: document.getElementById('kpi-deployment-rate'),
    kpiMaintenance: document.getElementById('kpi-maintenance'),
    kpiVendors: document.getElementById('kpi-vendors'),
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
    filterStatus: document.getElementById('filter-status'),
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
    drawerMaintenanceList: document.getElementById('drawer-maintenance-list'),
    drawerEditBtn: document.getElementById('drawer-edit-btn'),
    drawerDeleteBtn: document.getElementById('drawer-delete-btn'),
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
    clearLogsBtn: document.getElementById('clear-logs-btn'),

    // Asset Modal Elements
    assetModal: document.getElementById('asset-modal'),
    assetForm: document.getElementById('asset-form'),
    assetFormId: document.getElementById('asset-form-id'),
    assetModalTitle: document.getElementById('asset-modal-title'),
    assetNameInput: document.getElementById('asset-name'),
    assetTagInput: document.getElementById('asset-tag'),
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
    photoUploadZone: document.getElementById('photo-upload-zone'),
    invoiceUploadZone: document.getElementById('invoice-upload-zone'),

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
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadState();
    setupEventListeners();
    checkActiveSession();
    checkCustomLogo();
    checkNeonCloudOnStartup();
    checkCloudSyncOnStartup();
});

// ================= AUTHENTICATION HANDLERS =================
function checkActiveSession() {
    const savedRole = localStorage.getItem('ims_role');
    if (savedRole && (savedRole === 'admin' || savedRole === 'staff')) {
        loginUser(savedRole);
    } else {
        // Show login screen
        DOM.loginOverlay.style.display = 'flex';
        DOM.appWrapper.style.display = 'none';
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const username = DOM.loginUsername.value.trim().toLowerCase();
    const password = DOM.loginPassword.value.trim();

    // Check credentials against dynamic state keys
    const adminPass = state.adminPassword || 'ims';
    const staffPass = state.staffPassword || 'ims';

    if (username === 'admin' && password === adminPass) {
        loginUser('admin');
    } else if (username === 'staff' && password === staffPass) {
        loginUser('staff');
    } else {
        alert(`Invalid credentials. Try: \nAdmin: admin / ${adminPass === 'ims' ? 'ims' : 'custom_password'} \nStaff: staff / ${staffPass === 'ims' ? 'ims' : 'custom_password'}`);
    }
}

function loginUser(role) {
    state.role = role;
    state.isAdmin = (role === 'admin');
    localStorage.setItem('ims_role', role);

    // Hide Login Overlay, Show App
    DOM.loginOverlay.style.display = 'none';
    DOM.appWrapper.style.display = 'flex';

    // Update Header active role badge styling
    const badge = DOM.roleDisplayBadge;
    badge.textContent = `${role} view`;
    if (role === 'admin') {
        badge.className = 'role-badge';
    } else {
        badge.className = 'role-badge role-staff';
    }

    applyPrivilegeRestrictions();

    // Auto-seed if database is empty on first startup OR if it still has old placeholder mock data
    const hasOldMockData = state.assets.some(a => a.tag === 'IMS-LAP-001' && a.name === 'Dell XPS 15');
    if ((state.assets.length === 0 && state.vendors.length === 0) || hasOldMockData) {
        seedDemoData(false);
    } else {
        renderAll();
    }
}

function logoutUser() {
    state.role = 'guest';
    state.isAdmin = false;
    localStorage.removeItem('ims_role');
    
    // Clear login forms
    DOM.loginUsername.value = '';
    DOM.loginPassword.value = '';

    DOM.loginOverlay.style.display = 'flex';
    DOM.appWrapper.style.display = 'none';
}

// RESTRICT read-only views for Staff
function applyPrivilegeRestrictions() {
    const adminElements = document.querySelectorAll('.admin-only');
    
    adminElements.forEach(el => {
        if (state.isAdmin) {
            el.classList.remove('staff-restricted');
        } else {
            el.classList.add('staff-restricted');
        }
    });

    // Handle Logs Nav Tab visibility
    const logsTabBtn = document.querySelector('.tab-btn[data-tab="logs-tab"]');
    if (logsTabBtn) {
        if (state.isAdmin) {
            logsTabBtn.style.display = 'flex';
        } else {
            logsTabBtn.style.display = 'none';
            // If logged in as staff and currently on logs tab, switch to dashboard
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab && activeTab.getAttribute('data-tab') === 'logs-tab') {
                switchTab('dashboard-tab');
            }
        }
    }

    // Handle Sync Status Badge visibility based on role and status
    const syncBadge = DOM.syncStatusBadge;
    if (syncBadge) {
        if (state.isAdmin && !state.syncEnabled) {
            syncBadge.style.display = 'none';
        } else {
            syncBadge.style.display = 'inline-flex';
            if (!state.syncEnabled) {
                syncBadge.textContent = "LOCAL VIEW";
                syncBadge.className = 'sync-badge sync-disabled';
            }
        }
    }
}

// Setup event listeners for tab switching, search, modals, forms, and uploads
function setupEventListeners() {
    // Auth Form
    DOM.loginForm.addEventListener('submit', handleLoginSubmit);
    DOM.logoutBtn.addEventListener('click', logoutUser);

    const resetPassBtn = document.getElementById('login-reset-password-btn');
    if (resetPassBtn) {
        resetPassBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('ims_admin_password', 'ims');
            localStorage.setItem('ims_staff_password', 'ims');
            state.adminPassword = 'ims';
            state.staffPassword = 'ims';
            if (DOM.loginPassword) DOM.loginPassword.value = 'ims';
            if (DOM.loginUsername) DOM.loginUsername.value = 'admin';
            alert("Success! Password has been reset to: 'ims'. You can now sign in!");
        });
    }

    // Navigation Tabs
    DOM.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Theme Toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Seed & Reset in Settings Panel
    if (DOM.settingsSeedBtn) DOM.settingsSeedBtn.addEventListener('click', () => seedDemoData(true));
    if (DOM.settingsResetBtn) DOM.settingsResetBtn.addEventListener('click', confirmResetDatabase);
    if (DOM.changePasswordForm) DOM.changePasswordForm.addEventListener('submit', handlePasswordChange);

    // Login Screen Cloud Sync
    if (DOM.loginSyncToggle) {
        DOM.loginSyncToggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (DOM.loginSyncContainer.style.display === 'none') {
                DOM.loginSyncContainer.style.display = 'block';
            } else {
                DOM.loginSyncContainer.style.display = 'none';
            }
        });
    }
    if (DOM.btnLoginConnectSync) {
        DOM.btnLoginConnectSync.addEventListener('click', handleLoginSyncConnect);
    }

    // Modal Tabs Navigation Triggers
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-modal-tab');
            switchModalTab(targetTab);
        });
    });

    // Search and Filter Listeners
    DOM.inventorySearch.addEventListener('input', () => {
        paginationConfig.currentPage = 1;
        renderInventoryTable();
    });
    DOM.filterCategory.addEventListener('change', () => {
        paginationConfig.currentPage = 1;
        renderInventoryTable();
    });
    DOM.filterStatus.addEventListener('change', () => {
        paginationConfig.currentPage = 1;
        renderInventoryTable();
    });

    // Pagination Listeners
    if (DOM.paginationLimit) {
        DOM.paginationLimit.addEventListener('change', (e) => {
            paginationConfig.pageSize = parseInt(e.target.value);
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

    DOM.vendorsSearch.addEventListener('input', renderVendors);
    DOM.logsSearch.addEventListener('input', renderLogs);
    DOM.filterLogType.addEventListener('change', renderLogs);

    // Add Trigger Buttons
    DOM.addAssetBtn.addEventListener('click', () => openAssetModal());
    DOM.addVendorBtn.addEventListener('click', () => openVendorModal());
    DOM.clearLogsBtn.addEventListener('click', clearLogs);

    // Sort Listeners on Headers
    DOM.thTag.addEventListener('click', () => handleSort('tag'));
    DOM.thName.addEventListener('click', () => handleSort('name'));
    DOM.thCategory.addEventListener('click', () => handleSort('category'));
    DOM.thStatus.addEventListener('click', () => handleSort('status'));

    // Drawer Closer
    DOM.drawerCloseBtn.addEventListener('click', closeDrawer);
    DOM.assetDrawerBackdrop.addEventListener('click', closeDrawer);

    // Drawer Maintenance Logger Button
    DOM.btnDrawerAddMaintenance.addEventListener('click', () => {
        const assetId = DOM.maintenanceFormAssetId.value;
        closeDrawer();
        openMaintenanceModal(assetId);
    });

    // File Upload Inputs Triggers
    DOM.assetPhotoInput.addEventListener('change', (e) => handleFileUpload(e, 'photo'));
    DOM.assetInvoiceInput.addEventListener('change', (e) => handleFileUpload(e, 'invoice'));

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

    // Interactive Logo Customizer Triggers
    document.querySelectorAll('.clickable-logo').forEach(el => {
        el.addEventListener('click', () => {
            if (state.role === 'admin') {
                document.getElementById('logo-file-input').click();
            } else {
                alert("Only Administrators can upload or customize the corporate logo.");
            }
        });
    });
    document.getElementById('logo-file-input').addEventListener('change', handleLogoUpload);

    // Cloud Sync Buttons Listeners
    if (DOM.btnCopySyncToken) DOM.btnCopySyncToken.addEventListener('click', copySyncTokenToClipboard);
    if (DOM.btnGenerateSyncToken) DOM.btnGenerateSyncToken.addEventListener('click', generateSyncToken);
    if (DOM.btnConnectSync) DOM.btnConnectSync.addEventListener('click', connectCloudSync);
    if (DOM.btnDisconnectSync) DOM.btnDisconnectSync.addEventListener('click', disconnectCloudSync);

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
    if (DOM.btnMaintTabLogs) {
        DOM.btnMaintTabLogs.addEventListener('click', () => {
            switchMaintTab('logs');
        });
    }
    if (DOM.btnMaintTabCost) {
        DOM.btnMaintTabCost.addEventListener('click', () => {
            switchMaintTab('cost');
        });
    }
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

    // Constrain file size (Base64 sizes shouldn't bloat local storage beyond 5MB total)
    if (file.size > 800000) {
        alert("Attached file size exceeds 800KB. To preserve local storage space, upload smaller images or documents.");
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        if (type === 'photo') {
            tempAttachedPhoto = base64;
            DOM.photoFileStatus.textContent = "Attached ✓";
            DOM.photoFileStatus.style.color = "var(--color-success)";
        } else {
            tempAttachedInvoice = base64;
            DOM.invoiceFileStatus.textContent = "Attached ✓";
            DOM.invoiceFileStatus.style.color = "var(--color-success)";
        }
    };
    reader.readAsDataURL(file);
}

// Lightbox controller
window.openPhotoLightbox = function() {
    const src = DOM.drawerPhotoImg.src;
    if (!src) return;
    DOM.lightboxImg.src = src;
    openModal('lightbox-overlay');
};

// ================= STATE & STORAGE HANDLERS =================
function saveState() {
    saveStateLocally();
    // Neon PostgreSQL Cloud Sync
    triggerNeonCloudSync();
    // KVDB Cloud Sync Legacy Fallback
    triggerCloudSyncPush();
}

function saveStateLocally() {
    localStorage.setItem('ims_assets', JSON.stringify(state.assets));
    localStorage.setItem('ims_vendors', JSON.stringify(state.vendors));
    localStorage.setItem('ims_employees', JSON.stringify(state.employees));
    localStorage.setItem('ims_maintenance', JSON.stringify(state.maintenance));
    localStorage.setItem('ims_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('ims_categories', JSON.stringify(state.categories));
    localStorage.setItem('ims_departments', JSON.stringify(state.departments));
    localStorage.setItem('ims_admin_password', state.adminPassword || 'ims');
    localStorage.setItem('ims_staff_password', state.staffPassword || 'ims');
}

function loadState() {
    state.assets = JSON.parse(localStorage.getItem('ims_assets')) || [];
    state.vendors = JSON.parse(localStorage.getItem('ims_vendors')) || [];
    state.employees = JSON.parse(localStorage.getItem('ims_employees')) || [];
    state.maintenance = JSON.parse(localStorage.getItem('ims_maintenance')) || [];
    state.transactions = JSON.parse(localStorage.getItem('ims_transactions')) || [];
    state.categories = JSON.parse(localStorage.getItem('ims_categories')) || ['Computer', 'Laptop', 'Accessory', 'Spare Parts'];
    state.departments = JSON.parse(localStorage.getItem('ims_departments')) || ['Software Engineering', 'Human Resources', 'Finance & Accounts', 'Marketing & Sales', 'Operations', 'QA Engineering', 'Administration'];
    
    // Passwords
    state.adminPassword = localStorage.getItem('ims_admin_password');
    if (!state.adminPassword) {
        state.adminPassword = 'ims';
        localStorage.setItem('ims_admin_password', 'ims');
    }
    state.staffPassword = localStorage.getItem('ims_staff_password');
    if (!state.staffPassword) {
        state.staffPassword = 'ims';
        localStorage.setItem('ims_staff_password', 'ims');
    }
    
    // Sync credentials
    state.syncEnabled = localStorage.getItem('ims_sync_enabled') === 'true';
    state.syncBucketId = localStorage.getItem('ims_sync_bucket_id') || "";
}

function seedDemoData(notifyUser = true) {
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
            alert(`IMS Production Database loaded successfully! ${state.assets.length} assets, ${state.maintenance.length} maintenance records, and ${state.vendors.length} vendors loaded.`);
        }
    } else {
        alert("Error: Production database engine (demo-data.js) failed to load.");
    }
}

function confirmResetDatabase() {
    if (confirm("WARNING: Are you sure you want to wipe the IMS Asset database? This deletes all computers, laptops, parts, vendors, and assignments!")) {
        state.assets = [];
        state.vendors = [];
        state.employees = [];
        state.maintenance = [];
        state.transactions = [];
        saveState();
        renderAll();
        alert("Database wiped. Starting with an empty asset management console.");
    }
}

// ================= GENERAL UI CONTROLLER =================
function switchTab(tabId) {
    DOM.tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    DOM.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
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
    renderSettingsSyncUI();
}

function populateVendorDropdowns() {
    let assetOptions = '<option value="">None / Unknown Vendor</option>';
    let maintOptions = '<option value="" disabled selected>Choose a Supplier...</option>';
    state.vendors.forEach(v => {
        const option = `<option value="${v.id}">${v.name} (${v.mobile})</option>`;
        assetOptions += option;
        maintOptions += option;
    });
    DOM.assetVendorSelect.innerHTML = assetOptions;
    DOM.maintVendorSelect.innerHTML = maintOptions;
}

function populateEmployeeDatalist() {
    let listItems = '';
    state.employees.forEach(emp => {
        listItems += `<option value="${emp.name}">${emp.department}</option>`;
    });
    DOM.employeesListDatalist.innerHTML = listItems;
}

function logTransaction(type, assetTag, assetName, details) {
    const transaction = {
        id: 't-' + Date.now() + Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
        type: type,
        assetTag: assetTag,
        assetName: assetName,
        details: details,
        operator: `IT Admin (${state.role.toUpperCase()})`
    };
    state.transactions.unshift(transaction);
    saveState();
    renderLogs();
    renderDashboardKPIs();
}

// ================= DASHBOARD CONTROLLERS =================
function renderDashboardKPIs() {
    const workstations = state.assets.filter(a => a.category === 'Computer' || a.category === 'Laptop').length;
    DOM.kpiWorkstations.textContent = workstations;

    const totalAssets = state.assets.length;
    const assignedAssets = state.assets.filter(a => a.status === 'Assigned').length;
    const rate = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;
    DOM.kpiDeploymentRate.textContent = `${rate}%`;

    const maintenanceCount = state.assets.filter(a => a.status === 'Maintenance').length;
    DOM.kpiMaintenance.textContent = maintenanceCount;

    const vendorCount = state.vendors.length;
    DOM.kpiVendors.textContent = vendorCount;
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

    // Sort maintenance logs by date descending (newest first)
    const sortedLogs = [...state.maintenance].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination calculations
    const totalItems = sortedLogs.length;
    const totalPages = Math.ceil(totalItems / dashboardMaintPagination.pageSize);

    // Clamp current page to valid bounds
    if (dashboardMaintPagination.currentPage > totalPages && totalPages > 0) {
        dashboardMaintPagination.currentPage = totalPages;
    }
    if (dashboardMaintPagination.currentPage < 1) {
        dashboardMaintPagination.currentPage = 1;
    }

    const startIdx = (dashboardMaintPagination.currentPage - 1) * dashboardMaintPagination.pageSize;
    const endIdx = Math.min(startIdx + dashboardMaintPagination.pageSize, totalItems);

    // Slice logs for current page
    const pageLogs = sortedLogs.slice(startIdx, endIdx);

    pageLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.style.cursor = 'pointer';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'stretch';
        div.style.gap = '8px';
        div.addEventListener('click', () => openDrawer(log.assetId));

        let statusBadgeClass = 'maint-in-progress';
        if (log.status === 'Awaiting Parts') statusBadgeClass = 'maint-awaiting-parts';
        else if (log.status === 'Unpaid') statusBadgeClass = 'maint-unpaid';
        else if (log.status === 'Completed') statusBadgeClass = 'maint-completed';

        const costDisplay = log.cost ? ` (৳${parseFloat(log.cost).toFixed(2)})` : '';

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <div>
                    <strong style="color:var(--text-primary); font-size:13.5px;">${log.assetName}</strong>
                    <span class="asset-tag-pill" style="font-size: 10px; padding: 1px 4px; margin-left: 6px;">${log.assetTag}</span>
                </div>
                <span class="status-badge ${statusBadgeClass}" style="padding:2px 6px; font-size:9.5px; font-weight:700;">${log.status || 'Completed'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; border-top:1px dashed rgba(255,255,255,0.05); padding-top:6px; margin-top:2px;">
                <p style="font-size: 11.5px; color: var(--text-secondary); margin:0;">
                    <strong>${log.partReplaced}</strong>${costDisplay} — ${log.description}
                </p>
                <div style="font-size: 11px; color: var(--text-muted); font-weight:600; font-family:monospace;">
                    ${log.date}
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // Update pagination controls UI
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
        DOM.btnMaintTabLogs.style.background = 'var(--color-primary)';
        DOM.btnMaintTabLogs.style.color = 'white';
        DOM.btnMaintTabCost.style.background = 'transparent';
        DOM.btnMaintTabCost.style.color = 'var(--text-secondary)';
        
        DOM.dashboardMaintContainer.style.display = 'block';
        DOM.dashboardMaintCostContainer.style.display = 'none';
        
        renderDashboardMaintenanceLogs();
    } else {
        DOM.btnMaintTabCost.style.background = 'var(--color-primary)';
        DOM.btnMaintTabCost.style.color = 'white';
        DOM.btnMaintTabLogs.style.background = 'transparent';
        DOM.btnMaintTabLogs.style.color = 'var(--text-secondary)';
        
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
            monthlyCosts[key] = { cost: 0, sortKey: sortKey };
        }
        monthlyCosts[key].cost += costVal;
        grandTotal += costVal;
    });

    const sortedCosting = Object.entries(monthlyCosts)
        .map(([label, data]) => ({ label, cost: data.cost, sortKey: data.sortKey }))
        .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    // Render Grand Total Header
    const totalDiv = document.createElement('div');
    totalDiv.style.background = 'rgba(var(--color-primary-rgb), 0.05)';
    totalDiv.style.border = '1px solid rgba(var(--color-primary-rgb), 0.15)';
    totalDiv.style.padding = '12px';
    totalDiv.style.borderRadius = 'var(--radius-sm)';
    totalDiv.style.marginBottom = '16px';
    totalDiv.style.textAlign = 'center';
    totalDiv.innerHTML = `
        <span style="font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:1px; font-weight:600;">Total Hardware Costing</span>
        <h3 style="font-size:22px; color:var(--text-primary); margin-top:4px; font-family:var(--font-header); font-weight:700;">৳${grandTotal.toFixed(2)}</h3>
    `;
    container.appendChild(totalDiv);

    // Render Monthly Breakdown
    sortedCosting.forEach(item => {
        const div = document.createElement('div');
        div.className = 'alert-item';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '12px';
        div.style.marginBottom = '8px';
        div.innerHTML = `
            <span style="font-weight:600; color:var(--text-primary); font-size:13.5px;">${item.label}</span>
            <span style="font-weight:700; color:var(--color-primary); font-family:monospace; font-size:14.5px;">৳${item.cost.toFixed(2)}</span>
        `;
        container.appendChild(div);
    });
}

function renderDashboardCharts() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textPrimaryColor = isDark ? '#f1f5f9' : '#0f172a';

    // 1. Dynamic Category Chart & Detailed Breakdown
    const counts = {};
    const statusBreakdown = {};
    state.categories.forEach(cat => {
        counts[cat] = 0;
        statusBreakdown[cat] = { 'Assigned': 0, 'In Stock': 0, 'Maintenance': 0, 'Disposed': 0 };
    });
    state.assets.forEach(a => {
        if (counts[a.category] !== undefined) {
            counts[a.category]++;
            if (statusBreakdown[a.category][a.status] !== undefined) {
                statusBreakdown[a.category][a.status]++;
            } else {
                statusBreakdown[a.category][a.status] = 1;
            }
        } else {
            counts[a.category] = 1;
            statusBreakdown[a.category] = { 'Assigned': 0, 'In Stock': 0, 'Maintenance': 0, 'Disposed': 0 };
            statusBreakdown[a.category][a.status] = 1;
        }
    });

    const categoryLabels = Object.keys(counts);
    const categoryData = Object.values(counts);

    // Predefined colors
    const coreColors = ['#ec2028', '#3b82f6', '#6e6f71', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4'];
    const categoryColors = categoryLabels.map((_, i) => coreColors[i % coreColors.length]);

    // Render category details list
    const detailsContainer = document.getElementById('category-details-list');
    if (detailsContainer) {
        let detailsHtml = '';
        categoryLabels.forEach((cat, index) => {
            const total = counts[cat];
            if (total === 0) return; // skip empty categories
            
            const breakdown = statusBreakdown[cat];
            const color = categoryColors[index % categoryColors.length];
            
            const parts = [];
            if (breakdown['Assigned'] > 0) parts.push(`<span style="color: var(--text-primary); font-weight:600;">${breakdown['Assigned']}</span> Assigned`);
            if (breakdown['In Stock'] > 0) parts.push(`<span style="color: var(--color-success); font-weight:600;">${breakdown['In Stock']}</span> In Stock`);
            if (breakdown['Maintenance'] > 0) parts.push(`<span style="color: var(--color-warning); font-weight:600;">${breakdown['Maintenance']}</span> Repair`);
            if (breakdown['Disposed'] > 0) parts.push(`<span style="color: var(--text-muted); font-weight:600;">${breakdown['Disposed']}</span> Disposed`);
            
            const statusString = parts.length > 0 ? parts.join(' • ') : 'No items';
            
            detailsHtml += `
                <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px; display:flex; flex-direction:column; gap:2px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:600; font-size:12.5px; display:flex; align-items:center; gap:6px; color:var(--text-primary);">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color};"></span>
                            ${cat}
                        </span>
                        <span style="font-weight:600; font-size:12px; color:var(--text-secondary);">${total} units</span>
                    </div>
                    <div style="font-size:11px; color:var(--text-secondary); padding-left: 14px; line-height: 1.3;">
                        ${statusString}
                    </div>
                </div>
            `;
        });
        
        detailsContainer.innerHTML = detailsHtml || '<div style="font-size:12px; color:var(--text-muted); text-align:center; padding-top:20px;">No categories recorded</div>';
    }

    if (categoryChart) categoryChart.destroy();

    const canvas = document.getElementById('category-chart');
    if (canvas) {
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
                    hoverOffset: 12
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
                    
                    const totalCount = state.assets.length.toString();
                    
                    ctx.font = 'bold 20px Inter';
                    ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(totalCount, centerX, centerY - 6);
                    
                    ctx.font = '600 9px Inter';
                    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
                    ctx.fillText('TOTAL ASSETS', centerX, centerY + 12);
                    ctx.restore();
                }
            }],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#0c1221' : '#ffffff',
                        titleColor: textPrimaryColor,
                        bodyColor: textPrimaryColor,
                        borderColor: 'rgba(236, 32, 40, 0.2)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const val = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((val / total) * 100) : 0;
                                return ` ${label}: ${val} units (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '75%'
            }
        });
    }

    // 2. Department Chart (Horizontal Bar Chart)
    const deptCounts = {};
    state.departments.forEach(dept => {
        deptCounts[dept] = 0;
    });

    let unassignedCount = 0;
    state.assets.forEach(a => {
        if (a.status === 'Assigned' && a.department) {
            if (deptCounts[a.department] !== undefined) {
                deptCounts[a.department]++;
            } else {
                deptCounts[a.department] = 1;
            }
        } else {
            unassignedCount++;
        }
    });

    if (unassignedCount > 0) {
        deptCounts['Unassigned'] = unassignedCount;
    }

    const deptLabels = Object.keys(deptCounts);
    const deptData = Object.values(deptCounts);
    const deptColors = deptLabels.map((label, i) => {
        if (label === 'Unassigned') return isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
        return coreColors[(i + 1) % coreColors.length]; // shift by 1 to stagger colors
    });

    if (departmentChart) departmentChart.destroy();

    const deptCanvas = document.getElementById('department-chart');
    if (deptCanvas) {
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
                    borderWidth: isDark ? 2 : 1,
                    borderColor: isDark ? '#101625' : '#ffffff',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // horizontal bar chart
                plugins: {
                    legend: {
                        display: false
                    },
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
                        grid: {
                            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: textPrimaryColor,
                            font: { family: 'Inter', size: 11 },
                            stepSize: 1,
                            precision: 0
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textPrimaryColor,
                            font: { family: 'Inter', size: 11, weight: 500 }
                        }
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
        { el: DOM.thTag, name: 'Asset Tag' },
        { el: DOM.thName, name: 'Asset Name' },
        { el: DOM.thCategory, name: 'Category' },
        { el: DOM.thStatus, name: 'Status' }
    ];

    headers.forEach(h => {
        if (!h.el) return;
        let suffix = '\u00A0⇅';
        if (h.el.id.includes(column)) {
            suffix = sortConfig.direction === 'asc' ? '\u00A0▲' : '\u00A0▼';
        }
        h.el.textContent = h.name + suffix;
    });

    renderInventoryTable();
}

function sortAssets(assetsList) {
    const col = sortConfig.column;
    const dir = sortConfig.direction;

    return [...assetsList].sort((a, b) => {
        let valA = a[col] || '';
        let valB = b[col] || '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });
}

function renderPaginationControls(totalPages) {
    const container = DOM.paginationPagesContainer;
    if (!container) return;
    container.innerHTML = '';

    const currentPage = paginationConfig.currentPage;
    const maxVisible = 5; // Max page buttons to display
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        createPageButton(1);
        if (startPage > 2) {
            createEllipsis();
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        createPageButton(i);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            createEllipsis();
        }
        createPageButton(totalPages);
    }

    function createPageButton(pageNum) {
        const btn = document.createElement('button');
        btn.className = 'btn-page-num';
        if (pageNum === currentPage) {
            btn.classList.add('active');
        }
        btn.textContent = pageNum;
        btn.addEventListener('click', () => {
            paginationConfig.currentPage = pageNum;
            renderInventoryTable();
        });
        container.appendChild(btn);
    }

    function createEllipsis() {
        const span = document.createElement('span');
        span.style.color = 'var(--text-muted)';
        span.style.fontSize = '13px';
        span.style.padding = '0 4px';
        span.style.display = 'inline-flex';
        span.style.alignItems = 'center';
        span.textContent = '...';
        container.appendChild(span);
    }
}

// ================= INVENTORY TABLE CONTROLLER =================
function renderInventoryTable() {
    const tableBody = DOM.inventoryTableBody;
    const query = DOM.inventorySearch.value.trim().toLowerCase();
    const catFilter = DOM.filterCategory.value;
    const statFilter = DOM.filterStatus.value;

    tableBody.innerHTML = '';

    let filtered = state.assets.filter(asset => {
        if (catFilter !== 'all' && asset.category !== catFilter) return false;
        if (statFilter !== 'all' && asset.status !== statFilter) return false;

        if (query) {
            const nameMatch = asset.name.toLowerCase().includes(query);
            const tagMatch = asset.tag.toLowerCase().includes(query);
            const skuMatch = (asset.model || '').toLowerCase().includes(query);
            const brandMatch = (asset.brand || '').toLowerCase().includes(query);
            const userMatch = (asset.assignedUser || '').toLowerCase().includes(query);
            const serialMatch = (asset.serial || '').toLowerCase().includes(query);

            return nameMatch || tagMatch || skuMatch || brandMatch || userMatch || serialMatch;
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

    // Pagination calculations
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / paginationConfig.pageSize);

    // Clamp current page to valid bounds
    if (paginationConfig.currentPage > totalPages && totalPages > 0) {
        paginationConfig.currentPage = totalPages;
    }
    if (paginationConfig.currentPage < 1) {
        paginationConfig.currentPage = 1;
    }

    const startIdx = (paginationConfig.currentPage - 1) * paginationConfig.pageSize;
    const endIdx = Math.min(startIdx + paginationConfig.pageSize, totalItems);

    // Render page status text
    if (DOM.paginationInfo) {
        DOM.paginationInfo.textContent = `Showing ${totalItems > 0 ? startIdx + 1 : 0}-${endIdx} of ${totalItems} assets`;
    }

    // Enable/disable page prev/next buttons
    if (DOM.btnPagePrev) DOM.btnPagePrev.disabled = (paginationConfig.currentPage === 1);
    if (DOM.btnPageNext) DOM.btnPageNext.disabled = (paginationConfig.currentPage === totalPages || totalPages === 0);

    // Render numbered page buttons
    renderPaginationControls(totalPages);

    // Slice assets for current page
    const pageAssets = filtered.slice(startIdx, endIdx);

    pageAssets.forEach(asset => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        
        tr.addEventListener('click', (e) => {
            if (e.target.closest('.action-prevent-drawer')) return;
            openDrawer(asset.id);
        });

        const statusClass = `status-${asset.status.toLowerCase()}`;
        const userDisplay = asset.status === 'Assigned' 
            ? `<div style="font-weight: 600;">${asset.assignedUser}</div><div style="font-size:11px; color:var(--text-muted);">${asset.department}</div>`
            : `<span style="color: var(--text-muted);">Unassigned</span>`;

        // Fetch hardware upgrades/replacements
        const assetUpgrades = state.maintenance.filter(m => m.assetId === asset.id);
        const upgradesText = assetUpgrades.length > 0 
            ? assetUpgrades.map(u => `${u.partReplaced} (${u.status || 'Completed'})`).join(', ')
            : `<span style="color:var(--text-muted); font-size:12px;">None</span>`;

        // Render actions column depending on role
        let actionsHtml = "";
        if (state.isAdmin) {
            actionsHtml = `
                ${asset.status === 'Available' ? `
                    <button class="btn btn-primary btn-sm" onclick="openAssignModal('${asset.id}')">Assign</button>
                ` : ''}
                ${asset.status === 'Assigned' ? `
                    <button class="btn btn-secondary btn-sm" onclick="returnAsset('${asset.id}')">Return</button>
                ` : ''}
            `;
        }

        tr.innerHTML = `
            <td><span class="asset-tag-pill">${asset.tag}</span></td>
            <td>
                <div style="font-weight:600; color:var(--text-primary);">${asset.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">${asset.brand || '-'} ${asset.model || ''}</div>
            </td>
            <td style="color:var(--text-secondary); font-size:13.5px;">${asset.category}</td>
            <td style="font-size:12px; color:var(--text-muted); max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${asset.specs || 'None'}">
                ${asset.specs || 'N/A'}
            </td>
            <td>
                <span class="status-badge ${statusClass}">${asset.status}</span>
            </td>
            <td>${userDisplay}</td>
            <td style="font-size:12px; color:var(--text-secondary); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${assetUpgrades.map(u => `${u.partReplaced} (${u.status || 'Completed'})`).join(', ')}">
                ${upgradesText}
            </td>
            <td style="text-align: right;" class="action-prevent-drawer">
                <div style="display:flex; justify-content:flex-end; gap:6px;">
                    ${actionsHtml}
                    <button class="btn btn-secondary btn-sm" style="padding: 5px 8px;" onclick="openDrawer('${asset.id}')">
                        🔎
                    </button>
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

    DOM.drawerTag.textContent = asset.tag;
    DOM.drawerTitle.textContent = asset.name;
    DOM.drawerBrandModel.textContent = `${asset.brand || 'Generic'} ${asset.model || ''}`;
    DOM.drawerSerial.textContent = asset.serial || 'N/A';
    DOM.drawerSpecs.textContent = asset.specs || 'None Specified';
    DOM.drawerPrice.textContent = `৳${parseFloat(asset.price || 0).toFixed(2)}`;
    DOM.drawerPurchaseDate.textContent = asset.purchaseDate || 'N/A';
    DOM.drawerWarrantyExpiry.textContent = asset.warrantyExpiry || 'No Warranty Recorded';

    DOM.drawerStatus.className = `status-badge status-${asset.status.toLowerCase()}`;
    DOM.drawerStatus.textContent = asset.status;

    DOM.maintenanceFormAssetId.value = asset.id;
    DOM.maintenanceAssetDisplay.value = `${asset.name} (${asset.tag})`;

    // Photo preview
    if (asset.attachedPhoto) {
        DOM.drawerPhotoImg.src = asset.attachedPhoto;
        DOM.drawerPhotoContainer.style.display = 'block';
    } else {
        DOM.drawerPhotoImg.src = "";
        DOM.drawerPhotoContainer.style.display = 'none';
    }

    // Invoice preview
    if (asset.attachedInvoice) {
        DOM.drawerInvoiceRow.style.display = 'flex';
        DOM.drawerInvoiceDownloadBtn.onclick = () => {
            openInvoice(asset.attachedInvoice, asset.tag);
        };
    } else {
        DOM.drawerInvoiceRow.style.display = 'none';
    }

    // Notes display in drawer
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
        DOM.drawerVendorMobile.textContent = vendor.mobile;
        DOM.drawerVendorMobile.style.display = 'inline-block';
    } else {
        DOM.drawerVendorName.textContent = 'Unknown / None';
        DOM.drawerVendorMobile.textContent = '-';
    }

    const assignActions = DOM.drawerAssignmentActions;
    assignActions.innerHTML = '';
    
    // Setup Drawer UI restrictions for staff
    if (state.isAdmin) {
        if (asset.status === 'Assigned') {
            DOM.drawerAssignmentDesc.innerHTML = `Assigned to <strong>${asset.assignedUser}</strong> (${asset.department})`;
            assignActions.innerHTML = `<button class="btn btn-secondary btn-sm" onclick="returnAsset('${asset.id}'); closeDrawer();">Return Stock</button>`;
        } else if (asset.status === 'Maintenance') {
            DOM.drawerAssignmentDesc.innerHTML = `<span style="color:var(--color-warning);">Under repair / Parts Replacement</span>`;
            assignActions.innerHTML = `<button class="btn btn-primary btn-sm" onclick="setAssetAvailable('${asset.id}'); closeDrawer();">Mark Ready</button>`;
        } else {
            DOM.drawerAssignmentDesc.textContent = 'Device is available for assignment';
            assignActions.innerHTML = `<button class="btn btn-primary btn-sm" onclick="closeDrawer(); openAssignModal('${asset.id}')">Deploy Workstation</button>`;
        }
        DOM.drawerEditBtn.style.display = 'inline-flex';
        DOM.drawerDeleteBtn.style.display = 'inline-flex';
        DOM.btnDrawerAddMaintenance.style.display = 'inline-flex';
    } else {
        // Staff reads description but sees NO assign buttons
        if (asset.status === 'Assigned') {
            DOM.drawerAssignmentDesc.innerHTML = `Assigned to <strong>${asset.assignedUser}</strong> (${asset.department})`;
        } else if (asset.status === 'Maintenance') {
            DOM.drawerAssignmentDesc.innerHTML = `<span style="color:var(--color-warning);">Under Maintenance Repair</span>`;
        } else {
            DOM.drawerAssignmentDesc.textContent = 'Device is available';
        }
        DOM.drawerEditBtn.style.display = 'none';
        DOM.drawerDeleteBtn.style.display = 'none';
        DOM.btnDrawerAddMaintenance.style.display = 'none';
    }

    const maintList = DOM.drawerMaintenanceList;
    maintList.innerHTML = '';

    const assetUpgrades = state.maintenance.filter(m => m.assetId === asset.id);
    
    if (assetUpgrades.length === 0) {
        maintList.innerHTML = `<p style="font-size:12.5px; color:var(--text-muted); font-style:italic; padding: 10px 0;">No hardware repairs or upgrades recorded.</p>`;
    } else {
        assetUpgrades.forEach(upg => {
            const vInfo = state.vendors.find(v => v.id === upg.vendorId);
            const vMob = vInfo ? vInfo.mobile : 'N/A';
            const logItem = document.createElement('div');
            logItem.className = 'upgrade-log-item';
            
            // Build Status Badge styling classes
            let statusBadgeClass = 'maint-in-progress';
            if (upg.status === 'Awaiting Parts') statusBadgeClass = 'maint-awaiting-parts';
            else if (upg.status === 'Unpaid') statusBadgeClass = 'maint-unpaid';
            else if (upg.status === 'Completed') statusBadgeClass = 'maint-completed';

            // Add toggle action button for admins if repair is ongoing OR if it's completed but has not been edited after completion yet
            let adminToggleHtml = '';
            if (state.isAdmin) {
                if (upg.status !== 'Completed') {
                    const statusButtons = [];
                    if (upg.status !== 'In Progress') {
                        statusButtons.push(`<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${upg.id}', 'In Progress', event)">In Progress</button>`);
                    }
                    if (upg.status !== 'Awaiting Parts') {
                        statusButtons.push(`<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${upg.id}', 'Awaiting Parts', event)">Awaiting Parts</button>`);
                    }
                    if (upg.status !== 'Unpaid') {
                        statusButtons.push(`<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${upg.id}', 'Unpaid', event)">Unpaid</button>`);
                    }
                    statusButtons.push(`<button class="btn btn-primary btn-sm" style="padding:2px 6px; font-size:10.5px;" onclick="changeMaintStatus('${upg.id}', 'Completed', event)">Complete</button>`);

                    adminToggleHtml = `
                        <div style="margin-top:6px; display:flex; gap:6px; align-items:center; flex-wrap:wrap; width: 100%;">
                            <span style="font-size:11px; color:var(--text-muted);">Shift status:</span>
                            ${statusButtons.join('')}
                            <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px; margin-left: auto;" onclick="closeDrawer(); openEditMaintenanceModal('${upg.id}', event)">✏️ Edit</button>
                        </div>
                    `;
                } else if (!upg.completedEdits || upg.completedEdits < 1) {
                    adminToggleHtml = `
                        <div style="margin-top:6px; display:flex; gap:6px; align-items:center; width: 100%;">
                            <span style="font-size:11px; color:var(--text-muted); font-style:italic;">Completed (Can be edited 1 time):</span>
                            <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10.5px; margin-left: auto;" onclick="closeDrawer(); openEditMaintenanceModal('${upg.id}', event)">✏️ Edit</button>
                        </div>
                    `;
                }
            }

            logItem.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <div class="upgrade-log-date">${upg.date} — Cost: ৳${parseFloat(upg.cost).toFixed(2)}</div>
                    <span class="status-badge ${statusBadgeClass}" style="padding:2px 6px; font-size:9.5px; font-weight:700;">${upg.status || 'Completed'}</span>
                </div>
                <div class="upgrade-log-desc"><strong>${upg.partReplaced}</strong>: ${upg.description}</div>
                <div class="upgrade-log-vendor">
                    <span>Vendor: ${upg.vendorName || 'Elite'}</span>
                    <span style="font-family:monospace; color:var(--color-primary);">${vMob}</span>
                </div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:4px; border-top:1px dashed rgba(255,255,255,0.05); padding-top:4px;">
                    Reason: ${upg.reason}
                </div>
                ${adminToggleHtml}
            `;
            maintList.appendChild(logItem);
        });
    }

    // Render historical assignments
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

function returnAsset(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    const oldUser = asset.assignedUser;
    const oldDept = asset.department;

    asset.status = 'Available';
    asset.assignedUser = '';
    asset.department = '';

    saveState();
    logTransaction(
        'Return',
        asset.tag,
        asset.name,
        `Device returned to base stock. Formerly used by ${oldUser} (${oldDept}).`
    );
    renderAll();
}

function setAssetAvailable(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    asset.status = 'Available';
    saveState();
    logTransaction(
        'Status Change',
        asset.tag,
        asset.name,
        `Device marked Available (released from Maintenance repair).`
    );
    renderAll();
}

function deleteAsset(assetId) {
    const index = state.assets.findIndex(a => a.id === assetId);
    if (index === -1) return;

    const asset = state.assets[index];
    if (confirm(`Are you absolutely sure you want to delete ${asset.name} (${asset.tag})? This action cannot be undone.`)) {
        state.assets.splice(index, 1);
        saveState();
        logTransaction(
            'Status Change',
            asset.tag,
            asset.name,
            `Asset deleted / retired from IMS records.`
        );
        renderAll();
    }
}

// ================= VENDORS RENDERER =================
function renderVendors() {
    const grid = DOM.vendorsGridContainer;
    const query = DOM.vendorsSearch.value.trim().toLowerCase();

    grid.innerHTML = '';

    let filtered = state.vendors.filter(v => {
        if (!query) return true;
        const nameMatch = v.name.toLowerCase().includes(query);
        const contactMatch = v.contactPerson.toLowerCase().includes(query);
        const mobileMatch = v.mobile.toLowerCase().includes(query);
        const addressMatch = (v.address || '').toLowerCase().includes(query);
        return nameMatch || contactMatch || mobileMatch || addressMatch;
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
        
        const countSupplied = state.assets.filter(a => a.vendorId === vendor.id).length;

        // Render card actions depending on role
        let actionsHtml = "";
        if (state.isAdmin) {
            actionsHtml = `
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-sm" style="padding:4px 8px;" onclick="openVendorModal('${vendor.id}')" title="Edit supplier profile">✏️</button>
                    <button class="btn btn-danger btn-sm" style="padding:4px 8px;" onclick="deleteVendor('${vendor.id}')" title="Delete supplier">🗑️</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="vendor-title">
                <div>
                    <h3 class="vendor-name">${vendor.name}</h3>
                    <span style="font-size:11px; background:rgba(168, 85, 247, 0.15); border:1px solid rgba(168, 85, 247, 0.3); color:var(--color-secondary); padding: 2px 6px; border-radius:var(--radius-full); font-weight:600; text-transform:uppercase; margin-top: 6px; display:inline-block;">
                        ${countSupplied} assets supplied
                    </span>
                </div>
                ${actionsHtml}
            </div>
            <div class="vendor-contact-details">
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span>${vendor.contactPerson} (Sales Manager)</span>
                </div>
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    <!-- Click to Dial trigger -->
                    <a href="tel:${vendor.mobile}" style="font-family:monospace; font-weight:600; color:var(--color-primary); text-decoration:none;" title="Click to call vendor">${vendor.mobile}</a>
                </div>
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span>${vendor.email}</span>
                </div>
                <div class="vendor-detail-row">
                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <span style="font-size:12.5px;">${vendor.address || 'N/A'}</span>
                </div>
            </div>
            ${vendor.notes ? `<div class="vendor-notes">${vendor.notes}</div>` : ''}
        `;
        grid.appendChild(card);
    });
}

function deleteVendor(vendorId) {
    const linked = state.assets.some(a => a.vendorId === vendorId);
    if (linked) {
        alert("Cannot delete vendor. This vendor is currently linked to physical assets in your inventory. Re-assign those assets to another supplier first.");
        return;
    }

    if (confirm("Are you sure you want to remove this vendor from IMS records?")) {
        const idx = state.vendors.findIndex(v => v.id === vendorId);
        if (idx !== -1) {
            state.vendors.splice(idx, 1);
            saveState();
            renderAll();
        }
    }
}

// ================= LOGS RENDERING =================
function renderLogs() {
    if (!state.isAdmin) return; // Only Admin accesses logs table
    
    const tableBody = DOM.logsTableBody;
    const query = DOM.logsSearch.value.trim().toLowerCase();
    const typeFilter = DOM.filterLogType.value;

    tableBody.innerHTML = '';

    const filtered = state.transactions.filter(log => {
        if (typeFilter !== 'all' && log.type !== typeFilter) return false;

        if (query) {
            const nameMatch = log.assetName.toLowerCase().includes(query);
            const tagMatch = log.assetTag.toLowerCase().includes(query);
            const typeMatch = log.type.toLowerCase().includes(query);
            const descMatch = log.details.toLowerCase().includes(query);
            return nameMatch || tagMatch || typeMatch || descMatch;
        }
        return true;
    });

    if (filtered.length === 0) {
        DOM.logsEmptyState.style.display = 'flex';
        return;
    } else {
        DOM.logsEmptyState.style.display = 'none';
    }

    filtered.forEach(log => {
        const tr = document.createElement('tr');
        
        let actionClass = 'status-badge ';
        if (log.type === 'Purchase') actionClass += 'status-available';
        else if (log.type === 'Assignment') actionClass += 'status-assigned';
        else if (log.type === 'Return') actionClass += 'status-available';
        else if (log.type === 'Maintenance') actionClass += 'status-maintenance';
        else actionClass += 'status-retired';

        const date = new Date(log.timestamp).toLocaleString();

        tr.innerHTML = `
            <td style="color:var(--text-muted); font-size:12.5px; font-family:monospace;">${date}</td>
            <td><span class="${actionClass}">${log.type}</span></td>
            <td><span class="asset-tag-pill">${log.assetTag}</span></td>
            <td style="font-weight:600;">${log.assetName}</td>
            <td style="font-size:13px; color:var(--text-secondary); max-width:320px;">${log.details}</td>
            <td style="font-size:12px; color:var(--text-muted); font-weight:500;">${log.operator}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function clearLogs() {
    if (confirm("Are you sure you want to empty the activity trail logs?")) {
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

// Open Modals prefilled
function openAssetModal(assetId = null) {
    DOM.assetForm.reset();
    populateVendorDropdowns();
    
    // Reset modal tabs to Info tab
    switchModalTab('modal-tab-info');
    
    // Clear temp attachment stores
    tempAttachedPhoto = "";
    tempAttachedInvoice = "";
    DOM.photoFileStatus.textContent = "None";
    DOM.photoFileStatus.style.color = "var(--text-muted)";
    DOM.invoiceFileStatus.textContent = "None";
    DOM.invoiceFileStatus.style.color = "var(--text-muted)";
    
    if (assetId) {
        const asset = state.assets.find(a => a.id === assetId);
        if (!asset) return;
        
        DOM.assetFormId.value = asset.id;
        DOM.assetModalTitle.textContent = "Edit Asset Details";
        DOM.assetNameInput.value = asset.name;
        DOM.assetTagInput.value = asset.tag;
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
        
        // Populate existing files
        if (asset.attachedPhoto) {
            tempAttachedPhoto = asset.attachedPhoto;
            DOM.photoFileStatus.textContent = "Has Photo ✓";
            DOM.photoFileStatus.style.color = "var(--color-success)";
        }
        if (asset.attachedInvoice) {
            tempAttachedInvoice = asset.attachedInvoice;
            DOM.invoiceFileStatus.textContent = "Has Invoice ✓";
            DOM.invoiceFileStatus.style.color = "var(--color-success)";
        }
    } else {
        DOM.assetFormId.value = "";
        DOM.assetModalTitle.textContent = "Register New IMS Asset";
        DOM.assetPurchaseDateInput.value = new Date().toISOString().split('T')[0];
        DOM.assetNotesInput.value = "";
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

    DOM.maintenanceFormAssetId.value = asset.id;
    DOM.maintenanceFormLogId.value = '';
    DOM.maintenanceModalTitle.textContent = "Log Hardware Upgrade / Replacement";
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
        alert("This completed record has already been edited once and cannot be modified again.");
        return;
    }

    const asset = state.assets.find(a => a.id === log.assetId);
    if (!asset) return;

    DOM.maintenanceForm.reset();
    populateVendorDropdowns();

    DOM.maintenanceFormAssetId.value = log.assetId;
    DOM.maintenanceFormLogId.value = log.id;
    DOM.maintenanceModalTitle.textContent = "Edit Hardware Upgrade / Replacement";
    DOM.maintenanceAssetDisplay.value = `${asset.name} (${asset.tag})`;
    DOM.maintPartInput.value = log.partReplaced;
    DOM.maintCostInput.value = log.cost;
    DOM.maintVendorSelect.value = log.vendorId || '';
    DOM.maintDateInput.value = log.date;
    DOM.maintStatusSelect.value = log.status;
    DOM.maintDescInput.value = log.description;
    DOM.maintReasonInput.value = log.reason;

    openModal('maintenance-modal');
};

function openVendorModal(vendorId = null) {
    DOM.vendorForm.reset();
    
    if (vendorId) {
        const vendor = state.vendors.find(v => v.id === vendorId);
        if (!vendor) return;

        DOM.vendorFormId.value = vendor.id;
        DOM.vendorModalTitle.textContent = "Edit Supplier Details";
        DOM.vendorNameInput.value = vendor.name;
        DOM.vendorContactInput.value = vendor.contactPerson;
        DOM.vendorMobileInput.value = vendor.mobile;
        DOM.vendorEmailInput.value = vendor.email;
        DOM.vendorAddressInput.value = vendor.address || '';
        DOM.vendorNotesInput.value = vendor.notes || '';
    } else {
        DOM.vendorFormId.value = "";
        DOM.vendorModalTitle.textContent = "Register New Supplier Contact";
    }

    openModal('vendor-modal');
}

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

    const duplicateTag = state.assets.some(a => a.tag === tag && a.id !== id);
    if (duplicateTag) {
        alert(`Duplicate Asset Tag: An asset with the tag "${tag}" is already registered.`);
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
        
        // Attach updated files
        asset.attachedPhoto = tempAttachedPhoto;
        asset.attachedInvoice = tempAttachedInvoice;

        logTransaction(
            'Status Change',
            tag,
            name,
            `Asset properties modified by administrator. Formerly ${oldName} (${oldTag}).`
        );
    } else {
        const newAsset = {
            id: 'a-' + Date.now() + Math.floor(Math.random() * 10),
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
        logTransaction(
            'Purchase',
            tag,
            name,
            `New system hardware registered. Acquired from registered vendor.`
        );
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
    logTransaction(
        'Assignment',
        asset.tag,
        asset.name,
        `Device successfully assigned to employee ${username} in the ${dept} department.`
    );
    
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
        // Edit mode
        const log = state.maintenance.find(m => m.id === logId);
        if (!log) return;

        const wasCompletedBefore = log.status === 'Completed';
        if (wasCompletedBefore) {
            if (log.completedEdits >= 1) {
                alert("This completed record has already been edited once and cannot be modified again.");
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

        // Shift asset status depending on new status
        if (status === 'Completed') {
            const activeLogs = state.maintenance.filter(m => m.assetId === asset.id && m.status !== 'Completed');
            if (activeLogs.length === 0) {
                asset.status = 'Available';
            }
        } else {
            asset.status = 'Maintenance';
        }

        logTransaction(
            'Maintenance',
            asset.tag,
            asset.name,
            `Modified hardware upgrade: "${part}" (formerly "${oldPart}"), status [${status}] (formerly [${oldStatus}]) supplied by ${vendorName}.`
        );
    } else {
        // Create mode
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
            reason
        };

        state.maintenance.push(maintenanceLog);
        
        // Shift asset status to Maintenance if repair is ongoing
        if (status === 'Completed') {
            asset.status = 'Available';
        } else {
            asset.status = 'Maintenance';
        }

        logTransaction(
            'Maintenance',
            asset.tag,
            asset.name,
            `Logged hardware upgrade: "${part}" status [${status}] supplied by ${vendorName}. Reason: ${reason}.`
        );
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
        const newVendor = {
            id: 'v-' + Date.now(),
            name,
            contactPerson: contact,
            mobile,
            email,
            address,
            notes
        };
        state.vendors.push(newVendor);
    }

    saveState();
    closeModal('vendor-modal');
    renderAll();
}

// ================= CSV PORTABILITY HANDLERS =================

function exportInventoryToCSV() {
    if (state.assets.length === 0) {
        alert("The inventory list is empty. Add assets before exporting.");
        return;
    }

    const headers = ["Asset Tag", "Asset Name", "Category", "Brand", "Model", "Serial Number", "Specs", "Valuation Cost", "Status", "Assigned User", "Department", "Purchase Date", "Warranty Expiry", "Notes"];
    
    let csvRows = [];
    csvRows.push(headers.join(','));

    state.assets.forEach(asset => {
        const row = [
            `"${asset.tag}"`,
            `"${asset.name.replace(/"/g, '""')}"`,
            `"${asset.category}"`,
            `"${(asset.brand || '').replace(/"/g, '""')}"`,
            `"${(asset.model || '').replace(/"/g, '""')}"`,
            `"${(asset.serial || '').replace(/"/g, '""')}"`,
            `"${(asset.specs || '').replace(/"/g, '""')}"`,
            asset.price,
            `"${asset.status}"`,
            `"${(asset.assignedUser || '').replace(/"/g, '""')}"`,
            `"${asset.department}"`,
            `"${asset.purchaseDate}"`,
            `"${asset.warrantyExpiry || ''}"`,
            `"${(asset.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ims_asset_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importInventoryFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const contents = evt.target.result;
            const lines = contents.split('\n');
            if (lines.length <= 1) throw new Error("File empty or invalid.");

            const parseCSVLine = (text) => {
                let p = '', r = [];
                let q = false;
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];
                    if (c === '"') { q = !q; }
                    else if (c === ',' && !q) { r.push(p); p = ''; }
                    else { p += c; }
                }
                r.push(p);
                return r.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            };

            const headerRow = parseCSVLine(lines[0]);
            
            if (!headerRow.includes("Asset Tag") || !headerRow.includes("Asset Name")) {
                alert("Invalid CSV format. Your CSV file must contain 'Asset Tag' and 'Asset Name' headers.");
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;

            const defaultVendorId = state.vendors.length > 0 ? state.vendors[0].id : 'v-default';
            if (state.vendors.length === 0) {
                state.vendors.push({
                    id: 'v-default',
                    name: "Default Supplier",
                    contactPerson: "Admin",
                    mobile: "+880-000-00000",
                    email: "info@ims.com"
                });
            }

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = parseCSVLine(line);
                if (cols.length < 2) continue;

                const getVal = (headerName, fallback = '') => {
                    const idx = headerRow.indexOf(headerName);
                    return idx !== -1 && cols[idx] !== undefined ? cols[idx] : fallback;
                };

                const tag = getVal("Asset Tag").toUpperCase();
                const name = getVal("Asset Name");

                if (!tag || !name) {
                    skippedCount++;
                    continue;
                }

                if (state.assets.some(a => a.tag === tag)) {
                    skippedCount++;
                    continue;
                }

                const price = parseFloat(getVal("Valuation Cost", "0")) || 0;
                const category = getVal("Category", "Computer");
                const status = getVal("Status", "Available");
                const notes = getVal("Notes", "");

                const newAsset = {
                    id: 'a-' + Date.now() + Math.floor(Math.random() * 1000),
                    name: name,
                    tag: tag,
                    category: category,
                    brand: getVal("Brand", "Generic"),
                    model: getVal("Model", ""),
                    serial: getVal("Serial Number", "SN-" + Math.floor(Math.random() * 100000)),
                    specs: getVal("Specs", ""),
                    price: price,
                    status: status,
                    assignedUser: getVal("Assigned User", ""),
                    department: getVal("Department", ""),
                    vendorId: defaultVendorId,
                    purchaseDate: getVal("Purchase Date", new Date().toISOString().split('T')[0]),
                    warrantyExpiry: getVal("Warranty Expiry", ""),
                    notes: notes,
                    attachedPhoto: "", // No attachments pre-loaded in standard external CSV
                    attachedInvoice: ""
                };

                state.assets.push(newAsset);
                addedCount++;
            }

            saveState();
            renderAll();
            
            alert(`CSV Import Finished! Bulk added ${addedCount} new assets successfully.`);
            logTransaction(
                'Status Change',
                'CSV-IMP',
                'System Bulk Import',
                `Bulk registered ${addedCount} assets via CSV import file.`
            );
        } catch (err) {
            console.error(err);
            alert("Error parsing CSV file. Please make sure the structure is correct.");
        }
    };
    reader.readAsText(file);
    DOM.importCsvFile.value = '';
}

function exportVendorsToCSV() {
    if (state.vendors.length === 0) {
        alert("The vendors list is empty. Register vendors before exporting.");
        return;
    }

    const headers = ["Company Name", "Contact Person", "Mobile Number", "Email Address", "Office Address", "Services & Notes"];
    
    let csvRows = [];
    csvRows.push(headers.join(','));

    state.vendors.forEach(vendor => {
        const row = [
            `"${vendor.name.replace(/"/g, '""')}"`,
            `"${(vendor.contactPerson || '').replace(/"/g, '""')}"`,
            `"${(vendor.mobile || '').replace(/"/g, '""')}"`,
            `"${(vendor.email || '').replace(/"/g, '""')}"`,
            `"${(vendor.address || '').replace(/"/g, '""')}"`,
            `"${(vendor.notes || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ims_vendors_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importVendorsFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const contents = evt.target.result;
            const lines = contents.split('\n');
            if (lines.length <= 1) throw new Error("File empty or invalid.");

            const parseCSVLine = (text) => {
                let p = '', r = [];
                let q = false;
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];
                    if (c === '"') { q = !q; }
                    else if (c === ',' && !q) { r.push(p); p = ''; }
                    else { p += c; }
                }
                r.push(p);
                return r.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            };

            const headerRow = parseCSVLine(lines[0]);
            
            if (!headerRow.includes("Company Name") || !headerRow.includes("Mobile Number")) {
                alert("Invalid CSV format. Your CSV file must contain 'Company Name' and 'Mobile Number' headers.");
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = parseCSVLine(line);
                if (cols.length < 2) continue;

                const getVal = (headerName, fallback = '') => {
                    const idx = headerRow.indexOf(headerName);
                    return idx !== -1 && cols[idx] !== undefined ? cols[idx] : fallback;
                };

                const name = getVal("Company Name");
                const mobile = getVal("Mobile Number");

                if (!name || !mobile) {
                    skippedCount++;
                    continue;
                }

                // Check duplicates by company name (case-insensitive) or mobile
                if (state.vendors.some(v => v.name.toLowerCase() === name.toLowerCase() || v.mobile === mobile)) {
                    skippedCount++;
                    continue;
                }

                const newVendor = {
                    id: 'v-' + Date.now() + Math.floor(Math.random() * 1000),
                    name: name,
                    contactPerson: getVal("Contact Person", "Admin"),
                    mobile: mobile,
                    email: getVal("Email Address", ""),
                    address: getVal("Office Address", ""),
                    notes: getVal("Services & Notes", "")
                };

                state.vendors.push(newVendor);
                addedCount++;
            }

            saveState();
            renderAll();
            
            alert(`CSV Import Finished! Bulk added ${addedCount} new vendors successfully. (Skipped ${skippedCount} duplicates/invalid rows)`);
            logTransaction(
                'Status Change',
                'CSV-IMP',
                'Vendors Bulk Import',
                `Bulk registered ${addedCount} vendors via CSV import file.`
            );
        } catch (err) {
            console.error(err);
            alert("Error parsing CSV file. Please make sure the structure is correct.");
        }
    };
    reader.readAsText(file);
    DOM.importVendorsCsvFile.value = '';
}

function exportMaintenanceToCSV() {
    if (state.maintenance.length === 0) {
        alert("The maintenance list is empty. Log upgrades before exporting.");
        return;
    }

    const headers = ["Asset Tag", "Part Replaced", "Cost", "Supplier/Vendor Name", "Date Performed", "Status", "Description", "Reason"];
    
    let csvRows = [];
    csvRows.push(headers.join(','));

    state.maintenance.forEach(maint => {
        const asset = state.assets.find(a => a.id === maint.assetId);
        const tag = asset ? asset.tag : 'UNKNOWN';
        const vendor = state.vendors.find(v => v.id === maint.vendorId);
        const vendorName = vendor ? vendor.name : (maint.vendorName || 'Elite Tech Support');

        const row = [
            `"${tag}"`,
            `"${maint.partReplaced.replace(/"/g, '""')}"`,
            maint.cost,
            `"${vendorName.replace(/"/g, '""')}"`,
            `"${maint.date}"`,
            `"${maint.status || 'Completed'}"`,
            `"${(maint.description || '').replace(/"/g, '""')}"`,
            `"${(maint.reason || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ims_maintenance_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importMaintenanceFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const contents = evt.target.result;
            const lines = contents.split('\n');
            if (lines.length <= 1) throw new Error("File empty or invalid.");

            const parseCSVLine = (text) => {
                let p = '', r = [];
                let q = false;
                for (let i = 0; i < text.length; i++) {
                    let c = text[i];
                    if (c === '"') { q = !q; }
                    else if (c === ',' && !q) { r.push(p); p = ''; }
                    else { p += c; }
                }
                r.push(p);
                return r.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            };

            const headerRow = parseCSVLine(lines[0]);
            
            if (!headerRow.includes("Asset Tag") || !headerRow.includes("Part Replaced")) {
                alert("Invalid CSV format. Your CSV file must contain 'Asset Tag' and 'Part Replaced' headers.");
                return;
            }

            let addedCount = 0;
            let skippedCount = 0;
            const newTransactions = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = parseCSVLine(line);
                if (cols.length < 2) continue;

                const getVal = (headerName, fallback = '') => {
                    const idx = headerRow.indexOf(headerName);
                    return idx !== -1 && cols[idx] !== undefined ? cols[idx] : fallback;
                };

                const tag = getVal("Asset Tag").toUpperCase();
                const part = getVal("Part Replaced");

                if (!tag || !part) {
                    skippedCount++;
                    continue;
                }

                // Match asset by tag
                const asset = state.assets.find(a => a.tag === tag);
                if (!asset) {
                    skippedCount++;
                    continue;
                }

                // Match or create vendor
                const vName = getVal("Supplier/Vendor Name", "Elite Tech Support");
                let vendor = state.vendors.find(v => v.name.toLowerCase() === vName.toLowerCase());
                if (!vendor && state.vendors.length > 0) {
                    vendor = state.vendors[0]; // fallback to first vendor
                } else if (!vendor) {
                    vendor = { id: 'v-default', name: 'Elite Tech Support', mobile: '+880-1711-223344' };
                    state.vendors.push(vendor);
                }

                const cost = parseFloat(getVal("Cost", "0")) || 0;
                const status = getVal("Status", "Completed");

                const date = getVal("Date Performed", new Date().toISOString().split('T')[0]);
                const description = getVal("Description", part);
                const reason = getVal("Reason", "Upgrade / Repair");

                const newMaint = {
                    id: 'm-' + Date.now() + Math.floor(Math.random() * 1000) + '-' + i,
                    assetId: asset.id,
                    partReplaced: part,
                    cost: cost,
                    vendorId: vendor.id,
                    vendorName: vendor.name,
                    date: date,
                    status: status,
                    description: description,
                    reason: reason
                };

                state.maintenance.push(newMaint);

                // Add individual transaction record for this upgrade/repair
                const transaction = {
                    id: 't-' + Date.now() + Math.floor(Math.random() * 100) + '-' + i,
                    timestamp: new Date().toISOString(),
                    type: 'Maintenance',
                    assetTag: asset.tag,
                    assetName: asset.name,
                    details: `[CSV Import] Logged hardware upgrade: "${part}" status [${status}] supplied by ${vendor.name}. Reason: ${reason}.`,
                    operator: `IT Admin (${state.role.toUpperCase()})`
                };
                newTransactions.push(transaction);

                // If status is ongoing, make sure the asset status updates to Maintenance
                if (status !== 'Completed') {
                    asset.status = 'Maintenance';
                }

                addedCount++;
            }

            state.transactions = [...newTransactions, ...state.transactions];

            saveState();
            dashboardMaintPagination.currentPage = 1;
            renderAll();
            
            alert(`CSV Import Finished! Bulk added ${addedCount} maintenance log records. (Skipped ${skippedCount} items due to invalid tags/formats)`);
        } catch (err) {
            console.error(err);
            alert("Error parsing CSV file. Please make sure the structure is correct.");
        }
    };
    reader.readAsText(file);
    DOM.importMaintCsvFile.value = '';
}

// ================= CUSTOM CORPORATE LOGO CUSTOMIZER =================

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500000) {
        alert("Logo file is too large. Please upload an image under 500KB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        localStorage.setItem('ims_custom_logo', base64);
        applyCustomLogo(base64);
        logTransaction(
            'Status Change',
            'LOGO',
            'Corporate Branding',
            'Corporate logo customized and updated by administrator.'
        );
    };
    reader.readAsDataURL(file);
}

function applyCustomLogo(base64) {
    const displays = document.querySelectorAll('.clickable-logo');
    displays.forEach(display => {
        display.innerHTML = `<img src="${base64}" alt="IMS Logo" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
        display.style.background = 'none';
        display.style.border = '1px solid var(--border-color)';
    });
}

function checkCustomLogo() {
    const savedLogo = localStorage.getItem('ims_custom_logo');
    if (savedLogo) {
        applyCustomLogo(savedLogo);
    }
}

// ================= MODAL TAB CONTROLLER =================
function switchModalTab(tabId) {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-modal-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.modal-tab-content').forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// ================= SECURITY & CREDENTIALS UPDATE =================
function handlePasswordChange(e) {
    e.preventDefault();
    const targetRole = DOM.changePasswordRole ? DOM.changePasswordRole.value : 'admin';
    const oldPassword = DOM.oldPasswordInput.value;
    const newPassword = DOM.newPasswordInput.value;
    const confirmPassword = DOM.confirmPasswordInput.value;

    const currentAdminPass = state.adminPassword || 'ims';

    if (oldPassword !== currentAdminPass) {
        alert("Incorrect current Admin password.");
        return;
    }

    if (newPassword.length < 4) {
        alert("New password must be at least 4 characters long.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    if (targetRole === 'admin') {
        state.adminPassword = newPassword;
        localStorage.setItem('ims_admin_password', newPassword);
        alert("Admin password updated successfully!");
        
        logTransaction(
            'Status Change',
            'SECURITY',
            'Admin Credentials',
            'Admin security password changed by administrator.'
        );
    } else {
        state.staffPassword = newPassword;
        localStorage.setItem('ims_staff_password', newPassword);
        alert("Staff password updated successfully!");
        
        logTransaction(
            'Status Change',
            'SECURITY',
            'Staff Credentials',
            'Staff security password changed by administrator.'
        );
    }

    saveState();
    DOM.changePasswordForm.reset();
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
        logTransaction(
            'Status Change',
            asset.tag,
            asset.name,
            `Warranty coverage extended to ${newDate} by administrator.`
        );
        alert("Warranty updated successfully!");
    } else if (newDate) {
        alert("Invalid date format. Use YYYY-MM-DD.");
    }
};

// ================= DROPDOWNS POPULATOR =================
function populateCategoriesAndDepartments() {
    // Category Filter in Inventory Tab
    const filterCatSelect = document.getElementById('filter-category');
    if (filterCatSelect) {
        let filterCatOptions = '<option value="all">All Categories</option>';
        state.categories.forEach(cat => {
            filterCatOptions += `<option value="${cat}">${cat}</option>`;
        });
        filterCatSelect.innerHTML = filterCatOptions;
    }

    // Asset Category Select in Registration Modal
    const assetCatSelect = document.getElementById('asset-category');
    if (assetCatSelect) {
        let modalCatOptions = '';
        state.categories.forEach(cat => {
            modalCatOptions += `<option value="${cat}">${cat}</option>`;
        });
        assetCatSelect.innerHTML = modalCatOptions;
    }

    // Department Selector in Assign Modal
    const assignDeptSelect = document.getElementById('assign-dept');
    if (assignDeptSelect) {
        let deptOptions = '';
        state.departments.forEach(dept => {
            deptOptions += `<option value="${dept}">${dept}</option>`;
        });
        assignDeptSelect.innerHTML = deptOptions;
    }
}

// ================= SETTINGS CONFIG MANAGERS =================
function renderSettingsManagers() {
    if (!state.isAdmin) return;

    // Categories List
    const catList = document.getElementById('settings-categories-list');
    if (catList) {
        catList.innerHTML = '';
        state.categories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'settings-manager-item';
            div.innerHTML = `
                <span>${cat}</span>
                <button class="btn-delete-item" onclick="deleteCategory('${cat}')" title="Delete Category">&times;</button>
            `;
            catList.appendChild(div);
        });
    }

    // Departments List
    const deptList = document.getElementById('settings-depts-list');
    if (deptList) {
        deptList.innerHTML = '';
        state.departments.forEach(dept => {
            const div = document.createElement('div');
            div.className = 'settings-manager-item';
            div.innerHTML = `
                <span>${dept}</span>
                <button class="btn-delete-item" onclick="deleteDepartment('${dept}')" title="Delete Department">&times;</button>
            `;
            deptList.appendChild(div);
        });
    }
}

window.deleteCategory = function(catName) {
    const isUsed = state.assets.some(a => a.category === catName);
    if (isUsed) {
        alert(`Cannot delete category "${catName}" because it is currently assigned to assets in inventory.`);
        return;
    }

    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
        state.categories = state.categories.filter(c => c !== catName);
        saveState();
        populateCategoriesAndDepartments();
        renderSettingsManagers();
        logTransaction(
            'Status Change',
            'CONFIG',
            'Category Removed',
            `Category "${catName}" removed from system configurations.`
        );
    }
};

window.deleteDepartment = function(deptName) {
    const isUsed = state.assets.some(a => a.department === deptName);
    if (isUsed) {
        alert(`Cannot delete department "${deptName}" because it is currently linked to active asset assignments.`);
        return;
    }

    if (confirm(`Are you sure you want to delete department "${deptName}"?`)) {
        state.departments = state.departments.filter(d => d !== deptName);
        saveState();
        populateCategoriesAndDepartments();
        renderSettingsManagers();
        logTransaction(
            'Status Change',
            'CONFIG',
            'Department Removed',
            `Department "${deptName}" removed from company directory configs.`
        );
    }
};

function handleCategoryAdd(e) {
    e.preventDefault();
    const input = document.getElementById('new-category-input');
    const newCat = input.value.trim();
    if (!newCat) return;

    if (state.categories.some(c => c.toLowerCase() === newCat.toLowerCase())) {
        alert("This category already exists.");
        return;
    }

    state.categories.push(newCat);
    saveState();
    input.value = '';
    populateCategoriesAndDepartments();
    renderSettingsManagers();
    logTransaction(
        'Status Change',
        'CONFIG',
        'Category Added',
        `Category "${newCat}" added to inventory catalog configuration.`
    );
}

function handleDeptAdd(e) {
    e.preventDefault();
    const input = document.getElementById('new-dept-input');
    const newDept = input.value.trim();
    if (!newDept) return;

    if (state.departments.some(d => d.toLowerCase() === newDept.toLowerCase())) {
        alert("This department already exists.");
        return;
    }

    state.departments.push(newDept);
    saveState();
    input.value = '';
    populateCategoriesAndDepartments();
    renderSettingsManagers();
    logTransaction(
        'Status Change',
        'CONFIG',
        'Department Added',
        `Department "${newDept}" registered into corporate departments directory.`
    );
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
                <span class="timeline-date">${dateStr}</span>
                <span class="timeline-text">${item.details}</span>
                <span class="timeline-operator">Operator: ${item.operator}</span>
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
            alert("This completed record has already been edited once and cannot be modified again.");
            return;
        }
        log.completedEdits = (log.completedEdits || 0) + 1;
    }

    log.status = newStatus;
    
    const asset = state.assets.find(a => a.id === log.assetId);
    if (asset) {
        logTransaction(
            'Maintenance',
            asset.tag,
            asset.name,
            `Hardware upgrade/repair status updated: "${log.partReplaced}" changed to [${newStatus}].`
        );
        if (newStatus === 'Completed') {
            const activeLogs = state.maintenance.filter(m => m.assetId === asset.id && m.status !== 'Completed');
            if (activeLogs.length === 0) {
                if (confirm(`Maintenance item marked Completed. Would you like to release asset "${asset.name}" back to "Available" stock?`)) {
                    asset.status = 'Available';
                    logTransaction(
                        'Status Change',
                        asset.tag,
                        asset.name,
                        `Asset released from maintenance pipeline. Status updated to Available.`
                    );
                }
            }
        } else {
            asset.status = 'Maintenance';
        }
    }

    saveState();
    renderAll();
    
    if (asset) {
        openDrawer(asset.id);
    }
};

// ================= MODAL TAB CONTROLLER =================
function switchModalTab(tabId) {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-modal-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.modal-tab-content').forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Duplicate handlePasswordChange removed.

// ================= ROBUST INVOICE FILE OPENER =================
window.openInvoice = function(invoiceBase64, assetTag) {
    if (!invoiceBase64) return;
    
    try {
        const parts = invoiceBase64.split(',');
        if (parts.length < 2) return;
        
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
        
        // Convert Base64 to Blob binary format
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Generate Blob object URL
        const fileURL = URL.createObjectURL(blob);
        
        let extension = 'pdf';
        if (mimeType.includes('png')) extension = 'png';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('svg')) extension = 'svg';

        // Attempt to view in a new browser tab/window
        const newWindow = window.open(fileURL, '_blank');
        if (!newWindow) {
            // Fallback download trigger if popup blocker intervenes
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = `IMS_Invoice_${assetTag}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (err) {
        console.error("Error opening invoice:", err);
        alert("Failed to parse invoice file. Please try re-uploading.");
    }
};

// ================= CLOUD SYNC ENGINE =================

// Helper to update sync status badge
function showSyncStatus(status, text) {
    const badge = DOM.syncStatusBadge;
    if (!badge) return;
    
    badge.textContent = text;
    badge.className = 'sync-badge'; // reset
    
    if (status === 'active' || status === 'success') {
        badge.classList.add('sync-active');
    } else if (status === 'syncing' || status === 'pending') {
        badge.classList.add('sync-pending');
    } else if (status === 'error' || status === 'warning') {
        badge.classList.add('sync-error');
    } else {
        badge.classList.add('sync-disabled');
    }

    // Hide LOCAL VIEW badge when in admin view
    if (status === 'disabled' && state.isAdmin) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'inline-flex';
    }
}

// ================= NEON POSTGRESQL CLOUD SYNC =================
let neonSyncDebounce = null;
function triggerNeonCloudSync() {
    if (!window.IMS_NEON_ACTIVE) return;
    clearTimeout(neonSyncDebounce);
    neonSyncDebounce = setTimeout(() => {
        fetch('/api/db/sync-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assets: state.assets,
                vendors: state.vendors,
                employees: state.employees,
                maintenance: state.maintenance,
                transactions: state.transactions,
                categories: state.categories,
                departments: state.departments
            })
        }).then(res => res.json())
          .then(data => {
              if (data && data.success) {
                  showSyncStatus("success", "NEON CLOUD SYNCED");
              }
          }).catch(err => {
              console.warn('[Neon Sync] Cloud sync warning:', err);
          });
    }, 400);
}

async function checkNeonCloudOnStartup() {
    try {
        const res = await fetch('/api/db/status');
        const status = await res.json();
        if (status && status.connected && status.mode === 'neon-postgresql') {
            window.IMS_NEON_ACTIVE = true;
            console.log('[Neon PostgreSQL] Connected to Neon Cloud Database!');
            showSyncStatus("success", "NEON CLOUD SYNCED");

            const stateRes = await fetch('/api/db/state');
            const stateData = await stateRes.json();
            if (stateData && stateData.success && stateData.data && stateData.data.assets && stateData.data.assets.length > 0) {
                state.assets = stateData.data.assets;
                if (stateData.data.vendors) state.vendors = stateData.data.vendors;
                if (stateData.data.employees) state.employees = stateData.data.employees;
                if (stateData.data.maintenance) state.maintenance = stateData.data.maintenance;
                if (stateData.data.transactions) state.transactions = stateData.data.transactions;
                if (stateData.data.categories) state.categories = stateData.data.categories;
                if (stateData.data.departments) state.departments = stateData.data.departments;
                saveStateLocally();
                renderAll();
                console.log(`[Neon PostgreSQL] Successfully synchronized ${state.assets.length} assets from Neon!`);
            }
        }
    } catch (e) {
        // Local mode or offline
    }
}

// Background Cloud Sync Push (Legacy KVDB)
function triggerCloudSyncPush() {
    if (state.syncEnabled && state.syncBucketId) {
        showSyncStatus("syncing", "Syncing...");
        
        fetch(`https://kvdb.io/${state.syncBucketId}/ims_db`, {
            method: 'POST',
            body: JSON.stringify({
                assets: state.assets,
                vendors: state.vendors,
                employees: state.employees,
                maintenance: state.maintenance,
                transactions: state.transactions,
                categories: state.categories,
                departments: state.departments,
                adminPassword: state.adminPassword,
                staffPassword: state.staffPassword
            }),
            headers: {
                'Content-Type': 'text/plain'
            }
        })
        .then(res => {
            if (!res.ok) throw new Error("Push failed");
            showSyncStatus("success", "CLOUD SYNCED");
        })
        .catch(err => {
            console.error("Cloud push failed:", err);
            showSyncStatus("warning", "OFFLINE (SAVE LOCAL)");
        });
    }
}

// Check Cloud Sync Status on Startup
function checkCloudSyncOnStartup() {
    if (state.syncEnabled && state.syncBucketId) {
        showSyncStatus("syncing", "CONNECTING...");
        
        fetch(`https://kvdb.io/${state.syncBucketId}/ims_db`)
            .then(res => {
                if (res.status === 404) {
                    // Key not found on cloud yet, push local state
                    triggerCloudSyncPush();
                    return null;
                }
                if (!res.ok) throw new Error("Sync download failed");
                return res.json();
            })
            .then(cloudState => {
                if (cloudState && Array.isArray(cloudState.assets)) {
                    state.assets = cloudState.assets;
                    state.vendors = cloudState.vendors || [];
                    state.employees = cloudState.employees || [];
                    state.maintenance = cloudState.maintenance || [];
                    state.transactions = cloudState.transactions || [];
                    state.categories = cloudState.categories || state.categories;
                    state.departments = cloudState.departments || state.departments;
                    state.adminPassword = cloudState.adminPassword || state.adminPassword;
                    state.staffPassword = cloudState.staffPassword || state.staffPassword;
                    
                    saveStateLocally(); // Cache downloaded version locally
                    renderAll();
                    showSyncStatus("success", "CLOUD CONNECTED");
                }
            })
            .catch(err => {
                console.error("Cloud startup sync failed. Using local storage cache:", err);
                showSyncStatus("warning", "OFFLINE MODE");
            });
    } else {
        showSyncStatus("disabled", "LOCAL VIEW");
    }
    renderSettingsSyncUI();
}

// Generate a random Bucket ID from kvdb.io
function generateSyncToken() {
    const email = prompt("To generate a Cloud Sync Token, KVDB.io requires a contact email address for bucket recovery.\n\nPlease enter a valid email address:");
    if (!email) {
        showSyncStatus("disabled", "LOCAL VIEW");
        return;
    }
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
        alert("Please enter a valid email address.");
        showSyncStatus("disabled", "LOCAL VIEW");
        return;
    }

    showSyncStatus("pending", "Generating Token...");
    
    // First attempt: try using our local Express server endpoint (bypasses browser CORS policy)
    fetch('/api/generate-sync-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: trimmedEmail })
    })
    .then(res => {
        if (!res.ok) throw new Error("Local server endpoint not available or returned error status");
        return res.json();
    })
    .then(data => {
        if (!data.token) throw new Error("No token returned from server endpoint");
        handleNewSyncToken(data.token);
    })
    .catch(err => {
        console.log("Local server generate-sync-token endpoint failed or not available. Trying direct browser fallback...", err);
        
        // Second attempt: direct fetch from browser (might fail due to CORS on static hosts like Netlify)
        fetch('https://kvdb.io/', {
            method: 'POST',
            body: 'email=' + encodeURIComponent(trimmedEmail),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(res => {
            if (!res.ok) throw new Error("Could not create bucket directly from browser");
            return res.text();
        })
        .then(bucketId => {
            handleNewSyncToken(bucketId.trim());
        })
        .catch(browserErr => {
            console.error("Direct browser token generation failed:", browserErr);
            showSyncStatus("error", "Generation Failed");
            
            // Fallback instruction popup for users on static hosting (like Netlify)
            const curlCommand = `curl -d "email=${trimmedEmail}" https://kvdb.io/`;
            alert(
                "⚠️ Browser CORS Policy Blocked Direct Generation\n\n" +
                "Because this is a static website (like Netlify), browser security policies block direct token generation.\n\n" +
                "TO GENERATE A SYNC TOKEN:\n" +
                "1. Open your Terminal (Mac/Linux) or Command Prompt (Windows).\n" +
                "2. Paste and run the command: " + curlCommand + "\n" +
                "3. Press Enter. It will print a 14-to-20 character code (e.g. 4tU6Ryp2x2aP91mYtTfKzn).\n" +
                "4. Copy ONLY that code, paste it here, and click 'Connect & Sync'.\n\n" +
                "We will now copy the curl command to your clipboard. Please paste it in your terminal!"
            );
            
            navigator.clipboard.writeText(curlCommand)
                .then(() => alert("Command copied! Open your terminal/command prompt, paste it (Ctrl+V or Right-Click), press Enter, and copy the resulting alphanumeric code."))
                .catch(() => alert("Failed to copy automatically. Please copy this command manually: " + curlCommand));
        });
    });
}

// Helper to handle and save a newly generated sync token
function handleNewSyncToken(bucketId) {
    state.syncBucketId = bucketId;
    state.syncEnabled = true;
    
    localStorage.setItem('ims_sync_bucket_id', bucketId);
    localStorage.setItem('ims_sync_enabled', 'true');
    
    DOM.syncTokenInput.value = bucketId;
    
    showSyncStatus("success", "Token Generated!");
    renderSettingsSyncUI();
    
    // Push initial state to the new bucket
    triggerCloudSyncPush();
    
    alert(`Cloud Sync Token Connected: \n\n${bucketId}\n\nCopy this token and use it to connect from other devices!`);
}

// Connect to an existing Sync Token
function connectCloudSync() {
    const token = DOM.syncTokenInput.value.trim();
    if (!token) {
        alert("Please enter or paste a valid Sync Token.");
        return;
    }

    // Validate token format (must be alphanumeric, no spaces, no slashes, not containing "curl" or "http")
    const isAlphanumeric = /^[a-zA-Z0-9_-]+$/.test(token);
    if (!isAlphanumeric || token.toLowerCase().includes("curl") || token.toLowerCase().includes("http")) {
        alert(
            "❌ Invalid Sync Token Format!\n\n" +
            "A valid Sync Token should be a single alphanumeric code (for example: 4tU6Ryp2x2aP91mYtTfKzn).\n\n" +
            "Please make sure:\n" +
            "1. You did not paste the 'curl' command itself.\n" +
            "2. There are no spaces, slashes, or special characters."
        );
        showSyncStatus("disabled", "LOCAL VIEW");
        return;
    }

    showSyncStatus("pending", "Connecting & Syncing...");
    
    // Attempt to download existing data
    fetch(`https://kvdb.io/${token}/ims_db`)
        .then(res => {
            if (res.status === 404) {
                // Token is fresh, create key by pushing local data
                state.syncBucketId = token;
                state.syncEnabled = true;
                localStorage.setItem('ims_sync_bucket_id', token);
                localStorage.setItem('ims_sync_enabled', 'true');
                triggerCloudSyncPush();
                renderSettingsSyncUI();
                alert(`Connected to fresh cloud token. Local inventory pushed to cloud.`);
                return null;
            }
            if (!res.ok) throw new Error("Connection failed");
            return res.json();
        })
        .then(cloudState => {
            if (cloudState) {
                state.syncBucketId = token;
                state.syncEnabled = true;
                
                localStorage.setItem('ims_sync_bucket_id', token);
                localStorage.setItem('ims_sync_enabled', 'true');
                
                state.assets = cloudState.assets || [];
                state.vendors = cloudState.vendors || [];
                state.employees = cloudState.employees || [];
                state.maintenance = cloudState.maintenance || [];
                state.transactions = cloudState.transactions || [];
                state.categories = cloudState.categories || state.categories;
                state.departments = cloudState.departments || state.departments;
                state.adminPassword = cloudState.adminPassword || state.adminPassword;
                state.staffPassword = cloudState.staffPassword || state.staffPassword;
                
                saveStateLocally();
                renderAll();
                
                showSyncStatus("success", "CLOUD CONNECTED");
                renderSettingsSyncUI();
                alert("Connected successfully! Cloud inventory loaded.");
            }
        })
        .catch(err => {
            console.error(err);
            showSyncStatus("error", "Connection Failed");
            alert("Failed to connect to this Sync Token. Make sure the token is correct and your computer is online.");
        });
}

// Disconnect Sync
function disconnectCloudSync() {
    if (confirm("Are you sure you want to disconnect from Cloud Sync? This will return the application to Local Storage Mode.")) {
        state.syncEnabled = false;
        state.syncBucketId = "";
        
        localStorage.setItem('ims_sync_enabled', 'false');
        localStorage.removeItem('ims_sync_bucket_id');
        
        DOM.syncTokenInput.value = "";
        
        showSyncStatus("disabled", "LOCAL VIEW");
        renderSettingsSyncUI();
        
        alert("Cloud Sync disconnected. The application is now running in local-only mode.");
    }
}

// Clipboard copy helper
function copySyncTokenToClipboard() {
    const token = DOM.syncTokenInput.value.trim();
    if (!token) {
        alert("No Sync Token found to copy.");
        return;
    }
    navigator.clipboard.writeText(token)
        .then(() => alert("Sync Token copied to clipboard!"))
        .catch(() => alert("Failed to copy. Please select and copy manually."));
}

function renderSettingsSyncUI() {
    if (!state.isAdmin) return;
    
    const input = DOM.syncTokenInput;
    if (!input) return;

    if (state.syncEnabled && state.syncBucketId) {
        input.value = state.syncBucketId;
        input.readOnly = true;
        
        DOM.btnGenerateSyncToken.style.display = 'none';
        DOM.btnConnectSync.style.display = 'none';
        DOM.btnDisconnectSync.style.display = 'inline-flex';
    } else {
        input.value = state.syncBucketId; // Show existing key if any
        input.readOnly = false;
        
        DOM.btnGenerateSyncToken.style.display = 'inline-flex';
        DOM.btnConnectSync.style.display = 'inline-flex';
        DOM.btnDisconnectSync.style.display = 'none';
    }
}

// Connect Cloud Sync directly from the Login page gateway
function handleLoginSyncConnect() {
    const token = DOM.loginSyncToken.value.trim();
    if (!token) {
        alert("Please enter or paste a valid Sync Token.");
        return;
    }

    const isAlphanumeric = /^[a-zA-Z0-9_-]+$/.test(token);
    if (!isAlphanumeric || token.toLowerCase().includes("curl") || token.toLowerCase().includes("http")) {
        alert(
            "❌ Invalid Sync Token Format!\n\n" +
            "A valid Sync Token should be a single alphanumeric code (for example: 4tU6Ryp2x2aP91mYtTfKzn).\n\n" +
            "Please make sure:\n" +
            "1. You did not paste the 'curl' command itself.\n" +
            "2. There are no spaces, slashes, or special characters."
        );
        return;
    }

    DOM.btnLoginConnectSync.disabled = true;
    DOM.btnLoginConnectSync.textContent = "Connecting...";

    fetch(`https://kvdb.io/${token}/ims_db`)
        .then(res => {
            if (res.status === 404) {
                // Fresh token, load local empty state but with this bucket ID set, so when they login and change things it pushes
                state.syncBucketId = token;
                state.syncEnabled = true;
                localStorage.setItem('ims_sync_bucket_id', token);
                localStorage.setItem('ims_sync_enabled', 'true');
                triggerCloudSyncPush();
                alert(`Connected to fresh cloud token. Local inventory pushed to cloud.`);
                return null;
            }
            if (!res.ok) throw new Error("Connection failed");
            return res.json();
        })
        .then(cloudState => {
            if (cloudState) {
                state.syncBucketId = token;
                state.syncEnabled = true;
                
                localStorage.setItem('ims_sync_bucket_id', token);
                localStorage.setItem('ims_sync_enabled', 'true');
                
                state.assets = cloudState.assets || [];
                state.vendors = cloudState.vendors || [];
                state.employees = cloudState.employees || [];
                state.maintenance = cloudState.maintenance || [];
                state.transactions = cloudState.transactions || [];
                state.categories = cloudState.categories || state.categories;
                state.departments = cloudState.departments || state.departments;
                state.adminPassword = cloudState.adminPassword || state.adminPassword;
                state.staffPassword = cloudState.staffPassword || state.staffPassword;
                
                saveStateLocally();
                renderAll();
                
                // Pre-populate Settings Tab elements
                if (DOM.syncTokenInput) {
                    DOM.syncTokenInput.value = token;
                }
                
                alert("Connected successfully! Cloud database loaded. You can now log in using your synced credentials.");
                DOM.loginSyncContainer.style.display = 'none';
            }
        })
        .catch(err => {
            console.error(err);
            alert("Failed to connect to this Sync Token. Make sure the token is correct and your computer is online.");
        })
        .finally(() => {
            DOM.btnLoginConnectSync.disabled = false;
            DOM.btnLoginConnectSync.textContent = "Connect & Load Database";
        });
}
