import { HistoryItem, PromptElements } from '../types';

const HISTORY_KEY = 'promptArtisanHistory';

// Get all history items, sorted by most recent first
export const getHistory = (): HistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (!historyJson) return [];
    const history = JSON.parse(historyJson) as HistoryItem[];
    // Sort by createdAt date, descending
    return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
};

// Save a prompt. Updates if ID exists, creates if not. Returns the ID.
export const saveHistoryItem = (itemData: { id?: string; idea: string; prompt: PromptElements }): string => {
  let history = getHistory();
  let itemId = itemData.id;

  if (itemId) {
    const itemIndex = history.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      // Update existing item and move it to the top
      const updatedItem = { ...history[itemIndex], ...itemData, id: itemId };
      history.splice(itemIndex, 1);
      history.unshift(updatedItem);
    } else {
      // If ID was provided but not found, treat as a new item
      itemId = undefined; 
    }
  } 
  
  if (!itemId) {
    // Create new item
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      idea: itemData.idea,
      prompt: itemData.prompt,
    };
    history.unshift(newItem); // Add to the beginning
    itemId = newItem.id;
  }
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save history to localStorage", error);
  }

  return itemId;
};
