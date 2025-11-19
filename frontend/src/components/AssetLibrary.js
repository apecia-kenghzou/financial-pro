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
  Chip,
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import BorderStyleIcon from '@mui/icons-material/BorderStyle';
import StarIcon from '@mui/icons-material/Star';
import { useCardContext } from '../context/CardContext';

// Asset categories with sample items
// In production, these would be actual image files in public/assets/
const ASSET_CATEGORIES = [
  {
    id: 'flowers',
    name: 'Flowers',
    icon: <LocalFloristIcon />,
    items: [
      {
        id: 'flower-rose-red',
        name: 'Red Rose',
        src: 'https://cdn.pixabay.com/photo/2017/07/21/23/57/flower-2526874_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/07/21/23/57/flower-2526874_640.png',
        width: 300,
        height: 400,
      },
      {
        id: 'flower-rose-pink',
        name: 'Pink Rose',
        src: 'https://cdn.pixabay.com/photo/2013/07/21/13/00/rose-165819_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2013/07/21/13/00/rose-165819_640.png',
        width: 300,
        height: 350,
      },
      {
        id: 'flower-sunflower',
        name: 'Sunflower',
        src: 'https://cdn.pixabay.com/photo/2017/10/05/21/30/sunflower-2821896_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/10/05/21/30/sunflower-2821896_640.png',
        width: 350,
        height: 350,
      },
      {
        id: 'flower-lily',
        name: 'White Lily',
        src: 'https://cdn.pixabay.com/photo/2014/04/03/00/40/lily-308977_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2014/04/03/00/40/lily-308977_640.png',
        width: 300,
        height: 400,
      },
      {
        id: 'flower-tulip',
        name: 'Tulip',
        src: 'https://cdn.pixabay.com/photo/2013/07/12/15/58/tulip-150682_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2013/07/12/15/58/tulip-150682_640.png',
        width: 250,
        height: 400,
      },
      {
        id: 'flower-cherry-blossom',
        name: 'Cherry Blossom',
        src: 'https://cdn.pixabay.com/photo/2017/03/27/14/47/cherry-blossom-2178870_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/03/27/14/47/cherry-blossom-2178870_640.png',
        width: 400,
        height: 300,
      },
    ],
  },
  {
    id: 'patterns',
    name: 'Borders & Patterns',
    icon: <BorderStyleIcon />,
    items: [
      {
        id: 'pattern-corner-gold',
        name: 'Gold Corner',
        src: 'https://cdn.pixabay.com/photo/2017/03/01/10/03/decorative-2108075_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/03/01/10/03/decorative-2108075_640.png',
        width: 200,
        height: 200,
      },
      {
        id: 'pattern-border-floral',
        name: 'Floral Border',
        src: 'https://cdn.pixabay.com/photo/2017/08/26/23/39/floral-2685135_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/08/26/23/39/floral-2685135_640.png',
        width: 600,
        height: 150,
      },
      {
        id: 'pattern-divider-elegant',
        name: 'Elegant Divider',
        src: 'https://cdn.pixabay.com/photo/2016/03/31/20/51/divider-1295311_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2016/03/31/20/51/divider-1295311_640.png',
        width: 500,
        height: 100,
      },
      {
        id: 'pattern-frame-vintage',
        name: 'Vintage Frame',
        src: 'https://cdn.pixabay.com/photo/2017/03/01/10/03/decorative-2108076_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/03/01/10/03/decorative-2108076_640.png',
        width: 400,
        height: 400,
      },
    ],
  },
  {
    id: 'decorations',
    name: 'Decorations',
    icon: <StarIcon />,
    items: [
      {
        id: 'deco-heart-red',
        name: 'Red Heart',
        src: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/heart-1295303_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/heart-1295303_640.png',
        width: 250,
        height: 250,
      },
      {
        id: 'deco-ribbon-gold',
        name: 'Gold Ribbon',
        src: 'https://cdn.pixabay.com/photo/2017/01/31/16/31/ribbon-2025284_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2017/01/31/16/31/ribbon-2025284_640.png',
        width: 300,
        height: 200,
      },
      {
        id: 'deco-rings-wedding',
        name: 'Wedding Rings',
        src: 'https://cdn.pixabay.com/photo/2012/04/13/20/37/wedding-rings-33593_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2012/04/13/20/37/wedding-rings-33593_640.png',
        width: 300,
        height: 200,
      },
      {
        id: 'deco-butterfly',
        name: 'Butterfly',
        src: 'https://cdn.pixabay.com/photo/2016/11/29/02/05/butterfly-1866669_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2016/11/29/02/05/butterfly-1866669_640.png',
        width: 300,
        height: 250,
      },
      {
        id: 'deco-dove',
        name: 'Dove',
        src: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/dove-1295302_1280.png',
        thumb: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/dove-1295302_640.png',
        width: 300,
        height: 250,
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
          💡 Assets are free to use from Pixabay. Click any asset to add it to your current page.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AssetLibrary;
