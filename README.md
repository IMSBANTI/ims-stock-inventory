# IMS IT Asset & Inventory Manager (AuraStock for IMS)

Welcome to the **IMS IT Asset & Inventory Manager**, a professional-grade Single Page Application (SPA) designed to manage the office inventory of computers, laptops, accessories, and spare parts. This solution offers real-time deployment status, hardware maintenance histories (parts changed/upgraded), and detailed vendor directories.

## Core Features

- **Dynamic Operations Dashboard**: Real-time business intelligence showcasing deploy rate, active computer counts, device maintenance logs, and upcoming warranty expirations. Elegant visualizations are supported by Chart.js.
- **Structured Asset Inventory Grid**: Detailed records tracking name, SKU, type, model, serial number, and specifications. Fully filterable by category, deployment status, and vendor.
- **Personnel Assignment Controls**: Easily assign workstations and accessories to employees with automatic status transitions (`Available` <-> `Assigned`).
- **Hardware Maintenance Logs (Parts Replaced)**: Log RAM upgrades, SSD replacements, or repairs on specific computers and laptops. Each upgrade tracks the date, part description, cost, and vendor.
- **Integrated Vendor Database**: Store supplier details, and critical **Mobile Numbers**, and link them seamlessly to asset purchase and part upgrade logs.
- **Data Safety (Persistence & Portability)**:
  - Synchronizes all changes automatically to the browser's `localStorage`.
  - **CSV Export**: Instantly download your full inventory spreadsheet.
  - **CSV Import**: Seamlessly bulk-upload new inventory.
  - **Demo Seeding Engine**: A single button to preload the app with realistic IMS inventory, assignments, and transaction logs.
- **Premium Aesthetics**: Seamless dark/light theme transitions, modern glassmorphic overlays, responsiveness, and premium typography (`Outfit` + `Inter` from Google Fonts).

## Project Structure

```text
stock-inventory-app/
├── index.html          # Shell layout, tab control, modal forms, and UI shells
├── styles.css          # Theme custom tokens, glassmorphic styling, and animations
├── app.js              # State logic, filters, chart rendering, and LocalStorage handlers
├── demo-data.js        # Realistic prepopulated IMS inventory dataset
└── README.md           # This user manual
```

## Getting Started

Because the application is built using standard, modern web standards (HTML5, Vanilla CSS, Vanilla JS), **no installation or build steps are required**.

### Option A: Open Directly in Browser
You can run the application by double-clicking the `index.html` file or dragging and dropping it into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option B: Run a Lightweight Dev Server (Recommended)
Running a local web server ensures all module structures and dynamic imports function precisely:

* **Using Node.js (`npx`)**:
  ```bash
  npx serve
  ```
* **Using Python**:
  ```bash
  python -m http.server 8000
  ```
Then visit `http://localhost:8000` (or the port specified) in your browser.

## Customizing Your Database

1. Upon first launching the application, click **"Seed Demo Data"** to instantly fill the UI with a beautiful, pre-configured list of laptops (Lenovo ThinkPads, Dell XPS), desktops, employees (assigned workstations), vendors (mobile numbers and names), and previous maintenance logs.
2. Once satisfied with the demo, you can clean the database using the **"Reset Database"** tool to enter your own office information.
