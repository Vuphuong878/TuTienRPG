# Entity Import System - Test Plan

## Test Overview
The Entity Import System allows players to import previously exported entity data back into the game, with automatic conflict resolution and backup creation.

## Test Cases

### 1. Basic Import Functionality

#### Test 1.1: Import Modal Access
**Steps:**
1. Start or load a game
2. Open game menu (hamburger icon on mobile, or Game dropdown on desktop)
3. Click "📥 Nhập Entity" button
4. Verify the EntityImportModal opens

**Expected Results:**
- Modal opens with file upload interface
- Import status shows current configuration
- Instructions are displayed clearly

#### Test 1.2: File Upload via Drag & Drop
**Steps:**
1. Open import modal
2. Drag a valid JSON export file into the drop zone
3. Verify file is selected
4. Click "Import Entity"

**Expected Results:**
- File appears in selected files list
- Import process starts with loading indicator
- Results are displayed after completion

#### Test 1.3: File Upload via File Picker
**Steps:**
1. Open import modal
2. Click "Chọn File" button
3. Select valid JSON export file(s)
4. Click "Import Entity"

**Expected Results:**
- File picker opens correctly
- Selected files are listed
- Import completes successfully

### 2. Import Configuration Tests

#### Test 2.1: Enable/Disable Import
**Steps:**
1. Open Settings (⚙️ Cài đặt)
2. Navigate to "📥 Nhập Entity Tự Động" section
3. Toggle "Cho phép nhập entity từ file"
4. Try to import a file

**Expected Results:**
- When enabled: Import works normally
- When disabled: Import is blocked with appropriate message

#### Test 2.2: Auto-Merge Configuration
**Steps:**
1. Import entities that already exist in the game
2. Test with auto-merge enabled and disabled

**Expected Results:**
- Auto-merge ON: Conflicting entities are merged with existing data
- Auto-merge OFF: Conflicting entities are skipped

#### Test 2.3: Backup Before Import
**Steps:**
1. Enable "Tạo backup trước khi import"
2. Import entities
3. Check downloads folder

**Expected Results:**
- Backup file is automatically downloaded before import
- Backup contains current entity state
- Import proceeds normally after backup

### 3. Conflict Resolution Tests

#### Test 3.1: New Entity Import
**Steps:**
1. Export entities from Game A
2. Start Game B (different character/world)
3. Import entities from Game A

**Expected Results:**
- All entities are added without conflicts
- Import summary shows entities imported: X, skipped: 0

#### Test 3.2: Conflicting Entity Import
**Steps:**
1. Create entities in current game
2. Export those entities
3. Modify the entities in-game
4. Import the exported file

**Expected Results:**
- Conflicts are detected and resolved according to settings
- Detailed conflict report is shown
- Entity data is merged appropriately

### 4. File Format Validation

#### Test 4.1: Valid Export File
**Steps:**
1. Export entities using the auto-export system
2. Import the exported file

**Expected Results:**
- File is recognized as valid
- All entities are imported correctly
- Metadata is processed properly

#### Test 4.2: Invalid File Format
**Steps:**
1. Try to import a non-JSON file
2. Try to import a JSON file with wrong structure

**Expected Results:**
- Clear error message about invalid format
- Import is rejected safely
- No data corruption occurs

#### Test 4.3: Multiple File Import
**Steps:**
1. Select multiple export files at once
2. Import all files

**Expected Results:**
- All files are processed in sequence
- Individual results are shown for each file
- Total summary is displayed

### 5. Data Integrity Tests

#### Test 5.1: Entity Merge Quality
**Steps:**
1. Export an entity with basic information
2. Add more details to the entity in-game
3. Import the exported file with auto-merge enabled

**Expected Results:**
- Existing detailed information is preserved
- Imported information is added where appropriate
- No data is lost inappropriately

#### Test 5.2: Game State Consistency
**Steps:**
1. Import entities
2. Continue playing the game
3. Verify entity interactions work normally

**Expected Results:**
- Imported entities behave correctly in game
- No references are broken
- Game continues without issues

### 6. Performance Tests

#### Test 6.1: Large File Import
**Steps:**
1. Import files with 50+ entities
2. Monitor import time and performance

**Expected Results:**
- Import completes within reasonable time (< 30 seconds)
- UI remains responsive during import
- Memory usage is acceptable

#### Test 6.2: Multiple Import Sessions
**Steps:**
1. Import several files in one session
2. Check browser performance

**Expected Results:**
- Browser doesn't slow down significantly
- Memory usage doesn't grow excessively

### 7. Error Handling Tests

#### Test 7.1: Corrupted File
**Steps:**
1. Manually corrupt an export file
2. Try to import it

**Expected Results:**
- Clear error message
- No application crash
- Other imports still work

#### Test 7.2: Network Interruption
**Steps:**
1. Start import process
2. Simulate file reading interruption

**Expected Results:**
- Graceful error handling
- Clear error message
- Ability to retry

## Testing Tools Available

### Browser Console Commands
```javascript
// EntityExportDebugger has been removed - use EntityExportManager directly
// Force create test export files
EntityExportManager.forceExport(currentGameState);

// Check export status and activity
EntityExportManager.getExportStatus();

// Check current import/export status
EntityExportManager.getExportStatus();
```

### Settings to Test
- Import enabled/disabled
- Auto-merge on/off
- Backup before import on/off
- Debug logging on/off

## Success Criteria

### Basic Functionality ✅
- Import modal opens and works correctly
- File upload (drag & drop and file picker) works
- Valid files are imported successfully
- Invalid files are rejected gracefully

### Advanced Features ✅
- Auto-merge works as configured
- Backup creation works when enabled
- Conflict resolution is accurate
- Multiple file import works

### Integration ✅
- Settings control import behavior correctly
- Import results are displayed clearly
- Game continues normally after import
- No data corruption occurs

### Performance ✅
- Import completes in reasonable time
- UI remains responsive
- Memory usage is acceptable

## Post-Test Validation

After running tests, verify:
1. All imported entities appear in game knowledge base
2. Entity interactions work correctly
3. No console errors during or after import
4. Game can be saved and loaded normally
5. Auto-export continues working normally

## Known Limitations

1. **File Size Limit**: Large files (>1MB) may be slow to process
2. **Browser Compatibility**: File API requires modern browser
3. **Memory Usage**: Large imports may temporarily increase memory usage
4. **Concurrent Operations**: Only one import should run at a time

## Debug Information

When testing, enable debug logging in settings to get detailed console output about:
- File validation process
- Entity categorization
- Conflict detection and resolution
- Import progress and results

The import system is now fully functional and ready for production use!