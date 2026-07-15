// Chart.js wrappers for weight/volume trends

const Charts = {
  chartInstance: null,

  // Calculate weight trend for an exercise over sessions
  getWeightData(exerciseId, sessions) {
    const data = [];
    sessions.forEach((session) => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets && ex.sets.length > 0) {
        const maxWeight = Math.max(...ex.sets.map(s => s.weight || 0));
        data.push({
          date: session.date,
          weight: maxWeight,
          finishedAt: session.finishedAt
        });
      }
    });
    return data;
  },

  // Calculate volume trend (weight × reps sum)
  getVolumeData(exerciseId, sessions) {
    const data = [];
    sessions.forEach((session) => {
      const ex = session.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets && ex.sets.length > 0) {
        const volume = ex.sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
        data.push({
          date: session.date,
          volume: volume,
          finishedAt: session.finishedAt
        });
      }
    });
    return data;
  },

  // Draw weight trend chart
  drawWeightChart(container, exerciseId, exerciseName, sessions) {
    const data = this.getWeightData(exerciseId, sessions);
    if (data.length === 0) {
      container.innerHTML = '<p style="padding: 1rem; color: #999;">No data yet</p>';
      return;
    }

    const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }));
    const weights = data.map(d => d.weight);

    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Max Weight (lb)',
          data: weights,
          borderColor: '#2dd4bf',
          backgroundColor: 'rgba(45, 212, 191, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#2dd4bf',
          pointBorderColor: '#1a1a1a',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              color: '#e8e8e8'
            }
          }
        },
        scales: {
          y: {
            ticks: { color: '#999' },
            grid: { color: '#333' },
            beginAtZero: true
          },
          x: {
            ticks: { color: '#999' },
            grid: { color: '#333' }
          }
        }
      }
    });
  },

  // Draw volume trend chart
  drawVolumeChart(container, exerciseId, exerciseName, sessions) {
    const data = this.getVolumeData(exerciseId, sessions);
    if (data.length === 0) {
      container.innerHTML = '<p style="padding: 1rem; color: #999;">No data yet</p>';
      return;
    }

    const labels = data.map(d => new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }));
    const volumes = data.map(d => d.volume);

    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Volume (lb × reps)',
          data: volumes,
          borderColor: '#ff6b35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#ff6b35',
          pointBorderColor: '#1a1a1a',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              color: '#e8e8e8'
            }
          }
        },
        scales: {
          y: {
            ticks: { color: '#999' },
            grid: { color: '#333' },
            beginAtZero: true
          },
          x: {
            ticks: { color: '#999' },
            grid: { color: '#333' }
          }
        }
      }
    });
  }
};
