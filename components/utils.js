// This file contains helper functions and logic in plain JavaScript format
// No JSX syntax here

// Generate sample list items for the second screen
export function getListItems() {
  return [
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
    { id: 4, text: "Item 4" }
  ];
}

// Navigation helper
export function createNavigation() {
  // Returns an object with navigation functions
  return {
    navigateToNext: function(setCurrentScreen) {
      setCurrentScreen('second');
    },
    navigateToBack: function(setCurrentScreen) {
      setCurrentScreen('first');
    }
  };
}

// A utility function for combining CSS class names
export function combineClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}