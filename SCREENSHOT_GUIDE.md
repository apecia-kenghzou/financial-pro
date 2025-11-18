# Screenshot Guide

## Pages to Capture

### 1. **Home Page** (/)
**URL:** http://localhost:3000/
**What to capture:**
- Hero section with gradient background
- Features grid (4 cards: Drag & Drop, Templates, Sharing, RSVP Tracking)
- "Get Started" button
- Navbar at top

**File name:** `01-home-page.png`

---

### 2. **Login Page** (/login)
**URL:** http://localhost:3000/login
**What to capture:**
- Google Sign-In button
- Feature highlights
- Branding
- Navbar showing "Sign In" button

**File name:** `02-login-page.png`

---

### 3. **Card Editor - Empty State** (/create)
**URL:** http://localhost:3000/create
**What to capture:**
- Full editor interface with empty canvas
- Canvas editor (left side)
- Event details form (right side)
- Title input at top
- Action buttons (Export JSON, Save, Publish)
- Navbar showing user profile (if authenticated)

**File name:** `03-card-editor-empty.png`

---

### 4. **Card Editor - With Content**
**URL:** http://localhost:3000/create
**What to capture:**
- Canvas with dragged images
- Filled event details form:
  - Location filled in
  - Date/Time selected
  - Description added
  - Google Sheets selector showing dropdown

**File name:** `04-card-editor-with-content.png`

---

### 5. **Google Sheets Selector**
**What to capture:**
- Close-up of Google Sheets dropdown
- Shows list of user's sheets
- Refresh button
- "Open selected sheet" link

**File name:** `05-google-sheets-selector.png`

---

### 6. **Publish Dialog**
**What to capture:**
- Success dialog after publishing
- Shareable link displayed
- "Copy Link" button

**File name:** `06-publish-dialog.png`

---

### 7. **Public Invitation View** (/invitation/:cardId)
**URL:** http://localhost:3000/invitation/[someCardId]
**What to capture:**
- Invitation title
- Canvas rendering (guest view)
- Event details card (location, date/time, description)
- RSVP form
- Submit button

**File name:** `07-public-invitation-view.png`

---

### 8. **RSVP Form - Filled**
**What to capture:**
- RSVP form with all fields filled
- Name, Email, Phone
- Number of Guests selector
- Attending toggle
- Message field
- Before submitting

**File name:** `08-rsvp-form-filled.png`

---

### 9. **Navbar - Authenticated State**
**What to capture:**
- Close-up of navbar
- User avatar/profile
- Create button
- User menu dropdown (if open)

**File name:** `09-navbar-authenticated.png`

---

### 10. **User Menu Dropdown**
**What to capture:**
- Opened user menu
- User name and email
- "My Invitations" option
- "Logout" option

**File name:** `10-user-menu.png`

---

## Screenshot Tips

1. **Use full browser width** - Capture at 1920x1080 or 1440x900 resolution
2. **Show complete page** - Scroll to capture entire page if needed
3. **Clean state** - Close any dev tools, clear console
4. **Realistic data** - Use meaningful example text (not "test test test")
5. **Light mode** - The theme is designed for light mode

## Example Data to Use

### Event Details:
- **Title:** "Sarah & John's Wedding"
- **Location:** "Grand Ballroom, Marriott Hotel, Downtown LA"
- **Date/Time:** June 15, 2025, 6:00 PM
- **Description:** "Join us for an evening of celebration as we tie the knot! Dinner and dancing to follow the ceremony."

### RSVP Form:
- **Name:** "Emily Rodriguez"
- **Email:** "emily.rodriguez@example.com"
- **Phone:** "+1 (555) 123-4567"
- **Number of Guests:** 2
- **Attending:** Yes
- **Message:** "So excited to celebrate with you both! Can't wait for the big day!"

## Tools for Taking Screenshots

### Browser Extensions:
- **Awesome Screenshot** - Full page capture
- **GoFullPage** - Scrolling screenshots
- **Nimbus Screenshot** - Annotate and edit

### Built-in Browser Tools:
- **Chrome DevTools:** Cmd/Ctrl + Shift + P → "Capture full size screenshot"
- **Firefox:** Shift + F2 → `:screenshot --fullpage`

### Desktop Tools:
- **macOS:** Cmd + Shift + 4 (select area)
- **Windows:** Windows + Shift + S (Snipping Tool)
- **Linux:** Flameshot, GNOME Screenshot

---

## Quick Start

**Note:** The full application requires MongoDB and Google OAuth credentials.

For UI screenshots without backend:
1. You can run just the frontend to capture static UI
2. Some features (login, save, publish) won't work without backend
3. Canvas and forms are fully functional for screenshots

For full functionality:
1. Set up MongoDB (see SETUP_INSTRUCTIONS.md)
2. Configure Google OAuth credentials in backend/.env
3. Start both backend and frontend servers
