// src/hooks/useLocalStorage.js
import { useState } from 'react';

/**
 * A custom hook for managing state in localStorage.
 * @param {string} key - The key for the localStorage item.
 * @param {*} initialValue - The initial value if nothing is in localStorage.
 * @returns {[*, function]} A stateful value and a function to update it.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
