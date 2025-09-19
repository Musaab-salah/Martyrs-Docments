# YouTube Playlist Feature Implementation

## Overview
This document describes the implementation of YouTube playlist functionality for the Martyrs Archive project, allowing admin users to add YouTube playlists to martyr profiles with flexible display options.

## Database Changes

### New Fields Added to `martyrs` Table
- `youtube_playlist` (VARCHAR(500), NULL) - Stores the YouTube playlist URL
- `youtube_display_type` (ENUM('link', 'embed'), DEFAULT 'link') - Controls how the playlist is displayed

### Migration Script
Run the following SQL script to add the new fields:
```sql
-- Located at: database/add_youtube_fields.sql
ALTER TABLE martyrs 
ADD COLUMN youtube_playlist VARCHAR(500) NULL COMMENT 'YouTube playlist URL',
ADD COLUMN youtube_display_type ENUM('link', 'embed') DEFAULT 'link' COMMENT 'How to display the YouTube playlist';

CREATE INDEX idx_youtube_playlist ON martyrs(youtube_playlist);
CREATE INDEX idx_youtube_display_type ON martyrs(youtube_display_type);
```

## Backend Changes

### Validation Updates
- Added validation for `youtube_playlist` field (optional, must be valid YouTube playlist URL)
- Added validation for `youtube_display_type` field (must be 'link' or 'embed')

### API Updates
All martyr endpoints now include the YouTube fields:
- GET `/api/martyrs` - Returns YouTube fields for approved martyrs
- GET `/api/martyrs/:id` - Returns YouTube fields for specific martyr
- POST `/api/martyrs` - Accepts YouTube fields (admin)
- POST `/api/martyrs/public` - Accepts YouTube fields (public submissions)
- PUT `/api/martyrs/:id` - Updates YouTube fields (admin)

## Frontend Changes

### Admin Components

#### AdminAddMartyrPage.js
- Added `youtube_playlist` input field with URL validation
- Added `youtube_display_type` select dropdown with options:
  - "رابط" (link) - Shows a red button linking to YouTube
  - "مدمج" (embed) - Shows embedded iframe player

#### AdminEditMartyrPage.js
- Added same YouTube fields as AddMartyr
- Fields are populated when editing existing martyrs
- Maintains existing values when updating

### Public Display Components

#### MartyrDetailPage.js
- Added YouTube playlist section that displays when `youtube_playlist` exists
- Two display modes based on `youtube_display_type`:

##### Link Mode (`youtube_display_type: 'link'`)
- Shows a styled red YouTube button
- Opens playlist in new tab when clicked
- Includes YouTube icon for visual recognition

##### Embed Mode (`youtube_display_type: 'embed'`)
- Shows responsive iframe with YouTube playlist embedded
- Uses classes: `w-full h-full rounded-lg shadow-lg aspect-video`
- Automatically converts playlist URL format for embedding
- Supports full-screen viewing and YouTube controls

## URL Conversion Logic
For embedded playlists, the system automatically converts:
- From: `https://www.youtube.com/playlist?list=PLAYLIST_ID`
- To: `https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID`

## Styling and Responsive Design
- All components use Tailwind CSS for consistent styling
- YouTube button uses red color scheme (`bg-red-600`, `hover:bg-red-700`)
- Embedded iframe is fully responsive with proper aspect ratio
- Matches existing site design patterns and Arabic RTL layout

## Usage Instructions

### For Administrators
1. Navigate to Admin Dashboard
2. When adding/editing a martyr:
   - Enter YouTube playlist URL in the "رابط قائمة تشغيل يوتيوب" field
   - Choose display type from "طريقة العرض" dropdown
   - Save the martyr profile

### For Public Users
- YouTube playlists appear in the martyr detail page
- Link mode: Click the red YouTube button to view playlist
- Embed mode: Watch videos directly on the page

## Technical Notes
- YouTube playlist URLs are validated to ensure proper format
- Default display type is 'link' for backward compatibility
- All YouTube fields are optional and won't break existing functionality
- Embedded iframes include security attributes and allow full YouTube functionality

## Testing Checklist
- [ ] Database migration runs successfully
- [ ] Admin can add YouTube playlist URL and select display type
- [ ] Admin can edit existing martyrs and update YouTube fields
- [ ] Public users can see YouTube button (link mode) on martyr detail page
- [ ] Public users can see embedded playlist (embed mode) on martyr detail page
- [ ] YouTube button opens playlist in new tab
- [ ] Embedded iframe displays playlist correctly and is responsive
- [ ] Invalid YouTube URLs are rejected during form submission
- [ ] Empty YouTube fields don't break the display
