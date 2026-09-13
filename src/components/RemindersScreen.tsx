import React, { useState } from 'react';
import { ReminderItem, UserProfile } from '../types';
import { speakText, playReminderChime } from '../utils/audio';

interface RemindersScreenProps {
  reminders: ReminderItem[];
  userProfile?: UserProfile;
  onUpdateReminderStatus: (id: string, newStatus: 'overdue' | 'completed' | 'upcoming') => void;
  onAddReminder: (reminder: ReminderItem) => void;
  onCallCare: () => void;
  onDeleteReminder?: (id: string) => void;
  onSnoozeReminder?: (id: string) => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders,
  userProfile,
  onUpdateReminderStatus,
  onAddReminder,
  onCallCare,
  onDeleteReminder,
  onSnoozeReminder,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'medication' | 'meal' | 'activity' | 'call'>('all');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('3:00 PM');
  const [newCategory, setNewCategory] = useState<'medication' | 'meal' | 'activity' | 'call'>('medication');
  const [newDose, setNewDose] = useState<string>('');
  const [newDetails, setNewDetails] = useState<string>('');

  const completedCount = reminders.filter((r) => r.status === 'completed').length;
  const totalCount = reminders.length;
  const percentage = Math.round((completedCount / (totalCount || 1)) * 100);

  const filteredReminders = reminders.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const handleAcknowledge = (item: ReminderItem) => {
    playReminderChime();
    onUpdateReminderStatus(item.id, 'completed');
    speakText(
      `Wonderful job! ${item.title} marked as completed.`,
      undefined,
      userProfile?.language,
      userProfile?.speechRate,
      userProfile?.speechPitch
    );
  };

  const handleSnooze = (item: ReminderItem) => {
    playReminderChime();
    if (onSnoozeReminder) {
      onSnoozeReminder(item.id);
    } else {
      onUpdateReminderStatus(item.id, 'upcoming');
    }
    speakText(
      `Snoozed ${item.title} for 15 minutes. Take your time.`,
      undefined,
      userProfile?.language,
      userProfile?.speechRate,
      userProfile?.speechPitch
    );
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      status: 'upcoming',
      dose: newDose.trim() || undefined,
      details: newDetails.trim() || undefined,
    };

    onAddReminder(newItem);
    setShowAddModal(false);
    setNewTitle('');
    setNewDose('');
    setNewDetails('');
    speakText(
      `Added reminder for ${newItem.title} at ${newItem.time}.`,
      undefined,
      userProfile?.language,
      userProfile?.speechRate,
      userProfile?.speechPitch
    );
  };

  const handleReadSchedule = () => {
    const overdue = reminders.filter((r) => r.status === 'overdue');
    const upcoming = reminders.filter((r) => r.status === 'upcoming');
    let msg = `You have completed ${completedCount} of ${totalCount} items today. `;
    if (overdue.length > 0) {
      msg += `You have an overdue item: ${overdue[0].title}. `;
    }
    if (upcoming.length > 0) {
      msg += `Next upcoming is ${upcoming[0].title} at ${upcoming[0].time}.`;
    }
    speakText(
      msg,
      undefined,
      userProfile?.language,
      userProfile?.speechRate,
      userProfile?.speechPitch
    );
  };

  // SVG circular arc calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] px-6 md:px-10 py-8 max-w-5xl mx-auto">
      {/* Background Weave Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-silk-pattern z-0"></div>

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-4xl md:text-5xl text-[#003c53] dark:text-[#94cef0] tracking-tight">
              Today's Schedule
            </h1>
            <button
              onClick={handleReadSchedule}
              title="Listen to schedule"
              className="w-10 h-10 rounded-full bg-[#edeef0] dark:bg-[#1e2023] shadow-neu-extruded flex items-center justify-center text-[#003c53] dark:text-[#94cef0] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>
          <p className="text-xl text-[#40484d] dark:text-[#c0c7ce] mt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#306480] dark:text-[#9bcded]">calendar_today</span>
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>

        {/* Progress & Add Action */}
        <div className="flex items-center gap-4">
          {/* Circular Progress Gauge */}
          <div className="flex items-center gap-4 bg-white dark:bg-[#1e2023] px-5 py-3 rounded-2xl shadow-neu-extruded">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-[#e1e2e5] dark:text-[#282a2d]"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-[#003c53] dark:text-[#94cef0] transition-all duration-700"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-bold text-sm text-[#191c1e] dark:text-white">
                {percentage}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#40484d] dark:text-[#c0c7ce] uppercase tracking-wider">
                Progress
              </span>
              <span className="text-sm font-semibold text-[#191c1e] dark:text-white">
                {completedCount} of {totalCount} completed
              </span>
            </div>
          </div>

          {/* Add Reminder Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-14 px-6 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-semibold text-base flex items-center gap-2 shadow-neu-extruded hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">add</span>
            <span className="hidden sm:inline">Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="relative z-10 flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {(
          [
            { id: 'all', label: 'All Tasks', icon: 'list_alt' },
            { id: 'medication', label: 'Medication', icon: 'medication' },
            { id: 'meal', label: 'Meals', icon: 'restaurant' },
            { id: 'activity', label: 'Activities', icon: 'directions_walk' },
            { id: 'call', label: 'Family Call', icon: 'videocam' },
          ] as const
        ).map((tab) => {
          const isSelected = selectedCategory === tab.id;
          const count =
            tab.id === 'all'
              ? reminders.length
              : reminders.filter((r) => r.category === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] shadow-md scale-102'
                  : 'bg-white dark:bg-[#1e2023] text-[#40484d] dark:text-[#c0c7ce] border border-[#c0c7ce]/40 hover:bg-[#edeef0]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected
                    ? 'bg-white/20 text-white dark:text-[#001e2c]'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reminders List */}
      <div className="relative z-10 flex flex-col gap-6 pb-24">
        {filteredReminders.map((item) => {
          const isOverdue = item.status === 'overdue';
          const isCompleted = item.status === 'completed';

          return (
            <div
              key={item.id}
              className={`rounded-3xl p-6 md:p-8 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                isCompleted
                  ? 'bg-[#f2f4f6] dark:bg-[#191c1e] shadow-neu-recessed opacity-75'
                  : isOverdue
                  ? 'bg-white dark:bg-[#1e2023] shadow-neu-extruded border-2 border-[#ba1a1a]/40'
                  : 'bg-white dark:bg-[#1e2023] shadow-neu-extruded'
              }`}
            >
              {/* Left Side Details */}
              <div className="flex items-start gap-5">
                {/* Category Icon Badge */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : isOverdue
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#abdefe] dark:bg-[#104c67] text-[#003c53] dark:text-[#94cef0]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isCompleted
                      ? 'check_circle'
                      : item.category === 'medication'
                      ? 'medication'
                      : item.category === 'meal'
                      ? 'restaurant'
                      : item.category === 'call'
                      ? 'videocam'
                      : 'directions_walk'}
                  </span>
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-2xl md:text-3xl text-[#191c1e] dark:text-white">
                      {item.time}
                    </span>

                    {isOverdue && (
                      <span className="px-3 py-1 rounded-full bg-[#ba1a1a] text-white font-bold text-xs uppercase tracking-wider animate-pulse">
                        OVERDUE
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold text-xs uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-bold text-xl md:text-2xl mt-1 ${
                      isCompleted
                        ? 'line-through text-[#71787e] dark:text-[#8b9298]'
                        : 'text-[#003c53] dark:text-[#94cef0]'
                    }`}
                  >
                    {item.title}
                  </h3>

                  {item.dose && (
                    <p className="text-base font-semibold text-[#306480] dark:text-[#9bcded]">
                      {item.dose}
                    </p>
                  )}

                  {item.details && (
                    <p className="text-base text-[#40484d] dark:text-[#c0c7ce] mt-0.5">
                      {item.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                {isOverdue && (
                  <>
                    <button
                      onClick={() => handleSnooze(item)}
                      className="min-h-[50px] px-5 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] font-semibold text-sm hover:bg-[#e1e2e5] transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[20px]">snooze</span>
                      <span>Snooze +15m</span>
                    </button>
                    <button
                      onClick={() => handleAcknowledge(item)}
                      className="min-h-[56px] px-8 rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-lg flex items-center gap-2 shadow-neu-extruded hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[24px]">check</span>
                      <span>Acknowledge</span>
                    </button>
                  </>
                )}

                {!isOverdue && !isCompleted && (
                  <>
                    <button
                      onClick={() => handleSnooze(item)}
                      className="min-h-[48px] px-4 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-[#71787e] hover:text-[#191c1e] text-xs font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">snooze</span>
                      <span>+15m</span>
                    </button>
                    <button
                      onClick={() => handleAcknowledge(item)}
                      className="min-h-[56px] px-8 rounded-2xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white font-semibold text-lg flex items-center gap-2 shadow-neu-extruded hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[24px]">check</span>
                      <span>Mark as Done</span>
                    </button>
                  </>
                )}

                {isCompleted && (
                  <button
                    onClick={() => onUpdateReminderStatus(item.id, 'upcoming')}
                    className="min-h-[48px] px-6 rounded-xl bg-transparent text-[#71787e] hover:text-[#191c1e] dark:hover:text-white font-medium text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    <span>Undo</span>
                  </button>
                )}

                {onDeleteReminder && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove reminder "${item.title}"?`)) {
                        onDeleteReminder(item.id);
                      }
                    }}
                    title="Delete reminder"
                    className="w-10 h-10 rounded-xl bg-transparent hover:bg-red-50 dark:hover:bg-red-950/30 text-[#71787e] hover:text-red-600 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Call Care Emergency Action */}
      <div className="fixed bottom-6 right-6 lg:right-10 z-40">
        <button
          onClick={onCallCare}
          className="px-6 py-4 rounded-full bg-[#003c53] hover:bg-[#0b5471] text-white font-bold text-lg flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[26px]">support_agent</span>
          <span>Call Care</span>
        </button>
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#f8f9fc] dark:bg-[#191c1e] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-white/60 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0]">
                Add New Reminder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-[#edeef0] dark:bg-[#282a2d] flex items-center justify-center text-[#71787e]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Reminder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Tea & Hydration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-5 h-12 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3:30 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-5 h-12 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 h-12 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                  >
                    <option value="medication">Medication</option>
                    <option value="meal">Meal</option>
                    <option value="activity">Activity</option>
                    <option value="call">Family Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Dosage / Portion Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 capsule with warm water"
                  value={newDose}
                  onChange={(e) => setNewDose(e.target.value)}
                  className="w-full px-5 h-12 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#40484d] dark:text-[#c0c7ce] mb-1.5">
                  Instructions / Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. In the kitchen cabinet, lower shelf"
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className="w-full px-5 h-12 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e1e2e5] dark:border-[#282a2d]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 rounded-2xl bg-[#edeef0] dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] font-semibold text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] font-bold text-base shadow-neu-extruded hover:scale-105 active:scale-95 transition-all"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
