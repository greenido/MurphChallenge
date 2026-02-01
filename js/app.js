/**
 * Murph Challenge Tracker - Main Application
 */

const App = {
  state: null,
  elements: {},
  
  /**
   * Initialize the application
   */
  init() {
    this.cacheElements();
    this.initTheme();
    this.bindEvents();
    this.checkForSavedWorkout();
  },
  
  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    this.elements = {
      // Screens
      startScreen: document.getElementById('start-screen'),
      workoutScreen: document.getElementById('workout-screen'),
      completionScreen: document.getElementById('completion-screen'),
      
      // Start screen
      timerToggle: document.getElementById('timer-toggle'),
      startBtn: document.getElementById('start-btn'),
      resumeBtn: document.getElementById('resume-btn'),
      helpBtnStart: document.getElementById('help-btn-start'),
      themeToggle: document.getElementById('theme-toggle'),
      
      // Workout screen
      timerHeader: document.getElementById('timer-header'),
      noTimerHeader: document.getElementById('no-timer-header'),
      timerDisplay: document.getElementById('timer-display'),
      pauseBtn: document.getElementById('pause-btn'),
      resumeTimerBtn: document.getElementById('resume-timer-btn'),
      overallProgressBar: document.getElementById('overall-progress-bar'),
      overallProgressText: document.getElementById('overall-progress-text'),
      sectionsContainer: document.getElementById('sections-container'),
      resetWorkoutBtn: document.getElementById('reset-workout-btn'),
      finishWorkoutBtn: document.getElementById('finish-workout-btn'),
      helpBtnWorkout: document.getElementById('help-btn-workout'),
      
      // Completion screen
      finalTimeContainer: document.getElementById('final-time-container'),
      finalTime: document.getElementById('final-time'),
      newWorkoutBtn: document.getElementById('new-workout-btn'),
      
      // Modals
      helpModal: document.getElementById('help-modal'),
      helpBackdrop: document.getElementById('help-backdrop'),
      closeHelpBtn: document.getElementById('close-help-btn'),
      resetModal: document.getElementById('reset-modal'),
      resetBackdrop: document.getElementById('reset-backdrop'),
      cancelResetBtn: document.getElementById('cancel-reset-btn'),
      confirmResetBtn: document.getElementById('confirm-reset-btn')
    };
  },
  
  /**
   * Initialize theme from storage
   */
  initTheme() {
    const isDark = Storage.loadTheme();
    document.documentElement.classList.toggle('dark', isDark);
  },
  
  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Theme toggle
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Start screen
    this.elements.startBtn.addEventListener('click', () => this.startNewWorkout());
    this.elements.resumeBtn.addEventListener('click', () => this.resumeWorkout());
    this.elements.helpBtnStart.addEventListener('click', () => this.showHelp());
    
    // Workout screen
    this.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.elements.resumeTimerBtn.addEventListener('click', () => this.resumeTimer());
    this.elements.resetWorkoutBtn.addEventListener('click', () => this.showResetModal());
    this.elements.finishWorkoutBtn.addEventListener('click', () => this.finishWorkout());
    if (this.elements.helpBtnWorkout) {
      this.elements.helpBtnWorkout.addEventListener('click', () => this.showHelp());
    }
    
    // Completion screen
    this.elements.newWorkoutBtn.addEventListener('click', () => this.resetAndStart());
    
    // Help modal
    this.elements.closeHelpBtn.addEventListener('click', () => this.hideHelp());
    this.elements.helpBackdrop.addEventListener('click', () => this.hideHelp());
    
    // Reset modal
    this.elements.cancelResetBtn.addEventListener('click', () => this.hideResetModal());
    this.elements.resetBackdrop.addEventListener('click', () => this.hideResetModal());
    this.elements.confirmResetBtn.addEventListener('click', () => this.confirmReset());
  },
  
  /**
   * Toggle dark/light theme
   */
  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    Storage.saveTheme(isDark);
  },
  
  /**
   * Check for saved workout and show resume button if exists
   */
  checkForSavedWorkout() {
    if (Storage.hasActiveWorkout()) {
      this.elements.resumeBtn.classList.remove('hidden');
    }
  },
  
  /**
   * Start a new workout
   */
  startNewWorkout() {
    const timerEnabled = this.elements.timerToggle.checked;
    
    this.state = Storage.getDefaultState();
    this.state.timerEnabled = timerEnabled;
    
    if (timerEnabled) {
      this.state = Timer.start(this.state, (elapsed) => this.updateTimerDisplay(elapsed));
    }
    
    Storage.saveWorkout(this.state);
    this.showWorkoutScreen();
  },
  
  /**
   * Resume previous workout
   */
  resumeWorkout() {
    this.state = Storage.loadWorkout();
    
    if (!this.state) {
      this.startNewWorkout();
      return;
    }
    
    // Initialize timer if it was running
    if (this.state.timerEnabled && !this.state.isPaused && this.state.startTime) {
      this.state = Timer.initialize(this.state, (elapsed) => this.updateTimerDisplay(elapsed));
    }
    
    this.showWorkoutScreen();
  },
  
  /**
   * Show workout screen
   */
  showWorkoutScreen() {
    // Hide start screen, show workout screen
    this.elements.startScreen.classList.add('hidden');
    this.elements.workoutScreen.classList.remove('hidden');
    
    // Configure timer header visibility
    if (this.state.timerEnabled) {
      this.elements.timerHeader.classList.remove('hidden');
      this.elements.noTimerHeader.classList.add('hidden');
      this.updateTimerDisplay(Timer.getElapsed(this.state));
      this.updateTimerButtons();
    } else {
      this.elements.timerHeader.classList.add('hidden');
      this.elements.noTimerHeader.classList.remove('hidden');
    }
    
    this.renderSections();
    this.updateOverallProgress();
  },
  
  /**
   * Update timer display
   */
  updateTimerDisplay(elapsed) {
    this.elements.timerDisplay.textContent = Timer.format(elapsed);
  },
  
  /**
   * Update timer pause/resume buttons
   */
  updateTimerButtons() {
    if (this.state.isPaused) {
      this.elements.pauseBtn.classList.add('hidden');
      this.elements.resumeTimerBtn.classList.remove('hidden');
    } else {
      this.elements.pauseBtn.classList.remove('hidden');
      this.elements.resumeTimerBtn.classList.add('hidden');
    }
  },
  
  /**
   * Pause the timer
   */
  pauseTimer() {
    this.state = Timer.pause(this.state);
    Storage.saveWorkout(this.state);
    this.updateTimerButtons();
  },
  
  /**
   * Resume the timer
   */
  resumeTimer() {
    this.state = Timer.resume(this.state, (elapsed) => this.updateTimerDisplay(elapsed));
    Storage.saveWorkout(this.state);
    this.updateTimerButtons();
  },
  
  /**
   * Render all workout sections
   */
  renderSections() {
    this.elements.sectionsContainer.innerHTML = '';
    
    this.state.sections.forEach((section, index) => {
      const sectionEl = this.createSectionElement(section, index);
      this.elements.sectionsContainer.appendChild(sectionEl);
    });
  },
  
  /**
   * Create a section element
   */
  createSectionElement(section, index) {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg';
    div.id = `section-${section.id}`;
    
    if (section.type === 'checkbox') {
      div.innerHTML = this.createCheckboxSection(section);
    } else {
      div.innerHTML = this.createRepsSection(section);
    }
    
    // Bind events after creating
    setTimeout(() => this.bindSectionEvents(section), 0);
    
    return div;
  },
  
  /**
   * Create checkbox section HTML (for runs)
   */
  createCheckboxSection(section) {
    const isComplete = section.completed;
    
    return `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="text-3xl">${section.icon}</span>
          <div>
            <h3 class="text-xl font-bold ${isComplete ? 'line-through text-gray-400' : ''}">${section.name}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">${isComplete ? 'Completed!' : 'Tap to mark complete'}</p>
          </div>
        </div>
        <button 
          data-action="toggle-run" 
          data-section="${section.id}"
          class="btn-press w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
            isComplete 
              ? 'bg-murph-accent text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-murph-accent/20 hover:text-murph-accent'
          }"
          aria-label="${isComplete ? 'Mark incomplete' : 'Mark complete'}"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>
    `;
  },
  
  /**
   * Create reps section HTML (for pull-ups, push-ups, squats)
   */
  createRepsSection(section) {
    const remaining = section.total - section.completed;
    const percentage = Math.round((section.completed / section.total) * 100);
    const isComplete = remaining === 0;
    
    return `
      <div class="space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${section.icon}</span>
            <div>
              <h3 class="text-xl font-bold ${isComplete ? 'text-murph-accent' : ''}">${section.name}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                ${isComplete ? 'Complete!' : `${remaining} remaining`}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold ${isComplete ? 'text-murph-accent' : ''}">${section.completed}</p>
            <p class="text-sm text-gray-500">/ ${section.total}</p>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            class="progress-fill h-full rounded-full ${isComplete ? 'bg-murph-accent' : 'bg-gradient-to-r from-murph-primary to-murph-accent'}"
            style="width: ${percentage}%"
          ></div>
        </div>
        
        <!-- Controls -->
        <div class="flex items-center gap-2">
          <!-- Increment Buttons -->
          <div class="flex-1 flex gap-2">
            <button 
              data-action="add" 
              data-section="${section.id}" 
              data-amount="1"
              class="btn-press flex-1 py-4 bg-murph-accent/10 text-murph-accent font-bold text-lg rounded-xl hover:bg-murph-accent/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              ${isComplete ? 'disabled' : ''}
            >
              +1
            </button>
            <button 
              data-action="add" 
              data-section="${section.id}" 
              data-amount="5"
              class="btn-press flex-1 py-4 bg-murph-accent/10 text-murph-accent font-bold text-lg rounded-xl hover:bg-murph-accent/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              ${isComplete ? 'disabled' : ''}
            >
              +5
            </button>
            <button 
              data-action="add" 
              data-section="${section.id}" 
              data-amount="10"
              class="btn-press flex-1 py-4 bg-murph-accent/10 text-murph-accent font-bold text-lg rounded-xl hover:bg-murph-accent/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              ${isComplete ? 'disabled' : ''}
            >
              +10
            </button>
          </div>
          
          <!-- Undo Button -->
          <button 
            data-action="undo" 
            data-section="${section.id}"
            class="btn-press py-4 px-4 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            ${!section.lastAction ? 'disabled' : ''}
            aria-label="Undo last action"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * Bind events for a section
   */
  bindSectionEvents(section) {
    const sectionEl = document.getElementById(`section-${section.id}`);
    if (!sectionEl) return;
    
    // Add button events
    sectionEl.querySelectorAll('[data-action="add"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amount = parseInt(e.currentTarget.dataset.amount);
        this.addReps(section.id, amount);
      });
    });
    
    // Undo button event
    const undoBtn = sectionEl.querySelector('[data-action="undo"]');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => this.undoReps(section.id));
    }
    
    // Run toggle event
    const toggleBtn = sectionEl.querySelector('[data-action="toggle-run"]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleRun(section.id));
    }
  },
  
  /**
   * Add reps to a section
   */
  addReps(sectionId, amount) {
    const section = this.state.sections.find(s => s.id === sectionId);
    if (!section || section.type !== 'reps') return;
    
    const remaining = section.total - section.completed;
    const actualAmount = Math.min(amount, remaining);
    
    if (actualAmount <= 0) return;
    
    section.lastAction = actualAmount;
    section.completed += actualAmount;
    
    Storage.saveWorkout(this.state);
    this.updateSection(section);
    this.updateOverallProgress();
    this.checkWorkoutCompletion();
  },
  
  /**
   * Undo last rep addition
   */
  undoReps(sectionId) {
    const section = this.state.sections.find(s => s.id === sectionId);
    if (!section || section.type !== 'reps' || !section.lastAction) return;
    
    section.completed = Math.max(0, section.completed - section.lastAction);
    section.lastAction = null;
    
    Storage.saveWorkout(this.state);
    this.updateSection(section);
    this.updateOverallProgress();
  },
  
  /**
   * Toggle run completion
   */
  toggleRun(sectionId) {
    const section = this.state.sections.find(s => s.id === sectionId);
    if (!section || section.type !== 'checkbox') return;
    
    section.completed = !section.completed;
    
    Storage.saveWorkout(this.state);
    this.updateSection(section);
    this.updateOverallProgress();
    this.checkWorkoutCompletion();
  },
  
  /**
   * Update a single section's display
   */
  updateSection(section) {
    const sectionEl = document.getElementById(`section-${section.id}`);
    if (!sectionEl) return;
    
    if (section.type === 'checkbox') {
      sectionEl.innerHTML = this.createCheckboxSection(section);
    } else {
      sectionEl.innerHTML = this.createRepsSection(section);
    }
    
    this.bindSectionEvents(section);
  },
  
  /**
   * Update overall progress display
   */
  updateOverallProgress() {
    // Calculate total progress
    // Runs count as 1 unit each (2 total), reps count as 600 total
    // Total units: 2 (runs) + 600 (reps) = 602
    // But for simplicity, let's do percentage based on: 2 runs + 3 rep exercises
    
    let completed = 0;
    let total = 0;
    
    this.state.sections.forEach(section => {
      if (section.type === 'checkbox') {
        total += 1;
        completed += section.completed ? 1 : 0;
      } else {
        total += section.total;
        completed += section.completed;
      }
    });
    
    const percentage = Math.round((completed / total) * 100);
    
    this.elements.overallProgressBar.style.width = `${percentage}%`;
    this.elements.overallProgressText.textContent = `${percentage}%`;
    
    // Enable/disable finish button
    const allComplete = this.isWorkoutComplete();
    this.elements.finishWorkoutBtn.disabled = !allComplete;
  },
  
  /**
   * Check if workout is complete
   */
  isWorkoutComplete() {
    return this.state.sections.every(section => {
      if (section.type === 'checkbox') return section.completed;
      return section.completed >= section.total;
    });
  },
  
  /**
   * Check workout completion and show prompt
   */
  checkWorkoutCompletion() {
    if (this.isWorkoutComplete()) {
      // Auto-finish after short delay
      setTimeout(() => {
        if (this.isWorkoutComplete()) {
          this.finishWorkout();
        }
      }, 500);
    }
  },
  
  /**
   * Finish the workout
   */
  finishWorkout() {
    // Stop timer and get final time
    const finalElapsed = Timer.getElapsed(this.state);
    Timer.stop();
    
    this.state.isComplete = true;
    this.state.elapsedTime = finalElapsed;
    Storage.saveWorkout(this.state);
    
    // Show completion screen
    this.elements.workoutScreen.classList.add('hidden');
    this.elements.completionScreen.classList.remove('hidden');
    
    // Show time if timer was enabled
    if (this.state.timerEnabled) {
      this.elements.finalTimeContainer.classList.remove('hidden');
      this.elements.finalTime.textContent = Timer.format(finalElapsed);
    } else {
      this.elements.finalTimeContainer.classList.add('hidden');
    }
    
    // Fire confetti!
    setTimeout(() => Confetti.celebrate(), 300);
  },
  
  /**
   * Show help modal
   */
  showHelp() {
    this.elements.helpModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Hide help modal
   */
  hideHelp() {
    this.elements.helpModal.classList.add('hidden');
    document.body.style.overflow = '';
  },
  
  /**
   * Show reset confirmation modal
   */
  showResetModal() {
    this.elements.resetModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Hide reset modal
   */
  hideResetModal() {
    this.elements.resetModal.classList.add('hidden');
    document.body.style.overflow = '';
  },
  
  /**
   * Confirm workout reset
   */
  confirmReset() {
    Timer.stop();
    Storage.clearWorkout();
    this.hideResetModal();
    
    // Go back to start screen
    this.elements.workoutScreen.classList.add('hidden');
    this.elements.startScreen.classList.remove('hidden');
    this.elements.resumeBtn.classList.add('hidden');
  },
  
  /**
   * Reset and start new workout (from completion screen)
   */
  resetAndStart() {
    Confetti.stop();
    Storage.clearWorkout();
    
    this.elements.completionScreen.classList.add('hidden');
    this.elements.startScreen.classList.remove('hidden');
    this.elements.resumeBtn.classList.add('hidden');
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
