/**
 * Buszy Notification Manager
 * Polls bus arrival timings and service alerts, then fires SW notifications.
 *
 * Public API  (window.BuszyNotifications):
 *   init()                                         — start if permission already granted
 *   requestPermission()  → Promise<string>         — prompt the user; returns 'granted'|'denied'|'unsupported'
 *   getPermissionStatus() → string
 *   startPolling()                                 — begin background polling
 *   stopPolling()                                  — cancel polling
 *   addMonitoredService({stopCode, serviceNo, thresholdMins, label}) → services[]
 *   removeMonitoredService(stopCode, serviceNo) → services[]
 *   getMonitoredServices() → services[]
 *   setAlertsEnabled(bool)
 *   isAlertsEnabled() → bool
 *   checkBusTimings()   — run one timing check immediately
 *   checkAlerts()       — run one alert check immediately
 */
(function () {
  'use strict';

  const ARRIVALS_API       = 'https://bat-lta-9eb7bbf231a2.herokuapp.com/bus-arrivals';
  const ALERTS_API         = 'https://bat-lta-9eb7bbf231a2.herokuapp.com/train-service-alerts';

  // localStorage keys
  const LS_MONITORED       = 'notif_monitoredServices'; // JSON array
  const LS_NOTIFIED        = 'notif_notifiedServices';  // JSON object {key: timestamp}
  const LS_ALERTS_ENABLED  = 'notif_alertsEnabled';    // 'true' | 'false'
  const LS_ALERT_HASH      = 'notif_lastAlertHash';    // fingerprint of last seen alert body

  const NOTIF_COOLDOWN_MS  = 5 * 60 * 1000;  // 5 min between repeat notifications for same service
  const TIMING_POLL_MS     = 30 * 1000;       // check timings every 30 s
  const ALERTS_POLL_MS     = 5 * 60 * 1000;  // check alerts every 5 min

  let _timingInterval = null;
  let _alertsInterval = null;

  // ── Helpers ─────────────────────────────────────────────────────────────

  function getBasePath() {
    if (window.PWAConfig && window.PWAConfig.basePath) return window.PWAConfig.basePath;
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[1] === 'buszy') return '/' + parts[0] + '/';
    return '/';
  }

  function getMonitoredServices() {
    try { return JSON.parse(localStorage.getItem(LS_MONITORED) || '[]'); }
    catch { return []; }
  }

  function saveMonitoredServices(services) {
    localStorage.setItem(LS_MONITORED, JSON.stringify(services));
  }

  function getNotified() {
    try { return JSON.parse(localStorage.getItem(LS_NOTIFIED) || '{}'); }
    catch { return {}; }
  }

  function saveNotified(obj) {
    localStorage.setItem(LS_NOTIFIED, JSON.stringify(obj));
  }

  function isAlertsEnabled() {
    return localStorage.getItem(LS_ALERTS_ENABLED) !== 'false';
  }

  function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h.toString();
  }

  function minutesUntil(isoString) {
    if (!isoString) return null;
    const diff = new Date(isoString) - Date.now();
    return Math.round(diff / 60000);
  }

  // ── Service Worker messaging ─────────────────────────────────────────────

  async function sendNotification({ title, body, tag, url, requireInteraction }) {
    if (!('serviceWorker' in navigator)) return;
    let reg;
    try { reg = await navigator.serviceWorker.ready; } catch { return; }
    if (reg && reg.active) {
      reg.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, body, tag, url, requireInteraction: requireInteraction || false }
      });
    }
  }

  // ── Permission ───────────────────────────────────────────────────────────

  async function requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    const result = await Notification.requestPermission();
    if (result === 'granted') startPolling();
    return result;
  }

  function getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  // ── Bus Timing Check ─────────────────────────────────────────────────────

  async function checkBusTimings() {
    if (getPermissionStatus() !== 'granted') return;
    const services = getMonitoredServices();
    if (!services.length) return;

    // Group by stop code to reduce API calls
    const byStop = {};
    services.forEach(svc => {
      (byStop[svc.stopCode] = byStop[svc.stopCode] || []).push(svc);
    });

    const notified = getNotified();
    const now = Date.now();

    for (const [stopCode, svcs] of Object.entries(byStop)) {
      try {
        const apiUrl = new URL(ARRIVALS_API);
        apiUrl.searchParams.set('BusStopCode', stopCode);
        const res = await fetch(apiUrl.toString());
        if (!res.ok) continue;
        const data = await res.json();
        const apiServices = data.Services || [];

        for (const svc of svcs) {
          const apiSvc = apiServices.find(s => s.ServiceNo === svc.serviceNo);
          if (!apiSvc) continue;

          const key = `${stopCode}_${svc.serviceNo}`;
          if (now - (notified[key] || 0) < NOTIF_COOLDOWN_MS) continue;

          const threshold = Number(svc.thresholdMins) || 1;
          const buses = [apiSvc.NextBus, apiSvc.NextBus2, apiSvc.NextBus3].filter(Boolean);

          for (const bus of buses) {
            const mins = minutesUntil(bus.EstimatedArrival);
            if (mins !== null && mins >= 0 && mins <= threshold) {
              const minsText = mins === 0 ? 'Arriving now' : `${mins} min${mins !== 1 ? 's' : ''} away`;
              const basePath = getBasePath();
              const dest = window.location.origin + basePath + `buszy/art.html?BusStopCode=${encodeURIComponent(stopCode)}`;

              await sendNotification({
                title: `Bus ${svc.serviceNo} arriving soon`,
                body: `${minsText}${svc.label ? ` · ${svc.label}` : ` · Stop ${stopCode}`}`,
                tag: `buszy-timing-${key}`,
                url: dest
              });

              notified[key] = now;
              saveNotified(notified);
              break; // one notification per service per check
            }
          }
        }
      } catch (e) {
        console.warn('[BuszyNotif] Timing check error for stop', stopCode, e);
      }
    }
  }

  // ── Alert Check ──────────────────────────────────────────────────────────

  async function checkAlerts() {
    if (!isAlertsEnabled()) return;
    if (getPermissionStatus() !== 'granted') return;

    try {
      const res = await fetch(ALERTS_API);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.value) return;

      const all = Array.isArray(data.value) ? data.value : [data.value];
      const busAlerts = [];

      all.forEach(alert => {
        if (!alert.Message || !Array.isArray(alert.Message)) return;
        alert.Message.forEach(msgObj => {
          const msg = (msgObj.Content || '').toLowerCase();
          if (msg.includes('bus service') &&
              (msg.includes('affected') || msg.includes('diverted') || msg.includes('delayed'))) {
            busAlerts.push(msgObj.Content);
          }
        });
      });

      if (!busAlerts.length) return;

      const hash = simpleHash(busAlerts.join('|'));
      if (hash === localStorage.getItem(LS_ALERT_HASH)) return; // same content, skip
      localStorage.setItem(LS_ALERT_HASH, hash);

      const basePath = getBasePath();
      const alertUrl = window.location.origin + basePath + 'buszy/alerts.html';
      const body = busAlerts.length === 1
        ? busAlerts[0].substring(0, 120)
        : `${busAlerts.length} bus service alerts are active`;

      await sendNotification({
        title: 'Bus Service Alert',
        body,
        tag: 'buszy-alert',
        url: alertUrl,
        requireInteraction: true
      });
    } catch (e) {
      console.warn('[BuszyNotif] Alert check error:', e);
    }
  }

  // ── Polling control ──────────────────────────────────────────────────────

  function startPolling() {
    stopPolling();
    // Immediate first-pass checks
    checkBusTimings();
    checkAlerts();
    _timingInterval = setInterval(checkBusTimings, TIMING_POLL_MS);
    _alertsInterval = setInterval(checkAlerts, ALERTS_POLL_MS);
    console.log('[BuszyNotif] Polling started');
  }

  function stopPolling() {
    if (_timingInterval) { clearInterval(_timingInterval); _timingInterval = null; }
    if (_alertsInterval) { clearInterval(_alertsInterval); _alertsInterval = null; }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  function init() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    if (Notification.permission === 'granted') startPolling();
  }

  function addMonitoredService({ stopCode, serviceNo, thresholdMins = 1, label = '' }) {
    if (!stopCode || !serviceNo) return getMonitoredServices();
    const services = getMonitoredServices();
    const exists = services.some(s => s.stopCode === stopCode && s.serviceNo === serviceNo);
    if (!exists) {
      services.push({ stopCode: String(stopCode), serviceNo: String(serviceNo), thresholdMins: Number(thresholdMins), label: String(label) });
      saveMonitoredServices(services);
    }
    return services;
  }

  function removeMonitoredService(stopCode, serviceNo) {
    const services = getMonitoredServices().filter(
      s => !(s.stopCode === String(stopCode) && s.serviceNo === String(serviceNo))
    );
    saveMonitoredServices(services);
    // Clear cooldown entry so next add works fresh
    const notified = getNotified();
    delete notified[`${stopCode}_${serviceNo}`];
    saveNotified(notified);
    return services;
  }

  function setAlertsEnabled(enabled) {
    localStorage.setItem(LS_ALERTS_ENABLED, enabled ? 'true' : 'false');
  }

  window.BuszyNotifications = {
    init,
    requestPermission,
    getPermissionStatus,
    startPolling,
    stopPolling,
    addMonitoredService,
    removeMonitoredService,
    getMonitoredServices,
    setAlertsEnabled,
    isAlertsEnabled,
    checkBusTimings,
    checkAlerts
  };

  // Auto-init when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
