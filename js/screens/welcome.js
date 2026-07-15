// Welcome screen - default landing page with day selector and session start

const WelcomeScreen = {
  async render() {
    const container = document.getElementById('app');
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0=Sunday, 1=Monday, etc.
    const currentSessionActive = Storage.getCurrentSession()?.sessionActive || false;

    // If there's an active session, don't render Welcome — go to workout screen
    if (currentSessionActive) {
      TodayScreen.render();
      return;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const plan = Storage.getPlan();
    const library = ExerciseLibrary.getAll();

    // Default to today's day-of-week, but allow override
    let selectedDayIndex = currentDayIndex;

    // Render selected day's plan preview
    const selectedDayKey = dayKeys[selectedDayIndex];
    const dayPlan = plan[selectedDayKey] || [];
    const dayPlanPreview = dayPlan.slice(0, 3).map(target => {
      const ex = library.find(e => e.id === target.exerciseId);
      return ex ? ex.name : 'Unknown';
    }).join(', ');

    const html = `
      <div style="
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      ">
        <!-- Header with Settings gear -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        ">
          <div></div>
          <button
            id="settings-btn"
            style="
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              color: #e8e8e8;
            "
          >⚙️</button>
        </div>

        <!-- Greeting -->
        <div style="
          margin-bottom: 2rem;
          text-align: center;
        ">
          <h1 style="
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            color: #e8e8e8;
          ">Ready to move?</h1>
          <p style="
            margin: 0;
            color: #999;
            font-size: 0.95rem;
          ">Select a day and start your workout</p>
        </div>

        <!-- Day-of-week selector -->
        <div style="
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 2rem;
        ">
          ${dayNames.map((day, idx) => `
            <button
              id="day-btn-${idx}"
              data-day-index="${idx}"
              class="day-selector-btn"
              style="
                padding: 0.75rem 0.5rem;
                background: ${idx === selectedDayIndex ? '#2dd4bf' : '#2a2a2a'};
                color: ${idx === selectedDayIndex ? '#1a1a1a' : '#e8e8e8'};
                border: 1px solid ${idx === selectedDayIndex ? '#2dd4bf' : '#444'};
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.75rem;
                font-weight: 600;
              "
            >${day.slice(0, 3)}</button>
          `).join('')}
        </div>

        <!-- Session preview -->
        <div style="
          background: #2a2a2a;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        ">
          <h3 style="
            margin: 0 0 0.75rem 0;
            color: #e8e8e8;
            font-size: 1rem;
          ">${dayNames[selectedDayIndex]}'s Workout</h3>
          <p style="
            margin: 0;
            color: #999;
            font-size: 0.9rem;
            line-height: 1.4;
          ">${dayPlanPreview || 'Rest day'}</p>
        </div>

        <!-- Spacer to push buttons to bottom -->
        <div style="flex: 1;"></div>

        <!-- Primary button: Start workout -->
        <button
          id="start-workout-btn"
          style="
            width: 100%;
            padding: 1rem;
            background: #2dd4bf;
            color: #1a1a1a;
            border: none;
            border-radius: 6px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 0.75rem;
          "
        >Start workout</button>

        <!-- Secondary links -->
        <div style="
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        ">
          <button
            id="view-plan-btn"
            style="
              flex: 1;
              padding: 0.75rem;
              background: transparent;
              color: #2dd4bf;
              border: 1px solid #2dd4bf;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.95rem;
            "
          >View plan</button>
          <button
            id="history-btn"
            style="
              flex: 1;
              padding: 0.75rem;
              background: transparent;
              color: #2dd4bf;
              border: 1px solid #2dd4bf;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.95rem;
            "
          >History</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Event listeners
    document.getElementById('settings-btn').onclick = () => {
      renderApp('settings');
    };

    document.getElementById('start-workout-btn').onclick = () => {
      this.startSession(selectedDayIndex);
    };

    document.getElementById('view-plan-btn').onclick = () => {
      renderApp('plan');
    };

    document.getElementById('history-btn').onclick = () => {
      renderApp('history');
    };

    // Day selector buttons
    document.querySelectorAll('.day-selector-btn').forEach(btn => {
      btn.onclick = (e) => {
        selectedDayIndex = parseInt(e.target.getAttribute('data-day-index'));
        this.render();
      };
    });

    // Add chat bubble
    const bubble = AIHook.createChatBubble('Welcome', null, null);
    document.body.appendChild(bubble);
  },

  startSession(dayIndex) {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dayKey = dayKeys[dayIndex];

    // Create new session
    const session = {
      id: 'session-' + Date.now(),
      date: dateStr,
      planDay: dayKey,
      hrStart: null,
      hrEnd: null,
      exercises: [],
      finishedAt: null,
      sessionActive: true,
      startTime: Date.now()
    };

    Storage.setCurrentSession(session);
    renderApp('today');
  }
};
