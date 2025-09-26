// @ts-check

let currentApp = null;

// Global logout function
function logout() {
    // You can implement your logout logic here
    console.log('Logout clicked');
    // For now, just show an alert
    alert('Logout functionality not implemented yet');
}

// Make logout function available globally
window.logout = logout;

async function loadApp(url, appType = null) {
    const frame = document.getElementById('app-frame');
    const vendorQuotingRoot = document.getElementById('vendor-quoting-root');
    const vacationRoot = document.getElementById('vacation-root');
    const rfqGenRoot = document.getElementById('rfq-gen-root');
    const adminPanelRoot = document.getElementById('admin-panel-root');
    
    // Hide all containers first
    if (frame) frame.style.display = 'none';
    if (vendorQuotingRoot) vendorQuotingRoot.style.display = 'none';
    if (vacationRoot) vacationRoot.style.display = 'none';
    if (rfqGenRoot) rfqGenRoot.style.display = 'none';
    if (adminPanelRoot) adminPanelRoot.style.display = 'none';
    
    // Unmount previous React apps
    if (currentApp === 'vendor-quoting') {
        try {
            const { unmountVendorQuotingApp } = await import('../vendor_quoting/App.js');
            unmountVendorQuotingApp();
        } catch (error) {
            console.error('Failed to unmount vendor quoting app:', error);
        }
    } else if (currentApp === 'vacation') {
        try {
            const { unmountVacationApp } = await import('../vacation/VacationApp.js');
            unmountVacationApp();
        } catch (error) {
            console.error('Failed to unmount vacation app:', error);
        }
    } else if (currentApp === 'rfq-gen') {
        try {
            const { unmountRfqGenApp } = await import('../rfq_gen/main.js');
            unmountRfqGenApp();
        } catch (error) {
            console.error('Failed to unmount RFQ Gen app:', error);
        }
    } else if (currentApp === 'admin-panel') {
        try {
            const { unmountAdminPanel } = await import('../admin_panel/main.js');
            unmountAdminPanel();
        } catch (error) {
            console.error('Failed to unmount Admin Panel app:', error);
        }
    }
    
    if (appType === 'vendor-quoting') {
        // Show and mount vendor quoting React app
        if (vendorQuotingRoot) vendorQuotingRoot.style.display = 'block';
        
        try {
            const { mountVendorQuotingApp } = await import('../vendor_quoting/App.js');
            mountVendorQuotingApp();
            currentApp = 'vendor-quoting';
        } catch (error) {
            console.error('Failed to load vendor quoting app:', error);
        }
    } else if (appType === 'vacation') {
        // Show and mount vacation React app
        if (vacationRoot) vacationRoot.style.display = 'block';
        
        try {
            const { mountVacationApp } = await import('../vacation/VacationApp.js');
            mountVacationApp();
            currentApp = 'vacation';
        } catch (error) {
            console.error('Failed to load vacation app:', error);
        }
    } else if (appType === 'rfq-gen') {
        // Show and mount RFQ Gen React app
        if (rfqGenRoot) rfqGenRoot.style.display = 'block';
        
        try {
            const { mountRfqGenApp } = await import('../rfq_gen/main.js');
            mountRfqGenApp();
            currentApp = 'rfq-gen';
        } catch (error) {
            console.error('Failed to load RFQ Gen app:', error);
        }
    } else if (appType === 'admin-panel') {
        // Show and mount Admin Panel React app
        if (adminPanelRoot) adminPanelRoot.style.display = 'block';
        
        try {
            const { mountAdminPanel } = await import('../admin_panel/main.js');
            mountAdminPanel();
            currentApp = 'admin-panel';
        } catch (error) {
            console.error('Failed to load Admin Panel app:', error);
        }
    } else {
        // Show iframe for other apps
        if (frame) {
            frame.style.display = 'block';
            frame.src = url;
        }
        currentApp = null;
    }
}

// Load vendor quoting app by default
loadApp(null, 'vendor-quoting');

// Handle navigation clicks
document.addEventListener('click', async (e) => {
    const link = e.target.closest('.material-nav-item');
    if (!link) return;

    e.preventDefault();

    // Update active state
    document.querySelectorAll('.material-nav-item')
        .forEach(el => el.classList.remove('active'));
    link.classList.add('active');

    // Load the appropriate app
    const appType = link.getAttribute('data-app');
    const href = link.getAttribute('href');
    
    if (appType) {
        await loadApp(null, appType);
    } else if (href && href !== '#') {
        await loadApp(href);
    }
});

