# Admin Approval Workflow

## Overview
This document explains how the martyr approval system works in the admin panel.

## Workflow Logic

### 1. Admin-Added Martyrs
- **Creation**: When an admin adds a martyr through the admin panel, it's automatically created with `approved = TRUE`
- **Status**: These martyrs appear as "مُوافق عليه" (Approved) in the admin dashboard
- **Actions**: No approval buttons are shown since they're already approved
- **Purpose**: Admins can directly add approved martyrs without going through an approval process

### 2. User-Added Martyrs
- **Creation**: When a regular user adds a martyr through the public form, it's created with `approved = FALSE`
- **Status**: These martyrs appear as "في الانتظار" (Pending) in the admin dashboard
- **Actions**: Approval buttons (Approve/Reject) are shown for pending martyrs
- **Purpose**: Admins must review and approve user-submitted martyrs before they become public

## Admin Dashboard Behavior

### For Pending Martyrs (User-Added)
- Shows "Approve" button (green checkmark) - Changes status to "Approved"
- Shows "Reject" button (red X) - Changes status to "Rejected"
- Status badge shows "في الانتظار" (Pending)

### For Approved Martyrs
- Shows "Unapprove" button (yellow warning) - Changes status back to "Pending"
- Status badge shows "مُوافق عليه" (Approved)

### For Rejected Martyrs
- Shows "Move to Pending" button (yellow warning) - Changes status to "Pending"
- Status badge shows "مرفوض" (Rejected)

## API Endpoints

### Admin Endpoints
- `POST /api/martyrs` - Add martyr (admin only, auto-approved)
- `GET /api/martyrs/admin/:id` - Get martyr details (admin only, includes unapproved)
- `PATCH /api/martyrs/:id/approve` - Update martyr approval status

### Public Endpoints
- `POST /api/martyrs/public` - Add martyr (public, requires approval)
- `GET /api/martyrs/:id` - Get martyr details (public, approved only)

## Database Schema

The `martyrs` table includes:
- `approved` (BOOLEAN) - Whether the martyr is approved for public viewing
- `status` (ENUM) - Current status: 'pending', 'approved', 'rejected'
- `created_at` (TIMESTAMP) - When the record was created

## Security

- Admin endpoints require authentication and admin privileges
- Public endpoints only return approved martyrs
- Admin endpoints can access all martyrs regardless of approval status
- Only admins can change approval status

## Benefits

1. **Efficiency**: Admins can directly add approved martyrs without extra steps
2. **Quality Control**: User submissions are reviewed before going public
3. **Flexibility**: Admins can change approval status as needed
4. **Security**: Clear separation between admin and public access
