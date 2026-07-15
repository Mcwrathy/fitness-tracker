// History screen - view past sessions and chart trends

const HistoryScreen = {
  async render() {
    const container = document.getElementById('app');
    const sessions = Storage.getSessions();
    const library = ExerciseLibrary.getAll();

    if (sessions.length === 0) {
      container.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: #999;">
          <p>No sessions logged yet. Start with the Today screen!</p>
        </div>
      `;
      const bubble = AIHook.createChatBubble('History', null, null);
      document.body.appendChild(bubble);
      return;
    }

    const sessionsReversed = [...sessions].reverse();
    let html = '<div style="padding: 1rem;">';
    html += '<h1 style="margin: 0 0 1rem 0; color: #e8e8e8;">Session History</h1>';

    sessionsReversed.forEach((session) => {
      const date = new Date(session.date);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      let totalVolume = 0;
      session.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          totalVolume += (set.weight || 0) * (set.reps || 0);
        });
      });

      const exCount = session.exercises.length;

      html += `
        <button
          data-session-id="${session.id}"
          class="session-row"
          style="
            display: block;
            width: 100%;
            padding: 1rem;
            background: #2a2a2a;
            border: none;
            border-radius: 8px;
            margin-bottom: 0.75rem;
            text-align: left;
            cursor: pointer;
            color: #e8e8e8;
          "
        >
          <div style="font-weight: 600; margin-bottom: 0.5rem;">${dateStr}</div>
          <div style="color: #999; font-size: 0.9rem;">
            ${exCount} exercise${exCount !== 1 ? 's' : ''} • ${totalVolume.toLocaleString()} lb-reps
          </div>
        </button>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Add session row click handlers
    document.querySelectorAll('.session-row').forEach(btn => {
      btn.onclick = (e) => this.showSessionDetail(btn.getAttribute('data-session-id'), library);
    });

    // Add chat bubble
    const bubble = AIHook.createChatBubble('History', null, null);
    document.body.appendChild(bubble);
  },

  showSessionDetail(sessionId, library) {
    const session = Storage.getSession(sessionId);
    if (!session) return;

    const modal = document.createElement('div');
    modal.id = 'session-detail-modal';
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

    const date = new Date(session.date);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let html = `
      <h2 style="margin-top: 0; color: #e8e8e8;">Session • ${dateStr}</h2>
    `;

    if (session.hrStart || session.hrEnd) {
      html += `
        <p style="color: #999; font-size: 0.9rem;">
          HR: ${session.hrStart || '—'} → ${session.hrEnd || '—'} bpm
        </p>
      `;
    }

    html += '<div style="margin-top: 1rem;">';

    session.exercises.forEach((ex) => {
      const exDef = library.find(e => e.id === ex.exerciseId);
      if (!exDef) return;

      html += `
        <button
          data-ex-id="${ex.exerciseId}"
          class="exercise-detail-btn"
          style="
            display: block;
            width: 100%;
            padding: 0.75rem;
            background: #1a1a1a;
            border: 1px solid #444;
            border-radius: 6px;
            color: #e8e8e8;
            text-align: left;
            cursor: pointer;
            margin-bottom: 0.75rem;
          "
        >
          <strong>${exDef.name}</strong><br/>
          <span style="color: #999; font-size: 0.85rem;">
            ${ex.sets.length} set${ex.sets.length !== 1 ? 's' : ''}
          </span>
        </button>
      `;
    });

    html += '</div>';
    html += `
      <button
        id="close-detail"
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

    content.innerHTML = html;
    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('close-detail').onclick = () => modal.remove();

    document.querySelectorAll('.exercise-detail-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const exId = btn.getAttribute('data-ex-id');
        modal.remove();
        this.showChartOverlay(exId, library);
      };
    });
  },

  showChartOverlay(exerciseId, library) {
    const exDef = library.find(e => e.id === exerciseId);
    if (!exDef) return;

    const sessions = Storage.getSessions();

    const modal = document.createElement('div');
    modal.id = 'chart-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      z-index: 600;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      background: #2a2a2a;
      padding: 1rem;
      border-bottom: 1px solid #444;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <h2 style="margin: 0; color: #e8e8e8;">${exDef.name}</h2>
      <button
        id="close-chart"
        style="
          background: #444;
          color: #e8e8e8;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.2rem;
        "
      >×</button>
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      background: #1a1a1a;
      padding: 1.5rem;
    `;

    content.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h3 style="color: #e8e8e8; margin: 0 0 1rem 0;">Weight Over Time</h3>
        <div id="weight-chart" style="height: 250px;"></div>
      </div>
      <div>
        <h3 style="color: #e8e8e8; margin: 0 0 1rem 0;">Volume Over Time</h3>
        <div id="volume-chart" style="height: 250px;"></div>
      </div>
      <div style="margin-top: 2rem;">
        <h3 style="color: #e8e8e8;">Latest Sessions</h3>
        <div id="latest-sessions"></div>
      </div>
    `;

    modal.appendChild(header);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Draw charts
    Charts.drawWeightChart(
      document.getElementById('weight-chart'),
      exerciseId,
      exDef.name,
      sessions
    );

    Charts.drawVolumeChart(
      document.getElementById('volume-chart'),
      exerciseId,
      exDef.name,
      sessions
    );

    // Latest sessions
    const recentSessions = sessions.slice(-3).reverse();
    let latestHtml = '';
    recentSessions.forEach((session) => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        const date = new Date(session.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        let avgExertion = 0;
        ex.sets.forEach(set => {
          const val = { green: 1, yellow: 2, orange: 3, red: 4 }[set.exertion] || 2;
          avgExertion += val;
        });
        avgExertion = Math.round(avgExertion / ex.sets.length);

        const exertionEmoji = [0, '🟢', '🟡', '🟠', '🔴'][avgExertion] || '🟡';

        latestHtml += `
          <div style="
            background: #2a2a2a;
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #e8e8e8;
          ">
            <strong>${date}</strong> — ${ex.sets.length} set${ex.sets.length !== 1 ? 's' : ''} ${exertionEmoji}
          </div>
        `;
      }
    });

    document.getElementById('latest-sessions').innerHTML = latestHtml || '<p style="color: #999;">No data yet</p>';

    document.getElementById('close-chart').onclick = () => modal.remove();
  }
};
