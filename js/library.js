// Exercise library search and custom exercise management

const ExerciseLibrary = {
  bundledExercises: [],

  // Initialize library with bundled exercises
  async initialize() {
    try {
      const res = await fetch('data/exercises.json');
      this.bundledExercises = await res.json();
    } catch (err) {
      console.error('Failed to load exercise library:', err);
      this.bundledExercises = [];
    }
    this.loadCustomExercises();
  },

  // Get merged library (bundled + custom)
  getAll() {
    const custom = Storage.getExerciseLibrary();
    const merged = [...this.bundledExercises];
    custom.forEach((c) => {
      if (!merged.find(b => b.id === c.id)) {
        merged.push(c);
      }
    });
    return merged;
  },

  // Search exercises by name or muscle group
  search(query) {
    const all = this.getAll();
    const q = query.toLowerCase();
    return all.filter((ex) => {
      return ex.name.toLowerCase().includes(q) ||
             ex.muscleGroup.toLowerCase().includes(q) ||
             ex.equipment.some(e => e.toLowerCase().includes(q));
    });
  },

  // Get exercises for a specific day
  getByDay(dayKey) {
    const plan = Storage.getPlan();
    const dayPlan = plan[dayKey] || [];
    const library = this.getAll();
    return dayPlan.map((target) => {
      const ex = library.find(e => e.id === target.exerciseId);
      return {
        ...ex,
        ...target
      };
    });
  },

  // Get exercises by muscle group
  getByMuscleGroup(muscleGroup) {
    const all = this.getAll();
    return all.filter(ex => ex.muscleGroup === muscleGroup);
  },

  // Add custom exercise
  addCustom(name, muscleGroup, equipment) {
    const id = 'custom-' + Date.now();
    const custom = {
      id: id,
      name: name,
      muscleGroup: muscleGroup,
      equipment: equipment || [],
      isCustom: true
    };
    const library = Storage.getExerciseLibrary();
    library.push(custom);
    Storage.setExerciseLibrary(library);
    return custom;
  },

  // Load custom exercises from storage (called during init)
  loadCustomExercises() {
    // Already handled by getAll()
  },

  // Get exercise by ID
  getById(id) {
    const all = this.getAll();
    return all.find(ex => ex.id === id);
  }
};
