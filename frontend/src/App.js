import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import theme from './theme';
import { CardProvider } from './context/CardContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CardEditor from './pages/CardEditor';
import InvitationView from './pages/InvitationView';
import Login from './pages/Login';
import MyInvitations from './pages/MyInvitations';
import RSVPDashboard from './pages/RSVPDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <CardProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/create" element={<CardEditor />} />
                  <Route path="/edit/:cardId" element={<CardEditor />} />
                  <Route path="/my-invitations" element={<MyInvitations />} />
                  <Route path="/rsvp-dashboard/:cardId" element={<RSVPDashboard />} />
                  <Route path="/invitation/:cardId" element={<InvitationView />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </CardProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
