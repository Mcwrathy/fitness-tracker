// Storage helpers for localStorage persistence

const Storage = {
  // Exercise library
  getExerciseLibrary() {
    const stored = localStorage.getItem('fitness.exercises.library');
    return stored ? JSON.parse(stored) : [];
  },

  setExerciseLibrary(exercises) {
    localStorage.setItem('fitness.exercises.library', JSON.stringify(exercises));
  },

  // Weekly plan
  getPlan() {
    const stored = localStorage.getItem('fitness.plan');
    return stored ? JSON.parse(stored) : {};
  },

  setPlan(plan) {
    localStorage.setItem('fitness.plan', JSON.stringify(plan));
  },

  updatePlanDay(dayKey, exercises) {
    const plan = this.getPlan();
    plan[dayKey] = exercises;
    this.setPlan(plan);
  },

  // Sessions
  getSessions() {
    const stored = localStorage.getItem('fitness.sessions');
    return stored ? JSON.parse(stored) : [];
  },

  addSession(session) {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem('fitness.sessions', JSON.stringify(sessions));
    return session;
  },

  getSession(sessionId) {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId);
  },

  updateSession(sessionId, updates) {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...updates };
      localStorage.setItem('fitness.sessions', JSON.stringify(sessions));
      return sessions[idx];
    }
    return null;
  },

  // Settings
  getSettings() {
    const stored = localStorage.getItem('fitness.settings');
    return stored ? JSON.parse(stored) : {
      planApproved: false,
      discordWebhookUrl: '',
      hrEnabled: true
    };
  },

  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    localStorage.setItem('fitness.settings', JSON.stringify(settings));
  },

  // Current session (draft, not yet finished)
  getCurrentSession() {
    const stored = localStorage.getItem('fitness.currentSession');
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentSession(session) {
    localStorage.setItem('fitness.currentSession', JSON.stringify(session));
  },

  clearCurrentSession() {
    localStorage.removeItem('fitness.currentSession');
  },

  // Wipe all data (danger zone)
  wipeAllData() {
    localStorage.clear();
  }
};
