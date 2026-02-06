/**
 * Storage Module - Handles LocalStorage persistence & IndexedDB workout history
 */

const Storage = {
  WORKOUT_KEY: 'murph_workout_state',
  THEME_KEY: 'murph_theme',
  
  /**
   * Get default workout state
   * @param {string} workoutMode - 'full', 'half', or 'quarter'
   */
  getDefaultState(workoutMode = 'full') {
    const multiplier = workoutMode === 'quarter' ? 0.25 : workoutMode === 'half' ? 0.5 : 1;
    const isHalfMurph = workoutMode === 'half';
    const isQuarterMurph = workoutMode === 'quarter';

    const runLabel = isQuarterMurph ? 'Quarter Mile Run' : isHalfMurph ? 'Half Mile Run' : 'Mile Run';

    return {
      timerEnabled: true,
      workoutMode: workoutMode,
      isHalfMurph: isHalfMurph,
      isQuarterMurph: isQuarterMurph,
      startTime: null,
      elapsedTime: 0,
      isPaused: false,
      isComplete: false,
      sections: [
        { 
          id: 'run1', 
          name: `${runLabel} #1`, 
          type: 'checkbox', 
          completed: false,
          icon: '🏃'
        },
        { 
          id: 'pullups', 
          name: 'Pull-ups', 
          type: 'reps', 
          total: Math.round(100 * multiplier), 
          completed: 0,
          lastAction: null,
          icon: '💪'
        },
        { 
          id: 'pushups', 
          name: 'Push-ups', 
          type: 'reps', 
          total: Math.round(200 * multiplier), 
          completed: 0,
          lastAction: null,
          icon: '🫸'
        },
        { 
          id: 'squats', 
          name: 'Squats', 
          type: 'reps', 
          total: Math.round(300 * multiplier), 
          completed: 0,
          lastAction: null,
          icon: '🦵'
        },
        { 
          id: 'run2', 
          name: `${runLabel} #2`, 
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


/**
 * ResultsDB Module - IndexedDB for workout history
 */
const ResultsDB = {
  DB_NAME: 'MurphChallengeDB',
  DB_VERSION: 1,
  STORE_NAME: 'workoutResults',
  _db: null,

  /**
   * Open/create the IndexedDB database
   */
  async open() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('workoutMode', 'workoutMode', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  /**
   * Save a completed workout result
   * @param {Object} state - The completed workout state
   */
  async saveResult(state) {
    try {
      const db = await this.open();

      // Calculate summary stats
      let totalReps = 0;
      let completedRuns = 0;
      state.sections.forEach(section => {
        if (section.type === 'reps') totalReps += section.completed;
        else if (section.type === 'checkbox' && section.completed) completedRuns++;
      });

      const isFullyComplete = state.sections.every(section => {
        if (section.type === 'checkbox') return section.completed;
        return section.completed >= section.total;
      });

      const result = {
        date: new Date().toISOString(),
        workoutMode: state.workoutMode || (state.isHalfMurph ? 'half' : 'full'),
        timerEnabled: state.timerEnabled,
        elapsedTime: state.elapsedTime || 0,
        formattedTime: state.timerEnabled ? Timer.format(state.elapsedTime || 0) : 'No timer',
        totalReps: totalReps,
        completedRuns: completedRuns,
        isFullyComplete: isFullyComplete,
        sections: state.sections.map(s => ({
          id: s.id,
          name: s.name,
          type: s.type,
          total: s.total || (s.type === 'checkbox' ? 1 : 0),
          completed: s.type === 'checkbox' ? (s.completed ? 1 : 0) : s.completed,
          icon: s.icon
        }))
      };

      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.add(result);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to save result to IndexedDB:', e);
    }
  },

  /**
   * Get all workout results, sorted by date descending
   */
  async getAllResults() {
    try {
      const db = await this.open();

      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result || [];
          // Sort by date descending (newest first)
          results.sort((a, b) => new Date(b.date) - new Date(a.date));
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to load results from IndexedDB:', e);
      return [];
    }
  },

  /**
   * Delete a single result by ID
   */
  async deleteResult(id) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to delete result:', e);
      return false;
    }
  },

  /**
   * Clear all results
   */
  async clearAll() {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to clear results:', e);
      return false;
    }
  },

  /**
   * Export all results to CSV string
   */
  async exportToCSV() {
    const results = await this.getAllResults();
    if (!results.length) return null;

    // CSV Header
    const headers = [
      'Date',
      'Workout Mode',
      'Time',
      'Total Reps',
      'Runs Completed',
      'Pull-ups',
      'Push-ups',
      'Squats',
      'Fully Complete'
    ];

    const rows = results.map(r => {
      const pullups = r.sections.find(s => s.id === 'pullups');
      const pushups = r.sections.find(s => s.id === 'pushups');
      const squats = r.sections.find(s => s.id === 'squats');

      return [
        new Date(r.date).toLocaleString(),
        r.workoutMode.charAt(0).toUpperCase() + r.workoutMode.slice(1),
        r.formattedTime,
        r.totalReps,
        r.completedRuns,
        pullups ? `${pullups.completed}/${pullups.total}` : '0',
        pushups ? `${pushups.completed}/${pushups.total}` : '0',
        squats ? `${squats.completed}/${squats.total}` : '0',
        r.isFullyComplete ? 'Yes' : 'No'
      ];
    });

    // Build CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  },

  /**
   * Download CSV file
   */
  async downloadCSV() {
    const csv = await this.exportToCSV();
    if (!csv) return false;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `murph-challenge-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
};

// Export for use in other modules
window.ResultsDB = ResultsDB;
