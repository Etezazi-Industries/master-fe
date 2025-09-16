# Vacation App - React Migration

## Overview
The Vacation app has been converted from vanilla HTML/JavaScript to a modern React application that matches the design language of the vendor_quoting app.

## Architecture

### Shared Components
- **`components/shared/HeaderBar.jsx`** - Shared header component used by both vendor_quoting and vacation apps
  - Props: `{ icon, title, subtitle, actions?, sticky? }`
  - Provides consistent styling and layout across all applications
  - Supports sticky positioning for better UX in scrollable content

### VacationApp Components
- **`VacationApp.jsx`** - Main application component with state management and inline loading overlay
- **`components/VacationTable.jsx`** - Table displaying vacation requests with selection and editing
- **`components/ApprovalActions.jsx`** - Floating approval button with proper state management
- **`components/EditReasonModal.jsx`** - Modal for adding comments to vacation requests

## Features Preserved
All original functionality has been preserved:
- ✅ Load vacation requests from API
- ✅ Select requests by clicking table rows
- ✅ Approve selected requests with floating button
- ✅ Edit/add comments to requests via pencil icon
- ✅ Loading states and error handling
- ✅ Bootstrap styling and responsive design

## Design Language
The app now matches vendor_quoting with:
- Consistent header styling with gradients and shadows
- Card-based layout with rounded corners and shadows
- Proper typography with Inter font family
- Material Design-inspired modals and components
- Responsive layout with proper spacing

## Integration
The app is mounted as a React island at `#vacation-root` in home.html and managed by the routing system in home.js.

### Mounting/Unmounting
```javascript
// Mount the vacation app
const { mountVacationApp } = await import('../vacation/VacationApp.js');
mountVacationApp();

// Unmount the vacation app  
const { unmountVacationApp } = await import('../vacation/VacationApp.js');
unmountVacationApp();
```

### Props Contract for Shared HeaderBar
```javascript
<SharedHeaderBar
    icon="bi bi-calendar-check"           // Bootstrap icon class
    title="Vacation Requests"            // Main title
    subtitle="Auto Gen - Employee Management"  // Subtitle
    actions={customActions}               // Optional custom action buttons
    sticky={true}                         // Whether header should be sticky
/>
```

## Key Improvements

### Fixed Layout Issues
- **Sticky Header**: Header now stays visible during scrolling for better UX
- **Proper Content Spacing**: Content starts below header with appropriate padding
- **Scoped Loading**: Loading overlay only covers content area, sidebar remains clickable
- **No Header Overlap**: Content scrolls properly without overlapping the header

### Loading Overlay Scope
The loading overlay is now scoped to only the vacation content area:
- Uses `position: absolute` within the content container
- Does not cover the sidebar or header
- Sidebar remains fully interactive during loading
- Semi-transparent with blur effect for better UX

## API Integration
Uses the existing API functions from `api_calls.js`:
- `getVacationRequests()` - Fetch all vacation requests
- `approveVacationRequest(id)` - Approve a specific request
- `addVacationComment(id, comment)` - Add comment to a request

## Build Process
The app is built using esbuild as part of the main build process:
```bash
npm run build
```

This compiles `VacationApp.jsx` → `VacationApp.js` for browser consumption.

## Quality Assurance
- ✅ Zero console errors
- ✅ Accessible forms with proper labels and ARIA attributes
- ✅ Keyboard navigation support
- ✅ Clean, modular component architecture
- ✅ Proper error handling and loading states
- ✅ Responsive design maintained
- ✅ No breaking changes to existing functionality
