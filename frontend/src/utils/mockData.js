/**
 * OPMAS-001 | Mock Data
 * Realistic fake data so DEV-04 can build the entire dashboard
 * before the PLC is connected or the API is live.
 *
 * When MOCK_MODE=false in api.js, these are never called.
 */

export const mockLatest = () => ({
  timestamp: new Date().toISOString(),
  collector_alive: true,
  readings: [
    { key: 'O2_PURITY',    label: 'Oxygen Purity',    value: 93.4, unit: '%',     status: 'normal' },
    { key: 'PRESSURE',     label: 'System Pressure',  value: 4.8,  unit: 'bar',   status: 'normal' },
    { key: 'FLOW_RATE',    label: 'Flow Rate',         value: 12.5, unit: 'L/min', status: 'normal' },
    { key: 'TEMPERATURE',  label: 'Temperature',       value: 26.3, unit: '°C',    status: 'normal' },
    { key: 'TANK_LEVEL',   label: 'Tank Level',        value: 78.0, unit: '%',     status: 'normal' },
    { key: 'COMPRESSOR',   label: 'Compressor',        value: 1,    unit: null,    status: 'running' },
    { key: 'BED_A_STATUS', label: 'Bed A',             value: 1,    unit: null,    status: 'active' },
    { key: 'BED_B_STATUS', label: 'Bed B',             value: 0,    unit: null,    status: 'idle' },
    { key: 'BED_A_HOURS',  label: 'Bed A Hours',       value: 121.5,unit: 'hrs',   status: 'normal' },
    { key: 'BED_B_HOURS',  label: 'Bed B Hours',       value: 119.2,unit: 'hrs',   status: 'normal' },
  ],
});

export const mockHistory = (register) => {
  const now = Date.now();
  const baseValues = {
    O2_PURITY:  93.0,
    PRESSURE:   4.5,
    FLOW_RATE:  12.0,
    TANK_LEVEL: 70.0,
  };
  const base = baseValues[register] || 50;
  const data = Array.from({ length: 288 }, (_, i) => ({
    ts: new Date(now - (287 - i) * 5 * 60 * 1000).toISOString(),
    value: parseFloat((base + (Math.random() - 0.5) * 4).toFixed(2)),
  }));

  // Inject a purity dip for demo
  if (register === 'O2_PURITY') {
    for (let i = 50; i < 56; i++) data[i].value = parseFloat((87 + Math.random() * 2).toFixed(2));
  }

  return { register, unit: '%', data };
};

export const mockAlarms = () => ({
  alarms: [
    {
      id: 1,
      type: 'LOW_PURITY',
      severity: 'WARNING',
      message: 'O2 purity below warning level: 89.2% (threshold: 90%)',
      triggered_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      resolved_at: null,
    },
    {
      id: 2,
      type: 'LOW_PURITY',
      severity: 'WARNING',
      message: 'O2 purity below warning level: 87.5% — resolved automatically',
      triggered_at: new Date(Date.now() - 4.2 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ],
});
