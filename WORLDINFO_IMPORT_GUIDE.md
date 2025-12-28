# SillyTavern WorldInfo Import Guide

## 🎯 **New Feature: Import WorldInfo**

You can now directly import SillyTavern World Info files into your RPG AI Simulator!

## 📝 **How to Use**

### **Step 1: Get SillyTavern WorldInfo File**
- Export your World Info from SillyTavern (JSON format)
- Or use any compatible WorldInfo file with the structure: `{"entries": {...}}`

### **Step 2: Import to RPG AI Simulator**
1. Open **Custom Rules Modal** → **Advanced Mode**
2. Click **"Nhập WorldInfo"** button (purple button in footer)
3. Select your SillyTavern WorldInfo JSON file
4. Confirm the import

### **Step 3: Review Imported Rules**
- Imported rules will have category **🌐 WorldInfo**
- All original settings preserved and converted
- Filter by "WorldInfo" category to review imported rules

## 🔄 **Conversion Mapping**

### **SillyTavern → RPG AI Simulator**

| SillyTavern Field | RPG AI Simulator Field | Notes |
|-------------------|------------------------|-------|
| `comment` | `title` | Entry title/description |
| `content` | `content` | Main rule content |
| `key` | `keywords` | Primary activation keywords |
| `keysecondary` | `secondaryKeywords` | Secondary keywords |
| `selectiveLogic` | `logic` | Logic type (0=AND_ANY, 1=NOT_ALL, etc.) |
| `order` | `order` | Priority level |
| `probability` | `probability` | Activation chance (%) |
| `depth` | `scanDepth` | How far back to scan |
| `caseSensitive` | `caseSensitive` | Case sensitivity |
| `matchWholeWords` | `matchWholeWords` | Whole word matching |
| `disable` | `isActive` | Active status (inverted) |
| `group` | `category` | Set to 'worldinfo' if empty |

## 📋 **Example Conversion**

### **Original SillyTavern Entry:**
```json
{
  "uid": 0,
  "key": ["Dị năng", "Siêu năng lực"],
  "keysecondary": [],
  "comment": "[ABILITY] Dị năng Hạt Cơ Bản Chưởng Khống",
  "content": "**GIẢI THÍCH VỀ KHẢ NĂNG...**",
  "order": 275,
  "probability": 100,
  "depth": 4,
  "disable": false,
  "caseSensitive": null,
  "matchWholeWords": null
}
```

### **Converted RPG AI Simulator Rule:**
```json
{
  "id": "worldinfo-0-123456789",
  "title": "[ABILITY] Dị năng Hạt Cơ Bản Chưởng Khống",
  "content": "**GIẢI THÍCH VỀ KHẢ NĂNG...**",
  "keywords": ["Dị năng", "Siêu năng lực"],
  "secondaryKeywords": [],
  "logic": 0,
  "order": 275,
  "probability": 100,
  "scanDepth": 4,
  "isActive": true,
  "caseSensitive": false,
  "matchWholeWords": false,
  "category": "worldinfo"
}
```

## ✅ **Validation & Error Handling**

### **File Validation:**
- Checks for proper JSON format
- Validates `{"entries": {...}}` structure
- Filters out empty content entries

### **Error Reporting:**
- Shows conversion success count
- Reports any entries that failed to convert
- Logs detailed errors to browser console

### **ID Conflict Resolution:**
- Automatically generates unique IDs
- Prevents conflicts with existing rules
- Preserves original UID in new ID when possible

## 🚀 **Benefits**

### **Perfect Migration:**
- **No manual re-entry** of existing WorldInfo
- **Preserve all settings** and priorities
- **Maintain keyword logic** and conditions

### **Enhanced Compatibility:**
- **Same activation logic** as SillyTavern
- **Full feature support** (keywords, logic, priorities)
- **Seamless integration** with existing rules

### **Professional Workflow:**
- **Batch import** multiple entries at once
- **Category organization** with WorldInfo tag
- **Easy identification** of imported content

## 🔧 **Tips for Best Results**

1. **Clean your WorldInfo** before exporting from SillyTavern
2. **Test imported rules** in Simple Mode first
3. **Adjust categories** if needed after import
4. **Review activation settings** for your specific use case
5. **Backup your rules** before large imports

## 📊 **After Import**

- **Filter by category**: Select "🌐 WorldInfo" to see imported rules
- **Statistics tracking**: Shows "X từ WorldInfo" in status bar
- **Full editing**: All imported rules can be edited normally
- **Export support**: Can re-export as enhanced format

Your SillyTavern WorldInfo is now fully integrated and ready to enhance your RPG experience! 🎊