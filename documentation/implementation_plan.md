# Add Total Monthly Costing for Upgrades and Repairs on Dashboard

The user requested to see the total costing per month on hardware upgrades & replacements directly on the dashboard. We will implement a toggle tab at the top of the **Hardware Upgrade & Replacement** card to switch between the detailed logs timeline view and a monthly costing breakdown view.

## Proposed Changes

---

### Dashboard Markup

#### [MODIFY] [index.html](file:///C:/Users/ABIR/.gemini/antigravity/scratch/stock-inventory-app/index.html)

- **Card Header**: Add tab buttons (`#btn-maint-tab-logs` and `#btn-maint-tab-cost`) to the title bar of the **Hardware Upgrade & Replacement Logs** card.
- **Card Body**:
  - Keep `#dashboard-maint-container` for rendering detailed logs.
  - Add a new container `#dashboard-maint-cost-container` (hidden by default) for rendering the monthly cost breakdown list.

---

### Core Application Logic

#### [MODIFY] [app.js](file:///C:/Users/ABIR/.gemini/antigravity/scratch/stock-inventory-app/app.js)

- **Global Config**: Define a global state variable `activeMaintTab = 'logs'` to track the active view tab.
- **DOM References**: Bind the new tab buttons and container element mappings.
- **setupEventListeners**: Bind click listeners to handle switching between the logs tab and monthly costing tab.
- **`switchMaintTab(tab)`**: Create a function to toggle tab button styling, show/hide the appropriate list containers, toggle the logs page navigation controls, and trigger the correct render function.
- **`renderDashboardMonthlyCost()`**:
  - Create this function to aggregate cost from `state.maintenance` logs by month (e.g., "June 2026", "May 2025").
  - Order the months chronologically descending (newest first).
  - Calculate and display a premium centered **Total Hardware Costing** grand summary block.
  - Render each month's total cost in an elegant list format.
- **`renderAll()`**: Conditionally call `renderDashboardMaintenanceLogs()` or `renderDashboardMonthlyCost()` based on `activeMaintTab`.

---

## Verification Plan

### Manual Verification
1. Open the application and navigate to the **Dashboard** page.
2. Confirm the **Hardware Upgrade & Replacement** card now has **Logs** and **Monthly Cost** tab buttons in the header.
3. Click the **Monthly Cost** button and verify that:
   - The card switches to display a centered grand total cost (e.g., sum of all repairs).
   - Below the grand total, it lists aggregated monthly costs (e.g., `June 2026: $110.00`, `May 2025: $135.00`, `February 2025: $65.00`) sorted with newest months first.
   - The pagination prev/next controls at the bottom of the card are hidden when this tab is active.
4. Click the **Logs** button and verify the card switches back to the detailed timeline logs list with page controls visible.
5. Go to the **Inventory Grid**, inspect an asset, and log a new upgrade with a cost of `$200.00` on a specific date (e.g., a new month). Switch to the **Monthly Cost** tab on the dashboard and verify that the month's total and the grand total are updated instantly.
