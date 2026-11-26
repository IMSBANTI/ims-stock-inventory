// IMS IT Asset & Inventory Manager - Local & Cloud Server (Neon PostgreSQL Ready)

require('dotenv').config();
const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// High payload limit for attached photos, receipts & invoices
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets from current project directory
app.use(express.static(path.join(__dirname)));

// Deterministic HMAC signing key (persists across Render cold restarts)
const TOKEN_SECRET = process.env.SESSION_SECRET || crypto
    .createHash('sha256')
    .update((process.env.DATABASE_URL || 'ims-local-fallback-secret') + '::ims-auth-v2')
    .digest('hex');

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function createAuthToken(role) {
    const payload = Buffer.from(JSON.stringify({
        role,
        exp: Date.now() + TOKEN_TTL_MS
    })).toString('base64url');
    const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    return `${payload}.${sig}`;
}

function verifyTokenString(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return null;
    }
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!data.role || !data.exp || Date.now() > data.exp) return null;
        return data;
    } catch {
        return null;
    }
}

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const user = verifyTokenString(token);
    if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
    }
    req.user = user;
    next();
}

function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Administrator privileges required.' });
        }
        next();
    });
}

// Configure PostgreSQL connection (Neon Console)
let pool = null;
if (process.env.DATABASE_URL) {
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 15000,
            idleTimeoutMillis: 30000,
            max: 10
        });
        // Prevent Node.js process crash when Neon serverless suspends idle connections
        pool.on('error', (err) => {
            console.warn('[Neon PostgreSQL] Idle client disconnected (will auto-reconnect):', err.message);
        });
        console.log('[Neon PostgreSQL] Connection pool initialized.');
    } catch (err) {
        console.error('[Neon PostgreSQL] Pool init failed:', err.message);
    }
} else {
    console.log('[Neon PostgreSQL] DATABASE_URL not set in environment. Running in local mode.');
}

process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err.message);
});

// Local in-memory password store when running without Neon
let localPasswords = {
    admin: 'queenbee',
    staff: 'ims'
};

// Helper to fetch current passwords from Neon or local fallback
async function getStoredPasswords() {
    let adminPass = localPasswords.admin;
    let staffPass = localPasswords.staff;

    if (pool) {
        try {
            const { rows } = await pool.query(
                "SELECT key, value FROM ims_app_state WHERE key IN ('adminPassword', 'staffPassword')"
            );
            rows.forEach((r) => {
                const val = typeof r.value === 'string' ? r.value.replace(/^"|"$/g, '') : String(r.value);
                if (r.key === 'adminPassword' && val) adminPass = val;
                if (r.key === 'staffPassword' && val) staffPass = val;
            });
        } catch (e) {
            console.error('[Auth] Error querying password from Neon:', e.message);
        }
    }
    return { adminPass, staffPass };
}

// Helper to seed Neon PostgreSQL if empty
async function seedNeonDatabase() {
    if (!pool) return;
    try {
        let seedData = null;
        if (fs.existsSync(path.join(__dirname, 'seed.json'))) {
            seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));
        }
        if (!seedData) return;

        const keys = ['assets', 'vendors', 'employees', 'maintenance', 'transactions', 'categories', 'departments', 'adminPassword', 'staffPassword'];
        for (const k of keys) {
            if (seedData[k] !== undefined) {
                await pool.query(
                    `INSERT INTO ims_app_state (key, value, updated_at)
                     VALUES ($1, $2, NOW())
                     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [k, JSON.stringify(seedData[k])]
                );
            }
        }
        console.log('[Neon PostgreSQL] Successfully seeded production dataset into Neon cloud!');
    } catch (e) {
        console.error('[Neon PostgreSQL] Seeding error:', e.message);
    }
}

// Initialize tables on startup
async function initDb() {
    if (!pool) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ims_app_state (
                key VARCHAR(64) PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('[Neon PostgreSQL] Table "ims_app_state" verified.');

        const res = await pool.query(`SELECT count(*) as count FROM ims_app_state WHERE key = 'assets'`);
        if (parseInt(res.rows[0].count, 10) === 0) {
            console.log('[Neon PostgreSQL] Fresh database detected. Seeding production assets...');
            await seedNeonDatabase();
        }
    } catch (err) {
        console.error('[Neon PostgreSQL] Init error:', err.message);
    }
}

initDb();

// API: Health / Neon DB Status (non-sensitive public status)
app.get('/api/db/status', async (req, res) => {
    if (!pool) {
        return res.json({ connected: false, mode: 'local' });
    }
    try {
        const result = await pool.query('SELECT NOW() as now');
        return res.json({ connected: true, mode: 'neon-postgresql', serverTime: result.rows[0].now });
    } catch (e) {
        return res.json({ connected: false, error: 'Database temporarily unavailable' });
    }
});

// Authentication API: Server-side password validation with signed session token
app.post('/api/auth/login', async (req, res) => {
    const cleanUser = (req.body.username || '').trim().toLowerCase();
    const cleanPass = (req.body.password || '').trim();

    if (!cleanUser || !cleanPass) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const { adminPass, staffPass } = await getStoredPasswords();

    if (cleanUser === 'admin' && cleanPass === adminPass) {
        const token = createAuthToken('admin');
        return res.json({ success: true, role: 'admin', token });
    }
    if (cleanUser === 'staff' && cleanPass === staffPass) {
        const token = createAuthToken('staff');
        return res.json({ success: true, role: 'staff', token });
    }
    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

// Verify active session token
app.get('/api/auth/verify', requireAuth, (req, res) => {
    res.json({ valid: true, role: req.user.role });
});

// Change Password API: Requires Admin token & verifies current Admin password
app.post('/api/auth/change-password', requireAdmin, async (req, res) => {
    const { currentPassword, newAdminPassword, newStaffPassword } = req.body;
    const { adminPass } = await getStoredPasswords();

    if (!currentPassword || currentPassword !== adminPass) {
        return res.status(401).json({ success: false, error: 'Incorrect current Admin password.' });
    }

    if (newAdminPassword && newAdminPassword.length < 4) {
        return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long.' });
    }
    if (newStaffPassword && newStaffPassword.length < 4) {
        return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long.' });
    }

    if (newAdminPassword) localPasswords.admin = newAdminPassword;
    if (newStaffPassword) localPasswords.staff = newStaffPassword;

    if (pool) {
        try {
            if (newAdminPassword) {
                await pool.query(
                    `INSERT INTO ims_app_state (key, value, updated_at)
                     VALUES ('adminPassword', $1, NOW())
                     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [JSON.stringify(newAdminPassword)]
                );
            }
            if (newStaffPassword) {
                await pool.query(
                    `INSERT INTO ims_app_state (key, value, updated_at)
                     VALUES ('staffPassword', $1, NOW())
                     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [JSON.stringify(newStaffPassword)]
                );
            }
            return res.json({ success: true, message: 'Password updated successfully in Neon PostgreSQL cloud!' });
        } catch (e) {
            return res.status(500).json({ success: false, error: e.message });
        }
    }
    return res.json({ success: true, message: 'Password updated locally.' });
});

// API: Get complete state from Neon PostgreSQL (Protected, NEVER leaks passwords)
const ALLOWED_STATE_KEYS = ['assets', 'vendors', 'employees', 'maintenance', 'transactions', 'categories', 'departments'];

app.get('/api/db/state', requireAuth, async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: 'No Neon PostgreSQL configured. Using local storage.' });
    }
    try {
        const { rows } = await pool.query(
            'SELECT key, value FROM ims_app_state WHERE key = ANY($1::text[])',
            [ALLOWED_STATE_KEYS]
        );
        const state = {};
        rows.forEach((r) => {
            state[r.key] = r.value;
        });
        res.json({ success: true, data: state });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Save / Sync entire state to Neon PostgreSQL (Admin only, never overwrites passwords)
app.post('/api/db/sync-all', requireAdmin, async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: 'No Neon PostgreSQL configured.' });
    }
    try {
        const data = req.body || {};
        for (const k of ALLOWED_STATE_KEYS) {
            if (data[k] !== undefined) {
                await pool.query(
                    `INSERT INTO ims_app_state (key, value, updated_at)
                     VALUES ($1, $2, NOW())
                     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [k, JSON.stringify(data[k])]
                );
            }
        }
        res.json({ success: true, message: 'Database saved to Neon PostgreSQL.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Fast healthcheck endpoint for Render
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Route everything to index.html for Single Page Application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening on 0.0.0.0 for cloud compatibility
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=============================================================');
    console.log('      IMS IT ASSET & INVENTORY MANAGER - HOSTING ONLINE      ');
    console.log('=============================================================\n');
    console.log(`Local Machine Access:    http://localhost:${PORT}`);

    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                console.log(`Intranet Office Access:  http://${alias.address}:${PORT} (For other office devices)`);
            }
        }
    }

    console.log('\n-------------------------------------------------------------');
    console.log('GLOBAL CLOUD DEPLOYMENT STATUS:');
    if (process.env.DATABASE_URL) {
        console.log('DATABASE: Connected to Neon PostgreSQL Cloud Database (Token-Protected APIs).');
    } else {
        console.log('DATABASE: Local Mode (Set DATABASE_URL to connect to Neon Console).');
    }
    console.log('=============================================================\n');
});
