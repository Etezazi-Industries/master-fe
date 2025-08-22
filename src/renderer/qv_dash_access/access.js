// ----- Dummy data -----
const users = ["Alice Johnson", "Bob Smith", "Carlos Diaz", "Dev Patel", "Emma Williams", "Fatima Noor", "Grace Lee", "Henry Zhao", "Isha Kapoor"];
const dashboards = ["Sales Dashboard", "Ops Dashboard", "Finance Overview", "Executive Summary", "Manufacturing KPIs", "NPI Readout"];
const quickViews = ["Inventory Snapshot", "AR Aging", "AP Aging", "Weekly KPIs", "Supplier Scorecard", "Late Orders", "Open Quotes"];

// Map<User, {dashboards:Set, quickViews:Set}>
const accessMap = new Map([
    ["Alice Johnson", { dashboards: new Set(["Sales Dashboard"]), quickViews: new Set(["Weekly KPIs"]) }],
    ["Bob Smith", { dashboards: new Set([]), quickViews: new Set(["Inventory Snapshot"]) }],
    ["Carlos Diaz", { dashboards: new Set([]), quickViews: new Set([]) }],
    ["Dev Patel", { dashboards: new Set([]), quickViews: new Set(["AR Aging", "AP Aging"]) }],
    ["Emma Williams", { dashboards: new Set(["Executive Summary"]), quickViews: new Set([]) }],
    ["Fatima Noor", { dashboards: new Set([]), quickViews: new Set([]) }],
    ["Grace Lee", { dashboards: new Set(["Finance Overview"]), quickViews: new Set(["Supplier Scorecard"]) }],
    ["Henry Zhao", { dashboards: new Set(["Ops Dashboard"]), quickViews: new Set(["Late Orders"]) }],
    ["Isha Kapoor", { dashboards: new Set([]), quickViews: new Set(["Open Quotes"]) }],
]);

// ----- DOM -----
const usersEl = document.getElementById("users");
const accessedQVEl = document.getElementById("accessedQuickViews");
const accessedDBEl = document.getElementById("accessedDashboards");

const searchUsersEl = document.getElementById("searchUsers");
const searchAccessedQVEl = document.getElementById("searchAccessedQV");
const searchAccessedDBEl = document.getElementById("searchAccessedDB");

const dashboardsList = document.getElementById("dashboardsList");
const quickViewsList = document.getElementById("quickViewsList");
const btnRemove = document.getElementById("btnRemove");
const confirmAddBtn = document.getElementById("confirmAdd");

// Helpers
const selectedValues = (sel) => Array.from(sel.selectedOptions).map(o => o.value);
const unique = (arr) => Array.from(new Set(arr));
const includesInsensitive = (str, q) => str.toLowerCase().includes(q.trim().toLowerCase());

function fillSelect(select, items, keepSelected = true) {
    const prevSelected = new Set(keepSelected ? selectedValues(select) : []);
    select.innerHTML = items.map(v => `<option${prevSelected.has(v) ? ' selected' : ''}>${v}</option>`).join("");
}

function checkboxList(container, items, name) {
    container.innerHTML = items.map((v, i) => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${v}" id="${name}-${i}">
        <label class="form-check-label" for="${name}-${i}">${v}</label>
      </div>`).join("");
}

function getCheckedValues(container) {
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
}

// Union of selected users' access, split by type
function getAccessUnionForSelectedUsers() {
    const selUsers = selectedValues(usersEl);
    const union = { dashboards: new Set(), quickViews: new Set() };
    selUsers.forEach(u => {
        const rec = accessMap.get(u);
        if (!rec) return;
        rec.dashboards.forEach(d => union.dashboards.add(d));
        rec.quickViews.forEach(q => union.quickViews.add(q));
    });
    return union;
}

// Renderers with search filters
function renderUsers() {
    const q = searchUsersEl.value || "";
    const data = q ? users.filter(u => includesInsensitive(u, q)) : users.slice();
    fillSelect(usersEl, data, true);
}

function renderAccessed() {
    const union = getAccessUnionForSelectedUsers();

    const qQV = (searchAccessedQVEl.value || "");
    const qDB = (searchAccessedDBEl.value || "");

    const qvList = Array.from(union.quickViews).sort();
    const dbList = Array.from(union.dashboards).sort();

    const filteredQV = qQV ? qvList.filter(v => includesInsensitive(v, qQV)) : qvList;
    const filteredDB = qDB ? dbList.filter(v => includesInsensitive(v, qDB)) : dbList;

    fillSelect(accessedQVEl, filteredQV, true);
    fillSelect(accessedDBEl, filteredDB, true);
}

// Remove selected items from either accessed pane
btnRemove.addEventListener("click", () => {
    const selUsers = selectedValues(usersEl);
    const selQV = selectedValues(accessedQVEl);
    const selDB = selectedValues(accessedDBEl);
    if (!selUsers.length || (!selQV.length && !selDB.length)) return;

    selUsers.forEach(u => {
        const rec = accessMap.get(u) || { dashboards: new Set(), quickViews: new Set() };
        selQV.forEach(q => rec.quickViews.delete(q));
        selDB.forEach(d => rec.dashboards.delete(d));
        accessMap.set(u, rec);
    });
    renderAccessed();
});

// Modal: Add selections
confirmAddBtn.addEventListener("click", () => {
    const selUsers = selectedValues(usersEl);
    const selDash = getCheckedValues(dashboardsList);
    const selQuick = getCheckedValues(quickViewsList);
    if (!selUsers.length || (selDash.length + selQuick.length === 0)) return;

    selUsers.forEach(u => {
        const rec = accessMap.get(u) || { dashboards: new Set(), quickViews: new Set() };
        selDash.forEach(d => rec.dashboards.add(d));
        selQuick.forEach(q => rec.quickViews.add(q));
        accessMap.set(u, rec);
    });

    // Clear checks
    dashboardsList.querySelectorAll('input').forEach(c => c.checked = false);
    quickViewsList.querySelectorAll('input').forEach(c => c.checked = false);

    // Close modal and refresh
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
    renderAccessed();
});

// Events: search + selection
searchUsersEl.addEventListener("input", () => {
    renderUsers();
    // keep same previously selected users if they still match; accessed updates on change
    renderAccessed();
});

searchAccessedQVEl.addEventListener("input", renderAccessed);
searchAccessedDBEl.addEventListener("input", renderAccessed);

usersEl.addEventListener("change", renderAccessed);

// Init
fillSelect(usersEl, users, false);
checkboxList(dashboardsList, dashboards, "dash");
checkboxList(quickViewsList, quickViews, "qv");

if (usersEl.options.length) usersEl.options[0].selected = true;
renderAccessed();

