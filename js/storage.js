/**
 * Storage Module - Handles LocalStorage persistence
 */

const Storage = {
  WORKOUT_KEY: 'murph_workout_state',
  THEME_KEY: 'murph_theme',
  
  /**
   * Get default workout state
   */
  getDefaultState() {
    return {
      timerEnabled: true,
      startTime: null,
      elapsedTime: 0,
      isPaused: false,
      isComplete: false,
      sections: [
        { 
          id: 'run1', 
          name: 'Mile Run #1', 
          type: 'checkbox', 
          completed: false,
          icon: '🏃'
        },
        { 
          id: 'pullups', 
          name: 'Pull-ups', 
          type: 'reps', 
          total: 100, 
          completed: 0,
          lastAction: null,
          icon: '💪'
        },
        { 
          id: 'pushups', 
          name: 'Push-ups', 
          type: 'reps', 
          total: 200, 
          completed: 0,
          lastAction: null,
          icon: '🫸'
        },
        { 
          id: 'squats', 
          name: 'Squats', 
          type: 'reps', 
          total: 300, 
          completed: 0,
          lastAction: null,
          icon: '🦵'
        },
        { 
          id: 'run2', 
          name: 'Mile Run #2', 
          type: 'checkbox', 
          completed: false,
          icon: '🏃'
        }
      ]
    };
  },
  
  /**
   * Save workout state to LocalStorage
   */
  saveWorkout(state) {
    try {
      localStorage.setItem(this.WORKOUT_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Failed to save workout state:', e);
      return false;
    }
  },
  
  /**
   * Load workout state from LocalStorage
   */
  loadWorkout() {
    try {
      const saved = localStorage.getItem(this.WORKOUT_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        // Validate the state has required fields
        if (state && state.sections && Array.isArray(state.sections)) {
          return state;
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to load workout state:', e);
      return null;
    }
  },
  
  /**
   * Check if there's an in-progress workout
   */
  hasActiveWorkout() {
    const state = this.loadWorkout();
    if (!state) return false;
    
    // Check if workout has any progress
    const hasProgress = state.sections.some(section => {
      if (section.type === 'checkbox') return section.completed;
      if (section.type === 'reps') return section.completed > 0;
      return false;
    });
    
    return hasProgress && !state.isComplete;
  },
  
  /**
   * Clear saved workout
   */
  clearWorkout() {
    try {
      localStorage.removeItem(this.WORKOUT_KEY);
      return true;
    } catch (e) {
      console.error('Failed to clear workout state:', e);
      return false;
    }
  },
  
  /**
   * Save theme preference
   */
  saveTheme(isDark) {
    try {
      localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
      return true;
    } catch (e) {
      console.error('Failed to save theme:', e);
      return false;
    }
  },
  
  /**
   * Load theme preference
   */
  loadTheme() {
    try {
      const theme = localStorage.getItem(this.THEME_KEY);
      if (theme) {
        return theme === 'dark';
      }
      // Default to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return true; // Default to dark
    }
  }
};

// Export for use in other modules
window.Storage = Storage;
