# Fitness Tracker PWA

A Progressive Web App fitness tracker built for Dan's cardioprotection protocol. Features adaptive weight targets based on performance, medical safety guardrails (HR ceiling, STOP-symptoms), and offline functionality.

## Features

- **Three main screens**: Today (workout logging), History (session review + charts), Plan (weekly schedule)
- **Adaptive targets**: Weights automatically adjust based on reps hit and perceived exertion
- **Medical safety**: HR ceiling (140 bpm), STOP-symptoms warning strip, RPE guidelines
- **Offline-ready**: Service worker caches all assets for offline use
- **Discord integration**: Floating chat bubble to message Sonya directly from the app
- **Dark theme**: Easy on the eyes during workouts
- **Mobile-first**: 44px+ touch targets, designed for Android gym use

## Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/Mcwrathy/fitness-tracker.git
   cd fitness-tracker/app
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open in your browser:
   ```
   http://localhost:8080
   ```

4. On Android Chrome, press menu → "Install app" to add to home screen (PWA install).

## Discord Webhook Setup

1. In Discord, go to `#workout-tracking-app` channel
2. Right-click the channel → Integrations → Webhooks → New Webhook
3. Copy the webhook URL
4. In the Fitness Tracker app, tap ⚙️ (Settings)
5. Paste the webhook URL into "Discord Webhook URL"
6. Tap the chat bubble (💬) on any screen to send messages to Sonya

## Deployment to GitHub Pages

1. Ensure your local repo is clean:
   ```bash
   git status
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Update fitness tracker"
   git push origin main
   ```

3. In GitHub repo settings → Pages → Deploy from branch: main / root
4. Wait ~2 minutes for deployment
5. Access at: `https://mcwrathy.github.io/fitness-tracker/`

## File Structure

```
app/
├── index.html              # PWA entry point + PWA meta tags
├── manifest.json           # PWA manifest (name, icons, theme)
├── sw.js                   # Service worker (offline caching)
├── css/
│   └── styles.css          # Dark theme, mobile-first
├── js/
│   ├── main.js             # App bootstrap + routing + Settings
│   ├── storage.js          # localStorage helpers
│   ├── adaptive.js         # Adaptive target algorithm
│   ├── charts.js           # Chart.js wrappers
│   ├── library.js          # Exercise search
│   ├── ai-hook.js          # Discord webhook modal
│   └── screens/
│       ├── today.js        # Workout logging
│       ├── history.js      # Session list + charts
│       └── plan.js         # Weekly schedule + rules
├── data/
│   └── exercises.json      # 45+ exercise definitions
└── icons/
    └── icon.svg            # PWA icon (dark dumbbell)
```

## Data Model

All data stored in localStorage (no server/login):
- `fitness.exercises.library` - exercise definitions
- `fitness.plan` - weekly targets by day
- `fitness.sessions` - finished sessions (append-only)
- `fitness.settings` - user preferences
- `fitness.currentSession` - draft session in progress

## Adaptive Target Algorithm

After finishing a session, for each exercise:
- **All reps hit + avg exertion ≤ yellow** → bump weight (+2.5 lb upper, +5 lb lower)
- **All reps hit + avg exertion = orange** → hold weight, +1 rep
- **Any set missed reps or any red** → hold weight
- **Two reds in a row for same exercise** → drop weight 5%

See spec for full details.

## Safety Features

- **HR Ceiling**: 140 bpm absolute (target 100–130)
- **STOP-symptoms strip**: Always visible during active session
  - Chest pain, unusual shortness of breath, dizziness, palpitations, blurred vision
- **RPE 6–7 max**: Leave 3–4 in the tank
- **No max lifts, no HIIT, no heavy bag**
- **Full 2-min rest between sets**
- **Warnings**:
  - HR end > 140 → red toast
  - 3+ red exertions in session → warning prompt

## Plan Seed Data (from memory/dan-health.md)

- **Monday** (Push): DB Bench, DB OHP, DB Tricep Ext
- **Tuesday** (Pull): BB Row, DB Row, EZ Curls
- **Wednesday** (Westside): Back Squat, DB Bench, RDL
- **Thursday** (Legs): Goblet Squat, RDL, Glute Bridges
- **Friday** (Zone 2 + Core): Recumbent Bike 25 min + Planks
- **Saturday** (Pool): Pool laps
- **Sunday** (Recovery): Light activity

Note: Monday uses DB Bench (not barbell) and landmine/neutral-grip OHP due to left shoulder modifications.

## Shoulder Mods

Due to left shoulder imbalance history (most recent flare June 2026):
- Use dumbbell bench press (not barbell)
- Landmine/neutral-grip OHP variations
- Rotator cuff warmup recommended (band pull-aparts, wall slides, light external rotations)

## Contact / Issues

Send a message via the app (💬 button) or edit `#workout-tracking-app` in Discord. Sonya will handle it and push updates as needed.
