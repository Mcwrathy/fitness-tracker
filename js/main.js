// Main app bootstrap and routing

let currentScreen = 'today';

async function initApp() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW reg failed:', err));
  }

  // Initialize exercise library
  await ExerciseLibrary.initialize();

  // Initialize plan if empty
  let plan = Storage.getPlan();
  if (Object.keys(plan).length === 0) {
    const defaultPlan = {
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
    Storage.setPlan(defaultPlan);
  }

  // Render initial screen
  renderApp('today');
}

async function renderApp(screen) {
  currentScreen = screen;
  window.location.hash = '#' + screen;

  // Remove old chat bubble
  const oldBubble = document.getElementById('ai-chat-bubble');
  if (oldBubble) oldBubble.remove();

  // Render screen
  if (screen === 'today') {
    await TodayScreen.render();
  } else if (screen === 'history') {
    await HistoryScreen.render();
  } else if (screen === 'plan') {
    await PlanScreen.render();
  } else if (screen === 'settings') {
    await SettingsScreen.render();
  }
}

async function main() {
  // Set up HTML structure
  document.body.innerHTML = `
    <div id="app"></div>
    <nav id="nav" style="
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #2a2a2a;
      border-top: 1px solid #444;
      display: flex;
      justify-content: space-around;
      padding: 0.75rem 0;
      z-index: 50;
    ">
      <button
        id="nav-today"
        data-screen="today"
        class="nav-btn"
        style="
          flex: 1;
          background: none;
          border: none;
          color: #e8e8e8;
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
        "
      >📅</button>
      <button
        id="nav-history"
        data-screen="history"
        class="nav-btn"
        style="
          flex: 1;
          background: none;
          border: none;
          color: #e8e8e8;
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
        "
      >📊</button>
      <button
        id="nav-plan"
        data-screen="plan"
        class="nav-btn"
        style="
          flex: 1;
          background: none;
          border: none;
          color: #e8e8e8;
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
        "
      >📋</button>
      <button
        id="nav-settings"
        data-screen="settings"
        class="nav-btn"
        style="
          flex: 1;
          background: none;
          border: none;
          color: #e8e8e8;
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
        "
      >⚙️</button>
    </nav>
  `;

  // Add padding to account for fixed nav
  const app = document.getElementById('app');
  app.style.paddingBottom = '70px';

  // Set up nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = (e) => {
      const screen = btn.getAttribute('data-screen');
      renderApp(screen);
    };
  });

  // Handle hash-based routing
  window.onhashchange = () => {
    const screen = window.location.hash.slice(1) || 'today';
    if (['today', 'history', 'plan', 'settings'].includes(screen)) {
      renderApp(screen);
    }
  };

  // Initialize app
  await initApp();
}

// Settings screen
const SettingsScreen = {
  async render() {
    const container = document.getElementById('app');
    const settings = Storage.getSettings();

    const html = `
      <div style="padding: 1rem;">
        <h1 style="margin: 0 0 1.5rem 0; color: #e8e8e8;">Settings</h1>

        <!-- Discord Webhook -->
        <div style="margin-bottom: 1.5rem;">
          <label style="
            display: block;
            color: #e8e8e8;
            font-weight: 600;
            margin-bottom: 0.5rem;
          ">Discord Webhook URL</label>
          <input
            id="webhook-url"
            type="text"
            value="${settings.discordWebhookUrl}"
            placeholder="Paste Discord webhook URL..."
            style="
              width: 100%;
              padding: 0.75rem;
              border: 1px solid #444;
              border-radius: 6px;
              background: #2a2a2a;
              color: #e8e8e8;
              box-sizing: border-box;
              font-size: 0.9rem;
            "
          />
          <p style="
            margin: 0.5rem 0 0 0;
            color: #999;
            font-size: 0.85rem;
          ">Find this in Discord: Server → #workout-tracking-app → right-click → Integrations → Webhooks</p>
        </div>

        <!-- Plan Approved Toggle -->
        <div style="
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #2a2a2a;
          border-radius: 6px;
        ">
          <label style="color: #e8e8e8; font-weight: 600;">Plan Approved by Uncle Gerry</label>
          <input
            id="plan-approved"
            type="checkbox"
            ${settings.planApproved ? 'checked' : ''}
            style="
              width: 40px;
              height: 24px;
              cursor: pointer;
            "
          />
        </div>

        <!-- HR Tracking Toggle -->
        <div style="
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #2a2a2a;
          border-radius: 6px;
        ">
          <label style="color: #e8e8e8; font-weight: 600;">HR Tracking Enabled</label>
          <input
            id="hr-enabled"
            type="checkbox"
            ${settings.hrEnabled ? 'checked' : ''}
            style="
              width: 40px;
              height: 24px;
              cursor: pointer;
            "
          />
        </div>

        <!-- Danger Zone -->
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 6px;
          padding: 1rem;
          margin-top: 2rem;
        ">
          <h3 style="
            margin: 0 0 1rem 0;
            color: #ef4444;
            font-size: 1rem;
          ">⚠️ Danger Zone</h3>
          <button
            id="reset-targets"
            style="
              display: block;
              width: 100%;
              padding: 0.75rem;
              background: #444;
              color: #e8e8e8;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              margin-bottom: 0.75rem;
              font-size: 0.9rem;
            "
          >Reset Targets to Plan v1</button>
          <button
            id="wipe-all"
            style="
              display: block;
              width: 100%;
              padding: 0.75rem;
              background: #ef4444;
              color: #fff;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.9rem;
            "
          >Wipe All Data</button>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Event listeners
    document.getElementById('webhook-url').onblur = (e) => {
      Storage.setSetting('discordWebhookUrl', e.target.value);
    };

    document.getElementById('plan-approved').onchange = (e) => {
      Storage.setSetting('planApproved', e.target.checked);
      renderApp('plan');
    };

    document.getElementById('hr-enabled').onchange = (e) => {
      Storage.setSetting('hrEnabled', e.target.checked);
    };

    document.getElementById('reset-targets').onclick = () => {
      const ok = confirm('Reset all targets to plan v1 defaults?');
      if (ok) {
        const defaultPlan = AdaptiveTargets.resetPlanToDefaults();
        Storage.setPlan(defaultPlan);
        alert('Targets reset!');
      }
    };

    document.getElementById('wipe-all').onclick = () => {
      const ok = confirm('Wipe ALL data? This cannot be undone.');
      if (ok) {
        const ok2 = confirm('Really? Confirm by typing "wipe" in the next prompt.');
        if (ok2) {
          const input = prompt('Type "wipe" to confirm:');
          if (input === 'wipe') {
            Storage.wipeAllData();
            alert('Data wiped. Refreshing...');
            location.reload();
          }
        }
      }
    };

    // Add chat bubble
    const bubble = AIHook.createChatBubble('Settings', null, null);
    document.body.appendChild(bubble);
  }
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
