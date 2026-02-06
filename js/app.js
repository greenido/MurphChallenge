/**
 * Murph Challenge Tracker - Main Application
 */

const App = {
  state: null,
  elements: {},
  deferredInstallPrompt: null, // For Android's beforeinstallprompt
  selectedWorkoutMode: 'full', // Default workout mode
  
  /**
   * Initialize the application
   */
  init() {
    this.cacheElements();
    this.initTheme();
    this.bindEvents();
    this.checkForSavedWorkout();
    this.initInstallPrompt();
    this.initWorkoutModeSelector();
    // Pre-open the IndexedDB database
    ResultsDB.open().catch(() => {});
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
      historyBtn: document.getElementById('history-btn'),
      helpBtnStart: document.getElementById('help-btn-start'),
      themeToggle: document.getElementById('theme-toggle'),
      modeDescription: document.getElementById('mode-description'),
      
      // Workout mode buttons
      modeFull: document.getElementById('mode-full'),
      modeHalf: document.getElementById('mode-half'),
      modeQuarter: document.getElementById('mode-quarter'),
      
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
      statsRuns: document.getElementById('stats-runs'),
      statsReps: document.getElementById('stats-reps'),
      workoutTypeBadge: document.getElementById('workout-type-badge'),
      workoutTypeLabel: document.getElementById('workout-type-label'),
      copyStatsBtn: document.getElementById('copy-stats-btn'),
      shareTwitterBtn: document.getElementById('share-twitter-btn'),
      shareFacebookBtn: document.getElementById('share-facebook-btn'),
      shareWhatsappBtn: document.getElementById('share-whatsapp-btn'),
      shareLinkedinBtn: document.getElementById('share-linkedin-btn'),
      newWorkoutBtn: document.getElementById('new-workout-btn'),
      
      // Modals
      helpModal: document.getElementById('help-modal'),
      helpBackdrop: document.getElementById('help-backdrop'),
      closeHelpBtn: document.getElementById('close-help-btn'),
      resetModal: document.getElementById('reset-modal'),
      resetBackdrop: document.getElementById('reset-backdrop'),
      cancelResetBtn: document.getElementById('cancel-reset-btn'),
      confirmResetBtn: document.getElementById('confirm-reset-btn'),
      finishEarlyModal: document.getElementById('finish-early-modal'),
      finishEarlyBackdrop: document.getElementById('finish-early-backdrop'),
      cancelFinishEarlyBtn: document.getElementById('cancel-finish-early-btn'),
      confirmFinishEarlyBtn: document.getElementById('confirm-finish-early-btn'),
      
      // History modal
      historyModal: document.getElementById('history-modal'),
      historyBackdrop: document.getElementById('history-backdrop'),
      closeHistoryBtn: document.getElementById('close-history-btn'),
      historyContent: document.getElementById('history-content'),
      historyFooter: document.getElementById('history-footer'),
      clearHistoryBtn: document.getElementById('clear-history-btn'),
      exportCsvBtn: document.getElementById('export-csv-btn'),
      
      // Clear history confirmation modal
      clearHistoryModal: document.getElementById('clear-history-modal'),
      clearHistoryBackdrop: document.getElementById('clear-history-backdrop'),
      cancelClearHistoryBtn: document.getElementById('cancel-clear-history-btn'),
      confirmClearHistoryBtn: document.getElementById('confirm-clear-history-btn'),
      
      // Delete single workout confirmation modal
      deleteWorkoutModal: document.getElementById('delete-workout-modal'),
      deleteWorkoutBackdrop: document.getElementById('delete-workout-backdrop'),
      cancelDeleteWorkoutBtn: document.getElementById('cancel-delete-workout-btn'),
      confirmDeleteWorkoutBtn: document.getElementById('confirm-delete-workout-btn'),
      
      // Message modal (info/toast)
      messageModal: document.getElementById('message-modal'),
      messageModalBackdrop: document.getElementById('message-modal-backdrop'),
      messageModalTitle: document.getElementById('message-modal-title'),
      messageModalBody: document.getElementById('message-modal-body'),
      messageModalOkBtn: document.getElementById('message-modal-ok-btn'),
      
      // Install modal
      installBtn: document.getElementById('install-btn'),
      installModal: document.getElementById('install-modal'),
      installBackdrop: document.getElementById('install-backdrop'),
      closeInstallBtn: document.getElementById('close-install-btn'),
      iosInstructions: document.getElementById('ios-instructions'),
      androidInstructions: document.getElementById('android-instructions'),
      nativeInstallBtn: document.getElementById('native-install-btn'),
      dontShowInstall: document.getElementById('dont-show-install')
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
   * Initialize workout mode selector
   */
  initWorkoutModeSelector() {
    const modeDescriptions = {
      full: '100 pull-ups, 200 push-ups, 300 squats',
      half: '50 pull-ups, 100 push-ups, 150 squats',
      quarter: '25 pull-ups, 50 push-ups, 75 squats'
    };

    const buttons = document.querySelectorAll('.workout-mode-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.selectedWorkoutMode = mode;

        // Update active state for all buttons
        buttons.forEach(b => {
          if (b.dataset.mode === mode) {
            b.classList.add('bg-murph-accent', 'text-white', 'shadow-md');
            b.classList.remove('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
          } else {
            b.classList.remove('bg-murph-accent', 'text-white', 'shadow-md');
            b.classList.add('text-gray-600', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
          }
        });

        // Update description
        if (this.elements.modeDescription) {
          this.elements.modeDescription.textContent = modeDescriptions[mode];
        }
      });
    });
  },
  
  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Theme toggle
    if (this.elements.themeToggle) {
      this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    // Start screen
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => this.startNewWorkout());
    }
    if (this.elements.resumeBtn) {
      this.elements.resumeBtn.addEventListener('click', () => this.resumeWorkout());
    }
    if (this.elements.helpBtnStart) {
      this.elements.helpBtnStart.addEventListener('click', () => this.showHelp());
    }
    if (this.elements.historyBtn) {
      this.elements.historyBtn.addEventListener('click', () => this.showHistory());
    }
    
    // Workout screen
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
    }
    if (this.elements.resumeTimerBtn) {
      this.elements.resumeTimerBtn.addEventListener('click', () => this.resumeTimer());
    }
    if (this.elements.resetWorkoutBtn) {
      this.elements.resetWorkoutBtn.addEventListener('click', () => this.showResetModal());
    }
    if (this.elements.finishWorkoutBtn) {
      this.elements.finishWorkoutBtn.addEventListener('click', () => this.finishWorkout());
    }
    if (this.elements.helpBtnWorkout) {
      this.elements.helpBtnWorkout.addEventListener('click', () => this.showHelp());
    }
    
    // Completion screen
    if (this.elements.newWorkoutBtn) {
      this.elements.newWorkoutBtn.addEventListener('click', () => this.resetAndStart());
    }
    if (this.elements.copyStatsBtn) {
      this.elements.copyStatsBtn.addEventListener('click', () => this.copyStats());
    }
    if (this.elements.shareTwitterBtn) {
      this.elements.shareTwitterBtn.addEventListener('click', () => this.shareOnTwitter());
    }
    if (this.elements.shareFacebookBtn) {
      this.elements.shareFacebookBtn.addEventListener('click', () => this.shareOnFacebook());
    }
    if (this.elements.shareWhatsappBtn) {
      this.elements.shareWhatsappBtn.addEventListener('click', () => this.shareOnWhatsapp());
    }
    if (this.elements.shareLinkedinBtn) {
      this.elements.shareLinkedinBtn.addEventListener('click', () => this.shareOnLinkedin());
    }
    
    // Help modal
    if (this.elements.closeHelpBtn) {
      this.elements.closeHelpBtn.addEventListener('click', () => this.hideHelp());
    }
    if (this.elements.helpBackdrop) {
      this.elements.helpBackdrop.addEventListener('click', () => this.hideHelp());
    }
    
    // History modal
    if (this.elements.closeHistoryBtn) {
      this.elements.closeHistoryBtn.addEventListener('click', () => this.hideHistory());
    }
    if (this.elements.historyBackdrop) {
      this.elements.historyBackdrop.addEventListener('click', () => this.hideHistory());
    }
    if (this.elements.clearHistoryBtn) {
      this.elements.clearHistoryBtn.addEventListener('click', () => this.showClearHistoryModal());
    }
    if (this.elements.exportCsvBtn) {
      this.elements.exportCsvBtn.addEventListener('click', async () => {
        const downloaded = await ResultsDB.downloadCSV();
        if (!downloaded) this.showMessageModal('Nothing to export', 'No workout history to export.');
      });
    }
    
    // Clear history confirmation modal
    if (this.elements.cancelClearHistoryBtn) {
      this.elements.cancelClearHistoryBtn.addEventListener('click', () => this.hideClearHistoryModal());
    }
    if (this.elements.clearHistoryBackdrop) {
      this.elements.clearHistoryBackdrop.addEventListener('click', () => this.hideClearHistoryModal());
    }
    if (this.elements.confirmClearHistoryBtn) {
      this.elements.confirmClearHistoryBtn.addEventListener('click', () => this.confirmClearHistory());
    }
    
    // Delete single workout modal
    if (this.elements.cancelDeleteWorkoutBtn) {
      this.elements.cancelDeleteWorkoutBtn.addEventListener('click', () => this.hideDeleteWorkoutModal());
    }
    if (this.elements.deleteWorkoutBackdrop) {
      this.elements.deleteWorkoutBackdrop.addEventListener('click', () => this.hideDeleteWorkoutModal());
    }
    if (this.elements.confirmDeleteWorkoutBtn) {
      this.elements.confirmDeleteWorkoutBtn.addEventListener('click', () => this.confirmDeleteWorkout());
    }
    
    // Message modal
    if (this.elements.messageModalOkBtn) {
      this.elements.messageModalOkBtn.addEventListener('click', () => this.hideMessageModal());
    }
    if (this.elements.messageModalBackdrop) {
      this.elements.messageModalBackdrop.addEventListener('click', () => this.hideMessageModal());
    }
    
    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.elements.helpModal && !this.elements.helpModal.classList.contains('hidden')) {
          this.hideHelp();
        }
        if (this.elements.resetModal && !this.elements.resetModal.classList.contains('hidden')) {
          this.hideResetModal();
        }
        if (this.elements.finishEarlyModal && !this.elements.finishEarlyModal.classList.contains('hidden')) {
          this.hideFinishEarlyModal();
        }
        if (this.elements.installModal && !this.elements.installModal.classList.contains('hidden')) {
          this.hideInstallModal();
        }
        if (this.elements.clearHistoryModal && !this.elements.clearHistoryModal.classList.contains('hidden')) {
          this.hideClearHistoryModal();
        } else if (this.elements.deleteWorkoutModal && !this.elements.deleteWorkoutModal.classList.contains('hidden')) {
          this.hideDeleteWorkoutModal();
        } else if (this.elements.messageModal && !this.elements.messageModal.classList.contains('hidden')) {
          this.hideMessageModal();
        } else if (this.elements.historyModal && !this.elements.historyModal.classList.contains('hidden')) {
          this.hideHistory();
        }
      }
    });
    
    // Install modal events
    if (this.elements.installBtn) {
      this.elements.installBtn.addEventListener('click', () => this.showInstallModal());
    }
    if (this.elements.closeInstallBtn) {
      this.elements.closeInstallBtn.addEventListener('click', () => this.hideInstallModal());
    }
    if (this.elements.installBackdrop) {
      this.elements.installBackdrop.addEventListener('click', () => this.hideInstallModal());
    }
    if (this.elements.nativeInstallBtn) {
      this.elements.nativeInstallBtn.addEventListener('click', () => this.triggerNativeInstall());
    }
    
    // Reset modal
    if (this.elements.cancelResetBtn) {
      this.elements.cancelResetBtn.addEventListener('click', () => this.hideResetModal());
    }
    if (this.elements.resetBackdrop) {
      this.elements.resetBackdrop.addEventListener('click', () => this.hideResetModal());
    }
    if (this.elements.confirmResetBtn) {
      this.elements.confirmResetBtn.addEventListener('click', () => this.confirmReset());
    }
    
    // Finish early modal
    if (this.elements.cancelFinishEarlyBtn) {
      this.elements.cancelFinishEarlyBtn.addEventListener('click', () => this.hideFinishEarlyModal());
    }
    if (this.elements.finishEarlyBackdrop) {
      this.elements.finishEarlyBackdrop.addEventListener('click', () => this.hideFinishEarlyModal());
    }
    if (this.elements.confirmFinishEarlyBtn) {
      this.elements.confirmFinishEarlyBtn.addEventListener('click', () => this.confirmFinishEarly());
    }
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
    if (Storage.hasActiveWorkout() && this.elements.resumeBtn) {
      this.elements.resumeBtn.classList.remove('hidden');
    }
  },
  
  /**
   * Start a new workout
   */
  startNewWorkout() {
    const timerEnabled = this.elements.timerToggle ? this.elements.timerToggle.checked : true;
    const workoutMode = this.selectedWorkoutMode;
    
    this.state = Storage.getDefaultState(workoutMode);
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
    
    // Always enable finish button - user can finish early with confirmation
    this.elements.finishWorkoutBtn.disabled = false;
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
   * Finish the workout (with confirmation if incomplete)
   */
  finishWorkout() {
    // Check if workout is complete
    if (!this.isWorkoutComplete()) {
      this.showFinishEarlyModal();
      return;
    }
    
    this.completeWorkout();
  },
  
  /**
   * Show confirmation modal for finishing early
   */
  showFinishEarlyModal() {
    this.elements.finishEarlyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Hide finish early modal
   */
  hideFinishEarlyModal() {
    this.elements.finishEarlyModal.classList.add('hidden');
    document.body.style.overflow = '';
  },
  
  /**
   * Confirm finishing early
   */
  confirmFinishEarly() {
    this.hideFinishEarlyModal();
    this.completeWorkout();
  },
  
  /**
   * Actually complete the workout
   */
  completeWorkout() {
    // Stop timer and get final time
    const finalElapsed = Timer.getElapsed(this.state);
    Timer.stop();
    
    this.state.isComplete = true;
    this.state.elapsedTime = finalElapsed;
    Storage.saveWorkout(this.state);
    
    // Save to IndexedDB history
    ResultsDB.saveResult(this.state).catch(err => {
      console.error('Failed to save to history:', err);
    });
    
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
    
    // Update stats display
    this.updateCompletionStats();
    
    // Fire confetti!
    setTimeout(() => Confetti.celebrate(), 300);
  },
  
  /**
   * Update completion screen stats
   */
  updateCompletionStats() {
    // Calculate total reps and runs
    let totalReps = 0;
    let completedRuns = 0;
    
    this.state.sections.forEach(section => {
      if (section.type === 'reps') {
        totalReps += section.completed;
      } else if (section.type === 'checkbox' && section.completed) {
        completedRuns++;
      }
    });
    
    // Update display
    this.elements.statsRuns.textContent = completedRuns.toString();
    this.elements.statsReps.textContent = totalReps.toString();
    
    // Show/hide workout type badge
    const mode = this.state.workoutMode || (this.state.isHalfMurph ? 'half' : 'full');
    if (mode !== 'full') {
      this.elements.workoutTypeBadge.classList.remove('hidden');
      if (this.elements.workoutTypeLabel) {
        this.elements.workoutTypeLabel.textContent = mode === 'quarter' ? 'Quarter Murph' : 'Half Murph';
      }
    } else {
      this.elements.workoutTypeBadge.classList.add('hidden');
    }
  },
  
  /**
   * Generate stats text for sharing
   */
  generateStatsText() {
    const mode = this.state.workoutMode || (this.state.isHalfMurph ? 'half' : 'full');
    const workoutType = mode === 'quarter' ? 'Quarter Murph' : mode === 'half' ? 'Half Murph' : 'Murph Challenge';
    const timeText = this.state.timerEnabled ? Timer.format(this.state.elapsedTime) : 'No timer';
    
    // Check if workout was fully completed
    const isFullyComplete = this.state.sections.every(section => {
      if (section.type === 'checkbox') return section.completed;
      return section.completed >= section.total;
    });
    
    // Get section details
    const sections = this.state.sections.map(s => {
      if (s.type === 'checkbox') {
        return `${s.icon} ${s.name}: ${s.completed ? 'Done' : 'Not completed'}`;
      }
      return `${s.icon} ${s.name}: ${s.completed}/${s.total}`;
    }).join('\n');
    
    let totalReps = 0;
    this.state.sections.forEach(s => {
      if (s.type === 'reps') totalReps += s.completed;
    });
    
    const completionStatus = isFullyComplete ? 'Complete!' : 'Completed (Partial)';
    
    return `${workoutType} ${completionStatus}\n\nTime: ${timeText}\nTotal Reps: ${totalReps}\n\n${sections}\n\n"In honor of Lt. Michael P. Murphy"`;
  },
  
  /**
   * Copy stats to clipboard
   */
  async copyStats() {
    const statsText = this.generateStatsText();
    
    try {
      await navigator.clipboard.writeText(statsText);
      
      // Visual feedback
      const btn = this.elements.copyStatsBtn;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Copied!</span>
      `;
      btn.classList.add('bg-murph-accent', 'text-white');
      btn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-white');
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('bg-murph-accent', 'text-white');
        btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-white');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      this.showMessageModal('Copy failed', 'Failed to copy to clipboard.');
    }
  },
  
  /**
   * Generate short share text for social media
   */
  generateShareText() {
    const mode = this.state.workoutMode || (this.state.isHalfMurph ? 'half' : 'full');
    const workoutType = mode === 'quarter' ? 'Quarter Murph' : mode === 'half' ? 'Half Murph' : 'Murph Challenge';
    const timeText = this.state.timerEnabled ? Timer.format(this.state.elapsedTime) : '';
    
    let totalReps = 0;
    this.state.sections.forEach(s => {
      if (s.type === 'reps') totalReps += s.completed;
    });
    
    const isFullyComplete = this.state.sections.every(section => {
      if (section.type === 'checkbox') return section.completed;
      return section.completed >= section.total;
    });
    
    const completionStatus = isFullyComplete ? 'Complete!' : 'Completed (Partial)';
    
    let text = `${workoutType} ${completionStatus}`;
    if (timeText) text += ` | Time: ${timeText}`;
    text += ` | ${totalReps} total reps`;
    text += ` | In honor of Lt. Michael P. Murphy`;
    text += ` #MurphChallenge #Workout #Fitness`;
    
    return text;
  },
  
  /**
   * Share on Twitter/X
   */
  shareOnTwitter() {
    const text = encodeURIComponent(this.generateShareText());
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
  },
  
  /**
   * Share on Facebook (copies full stats to clipboard first)
   */
  async shareOnFacebook() {
    try {
      await navigator.clipboard.writeText(this.generateStatsText());
      this.showShareToast('Results copied! Paste in your Facebook post.');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://greenido.wordpress.com')}`;
    window.open(url, '_blank', 'width=550,height=420');
  },
  
  /**
   * Share on WhatsApp (uses full stats)
   */
  shareOnWhatsapp() {
    const text = encodeURIComponent(this.generateStatsText());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  },
  
  /**
   * Share on LinkedIn (copies full stats to clipboard first)
   */
  async shareOnLinkedin() {
    try {
      await navigator.clipboard.writeText(this.generateStatsText());
      this.showShareToast('Results copied! Paste in your LinkedIn post.');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://greenido.wordpress.com')}`;
    window.open(url, '_blank', 'width=550,height=420');
  },
  
  /**
   * Show a toast notification for share actions
   */
  showShareToast(message) {
    const existingToast = document.getElementById('share-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.id = 'share-toast';
    toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-3 rounded-xl shadow-lg z-[200] flex items-center gap-2 animate-pulse';
    toast.innerHTML = `
      <svg class="w-5 h-5 text-murph-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  // ==================== HISTORY ==================== 
  
  /**
   * Show workout history modal
   */
  async showHistory() {
    if (!this.elements.historyModal) return;
    
    this.elements.historyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Load and render history
    await this.renderHistory();
  },
  
  /**
   * Hide workout history modal
   */
  hideHistory() {
    if (!this.elements.historyModal) return;
    this.elements.historyModal.classList.add('hidden');
    document.body.style.overflow = '';
  },
  
  /**
   * Render workout history in the modal
   */
  async renderHistory() {
    const content = this.elements.historyContent;
    const footer = this.elements.historyFooter;
    if (!content) return;
    
    try {
      const results = await ResultsDB.getAllResults();
      
      if (!results || results.length === 0) {
        content.innerHTML = `
          <div class="text-center py-16">
            <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">No Workouts Yet</h3>
            <p class="text-sm text-gray-400 dark:text-gray-500">Complete a workout and it will appear here.</p>
          </div>
        `;
        if (footer) footer.classList.add('hidden');
        return;
      }
      
      // Show footer with buttons
      if (footer) footer.classList.remove('hidden');
      
      // Build history cards
      let html = `<div class="space-y-3">`;
      
      results.forEach((result, index) => {
        const date = new Date(result.date);
        const dateStr = date.toLocaleDateString(undefined, { 
          year: 'numeric', month: 'short', day: 'numeric' 
        });
        const timeStr = date.toLocaleTimeString(undefined, { 
          hour: '2-digit', minute: '2-digit' 
        });
        
        const modeLabel = result.workoutMode 
          ? result.workoutMode.charAt(0).toUpperCase() + result.workoutMode.slice(1) 
          : 'Full';
        
        const modeColor = result.workoutMode === 'quarter' 
          ? 'bg-blue-500/20 text-blue-500' 
          : result.workoutMode === 'half' 
            ? 'bg-amber-500/20 text-amber-500' 
            : 'bg-murph-accent/20 text-murph-accent';
        
        const statusIcon = result.isFullyComplete 
          ? '<svg class="w-5 h-5 text-murph-accent" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
          : '<svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>';
        
        // Build section details
        const pullups = result.sections.find(s => s.id === 'pullups');
        const pushups = result.sections.find(s => s.id === 'pushups');
        const squats = result.sections.find(s => s.id === 'squats');
        
        html += `
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  ${statusIcon}
                  <span class="font-bold">${dateStr}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">${timeStr}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${modeColor}">
                    ${modeLabel}
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">${result.formattedTime}</span>
                </div>
              </div>
              <button 
                data-delete-id="${result.id}" 
                class="history-delete-btn p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                aria-label="Delete this result"
                title="Delete"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p class="text-sm font-bold text-murph-accent">${pullups ? pullups.completed : 0}</p>
                <p class="text-xs text-gray-500">Pull-ups</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p class="text-sm font-bold text-murph-accent">${pushups ? pushups.completed : 0}</p>
                <p class="text-xs text-gray-500">Push-ups</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg p-2">
                <p class="text-sm font-bold text-murph-accent">${squats ? squats.completed : 0}</p>
                <p class="text-xs text-gray-500">Squats</p>
              </div>
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
      
      // Show count
      html = `
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">${results.length} workout${results.length !== 1 ? 's' : ''} recorded</p>
        </div>
      ` + html;
      
      content.innerHTML = html;
      
      // Bind delete buttons
      content.querySelectorAll('.history-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.deleteId);
          if (id) this.showDeleteWorkoutModal(id);
        });
      });
      
    } catch (err) {
      console.error('Failed to render history:', err);
      content.innerHTML = `
        <div class="text-center py-12">
          <p class="text-red-500">Failed to load workout history.</p>
          <p class="text-sm text-gray-500 mt-2">Please try again later.</p>
        </div>
      `;
    }
  },
  
  /**
   * Show clear history confirmation modal
   */
  showClearHistoryModal() {
    if (!this.elements.clearHistoryModal) return;
    this.elements.clearHistoryModal.classList.remove('hidden');
  },
  
  /**
   * Hide clear history confirmation modal
   */
  hideClearHistoryModal() {
    if (!this.elements.clearHistoryModal) return;
    this.elements.clearHistoryModal.classList.add('hidden');
  },
  
  /**
   * Confirm clearing all history
   */
  async confirmClearHistory() {
    await ResultsDB.clearAll();
    this.hideClearHistoryModal();
    await this.renderHistory();
  },
  
  /**
   * Show delete single workout confirmation modal
   */
  showDeleteWorkoutModal(id) {
    if (!this.elements.deleteWorkoutModal) return;
    this.pendingDeleteWorkoutId = id;
    this.elements.deleteWorkoutModal.classList.remove('hidden');
  },
  
  /**
   * Hide delete workout modal
   */
  hideDeleteWorkoutModal() {
    if (!this.elements.deleteWorkoutModal) return;
    this.pendingDeleteWorkoutId = null;
    this.elements.deleteWorkoutModal.classList.add('hidden');
  },
  
  /**
   * Confirm deleting the single workout
   */
  async confirmDeleteWorkout() {
    const id = this.pendingDeleteWorkoutId;
    this.hideDeleteWorkoutModal();
    if (id) {
      await ResultsDB.deleteResult(id);
      await this.renderHistory();
    }
  },
  
  /**
   * Show message modal (info / toast-style)
   */
  showMessageModal(title, message) {
    if (!this.elements.messageModal) return;
    if (this.elements.messageModalTitle) this.elements.messageModalTitle.textContent = title;
    if (this.elements.messageModalBody) this.elements.messageModalBody.textContent = message;
    this.elements.messageModal.classList.remove('hidden');
  },
  
  /**
   * Hide message modal
   */
  hideMessageModal() {
    if (!this.elements.messageModal) return;
    this.elements.messageModal.classList.add('hidden');
  },
  
  // ==================== MODALS ==================== 
  
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
  },
  
  /**
   * Initialize install prompt functionality
   */
  initInstallPrompt() {
    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    
    if (isStandalone) {
      return;
    }
    
    // Check if user dismissed the install prompt before
    const installDismissed = localStorage.getItem('murph_install_dismissed');
    if (installDismissed === 'true') {
      return;
    }
    
    // Detect if mobile
    const isMobile = this.isMobileDevice();
    
    if (isMobile && this.elements.installBtn) {
      this.elements.installBtn.classList.remove('hidden');
      
      const hasSeenInstallPrompt = localStorage.getItem('murph_install_seen');
      if (!hasSeenInstallPrompt) {
        setTimeout(() => {
          this.showInstallModal();
          localStorage.setItem('murph_install_seen', 'true');
        }, 2000);
      }
    }
    
    // Listen for beforeinstallprompt (Android/Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      
      if (this.elements.installBtn) {
        this.elements.installBtn.classList.remove('hidden');
      }
    });
    
    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      if (this.elements.installBtn) {
        this.elements.installBtn.classList.add('hidden');
      }
      this.hideInstallModal();
      this.deferredInstallPrompt = null;
    });
  },
  
  /**
   * Detect if current device is mobile
   */
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  },
  
  /**
   * Detect if iOS device
   */
  isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) 
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  },
  
  /**
   * Show install modal with platform-specific instructions
   */
  showInstallModal() {
    if (!this.elements.installModal) return;
    
    const isIOS = this.isIOS();
    
    if (this.elements.iosInstructions) {
      this.elements.iosInstructions.classList.toggle('hidden', !isIOS);
    }
    if (this.elements.androidInstructions) {
      this.elements.androidInstructions.classList.toggle('hidden', isIOS);
    }
    
    if (this.elements.nativeInstallBtn) {
      this.elements.nativeInstallBtn.classList.toggle('hidden', !this.deferredInstallPrompt);
      if (this.deferredInstallPrompt && this.elements.androidInstructions) {
        this.elements.androidInstructions.classList.add('hidden');
      }
    }
    
    this.elements.installModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  
  /**
   * Hide install modal
   */
  hideInstallModal() {
    if (!this.elements.installModal) return;
    
    if (this.elements.dontShowInstall && this.elements.dontShowInstall.checked) {
      localStorage.setItem('murph_install_dismissed', 'true');
      if (this.elements.installBtn) {
        this.elements.installBtn.classList.add('hidden');
      }
    }
    
    this.elements.installModal.classList.add('hidden');
    document.body.style.overflow = '';
  },
  
  /**
   * Trigger native install prompt (Android)
   */
  async triggerNativeInstall() {
    if (!this.deferredInstallPrompt) return;
    
    this.deferredInstallPrompt.prompt();
    
    const { outcome } = await this.deferredInstallPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.hideInstallModal();
    }
    
    this.deferredInstallPrompt = null;
    
    if (this.elements.nativeInstallBtn) {
      this.elements.nativeInstallBtn.classList.add('hidden');
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
