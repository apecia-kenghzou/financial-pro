import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useCardContext } from '../context/CardContext';

const PageNavigator = () => {
  const {
    pages,
    currentPageIndex,
    goToPage,
    addPage,
    removePage,
    MAX_PAGES,
  } = useCardContext();

  const canAddPage = pages.length < MAX_PAGES;
  const canRemovePage = pages.length > 1;
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pages.length - 1;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Title */}
      <Typography variant="h6" fontWeight="600">
        Pages
      </Typography>

      {/* Current Page Info */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current Page
        </Typography>
        <Chip
          label={`${currentPageIndex + 1} / ${pages.length}`}
          color="primary"
          sx={{ fontWeight: 600, fontSize: '1rem', px: 1 }}
        />
      </Box>

      {/* Page Navigation */}
      <Stack direction="row" spacing={1} justifyContent="center">
        <Tooltip title="Previous Page">
          <span>
            <IconButton
              onClick={() => goToPage(currentPageIndex - 1)}
              disabled={isFirstPage}
              color="primary"
            >
              <NavigateBeforeIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Next Page">
          <span>
            <IconButton
              onClick={() => goToPage(currentPageIndex + 1)}
              disabled={isLastPage}
              color="primary"
            >
              <NavigateNextIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* Page Thumbnails */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {pages.map((page, index) => (
          <Box
            key={page.id}
            onClick={() => goToPage(index)}
            sx={{
              p: 1.5,
              border: 2,
              borderColor: index === currentPageIndex ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              bgcolor: index === currentPageIndex ? 'primary.50' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 56,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  bgcolor: 'white',
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  A4
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Page {page.id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {page.elements.length} {page.elements.length === 1 ? 'element' : 'elements'}
                </Typography>
              </Box>
            </Stack>

            {canRemovePage && (
              <Tooltip title="Delete Page">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete page ${page.id}?`)) {
                      removePage(index);
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))}
      </Box>

      {/* Add Page Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addPage}
        disabled={!canAddPage}
        fullWidth
        sx={{ textTransform: 'none' }}
      >
        Add Page {!canAddPage && `(Max ${MAX_PAGES})`}
      </Button>

      {/* Info */}
      <Box sx={{ mt: 1, p: 1.5, bgcolor: 'info.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Each page is A4-sized (794×1123px). You can have up to {MAX_PAGES} pages.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PageNavigator;
