import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from 'react-konva';
import { Box, Paper, Typography, IconButton, Toolbar, Stack, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import useImage from 'use-image';
import { useCardContext } from '../context/CardContext';

// Component for rendering an image on canvas
const CanvasImageElement = ({ element, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image] = useImage(element.src);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const CanvasEditor = () => {
  const {
    canvasElements,
    setCanvasElements,
    updateCanvasElement,
    removeCanvasElement,
    A4_DIMENSIONS,
    currentPageIndex,
    pages,
  } = useCardContext();

  const [selectedId, setSelectedId] = useState(null);
  const stageRef = useRef();
  const fileInputRef = useRef();

  // Calculate scale to fit canvas in viewport while maintaining A4 ratio
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const calculateScale = () => {
      const maxWidth = window.innerWidth > 1200 ? 800 : window.innerWidth - 100;
      const maxHeight = window.innerHeight - 300;
      const scaleX = maxWidth / A4_DIMENSIONS.width;
      const scaleY = maxHeight / A4_DIMENSIONS.height;
      setScale(Math.min(scaleX, scaleY, 1));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [A4_DIMENSIONS]);

  const handleDrop = (e) => {
    e.preventDefault();
    const stage = stageRef.current;

    stage.setPointersPositions(e);
    const pos = stage.getPointerPosition();

    // Adjust for scale
    const adjustedX = pos.x / scale;
    const adjustedY = pos.y / scale;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const maxSize = 400;
          const imgScale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const newElement = {
            id: `img-${Date.now()}`,
            type: 'image',
            src: event.target.result,
            x: adjustedX,
            y: adjustedY,
            width: img.width * imgScale,
            height: img.height * imgScale,
            rotation: 0,
          };
          setCanvasElements([...canvasElements, newElement]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const maxSize = 400;
          const imgScale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const newElement = {
            id: `img-${Date.now()}`,
            type: 'image',
            src: event.target.result,
            x: A4_DIMENSIONS.width / 2 - (img.width * imgScale) / 2,
            y: A4_DIMENSIONS.height / 2 - (img.height * imgScale) / 2,
            width: img.width * imgScale,
            height: img.height * imgScale,
            rotation: 0,
          };
          setCanvasElements([...canvasElements, newElement]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      removeCanvasElement(selectedId);
      setSelectedId(null);
    }
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar sx={{ px: 0, minHeight: '48px !important' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              A4 Canvas
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip
                label={`Page ${currentPageIndex + 1}/${pages.length}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${A4_DIMENSIONS.width} × ${A4_DIMENSIONS.height}px`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              title="Upload image"
            >
              <CloudUploadIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={handleDelete}
              disabled={!selectedId}
              title="Delete selected element"
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Toolbar>

        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            position: 'relative',
            overflow: 'auto',
            p: 2,
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* A4 Canvas with scale */}
          <Box
            sx={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Stage
              ref={stageRef}
              width={A4_DIMENSIONS.width * scale}
              height={A4_DIMENSIONS.height * scale}
              scaleX={scale}
              scaleY={scale}
              onMouseDown={checkDeselect}
              onTouchStart={checkDeselect}
            >
              <Layer>
                {/* White background */}
                <Rect
                  x={0}
                  y={0}
                  width={A4_DIMENSIONS.width}
                  height={A4_DIMENSIONS.height}
                  fill="white"
                />

                {/* Grid lines for A4 guides (optional) */}
                {/* Vertical center line */}
                <Rect
                  x={A4_DIMENSIONS.width / 2 - 0.5}
                  y={0}
                  width={1}
                  height={A4_DIMENSIONS.height}
                  fill="#e0e0e0"
                  opacity={0.3}
                />
                {/* Horizontal center line */}
                <Rect
                  x={0}
                  y={A4_DIMENSIONS.height / 2 - 0.5}
                  width={A4_DIMENSIONS.width}
                  height={1}
                  fill="#e0e0e0"
                  opacity={0.3}
                />

                {/* Render current page elements */}
                {canvasElements.map((element) => (
                  <CanvasImageElement
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                    onSelect={() => setSelectedId(element.id)}
                    onChange={(newAttrs) => {
                      updateCanvasElement(element.id, newAttrs);
                    }}
                  />
                ))}
              </Layer>
            </Stage>
          </Box>

          {/* Empty state */}
          {canvasElements.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Drag and drop images here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                or click the upload button
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                A4 size: 210mm × 297mm ({A4_DIMENSIONS.width}×{A4_DIMENSIONS.height}px)
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CanvasEditor;
