# Admin Panel

A comprehensive administration interface for the ProCure Hub application system.

## Features

### User Information Panel
- Displays user/party data from the existing API (`getPartyData()`)
- Shows user details including name, email, phone, and ID
- Supports loading states and error handling
- Interactive selection with detailed information display

### Application Management Panel
- Lists all applications in the system (currently hard-coded)
- Shows application status (active, maintenance, development)
- Displays version information
- Interactive selection with detailed information display

### Summary Dashboard
- Overview cards showing:
  - Total number of users
  - Number of active applications
  - Applications in maintenance
  - Applications in development

## Components

### Main Components
- **AdminPanel.jsx**: Main application component with state management
- **UserList.jsx**: User information display component
- **ApplicationList.jsx**: Application listing component

### Navigation Integration
- Integrated into the main navigation sidebar
- Uses the shared HeaderBar component
- Follows the same mounting/unmounting pattern as other apps

## Usage

1. Click "Admin Panel" in the navigation sidebar
2. View user information in the left panel
3. View application status in the right panel
4. Click on items to see detailed information below
5. Use the refresh button to reload user data

## API Integration

The Admin Panel uses the existing `getPartyData()` API call from `api_calls.js` to fetch user information. The application list is currently hard-coded but can be easily extended to use a real API endpoint.

## Styling

- Uses Bootstrap 5 for layout and components
- Consistent with the overall application theme
- Material Design inspired interactions
- Responsive design for different screen sizes

## Files Structure

```
src/renderer/admin_panel/
├── AdminPanel.jsx          # Main application component
├── main.js                 # Entry point and mounting logic
├── admin_panel.html        # Standalone HTML (optional)
├── components/
│   ├── UserList.jsx        # User information list
│   └── ApplicationList.jsx # Application list
└── README.md              # This file
```

## Future Enhancements

- Add user management capabilities (create, edit, delete)
- Implement real-time application status monitoring
- Add system logs and audit trails
- Include user role and permission management
- Add application deployment and update controls
