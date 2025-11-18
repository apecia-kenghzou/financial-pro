import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { CardProvider } from './context/CardContext';
import Home from './pages/Home';
import CardEditor from './pages/CardEditor';
import InvitationView from './pages/InvitationView';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CardProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CardEditor />} />
            <Route path="/invitation/:cardId" element={<InvitationView />} />
          </Routes>
        </Router>
      </CardProvider>
    </ThemeProvider>
  );
}

export default App;
