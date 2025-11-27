
import { useEffect } from 'react';
import { useStore } from '../store';

export const useKeyboardShortcuts = () => {
  const { 
    undo, redo, removeLayer, selectedLayerId, selectLayer 
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete: Backspace or Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          removeLayer(selectedLayerId);
        }
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        selectLayer(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, removeLayer, selectedLayerId, selectLayer]);
};
