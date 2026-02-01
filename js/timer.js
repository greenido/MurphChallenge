/**
 * Timer Module - Handles workout timer functionality
 */

const Timer = {
  intervalId: null,
  
  /**
   * Format milliseconds to HH:MM:SS
   */
  format(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  },
  
  /**
   * Get current elapsed time based on state
   */
  getElapsed(state) {
    if (!state.timerEnabled) return 0;
    
    if (state.isPaused || !state.startTime) {
      return state.elapsedTime;
    }
    
    return state.elapsedTime + (Date.now() - state.startTime);
  },
  
  /**
   * Start the timer
   */
  start(state, onTick) {
    if (!state.timerEnabled) return state;
    
    // Clear any existing interval
    this.stop();
    
    // Update state
    const newState = {
      ...state,
      startTime: Date.now(),
      isPaused: false
    };
    
    // Start interval for display updates
    this.intervalId = setInterval(() => {
      if (onTick) {
        onTick(this.getElapsed(newState));
      }
    }, 100);
    
    return newState;
  },
  
  /**
   * Pause the timer
   */
  pause(state) {
    if (!state.timerEnabled || state.isPaused) return state;
    
    // Stop the interval
    this.stop();
    
    // Calculate elapsed time
    const elapsed = this.getElapsed(state);
    
    return {
      ...state,
      elapsedTime: elapsed,
      startTime: null,
      isPaused: true
    };
  },
  
  /**
   * Resume the timer
   */
  resume(state, onTick) {
    if (!state.timerEnabled || !state.isPaused) return state;
    
    return this.start({
      ...state,
      isPaused: false
    }, onTick);
  },
  
  /**
   * Stop the timer interval (doesn't reset state)
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },
  
  /**
   * Reset the timer
   */
  reset() {
    this.stop();
    return {
      startTime: null,
      elapsedTime: 0,
      isPaused: false
    };
  },
  
  /**
   * Initialize timer from saved state
   */
  initialize(state, onTick) {
    if (!state.timerEnabled) return state;
    
    // If timer was running (not paused and has start time), resume the interval
    if (!state.isPaused && state.startTime) {
      this.intervalId = setInterval(() => {
        if (onTick) {
          onTick(this.getElapsed(state));
        }
      }, 100);
    }
    // If paused, just return state as-is
    // The elapsed time is already saved
    
    return state;
  }
};

// Export for use in other modules
window.Timer = Timer;
