import React, { createContext, useContext, useState } from 'react';

const CardContext = createContext();

// A4 dimensions at 96 DPI (web standard)
export const A4_DIMENSIONS = {
  width: 794,   // 210mm × 96 DPI ÷ 25.4
  height: 1123, // 297mm × 96 DPI ÷ 25.4
  dpi: 96,
};

export const MAX_PAGES = 3;

export const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
};

export const CardProvider = ({ children }) => {
  const [currentCard, setCurrentCard] = useState(null);

  // Multi-page structure
  const [pages, setPages] = useState([
    { id: 1, elements: [] }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Legacy: Keep for backward compatibility
  const [canvasElements, setCanvasElements] = useState([]);

  const [eventDetails, setEventDetails] = useState({
    location: '',
    dateTime: null,
    description: '',
  });
  const [googleSheetId, setGoogleSheetId] = useState('');

  // Get current page
  const getCurrentPage = () => pages[currentPageIndex];

  // Get current page elements
  const getCurrentPageElements = () => pages[currentPageIndex]?.elements || [];

  // Set elements for current page
  const setCurrentPageElements = (elements) => {
    setPages(pages.map((page, index) =>
      index === currentPageIndex
        ? { ...page, elements }
        : page
    ));
  };

  // Add element to current page
  const addCanvasElement = (element) => {
    const currentElements = getCurrentPageElements();
    setCurrentPageElements([...currentElements, element]);
  };

  // Update element on current page
  const updateCanvasElement = (id, updates) => {
    const currentElements = getCurrentPageElements();
    setCurrentPageElements(
      currentElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Remove element from current page
  const removeCanvasElement = (id) => {
    const currentElements = getCurrentPageElements();
    setCurrentPageElements(currentElements.filter((el) => el.id !== id));
  };

  // Clear current page
  const clearCurrentPage = () => {
    setCurrentPageElements([]);
  };

  // Clear all pages
  const clearAllPages = () => {
    setPages([{ id: 1, elements: [] }]);
    setCurrentPageIndex(0);
  };

  // Add new page
  const addPage = () => {
    if (pages.length < MAX_PAGES) {
      const newPage = {
        id: pages.length + 1,
        elements: []
      };
      setPages([...pages, newPage]);
      setCurrentPageIndex(pages.length); // Switch to new page
    }
  };

  // Remove page
  const removePage = (pageIndex) => {
    if (pages.length > 1) {
      const newPages = pages.filter((_, index) => index !== pageIndex);
      // Renumber pages
      const renumberedPages = newPages.map((page, index) => ({
        ...page,
        id: index + 1
      }));
      setPages(renumberedPages);

      // Adjust current page index if needed
      if (currentPageIndex >= renumberedPages.length) {
        setCurrentPageIndex(renumberedPages.length - 1);
      } else if (currentPageIndex > pageIndex) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
    }
  };

  // Go to specific page
  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPageIndex(pageIndex);
    }
  };

  // Reset everything
  const resetCard = () => {
    setCurrentCard(null);
    setPages([{ id: 1, elements: [] }]);
    setCurrentPageIndex(0);
    setCanvasElements([]); // Legacy
    setEventDetails({
      location: '',
      dateTime: null,
      description: '',
    });
    setGoogleSheetId('');
  };

  // Backward compatibility: sync pages with canvasElements
  // When loading old cards, convert flat elements to pages
  const loadLegacyCard = (elements) => {
    setPages([{ id: 1, elements }]);
    setCanvasElements(elements);
    setCurrentPageIndex(0);
  };

  const value = {
    // Card
    currentCard,
    setCurrentCard,

    // Multi-page
    pages,
    setPages,
    currentPageIndex,
    setCurrentPageIndex,
    getCurrentPage,
    getCurrentPageElements,
    setCurrentPageElements,
    addPage,
    removePage,
    goToPage,
    clearAllPages,

    // Canvas elements (current page)
    canvasElements: getCurrentPageElements(), // For backward compatibility
    setCanvasElements: setCurrentPageElements,
    addCanvasElement,
    updateCanvasElement,
    removeCanvasElement,
    clearCanvas: clearCurrentPage,

    // Event details
    eventDetails,
    setEventDetails,

    // Google Sheets
    googleSheetId,
    setGoogleSheetId,

    // Reset
    resetCard,
    loadLegacyCard,

    // Constants
    A4_DIMENSIONS,
    MAX_PAGES,
  };

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};
