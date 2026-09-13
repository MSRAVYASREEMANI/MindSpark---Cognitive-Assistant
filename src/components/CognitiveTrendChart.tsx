import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { CognitiveTrendDataPoint, EEGStatus } from '../types';
import { INITIAL_7_DAY_COGNITIVE_TREND } from '../data/mockData';

interface CognitiveTrendChartProps {
  patientName: string;
  eegStatus: EEGStatus;
  initialTrendData?: CognitiveTrendDataPoint[];
  overlayPrevWeek?: boolean;
  onToggleOverlayPrevWeek?: (enabled: boolean) => void;
}

type ViewMode = 'both' | 'cognitive' | 'eeg';
type ChartStyle = 'area' | 'bar';

// Custom animated pulsing dot for hovered data point
const CustomPulsingDot = (props: any) => {
  const { cx, cy, fill, stroke } = props;
  if (!cx || !cy) return null;
  const activeColor = fill || stroke || '#003c53';
  return (
    <g>
      {/* Outer pulsing ring */}
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill={activeColor}
        fillOpacity={0.25}
        className="animate-ping origin-center"
      />
      {/* Steady glow disc */}
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={activeColor}
        stroke="#ffffff"
        strokeWidth={2.5}
        className="filter drop-shadow-md"
      />
      {/* Inner highlight core */}
      <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" />
    </g>
  );
};

export const CognitiveTrendChart: React.FC<CognitiveTrendChartProps> = ({
  patientName,
  eegStatus,
  initialTrendData = INITIAL_7_DAY_COGNITIVE_TREND,
  overlayPrevWeek: controlledOverlay,
  onToggleOverlayPrevWeek,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [internalOverlay, setInternalOverlay] = useState<boolean>(false);

  // Controlled or uncontrolled overlay toggle state
  const isOverlayActive = controlledOverlay !== undefined ? controlledOverlay : internalOverlay;

  const handleToggleOverlay = () => {
    const nextVal = !isOverlayActive;
    if (onToggleOverlayPrevWeek) {
      onToggleOverlayPrevWeek(nextVal);
    }
    setInternalOverlay(nextVal);
    setAnimationKey((prev) => prev + 1);
  };

  // Dynamically update Today's focus level based on live eegStatus
  const trendData = useMemo(() => {
    return initialTrendData.map((item) => {
      if (item.day === 'Today' && eegStatus.focusLevel) {
        return {
          ...item,
          eegFocus: eegStatus.focusLevel,
        };
      }
      return item;
    });
  }, [initialTrendData, eegStatus.focusLevel]);

  // Summary statistics for 7-day window & previous week baseline comparisons
  const stats = useMemo(() => {
    const avgCognitive = Math.round(
      trendData.reduce((acc, curr) => acc + curr.cognitiveScore, 0) / trendData.length
    );
    const avgEeg = Math.round(
      trendData.reduce((acc, curr) => acc + curr.eegFocus, 0) / trendData.length
    );
    const prevWeekAvgEeg = Math.round(
      trendData.reduce((acc, curr) => acc + (curr.prevWeekEegFocus ?? 72), 0) / trendData.length
    );
    const prevWeekAvgCognitive = Math.round(
      trendData.reduce((acc, curr) => acc + (curr.prevWeekCognitiveScore ?? 78), 0) / trendData.length
    );
    const totalTests = trendData.reduce((acc, curr) => acc + curr.testsCompleted, 0);
    const peakCognitive = Math.max(...trendData.map((d) => d.cognitiveScore));
    const peakDay = trendData.find((d) => d.cognitiveScore === peakCognitive)?.day || 'Sun';

    // Longitudinal delta calculations
    const eegDeltaVsPrevWeek = avgEeg - prevWeekAvgEeg;
    const currentSession = trendData.find((d) => d.day === 'Today') || trendData[trendData.length - 1];
    const currentSessionEeg = currentSession.eegFocus;
    const currentSessionPrevWeekEeg = currentSession.prevWeekEegFocus ?? 74;
    const currentSessionDelta = currentSessionEeg - currentSessionPrevWeekEeg;

    return {
      avgCognitive,
      avgEeg,
      prevWeekAvgEeg,
      prevWeekAvgCognitive,
      eegDeltaVsPrevWeek,
      currentSessionEeg,
      currentSessionPrevWeekEeg,
      currentSessionDelta,
      totalTests,
      peakCognitive,
      peakDay,
    };
  }, [trendData]);

  // Selected or currently hovered day data for detail card
  const activeDayData = useMemo(() => {
    const targetId = hoveredDayId || selectedDayId;
    if (!targetId) return trendData[trendData.length - 1];
    return trendData.find((d) => d.id === targetId) || trendData[trendData.length - 1];
  }, [hoveredDayId, selectedDayId, trendData]);

  // Trigger smooth entrance animation replay
  const handleReplayAnimation = () => {
    setAnimationKey((prev) => prev + 1);
  };

  // Comprehensive custom hover tooltip with detailed values
  const CustomDetailedTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: CognitiveTrendDataPoint = payload[0].payload;
      const diffFromCognitiveAvg = dataPoint.cognitiveScore - stats.avgCognitive;
      const diffFromEegAvg = dataPoint.eegFocus - stats.avgEeg;
      const scoreVsFocusRatio = (dataPoint.cognitiveScore / (dataPoint.eegFocus || 1)).toFixed(2);

      // Score status badge
      let scoreBadge = { label: 'Optimal Coherence', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
      if (dataPoint.cognitiveScore < 75) {
        scoreBadge = { label: 'Baseline Target', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
      } else if (dataPoint.cognitiveScore < 85) {
        scoreBadge = { label: 'Strong Stability', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' };
      }

      return (
        <div className="bg-white/95 dark:bg-[#181a1d]/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-[#c0c7ce]/40 dark:border-white/10 text-xs min-w-[270px] max-w-[320px] transition-all animate-fade-in pointer-events-none z-50">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-[#e1e2e5] dark:border-[#282a2d] pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#003c53] dark:text-[#94cef0]">
                  calendar_today
                </span>
                <span className="font-bold text-sm text-[#191c1e] dark:text-white">
                  {dataPoint.fullDate}
                </span>
              </div>
              <span className="text-[10px] text-[#71787e] dark:text-[#9aa2a9]">
                {dataPoint.day === 'Today' ? 'Live Telemetry Session' : 'Recorded Clinical Baseline'}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scoreBadge.color}`}>
              {scoreBadge.label}
            </span>
          </div>

          {/* Detailed Metric 1: Cognitive Score */}
          {(viewMode === 'both' || viewMode === 'cognitive') && (
            <div className="p-2.5 rounded-xl bg-[#003c53]/5 dark:bg-[#38bdf8]/10 border border-[#003c53]/15 dark:border-[#38bdf8]/20 mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003c53] dark:bg-[#38bdf8]"></span>
                  <span className="font-bold text-[#003c53] dark:text-[#38bdf8]">
                    Cognitive Test Score
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-base text-[#003c53] dark:text-[#38bdf8]">
                    {dataPoint.cognitiveScore}%
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      diffFromCognitiveAvg >= 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    ({diffFromCognitiveAvg >= 0 ? `+${diffFromCognitiveAvg}%` : `${diffFromCognitiveAvg}%`} vs avg)
                  </span>
                </div>
              </div>
              {/* Mini visual gauge bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#003c53] dark:bg-[#38bdf8] h-full rounded-full transition-all duration-300"
                  style={{ width: `${dataPoint.cognitiveScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#71787e] mt-1 font-medium">
                <span>Target: 70%</span>
                <span>Max: 100%</span>
              </div>
            </div>
          )}

          {/* Detailed Metric 2: EEG Focus */}
          {(viewMode === 'both' || viewMode === 'eeg') && (
            <div className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-400/10 border border-amber-500/15 dark:border-amber-400/20 mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                  <span className="font-bold text-[#f59e0b]">EEG Focus Level</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-base text-[#f59e0b]">
                    {dataPoint.eegFocus}%
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      diffFromEegAvg >= 0 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    ({diffFromEegAvg >= 0 ? `+${diffFromEegAvg}%` : `${diffFromEegAvg}%`} vs avg)
                  </span>
                </div>
              </div>
              {/* Mini visual gauge bar */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#f59e0b] h-full rounded-full transition-all duration-300"
                  style={{ width: `${dataPoint.eegFocus}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#71787e] mt-1 font-medium">
                <span>Band: Frontal Alpha (8–12 Hz)</span>
                <span>Signal: 0.8 kΩ</span>
              </div>
            </div>
          )}

          {/* Detailed Metric 3: Previous Week EEG Baseline Overlay (When Active) */}
          {isOverlayActive && (
            <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/25 dark:border-purple-500/30 mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                  <span className="font-bold text-purple-800 dark:text-purple-300">
                    Prev Week EEG Baseline
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-base text-purple-700 dark:text-purple-300">
                    {dataPoint.prevWeekEegFocus ?? 72}%
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      dataPoint.eegFocus - (dataPoint.prevWeekEegFocus ?? 72) >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600'
                    }`}
                  >
                    ({dataPoint.eegFocus - (dataPoint.prevWeekEegFocus ?? 72) >= 0 ? '+' : ''}
                    {dataPoint.eegFocus - (dataPoint.prevWeekEegFocus ?? 72)}% vs prev week)
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#8b5cf6] h-full rounded-full transition-all duration-300"
                  style={{ width: `${dataPoint.prevWeekEegFocus ?? 72}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-purple-700/80 dark:text-purple-300/80 mt-1 font-medium">
                <span>Prev 7-Day Average: {stats.prevWeekAvgEeg}%</span>
                <span>Delta vs Mean: {dataPoint.eegFocus - stats.prevWeekAvgEeg >= 0 ? `+${dataPoint.eegFocus - stats.prevWeekAvgEeg}%` : `${dataPoint.eegFocus - stats.prevWeekAvgEeg}%`}</span>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-purple-200/50 dark:border-purple-800/40 flex items-center gap-1 text-[9.5px] text-purple-900 dark:text-purple-200 font-medium">
                <span className="material-symbols-outlined text-[13px] text-purple-600 dark:text-purple-400 shrink-0">
                  trending_up
                </span>
                <span>
                  Cognitive State:{' '}
                  {dataPoint.eegFocus - (dataPoint.prevWeekEegFocus ?? 72) >= 5
                    ? 'Marked improvement in sustained focus stability'
                    : dataPoint.eegFocus - (dataPoint.prevWeekEegFocus ?? 72) >= 0
                    ? 'Stable alpha wave coherence with reduced cognitive fatigue'
                    : 'Transient fatigue observed vs prior week'}
                </span>
              </div>
            </div>
          )}

          {/* Session Details & Observation */}
          <div className="pt-2 border-t border-[#e1e2e5] dark:border-[#282a2d] space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-[#40484d] dark:text-[#c0c7ce]">
              <span className="text-[#71787e] dark:text-[#9aa2a9]">Primary Exercise:</span>
              <span className="font-bold text-[#191c1e] dark:text-white">
                {dataPoint.primaryExercise}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#40484d] dark:text-[#c0c7ce]">
              <span className="text-[#71787e] dark:text-[#9aa2a9]">Completed Trials:</span>
              <span className="font-semibold text-emerald-600">
                {dataPoint.testsCompleted} test sessions
              </span>
            </div>
            <div className="flex justify-between items-center text-[#40484d] dark:text-[#c0c7ce]">
              <span className="text-[#71787e] dark:text-[#9aa2a9]">Neuro Ratio:</span>
              <span className="font-medium text-[#71787e]">
                {scoreVsFocusRatio}x (Score/Focus)
              </span>
            </div>

            <div className="mt-2 p-2 rounded-lg bg-[#f2f4f8] dark:bg-[#282a2d]/60 text-[10px] text-[#40484d] dark:text-[#c0c7ce] italic leading-snug">
              "{dataPoint.clinicalNote}"
            </div>
          </div>

          <div className="mt-2 text-[9px] text-center text-[#71787e] font-semibold flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[13px]">touch_app</span>
            <span>Click chart point or day pill to lock details</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col gap-6"
    >
      {/* Header with Title, Mode Controls & Replay Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003c53] dark:text-[#94cef0] text-[26px]">
              insights
            </span>
            <h3 className="font-bold text-xl md:text-2xl text-[#003c53] dark:text-[#94cef0]">
              7-Day Cognitive & EEG Telemetry Trend
            </h3>
          </div>
          <p className="text-xs md:text-sm text-[#40484d] dark:text-[#c0c7ce] mt-0.5">
            Interactive longitudinal tracking of memory scores and frontal alpha/theta focus index for {patientName}.
          </p>
        </div>

        {/* Toolbar: Chart Style Switcher, Metric Filter & Replay Button */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Chart Style Switcher */}
          <div className="flex bg-[#edeef0] dark:bg-[#282a2d] p-1 rounded-xl">
            <button
              id="chart-style-area-btn"
              onClick={() => {
                setChartStyle('area');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                chartStyle === 'area'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
              title="Area Curve Graph with Gradients"
            >
              <span className="material-symbols-outlined text-[16px]">area_chart</span>
              <span>Curves</span>
            </button>
            <button
              id="chart-style-bar-btn"
              onClick={() => {
                setChartStyle('bar');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                chartStyle === 'bar'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
              title="Side-by-side Comparative Bars"
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span>Bars</span>
            </button>
          </div>

          {/* Metric Filter Toggle */}
          <div className="flex bg-[#edeef0] dark:bg-[#282a2d] p-1 rounded-xl">
            <button
              id="filter-both-metrics-btn"
              onClick={() => {
                setViewMode('both');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'both'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              id="filter-cognitive-metrics-btn"
              onClick={() => {
                setViewMode('cognitive');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cognitive'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#38bdf8] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
            >
              Cognitive
            </button>
            <button
              id="filter-eeg-metrics-btn"
              onClick={() => {
                setViewMode('eeg');
                setAnimationKey((prev) => prev + 1);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'eeg'
                  ? 'bg-white dark:bg-[#1e2023] text-[#f59e0b] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
            >
              EEG Focus
            </button>
          </div>

          {/* Overlay Previous Week EEG Average Toggle Switch */}
          <button
            id="toggle-overlay-prev-week-btn"
            onClick={handleToggleOverlay}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
              isOverlayActive
                ? 'bg-purple-600 text-white border-purple-600 shadow-purple-500/25 ring-2 ring-purple-400/30'
                : 'bg-white dark:bg-[#282a2d] text-[#40484d] dark:text-[#c0c7ce] border-[#c0c7ce]/50 hover:bg-[#edeef0] dark:hover:bg-[#34373b]'
            }`}
            title="Overlay previous week's average EEG session data to highlight cognitive trends"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isOverlayActive ? 'layers' : 'layers_clear'}
            </span>
            <span>Overlay Prev Week</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold transition-colors ${
                isOverlayActive
                  ? 'bg-white/25 text-white'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
              }`}
            >
              {isOverlayActive ? `ON (${stats.prevWeekAvgEeg}% Avg)` : 'OFF'}
            </span>
          </button>

          {/* Replay Entrance Animation Button */}
          <button
            id="replay-entrance-animation-btn"
            onClick={handleReplayAnimation}
            className="p-2 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-[#71787e] hover:text-[#003c53] dark:hover:text-[#94cef0] hover:bg-[#e1e2e5] transition-all"
            title="Replay Entrance Animation"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#e1e2e5] dark:border-white/5 transition-all"
        >
          <span className="text-[11px] font-semibold text-[#71787e] dark:text-[#9aa2a9] block uppercase tracking-wider">
            7-Day Avg Score
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-bold text-2xl text-[#003c53] dark:text-[#38bdf8]">
              {stats.avgCognitive}%
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              +5% <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            </span>
          </div>
          <span className="text-[10px] text-[#71787e] mt-0.5 block">Above 70% threshold</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className={`p-3.5 rounded-2xl border transition-all ${
            isOverlayActive
              ? 'bg-purple-50/70 dark:bg-purple-950/20 border-purple-400/40 dark:border-purple-500/30 shadow-sm'
              : 'bg-[#f8f9fc] dark:bg-[#282a2d] border-[#e1e2e5] dark:border-white/5'
          }`}
        >
          <span className="text-[11px] font-semibold text-[#71787e] dark:text-[#9aa2a9] block uppercase tracking-wider">
            {isOverlayActive ? 'EEG Focus vs Prev Week' : '7-Day Avg Focus'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-bold text-2xl text-[#f59e0b]">
              {stats.avgEeg}%
            </span>
            {isOverlayActive ? (
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center">
                vs {stats.prevWeekAvgEeg}% ({stats.eegDeltaVsPrevWeek >= 0 ? `+${stats.eegDeltaVsPrevWeek}%` : `${stats.eegDeltaVsPrevWeek}%`})
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                Stable
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#71787e] mt-0.5 block">
            {isOverlayActive
              ? `+${stats.eegDeltaVsPrevWeek}% cognitive stability gain`
              : 'Frontal alpha band'}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#e1e2e5] dark:border-white/5 transition-all"
        >
          <span className="text-[11px] font-semibold text-[#71787e] dark:text-[#9aa2a9] block uppercase tracking-wider">
            Peak Performance
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-bold text-2xl text-[#191c1e] dark:text-white">
              {stats.peakCognitive}%
            </span>
            <span className="text-xs font-semibold text-[#71787e]">
              ({stats.peakDay})
            </span>
          </div>
          <span className="text-[10px] text-[#71787e] mt-0.5 block">Faces & Word Sparks</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-[#282a2d] border border-[#e1e2e5] dark:border-white/5 transition-all"
        >
          <span className="text-[11px] font-semibold text-[#71787e] dark:text-[#9aa2a9] block uppercase tracking-wider">
            Exercises Logged
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-bold text-2xl text-[#191c1e] dark:text-white">
              {stats.totalTests}
            </span>
            <span className="text-xs font-semibold text-[#71787e]">sessions</span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">100% adherence</span>
        </motion.div>
      </div>

      {/* Cognitive State Trend Callout Banner (When Overlay Active) */}
      <AnimatePresence>
        {isOverlayActive && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-purple-300/70 dark:border-purple-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-md shadow-purple-500/25">
                  <span className="material-symbols-outlined text-[22px]">psychology_alt</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-purple-950 dark:text-purple-100">
                      Cognitive State Trajectory: Sustained Positive Shift
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      +{stats.eegDeltaVsPrevWeek}.0% 7-Day Focus Shift
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
                      Current Session: {stats.currentSessionEeg}% vs {stats.currentSessionPrevWeekEeg}% (+{stats.currentSessionDelta}%)
                    </span>
                  </div>
                  <p className="text-xs text-purple-900/85 dark:text-purple-200/85 leading-relaxed">
                    Overlaying current telemetry with the previous week's 7-day average ({stats.prevWeekAvgEeg}%) highlights consistent elevation in frontal alpha rhythms (8–12 Hz) during morning recall exercises. The theta/beta fatigue ratio is reduced by 14%, indicating improved mental stamina and lower cognitive distress for {patientName}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 self-end md:self-auto border-t md:border-t-0 md:border-l border-purple-200 dark:border-purple-800/60 pt-2 md:pt-0 md:pl-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">
                    Telemetry Gain
                  </span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
                    +{stats.eegDeltaVsPrevWeek}.0%
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    Above Last Week
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Recharts Graph with Animated Entrance & Detailed Hover Tooltips */}
      <div className="w-full h-72 sm:h-84 select-none relative">
        <ResponsiveContainer
          key={`chart-container-${animationKey}-${chartStyle}-${viewMode}`}
          width="100%"
          height="100%"
        >
          {chartStyle === 'area' ? (
            <AreaChart
              data={trendData}
              margin={{ top: 18, right: 15, left: -15, bottom: 5 }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredDayId(state.activePayload[0].payload.id);
                }
              }}
              onMouseLeave={() => setHoveredDayId(null)}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedDayId(e.activePayload[0].payload.id);
                }
              }}
            >
              <defs>
                {/* Gradient for Cognitive Score */}
                <linearGradient id="cognitiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#003c53" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#003c53" stopOpacity={0.0} />
                </linearGradient>
                {/* Gradient for EEG Focus */}
                <linearGradient id="eegGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                {/* Gradient for Previous Week EEG Baseline */}
                <linearGradient id="prevWeekGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#c0c7ce"
                strokeOpacity={0.35}
              />

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#c0c7ce', strokeOpacity: 0.4 }}
                tick={{ fill: '#71787e', fontSize: 12, fontWeight: 600 }}
                dy={8}
              />

              <YAxis
                domain={[50, 100]}
                ticks={[50, 60, 70, 80, 90, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#71787e', fontSize: 11 }}
              />

              {/* Target Baseline Reference Line */}
              <ReferenceLine
                y={70}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Clinical Target (≥70%)',
                  fill: '#10b981',
                  fontSize: 10,
                  fontWeight: 700,
                  position: 'insideTopLeft',
                }}
              />

              {/* Previous Week 7-Day Average Reference Line (When Overlay Active) */}
              {isOverlayActive && (
                <ReferenceLine
                  y={stats.prevWeekAvgEeg}
                  stroke="#8b5cf6"
                  strokeDasharray="5 3"
                  strokeWidth={1.8}
                  label={{
                    value: `Prev Week EEG Avg (${stats.prevWeekAvgEeg}%)`,
                    fill: '#8b5cf6',
                    fontSize: 10,
                    fontWeight: 700,
                    position: 'insideBottomRight',
                  }}
                />
              )}

              {/* Hover Cursor & Detailed Tooltip */}
              <Tooltip
                content={<CustomDetailedTooltip />}
                cursor={{ stroke: '#003c53', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'cognitiveScore') return 'Cognitive Test Score (%)';
                  if (value === 'eegFocus') return 'Current EEG Focus (%)';
                  if (value === 'prevWeekEegFocus') return `Prev Week EEG Focus (Avg ${stats.prevWeekAvgEeg}%)`;
                  return value;
                }}
              />

              {/* Cognitive Score Area with Entrance Animation & Custom Pulsing Active Dot */}
              {(viewMode === 'both' || viewMode === 'cognitive') && (
                <Area
                  type="monotone"
                  dataKey="cognitiveScore"
                  name="cognitiveScore"
                  stroke="#003c53"
                  strokeWidth={3}
                  fill="url(#cognitiveGradient)"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={120}
                  activeDot={<CustomPulsingDot />}
                  dot={{ r: 4.5, fill: '#003c53', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {/* EEG Focus Level Area with Entrance Animation & Custom Pulsing Active Dot */}
              {(viewMode === 'both' || viewMode === 'eeg') && (
                <Area
                  type="monotone"
                  dataKey="eegFocus"
                  name="eegFocus"
                  stroke="#f59e0b"
                  strokeWidth={2.8}
                  fill="url(#eegGradient)"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={240}
                  activeDot={<CustomPulsingDot />}
                  dot={{ r: 4.5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {/* Previous Week EEG Overlay Area (Dashed with Soft Purple Theme) */}
              {isOverlayActive && (
                <Area
                  type="monotone"
                  dataKey="prevWeekEegFocus"
                  name="prevWeekEegFocus"
                  stroke="#8b5cf6"
                  strokeWidth={2.4}
                  strokeDasharray="5 5"
                  fill="url(#prevWeekGradient)"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  animationBegin={300}
                  dot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1.8 }}
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={trendData}
              margin={{ top: 18, right: 15, left: -15, bottom: 5 }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredDayId(state.activePayload[0].payload.id);
                }
              }}
              onMouseLeave={() => setHoveredDayId(null)}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedDayId(e.activePayload[0].payload.id);
                }
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#c0c7ce"
                strokeOpacity={0.35}
              />

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#c0c7ce', strokeOpacity: 0.4 }}
                tick={{ fill: '#71787e', fontSize: 12, fontWeight: 600 }}
                dy={8}
              />

              <YAxis
                domain={[50, 100]}
                ticks={[50, 60, 70, 80, 90, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                tick={{ fill: '#71787e', fontSize: 11 }}
              />

              <ReferenceLine
                y={70}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Clinical Target (≥70%)',
                  fill: '#10b981',
                  fontSize: 10,
                  fontWeight: 700,
                  position: 'insideTopLeft',
                }}
              />

              {/* Previous Week 7-Day Average Reference Line in Bar View */}
              {isOverlayActive && (
                <ReferenceLine
                  y={stats.prevWeekAvgEeg}
                  stroke="#8b5cf6"
                  strokeDasharray="5 3"
                  strokeWidth={1.8}
                  label={{
                    value: `Prev Week EEG Avg (${stats.prevWeekAvgEeg}%)`,
                    fill: '#8b5cf6',
                    fontSize: 10,
                    fontWeight: 700,
                    position: 'insideBottomRight',
                  }}
                />
              )}

              <Tooltip
                content={<CustomDetailedTooltip />}
                cursor={{ fill: 'rgba(0, 60, 83, 0.06)' }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
                formatter={(value) => {
                  if (value === 'cognitiveScore') return 'Cognitive Test Score (%)';
                  if (value === 'eegFocus') return 'Current EEG Focus (%)';
                  if (value === 'prevWeekEegFocus') return `Prev Week EEG Focus (Avg ${stats.prevWeekAvgEeg}%)`;
                  return value;
                }}
              />

              {/* Cognitive Score Bar with Entrance Animation */}
              {(viewMode === 'both' || viewMode === 'cognitive') && (
                <Bar
                  dataKey="cognitiveScore"
                  name="cognitiveScore"
                  fill="#003c53"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1300}
                  animationEasing="ease-out"
                  animationBegin={100}
                >
                  {trendData.map((entry) => (
                    <Cell
                      key={`cell-cog-${entry.id}`}
                      fill={entry.id === (hoveredDayId || selectedDayId) ? '#0b5471' : '#003c53'}
                    />
                  ))}
                </Bar>
              )}

              {/* EEG Focus Level Bar with Entrance Animation */}
              {(viewMode === 'both' || viewMode === 'eeg') && (
                <Bar
                  dataKey="eegFocus"
                  name="eegFocus"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1300}
                  animationEasing="ease-out"
                  animationBegin={220}
                >
                  {trendData.map((entry) => (
                    <Cell
                      key={`cell-eeg-${entry.id}`}
                      fill={entry.id === (hoveredDayId || selectedDayId) ? '#fbbf24' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              )}

              {/* Previous Week EEG Overlay Bar (When Active) */}
              {isOverlayActive && (
                <Bar
                  dataKey="prevWeekEegFocus"
                  name="prevWeekEegFocus"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1300}
                  animationEasing="ease-out"
                  animationBegin={260}
                >
                  {trendData.map((entry) => (
                    <Cell
                      key={`cell-prev-${entry.id}`}
                      fill={entry.id === (hoveredDayId || selectedDayId) ? '#7c3aed' : '#a78bfa'}
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 7-Day Day Pills & Synchronized Interactive Hover Details */}
      <div className="pt-3 border-t border-[#e1e2e5] dark:border-[#282a2d] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#71787e] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            Daily Breakdown (Hover or click to inspect)
          </span>
          <span className="text-xs text-[#003c53] dark:text-[#94cef0] font-semibold">
            {activeDayData.fullDate}
          </span>
        </div>

        {/* Day selector pills with synced hover states */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {trendData.map((d) => {
            const isSelected = activeDayData.id === d.id;
            const isHovered = hoveredDayId === d.id;
            return (
              <button
                key={d.id}
                onMouseEnter={() => setHoveredDayId(d.id)}
                onMouseLeave={() => setHoveredDayId(null)}
                onClick={() => setSelectedDayId(d.id)}
                className={`p-2 rounded-xl text-center transition-all border ${
                  isSelected
                    ? 'bg-[#003c53] text-white border-[#003c53] shadow-md scale-102 ring-2 ring-[#003c53]/40'
                    : isHovered
                    ? 'bg-[#abdefe]/25 dark:bg-[#104c67]/40 border-[#003c53] text-[#003c53] dark:text-[#94cef0]'
                    : 'bg-[#f8f9fc] dark:bg-[#282a2d] hover:bg-[#edeef0] dark:hover:bg-[#34373b] border-[#e1e2e5]/70 dark:border-white/5 text-[#191c1e] dark:text-white'
                }`}
              >
                <span
                  className={`block text-[10px] font-bold ${
                    isSelected ? 'text-white/80' : 'text-[#71787e]'
                  }`}
                >
                  {d.day}
                </span>
                <span className="block text-xs sm:text-sm font-extrabold mt-0.5">
                  {d.cognitiveScore}%
                </span>
                <span
                  className={`block text-[9px] font-medium ${
                    isSelected ? 'text-amber-300' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {d.eegFocus}% EEG
                </span>
                {isOverlayActive && (
                  <span
                    className={`block text-[8.5px] font-bold mt-0.5 ${
                      isSelected
                        ? 'text-purple-200'
                        : d.eegFocus - (d.prevWeekEegFocus ?? 72) >= 0
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-amber-600'
                    }`}
                  >
                    vs {d.prevWeekEegFocus ?? 72}% ({d.eegFocus - (d.prevWeekEegFocus ?? 72) >= 0 ? '+' : ''}{d.eegFocus - (d.prevWeekEegFocus ?? 72)}%)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Inspection Card for Active Selected/Hovered Day */}
        <div className="p-4 rounded-2xl bg-[#f2f4f8] dark:bg-[#23262a] border border-[#c0c7ce]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#003c53] dark:text-[#94cef0]">
                {activeDayData.fullDate}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                {activeDayData.cognitiveScore >= 80 ? 'Optimal Coherence' : 'Above Baseline'}
              </span>
              <span className="text-[11px] text-[#71787e]">
                • Resting HR: 72 bpm
              </span>
            </div>
            <p className="text-xs text-[#40484d] dark:text-[#c0c7ce]">
              <strong>Primary Exercise:</strong> {activeDayData.primaryExercise} •{' '}
              <strong>Tests Completed:</strong> {activeDayData.testsCompleted} sessions
            </p>
            <p className="text-xs text-[#71787e] dark:text-[#9aa2a9] italic">
              <strong>Clinical Observation:</strong> "{activeDayData.clinicalNote}"
            </p>

            {/* Previous Week Day Comparison Line */}
            {isOverlayActive && (
              <div className="mt-2 pt-2 border-t border-[#c0c7ce]/30 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">layers</span>
                  Previous Week Baseline ({activeDayData.day}):
                </span>
                <span className="text-[#40484d] dark:text-[#c0c7ce]">
                  Prior Session EEG: <strong>{activeDayData.prevWeekEegFocus ?? 72}%</strong>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Trend Shift: {activeDayData.eegFocus - (activeDayData.prevWeekEegFocus ?? 72) >= 0 ? '+' : ''}
                  {activeDayData.eegFocus - (activeDayData.prevWeekEegFocus ?? 72)}% vs prior week session
                </span>
                <span className="text-[#71787e] text-[11px]">
                  (7-Day Prev Mean: {stats.prevWeekAvgEeg}%)
                </span>
              </div>
            )}
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-[#c0c7ce]/30 pt-2 sm:pt-0 sm:pl-4">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#71787e] block uppercase font-bold tracking-wider">
                Cognitive / EEG
              </span>
              <span className="text-xl font-black text-[#003c53] dark:text-[#94cef0]">
                {activeDayData.cognitiveScore}%{' '}
                <span className="text-sm font-semibold text-amber-500">
                  / {activeDayData.eegFocus}%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Neuro-Clinical Correlation Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px] shrink-0 mt-0.5">
            insights
          </span>
          <p className="leading-relaxed">
            <strong>Clinical Correlation Note:</strong> A strong positive correlation (+0.84) exists between {patientName}'s morning EEG alpha focus levels and higher recall scores in the Faces & Word exercises. Maintaining calming morning routines in Guwahati significantly stabilizes cognitive baselines.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
