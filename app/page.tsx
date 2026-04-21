'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Droplets, Power, Zap, Activity, Waves, Settings, TrendingUp, X, AlertTriangle, CheckCircle2, BarChart3, Cpu, Radio, Leaf, Wind } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const sendPumpCommand = async (action: string) => {
  const response = await fetch("https://smarthublite.vercel.app/api/device/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device_id: "garden_pump_01",
      command: { action: action }
    })
  });
  return response.json();
};

const MOISTURE_THRESHOLD = 3500;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [commandStatus, setCommandStatus] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const prevMoistureRef = useRef<number>(0);

  const { data: status } = useSWR(
    'https://smarthublite.vercel.app/api/device/status?device_id=garden_pump_01',
    fetcher, { refreshInterval: 5000 }
  );
  const { data: history } = useSWR(
    'https://smarthublite.vercel.app/api/device/history?device_id=garden_pump_01',
    fetcher, { refreshInterval: 10000 }
  );

  const handleCommand = async (action: string) => {
    setCommandStatus('Sending…');
    try {
      await sendPumpCommand(action);
      setCommandStatus('Command dispatched');
      setTimeout(() => setCommandStatus(''), 3000);
    } catch {
      setCommandStatus('Failed');
      setTimeout(() => setCommandStatus(''), 3000);
    }
  };

  const moisture    = status?.data?.moisture   || 0;
  const pumpState   = status?.data?.pump_state  || 'OFF';
  const mode        = status?.data?.mode        || 'AUTOMATIC';
  const condition   = status?.data?.condition   || 'WET';
  const moisturePct = Math.min((moisture / 4095) * 100, 100);

  useEffect(() => {
    const prev = prevMoistureRef.current;
    if (moisture > MOISTURE_THRESHOLD && prev <= MOISTURE_THRESHOLD && !alertDismissed) setAlertVisible(true);
    if (moisture <= MOISTURE_THRESHOLD) { setAlertDismissed(false); setAlertVisible(false); }
    prevMoistureRef.current = moisture;
  }, [moisture, alertDismissed]);

  const allHistory: any[]  = history || [];
  const filteredHistory    = allHistory.filter((e: any) => {
    if (e.data.status === 'command_executed') return true;
    return (modeFilter === 'all' || e.data.mode === modeFilter) &&
           (stateFilter === 'all' || e.data.pump_state === stateFilter);
  });
  const sensorEntries  = allHistory.filter((e: any) => e.data.status !== 'command_executed');
  const commandEntries = allHistory.filter((e: any) => e.data.status === 'command_executed');
  const dryCount       = sensorEntries.filter((e: any) => e.data.condition === 'DRY').length;
  const avgMoisture    = sensorEntries.length
    ? Math.round(sensorEntries.reduce((s: number, e: any) => s + (e.data.moisture || 0), 0) / sensorEntries.length)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --mint:        #81E7AF;
          --mint-mid:    #5DD99A;
          --mint-deep:   #2EC47A;
          --mint-pale:   rgba(129,231,175,0.12);
          --mint-soft:   rgba(129,231,175,0.22);
          --mint-glow:   rgba(129,231,175,0.35);

          --sky:         #AEDEFC;
          --sky-mid:     #7DC8F8;
          --sky-deep:    #3BAEF0;
          --sky-pale:    rgba(174,222,252,0.14);
          --sky-soft:    rgba(174,222,252,0.25);

          --lavender:    #C4B5FD;
          --lav-pale:    rgba(196,181,253,0.12);
          --peach:       #FDB896;
          --peach-pale:  rgba(253,184,150,0.12);

          --rose:        #FF6B8A;
          --rose-pale:   rgba(255,107,138,0.10);
          --rose-mid:    rgba(255,107,138,0.22);

          --amber:       #FBBF24;
          --amber-pale:  rgba(251,191,36,0.10);

          --surface:     rgba(255,255,255,0.80);
          --surface-hov: rgba(255,255,255,0.96);
          --border:      rgba(129,231,175,0.25);
          --border2:     rgba(174,222,252,0.30);
          --border-mix:  rgba(155,215,220,0.28);

          --t0:  #071A0E;
          --t1:  #132E20;
          --t2:  #2C5A3E;
          --t3:  #4E7D64;
          --t4:  #6E9880;

          --ff: 'Inter', sans-serif;
          --fm: 'JetBrains Mono', monospace;
          --r-sm: 10px;
          --r-md: 14px;
          --r-lg: 20px;
          --r-xl: 26px;
        }

        body {
          background: #EDF8F3;
          color: var(--t1);
          font-family: var(--ff);
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: rgba(129,231,175,.06); }
        ::-webkit-scrollbar-thumb { background: rgba(129,231,175,.30); border-radius: 4px; }

        .page-bg {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 90% 55% at 5%  -5%,  rgba(129,231,175,.32) 0%, transparent 58%),
            radial-gradient(ellipse 70% 50% at 95%  5%,  rgba(174,222,252,.35) 0%, transparent 58%),
            radial-gradient(ellipse 55% 60% at 50% 105%, rgba(196,181,253,.18) 0%, transparent 58%),
            radial-gradient(ellipse 45% 38% at 0%  90%,  rgba(253,184,150,.16) 0%, transparent 55%),
            linear-gradient(155deg, #E8F8F0 0%, #E5F3FC 45%, #EEE9FF 100%);
          position: relative;
        }

        .orb {
          position: fixed; border-radius: 50%;
          pointer-events: none; z-index: 0;
          filter: blur(90px);
        }

        /* ── CARD base ── */
        .card {
          background: var(--surface);
          border: 2px solid var(--border-mix);
          border-radius: var(--r-xl);
          position: relative; overflow: hidden;
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          transition:
            border-color .30s ease,
            transform    .35s cubic-bezier(.34,1.30,.64,1),
            box-shadow   .30s ease,
            background   .25s ease;
          box-shadow:
            0 1px 0 rgba(255,255,255,.90) inset,
            0 4px 22px rgba(129,231,175,.07),
            0 1px 6px rgba(0,0,0,.04);
          cursor: pointer;
        }
        /* top shimmer line */
        .card::after {
          content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.95) 50%, transparent);
          pointer-events: none;
        }
        /* no sweep — ::before reserved for top shimmer only */
        .card::before { display: none; }

        /* ─── MOISTURE card hover ─── */
        .card-moisture { border-color: rgba(129,231,175,.28); }
        .card-moisture:hover {
          background: var(--surface-hov);
          border-color: rgba(46,196,122,.75);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 3px rgba(46,196,122,.10),
            0 10px 28px rgba(46,196,122,.12),
            0 4px 12px rgba(0,0,0,.05);
        }

        /* ─── MOISTURE DRY card hover ─── */
        .card-moisture-dry {
          border-color: rgba(255,107,138,.36);
          box-shadow: 0 0 0 3px rgba(255,107,138,.06);
          animation: dangerPulse 2.4s ease-in-out infinite;
        }
        .card-moisture-dry:hover {
          background: var(--surface-hov);
          border-color: rgba(255,107,138,.80);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 3px rgba(255,107,138,.12),
            0 10px 28px rgba(255,107,138,.12),
            0 4px 12px rgba(0,0,0,.05);
        }

        /* ─── PUMP OFF card hover ─── */
        .card-pump { border-color: rgba(174,222,252,.28); }
        .card-pump:hover {
          background: var(--surface-hov);
          border-color: rgba(59,174,240,.75);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 3px rgba(59,174,240,.10),
            0 10px 28px rgba(59,174,240,.12),
            0 4px 12px rgba(0,0,0,.05);
        }

        /* ─── PUMP ON card hover ─── */
        .card-pump-on {
          border-color: rgba(46,196,122,.55);
          box-shadow:
            0 1px 0 rgba(255,255,255,.90) inset,
            0 0 0 3px rgba(129,231,175,.10),
            0 8px 28px rgba(129,231,175,.12);
        }
        .card-pump-on:hover {
          background: var(--surface-hov);
          border-color: rgba(46,196,122,.80);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 3px rgba(46,196,122,.14),
            0 10px 28px rgba(46,196,122,.14),
            0 4px 12px rgba(0,0,0,.05);
        }

        /* ─── MODE AUTO card hover ─── */
        .card-mode { border-color: rgba(174,222,252,.28); }
        .card-mode:hover {
          background: var(--surface-hov);
          border-color: rgba(59,174,240,.75);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 3px rgba(59,174,240,.10),
            0 10px 28px rgba(59,174,240,.12),
            0 4px 12px rgba(0,0,0,.05);
        }

        /* ─── MODE MANUAL card hover ─── */
        .card-mode-manual { border-color: rgba(251,191,36,.28); }
        .card-mode-manual:hover {
          background: var(--surface-hov);
          border-color: rgba(251,191,36,.80);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 3px rgba(251,191,36,.12),
            0 10px 28px rgba(251,191,36,.12),
            0 4px 12px rgba(0,0,0,.05);
        }

        /* Transition helpers on child elements — no colour/scale change on hover */
        .card .lbl { transition: color .25s; }
        .card .ib  { transition: transform .25s ease; }

        /* card-danger pulsing border (no hover override needed here) */
        .card-danger { border-color: rgba(255,107,138,.36); }
        @keyframes dangerPulse {
          0%,100% { box-shadow: 0 0 0 4px rgba(255,107,138,.06), 0 4px 22px rgba(129,231,175,.07); }
          50%      { box-shadow: 0 0 0 6px rgba(255,107,138,.16), 0 0 32px rgba(255,107,138,.14); }
        }

        .lbl { font-family: var(--fm); font-size: 10px; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--t2); margin-bottom: 10px; }

        .val { font-family: var(--fm); font-size: 48px; font-weight: 700; letter-spacing: -.04em; line-height: 1; color: var(--t0); }

        .bdg {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 16px; border-radius: 50px;
          font-family: var(--fm); font-size: 12px; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
        }

        .ib { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .ib-mint   { background: linear-gradient(135deg,rgba(46,196,122,.20),rgba(59,174,240,.14)); border: 2px solid rgba(46,196,122,.36); }
        .ib-sky    { background: linear-gradient(135deg,rgba(59,174,240,.20),rgba(196,181,253,.14)); border: 2px solid rgba(59,174,240,.38); }
        .ib-rose   { background: linear-gradient(135deg,rgba(255,107,138,.16),rgba(253,184,150,.12)); border: 2px solid rgba(255,107,138,.30); }
        .ib-amber  { background: linear-gradient(135deg,rgba(251,191,36,.18),rgba(253,184,150,.14)); border: 2px solid rgba(251,191,36,.34); }
        .ib-lav    { background: linear-gradient(135deg,rgba(196,181,253,.20),rgba(59,174,240,.12));  border: 2px solid rgba(196,181,253,.36); }

        /* ── TABS ── */
        .tab-wrap {
          display: flex; gap: 4px;
          background: rgba(255,255,255,.68); border: 1.5px solid var(--border-mix);
          border-radius: var(--r-lg); padding: 5px; width: fit-content; margin-bottom: 28px;
          backdrop-filter: blur(18px);
          box-shadow: 0 2px 12px rgba(129,231,175,.09);
        }
        .tab {
          display: flex; align-items: center; gap: 8px; padding: 10px 26px; border-radius: 14px;
          font-size: 13.5px; font-weight: 600; letter-spacing: .01em; font-family: var(--ff);
          cursor: pointer; border: none; transition: all .22s; white-space: nowrap;
        }
        .tab-on  { background: linear-gradient(135deg, var(--mint-deep) 0%, var(--sky-deep) 100%); color: #fff; box-shadow: 0 4px 20px rgba(46,196,122,.36); }
        .tab-off { background: transparent; color: var(--t2); }
        .tab-off:hover { color: var(--t0); background: rgba(129,231,175,.11); }

        .bar-wrap { height: 5px; background: rgba(129,231,175,.14); border-radius: 4px; overflow: hidden; margin-top: 14px; }
        .bar-fill  { height: 100%; border-radius: 4px; transition: width 1.4s cubic-bezier(.4,0,.2,1); }

        /* ── TOGGLE ── */
        .tgl { position: relative; width: 130px; height: 58px; border-radius: 29px; cursor: pointer; border: none; outline: none; transition: all .35s cubic-bezier(.4,0,.2,1); }
        .tgl-on  { background: linear-gradient(135deg, var(--mint-deep), var(--sky-deep)); box-shadow: 0 6px 30px rgba(46,196,122,.42), 0 0 0 5px rgba(129,231,175,.18); }
        .tgl-off { background: rgba(174,222,252,.18); border: 1.5px solid var(--border2); }
        .tgl-knob { position: absolute; top: 7px; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all .35s cubic-bezier(.4,0,.2,1); box-shadow: 0 3px 14px rgba(0,0,0,.14); }
        .tgl-knob-on  { left: calc(100% - 51px); background: #fff; }
        .tgl-knob-off { left: 7px; background: rgba(255,255,255,.90); }

        .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; animation: blink 2.2s ease-in-out infinite; }
        .dot-lg { width: 9px; height: 9px; }
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.70)} }

        .chip { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; border-radius: 50px; font-family: var(--fm); font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; }

        .toast { display: flex; align-items: center; gap: 10px; padding: 14px 24px; background: rgba(13,122,66,.10); border: 2px solid rgba(13,122,66,.32); border-radius: var(--r-md); font-size: 13px; font-weight: 700; color: #0d7a42; font-family: var(--fm); animation: fadeUp .25s ease; box-shadow: 0 0 14px rgba(13,122,66,.10); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        /* ── STAT PILL ── */
        .spill {
          flex: 1; min-width: 148px; display: flex; align-items: center; gap: 14px;
          padding: 20px 22px; background: var(--surface); border: 2px solid var(--border-mix);
          border-radius: var(--r-xl); position: relative; overflow: hidden;
          backdrop-filter: blur(18px);
          transition: border-color .25s, transform .30s cubic-bezier(.34,1.30,.64,1), box-shadow .25s, background .25s;
          box-shadow: 0 2px 10px rgba(129,231,175,.05);
        }
        .spill:hover {
          border-color: rgba(46,196,122,.65);
          background: var(--surface-hov);
          transform: translateY(-3px);
          box-shadow:
            0 0 0 3px rgba(46,196,122,.10),
            0 8px 22px rgba(46,196,122,.10);
        }
        .spill::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px; background: linear-gradient(90deg, transparent, rgba(46,196,122,.55) 40%, rgba(59,174,240,.55) 60%, transparent); }
        .spill::after  { content: ''; position: absolute; top: 0; left: 14%; right: 14%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.9) 50%, transparent); }
        .spill-v { font-family: var(--fm); font-size: 22px; font-weight: 600; color: var(--t0); line-height: 1; }
        .spill-l { font-family: var(--fm); font-size: 9.5px; font-weight: 500; letter-spacing: .15em; text-transform: uppercase; color: var(--t3); margin-top: 5px; }

        /* ── TABLE ── */
        .tbl-th { padding: 13px 24px; text-align: left; font-family: var(--fm); font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--t2); border-bottom: 2px solid rgba(129,231,175,.24); background: rgba(225,248,235,.70); white-space: nowrap; }
        .tbl-td {
          padding: 15px 24px; font-size: 13.5px; color: var(--t1); font-weight: 500;
          border-bottom: 1px solid rgba(174,222,252,.18); font-family: var(--ff);
          transition: background .20s ease, color .20s ease, font-weight .20s ease, padding-left .22s ease;
          position: relative;
        }
        .tbl-tr {
          transition: background .18s ease;
          cursor: default;
        }
        .tbl-tr:hover .tbl-td {
          background: rgba(129,231,175,.07);
          color: var(--t0);
        }
        /* Subtle left accent stripe */
        .tbl-tr:hover .tbl-td:first-child { padding-left: 28px; }
        .tbl-tr:hover .tbl-td:first-child::before {
          content: ''; position: absolute; left: 0; top: 20%; bottom: 20%;
          width: 3px; border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg, var(--mint-deep), var(--sky-deep));
          opacity: .60;
        }
        .tbl-tr:last-child .tbl-td { border-bottom: none; }

        /* ── HEADER ── */
        .hdr {
          background: rgba(255,255,255,.76);
          border-bottom: 1.5px solid rgba(174,222,252,.28);
          position: sticky; top: 0; z-index: 20;
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 1px 0 rgba(255,255,255,.82) inset, 0 2px 18px rgba(129,231,175,.08);
        }

        .sel {
          padding: 9px 36px 9px 14px; font-size: 12.5px; font-weight: 500;
          background: rgba(255,255,255,.88); border: 1.5px solid var(--border-mix);
          border-radius: var(--r-md); color: var(--t1); font-family: var(--ff);
          cursor: pointer; outline: none; transition: border-color .2s, box-shadow .2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237AA88C'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; backdrop-filter: blur(8px);
        }
        .sel:focus { border-color: var(--mint-mid); box-shadow: 0 0 0 3px rgba(129,231,175,.18); }
        .sel option { background: #fff; color: var(--t0); }

        /* ── ALERT OVERLAY ── */
        .alert-bg { position: fixed; inset: 0; z-index: 100; background: rgba(8,22,14,.40); backdrop-filter: blur(14px); display: flex; align-items: center; justify-content: center; animation: afade .2s ease; }
        .alert-box { background: rgba(255,255,255,.96); border: 1.5px solid rgba(255,107,138,.28); border-radius: 28px; padding: 44px 48px; max-width: 475px; width: 90%; box-shadow: 0 0 80px rgba(255,107,138,.10), 0 40px 80px rgba(0,0,0,.10); animation: aup .3s cubic-bezier(.34,1.56,.64,1); position: relative; backdrop-filter: blur(20px); }
        @keyframes afade { from{opacity:0} to{opacity:1} }
        @keyframes aup   { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        .alert-close { position: absolute; top: 14px; right: 14px; background: rgba(255,107,138,.07); border: 1.5px solid rgba(255,107,138,.18); color: var(--rose); border-radius: 10px; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
        .alert-close:hover { background: var(--rose-mid); }

        .btn-primary { flex: 1; padding: 14px 24px; border: none; border-radius: var(--r-md); background: linear-gradient(135deg, var(--mint-deep), var(--sky-deep)); color: #fff; font-family: var(--ff); font-size: 14px; font-weight: 700; letter-spacing: .01em; cursor: pointer; box-shadow: 0 6px 22px rgba(46,196,122,.35); transition: all .22s; }
        .btn-primary:hover { box-shadow: 0 8px 32px rgba(46,196,122,.50); transform: translateY(-2px); }
        .btn-ghost { padding: 14px 24px; border-radius: var(--r-md); background: rgba(174,222,252,.14); border: 1.5px solid var(--border2); color: var(--t2); font-family: var(--ff); font-size: 14px; font-weight: 600; cursor: pointer; transition: all .22s; }
        .btn-ghost:hover { color: var(--t0); border-color: var(--mint-mid); background: rgba(129,231,175,.10); }

        .dng-alert-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; background: var(--rose-pale); border: 1.5px solid rgba(255,107,138,.25); border-radius: 9px; cursor: pointer; color: var(--rose); font-size: 10px; font-weight: 700; font-family: var(--fm); letter-spacing: .10em; animation: dangerBtn 2s ease-in-out infinite; transition: all .2s; }
        .dng-alert-btn:hover { background: var(--rose-mid); }
        @keyframes dangerBtn { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 14px rgba(255,107,138,.22)} }

        .readout { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(174,222,252,.14); border: 1.5px solid var(--border2); border-radius: var(--r-sm); }

        .ib-mint   { background: linear-gradient(135deg,rgba(46,196,122,.20),rgba(59,174,240,.14)); border: 2px solid rgba(46,196,122,.36); }
        .ib-sky    { background: linear-gradient(135deg,rgba(59,174,240,.20),rgba(196,181,253,.14)); border: 2px solid rgba(59,174,240,.38); }
        .ib-rose   { background: linear-gradient(135deg,rgba(255,107,138,.16),rgba(253,184,150,.12)); border: 2px solid rgba(255,107,138,.30); }
        .ib-amber  { background: linear-gradient(135deg,rgba(251,191,36,.18),rgba(253,184,150,.14)); border: 2px solid rgba(251,191,36,.34); }
        .ib-lav    { background: linear-gradient(135deg,rgba(196,181,253,.20),rgba(59,174,240,.12));  border: 2px solid rgba(196,181,253,.36); }

        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .reveal { animation: slideUp .42s cubic-bezier(.4,0,.2,1) both; }
        .d1 { animation-delay:.06s } .d2 { animation-delay:.12s } .d3 { animation-delay:.18s } .d4 { animation-delay:.24s }

        /* ── PUMP CONTROL REDESIGN ── */
        .pump-wrap {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 0;
          align-items: stretch;
        }
        /* left column – centred power button */
        .pump-left {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 36px 32px;
          border-right: 1.5px solid rgba(129,231,175,.16);
          position: relative;
        }
        /* circular track ring */
        .pump-ring {
          position: relative;
          width: 148px; height: 148px;
          display: flex; align-items: center; justify-content: center;
        }
        .pump-ring::before {
          content: '';
          position: absolute; inset: 0; border-radius: 50%;
          border: 3px solid rgba(129,231,175,.14);
        }
        .pump-ring-on::before  { border-color: rgba(46,196,122,.22); }
        .pump-ring-off::before { border-color: rgba(174,222,252,.22); }
        /* glow halo behind the button */
        .pump-ring::after {
          content: '';
          position: absolute; inset: 10px; border-radius: 50%;
          opacity: 0; transition: opacity .40s, box-shadow .40s;
        }
        .pump-ring-on::after  { opacity: 1; box-shadow: 0 0 32px rgba(46,196,122,.28), 0 0 64px rgba(46,196,122,.12); }
        .pump-ring-off::after { opacity: 0; }
        /* the big power button */
        .power-btn {
          position: relative; z-index: 1;
          width: 96px; height: 96px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: none; outline: none;
          transition: transform .30s cubic-bezier(.34,1.30,.64,1), box-shadow .30s ease;
        }
        .power-btn-on {
          background: linear-gradient(145deg, #2EC47A, #3BAEF0);
          box-shadow: 0 0 0 6px rgba(46,196,122,.16), 0 6px 28px rgba(46,196,122,.36);
        }
        .power-btn-off {
          background: rgba(255,255,255,.92);
          border: 2px solid rgba(174,222,252,.50);
          box-shadow: 0 4px 20px rgba(0,0,0,.07), 0 0 0 3px rgba(174,222,252,.18);
        }
        .power-btn:hover { transform: scale(1.07); }
        .power-btn-on:hover  { box-shadow: 0 0 0 8px rgba(46,196,122,.20), 0 8px 36px rgba(46,196,122,.45); }
        .power-btn-off:hover { box-shadow: 0 6px 28px rgba(0,0,0,.10), 0 0 0 4px rgba(174,222,252,.30); }
        /* label under ring */
        .pump-state-lbl {
          margin-top: 18px;
          font-family: var(--fm); font-size: 11px; font-weight: 700;
          letter-spacing: .14em; text-transform: uppercase;
          display: flex; align-items: center; gap: 7px;
        }
        /* right column */
        .pump-right {
          padding: 32px 36px;
          display: flex; flex-direction: column; gap: 22px;
        }
        /* stat row inside pump-right */
        .ctrl-stat {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px;
          background: rgba(255,255,255,.60);
          border: 1.5px solid rgba(155,215,220,.22);
          border-radius: 14px;
          transition: border-color .20s, background .20s;
        }
        .ctrl-stat:hover { border-color: rgba(46,196,122,.30); background: rgba(240,255,248,.70); }
        .ctrl-stat-icon {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ctrl-stat-body { flex: 1; }
        .ctrl-stat-lbl  { font-family: var(--fm); font-size: 9.5px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; color: var(--t3); margin-bottom: 3px; }
        .ctrl-stat-val  { font-family: var(--fm); font-size: 15px; font-weight: 700; color: var(--t0); }
        /* moisture mini bar inside ctrl-stat */
        .mini-bar { height: 4px; border-radius: 4px; background: rgba(129,231,175,.14); margin-top: 7px; overflow: hidden; }
        .mini-bar-fill { height: 100%; border-radius: 4px; transition: width 1.4s cubic-bezier(.4,0,.2,1); }
      `}</style>

      <div className="page-bg">
        <div className="orb" style={{ width:620,height:620, background:'radial-gradient(circle,rgba(129,231,175,.22) 0%,transparent 70%)', top:-200, left:-160 }} />
        <div className="orb" style={{ width:500,height:500, background:'radial-gradient(circle,rgba(174,222,252,.24) 0%,transparent 70%)', top:-80, right:-120 }} />
        <div className="orb" style={{ width:420,height:420, background:'radial-gradient(circle,rgba(196,181,253,.16) 0%,transparent 70%)', bottom:0, left:'38%', transform:'translateX(-50%)' }} />

        {/* ── ALERT MODAL ── */}
        {alertVisible && (
          <div className="alert-bg">
            <div className="alert-box">
              <button className="alert-close" onClick={() => { setAlertVisible(false); setAlertDismissed(true); }}><X size={14} /></button>
              <div style={{ display:'flex', gap:18, alignItems:'flex-start', marginBottom:22 }}>
                <div className="ib ib-rose" style={{ width:56,height:56,borderRadius:16,flexShrink:0 }}>
                  <AlertTriangle size={24} color="var(--rose)" />
                </div>
                <div>
                  <div style={{ fontSize:18,fontWeight:700,color:'var(--t0)',marginBottom:8,fontFamily:'var(--ff)',letterSpacing:'-.02em' }}>Moisture Threshold Exceeded</div>
                  <div style={{ fontSize:13,color:'var(--t2)',lineHeight:1.72 }}>
                    Sensor reading&nbsp;<span style={{fontFamily:'var(--fm)',color:'var(--rose)',fontWeight:600}}>{moisture}</span>&nbsp;exceeds the dry threshold of&nbsp;<span style={{fontFamily:'var(--fm)',color:'var(--t1)',fontWeight:600}}>{MOISTURE_THRESHOLD}</span>. Soil requires irrigation.
                  </div>
                </div>
              </div>
              <div style={{ background:'rgba(255,107,138,.05)',border:'1.5px solid rgba(255,107,138,.14)',borderRadius:12,padding:'11px 16px',marginBottom:26,display:'flex',alignItems:'center',gap:10 }}>
                <div className="dot" style={{ background:'var(--rose)' }} />
                <span style={{ fontFamily:'var(--fm)',fontSize:11,color:'var(--t2)',letterSpacing:'.04em' }}>moisture={moisture} · threshold={MOISTURE_THRESHOLD} · pump={pumpState}</span>
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button className="btn-primary" onClick={() => { handleCommand('pump_on'); setAlertVisible(false); setAlertDismissed(true); setActiveTab('monitor'); }}>💧 Activate Pump</button>
                <button className="btn-ghost" onClick={() => { setAlertVisible(false); setAlertDismissed(true); }}>Dismiss</button>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <header className="hdr">
          <div style={{ maxWidth:1340,margin:'0 auto',padding:'0 32px',height:78,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <a href="/" style={{ display:'flex',alignItems:'center',gap:16,textDecoration:'none',cursor:'pointer' }}>
              <div style={{ width:54,height:54,borderRadius:16,background:'linear-gradient(135deg,var(--mint-deep),var(--sky-deep))',boxShadow:'0 5px 24px rgba(46,196,122,.40), 0 0 0 4px rgba(46,196,122,.10)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Leaf size={28} color="#fff" strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize:22,fontWeight:800,letterSpacing:'-.03em',fontFamily:'var(--ff)',lineHeight:1.2,background:'linear-gradient(135deg, #0d7a42, #146cb4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>SmartHub Garden</div>
                <div style={{ fontSize:11.5,color:'var(--t2)',fontFamily:'var(--fm)',marginTop:3,letterSpacing:'.10em',fontWeight:600 }}>DEVICE · garden_pump_01</div>
              </div>
            </a>
            <div style={{ display:'flex',alignItems:'center',gap:14 }}>
              {condition === 'DRY' && (
                <button onClick={() => setAlertVisible(true)} className="dng-alert-btn"><AlertTriangle size={11} /> DRY ALERT</button>
              )}
              <div style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 22px',background:status?'rgba(13,122,66,.10)':'rgba(192,39,62,.10)',border:`2px solid ${status?'rgba(13,122,66,.35)':'rgba(192,39,62,.35)'}`,borderRadius:50,boxShadow:status?'0 0 16px rgba(13,122,66,.14)':'0 0 16px rgba(192,39,62,.14)' }}>
                <div className="dot" style={{ width:9,height:9,background:status?'#0d7a42':'#c0273e',boxShadow:status?'0 0 8px rgba(13,122,66,.60)':'0 0 8px rgba(192,39,62,.60)' }} />
                <span style={{ fontSize:12.5,fontWeight:700,fontFamily:'var(--fm)',letterSpacing:'.10em',color:status?'#0d7a42':'#c0273e' }}>
                  {status ? 'CONNECTED' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <div style={{ maxWidth:1340,margin:'0 auto',padding:'34px 32px 72px',position:'relative',zIndex:1 }}>

          <div className="tab-wrap reveal">
            <button className={`tab ${activeTab==='monitor'?'tab-on':'tab-off'}`} onClick={() => setActiveTab('monitor')}><Activity size={16} /> Live Monitor</button>
            <button className={`tab ${activeTab==='history'?'tab-on':'tab-off'}`} onClick={() => setActiveTab('history')}><TrendingUp size={16} /> Activity History</button>
          </div>

          {/* ════ MONITOR ════ */}
          {activeTab === 'monitor' && (
            <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18 }}>

                {/* Moisture */}
                <div className={`card reveal d1 ${condition==='DRY'?'card-danger card-danger-pulse card-moisture-dry':'card-moisture'}`} style={{ padding:30 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22 }}>
                    <div className={`ib ${condition==='DRY'?'ib-rose':'ib-mint'}`}>
                      <Droplets size={22} color={condition==='DRY'?'var(--rose)':'#1aac6a'} strokeWidth={2.2} />
                    </div>
                    <span className="bdg" style={{ background:condition==='DRY'?'rgba(192,39,62,.10)':'rgba(13,122,66,.10)',color:condition==='DRY'?'#c0273e':'#0d7a42',border:`2px solid ${condition==='DRY'?'rgba(192,39,62,.32)':'rgba(13,122,66,.30)'}` }}>{condition}</span>
                  </div>
                  <div className="lbl">Soil Moisture</div>
                  <div className="val" style={{ color:condition==='DRY'?'var(--rose)':'var(--t0)' }}>{moisture}</div>
                  <div className="bar-wrap">
                    <div className="bar-fill" style={{ width:`${moisturePct}%`,background:condition==='DRY'?'linear-gradient(90deg,#FF6B8A,#FF9EAF)':'linear-gradient(90deg,var(--mint-deep),var(--sky-deep))' }} />
                  </div>
                  <div style={{ display:'inline-flex',alignItems:'center',gap:7,fontSize:12.5,color:condition==='DRY'?'#c0273e':'#0d7a42',marginTop:13,fontFamily:'var(--fm)',fontWeight:600,padding:'6px 14px',background:condition==='DRY'?'rgba(192,39,62,.06)':'rgba(13,122,66,.06)',borderRadius:8,border:`1.5px solid ${condition==='DRY'?'rgba(192,39,62,.16)':'rgba(13,122,66,.14)'}` }}>
                    {condition==='DRY'?'▲ Threshold exceeded · needs watering':'✓ Within optimal range'}
                  </div>
                </div>

                {/* Pump */}
                <div className={`card reveal d2 ${pumpState==='ON'?'card-active card-pump-on':'card-pump'}`} style={{ padding:30 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22 }}>
                    <div className={`ib ${pumpState==='ON'?'ib-mint':'ib-sky'}`}>
                      <Power size={22} color={pumpState==='ON'?'#1aac6a':'#1e93d6'} strokeWidth={2.2} />
                    </div>
                    <div className="dot" style={{ width:12,height:12,background:pumpState==='ON'?'#0d7a42':'var(--t3)',marginTop:11,animationPlayState:pumpState==='ON'?'running':'paused',boxShadow:pumpState==='ON'?'0 0 12px rgba(13,122,66,.60)':'none' }} />
                  </div>
                  <div className="lbl">Pump Status</div>
                  <div className="val" style={{ color:pumpState==='ON'?'var(--mint-deep)':'var(--t1)' }}>{pumpState}</div>
                  <div className="bar-wrap">
                    {pumpState==='ON' && <div className="bar-fill" style={{ width:'100%',background:'linear-gradient(90deg,var(--mint-deep),var(--sky-mid))' }} />}
                  </div>
                  <div style={{ display:'inline-flex',alignItems:'center',gap:7,fontSize:12.5,color:pumpState==='ON'?'#0d7a42':'#3d5c4a',marginTop:13,fontFamily:'var(--fm)',fontWeight:600,padding:'6px 14px',background:pumpState==='ON'?'rgba(13,122,66,.06)':'rgba(61,92,74,.05)',borderRadius:8,border:`1.5px solid ${pumpState==='ON'?'rgba(13,122,66,.14)':'rgba(61,92,74,.12)'}` }}>
                    {pumpState==='ON'?'💧 Active irrigation in progress':'⏸ System in standby mode'}
                  </div>
                </div>

                {/* Mode */}
                <div className={`card reveal d3 ${mode==='MANUAL'?'card-mode-manual':'card-mode'}`} style={{ padding:30 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22 }}>
                    <div className={`ib ${mode==='MANUAL'?'ib-amber':'ib-sky'}`}>
                      {mode==='MANUAL'?<Settings size={22} color="#d4960a" strokeWidth={2.2} />:<Zap size={22} color="#1e93d6" strokeWidth={2.2} />}
                    </div>
                    <span className="bdg" style={{ background:mode==='MANUAL'?'rgba(180,83,9,.10)':'rgba(20,108,180,.12)',color:mode==='MANUAL'?'#b45309':'#146cb4',border:`2px solid ${mode==='MANUAL'?'rgba(180,83,9,.30)':'rgba(20,108,180,.32)'}` }}>
                      {mode==='MANUAL'?'Manual':'Auto'}
                    </span>
                  </div>
                  <div className="lbl">Operation Mode</div>
                  <div className="val" style={{ fontSize:36,color:mode==='MANUAL'?'var(--amber)':'var(--t0)' }}>{mode==='MANUAL'?'Manual':'Automatic'}</div>
                  <div className="bar-wrap" />
                  <div style={{ display:'inline-flex',alignItems:'center',gap:7,fontSize:12.5,color:mode==='MANUAL'?'#b45309':'#146cb4',marginTop:13,fontFamily:'var(--fm)',fontWeight:600,padding:'6px 14px',background:mode==='MANUAL'?'rgba(180,83,9,.06)':'rgba(20,108,180,.06)',borderRadius:8,border:`1.5px solid ${mode==='MANUAL'?'rgba(180,83,9,.16)':'rgba(20,108,180,.14)'}` }}>
                    {mode==='MANUAL'?'🎮 Override active · 10s duration':'🤖 Smart automation running'}
                  </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="card reveal d4" style={{ overflow:'hidden' }}>

                {/* Header row */}
                <div style={{ padding:'24px 32px 20px',borderBottom:'1.5px solid rgba(129,231,175,.15)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(232,248,240,.38)' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                    <div className="ib ib-mint"><Settings size={20} color="#1aac6a" strokeWidth={2.2} /></div>
                    <div>
                      <div style={{ fontSize:16,fontWeight:700,color:'var(--t0)',fontFamily:'var(--ff)',letterSpacing:'-.02em' }}>Pump Control</div>
                      <div style={{ fontSize:11.5,color:'var(--t2)',marginTop:2,fontFamily:'var(--fm)',fontWeight:500 }}>Manual override · 10 second duration window</div>
                    </div>
                  </div>
                  {/* moisture readout pill */}
                  <div style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 24px',background:condition==='DRY'?'rgba(192,39,62,.08)':'rgba(13,122,66,.08)',border:`2px solid ${condition==='DRY'?'rgba(192,39,62,.30)':'rgba(13,122,66,.28)'}`,borderRadius:50,boxShadow:condition==='DRY'?'0 0 14px rgba(192,39,62,.10)':'0 0 14px rgba(13,122,66,.10)' }}>
                    <Wind size={18} color={condition==='DRY'?'#c0273e':'#0d7a42'} strokeWidth={2.4} />
                    <span style={{ fontFamily:'var(--fm)',fontSize:12.5,color:'var(--t1)',fontWeight:600 }}>moisture</span>
                    <span style={{ fontFamily:'var(--fm)',fontSize:16,fontWeight:800,color:condition==='DRY'?'#c0273e':'#0d7a42' }}>{moisture}</span>
                    <span style={{ fontFamily:'var(--fm)',fontSize:12,color:'var(--t2)',fontWeight:600 }}>/ 4095</span>
                  </div>
                </div>

                {/* Body: two-column */}
                <div className="pump-wrap">

                  {/* LEFT — big power button */}
                  <div className="pump-left">
                    <div className={`pump-ring ${pumpState==='ON'?'pump-ring-on':'pump-ring-off'}`}>
                      <button
                        className={`power-btn ${pumpState==='ON'?'power-btn-on':'power-btn-off'}`}
                        onClick={() => handleCommand(pumpState==='ON'?'pump_off':'pump_on')}
                      >
                        <Power size={36} color={pumpState==='ON'?'#fff':'#1e93d6'} strokeWidth={2.2} />
                      </button>
                    </div>
                    <div className="pump-state-lbl" style={{ color:pumpState==='ON'?'#1aac6a':'var(--t2)' }}>
                      <div className="dot" style={{ width:8,height:8,background:pumpState==='ON'?'#1aac6a':'var(--t4)',boxShadow:pumpState==='ON'?'0 0 8px rgba(46,196,122,.60)':'none',animationPlayState:pumpState==='ON'?'running':'paused' }} />
                      {pumpState==='ON' ? 'PUMP ACTIVE' : 'PUMP STANDBY'}
                    </div>
                    <div style={{ marginTop:8,fontSize:11,color:'var(--t3)',fontFamily:'var(--fm)',fontWeight:500 }}>
                      {pumpState==='ON' ? 'Tap to deactivate' : 'Tap to activate'}
                    </div>

                    {commandStatus && (
                      <div className="toast" style={{ marginTop:14,fontSize:11 }}>
                        <div className="dot" style={{ background:'var(--mint-deep)' }} />
                        {commandStatus}
                      </div>
                    )}
                  </div>

                  {/* RIGHT — stat cards */}
                  <div className="pump-right">

                    {/* Pump state */}
                    <div className="ctrl-stat">
                      <div className="ctrl-stat-icon" style={{ background:pumpState==='ON'?'rgba(46,196,122,.12)':'rgba(59,174,240,.10)',border:`1.5px solid ${pumpState==='ON'?'rgba(46,196,122,.28)':'rgba(59,174,240,.26)'}` }}>
                        <Power size={18} color={pumpState==='ON'?'#1aac6a':'#1e93d6'} strokeWidth={2.2} />
                      </div>
                      <div className="ctrl-stat-body">
                        <div className="ctrl-stat-lbl">Pump State</div>
                        <div className="ctrl-stat-val" style={{ color:pumpState==='ON'?'#1aac6a':'var(--t1)' }}>{pumpState==='ON'?'Active — Irrigating':'Standby'}</div>
                      </div>
                      <span className="bdg" style={{ background:pumpState==='ON'?'rgba(46,196,122,.10)':'rgba(174,222,252,.14)',color:pumpState==='ON'?'#1aac6a':'#1e93d6',border:`1.5px solid ${pumpState==='ON'?'rgba(46,196,122,.28)':'rgba(59,174,240,.26)'}` }}>
                        {pumpState}
                      </span>
                    </div>

                    {/* Condition */}
                    <div className="ctrl-stat">
                      <div className="ctrl-stat-icon" style={{ background:condition==='DRY'?'rgba(255,107,138,.10)':'rgba(46,196,122,.10)',border:`1.5px solid ${condition==='DRY'?'rgba(255,107,138,.26)':'rgba(46,196,122,.26)'}` }}>
                        <Leaf size={18} color={condition==='DRY'?'var(--rose)':'#1aac6a'} strokeWidth={2.2} />
                      </div>
                      <div className="ctrl-stat-body">
                        <div className="ctrl-stat-lbl">Soil Condition</div>
                        <div className="ctrl-stat-val" style={{ color:condition==='DRY'?'var(--rose)':'#1aac6a' }}>{condition==='DRY'?'Dry — Needs Water':'Well Hydrated'}</div>
                      </div>
                      <span className="bdg" style={{ background:condition==='DRY'?'var(--rose-pale)':'rgba(46,196,122,.10)',color:condition==='DRY'?'var(--rose)':'#1aac6a',border:`1.5px solid ${condition==='DRY'?'rgba(255,107,138,.28)':'rgba(46,196,122,.28)'}` }}>
                        {condition}
                      </span>
                    </div>

                    {/* Mode */}
                    <div className="ctrl-stat">
                      <div className="ctrl-stat-icon" style={{ background:mode==='MANUAL'?'rgba(251,191,36,.12)':'rgba(59,174,240,.10)',border:`1.5px solid ${mode==='MANUAL'?'rgba(251,191,36,.30)':'rgba(59,174,240,.26)'}` }}>
                        {mode==='MANUAL'?<Settings size={18} color="#d4960a" strokeWidth={2.2} />:<Zap size={18} color="#1e93d6" strokeWidth={2.2} />}
                      </div>
                      <div className="ctrl-stat-body">
                        <div className="ctrl-stat-lbl">Operation Mode</div>
                        <div className="ctrl-stat-val" style={{ color:mode==='MANUAL'?'var(--amber)':'var(--t0)' }}>{mode==='MANUAL'?'Manual Override':'Automatic'}</div>
                      </div>
                      <span className="bdg" style={{ background:mode==='MANUAL'?'var(--amber-pale)':'rgba(59,174,240,.10)',color:mode==='MANUAL'?'var(--amber)':'#1e93d6',border:`1.5px solid ${mode==='MANUAL'?'rgba(251,191,36,.28)':'rgba(59,174,240,.26)'}` }}>
                        {mode==='MANUAL'?'MANUAL':'AUTO'}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {activeTab === 'history' && (
            <div style={{ display:'flex',flexDirection:'column',gap:20 }}>

              {/* Stats */}
              <div style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
                {[
                  { icon:<BarChart3 size={20} color="#1e93d6" strokeWidth={2.2} />,  val:sensorEntries.length,  lbl:'Total Readings',  c:'rgba(59,174,240,.16)',  bc:'rgba(59,174,240,.36)' },
                  { icon:<Droplets  size={20} color={dryCount>0?'#d63858':'#1aac6a'} strokeWidth={2.2} />, val:dryCount, lbl:'Dry Events', c:dryCount>0?'var(--rose-pale)':'rgba(46,196,122,.14)', bc:dryCount>0?'rgba(255,107,138,.30)':'rgba(46,196,122,.32)', vc:dryCount>0?'var(--rose)':undefined },
                  { icon:<Activity  size={20} color="#1aac6a" strokeWidth={2.2} />, val:avgMoisture||'—',      lbl:'Avg Moisture',  c:'rgba(46,196,122,.14)', bc:'rgba(46,196,122,.32)' },
                  { icon:<Cpu       size={20} color="#8b6fdb" strokeWidth={2.2} />,  val:commandEntries.length, lbl:'Commands Sent', c:'var(--lav-pale)',       bc:'rgba(196,181,253,.38)' },
                  { icon:<CheckCircle2 size={20} color="#1e93d6" strokeWidth={2.2} />, val:MOISTURE_THRESHOLD, lbl:'Dry Threshold', c:'rgba(59,174,240,.14)', bc:'rgba(59,174,240,.34)' },
                ].map((s,i) => (
                  <div key={i} className="spill reveal" style={{ animationDelay:`${i*.06}s` }}>
                    <div className="ib" style={{ background:s.c,border:`2px solid ${s.bc}`,width:46,height:46,borderRadius:13 }}>{s.icon}</div>
                    <div>
                      <div className="spill-v" style={{ color:s.vc||'var(--t0)' }}>{s.val}</div>
                      <div className="spill-l">{s.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="card reveal d1" style={{ overflow:'hidden' }}>
                <div style={{ padding:'22px 28px',borderBottom:'1.5px solid rgba(174,222,252,.22)',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:14,background:'rgba(232,248,240,.42)' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                    <div className="ib ib-sky" style={{ width:46,height:46,borderRadius:13 }}><TrendingUp size={20} color="#1e93d6" strokeWidth={2.2} /></div>
                    <div>
                      <div style={{ fontSize:16,fontWeight:700,color:'var(--t0)',fontFamily:'var(--ff)',letterSpacing:'-.02em' }}>Activity Log</div>
                      <div style={{ fontSize:11,color:'var(--t2)',fontFamily:'var(--fm)',marginTop:2,letterSpacing:'.10em',fontWeight:600 }}>{filteredHistory.length} RECORDS</div>
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:10 }}>
                    <select className="sel" value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
                      <option value="all">All Modes</option>
                      <option value="AUTOMATIC">Automatic</option>
                      <option value="MANUAL">Manual</option>
                    </select>
                    <select className="sel" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
                      <option value="all">All States</option>
                      <option value="ON">Pump ON</option>
                      <option value="OFF">Pump OFF</option>
                    </select>
                  </div>
                </div>

                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse' }}>
                    <thead>
                      <tr>{['Time','Type','Moisture','Condition','Pump','Mode'].map(h => <th key={h} className="tbl-th">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((entry: any, i: number) => {
                        const isCmd = entry.data.status === 'command_executed';
                        return (
                          <tr key={entry._id||i} className="tbl-tr">
                            <td className="tbl-td" style={{ fontFamily:'var(--fm)',fontSize:12.5,color:'var(--t1)',whiteSpace:'nowrap',fontWeight:500 }}>{new Date(entry.timestamp).toLocaleString()}</td>
                            <td className="tbl-td">
                              <span className="bdg" style={{ background:isCmd?'rgba(118,80,200,.10)':'rgba(13,122,66,.10)',color:isCmd?'#6840c6':'#0d7a42',border:`2px solid ${isCmd?'rgba(118,80,200,.30)':'rgba(13,122,66,.28)'}` }}>
                                {isCmd?'⚡ Cmd':'📡 Sensor'}
                              </span>
                            </td>
                            <td className="tbl-td" style={{ fontFamily:'var(--fm)',fontWeight:700,color:'var(--t0)',fontSize:14 }}>
                              {isCmd?<span style={{ color:'var(--t3)' }}>—</span>:entry.data.moisture}
                            </td>
                            <td className="tbl-td">
                              {isCmd
                                ?<span className="bdg" style={{ background:'rgba(13,122,66,.10)',color:'#0d7a42',border:'2px solid rgba(13,122,66,.28)' }}>✓ Done</span>
                                :<span className="bdg" style={{ background:entry.data.condition==='DRY'?'rgba(192,39,62,.10)':'rgba(13,122,66,.10)',color:entry.data.condition==='DRY'?'#c0273e':'#0d7a42',border:`2px solid ${entry.data.condition==='DRY'?'rgba(192,39,62,.30)':'rgba(13,122,66,.28)'}` }}>
                                  {entry.data.condition==='DRY'?'🌵 DRY':'💧 WET'}
                                </span>}
                            </td>
                            <td className="tbl-td">
                              {isCmd?<span style={{ color:'var(--t3)',fontFamily:'var(--fm)' }}>—</span>
                                :<span className="bdg" style={{ background:entry.data.pump_state==='ON'?'rgba(20,108,180,.10)':'rgba(100,116,108,.08)',color:entry.data.pump_state==='ON'?'#146cb4':'#3d5c4a',border:`2px solid ${entry.data.pump_state==='ON'?'rgba(20,108,180,.30)':'rgba(100,116,108,.22)'}` }}>
                                  {entry.data.pump_state==='ON'?'⚡ ON':'○ OFF'}
                                </span>}
                            </td>
                            <td className="tbl-td">
                              {isCmd?<span style={{ color:'var(--t3)',fontFamily:'var(--fm)' }}>—</span>
                                :<span className="bdg" style={{ background:entry.data.mode==='MANUAL'?'rgba(180,83,9,.10)':'rgba(20,108,180,.10)',color:entry.data.mode==='MANUAL'?'#b45309':'#146cb4',border:`2px solid ${entry.data.mode==='MANUAL'?'rgba(180,83,9,.30)':'rgba(20,108,180,.30)'}` }}>
                                  {entry.data.mode==='MANUAL'?'🎮 Manual':'🤖 Auto'}
                                </span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredHistory.length === 0 && (
                    <div style={{ textAlign:'center',padding:'72px 0' }}>
                      <Waves size={38} color="rgba(129,231,175,.38)" style={{ margin:'0 auto 16px',display:'block' }} />
                      <div style={{ fontSize:13,fontWeight:700,color:'var(--t3)',fontFamily:'var(--fm)',letterSpacing:'.12em' }}>NO RECORDS FOUND</div>
                      <div style={{ fontSize:12,color:'var(--t4)',marginTop:8,fontFamily:'var(--ff)' }}>Adjust filters or check back later</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
