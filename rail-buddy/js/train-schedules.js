document.addEventListener('DOMContentLoaded', function() {
  const TRAIN_SCHEDULES_CACHE_KEY = 'railbuddy_train_schedules_cache';
  const TRAIN_SCHEDULES_DATA_KEY = 'railbuddy_train_schedules_data';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  let allSchedules = [];
  let filteredSchedules = [];

  const loadingSpinner = document.getElementById('loadingSpinner');
  const schedulesList = document.getElementById('schedulesList');
  const noResults = document.getElementById('noResults');
  const trainSearch = document.getElementById('trainSearch');
  const clearSearch = document.getElementById('clearSearch');
  const refreshBtn = document.getElementById('refreshBtn');
  const resultsCount = document.getElementById('resultsCount');

  // Load train schedules from API
  async function loadTrainSchedules() {
    try {
      loadingSpinner.style.display = 'block';
      schedulesList.style.display = 'none';
      noResults.style.display = 'none';

      const response = await fetch('/train-schedules');
      if (!response.ok) {
        throw new Error('Failed to fetch train schedules');
      }

      const data = await response.json();
      
      // Parse the GTFS Realtime data
      // The response should contain train trip information
      allSchedules = data.value || [];
      
      // Cache the data
      localStorage.setItem(TRAIN_SCHEDULES_CACHE_KEY, Date.now().toString());
      localStorage.setItem(TRAIN_SCHEDULES_DATA_KEY, JSON.stringify(allSchedules));

      filteredSchedules = [...allSchedules];
      displaySchedules();
    } catch (error) {
      console.error('Error loading train schedules:', error);
      loadingSpinner.innerHTML = `
        <p style="color: var(--error-color, #dc3545);">
          <i class="fa-regular fa-exclamation-circle"></i> 
          Error loading train schedules. Please try again.
        </p>
      `;
    }
  }

  // Display schedules in the UI
  function displaySchedules() {
    loadingSpinner.style.display = 'none';
    
    if (filteredSchedules.length === 0) {
      schedulesList.style.display = 'none';
      noResults.style.display = 'block';
      resultsCount.textContent = '';
      return;
    }

    schedulesList.innerHTML = '';
    resultsCount.textContent = `${filteredSchedules.length} result${filteredSchedules.length !== 1 ? 's' : ''}`;

    filteredSchedules.forEach(schedule => {
      const card = createScheduleCard(schedule);
      schedulesList.appendChild(card);
    });

    schedulesList.style.display = 'block';
    noResults.style.display = 'none';
  }

  // Create a schedule card
  function createScheduleCard(schedule) {
    const card = document.createElement('div');
    card.className = 'schedule-card';
    card.style.cssText = `
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      background: var(--card-bg, #ffffff);
      transition: box-shadow 0.3s ease;
    `;

    // Format the schedule data
    const tripId = schedule.TripID || schedule.trip_id || 'N/A';
    const routeId = schedule.RouteID || schedule.route_id || 'N/A';
    const arrivalTime = schedule.ArrivalTime || schedule.arrival_time || 'N/A';
    const departureTime = schedule.DepartureTime || schedule.departure_time || 'N/A';
    const currentStopSeq = schedule.StopSequence || schedule.stop_sequence || 'N/A';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-weight: bold; font-size: 1.1em; color: var(--primary-color, #0066cc);">
              <i class="fa-solid fa-train"></i> Route ${routeId}
            </span>
          </div>
          <div style="font-size: 0.9em; color: var(--text-secondary, #666666); margin-bottom: 4px;">
            Trip ID: <span style="font-family: monospace;">${tripId}</span>
          </div>
          <div style="font-size: 0.9em; color: var(--text-secondary, #666666); margin-bottom: 4px;">
            Stop Sequence: ${currentStopSeq}
          </div>
          <div style="display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap;">
            <div>
              <div style="font-size: 0.8em; color: var(--text-secondary, #999999);">Arrival</div>
              <div style="font-weight: bold; font-size: 1em;">${formatTime(arrivalTime)}</div>
            </div>
            <div>
              <div style="font-size: 0.8em; color: var(--text-secondary, #999999);">Departure</div>
              <div style="font-weight: bold; font-size: 1em;">${formatTime(departureTime)}</div>
            </div>
          </div>
        </div>
        <div style="padding-left: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-bg, #e8f0ff); display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-train" style="font-size: 1.5em; color: var(--primary-color, #0066cc);"></i>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = 'none';
    });

    return card;
  }

  // Format time helper
  function formatTime(timeStr) {
    if (!timeStr || timeStr === 'N/A') return 'N/A';
    
    // Handle different time formats
    if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeStr.substring(0, 5); // HH:MM
    }
    
    // If it's a number in seconds since midnight
    if (!isNaN(timeStr)) {
      const seconds = parseInt(timeStr);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    return timeStr;
  }

  // Search functionality
  function filterSchedules(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      filteredSchedules = [...allSchedules];
    } else {
      filteredSchedules = allSchedules.filter(schedule => {
        const tripId = (schedule.TripID || schedule.trip_id || '').toLowerCase();
        const routeId = (schedule.RouteID || schedule.route_id || '').toLowerCase();
        const description = (schedule.description || '').toLowerCase();
        
        return tripId.includes(term) || routeId.includes(term) || description.includes(term);
      });
    }
    
    displaySchedules();
  }

  // Event listeners
  trainSearch.addEventListener('input', (e) => {
    filterSchedules(e.target.value);
  });

  clearSearch.addEventListener('click', () => {
    trainSearch.value = '';
    filterSchedules('');
    trainSearch.focus();
  });

  refreshBtn.addEventListener('click', () => {
    loadTrainSchedules();
  });

  // Initial load
  loadTrainSchedules();
});
