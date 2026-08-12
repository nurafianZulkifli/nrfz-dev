document.addEventListener('DOMContentLoaded', function() {
  const API_SERVER = 'https://bat-lta-9eb7bbf231a2.herokuapp.com';

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

  // Station view elements
  const stationDropdown = document.getElementById('stationDropdown');
  const stationSearch = document.getElementById('stationSearch');
  const clearStationSearch = document.getElementById('clearStationSearch');
  const stationPanel = document.getElementById('stationPanel');
  const stationTitle = document.getElementById('stationTitle');
  const stationSubtitle = document.getElementById('stationSubtitle');
  const stationLiveStatus = document.getElementById('stationLiveStatus');
  const stationDirections = document.getElementById('stationDirections');
  const backToAllBtn = document.getElementById('backToAllBtn');
  const allUpdatesHeader = document.getElementById('allUpdatesHeader');
  const contentSection = document.getElementById('contentSection');

  // Polling state
  let pollingInterval = 30000; // 30 seconds default
  let pollingTimer = null;
  let etaUpdateTimer = null;
  let isPolling = false;
  let lastUpdateTime = null;

  // True when LTA feed decoded fine but has no reportable delays/cancellations
  let allTrainsOnSchedule = false;

  // Curated headway table (see json/headways.json) — LTA provides no live
  // "next train" prediction, so this is an estimate, not real-time data.
  let headwayData = null;

  async function loadHeadwayData() {
    if (headwayData) return headwayData;
    try {
      const res = await fetch('./json/headways.json');
      headwayData = await res.json();
    } catch (err) {
      console.warn('[Headway] Could not load headway estimates:', err.message);
      headwayData = null;
    }
    return headwayData;
  }

  // Determine which named period (peak/off-peak/night/early morning) applies now
  function getCurrentHeadwayPeriod(periods) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = day === 0 || day === 6;
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    const toMinutes = (hhmm) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };

    if (!isWeekend) {
      const am = periods.weekdayPeakAM, pm = periods.weekdayPeakPM;
      if (minutesNow >= toMinutes(am.start) && minutesNow <= toMinutes(am.end)) return 'peak';
      if (minutesNow >= toMinutes(pm.start) && minutesNow <= toMinutes(pm.end)) return 'peak';
    }
    if (minutesNow >= toMinutes(periods.night.start) || minutesNow <= toMinutes(periods.earlyMorning.end)) {
      return 'night';
    }
    return 'offPeak';
  }

  // Build the estimated frequency table shown when no live delay data exists.
  // Pass lineCodesFilter (e.g. ['NSL','EWL']) to restrict to specific lines.
  function renderHeadwayEstimates(lineCodesFilter) {
    if (!headwayData) return '';

    const period = getCurrentHeadwayPeriod(headwayData.periods);
    const periodLabel = { peak: 'Peak Hours', offPeak: 'Off-Peak', night: 'Late Night' }[period];
    const keyMap = { peak: 'peak', offPeak: 'offPeak', night: 'night' };

    const entries = Object.entries(headwayData.lines)
      .filter(([code]) => !lineCodesFilter || lineCodesFilter.includes(code));

    const rows = entries.map(([code, line]) => {
      const mins = line[keyMap[period]];
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--border-color, #eee);">
          <span style="font-weight: 600;">${line.name}</span>
          <span style="color: var(--text-secondary, #666); font-size: 0.9em;">~${mins} min</span>
        </div>
      `;
    }).join('');

    return `
      <div style="margin-top: 1.5em; text-align: left; max-width: 420px; margin-left: auto; margin-right: auto; border: 1px solid var(--border-color, #e0e0e0); border-radius: 8px; overflow: hidden;">
        <div style="padding: 10px 12px; background: var(--card-bg-alt, #f5f5f5); font-weight: 700; font-size: 0.85em; display: flex; justify-content: space-between;">
          <span>Estimated Frequency</span>
          <span>${periodLabel}</span>
        </div>
        ${rows}
        <div style="padding: 8px 12px; font-size: 0.75em; color: var(--text-secondary, #999);">
          ~ Estimated from typical service intervals, not live train positions.
        </div>
      </div>
    `;
  }

  // ── Station View (first/last train timings + live status per station) ──
  let smrtFtLtData = [];
  let sbsFtLtData = [];
  let smrtStationCodes = {};
  let stationIndex = []; // [{ name, code, source, directions }]
  let filteredStationIndex = [];
  let selectedStation = null;

  // Map a station code prefix (e.g. "NS", "EW") to a headway line key
  const LINE_PREFIX_MAP = {
    NS: 'NSL', EW: 'EWL', CG: 'EWL', CC: 'CCL', CE: 'CCL',
    DT: 'DTL', TE: 'TEL', NE: 'NEL', BP: 'BP', SE: 'SK', SW: 'SK', PE: 'PG', PW: 'PG'
  };

  function extractLinePrefixes(codeString) {
    if (!codeString) return [];
    // e.g. "NS1/EW24" or "DT1 Bukit Panjang" -> ["NS", "EW"] / ["DT"]
    const matches = codeString.match(/[A-Za-z]{2}/g) || [];
    const prefixes = matches.map(p => p.toUpperCase());
    return [...new Set(prefixes)]
      .map(p => LINE_PREFIX_MAP[p])
      .filter(Boolean);
  }

  async function loadStationData() {
    if (stationIndex.length > 0) return stationIndex;
    try {
      const [smrtRes, sbsRes, codesRes] = await Promise.all([
        fetch('json/smrt-ft-lt.json'),
        fetch('json/sbs-transit-ft-lt.json'),
        fetch('json/smrt-station-codes.json')
      ]);

      if (!smrtRes.ok || !sbsRes.ok) {
        throw new Error(`HTTP Error: SMRT ${smrtRes.status}, SBS ${sbsRes.status}`);
      }

      smrtFtLtData = await smrtRes.json();
      sbsFtLtData = await sbsRes.json();
      if (codesRes.ok) smrtStationCodes = await codesRes.json();

      stationIndex = [];

      smrtFtLtData.forEach((s, i) => {
        const code = smrtStationCodes[s.station] || '';
        stationIndex.push({
          name: s.station,
          code,
          source: 'smrt',
          value: `smrt-${i}`,
          directions: s.directions,
          lineKeys: extractLinePrefixes(code)
        });
      });

      sbsFtLtData.forEach((s, i) => {
        // SBS station strings look like "DT1 Bukit Panjang" or "East Loop"
        const codeMatch = s.station.match(/^([A-Za-z]{2}\d+)\s+(.+)$/);
        const code = codeMatch ? codeMatch[1] : '';
        const displayName = codeMatch ? codeMatch[2] : s.station;
        stationIndex.push({
          name: displayName,
          code,
          source: 'sbs',
          value: `sbs-${i}`,
          directions: s.directions,
          lineKeys: extractLinePrefixes(code || s.station)
        });
      });

      filteredStationIndex = [...stationIndex];
      populateStationDropdown();
    } catch (err) {
      console.error('[StationView] Error loading station data:', err.message);
      if (stationDropdown) {
        stationDropdown.innerHTML = '<option value="">Error loading stations</option>';
      }
    }
    return stationIndex;
  }

  function populateStationDropdown() {
    if (!stationDropdown) return;
    stationDropdown.innerHTML = '<option value="">Select a station...</option>';

    const smrtGroup = document.createElement('optgroup');
    smrtGroup.label = 'SMRT';
    const sbsGroup = document.createElement('optgroup');
    sbsGroup.label = 'SBS Transit';

    filteredStationIndex.forEach(station => {
      const option = document.createElement('option');
      option.value = station.value;
      option.textContent = station.code ? `${station.code} ${station.name}` : station.name;
      (station.source === 'smrt' ? smrtGroup : sbsGroup).appendChild(option);
    });

    if (smrtGroup.children.length) stationDropdown.appendChild(smrtGroup);
    if (sbsGroup.children.length) stationDropdown.appendChild(sbsGroup);
  }

  function filterStations(term) {
    const q = term.toLowerCase().trim();
    filteredStationIndex = !q ? [...stationIndex] : stationIndex.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
    populateStationDropdown();
  }

  // Find any live tripUpdate entries relevant to this station's lines
  function getLiveStatusForStation(station) {
    if (!allSchedules || allSchedules.length === 0) return [];
    return allSchedules.filter(sched => {
      const routeMatch = station.lineKeys.some(lk =>
        (sched.routeId || '').toUpperCase().includes(lk.replace('L', ''))
      );
      const textMatch = (sched.description || '').toLowerCase().includes(station.name.toLowerCase());
      return routeMatch || textMatch;
    });
  }

  const DAY_LABELS = {
    monday_to_friday: 'Mon - Fri',
    saturday: 'Saturday',
    sunday_public_holidays: 'Sun / Holidays',
    eve_of_public_holidays: 'Eve of Holidays'
  };

  // Map JS Date.getDay() to the matching first/last-train day key
  function getTodayDayKey() {
    const day = new Date().getDay(); // 0 = Sun ... 6 = Sat
    if (day === 0) return 'sunday_public_holidays';
    if (day === 6) return 'saturday';
    return 'monday_to_friday';
  }

  function parseHHMMToMinutes(hhmm) {
    if (!hhmm || hhmm === '--') return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  // Compare "now" against a direction's first/last train times for today,
  // and estimate the next train using the line's headway table.
  function computeNextTrainEstimate(direction, lineKeys) {
    const dayKey = getTodayDayKey();
    const firstMin = parseHHMMToMinutes(direction.first_train?.[dayKey]);
    let lastMin = parseHHMMToMinutes(direction.last_train?.[dayKey]);

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    if (firstMin === null && lastMin === null) {
      return { status: 'unknown', label: 'No schedule data for today' };
    }

    // Last train times past midnight (e.g. 00:50) belong to the next day
    if (lastMin !== null && firstMin !== null && lastMin < firstMin) {
      lastMin += 24 * 60;
    }

    const nowAdjusted = nowMin < firstMin ? nowMin + 24 * 60 : nowMin;
    const isRunning = firstMin !== null && lastMin !== null
      ? nowAdjusted >= firstMin && nowAdjusted <= lastMin
      : true;

    if (firstMin !== null && nowMin < firstMin && !isRunning) {
      return { status: 'before', label: `First train at ${direction.first_train[dayKey]}` };
    }
    if (lastMin !== null && !isRunning) {
      return { status: 'after', label: `Service ended — last train at ${direction.last_train[dayKey]}` };
    }

    // Running now — estimate next train using the headway table
    if (headwayData && lineKeys && lineKeys.length > 0) {
      const period = getCurrentHeadwayPeriod(headwayData.periods);
      const keyMap = { peak: 'peak', offPeak: 'offPeak', night: 'night' };
      const line = headwayData.lines[lineKeys[0]];
      if (line) {
        const headwayMin = line[keyMap[period]];
        const etaMin = nowMin + headwayMin - (nowMin % Math.round(headwayMin));
        const minutesUntilTrain = Math.round(etaMin - nowMin);
        return { status: 'running', label: `Arriving in: ${minutesUntilTrain} mins`, etaMinutes: headwayMin };
      }
    }

    return { status: 'running', label: 'Running now' };
  }

  function renderStationDirectionCard(direction, lineKeys) {
    const estimate = computeNextTrainEstimate(direction, lineKeys);
    const chipColor = { running: '#4CAF50', before: '#FF9800', after: '#999999', unknown: '#999999' }[estimate.status];
    
    // For "running" status, show next 3-4 trains as time cards
    let upcomingTrainsHtml = '';
    let nextTrainLabel = estimate.label; // Default to computed estimate
    
    if (estimate.status === 'running' && headwayData && lineKeys && lineKeys.length > 0) {
      const period = getCurrentHeadwayPeriod(headwayData.periods);
      const keyMap = { peak: 'peak', offPeak: 'offPeak', night: 'night' };
      const line = headwayData.lines[lineKeys[0]];
      if (line) {
        const headwayMin = line[keyMap[period]];
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        
        // Get first/last train times for filtering
        const dayKey = getTodayDayKey();
        const firstTrainStr = direction.first_train?.[dayKey];
        const lastTrainStr = direction.last_train?.[dayKey];
        const firstTrainMin = firstTrainStr && firstTrainStr !== '--' ? parseHHMMToMinutes(firstTrainStr) : null;
        const lastTrainMin = lastTrainStr && lastTrainStr !== '--' ? parseHHMMToMinutes(lastTrainStr) : null;
        
        // Compute next 3-4 trains
        const upcomingTrains = [];
        for (let i = 0; i < 4; i++) {
          let etaMin = nowMin + (i + 1) * headwayMin - (nowMin % Math.round(headwayMin));
          
          // Handle day wraparound
          let etaHour = Math.floor(etaMin / 60);
          let etaMinute = etaMin % 60;
          let isNextDay = false;
          
          if (etaHour >= 24) {
            etaHour = etaHour % 24;
            isNextDay = true;
          }
          
          const etaStr = `${String(etaHour).padStart(2, '0')}:${String(Math.round(etaMinute)).padStart(2, '0')}`;
          const etaMinForComparison = etaHour * 60 + etaMinute;
          
          // Filter: only show if within operating hours
          let isWithinHours = true;
          
          if (isNextDay) {
            // Train is after midnight - check against first train only (next day's start)
            if (firstTrainMin !== null && etaMinForComparison < firstTrainMin) isWithinHours = false;
          } else {
            // Train is today - check first train (if after service ends, it won't show)
            if (firstTrainMin !== null && etaMinForComparison < firstTrainMin) isWithinHours = false;
            
            // Check against last train - but if last train is early morning (< 5:00), it's tomorrow's
            if (lastTrainMin !== null) {
              if (lastTrainMin < 300) {  // 5:00 AM = 300 minutes - early morning time is next day
                // Last train is tomorrow, so today's trains up to 23:59 are OK
                isWithinHours = true;
              } else {
                // Last train is today, check if this train time is before it
                if (etaMinForComparison > lastTrainMin) isWithinHours = false;
              }
            }
          }
          
          if (isWithinHours) {
            upcomingTrains.push(etaStr);
          }
        }
        
        // Calculate "Arriving in" based on first upcoming train
        if (upcomingTrains.length > 0) {
          const firstTrain = upcomingTrains[0];
          const [trainHour, trainMinute] = firstTrain.split(':').map(Number);
          const trainTotalMin = trainHour * 60 + trainMinute;
          let minutesUntil = trainTotalMin - nowMin;
          
          // Handle midnight wraparound
          if (minutesUntil < 0) {
            minutesUntil += 24 * 60;
          }
          
          const roundedMinutes = Math.round(minutesUntil);
          const minLabel = roundedMinutes === 1 ? 'min' : 'mins';
          nextTrainLabel = `Arriving in: ${roundedMinutes} ${minLabel}`;
        }
        
        upcomingTrainsHtml = `<div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">${upcomingTrains.map(time => `<div style="background: #f0f0f0; color: #333; padding: 6px 12px; border-radius: 6px; font-size: 0.9em; font-weight: 600; border: 1px solid #ddd;">${time}</div>`).join('')}</div>`;
      }
    }

    const nextTrainChip = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 0.8em; color: var(--text-secondary, #999);">Estimated arrival</span>
        <span style="font-size: 0.85em; font-weight: 700; color: ${chipColor}; background: ${chipColor}20; padding: 3px 10px; border-radius: 12px;">
          ${nextTrainLabel}
        </span>
      </div>
      ${upcomingTrainsHtml}
    `;

    return `
      <div style="border: 1px solid var(--border-color, #e0e0e0); border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; background: var(--card-bg, #fff);">
        <div style="font-weight: 700; margin-bottom: 8px;"><i class="fa-solid fa-train"></i> ${direction.description}</div>
        ${nextTrainChip}
      </div>
    `;
  }

  function renderStationPanel(station) {
    stationTitle.textContent = station.code ? `${station.code} ${station.name}` : station.name;
    stationSubtitle.textContent = station.source === 'smrt' ? 'SMRT' : 'SBS Transit';

    // Live status: real delay/cancellation data takes priority over the estimate
    const liveMatches = getLiveStatusForStation(station);
    if (liveMatches.length > 0) {
      stationLiveStatus.innerHTML = `
        <div style="margin-bottom: 1em;">
          ${liveMatches.map(m => createScheduleCard(m).outerHTML).join('')}
        </div>
      `;
    } else {
      stationLiveStatus.innerHTML = `
        <div style="text-align: center; padding: 1em;">
          <p style="color: #4CAF50;"><i class="fa-solid fa-circle-check"></i> <strong>No reported delays</strong></p>
          ${renderHeadwayEstimates(station.lineKeys)}
        </div>
      `;
    }

    stationDirections.innerHTML = station.directions.length > 0
      ? station.directions.map(d => renderStationDirectionCard(d, station.lineKeys)).join('')
      : '<p style="color: var(--text-secondary, #666);">No timing data available.</p>';
  }

  function showStationPanel() {
    stationPanel.style.display = 'block';
    allUpdatesHeader.style.display = 'none';
    contentSection.style.display = 'none';
  }

  function hideStationPanel() {
    stationPanel.style.display = 'none';
    allUpdatesHeader.style.display = 'block';
    contentSection.style.display = 'block';
    selectedStation = null;
    stationDropdown.value = '';
  }

  // Parse train alerts into schedule format
  function parseTrainAlerts(alerts) {
    const schedules = [];
    
    if (!alerts || alerts.length === 0) return schedules;
    
    alerts.forEach((alert, index) => {
      // Extract line name from the alert
      const lineName = alert.LineName || 'Unknown Line';
      const lineId = alert.LineID || `LINE_${index}`;
      
      // Create schedule entries from messages
      if (alert.Message && Array.isArray(alert.Message)) {
        alert.Message.forEach((msg, msgIndex) => {
          schedules.push({
            tripId: `${lineId}_${msgIndex}`,
            routeId: lineId,
            lineName: lineName,
            message: msg.Content || 'No information',
            createdDate: msg.CreatedDate || new Date().toISOString(),
            status: alert.LineStatusID || 1,
            description: `${lineName} - ${msg.Content || 'Status update'}`
          });
        });
      } else {
        // Fallback if no messages
        schedules.push({
          tripId: lineId,
          routeId: lineId,
          lineName: lineName,
          message: 'No additional information',
          createdDate: alert.LastUpdatedDate || new Date().toISOString(),
          status: alert.LineStatusID || 1,
          description: lineName
        });
      }
    });
    
    return schedules;
  }

  // Parse GTFS Realtime trip updates
  function parseGTFSTrips(trips) {
    const schedules = [];
    
    if (!trips || trips.length === 0) return schedules;
    
    trips.forEach((trip, index) => {
      // Get route and trip info
      const tripId = trip.tripId || `TRIP_${index}`;
      const routeId = trip.routeId || 'Unknown';
      const delay = trip.delay || 0;
      const vehicleId = trip.vehicleId || 'N/A';
      const vehicleLabel = trip.vehicleLabel || null;
      
      // Determine status based on delay
      let status = 1; // On time
      if (delay !== 0 && delay !== null) {
        status = Math.abs(delay) > 300 ? 3 : 2; // > 5 min = major delay
      }
      
      // Process stop time updates
      if (trip.stopTimeUpdates && Array.isArray(trip.stopTimeUpdates)) {
        trip.stopTimeUpdates.forEach((stop, stopIndex) => {
          const arrivalTime = stop.arrival?.time 
            ? new Date(stop.arrival.time * 1000) 
            : null;
          const departureTime = stop.departure?.time 
            ? new Date(stop.departure.time * 1000) 
            : null;
          
          // Determine delay status per stop
          const arrivalDelay = stop.arrival?.delay || 0;
          const departureDelay = stop.departure?.delay || 0;
          const stopDelay = departureDelay || arrivalDelay || delay;
          const stopStatus = stopDelay === 0 ? 1 : (Math.abs(stopDelay) > 300 ? 3 : 2);
          
          schedules.push({
            tripId: tripId,
            routeId: routeId,
            stopSequence: stop.stopSequence,
            stopId: stop.stopId,
            arrivalTime: arrivalTime,
            departureTime: departureTime,
            arrivalDelay: arrivalDelay,
            departureDelay: departureDelay,
            status: stopStatus,
            vehicleId: vehicleId,
            vehicleLabel: vehicleLabel,
            description: `Route ${routeId} - Trip ${tripId} - Stop ${stop.stopSequence}`,
            delayText: stopDelay > 0 ? `+${stopDelay}s` : (stopDelay < 0 ? `${stopDelay}s` : 'On time')
          });
        });
      } else {
        // Fallback if no stops
        schedules.push({
          tripId: tripId,
          routeId: routeId,
          stopSequence: 0,
          stopId: 'N/A',
          arrivalTime: null,
          departureTime: null,
          arrivalDelay: 0,
          departureDelay: delay,
          status: status,
          vehicleId: vehicleId,
          vehicleLabel: vehicleLabel,
          description: `Route ${routeId} - Trip ${tripId}`,
          delayText: delay > 0 ? `+${delay}s` : (delay < 0 ? `${delay}s` : 'On time')
        });
      }
    });
    
    return schedules;
  }

  // Load train schedules from API
  async function loadTrainSchedules() {
    try {
      loadingSpinner.style.display = 'block';
      schedulesList.style.display = 'none';
      noResults.style.display = 'none';

      // Fetch train GTFS Realtime data (parsed)
      const response = await fetch(`${API_SERVER}/train-schedules`);
      if (!response.ok) {
        throw new Error(`Failed to fetch train schedules (${response.status})`);
      }

      const data = await response.json();
      
      // Check if parsing was successful
      if (data.success === false && data.note) {
        // Library not installed - show info message
        loadingSpinner.innerHTML = `
          <div style="padding: 2em; text-align: center;">
            <p><i class="fa-regular fa-info-circle"></i></p>
            <p><strong>${data.note}</strong></p>
            <p style="font-size: 0.9em; color: var(--text-secondary, #666);">
              The server has access to live train trip data, but needs an additional library to parse it.
            </p>
            <p style="font-size: 0.85em; margin-top: 1em; font-family: monospace; color: var(--text-secondary, #666);">
              Data size: ${(data.dataSize / 1024).toFixed(2)} KB
            </p>
          </div>
        `;
        return;
      }

      // Check if we got parsed trip data
      if (data.tripUpdates && Array.isArray(data.tripUpdates)) {
        // Full GTFS Realtime data is available
        allSchedules = parseGTFSTrips(data.tripUpdates);
        // LTA only emits entities for delays/cancellations — empty means everything is on schedule
        allTrainsOnSchedule = data.tripUpdates.length === 0;
        
        console.log(`Loaded ${allSchedules.length} train schedules from ${data.tripUpdates.length} trip updates`);
        console.log(`Data version: ${data.dataVersion}, Incrementality: ${data.incrementality}`);
        
        if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
          console.log(`${data.alerts.length} service alerts available`);
          // You could display alerts here if desired
        }
      } else if (data.error) {
        throw new Error(data.details || data.error);
      } else {
        console.warn('Unexpected response format:', data);
        allSchedules = [];
        allTrainsOnSchedule = false;
      }
      
      // Cache the data
      localStorage.setItem(TRAIN_SCHEDULES_CACHE_KEY, Date.now().toString());
      localStorage.setItem(TRAIN_SCHEDULES_DATA_KEY, JSON.stringify(allSchedules));

      filteredSchedules = [...allSchedules];
      displaySchedules();
      updateLastUpdateDisplay();
    } catch (error) {
      console.error('Error loading train schedules:', error);
      const errorMsg = error.message || 'Unknown error. Please try again.';
      const errorDisplay = errorMsg.includes('401') || errorMsg.includes('Authentication') 
        ? 'API authentication failed. Please contact the site administrator.'
        : errorMsg;
      
      loadingSpinner.innerHTML = `
        <p style="color: var(--error-color, #dc3545);">
          <i class="fa-regular fa-exclamation-circle"></i> 
          Error loading train schedules
        </p>
        <p style="font-size: 0.85em; color: var(--text-secondary, #666); margin-top: 0.5em;">
          ${errorDisplay}
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

      const searchActive = trainSearch && trainSearch.value.trim().length > 0;
      noResults.innerHTML = (allTrainsOnSchedule && !searchActive)
        ? `
          <p><i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i></p>
          <p><strong>All trains running on schedule</strong></p>
          <p style="font-size: 0.85em; color: var(--text-secondary, #666);">
            LTA only reports trips with delays or cancellations — no irregularities right now.
          </p>
          ${renderHeadwayEstimates()}
        `
        : `<p><i class="fa-regular fa-inbox"></i> No train schedules found</p>`;
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
    
    // Show last update time if available
    if (allSchedules.length > 0 && allSchedules[0].timestamp) {
      const lastUpdate = new Date(allSchedules[0].timestamp * 1000 || Date.now());
      console.log(`Data last updated: ${lastUpdate.toLocaleTimeString('en-SG')}`);
    }
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

    const statusColors = {
      1: '#4CAF50', // On-time - Green
      2: '#FF9800', // Delayed (<5min) - Orange
      3: '#f44336'  // Heavily Delayed (>5min) - Red
    };

    const statusText = {
      1: 'On Time',
      2: 'Minor Delay',
      3: 'Major Delay'
    };

    const statusColor = statusColors[schedule.status] || '#999999';
    const statusLabel = statusText[schedule.status] || 'Unknown';

    // Format times if available
    const arrivalStr = schedule.arrivalTime 
      ? schedule.arrivalTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
      : 'N/A';
    
    const departureStr = schedule.departureTime 
      ? schedule.departureTime.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
      : 'N/A';

    const delayText = schedule.delayText || 'N/A';
    const vehicleInfo = schedule.vehicleLabel 
      ? `${schedule.vehicleLabel}` 
      : (schedule.vehicleId !== 'N/A' ? `Vehicle ${schedule.vehicleId}` : 'Vehicle info unavailable');

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-weight: bold; font-size: 1.1em; color: ${statusColor};">
              <i class="fa-solid fa-train"></i> Route ${schedule.routeId}
            </span>
            <span style="font-size: 0.75em; background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px;">
              ${statusLabel}
            </span>
          </div>
          <div style="font-size: 0.85em; color: var(--text-secondary, #666666); margin-bottom: 4px; font-family: monospace;">
            Trip: ${schedule.tripId}
          </div>
          <div style="font-size: 0.8em; color: var(--text-secondary, #999999); margin-bottom: 8px;">
            🚉 Stop #${schedule.stopSequence} (${schedule.stopId})
          </div>
          <div style="font-size: 0.8em; color: var(--text-secondary, #999999); margin-bottom: 8px;">
            🚆 ${vehicleInfo}
          </div>
          <div style="display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap;">
            <div>
              <div style="font-size: 0.8em; color: var(--text-secondary, #999999);">Arrival</div>
              <div style="font-weight: bold; font-size: 1em;">${arrivalStr}</div>
            </div>
            <div>
              <div style="font-size: 0.8em; color: var(--text-secondary, #999999);">Departure</div>
              <div style="font-weight: bold; font-size: 1em;">${departureStr}</div>
            </div>
            <div>
              <div style="font-size: 0.8em; color: var(--text-secondary, #999999);">Delay</div>
              <div style="font-weight: bold; font-size: 1em; color: ${statusColor};">${delayText}</div>
            </div>
          </div>
        </div>
        <div style="padding-left: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: ${statusColor}20; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-train" style="font-size: 1.5em; color: ${statusColor};"></i>
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

  // Search functionality
  function filterSchedules(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      filteredSchedules = [...allSchedules];
    } else {
      filteredSchedules = allSchedules.filter(schedule => {
        const tripId = (schedule.tripId || '').toLowerCase();
        const routeId = (schedule.routeId || '').toLowerCase();
        const stopId = (schedule.stopId || '').toLowerCase();
        const description = (schedule.description || '').toLowerCase();
        
        return tripId.includes(term) || routeId.includes(term) || 
               stopId.includes(term) || description.includes(term);
      });
    }
    
    displaySchedules();
  }

  // Real-time ETA updater - updates "Arriving in" every second
  function updateETALabels() {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    
    // Find all ETA label spans (they contain "Arriving in:")
    document.querySelectorAll('span').forEach(span => {
      const text = span.textContent;
      if (text && text.startsWith('Arriving in:')) {
        // Extract the time from the previous sibling (the time card div)
        // We need to find the first time card in the parent
        const parent = span.closest('[style*="border"]');
        if (parent) {
          const timeCards = parent.querySelectorAll('[style*="background: #f0f0f0"]');
          if (timeCards.length > 0) {
            const firstTimeStr = timeCards[0].textContent.trim();
            const [trainHour, trainMinute] = firstTimeStr.split(':').map(Number);
            const trainTotalMin = trainHour * 60 + trainMinute;
            let minutesUntil = trainTotalMin - nowMin;
            
            // Handle midnight wraparound
            if (minutesUntil < 0) {
              minutesUntil += 24 * 60;
            }
            
            const roundedMinutes = Math.round(minutesUntil);
            const minLabel = roundedMinutes === 1 ? 'min' : 'mins';
            span.textContent = `Arriving in: ${roundedMinutes} ${minLabel}`;
          }
        }
      }
    });
  }

  // Polling functions
  function startPolling() {
    if (isPolling) return; // Already polling
    
    isPolling = true;
    updateRefreshButtonState();
    console.log(`[Polling] Started with interval: ${pollingInterval}ms`);
    
    // Poll immediately, then set up interval
    loadTrainSchedules();
    pollingTimer = setInterval(loadTrainSchedules, pollingInterval);
    
    // Start ETA updater (updates every second)
    if (!etaUpdateTimer) {
      updateETALabels(); // Update immediately
      etaUpdateTimer = setInterval(updateETALabels, 1000);
    }
  }

  function stopPolling() {
    if (!isPolling) return; // Not polling
    
    isPolling = false;
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
    
    // Stop ETA updater
    if (etaUpdateTimer) {
      clearInterval(etaUpdateTimer);
      etaUpdateTimer = null;
    }
    updateRefreshButtonState();
    console.log('[Polling] Stopped');
  }

  function setPollingInterval(intervalMs) {
    pollingInterval = intervalMs;
    console.log(`[Polling] Interval set to ${intervalMs}ms`);
    
    // Restart polling with new interval if currently active
    if (isPolling) {
      stopPolling();
      startPolling();
    }
  }

  function updateRefreshButtonState() {
    if (refreshBtn) {
      if (isPolling) {
        refreshBtn.classList.add('polling');
        refreshBtn.setAttribute('aria-label', `Stop polling (${pollingInterval / 1000}s)`);
        refreshBtn.title = `Auto-refresh every ${pollingInterval / 1000}s\n\nClick to stop`;
      } else {
        refreshBtn.classList.remove('polling');
        refreshBtn.setAttribute('aria-label', 'Refresh now');
        refreshBtn.title = 'Click to refresh or start auto-polling';
      }
    }
  }

  function updateLastUpdateDisplay() {
    lastUpdateTime = new Date();
    const timeStr = lastUpdateTime.toLocaleTimeString('en-SG', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
    
    // Update any last update time display if it exists
    const lastUpdateElement = document.getElementById('lastUpdateTime');
    if (lastUpdateElement) {
      lastUpdateElement.textContent = `Last update: ${timeStr}`;
    }
    
    console.log(`[Data] Updated at ${timeStr}`);
  }

  // Event listeners
  if (trainSearch) {
    trainSearch.addEventListener('input', (e) => {
      filterSchedules(e.target.value);
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      trainSearch.value = '';
      filterSchedules('');
      trainSearch.focus();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (isPolling) {
        stopPolling();
      } else {
        // Single refresh on first click, then start polling on second
        loadTrainSchedules();
        
        // Optional: Double-click to start auto-polling
        // Can implement double-click detection if desired
      }
    });
  }

  // Polling interval selector
  const pollingSelect = document.getElementById('pollingSelect');
  if (pollingSelect) {
    pollingSelect.addEventListener('change', (e) => {
      const intervalMs = parseInt(e.target.value);
      
      if (intervalMs === 0) {
        // Stop polling
        stopPolling();
      } else {
        // Set new interval and start polling
        setPollingInterval(intervalMs);
        if (!isPolling) {
          startPolling();
        }
      }
    });
  }

  // Keyboard shortcut: Ctrl+R or Cmd+R to toggle polling
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      if (isPolling) {
        stopPolling();
      } else {
        startPolling();
      }
    }
  });

  // Station view event listeners
  if (stationDropdown) {
    stationDropdown.addEventListener('change', (e) => {
      const value = e.target.value;
      if (!value) {
        hideStationPanel();
        return;
      }
      selectedStation = stationIndex.find(s => s.value === value);
      if (selectedStation) {
        renderStationPanel(selectedStation);
        showStationPanel();
      }
    });
  }

  if (stationSearch) {
    stationSearch.addEventListener('input', (e) => filterStations(e.target.value));
  }

  if (clearStationSearch) {
    clearStationSearch.addEventListener('click', () => {
      stationSearch.value = '';
      filterStations('');
      stationSearch.focus();
    });
  }

  if (backToAllBtn) {
    backToAllBtn.addEventListener('click', hideStationPanel);
  }

  // Initial load
  loadStationData();
  loadHeadwayData().then(() => {
    // Re-render if the schedules already loaded before headway data arrived
    if (allTrainsOnSchedule) displaySchedules();
  });
  loadTrainSchedules();
  updateRefreshButtonState();

  // Load and apply saved auto-refresh preference
  const savedInterval = localStorage.getItem('trainSchedulesAutoRefresh');
  if (savedInterval) {
    const intervalMs = parseInt(savedInterval);
    if (intervalMs > 0) {
      setPollingInterval(intervalMs);
      startPolling();
    }
  } else {
    // Default to 30 seconds
    setPollingInterval(30000);
    startPolling();
  }
});
