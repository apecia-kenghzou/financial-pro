import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer } from 'react-konva';
import { Box, Paper, Typography, IconButton, Toolbar, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const { canvasElements, setCanvasElements, removeCanvasElement } = useCardContext();
  const [selectedId, setSelectedId] = useState(null);
  const [stageDimensions] = useState({ width: 800, height: 600 });
  const stageRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const stage = stageRef.current;

    stage.setPointersPositions(e);
    const pos = stage.getPointerPosition();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const newElement = {
            id: `img-${Date.now()}`,
            type: 'image',
            src: event.target.result,
            x: pos.x,
            y: pos.y,
            width: img.width > 300 ? 300 : img.width,
            height: img.height > 300 ? (300 / img.width) * img.height : img.height,
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Canvas Editor
          </Typography>
          <Stack direction="row" spacing={1}>
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
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Stage
            ref={stageRef}
            width={stageDimensions.width}
            height={stageDimensions.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            style={{ backgroundColor: 'white' }}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={stageDimensions.width}
                height={stageDimensions.height}
                fill="white"
              />
              {canvasElements.map((element) => (
                <CanvasImageElement
                  key={element.id}
                  element={element}
                  isSelected={element.id === selectedId}
                  onSelect={() => setSelectedId(element.id)}
                  onChange={(newAttrs) => {
                    const elements = canvasElements.slice();
                    const index = elements.findIndex((el) => el.id === element.id);
                    elements[index] = newAttrs;
                    setCanvasElements(elements);
                  }}
                />
              ))}
            </Layer>
          </Stage>

          {canvasElements.length === 0 && (
            <Box
              sx={{
                position: 'absolute',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Drag and drop PNG images here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Or click to upload
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CanvasEditor;
