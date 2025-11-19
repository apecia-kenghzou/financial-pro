import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import CreateIcon from '@mui/icons-material/Create';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { user, loading, logout, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/create');
    }
  };

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo/Brand */}
        <IconButton
          component={RouterLink}
          to="/"
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
        >
          <HomeIcon />
        </IconButton>

        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600
          }}
        >
          Invitation Card Creator
        </Typography>

        {/* Create Button */}
        <Button
          color="inherit"
          startIcon={<CreateIcon />}
          onClick={handleCreateClick}
          sx={{ mr: 2 }}
        >
          Create
        </Button>

        {/* Auth Section */}
        {loading ? (
          <CircularProgress color="inherit" size={24} />
        ) : isAuthenticated && user ? (
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {user.picture ? (
                <Avatar src={user.picture} alt={user.name} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { handleClose(); navigate('/my-invitations'); }}>
                <ListAltIcon fontSize="small" sx={{ mr: 1 }} />
                My Invitations
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/create'); }}>
                <CreateIcon fontSize="small" sx={{ mr: 1 }} />
                Create New
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            color="inherit"
            variant="outlined"
            component={RouterLink}
            to="/login"
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Sign In
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
