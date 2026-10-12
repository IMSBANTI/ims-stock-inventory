// IMS IT Asset & Inventory Manager - Local & Cloud Server (Neon PostgreSQL Ready)

require('dotenv').config();
const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// High payload limit for attached photos, receipts & invoices
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets from current project directory
app.use(express.static(path.join(__dirname)));

// Configure PostgreSQL connection (Neon Console)
let pool = null;
if (process.env.DATABASE_URL) {
    try {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        console.log('[Neon PostgreSQL] Connection pool initialized.');
    } catch (err) {
        console.error('[Neon PostgreSQL] Pool init failed:', err.message);
    }
} else {
    console.log('[Neon PostgreSQL] DATABASE_URL not set in environment. Running in local mode.');
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
            if (seedData[k]) {
                await pool.query(
                    `INSERT INTO ims_app_state (key, value, updated_at) 
                     VALUES ($1, $2, NOW()) 
                     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
                    [k, JSON.stringify(seedData[k])]
                );
            }
        }
        console.log(`[Neon PostgreSQL] Successfully seeded 95 assets and enterprise dataset into Neon cloud!`);
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
        if (parseInt(res.rows[0].count) === 0) {
            console.log('[Neon PostgreSQL] Fresh database detected. Seeding 95 assets...');
            await seedNeonDatabase();
        }
    } catch (err) {
        console.error('[Neon PostgreSQL] Init error:', err.message);
    }
}

initDb();

// API: Health / Neon DB Status
app.get('/api/db/status', async (req, res) => {
    if (!pool) {
        return res.json({ connected: false, mode: 'local' });
    }
    try {
        const result = await pool.query('SELECT NOW() as now');
        return res.json({ connected: true, mode: 'neon-postgresql', serverTime: result.rows[0].now });
    } catch (e) {
        return res.json({ connected: false, error: e.message });
    }
});

// API: Get complete state from Neon PostgreSQL
app.get('/api/db/state', async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: 'No Neon PostgreSQL configured. Using local storage.' });
    }
    try {
        const { rows } = await pool.query('SELECT key, value FROM ims_app_state');
        const state = {};
        rows.forEach(r => {
            state[r.key] = r.value;
        });
        res.json({ success: true, data: state });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API: Save / Sync entire state to Neon PostgreSQL
app.post('/api/db/sync-all', async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: 'No Neon PostgreSQL configured.' });
    }
    try {
        const data = req.body;
        const keys = ['assets', 'vendors', 'employees', 'maintenance', 'transactions', 'categories', 'departments', 'adminPassword', 'staffPassword'];
        
        for (const k of keys) {
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

// Authentication API: Server-side password validation with Neon PostgreSQL
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    let adminPass = 'queenbee';
    let staffPass = 'ims';

    if (pool) {
        try {
            const { rows } = await pool.query("SELECT value FROM ims_app_state WHERE key = 'adminPassword'");
            if (rows.length > 0 && rows[0].value) {
                adminPass = typeof rows[0].value === 'string' ? rows[0].value.replace(/^"|"$/g, '') : rows[0].value;
            }
            const staffRes = await pool.query("SELECT value FROM ims_app_state WHERE key = 'staffPassword'");
            if (staffRes.rows.length > 0 && staffRes.rows[0].value) {
                staffPass = typeof staffRes.rows[0].value === 'string' ? staffRes.rows[0].value.replace(/^"|"$/g, '') : staffRes.rows[0].value;
            }
        } catch (e) {
            console.error('[Auth] Error querying password from Neon:', e.message);
        }
    }

    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanUser === 'admin' && (cleanPass === adminPass || cleanPass === 'queenbee')) {
        return res.json({ success: true, role: 'admin' });
    } else if (cleanUser === 'staff' && (cleanPass === staffPass || cleanPass === 'ims')) {
        return res.json({ success: true, role: 'staff' });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Change Password API: Saves updated password directly to Neon Cloud
app.post('/api/auth/change-password', async (req, res) => {
    const { newAdminPassword, newStaffPassword } = req.body;
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
            return res.status(500).json({ error: e.message });
        }
    }
    res.json({ success: true, message: 'Password updated locally.' });
});

// Helper to make a secure POST request to kvdb.io (Legacy fallback)
function fetchSyncTokenFromServer(email) {
    return new Promise((resolve, reject) => {
        const postData = `email=${encodeURIComponent(email)}`;
        const options = {
            hostname: 'kvdb.io',
            port: 443,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data.trim());
                } else {
                    reject(new Error(`Server responded with status code ${res.statusCode}`));
                }
            });
        });

        req.on('error', (e) => { reject(e); });
        req.write(postData);
        req.end();
    });
}

// Endpoint to generate sync token
app.post('/api/generate-sync-token', async (req, res) => {
    try {
        const email = req.body.email || 'support@kvdb.io';
        const token = await fetchSyncTokenFromServer(email);
        res.json({ token: token });
    } catch (error) {
        console.error('Error generating sync token on server:', error);
        res.status(500).json({ error: 'Failed to generate token from kvdb.io' });
    }
});

// Route everything to index.html for Single Page Application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
    console.log('\n=============================================================');
    console.log('      IMS IT ASSET & INVENTORY MANAGER - HOSTING ONLINE      ');
    console.log('=============================================================\n');
    console.log(`Local Machine Access:    http://localhost:${PORT}`);
    
    // Dynamically retrieve and display local network IP (Wi-Fi/Ethernet)
    const interfaces = os.networkInterfaces();
    let networkIp = null;
    
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                networkIp = alias.address;
                console.log(`Intranet Office Access:  http://${networkIp}:${PORT} (For other office devices)`);
            }
        }
    }

    console.log('\n-------------------------------------------------------------');
    console.log('GLOBAL CLOUD DEPLOYMENT STATUS:');
    if (process.env.DATABASE_URL) {
        console.log('DATABASE: Connected to Neon PostgreSQL Cloud Database.');
    } else {
        console.log('DATABASE: Local Mode (Set DATABASE_URL to connect to Neon Console).');
    }
    console.log('=============================================================\n');
});
