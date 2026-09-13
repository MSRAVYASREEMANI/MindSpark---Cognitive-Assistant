import React, { useState } from 'react';
import { CaregiverAlert, SyncLogItem, UserProfile, EEGStatus, NavigationTab, ReminderItem } from '../types';
import { INITIAL_ALERTS, INITIAL_SYNC_LOGS } from '../data/mockData';
import { speakText } from '../utils/audio';
import { CognitiveTrendChart } from './CognitiveTrendChart';
import { WeeklyAdherenceChart } from './WeeklyAdherenceChart';

interface CaregiverPortalProps {
  userProfile: UserProfile;
  eegStatus: EEGStatus;
  isOffline: boolean;
  onForceSync: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onCallPatient: () => void;
  onAddReminder?: (reminder: ReminderItem) => void;
}

export const CaregiverPortal: React.FC<CaregiverPortalProps> = ({
  userProfile,
  eegStatus,
  isOffline,
  onForceSync,
  onNavigate,
  onCallPatient,
  onAddReminder,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [caregiverEmail, setCaregiverEmail] = useState<string>('sarah.miller@carefamily.org');
  const [pin, setPin] = useState<string>('8429');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'trends' | 'alerts' | 'clinical-ai'>('overview');

  const [alerts, setAlerts] = useState<CaregiverAlert[]>(INITIAL_ALERTS);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>(INITIAL_SYNC_LOGS);
  const [resolvedAttention, setResolvedAttention] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string>('');

  // Longitudinal EEG Baseline Comparison Overlay
  const [overlayPrevWeekAvg, setOverlayPrevWeekAvg] = useState<boolean>(false);

  // AI Clinical Assessment State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<{
    summary: string;
    riskLevel: string;
    recommendations: string[];
    source: string;
  } | null>(null);

  // New Reminder Modal
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);
  const [medTitle, setMedTitle] = useState<string>('');
  const [medTime, setMedTime] = useState<string>('12:00 PM');
  const [medDose, setMedDose] = useState<string>('1 tablet with water');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setIsAuthenticated(true);
    }
  };

  const handleResolveAttention = () => {
    setResolvedAttention(true);
    speakText('Hydration reminder marked as resolved by caregiver.');
  };

  const handleAlertAction = (alertItem: CaregiverAlert) => {
    if (alertItem.actionType === 'call') {
      onCallPatient();
    } else if (alertItem.actionType === 'clinic') {
      speakText('Connecting to Dr. Aris Thorne at the Geriatric Neurology Clinic.');
    } else if (alertItem.actionType === 'reminder') {
      speakText('Reminder sent to patient tablet: Please charge your EEG headset.');
    } else if (alertItem.actionType === 'guide') {
      onNavigate('connect-headset');
    }
    // Dismiss/resolve the alert
    setAlerts((prev) => prev.filter((a) => a.id !== alertItem.id));
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncSuccessMsg('');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncLogs((prev) =>
        prev.map((log) => ({
          ...log,
          status: 'synced',
          timestamp: 'Just now (Synced)',
        }))
      );
      setSyncSuccessMsg('All records successfully synchronized to clinical HIPAA cloud.');
      onForceSync();
      speakText('Cloud sync complete.');
    }, 1200);
  };

  // Generate AI Clinical Assessment
  const handleGenerateAiAssessment = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/caregiver-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: userProfile.name,
          eegFocusAverage: eegStatus.focusLevel,
          medicationAdherenceRate: 90,
          recentAlertsCount: alerts.length,
          confusionIncidents: 0,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiReport(data);
      } else {
        throw new Error('Insights failed');
      }
    } catch {
      setAiReport({
        summary: `Patient ${userProfile.name} demonstrates stable cognitive baselines in Guwahati. Alpha wave rhythm is balanced at ${eegStatus.focusLevel}% focus, with calm behavioral status.`,
        riskLevel: 'Low',
        recommendations: [
          'Maintain regular afternoon video calls with Sarah in Shillong.',
          'Continue sensory morning walks in the Assam garden along the Brahmaputra.',
          'Verify hydration schedule during afternoon medication.',
        ],
        source: 'clinical-rules-engine',
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Export CSV Medical Report
  const handleExportCSV = () => {
    const csvRows = [
      ['MindSpark Cognitive Telemetry Summary'],
      ['Timestamp', 'Patient Name', 'Location', 'Current EEG Focus %', 'Battery %', 'Adherence %', 'Active Alerts'],
      [
        new Date().toISOString(),
        `"${userProfile.name}"`,
        `"${userProfile.city || 'Guwahati'}, ${userProfile.state || 'Assam'}"`,
        `${eegStatus.focusLevel}%`,
        `${eegStatus.batteryLevel}%`,
        '90%',
        `${alerts.length}`,
      ],
      [],
      ['7-Day Cognitive Test Scores & EEG Focus History'],
      ['Day', 'Date', 'Cognitive Score %', 'EEG Focus %', 'Tests Completed', 'Primary Exercise', 'Clinical Notes'],
      ['Tue', 'Sep 1, 2026', '78%', '70%', '2', 'Faces Challenge', '"Mild morning hesitation during name recall"'],
      ['Wed', 'Sep 2, 2026', '82%', '76%', '3', 'Garden Paths', '"Smooth spatial wayfinding after morning tea"'],
      ['Thu', 'Sep 3, 2026', '80%', '73%', '2', 'Word Sparks', '"Good verbal fluency on Brahmaputra bird prompts"'],
      ['Fri', 'Sep 4, 2026', '86%', '81%', '3', 'Faces Challenge', '"Immediate recognition of granddaughter Maya"'],
      ['Sat', 'Sep 5, 2026', '84%', '79%', '2', 'Garden Paths', '"Relaxed weekend baseline, consistent focused states"'],
      ['Sun', 'Sep 6, 2026', '89%', '83%', '4', 'Faces & Word Sparks', '"Peak cognitive baseline for the week"'],
      ['Today', 'Sep 7, 2026', '88%', `${eegStatus.focusLevel}%`, '3', 'Faces Challenge', '"Calm and focused; completed morning memory exercise"'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mindspark_${userProfile.name.toLowerCase().replace(/\s+/g, '_')}_clinical_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medTitle.trim() || !onAddReminder) return;

    onAddReminder({
      id: `rem-med-${Date.now()}`,
      title: medTitle.trim(),
      time: medTime,
      category: 'medication',
      status: 'upcoming',
      dose: medDose.trim() || undefined,
      details: 'Added by caregiver via clinical portal',
    });

    setShowAddMedModal(false);
    setMedTitle('');
    speakText(`Scheduled new medication ${medTitle} for ${userProfile.name}.`);
  };

  // If Not Authenticated, show Portal Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-12 max-w-xl mx-auto justify-center">
        <div className="bg-white/80 dark:bg-[#1e2023]/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-neu-extruded border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#003c53] text-white mx-auto mb-6 shadow-md">
            <span className="material-symbols-outlined text-[36px]">supervisor_account</span>
          </div>

          <h1 className="font-bold text-3xl text-center text-[#003c53] dark:text-[#94cef0] tracking-tight mb-2">
            Caregiver Portal
          </h1>
          <p className="text-center text-base text-[#40484d] dark:text-[#c0c7ce] mb-8">
            Monitor real-time cognitive metrics, EEG baselines, and sync health logs.
          </p>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                Caregiver ID or Email
              </label>
              <input
                type="email"
                required
                value={caregiverEmail}
                onChange={(e) => setCaregiverEmail(e.target.value)}
                className="w-full px-5 h-14 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-2">
                4-Digit Caregiver PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="8429"
                  className="w-full px-5 h-14 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#71787e]"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPin ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-[#71787e] mt-1.5">
                Default demonstration PIN: <span className="font-mono font-bold text-[#003c53] dark:text-[#94cef0]">8429</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full h-14 rounded-2xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white font-bold text-lg shadow-neu-extruded transition-transform hover:scale-102 active:scale-98"
            >
              Sign In to Caregiver Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Background Weave Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-3xl md:text-4xl text-[#003c53] dark:text-[#94cef0] tracking-tight">
              Caregiver Portal
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • Shillong Care Hub</span>
            </span>
          </div>
          <p className="text-base text-[#40484d] dark:text-[#c0c7ce] mt-1">
            Monitoring Patient: <span className="font-bold text-[#191c1e] dark:text-white">{userProfile.name}</span> (Age {userProfile.age}, Guwahati, Assam)
          </p>
        </div>

        {/* Tab Selector & Controls */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex bg-[#edeef0] dark:bg-[#282a2d] p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeSubTab === 'overview'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#40484d] dark:text-[#c0c7ce]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('trends')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 ${
                activeSubTab === 'trends'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#40484d] dark:text-[#c0c7ce]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
              <span>7-Day Trends</span>
            </button>
            <button
              onClick={() => setActiveSubTab('alerts')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all relative ${
                activeSubTab === 'alerts'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#40484d] dark:text-[#c0c7ce]'
              }`}
            >
              <span>Alerts & Sync</span>
              {alerts.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#ba1a1a] text-white text-[10px]">
                  {alerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('clinical-ai')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                activeSubTab === 'clinical-ai'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#40484d] dark:text-[#c0c7ce]'
              }`}
            >
              AI Insights
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            title="Download CSV clinical data"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-xs font-bold text-[#003c53] dark:text-[#94cef0] flex items-center gap-1.5 shadow-sm hover:bg-[#abdefe]/20 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-gray-200 dark:hover:bg-white/5 text-[#71787e] font-semibold text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Overview Subtab */}
      {activeSubTab === 'overview' && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Cols: Status, Adherence, Activities */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Current Status Card */}
            <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#003c53] to-[#0b5471] text-white shadow-neu-extruded">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm uppercase tracking-wider font-bold text-[#8dc7e9]">
                  Real-Time Cognitive Telemetry
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm">
                  EEG Active
                </span>
              </div>

              <h2 className="font-bold text-3xl md:text-4xl mb-2">
                Calm & Engaged
              </h2>
              <p className="text-lg text-white/90 leading-relaxed mb-6 max-w-xl">
                {userProfile.name} is currently exhibiting stable alpha wave balance with high focus during scheduled exercises in Guwahati.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div>
                  <span className="text-xs text-white/70 block">Heart Rate</span>
                  <span className="font-bold text-2xl">72 bpm</span>
                </div>
                <div>
                  <span className="text-xs text-white/70 block">EEG Focus</span>
                  <span className="font-bold text-2xl">{eegStatus.focusLevel}%</span>
                </div>
                <div>
                  <span className="text-xs text-white/70 block">Headset Battery</span>
                  <span className="font-bold text-2xl">{eegStatus.batteryLevel}%</span>
                </div>
              </div>
            </div>

            {/* 7-Day Cognitive Test Scores & EEG Focus Trend Graph */}
            <CognitiveTrendChart
              patientName={userProfile.name}
              eegStatus={eegStatus}
              overlayPrevWeek={overlayPrevWeekAvg}
              onToggleOverlayPrevWeek={setOverlayPrevWeekAvg}
            />

            {/* Adherence & Routine Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interactive 7-Day Adherence Recharts Graph */}
              <WeeklyAdherenceChart patientName={userProfile.name} />

              {/* Recent Patient Activities */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col justify-between">
                <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0] mb-3">
                  Recent Activities
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e1e2e5] dark:border-[#282a2d]">
                    <span className="font-medium text-[#191c1e] dark:text-white">
                      Morning Donepezil
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">Taken 8:15 AM</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#e1e2e5] dark:border-[#282a2d]">
                    <span className="font-medium text-[#191c1e] dark:text-white">
                      Garden Walk (Brahmaputra)
                    </span>
                    <span className="text-xs text-[#71787e]">Logged 10:30 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#191c1e] dark:text-white">
                      Face Match Memory Game
                    </span>
                    <span className="text-xs text-[#003c53] dark:text-[#94cef0] font-bold">Score 85%</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('reminders')}
                  className="mt-4 text-xs font-bold text-[#003c53] dark:text-[#94cef0] flex items-center gap-1 hover:underline"
                >
                  <span>View Full Schedule</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Attention Needed & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Attention Needed Card */}
            {!resolvedAttention ? (
              <div className="p-6 rounded-3xl bg-[#ffdad6]/50 dark:bg-[#93000a]/20 border border-[#ba1a1a]/30 shadow-neu-extruded">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="material-symbols-outlined text-[#ba1a1a] text-[28px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                  <h3 className="font-bold text-xl text-[#ba1a1a] dark:text-[#ffdad6]">
                    Attention Needed
                  </h3>
                </div>

                <p className="text-sm font-semibold text-[#191c1e] dark:text-white mb-1">
                  Hydration Reminder Missed
                </p>
                <p className="text-xs text-[#40484d] dark:text-[#c0c7ce] mb-4 leading-relaxed">
                  Scheduled hydration glass at 10:00 AM was not confirmed on {userProfile.name}'s tablet.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleResolveAttention}
                    className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-sm shadow-md"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={onCallPatient}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#282a2d] text-[#ba1a1a] font-bold text-sm border border-[#ba1a1a]/30"
                  >
                    Call
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 shadow-neu-extruded flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <div>
                  <h4 className="font-bold text-base text-emerald-800 dark:text-emerald-200">
                    All Reminders Current
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    No urgent pending items.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col gap-3">
              <h3 className="font-bold text-lg text-[#003c53] dark:text-[#94cef0] mb-2">
                Caregiver Quick Actions
              </h3>

              <button
                onClick={onCallPatient}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#003c53] text-white font-semibold text-sm flex items-center justify-between shadow-sm hover:bg-[#0b5471]"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                  <span>Video Call {userProfile.name}</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>

              <button
                onClick={() => setShowAddMedModal(true)}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#003c53] dark:text-[#94cef0] font-semibold text-sm flex items-center justify-between hover:bg-[#e1e2e5]"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">medication</span>
                  <span>Add Medication to Tablet</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>

              <button
                onClick={() => onNavigate('connect-headset')}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#191c1e] dark:text-white font-semibold text-sm flex items-center justify-between hover:bg-[#e1e2e5]"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">sensors</span>
                  <span>Check EEG Sensors</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Emergency Contacts & Profile Directory */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">contact_phone</span>
                  <h3 className="font-bold text-base text-[#191c1e] dark:text-white">
                    Emergency Network ({userProfile.emergencyContacts?.length || 0})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('onboarding')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  title="Add or edit emergency contacts"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Add (+)</span>
                </button>
              </div>

              {/* Patient Quick Info */}
              <div className="p-3 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] text-xs text-[#40484d] dark:text-[#c0c7ce] space-y-1">
                <p>
                  <strong className="text-[#191c1e] dark:text-white">{userProfile.name}</strong>, {userProfile.age} yrs • {userProfile.city || 'Guwahati'}, {userProfile.state || 'Assam'}
                </p>
                {userProfile.medicalNotes && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Notes: {userProfile.medicalNotes}
                  </p>
                )}
              </div>

              {/* Contacts List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {userProfile.emergencyContacts?.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-[#f8f9fc] dark:bg-[#282a2d] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#191c1e] dark:text-white">
                        {c.name} {c.isPrimary && <span className="text-[10px] text-red-600 font-bold ml-1">(Primary)</span>}
                      </p>
                      <p className="text-[11px] text-[#71787e]">
                        {c.relationship} • {c.phone}
                      </p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('onboarding')}
                className="mt-1 w-full py-2.5 rounded-xl border border-[#c0c7ce]/50 text-xs font-bold text-[#003c53] dark:text-[#94cef0] hover:bg-[#abdefe]/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                <span>Manage Details & Emergency Contacts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Visual Trend Subtab */}
      {activeSubTab === 'trends' && (
        <div className="relative z-10 flex flex-col gap-8">
          {/* Quick EEG Baseline Comparison Control Bar */}
          <div className="p-4 rounded-2xl bg-[#f8f9fc] dark:bg-[#23262a] border border-[#e1e2e5] dark:border-white/5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl text-white transition-all ${
                  overlayPrevWeekAvg
                    ? 'bg-purple-600 shadow-md shadow-purple-500/25'
                    : 'bg-[#71787e]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {overlayPrevWeekAvg ? 'stacked_line_chart' : 'show_chart'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#191c1e] dark:text-white">
                    Longitudinal EEG Baseline Overlay
                  </span>
                  {overlayPrevWeekAvg && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Active (72% mean baseline)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#71787e] dark:text-[#9aa2a9]">
                  Overlay current EEG session telemetry with the previous week's 7-day average to evaluate cognitive trends and focus stability.
                </p>
              </div>
            </div>

            <button
              id="portal-overlay-prev-week-btn"
              onClick={() => setOverlayPrevWeekAvg((prev) => !prev)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                overlayPrevWeekAvg
                  ? 'bg-purple-600 text-white border-purple-600 shadow-purple-500/25 ring-2 ring-purple-400/30'
                  : 'bg-white dark:bg-[#1e2023] text-[#40484d] dark:text-[#c0c7ce] border-[#c0c7ce]/60 hover:bg-[#edeef0] dark:hover:bg-[#282a2d]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {overlayPrevWeekAvg ? 'layers' : 'layers_clear'}
              </span>
              <span>{overlayPrevWeekAvg ? 'Overlay: ON (Prev Week Avg)' : 'Overlay Previous Week Avg'}</span>
            </button>
          </div>

          <CognitiveTrendChart
            patientName={userProfile.name}
            eegStatus={eegStatus}
            overlayPrevWeek={overlayPrevWeekAvg}
            onToggleOverlayPrevWeek={setOverlayPrevWeekAvg}
          />

          {/* 7-Day Medication & Routine Adherence Breakdown Graph */}
          <WeeklyAdherenceChart patientName={userProfile.name} />

          {/* Clinical Insights Callout Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#003c53] dark:text-[#94cef0] mb-2">
                  <span className="material-symbols-outlined text-[24px]">psychology</span>
                  <h4 className="font-bold text-base">Memory Retention Trend</h4>
                </div>
                <p className="text-xs text-[#40484d] dark:text-[#c0c7ce] leading-relaxed">
                  Memory recall in the Faces challenge has risen from 78% on Tuesday to 88% today (+10%), indicating effective stabilization from consistent morning routines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#e1e2e5] dark:border-[#282a2d] flex justify-between items-center text-xs">
                <span className="text-[#71787e]">Clinical Trajectory:</span>
                <span className="font-bold text-emerald-600">Improving (+2.1%/day)</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                  <span className="material-symbols-outlined text-[24px]">waves</span>
                  <h4 className="font-bold text-base">Alpha/Theta Synchronization</h4>
                </div>
                <p className="text-xs text-[#40484d] dark:text-[#c0c7ce] leading-relaxed">
                  Frontal EEG sensors indicate robust 8-12 Hz alpha power when exercises are conducted before 11:00 AM after Arthur's garden walk along the Brahmaputra.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#e1e2e5] dark:border-[#282a2d] flex justify-between items-center text-xs">
                <span className="text-[#71787e]">Focus Stability:</span>
                <span className="font-bold text-amber-600">High Coherence</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#003c53] dark:text-[#94cef0] mb-2">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                  <h4 className="font-bold text-base">Neurologist Summary</h4>
                </div>
                <p className="text-xs text-[#40484d] dark:text-[#c0c7ce] leading-relaxed">
                  Telemetry data is prepared for Dr. Aris Thorne at GMCH Guwahati. All 7 recorded days maintain above the critical 70% threshold.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#e1e2e5] dark:border-[#282a2d] flex justify-between items-center text-xs">
                <span className="text-[#71787e]">HIPAA Cloud Sync:</span>
                <span className="font-bold text-emerald-600">Up to Date</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts & Sync Logs Subtab */}
      {activeSubTab === 'alerts' && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: High Priority & Hardware Alerts */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="font-bold text-2xl text-[#191c1e] dark:text-white">
              System & Clinical Alerts
            </h2>

            {alerts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1e2023] text-center shadow-neu-extruded">
                <span className="material-symbols-outlined text-emerald-500 text-[48px] mb-2">check_circle</span>
                <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0]">All Alerts Resolved</h3>
                <p className="text-sm text-[#71787e] mt-1">No active issues detected for {userProfile.name}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-3xl transition-all shadow-neu-extruded flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      alert.priority === 'high'
                        ? 'bg-white dark:bg-[#1e2023] border-l-4 border-[#ba1a1a]'
                        : 'bg-white dark:bg-[#1e2023] border-l-4 border-amber-500'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          alert.priority === 'high'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">
                          {alert.icon}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-[#191c1e] dark:text-white">
                            {alert.title}
                          </h3>
                          <span className="text-xs text-[#71787e]">
                            {alert.timeAgo}
                          </span>
                        </div>
                        <p className="text-sm text-[#40484d] dark:text-[#c0c7ce] mt-0.5">
                          {alert.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAlertAction(alert)}
                      className={`min-h-[44px] px-6 rounded-xl font-bold text-sm shrink-0 shadow-sm transition-transform hover:scale-105 ${
                        alert.priority === 'high'
                          ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                          : 'bg-[#003c53] text-white hover:bg-[#0b5471]'
                      }`}
                    >
                      {alert.actionText}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right 5 Cols: Sync Queue Timeline */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1e2023] rounded-3xl p-6 md:p-8 shadow-neu-extruded flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0]">
                  Cloud Sync Queue
                </h3>
                <p className="text-xs text-[#40484d] dark:text-[#c0c7ce]">
                  Local edge storage to HIPAA cloud
                </p>
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-[#003c53] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#0b5471] disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isSyncing ? 'Syncing...' : 'Force Sync Now'}</span>
              </button>
            </div>

            {syncSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e1e2e5] dark:before:bg-[#282a2d]">
              {syncLogs.map((log) => (
                <div key={log.id} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[12px] ring-4 ring-white dark:ring-[#1e2023] ${
                      log.status === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {log.status === 'synced' ? 'check' : 'schedule'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#191c1e] dark:text-white">
                      {log.title}
                    </h4>
                    <p className="text-xs text-[#40484d] dark:text-[#c0c7ce]">
                      {log.subtitle}
                    </p>
                    <span className="text-[11px] text-[#71787e] block mt-0.5">
                      {log.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clinical AI Subtab */}
      {activeSubTab === 'clinical-ai' && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded">
              <div className="flex items-center justify-between pb-4 border-b border-[#e1e2e5] dark:border-[#282a2d] mb-4">
                <div>
                  <h2 className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0]">
                    AI Neuro-Cognitive Clinical Assessment
                  </h2>
                  <p className="text-xs text-[#71787e]">
                    Powered by Gemini 3.8 Flash • Real-time EEG & adherence trends
                  </p>
                </div>
                <button
                  onClick={handleGenerateAiAssessment}
                  disabled={isGeneratingAi}
                  className="px-5 py-2.5 rounded-xl bg-[#003c53] text-white font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-[#0b5471] disabled:opacity-60"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isGeneratingAi ? 'animate-spin' : ''}`}>
                    {isGeneratingAi ? 'sync' : 'neurology'}
                  </span>
                  <span>{isGeneratingAi ? 'Analyzing...' : 'Generate New Assessment'}</span>
                </button>
              </div>

              {aiReport ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#abdefe]/20 dark:bg-[#104c67]/30 border border-[#003c53]/20">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-[#71787e]">
                        Overall Clinical Risk Index
                      </span>
                      <div className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0]">
                        {aiReport.riskLevel} Risk
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-white dark:bg-[#282a2d] font-semibold text-emerald-600">
                      Baseline Stable
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-[#191c1e] dark:text-white mb-2">
                      Clinical Summary
                    </h3>
                    <p className="text-base text-[#40484d] dark:text-[#c0c7ce] leading-relaxed">
                      {aiReport.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-[#191c1e] dark:text-white mb-2">
                      Recommended Caregiver Interventions
                    </h3>
                    <ul className="space-y-2">
                      {aiReport.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f2f4f6] dark:bg-[#282a2d] text-sm text-[#191c1e] dark:text-white"
                        >
                          <span className="material-symbols-outlined text-emerald-600 text-[18px] mt-0.5">
                            check_circle
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-[48px] text-[#003c53] dark:text-[#94cef0] mb-3">
                    psychology
                  </span>
                  <h3 className="font-bold text-xl text-[#191c1e] dark:text-white mb-2">
                    Generate Patient Clinical Summary
                  </h3>
                  <p className="text-sm text-[#71787e] max-w-md mx-auto mb-6">
                    Our AI model synthesizes brainwave alpha coherence, schedule compliance, and mood signals into an actionable report for caregivers.
                  </p>
                  <button
                    onClick={handleGenerateAiAssessment}
                    className="px-8 py-3.5 rounded-2xl bg-[#003c53] text-white font-bold text-base shadow-neu-extruded hover:scale-105 transition-all"
                  >
                    Run Clinical Evaluation
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-[#1e2023] rounded-3xl p-6 shadow-neu-extruded flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#003c53] dark:text-[#94cef0]">
              Patient Demographics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#e1e2e5] dark:border-[#282a2d] pb-2">
                <span className="text-[#71787e]">Primary Diagnosis:</span>
                <span className="font-semibold">Mild Cognitive Impairment (Early)</span>
              </div>
              <div className="flex justify-between border-b border-[#e1e2e5] dark:border-[#282a2d] pb-2">
                <span className="text-[#71787e]">Location:</span>
                <span className="font-semibold">Uzan Bazar, Guwahati</span>
              </div>
              <div className="flex justify-between border-b border-[#e1e2e5] dark:border-[#282a2d] pb-2">
                <span className="text-[#71787e]">Attending Neurologist:</span>
                <span className="font-semibold">Dr. Aris Thorne (GNRC)</span>
              </div>
              <div className="flex justify-between border-b border-[#e1e2e5] dark:border-[#282a2d] pb-2">
                <span className="text-[#71787e]">Emergency Services:</span>
                <span className="font-semibold">112 (Assam Police / EMS)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#191c1e] rounded-3xl p-6 shadow-2xl border border-[#c0c7ce]/30">
            <h3 className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0] mb-4">
              Add Medication to Arthur's Schedule
            </h3>
            <form onSubmit={handleAddMedicationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#71787e] uppercase mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memantine 10mg"
                  value={medTitle}
                  onChange={(e) => setMedTitle(e.target.value)}
                  className="w-full px-4 h-12 rounded-xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#71787e] uppercase mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    required
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full px-4 h-12 rounded-xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#71787e] uppercase mb-1">
                    Dosage Note
                  </label>
                  <input
                    type="text"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    className="w-full px-4 h-12 rounded-xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2e5] dark:border-[#282a2d]">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-[#71787e] font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#003c53] text-white font-bold text-sm shadow-md"
                >
                  Save & Push to Tablet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
