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
    const reactRoot = document.getElementById('vendor-quoting-root');
    
    if (appType === 'vendor-quoting') {
        // Hide iframe, show React app
        if (frame) frame.style.display = 'none';
        if (reactRoot) reactRoot.style.display = 'block';
        
        // Import and mount the React app
        try {
            const { mountVendorQuotingApp } = await import('../vendor_quoting/App.js');
            mountVendorQuotingApp();
            currentApp = 'vendor-quoting';
        } catch (error) {
            console.error('Failed to load vendor quoting app:', error);
        }
    } else {
        // Show iframe, hide React app
        if (reactRoot) reactRoot.style.display = 'none';
        if (frame) {
            frame.style.display = 'block';
            frame.src = url;
        }
        
        // Unmount React app if it was mounted
        if (currentApp === 'vendor-quoting') {
            try {
                const { unmountVendorQuotingApp } = await import('../vendor_quoting/App.js');
                unmountVendorQuotingApp();
            } catch (error) {
                console.error('Failed to unmount vendor quoting app:', error);
            }
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

