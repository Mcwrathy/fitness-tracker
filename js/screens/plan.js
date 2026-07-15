// Plan screen - view weekly schedule and standing rules

const PlanScreen = {
  async render() {
    const container = document.getElementById('app');
    const plan = Storage.getPlan();
    const settings = Storage.getSettings();
    const library = ExerciseLibrary.getAll();

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = {
      monday: 'Monday — Push',
      tuesday: 'Tuesday — Pull',
      wednesday: 'Wednesday — Westside Compound',
      thursday: 'Thursday — Legs',
      friday: 'Friday — Zone 2 Cardio + Core',
      saturday: 'Saturday — Pool Swim',
      sunday: 'Sunday — Active Recovery'
    };

    let html = '<div style="padding: 1rem;">';

    // Approval banner
    if (!settings.planApproved) {
      html += `
        <div style="
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          color: #fca5a5;
          text-align: center;
          font-weight: 600;
        ">
          ⏳ This plan is pending Uncle Gerry's approval
        </div>
      `;
    }

    // Standing rules
    html += `
      <div style="
        background: #2a2a2a;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
      ">
        <h2 style="
          margin: 0 0 1rem 0;
          color: #e8e8e8;
          font-size: 1.1rem;
        ">Standing Rules</h2>
        <div style="color: #999; font-size: 0.9rem; line-height: 1.6;">
          <p style="margin: 0 0 0.5rem 0;">
            <strong style="color: #2dd4bf;">RPE 6-7 max.</strong> Never fail a rep. Leave 3-4 in the tank.
          </p>
          <p style="margin: 0 0 0.5rem 0;">
            <strong style="color: #2dd4bf;">Exhale on exertion</strong> (no Valsalva / breath-holding).
          </p>
          <p style="margin: 0 0 0.5rem 0;">
            <strong style="color: #2dd4bf;">Full 2-min rest</strong> between sets.
          </p>
          <p style="margin: 0 0 0.5rem 0;">
            <strong style="color: #2dd4bf;">No max lifts, no HIIT, no boxing/heavy bag.</strong>
          </p>
          <p style="margin: 0;">
            <strong style="color: #2dd4bf;">Target HR 100–130 bpm</strong> | <strong style="color: #ef4444;">Ceiling 140 bpm</strong>
          </p>
        </div>
      </div>
    `;

    // STOP symptoms
    html += `
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
    `;

    // Weekly plan
    html += `
      <h2 style="
        margin: 1.5rem 0 1rem 0;
        color: #e8e8e8;
        font-size: 1.1rem;
      ">Weekly Schedule</h2>
    `;

    dayOrder.forEach((dayKey) => {
      const dayExercises = plan[dayKey] || [];
      const dayName = dayNames[dayKey];

      html += `
        <div style="
          background: #2a2a2a;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        ">
          <h3 style="
            margin: 0 0 0.75rem 0;
            color: #e8e8e8;
            font-size: 1rem;
          ">${dayName}</h3>
      `;

      if (dayExercises.length === 0) {
        html += '<p style="margin: 0; color: #999; font-size: 0.9rem;">No exercises planned</p>';
      } else {
        dayExercises.forEach((target) => {
          const exDef = library.find(e => e.id === target.exerciseId);
          if (!exDef) return;

          html += `
            <div style="
              background: #1a1a1a;
              padding: 0.75rem;
              border-radius: 6px;
              margin-bottom: 0.5rem;
              font-size: 0.9rem;
              color: #e8e8e8;
            ">
              <strong>${exDef.name}</strong><br/>
              <span style="color: #999;">
                ${target.targetSets} × ${target.targetReps} @ ${target.targetWeight} ${target.unit || 'lb'}
              </span>
            </div>
          `;
        });
      }

      html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    // Add chat bubble
    const bubble = AIHook.createChatBubble('Plan', null, null);
    document.body.appendChild(bubble);
  }
};
