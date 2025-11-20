import React from 'react';
import { Box, Typography, Button } from '@mui/material';

/**
 * EmptyState Component
 * Displays a friendly empty state with icon, message, and optional CTA
 */
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction 
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minHeight: '400px',
        justifyContent: 'center',
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          fontSize: 80,
          opacity: 0.3,
          mb: 2,
          color: 'primary.main',
          '& svg': {
            fontSize: 'inherit',
          },
        }}
      >
        {icon}
      </Box>

      {/* Title */}
      <Typography 
        variant="h5" 
        fontWeight="600" 
        gutterBottom
        sx={{ color: 'text.primary' }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          maxWidth: 500,
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && (
            <Button
              variant="contained"
              size="large"
              onClick={onAction}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                },
              }}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outlined"
              size="large"
              onClick={onSecondaryAction}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
