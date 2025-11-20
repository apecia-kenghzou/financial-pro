import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

/**
 * SaveIndicator Component
 * Shows the current save status with appropriate icon and message
 */
const SaveIndicator = ({ status = 'saved', lastSaved = null }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'saving':
                return {
                    icon: <CircularProgress size={16} />,
                    text: 'Saving...',
                    color: 'text.secondary',
                };
            case 'saved':
                return {
                    icon: <CheckCircleIcon fontSize="small" />,
                    text: lastSaved ? `Saved ${lastSaved}` : 'All changes saved',
                    color: 'success.main',
                };
            case 'error':
                return {
                    icon: <ErrorIcon fontSize="small" />,
                    text: 'Failed to save',
                    color: 'error.main',
                };
            case 'unsaved':
                return {
                    icon: <CloudUploadIcon fontSize="small" />,
                    text: 'Unsaved changes',
                    color: 'warning.main',
                };
            default:
                return {
                    icon: null,
                    text: '',
                    color: 'text.secondary',
                };
        }
    };

    const config = getStatusConfig();

    if (!config.text) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: status === 'saved' ? 'success.lighter' : 'background.paper',
                border: 1,
                borderColor: status === 'saved' ? 'success.light' : 'divider',
                transition: 'all 0.3s ease',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: config.color,
                }}
            >
                {config.icon}
            </Box>
            <Typography
                variant="caption"
                sx={{
                    color: config.color,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                }}
            >
                {config.text}
            </Typography>
        </Box>
    );
};

export default SaveIndicator;
