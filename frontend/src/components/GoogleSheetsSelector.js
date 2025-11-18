import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { sheetsAPI } from '../services/api';
import { useUser } from '../context/UserContext';

const GoogleSheetsSelector = ({ value, onChange, label = "Google Sheet", error, helperText }) => {
  const { isAuthenticated } = useUser();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchSheets = async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const response = await sheetsAPI.getMySheets();
      if (response.data.success) {
        setSheets(response.data.data || []);
        if (response.data.data.length === 0) {
          setFetchError('No Google Sheets found. Create one first.');
        }
      } else {
        setFetchError(response.data.message || 'Failed to fetch Google Sheets');
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
      if (error.response?.status === 401) {
        setFetchError('Please sign in to access your Google Sheets');
      } else if (error.response?.status === 403) {
        setFetchError('Permission denied. Please grant access to Google Sheets.');
      } else {
        setFetchError(error.response?.data?.message || 'Failed to fetch Google Sheets');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSheets();
    }
  }, [isAuthenticated]);

  const handleRefresh = () => {
    fetchSheets();
  };

  const getSheetUrl = (sheetId) => {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="info">
        Please sign in to select a Google Sheet for RSVP tracking.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <FormControl fullWidth error={error} disabled={loading}>
          <InputLabel id="google-sheets-selector-label">{label}</InputLabel>
          <Select
            labelId="google-sheets-selector-label"
            id="google-sheets-selector"
            value={value || ''}
            label={label}
            onChange={(e) => onChange(e.target.value)}
            endAdornment={
              loading ? (
                <CircularProgress size={20} sx={{ mr: 2 }} />
              ) : null
            }
          >
            <MenuItem value="">
              <em>None (RSVPs saved to database only)</em>
            </MenuItem>
            {sheets.map((sheet) => (
              <MenuItem key={sheet.id} value={sheet.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography>{sheet.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(getSheetUrl(sheet.id), '_blank');
                    }}
                    sx={{ ml: 1 }}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip title="Refresh sheets list">
          <IconButton onClick={handleRefresh} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {helperText && !fetchError && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {fetchError && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {fetchError}
          {fetchError.includes('No Google Sheets found') && (
            <Box sx={{ mt: 1 }}>
              <Link
                href="https://docs.google.com/spreadsheets/create"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
              >
                Create a new Google Sheet
                <OpenInNewIcon fontSize="small" />
              </Link>
            </Box>
          )}
        </Alert>
      )}

      {value && !loading && (
        <Box sx={{ mt: 1 }}>
          <Link
            href={getSheetUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            Open selected sheet
            <OpenInNewIcon fontSize="small" />
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default GoogleSheetsSelector;
