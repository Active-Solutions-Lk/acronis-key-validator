# Migration: Add Logs Table

This migration adds the logs table to track important events and actions in the application.

## Changes

1. Created the `logs` table with the following structure:
   - `id`: Auto-incrementing primary key
   - `related_table`: VARCHAR(100) - The name of the table related to this log entry
   - `related_table_id`: INTEGER - The ID of the specific record in the related table
   - `severity`: INTEGER - Severity level (1=Info, 2=Warning, 3=Error)
   - `message`: VARCHAR(100) - Text description of the logged event
   - `admin_id`: INTEGER - Foreign key to the admin user who performed the action
   - `action`: VARCHAR(100) - The type of action performed (CREATE, UPDATE, DELETE, etc.)
   - `status_code`: INTEGER - HTTP status code or custom status code
   - `additional_data`: VARCHAR(100) NULL - JSON string containing additional context
   - `created_at`: TIMESTAMP - Timestamp when the log was created
   - `updated_at`: TIMESTAMP - Timestamp when the log was last updated

2. Added a foreign key constraint linking `admin_id` to the `admin` table's `id` column.

3. Added an index on the `admin_id` column for better query performance.

## Verification

After applying this migration, you can verify the table was created correctly by:

1. Connecting to your database
2. Running `DESCRIBE logs;` (MySQL) or equivalent command for your database system
3. Confirming the structure matches the specification above

## Usage

This table is used by the logging utility in `lib/logger.js` to track important events in the application, such as:
- Creation, update, and deletion of records
- Authentication events
- System errors
- Data synchronization operations