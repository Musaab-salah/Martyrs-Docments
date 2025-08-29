# Status System Guide

## Overview

The Martyrs Archive now includes a comprehensive status management system that allows administrators to properly manage martyr records with three distinct statuses:

- **Pending** (في الانتظار) - New submissions awaiting review
- **Approved** (مُوافق عليه) - Approved and publicly visible records
- **Rejected** (مرفوض) - Rejected submissions

## Database Structure

### New Status Field
The system now uses a `status` ENUM field with the following values:
- `'pending'` - Default status for new submissions
- `'approved'` - Approved records visible to the public
- `'rejected'` - Rejected submissions

### Backward Compatibility
The system maintains the existing `approved` boolean field for backward compatibility with existing code and data.

## Migration

### Running the Migration
If you have an existing installation, run the status migration:

```bash
npm run migrate:status
```

This will:
1. Add the `status` column to the `martyrs` table
2. Migrate existing data (converts `approved = true` to `status = 'approved'`)
3. Set all other records to `status = 'pending'`

### Migration Summary
After running the migration, you'll see a summary like:
```
✅ Migration completed successfully!
📊 Total martyrs: 7
📈 Status breakdown:
   - approved: 7
✅ Approved: 7
⏳ Pending: 0
❌ Rejected: 0
```

## Admin Dashboard Features

### Status Display
- **Color-coded badges** for easy visual identification
- **Dynamic status updates** without page refresh
- **Comprehensive filtering** by status

### Action Buttons
Based on current status, different action buttons are available:

#### Pending Records
- ✅ **Approve** - Changes status to "approved"
- ❌ **Reject** - Changes status to "rejected"

#### Approved Records
- ⚠️ **Unapprove** - Changes status to "pending"

#### Rejected Records
- 🔄 **Move to Pending** - Changes status to "pending"

### Filtering
Use the status filter dropdown to view:
- All records
- Pending records only
- Approved records only
- Rejected records only

## API Endpoints

### Public API
- `GET /api/martyrs` - Returns only approved martyrs (public view)

### Admin API
- `GET /api/martyrs/admin/all` - Returns all martyrs with status information
- `PATCH /api/martyrs/:id/approve` - Update martyr status

### Status Update Examples

```javascript
// Approve a martyr
await adminApi.approveMartyr(martyrId, true, token, 'approved');

// Reject a martyr
await adminApi.approveMartyr(martyrId, false, token, 'rejected');

// Move to pending
await adminApi.approveMartyr(martyrId, false, token, 'pending');
```

## Workflow

### Typical Admin Workflow
1. **Review Pending Submissions** - Check new martyr submissions
2. **Approve Valid Records** - Approve records that meet criteria
3. **Reject Invalid Records** - Reject records that don't meet standards
4. **Manage Existing Records** - Update status as needed

### Status Transitions
```
New Submission → Pending
Pending → Approved (Admin approves)
Pending → Rejected (Admin rejects)
Approved → Pending (Admin unapproves)
Rejected → Pending (Admin moves back to pending)
```

## Error Handling

The system includes robust error handling for:
- **Database compatibility** - Works with both old and new database structures
- **Missing status field** - Gracefully falls back to approved field
- **Invalid status values** - Validates status before updates
- **Network errors** - Provides user-friendly error messages

## Troubleshooting

### Common Issues

1. **"Unknown column 'status'" Error**
   - Solution: Run the migration script
   - Command: `npm run migrate:status`

2. **Status Not Updating**
   - Check admin permissions
   - Verify database connection
   - Check browser console for errors

3. **Filter Not Working**
   - Ensure migration has been run
   - Check if status column exists in database

### Verification Commands

Check if status column exists:
```sql
DESCRIBE martyrs;
```

Check current status distribution:
```sql
SELECT status, COUNT(*) FROM martyrs GROUP BY status;
```

## Future Enhancements

The status system is designed to be extensible for future enhancements:
- Additional status types (e.g., "under review", "needs more info")
- Status change history tracking
- Automated status transitions
- Bulk status operations
- Status-based notifications
