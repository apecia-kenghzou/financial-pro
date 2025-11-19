# Frontend Improvements Roadmap

## User Feedback Summary

Based on user feedback, the following improvements are needed:

1. **Remove repetitive sections** - "Getting Started" and "Start Create" are redundant
2. **Improve overall UI/UX** - Better styling, modern look
3. **Canvas improvements**:
   - A4 size/ratio (794px × 1123px at 96 DPI)
   - 2-3 page support
   - Pre-made assets (flowers, edge patterns)
   - Draggable text labels
   - Map integration
   - Calendar elements
4. **Published view**:
   - Focus on canvas ("wow" factor)
   - Auto-scroll through pages
   - User can stop by scrolling
   - Mobile-responsive

## Implementation Plan

### Phase 1: Home Page Simplification ✅ (Next Commit)

**Files to modify:**
- `frontend/src/pages/Home.js`

**Changes:**
- Remove duplicate CTA sections (currently has 2 CTAs)
- Keep only one prominent "Create Invitation" or "Get Started" button
- Improve hero section with better copy
- Add "How It Works" section (Design → Customize → Publish)
- Update feature descriptions to match new capabilities

### Phase 2: A4 Canvas with Multi-Page Support

**Files to create/modify:**
- `frontend/src/components/A4Canvas.js` (NEW)
- `frontend/src/components/PageNavigator.js` (NEW)
- `frontend/src/components/CanvasEditor.js` (MODIFY)
- `frontend/src/context/CardContext.js` (MODIFY)

**Implementation:**

```javascript
// A4 dimensions at 96 DPI
const A4_WIDTH = 794;  // 210mm
const A4_HEIGHT = 1123; // 297mm
const MAX_PAGES = 3;

// Canvas structure
{
  pages: [
    {
      id: 1,
      elements: [...]
    },
    {
      id: 2,
      elements: [...]
    }
  ],
  currentPage: 1
}
```

**Features:**
- A4-sized canvas with proper aspect ratio
- Page indicators (1/3, 2/3, etc.)
- Add/Remove page buttons
- Navigate between pages
- Each page has its own elements array
- Visual page thumbnails in sidebar

### Phase 3: Asset Library

**Files to create:**
- `frontend/src/components/AssetLibrary.js` (NEW)
- `frontend/src/assets/flowers/` (NEW directory)
- `frontend/src/assets/patterns/` (NEW directory)
- `frontend/src/assets/decorations/` (NEW directory)

**Asset Categories:**

1. **Flowers** (10-15 PNG images):
   - Roses, sunflowers, lilies, cherry blossoms
   - Transparent backgrounds
   - High quality (300-500px)

2. **Edge Patterns** (8-10 images):
   - Corner decorations
   - Borders (top, bottom, left, right)
   - Frame elements
   - Dividers

3. **Decorations**:
   - Hearts, stars, ribbons
   - Event-specific (wedding rings, birthday cake, etc.)
   - Seasonal (leaves, snowflakes)

**Implementation:**
```javascript
// AssetLibrary.js
const assetCategories = [
  {
    name: 'Flowers',
    items: [
      { id: 'flower-1', src: '/assets/flowers/rose.png', thumb: '...' },
      { id: 'flower-2', src: '/assets/flowers/sunflower.png', thumb: '...' },
      // ...
    ]
  },
  {
    name: 'Patterns',
    items: [...]
  }
];

// Draggable from library to canvas
<Box
  draggable
  onDragStart={() => handleAssetDrag(asset)}
>
  <img src={asset.thumb} />
</Box>
```

### Phase 4: Interactive Elements

#### 4.1 Text Element

**Files to create:**
- `frontend/src/components/TextElement.js` (NEW)
- `frontend/src/components/TextEditor.js` (NEW)

**Features:**
- Add text label to canvas
- Edit text content
- Font family selection (5-10 fonts)
- Font size (12-72px)
- Font color picker
- Bold, italic, underline
- Text alignment
- Draggable and resizable

**Implementation:**
```javascript
// Text element structure
{
  id: 'text-123',
  type: 'text',
  content: 'Hello World',
  x: 100,
  y: 100,
  fontSize: 24,
  fontFamily: 'Arial',
  color: '#000000',
  bold: false,
  italic: false,
  align: 'left'
}

// React Konva Text component
<Text
  text={element.content}
  fontSize={element.fontSize}
  fontFamily={element.fontFamily}
  fill={element.color}
  fontStyle={element.bold ? 'bold' : 'normal'}
  ...
/>
```

#### 4.2 Map Element

**Files to create:**
- `frontend/src/components/MapElement.js` (NEW)
- `frontend/src/components/MapDialog.js` (NEW)

**Implementation Options:**

**Option A: Static Map Image** (Simpler)
```javascript
// Use Google Static Maps API
const mapUrl = `https://maps.googleapis.com/maps/api/staticmap
  ?center=${encodeURIComponent(location)}
  &zoom=15
  &size=400x300
  &maptype=roadmap
  &markers=color:red|${encodeURIComponent(location)}
  &key=${GOOGLE_MAPS_API_KEY}`;

// Add as image element to canvas
```

**Option B: Interactive Map** (Better UX)
```javascript
// Use react-leaflet or Google Maps embed
// Add map widget that user can configure
{
  type: 'map',
  location: '123 Main St, City',
  latitude: 1.234,
  longitude: 5.678,
  zoom: 15,
  width: 400,
  height: 300
}
```

#### 4.3 Calendar Element

**Files to create:**
- `frontend/src/components/CalendarElement.js` (NEW)

**Features:**
- Mini calendar showing event date
- Highlight event date
- Customize colors
- Different styles (modern, classic, minimal)

**Implementation:**
```javascript
// Calendar element structure
{
  type: 'calendar',
  date: '2025-12-31',
  style: 'modern', // or 'classic', 'minimal'
  primaryColor: '#667eea',
  highlightDate: true
}

// Use react-calendar or custom SVG
import Calendar from 'react-calendar';

// Render as image on canvas (convert to data URL)
const calendarToImage = async (date, style) => {
  // Render calendar to canvas
  // Export as data URL
  // Add to Konva canvas as image
};
```

### Phase 5: Stunning Published View

**Files to create/modify:**
- `frontend/src/pages/InvitationView.js` (MODIFY HEAVILY)
- `frontend/src/components/PublishedCanvas.js` (NEW)
- `frontend/src/components/AutoScroll.js` (NEW)

**Features:**

1. **Full-Screen Canvas View**:
```javascript
// Remove all UI chrome (no navbar, buttons)
// Just the invitation canvas
<Box sx={{
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <PublishedCanvas pages={pages} />
</Box>
```

2. **Auto-Scroll Animation**:
```javascript
// Smooth auto-scroll through pages
const AutoScroll = ({ pages, duration = 3000 }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);

  useEffect(() => {
    if (!isScrolling) return;

    const interval = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % pages.length);
    }, duration);

    return () => clearInterval(interval);
  }, [isScrolling]);

  // Stop on user scroll/touch
  const handleUserInteraction = () => {
    setIsScrolling(false);
  };

  return (
    <Box
      onWheel={handleUserInteraction}
      onTouchMove={handleUserInteraction}
    >
      {/* Render pages with smooth transitions */}
    </Box>
  );
};
```

3. **Page Transitions**:
```javascript
// Smooth fade or slide between pages
<Fade in={currentPage === pageIndex} timeout={500}>
  <Box>
    <Stage width={A4_WIDTH} height={A4_HEIGHT}>
      {/* Render page elements */}
    </Stage>
  </Box>
</Fade>
```

4. **Mobile Responsive**:
```javascript
// Scale canvas to fit mobile screens
const useResponsiveCanvas = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const maxWidth = window.innerWidth - 32; // 16px padding each side
      const scale = Math.min(maxWidth / A4_WIDTH, 1);
      setScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return scale;
};

// Apply scale
<Stage
  width={A4_WIDTH * scale}
  height={A4_HEIGHT * scale}
  scaleX={scale}
  scaleY={scale}
>
  {/* Elements */}
</Stage>
```

5. **RSVP Form Below Canvas**:
```javascript
// After canvas view, show RSVP form
<Box>
  <PublishedCanvas {...} />

  {/* Scroll down to see RSVP form */}
  <Container maxWidth="sm" sx={{ py: 6 }}>
    <RSVPForm cardId={cardId} />
  </Container>
</Box>
```

## Technical Specifications

### Canvas Dimensions

```javascript
// A4 at 96 DPI (web standard)
const CANVAS_CONFIG = {
  width: 794,   // 210mm × 96 DPI ÷ 25.4
  height: 1123, // 297mm × 96 DPI ÷ 25.4
  dpi: 96,
  format: 'A4'
};
```

### Element Types

```javascript
const ELEMENT_TYPES = {
  IMAGE: 'image',      // User uploads or library assets
  TEXT: 'text',        // Text labels
  MAP: 'map',          // Location map
  CALENDAR: 'calendar' // Date calendar
};
```

### Page Structure

```javascript
{
  cardId: 'abc123',
  title: 'My Invitation',
  pages: [
    {
      id: 'page-1',
      number: 1,
      elements: [
        { type: 'image', ... },
        { type: 'text', ... }
      ]
    },
    {
      id: 'page-2',
      number: 2,
      elements: [...]
    }
  ],
  eventDetails: {...},
  googleSheetId: '...'
}
```

## UI/UX Improvements

### Color Scheme
```javascript
const theme = {
  primary: '#667eea',    // Purple
  secondary: '#764ba2',  // Deep purple
  success: '#4caf50',
  background: '#f5f7fa',
  paper: '#ffffff'
};
```

### Typography
```javascript
// Modern font stack
fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

// Headlines: Bold, large
// Body: Regular, readable (16px)
// Buttons: Medium weight, uppercase
```

### Animations
```javascript
// Hover effects
transition: 'all 0.3s ease'
'&:hover': {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
}

// Page transitions
<Fade in timeout={500} />
<Slide direction="up" in timeout={300} />
```

## File Structure (After Implementation)

```
frontend/src/
├── pages/
│   ├── Home.js (IMPROVED - no repetitive CTAs)
│   ├── CardEditor.js (IMPROVED - A4 canvas, multi-page)
│   └── InvitationView.js (COMPLETELY REDESIGNED)
├── components/
│   ├── A4Canvas.js (NEW)
│   ├── PageNavigator.js (NEW)
│   ├── AssetLibrary.js (NEW)
│   ├── TextElement.js (NEW)
│   ├── TextEditor.js (NEW)
│   ├── MapElement.js (NEW)
│   ├── MapDialog.js (NEW)
│   ├── CalendarElement.js (NEW)
│   ├── PublishedCanvas.js (NEW)
│   ├── AutoScroll.js (NEW)
│   └── CanvasEditor.js (MODIFIED)
├── assets/
│   ├── flowers/ (NEW)
│   ├── patterns/ (NEW)
│   └── decorations/ (NEW)
└── context/
    └── CardContext.js (MODIFIED - multi-page support)
```

## Testing Checklist

After implementation:

- [ ] Home page has only one CTA
- [ ] Canvas is A4-sized (794×1123px)
- [ ] Can add/remove pages (up to 3)
- [ ] Can drag assets from library to canvas
- [ ] Can add and edit text elements
- [ ] Can add map element
- [ ] Can add calendar element
- [ ] Published view auto-scrolls
- [ ] Can stop auto-scroll by user interaction
- [ ] Published view is mobile-responsive
- [ ] All elements save/load correctly
- [ ] Multi-page invitations display correctly

## Estimated Timeline

- Phase 1: Home Page - 1-2 hours
- Phase 2: A4 Multi-Page Canvas - 4-6 hours
- Phase 3: Asset Library - 3-4 hours (including finding/creating assets)
- Phase 4: Interactive Elements - 6-8 hours
  - Text: 2 hours
  - Map: 2-3 hours
  - Calendar: 2-3 hours
- Phase 5: Published View - 4-5 hours

**Total: ~20-25 hours of development work**

## Next Steps

1. Commit current work (Google Drive fix + tests)
2. Start with Phase 1 (Home page simplification)
3. Then tackle Phase 2 (A4 canvas)
4. Gather/create assets for library
5. Implement interactive elements
6. Finally, create stunning published view

This is a significant upgrade that will transform the application into a professional invitation creation tool!
