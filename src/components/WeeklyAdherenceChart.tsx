import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
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

interface AdherenceDayData {
  id: string;
  day: string;
  fullDate: string;
  medication: number; // percentage
  routine: number; // percentage
  overall: number; // percentage
  medicationTime: string;
  routineTasks: string;
  caregiverStatus: string;
}

const ADHERENCE_7_DAY_DATA: AdherenceDayData[] = [
  {
    id: 'adh-1',
    day: 'Tue',
    fullDate: 'Tuesday, Sep 1, 2026',
    medication: 100,
    routine: 80,
    overall: 90,
    medicationTime: '8:20 AM (Donepezil 5mg)',
    routineTasks: 'Morning Brahmaputra garden walk, hydration 1.5L',
    caregiverStatus: 'Verified by Sarah Miller',
  },
  {
    id: 'adh-2',
    day: 'Wed',
    fullDate: 'Wednesday, Sep 2, 2026',
    medication: 100,
    routine: 85,
    overall: 92,
    medicationTime: '8:10 AM (Donepezil 5mg)',
    routineTasks: 'Garden walk, afternoon tea listening session',
    caregiverStatus: 'Verified by Sarah Miller',
  },
  {
    id: 'adh-3',
    day: 'Thu',
    fullDate: 'Thursday, Sep 3, 2026',
    medication: 100,
    routine: 75,
    overall: 88,
    medicationTime: '8:30 AM (Donepezil 5mg)',
    routineTasks: 'Short walk, memory exercise Sparks completed',
    caregiverStatus: 'Verified by Sarah Miller',
  },
  {
    id: 'adh-4',
    day: 'Fri',
    fullDate: 'Friday, Sep 4, 2026',
    medication: 100,
    routine: 90,
    overall: 95,
    medicationTime: '8:15 AM (Donepezil 5mg)',
    routineTasks: 'Full garden circuit, family video call with Maya',
    caregiverStatus: 'Verified by Sarah Miller',
  },
  {
    id: 'adh-5',
    day: 'Sat',
    fullDate: 'Saturday, Sep 5, 2026',
    medication: 100,
    routine: 85,
    overall: 92,
    medicationTime: '8:15 AM (Donepezil 5mg)',
    routineTasks: 'Relaxed morning verandah time, audio puzzles',
    caregiverStatus: 'Verified by Sarah Miller',
  },
  {
    id: 'adh-6',
    day: 'Sun',
    fullDate: 'Sunday, Sep 6, 2026',
    medication: 100,
    routine: 95,
    overall: 97,
    medicationTime: '8:05 AM (Donepezil 5mg)',
    routineTasks: 'Family visit, full Brahmaputra walk, Word Sparks',
    caregiverStatus: 'Verified by Sarah Miller',
  },
  {
    id: 'adh-7',
    day: 'Today',
    fullDate: 'Today, Monday, Sep 7, 2026',
    medication: 100,
    routine: 85,
    overall: 92,
    medicationTime: '8:15 AM (Donepezil 5mg)',
    routineTasks: 'Brahmaputra walk completed, Faces challenge scored 85%',
    caregiverStatus: 'Active log • 14-day streak maintained',
  },
];

interface WeeklyAdherenceChartProps {
  patientName: string;
}

export const WeeklyAdherenceChart: React.FC<WeeklyAdherenceChartProps> = ({ patientName }) => {
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);

  // Custom detailed hover tooltip
  const CustomAdherenceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: AdherenceDayData = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-[#181a1d]/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-[#c0c7ce]/40 dark:border-white/10 text-xs min-w-[260px] max-w-[300px] pointer-events-none z-50">
          <div className="flex items-center justify-between border-b border-[#e1e2e5] dark:border-[#282a2d] pb-2 mb-2.5">
            <span className="font-bold text-sm text-[#191c1e] dark:text-white">
              {dataPoint.fullDate}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
              {dataPoint.overall}% Total
            </span>
          </div>

          <div className="space-y-2 mb-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Medication Adherence:
                </span>
                <span>{dataPoint.medication}%</span>
              </div>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                {dataPoint.medicationTime}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-500/20">
              <div className="flex items-center justify-between font-bold text-sky-700 dark:text-sky-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#003c53] dark:bg-[#38bdf8]"></span>
                  Routine Activities:
                </span>
                <span>{dataPoint.routine}%</span>
              </div>
              <p className="text-[10px] text-sky-800 dark:text-sky-300 mt-0.5">
                {dataPoint.routineTasks}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e1e2e5] dark:border-[#282a2d] text-[10px] text-[#71787e] dark:text-[#9aa2a9] flex items-center justify-between">
            <span>Log Status:</span>
            <span className="font-semibold text-emerald-600">{dataPoint.caregiverStatus}</span>
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
      className="p-6 rounded-3xl bg-white dark:bg-[#1e2023] shadow-neu-extruded flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-xl text-[#003c53] dark:text-[#94cef0] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            7-Day Routine & Med Adherence
          </h3>
          <p className="text-xs text-[#40484d] dark:text-[#c0c7ce]">
            Daily compliance comparison for {patientName}
          </p>
        </div>
        <button
          onClick={() => setAnimationKey((prev) => prev + 1)}
          className="p-1.5 rounded-lg bg-[#edeef0] dark:bg-[#282a2d] text-[#71787e] hover:text-[#003c53] dark:hover:text-[#94cef0] transition-all"
          title="Replay Entrance Animation"
        >
          <span className="material-symbols-outlined text-[16px]">replay</span>
        </button>
      </div>

      {/* Recharts Bar Chart with Entrance Animations & Hover Tooltips */}
      <div className="w-full h-48 select-none my-2">
        <ResponsiveContainer key={`adh-chart-${animationKey}`} width="100%" height="100%">
          <BarChart
            data={ADHERENCE_7_DAY_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                setHoveredDayId(state.activePayload[0].payload.id);
              }
            }}
            onMouseLeave={() => setHoveredDayId(null)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c0c7ce" strokeOpacity={0.25} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#c0c7ce', strokeOpacity: 0.4 }}
              tick={{ fill: '#71787e', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              domain={[60, 100]}
              ticks={[60, 80, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#71787e', fontSize: 10 }}
            />
            <ReferenceLine
              y={85}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Tooltip content={<CustomAdherenceTooltip />} cursor={{ fill: 'rgba(0, 60, 83, 0.05)' }} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 6, fontSize: 11, fontWeight: 600 }}
              formatter={(val) => (val === 'medication' ? 'Medication (%)' : 'Routine (%)')}
            />
            <Bar
              dataKey="medication"
              name="medication"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1300}
              animationEasing="ease-out"
              animationBegin={100}
            >
              {ADHERENCE_7_DAY_DATA.map((entry) => (
                <Cell
                  key={`med-${entry.id}`}
                  fill={entry.id === hoveredDayId ? '#059669' : '#10b981'}
                />
              ))}
            </Bar>
            <Bar
              dataKey="routine"
              name="routine"
              fill="#003c53"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1300}
              animationEasing="ease-out"
              animationBegin={220}
            >
              {ADHERENCE_7_DAY_DATA.map((entry) => (
                <Cell
                  key={`rtn-${entry.id}`}
                  fill={entry.id === hoveredDayId ? '#0284c7' : '#003c53'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-[#e1e2e5] dark:border-[#282a2d] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>14-day 100% medication streak</span>
        </div>
        <span className="text-[10px] text-[#71787e]">Target: ≥85% routine</span>
      </div>
    </motion.div>
  );
};
