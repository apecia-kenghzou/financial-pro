import React, { createContext, useContext, useState } from 'react';

const CardContext = createContext();

export const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
};

export const CardProvider = ({ children }) => {
  const [currentCard, setCurrentCard] = useState(null);
  const [canvasElements, setCanvasElements] = useState([]);
  const [eventDetails, setEventDetails] = useState({
    location: '',
    dateTime: null,
    description: '',
  });
  const [googleSheetId, setGoogleSheetId] = useState('');

  const addCanvasElement = (element) => {
    setCanvasElements([...canvasElements, element]);
  };

  const updateCanvasElement = (id, updates) => {
    setCanvasElements(
      canvasElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const removeCanvasElement = (id) => {
    setCanvasElements(canvasElements.filter((el) => el.id !== id));
  };

  const clearCanvas = () => {
    setCanvasElements([]);
  };

  const resetCard = () => {
    setCurrentCard(null);
    setCanvasElements([]);
    setEventDetails({
      location: '',
      dateTime: null,
      description: '',
    });
    setGoogleSheetId('');
  };

  const value = {
    currentCard,
    setCurrentCard,
    canvasElements,
    setCanvasElements,
    addCanvasElement,
    updateCanvasElement,
    removeCanvasElement,
    clearCanvas,
    eventDetails,
    setEventDetails,
    googleSheetId,
    setGoogleSheetId,
    resetCard,
  };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};
