// Today screen - main workout logging interface

const TodayScreen = {
  async render() {
    const container = document.getElementById('app');
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dayKey = this.getDayKey(today);

    let currentSession = Storage.getCurrentSession();
    if (!currentSession || currentSession.date !== dateStr) {
      // Start new session for today
      currentSession = {
        id: 'session-' + Date.now(),
        date: dateStr,
        planDay: dayKey,
        hrStart: null,
        hrEnd: null,
        exercises: [],
        finishedAt: null
      };
      Storage.setCurrentSession(currentSession);
    }

    const plan = Storage.getPlan();
    const dayExercises = plan[dayKey] || [];
    const library = ExerciseLibrary.getAll();

    const html = `
      <div style="padding: 1rem;">
        <!-- Header -->
        <div style="
          margin-bottom: 1.5rem;
          text-align: center;
        ">
          <h1 style="
            margin: 0;
            font-size: 1.5rem;
            color: #e8e8e8;
          ">
            ${this.formatDate(today)}
          </h1>
          <p style="
            margin: 0.5rem 0 0 0;
            color: #999;
            font-size: 0.9rem;
          ">
            ${this.getPlanDayName(dayKey)}
          </p>
        </div>

        <!-- HR fields -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        ">
          <div>
            <label style="
              display: block;
              color: #999;
              font-size: 0.85rem;
              margin-bottom: 0.5rem;
            ">Start HR (bpm)</label>
            <input
              id="hr-start"
              type="number"
              min="60"
              max="200"
              value="${currentSession.hrStart || ''}"
              placeholder="---"
              style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #444;
                border-radius: 6px;
                background: #2a2a2a;
                color: #e8e8e8;
                font-size: 1rem;
                box-sizing: border-box;
              "
            />
          </div>
          <div>
            <label style="
              display: block;
              color: #999;
              font-size: 0.85rem;
              margin-bottom: 0.5rem;
            ">End HR (bpm)</label>
            <input
              id="hr-end"
              type="number"
              min="60"
              max="200"
              value="${currentSession.hrEnd || ''}"
              placeholder="---"
              style="
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #444;
                border-radius: 6px;
                background: #2a2a2a;
                color: #e8e8e8;
                font-size: 1rem;
                box-sizing: border-box;
              "
            />
          </div>
        </div>

        <!-- STOP symptoms strip (always visible) -->
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border-left: 3px solid #ef4444;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          font-size: 0.9rem;
          line-height: 1.4;
        ">
          <strong>STOP if:</strong> chest pain, unusual shortness of breath, dizziness, palpitations, blurred vision
        </div>

        <!-- HR safety banner -->
        <div style="
          background: #1a3a3a;
          border: 1px solid #2dd4bf;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          color: #2dd4bf;
          font-size: 0.9rem;
          text-align: center;
        ">
          Target HR: 100–130 bpm | Ceiling: 140 bpm
        </div>

        <!-- Exercises -->
        <div id="exercises-container" style="margin-bottom: 1.5rem;">
        </div>

        <!-- Add exercise button -->
        <button
          id="add-exercise-btn"
          style="
            width: 100%;
            padding: 1rem;
            background: #444;
            color: #e8e8e8;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            margin-bottom: 1.5rem;
          "
        >+ Add Exercise</button>

        <!-- Finish session button -->
        <button
          id="finish-session-btn"
          style="
            width: 100%;
            padding: 1rem;
            background: #2dd4bf;
            color: #1a1a1a;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 1rem;
          "
        >Finish Session</button>
      </div>
    `;

    container.innerHTML = html;

    // Render exercises
    this.renderExercises(dayExercises, currentSession, library);

    // Event listeners
    document.getElementById('add-exercise-btn').onclick = () => this.showAddExerciseModal();
    document.getElementById('finish-session-btn').onclick = () => this.finishSession();

    // HR input handlers
    document.getElementById('hr-start').onchange = (e) => {
      currentSession.hrStart = e.target.value ? parseInt(e.target.value) : null;
      Storage.setCurrentSession(currentSession);
    };

    document.getElementById('hr-end').onchange = (e) => {
      const val = e.target.value ? parseInt(e.target.value) : null;
      if (val && val > 140) {
        alert('⚠️ HR exceeds ceiling (140 bpm)!');
      }
      currentSession.hrEnd = val;
      Storage.setCurrentSession(currentSession);
    };

    // Add chat bubble
    const bubble = AIHook.createChatBubble('Today', dateStr, null);
    document.body.appendChild(bubble);
  },

  renderExercises(dayExercises, currentSession, library) {
    const container = document.getElementById('exercises-container');
    container.innerHTML = '';

    dayExercises.forEach((target, idx) => {
      const ex = library.find(e => e.id === target.exerciseId);
      if (!ex) return;

      let sessionEx = currentSession.exercises.find(e => e.exerciseId === target.exerciseId);
      if (!sessionEx) {
        sessionEx = {
          exerciseId: target.exerciseId,
          sets: []
        };
        currentSession.exercises.push(sessionEx);
      }

      // Ensure sets array matches target sets
      while (sessionEx.sets.length < target.targetSets) {
        sessionEx.sets.push({
          weight: target.targetWeight,
          reps: target.targetReps,
          exertion: 'yellow',
          note: ''
        });
      }

      const card = document.createElement('div');
      card.style.cssText = `
        background: #2a2a2a;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
      `;

      let setsHtml = '';
      sessionEx.sets.forEach((set, setIdx) => {
        const exertionColors = {
          'green': '#10b981',
          'yellow': '#f59e0b',
          'orange': '#ff6b35',
          'red': '#ef4444'
        };

        setsHtml += `
          <div style="
            background: #1a1a1a;
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 0.75rem;
            display: grid;
            grid-template-columns: 1fr 1fr auto auto;
            gap: 0.5rem;
            align-items: center;
          ">
            <input
              type="number"
              placeholder="Weight (lb)"
              value="${set.weight || ''}"
              data-ex="${target.exerciseId}"
              data-set="${setIdx}"
              data-field="weight"
              class="set-input"
              style="
                padding: 0.5rem;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 4px;
                color: #e8e8e8;
                font-size: 0.9rem;
              "
            />
            <input
              type="number"
              placeholder="Reps"
              value="${set.reps || ''}"
              data-ex="${target.exerciseId}"
              data-set="${setIdx}"
              data-field="reps"
              class="set-input"
              style="
                padding: 0.5rem;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 4px;
                color: #e8e8e8;
                font-size: 0.9rem;
              "
            />
            <div style="display: flex; gap: 0.25rem;">
              ${['green', 'yellow', 'orange', 'red'].map(color => `
                <button
                  data-ex="${target.exerciseId}"
                  data-set="${setIdx}"
                  data-exertion="${color}"
                  class="exertion-btn"
                  style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${exertionColors[color]};
                    border: ${set.exertion === color ? '2px solid #e8e8e8' : '1px solid #444'};
                    cursor: pointer;
                    opacity: ${set.exertion === color ? '1' : '0.5'};
                  "
                ></button>
              `).join('')}
            </div>
            <button
              data-ex="${target.exerciseId}"
              data-set="${setIdx}"
              class="remove-set-btn"
              style="
                width: 32px;
                height: 32px;
                background: #444;
                color: #999;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1.2rem;
              "
            >×</button>
          </div>
        `;
      });

      card.innerHTML = `
        <h3 style="
          margin: 0 0 1rem 0;
          color: #e8e8e8;
          font-size: 1.1rem;
        ">${ex.name}</h3>
        <p style="
          margin: 0 0 1rem 0;
          color: #999;
          font-size: 0.9rem;
        ">Target: ${target.targetSets} × ${target.targetReps} @ ${target.targetWeight} ${target.unit || 'lb'}</p>
        <div>${setsHtml}</div>
        <button
          data-ex="${target.exerciseId}"
          class="add-set-btn"
          style="
            width: 100%;
            padding: 0.5rem;
            background: #1a1a1a;
            color: #2dd4bf;
            border: 1px solid #2dd4bf;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
          "
        >+ Add set</button>
      `;

      container.appendChild(card);
    });

    // Set input handlers
    document.querySelectorAll('.set-input').forEach(input => {
      input.onchange = (e) => this.updateSetField(e.target);
    });

    document.querySelectorAll('.exertion-btn').forEach(btn => {
      btn.onclick = (e) => this.setExertion(e.target);
    });

    document.querySelectorAll('.remove-set-btn').forEach(btn => {
      btn.onclick = (e) => this.removeSet(e.target);
    });

    document.querySelectorAll('.add-set-btn').forEach(btn => {
      btn.onclick = (e) => this.addSet(e.target);
    });

    Storage.setCurrentSession(currentSession);
  },

  updateSetField(input) {
    const exId = input.getAttribute('data-ex');
    const setIdx = parseInt(input.getAttribute('data-set'));
    const field = input.getAttribute('data-field');
    const session = Storage.getCurrentSession();
    const ex = session.exercises.find(e => e.exerciseId === exId);
    if (ex && ex.sets[setIdx]) {
      ex.sets[setIdx][field] = input.value ? parseInt(input.value) : 0;
      Storage.setCurrentSession(session);
    }
  },

  setExertion(btn) {
    const exId = btn.getAttribute('data-ex');
    const setIdx = parseInt(btn.getAttribute('data-set'));
    const exertion = btn.getAttribute('data-exertion');
    const session = Storage.getCurrentSession();
    const ex = session.exercises.find(e => e.exerciseId === exId);
    if (ex && ex.sets[setIdx]) {
      ex.sets[setIdx].exertion = exertion;
      Storage.setCurrentSession(session);
      this.render();
    }
  },

  removeSet(btn) {
    const exId = btn.getAttribute('data-ex');
    const setIdx = parseInt(btn.getAttribute('data-set'));
    const session = Storage.getCurrentSession();
    const ex = session.exercises.find(e => e.exerciseId === exId);
    if (ex && ex.sets[setIdx]) {
      ex.sets.splice(setIdx, 1);
      Storage.setCurrentSession(session);
      this.render();
    }
  },

  addSet(btn) {
    const exId = btn.getAttribute('data-ex');
    const session = Storage.getCurrentSession();
    const ex = session.exercises.find(e => e.exerciseId === exId);
    if (ex) {
      const lastSet = ex.sets[ex.sets.length - 1];
      ex.sets.push({
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 8,
        exertion: 'yellow',
        note: ''
      });
      Storage.setCurrentSession(session);
      this.render();
    }
  },

  showAddExerciseModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: flex-end;
      z-index: 500;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #2a2a2a;
      border-radius: 12px 12px 0 0;
      padding: 1.5rem;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    content.innerHTML = `
      <h2 style="margin-top: 0; color: #e8e8e8;">Add Exercise</h2>
      <input
        id="exercise-search"
        type="text"
        placeholder="Search exercises..."
        style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #444;
          border-radius: 6px;
          background: #1a1a1a;
          color: #e8e8e8;
          font-size: 1rem;
          box-sizing: border-box;
          margin-bottom: 1rem;
        "
      />
      <div id="exercise-list" style="max-height: 400px; overflow-y: auto;"></div>
      <button
        id="close-modal"
        style="
          width: 100%;
          padding: 0.75rem;
          background: #444;
          color: #e8e8e8;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 1rem;
        "
      >Close</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const searchInput = document.getElementById('exercise-search');
    const listDiv = document.getElementById('exercise-list');

    const updateList = () => {
      const query = searchInput.value;
      const results = ExerciseLibrary.search(query);
      listDiv.innerHTML = results.map(ex => `
        <button
          data-ex-id="${ex.id}"
          class="exercise-option"
          style="
            display: block;
            width: 100%;
            padding: 0.75rem;
            background: #1a1a1a;
            border: none;
            border-radius: 6px;
            color: #e8e8e8;
            text-align: left;
            cursor: pointer;
            margin-bottom: 0.5rem;
          "
        >
          <strong>${ex.name}</strong><br/>
          <span style="color: #999; font-size: 0.85rem;">${ex.muscleGroup}</span>
        </button>
      `).join('');

      document.querySelectorAll('.exercise-option').forEach(btn => {
        btn.onclick = () => this.addExerciseToSession(btn.getAttribute('data-ex-id'), modal);
      });
    };

    searchInput.oninput = updateList;
    updateList();

    document.getElementById('close-modal').onclick = () => modal.remove();
    searchInput.focus();
  },

  addExerciseToSession(exerciseId, modal) {
    const session = Storage.getCurrentSession();
    if (!session.exercises.find(e => e.exerciseId === exerciseId)) {
      session.exercises.push({
        exerciseId: exerciseId,
        sets: [{
          weight: 0,
          reps: 8,
          exertion: 'yellow',
          note: ''
        }]
      });
      Storage.setCurrentSession(session);
    }
    modal.remove();
    this.render();
  },

  finishSession() {
    const session = Storage.getCurrentSession();
    if (!session || session.exercises.length === 0) {
      alert('No exercises logged. Add some exercises before finishing.');
      return;
    }

    // Check for red exertions warning
    let redCount = 0;
    session.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.exertion === 'red') redCount++;
      });
    });

    if (redCount >= 3) {
      const ok = confirm('⚠️ 3+ red exertions logged. Consider dropping intensity. Finish anyway?');
      if (!ok) return;
    }

    session.finishedAt = new Date().toISOString();
    const plan = Storage.getPlan();
    const previousSessions = Storage.getSessions();
    const library = ExerciseLibrary.getAll();

    // Run adaptive target algorithm
    const updatedPlan = AdaptiveTargets.processSession(
      session,
      plan,
      library,
      previousSessions
    );
    Storage.setPlan(updatedPlan);

    // Save session
    Storage.addSession(session);
    Storage.clearCurrentSession();

    alert('Session saved! Targets updated.');
    window.location.hash = '#history';
  },

  getDayKey(date) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  },

  getPlanDayName(dayKey) {
    const names = {
      sunday: 'Sunday — Active Recovery',
      monday: 'Monday — Push',
      tuesday: 'Tuesday — Pull',
      wednesday: 'Wednesday — Westside Compound',
      thursday: 'Thursday — Legs',
      friday: 'Friday — Zone 2 Cardio + Core',
      saturday: 'Saturday — Pool Swim'
    };
    return names[dayKey] || dayKey;
  },

  formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = days[date.getDay()];
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${d}, ${m}/${day}`;
  }
};
