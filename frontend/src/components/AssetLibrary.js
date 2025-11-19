import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import BorderStyleIcon from '@mui/icons-material/BorderStyle';
import StarIcon from '@mui/icons-material/Star';
import { useCardContext } from '../context/CardContext';

// Asset categories with working image sources
const ASSET_CATEGORIES = [
  {
    id: 'flowers',
    name: 'Flowers',
    icon: <LocalFloristIcon />,
    items: [
      {
        id: 'flower-rose-red',
        name: 'Red Rose',
        src: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop',
        width: 300,
        height: 400,
      },
      {
        id: 'flower-rose-pink',
        name: 'Pink Rose',
        src: 'https://images.unsplash.com/photo-1597690155254-d7cbc8c2c9e5?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1597690155254-d7cbc8c2c9e5?w=200&h=200&fit=crop',
        width: 300,
        height: 350,
      },
      {
        id: 'flower-sunflower',
        name: 'Sunflower',
        src: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?w=200&h=200&fit=crop',
        width: 350,
        height: 350,
      },
      {
        id: 'flower-lily',
        name: 'White Lily',
        src: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1524386416438-98b9b2d4b433?w=200&h=200&fit=crop',
        width: 300,
        height: 400,
      },
      {
        id: 'flower-tulip',
        name: 'Tulip',
        src: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=200&h=200&fit=crop',
        width: 250,
        height: 400,
      },
      {
        id: 'flower-orchid',
        name: 'Orchid',
        src: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop',
        width: 300,
        height: 400,
      },
    ],
  },
  {
    id: 'patterns',
    name: 'Borders & Patterns',
    icon: <BorderStyleIcon />,
    items: [
      {
        id: 'pattern-gold-frame',
        name: 'Gold Frame',
        src: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=400&h=400&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=200&h=200&fit=crop',
        width: 400,
        height: 400,
      },
      {
        id: 'pattern-floral-border',
        name: 'Floral Border',
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=150&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=100&fit=crop',
        width: 600,
        height: 150,
      },
      {
        id: 'pattern-elegant-border',
        name: 'Elegant Border',
        src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&h=100&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=100&fit=crop',
        width: 500,
        height: 100,
      },
      {
        id: 'pattern-corner-ornament',
        name: 'Corner Ornament',
        src: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop',
        width: 200,
        height: 200,
      },
    ],
  },
  {
    id: 'decorations',
    name: 'Decorations',
    icon: <StarIcon />,
    items: [
      {
        id: 'deco-heart',
        name: 'Heart',
        // SVG data URL for a heart shape - guaranteed to work
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTI1IDIzMGMtMy00LTc1LTc1LTc1LTEyMCAwLTI1IDIwLTQ1IDQ1LTQ1IDIwIDAgMzUgMTAgNDUgMjUgMTAtMTUgMjUtMjUgNDUtMjUgMjUgMCA0NSAyMCA0NSA0NSAwIDQ1LTcyIDExNi03NSAxMjB6IiBmaWxsPSIjZmYxNzQ0Ii8+PC9zdmc+',
        thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTI1IDIzMGMtMy00LTc1LTc1LTc1LTEyMCAwLTI1IDIwLTQ1IDQ1LTQ1IDIwIDAgMzUgMTAgNDUgMjUgMTAtMTUgMjUtMjUgNDUtMjUgMjUgMCA0NSAyMCA0NSA0NSAwIDQ1LTcyIDExNi03NSAxMjB6IiBmaWxsPSIjZmYxNzQ0Ii8+PC9zdmc+',
        width: 250,
        height: 250,
      },
      {
        id: 'deco-star',
        name: 'Star',
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjEyNSwyNSAxNTAsMTAwIDE3NSwxMDAgMTI1LDE1MCA3NSwyMjUgMTAwLDE1MCAyNSwxMDAgNTAsMTAwIiBmaWxsPSIjZmZkNzAwIi8+PC9zdmc+',
        thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cG9seWdvbiBwb2ludHM9IjEyNSwyNSAxNTAsMTAwIDE3NSwxMDAgMTI1LDE1MCA3NSwyMjUgMTAwLDE1MCAyNSwxMDAgNTAsMTAwIiBmaWxsPSIjZmZkNzAwIi8+PC9zdmc+',
        width: 250,
        height: 250,
      },
      {
        id: 'deco-butterfly',
        name: 'Butterfly',
        src: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=300&h=250&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=200&h=200&fit=crop',
        width: 300,
        height: 250,
      },
      {
        id: 'deco-bird',
        name: 'Bird',
        src: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=300&h=250&fit=crop',
        thumb: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop',
        width: 300,
        height: 250,
      },
      {
        id: 'deco-ribbon',
        name: 'Gold Ribbon',
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI1MCIgeT0iNzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmQ3MDAiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMTMwIDUwLDE4MCA3NSwxNTUiIGZpbGw9IiNmZmQ3MDAiLz48cG9seWdvbiBwb2ludHM9IjI1MCwxMzAgMjUwLDE4MCAyMjUsMTU1IiBmaWxsPSIjZmZkNzAwIi8+PC9zdmc+',
        thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI1MCIgeT0iNzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmQ3MDAiIHJ4PSIxMCIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMTMwIDUwLDE4MCA3NSwxNTUiIGZpbGw9IiNmZmQ3MDAiLz48cG9seWdvbiBwb2ludHM9IjI1MCwxMzAgMjUwLDE4MCAyMjUsMTU1IiBmaWxsPSIjZmZkNzAwIi8+PC9zdmc+',
        width: 300,
        height: 200,
      },
    ],
  },
];

const AssetLibrary = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { addCanvasElement } = useCardContext();

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAssetClick = (asset) => {
    // Add asset to canvas at center position with random offset
    const randomOffset = () => Math.floor(Math.random() * 100) - 50;

    const newElement = {
      id: `${asset.id}-${Date.now()}`,
      type: 'image',
      src: asset.src,
      x: 200 + randomOffset(),
      y: 200 + randomOffset(),
      width: asset.width || 200,
      height: asset.height || 200,
      rotation: 0,
      isDragging: false,
    };

    addCanvasElement(newElement);
  };

  const currentCategory = ASSET_CATEGORIES[selectedTab];

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Asset Library
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Click on any asset to add it to your canvas
        </Typography>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {ASSET_CATEGORIES.map((category, index) => (
          <Tab
            key={category.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {category.icon}
                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {category.name}
                </Typography>
              </Box>
            }
          />
        ))}
      </Tabs>

      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Grid container spacing={1.5}>
          {currentCategory.items.map((asset) => (
            <Grid item xs={6} sm={4} key={asset.id}>
              <Tooltip title={`Click to add ${asset.name}`} arrow>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleAssetClick(asset)}
                >
                  <CardMedia
                    component="img"
                    image={asset.thumb}
                    alt={asset.name}
                    sx={{
                      height: 100,
                      objectFit: 'contain',
                      bgcolor: 'grey.50',
                      p: 1,
                    }}
                  />
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="caption" display="block" textAlign="center" noWrap>
                      {asset.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 Click any asset to add it to your current page. Drag to position, resize as needed.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AssetLibrary;
