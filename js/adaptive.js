// Adaptive target algorithm - adjusts weights based on session performance

const AdaptiveTargets = {
  // Map exertion colors to numeric values for averaging
  exertionValue: {
    'green': 1,
    'yellow': 2,
    'orange': 3,
    'red': 4
  },

  // Get the muscle group for an exercise
  getMuscleGroup(exerciseId, exercises) {
    const ex = exercises.find(e => e.id === exerciseId);
    return ex ? ex.muscleGroup : 'chest';
  },

  // Check if exercise is a compound barbell lift
  isCompoundBarbell(exerciseId) {
    const compounds = [
      'bench-press',
      'bb-row',
      'back-squat',
      'hex-bar-deadlift',
      'trap-bar-deadlift',
      'close-grip-bench'
    ];
    return compounds.includes(exerciseId);
  },

  // Calculate weight increment based on exercise type
  getIncrement(exerciseId, exercises) {
    const muscleGroup = this.getMuscleGroup(exerciseId, exercises);
    const isCompound = this.isCompoundBarbell(exerciseId);

    if (isCompound) {
      // Compound barbell: +5 upper / +10 lower
      if (['chest', 'shoulders', 'back', 'arms'].includes(muscleGroup)) {
        return 5;
      } else {
        return 10;
      }
    } else {
      // Non-compound: +2.5 upper / +5 lower
      if (['chest', 'shoulders', 'back', 'arms'].includes(muscleGroup)) {
        return 2.5;
      } else {
        return 5;
      }
    }
  },

  // Process a session and update plan targets
  processSession(session, plan, exerciseLibrary, previousSessions) {
    if (!session || !session.exercises || session.exercises.length === 0) {
      return plan;
    }

    const updatedPlan = JSON.parse(JSON.stringify(plan));
    const planDay = session.planDay || 'monday';

    session.exercises.forEach((sessionExercise) => {
      const exerciseId = sessionExercise.exerciseId;
      const sets = sessionExercise.sets || [];

      if (sets.length === 0) return;

      // Analyze performance
      const targetReps = sets.length > 0 ? 8 : 0; // Default assumption
      const allRepsHit = sets.every(s => s.reps >= targetReps);
      const exertions = sets.map(s => this.exertionValue[s.exertion] || 1);
      const avgExertion = Math.round(
        exertions.reduce((a, b) => a + b, 0) / exertions.length
      );
      const anyRed = exertions.some(e => e === 4);

      // Check if previous session had red for this exercise
      let twoRedsInARow = false;
      if (previousSessions && previousSessions.length > 0) {
        const prevSession = previousSessions[previousSessions.length - 1];
        if (prevSession && prevSession.exercises) {
          const prevEx = prevSession.exercises.find(e => e.exerciseId === exerciseId);
          if (prevEx && prevEx.sets) {
            const prevHadRed = prevEx.sets.some(s =>
              this.exertionValue[s.exertion] === 4
            );
            twoRedsInARow = anyRed && prevHadRed;
          }
        }
      }

      // Find current target in plan
      if (updatedPlan[planDay]) {
        const planExercise = updatedPlan[planDay].find(
          e => e.exerciseId === exerciseId
        );

        if (planExercise) {
          let nextWeight = planExercise.targetWeight;
          let nextReps = planExercise.targetReps;

          // Apply algorithm
          if (anyRed && twoRedsInARow) {
            nextWeight = Math.round(planExercise.targetWeight * 0.95 * 4) / 4; // Drop 5%
            nextReps = planExercise.targetReps;
          } else if (anyRed || !allRepsHit) {
            nextWeight = planExercise.targetWeight; // Hold
            nextReps = planExercise.targetReps;
          } else if (allRepsHit && avgExertion <= 2) {
            const increment = this.getIncrement(exerciseId, exerciseLibrary);
            nextWeight = planExercise.targetWeight + increment;
            nextReps = planExercise.targetReps;
          } else if (allRepsHit && avgExertion === 3) {
            nextWeight = planExercise.targetWeight; // Hold
            nextReps = planExercise.targetReps + 1;
          }

          planExercise.targetWeight = nextWeight;
          planExercise.targetReps = nextReps;
        }
      }
    });

    return updatedPlan;
  },

  // Reset plan to v1 defaults (for settings)
  resetPlanToDefaults() {
    return getDefaultPlan();
  }
};

// Default plan seed data (from memory/dan-health.md)
function getDefaultPlan() {
  return {
    monday: [
      { exerciseId: 'db-bench-press', targetWeight: 60, targetReps: 8, targetSets: 3, unit: 'lb' },
      { exerciseId: 'db-ohp', targetWeight: 35, targetReps: 8, targetSets: 3, unit: 'lb' },
      { exerciseId: 'db-tricep-ext', targetWeight: 30, targetReps: 10, targetSets: 3, unit: 'lb' }
    ],
    tuesday: [
      { exerciseId: 'bb-row', targetWeight: 135, targetReps: 8, targetSets: 3, unit: 'lb' },
      { exerciseId: 'db-row', targetWeight: 70, targetReps: 8, targetSets: 3, unit: 'lb' },
      { exerciseId: 'ez-curl', targetWeight: 85, targetReps: 8, targetSets: 3, unit: 'lb' }
    ],
    wednesday: [
      { exerciseId: 'back-squat', targetWeight: 155, targetReps: 5, targetSets: 3, unit: 'lb' },
      { exerciseId: 'db-bench-press', targetWeight: 65, targetReps: 8, targetSets: 3, unit: 'lb' },
      { exerciseId: 'rdl', targetWeight: 185, targetReps: 6, targetSets: 3, unit: 'lb' }
    ],
    thursday: [
      { exerciseId: 'goblet-squat', targetWeight: 45, targetReps: 12, targetSets: 3, unit: 'lb' },
      { exerciseId: 'rdl', targetWeight: 185, targetReps: 8, targetSets: 3, unit: 'lb' },
      { exerciseId: 'glute-bridge', targetWeight: 185, targetReps: 12, targetSets: 3, unit: 'lb' }
    ],
    friday: [
      { exerciseId: 'recumbent-bike', targetWeight: 0, targetReps: 25, targetSets: 1, unit: 'min' },
      { exerciseId: 'plank', targetWeight: 0, targetReps: 60, targetSets: 3, unit: 'sec' }
    ],
    saturday: [
      { exerciseId: 'pool-laps', targetWeight: 0, targetReps: 20, targetSets: 1, unit: 'laps' }
    ],
    sunday: [
      { exerciseId: 'pool-laps', targetWeight: 0, targetReps: 10, targetSets: 1, unit: 'laps' }
    ]
  };
}
