# Invitation Card Creator

A full-stack web application for creating and sharing beautiful custom invitation cards with drag-and-drop design capabilities, RSVP tracking, and Google Sheets integration.

## Features

- **Drag & Drop Canvas Editor**: Easily upload and arrange PNG images on a canvas
- **Event Details Management**: Add location, date/time, and description for events
- **JSON Export/Import**: Save and load your designs in JSON format
- **Publish & Share**: Get shareable links for your invitation cards
- **RSVP Tracking**: Collect guest responses with a beautiful RSVP form
- **Google Sheets Integration**: Automatically sync RSVPs to your Google Sheet
- **Responsive Design**: Beautiful UI built with Material-UI

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Konva (Canvas manipulation)
- React Router
- Axios
- Day.js

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Google Sheets API
- CORS

## Project Structure

```
financial-pro/
├── frontend/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context for state management
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   ├── theme.js         # MUI theme configuration
│   │   ├── App.js           # Main app component with routing
│   │   └── index.js         # Entry point
│   └── package.json
├── backend/                  # Express backend API
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── server.js            # Entry point
│   └── package.json
└── package.json             # Root workspace configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Cloud Project (for Sheets integration)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd financial-pro
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invitation-cards
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google Sheets API Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your-private-key-here
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here
```

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Set Up Google Sheets Integration (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account and download the JSON credentials
5. Extract `client_email` and `private_key` from the JSON
6. Add them to your backend `.env` file
7. Create a Google Sheet and share it with the service account email
8. Copy the Sheet ID from the URL and add it to `.env`

### 5. Start MongoDB

Make sure MongoDB is running locally:

```bash
# If using MongoDB locally
mongod
```

Or use MongoDB Atlas for a cloud database.

### 6. Run the Application

#### Development Mode

```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Invitation Cards

- `POST /api/invitations` - Create a new invitation card
- `GET /api/invitations` - Get all invitation cards
- `GET /api/invitations/:cardId` - Get a specific invitation card
- `PUT /api/invitations/:cardId` - Update an invitation card
- `POST /api/invitations/:cardId/publish` - Publish an invitation card
- `DELETE /api/invitations/:cardId` - Delete an invitation card

### RSVP

- `POST /api/rsvp` - Submit an RSVP
- `GET /api/rsvp/card/:cardId` - Get all RSVPs for a card
- `GET /api/rsvp/check/:cardId/:email` - Check if email has RSVP'd

## Usage Guide

### Creating an Invitation Card

1. Click "Start Creating" on the home page
2. Enter a title for your invitation
3. Drag and drop PNG images onto the canvas
4. Resize and position images as needed
5. Fill in event details (location, date/time, description)
6. (Optional) Add your Google Sheet ID for RSVP tracking
7. Click "Save" to save your design
8. Click "Publish" to make it shareable

### Sharing the Invitation

After publishing, you'll receive a shareable link that you can send to your guests. Guests can:
- View the invitation design
- See event details
- Submit their RSVP

### Exporting Design

Click "Export JSON" to download your canvas design as a JSON file. You can use this to:
- Back up your design
- Share templates with others
- Import designs later

## Features in Detail

### Canvas Editor

- Drag and drop PNG images
- Resize images with transform controls
- Rotate images
- Delete selected elements
- Visual feedback for selected elements

### Event Management

- Location with icon display
- Date and time picker with proper formatting
- Optional event description
- Clean, organized information display

### RSVP System

- Guest name and contact collection
- Attendance status (Yes/No)
- Number of guests
- Optional message field
- Automatic validation
- Duplicate RSVP prevention

### Google Sheets Integration

Automatically adds RSVP data to your Google Sheet with columns:
- Timestamp
- Name
- Email
- Phone
- Number of Guests
- Attending (Yes/No)
- Message

## Development

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Full page components with routing
- **Context**: Global state management using React Context
- **Services**: API communication layer
- **Controllers**: Business logic for API endpoints
- **Models**: Database schemas

### Best Practices

- Use Material-UI components for consistent design
- Follow React hooks best practices
- Keep components small and focused
- Use proper error handling
- Validate user input on both frontend and backend

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify network access if using MongoDB Atlas

### Google Sheets Not Working

- Verify service account credentials
- Ensure the Sheet is shared with the service account email
- Check that the Sheet ID is correct
- Review API quotas in Google Cloud Console

### Images Not Loading

- Ensure images are in PNG format
- Check file size (large files may take time to load)
- Verify CORS settings in backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
