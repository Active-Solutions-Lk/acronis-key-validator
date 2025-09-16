# Logging Implementation

This document describes the logging implementation in the Acronis Key Validator application.

## Overview

The application uses a dedicated `logs` table in the database to track important events and actions. This provides an audit trail for security, debugging, and monitoring purposes.

## Log Structure

The logs table contains the following fields:

- `id`: Auto-incrementing primary key
- `related_table`: The name of the table related to this log entry
- `related_table_id`: The ID of the specific record in the related table
- `severity`: Integer representing the severity level (1=Info, 2=Warning, 3=Error)
- `message`: Text description of the logged event
- `admin_id`: Foreign key to the admin user who performed the action (0 for system events)
- `action`: The type of action performed (CREATE, UPDATE, DELETE, etc.)
- `status_code`: HTTP status code or custom status code
- `additional_data`: JSON string containing additional context
- `created_at`: Timestamp when the log was created
- `updated_at`: Timestamp when the log was last updated

## Implementation

### Logger Utility

The logging functionality is implemented in `lib/logger.js` and provides:

1. A main `logAction` function for creating log entries
2. Convenience functions for common scenarios:
   - `logInfo` - For informational messages
   - `logWarn` - For warning messages
   - `logError` - For error messages
3. Constants for severity levels and action types

The logger properly handles the Prisma schema by:
- Checking if the provided adminId exists in the admin table
- Using 0 as a default admin_id for system-generated logs when no valid admin is available
- Properly disconnecting from the database after each operation

### Usage Example

```javascript
import { logAction, SEVERITY, ACTION } from '@/lib/logger';

// Log a successful creation
await logAction({
  relatedTable: 'reseller',
  relatedTableId: newReseller.customer_id,
  severity: SEVERITY.INFO,
  message: `Reseller "${newReseller.company_name}" created successfully`,
  adminId: adminId, // Will be validated, or 0 used if invalid
  action: ACTION.CREATE,
  statusCode: 201,
  additionalData: {
    company_name: newReseller.company_name,
    type: newReseller.type
  }
});
```

### Integration Points

Logging has been integrated into several key API endpoints:

1. `app/api/create-reseller/route.js` - Logs reseller creation attempts
2. `app/api/create-credential/route.js` - Logs credential creation attempts
3. `app/api/delete-credential/route.js` - Logs credential deletion attempts

### Viewing Logs

Logs can be viewed through the admin dashboard:

1. API endpoint: `app/api/fetch-logs/route.js` - Provides paginated access to logs
2. Server action: `app/actions/fetchLogs.js` - Wrapper for the API endpoint
3. Component: `components/admin/LogsTable.jsx` - UI component for displaying logs
4. Settings page: Integrated into the settings tab in the admin dashboard

## Severity Levels

- **1 (Info)**: Successful operations and general information
- **2 (Warning)**: Operations that completed with issues or potential problems
- **3 (Error)**: Failed operations or system errors

## Action Types

- **CREATE**: Creation of new records
- **UPDATE**: Modification of existing records
- **DELETE**: Removal of records
- **READ**: Data retrieval operations
- **LOGIN**: Authentication events
- **SYNC**: Data synchronization operations

## Testing

To verify the logging implementation:

1. Create a new reseller or credential through the admin interface
2. Check that a log entry is created in the database
3. View the logs in the admin dashboard under Settings > System Logs

## Future Enhancements

Potential improvements to the logging system could include:

1. Log rotation to prevent the logs table from growing too large
2. More detailed filtering options in the UI
3. Export functionality for logs
4. Real-time log streaming
5. Integration with external logging services