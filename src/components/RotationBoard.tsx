import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Baby, 
  HeartPulse, 
  Eye, 
  Ear, 
  Ambulance, 
  Smile, 
  Heart, 
  Waves, 
  Sparkles, 
  ShieldAlert, 
  Skull, 
  Mountain, 
  Crown,
  Calendar,
  Trophy,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Upload,
  ChevronRight,
  User,
  Venus,
  AudioLines,
  CloudLightning,
  Map
} from 'lucide-react';
import { Student, DEPARTMENTS, MONTH_NAMES, ClockMode } from '../types';

// Helper to map department icons
const getDeptIcon = (iconName: string) => {
  switch (iconName) {
    case 'Activity': return <Activity className="h-5 w-5" />;
    case 'Brain': return <Brain className="h-5 w-5" />;
    case 'Baby': return <Baby className="h-5 w-5" />;
    case 'HeartPulse': return <HeartPulse className="h-5 w-5" />;
    case 'Eye': return <Eye className="h-5 w-5" />;
    case 'Ear': return <Ear className="h-5 w-5" />;
    case 'Ambulance': return <Ambulance className="h-5 w-5" />;
    case 'Smile': return <Smile className="h-5 w-5" />;
    case 'Heart': return <Heart className="h-5 w-5" />;
    case 'Waves': return <Waves className="h-5 w-5" />;
    case 'Sparkles': return <Sparkles className="h-5 w-5" />;
    case 'ShieldAlert': return <ShieldAlert className="h-5 w-5" />;
    case 'Skull': return <Skull className="h-5 w-5" />;
    case 'Mountain': return <Mountain className="h-5 w-5" />;
    case 'Crown': return <Crown className="h-5 w-5" />;
    case 'User': return <User className="h-5 w-5" />;
    case 'Venus': return <Venus className="h-5 w-5" />;
    case 'AudioLines': return <AudioLines className="h-5 w-5" />;
    case 'CloudLightning': return <CloudLightning className="h-5 w-5" />;
    case 'Calendar': return <Calendar className="h-5 w-5" />;
    case 'Clock': return <Clock className="h-5 w-5" />;
    case 'Trophy': return <Trophy className="h-5 w-5" />;
    default: return <Activity className="h-5 w-5" />;
  }
};

interface RotationBoardProps {
  student: Student;
  onUpdateStatus: (
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    submission: { notes: string; fileName: string; fileUrl: string }
  ) => void;
  onMarkRolled: (
    type: 'rotation' | 'homework',
    itemId: string,
    bonusXp: number,
    message: string
  ) => void;
  systemOngoingMonth: number;
  systemDateText: string;
  clockMode?: ClockMode;
  currentTimeText?: string;
}

export default function RotationBoard({ 
  student, 
  onUpdateStatus, 
  onMarkRolled, 
  systemOngoingMonth, 
  systemDateText,
  clockMode = 'auto',
  currentTimeText = ''
}: RotationBoardProps) {
  const currentMonthIndex = systemOngoingMonth;
  const defaultActiveMonth = systemOngoingMonth;

  const [activeMonth, setActiveMonth] = useState<number>(defaultActiveMonth);
  // Default to Light Mode with alternating light/dark blocks as requested by user
  const [boardTheme, setBoardTheme] = useState<'dark' | 'light'>('light');

  // Synchronize activeMonth with systemOngoingMonth when it changes
  useEffect(() => {
    setActiveMonth(systemOngoingMonth);
  }, [systemOngoingMonth]);
  const [notesInput, setNotesInput] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Dice Roll state
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Available rotation rolls
  const unrolledMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(m => {
    const status = student.rotationStatus[m];
    const rolled = student.rotationRolled?.[m];
    return status && !rolled;
  });

  const handleRollDice = () => {
    if (isRolling || unrolledMonths.length === 0) return;

    setIsRolling(true);
    let counter = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter >= 15) {
        clearInterval(interval);
        
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);

        const targetMonth = unrolledMonths[0];
        const bonusXp = finalValue * 10;
        onMarkRolled(
          'rotation',
          targetMonth.toString(),
          bonusXp,
          `🎲 輪訓地圖擲骰成功！您骰出了 ${finalValue} 點，額外獲得 +${bonusXp} XP 獎勵！`
        );
      }
    }, 80);
  };

  const selectedDeptId = student.schedule[activeMonth - 1] || 'adult-er';
  const selectedDept = DEPARTMENTS[selectedDeptId];
  const rotationStatus = student.rotationStatus[activeMonth];

  // Map 12 months to grid coordinates on a 4x4 outer ring
  // Indices: 0 to 11
  // Coordinate map for board layout (row, col) from 0 to 3:
  const boardLayout = [
    { month: 1, row: 0, col: 0 },
    { month: 2, row: 0, col: 1 },
    { month: 3, row: 0, col: 2 },
    { month: 4, row: 0, col: 3 },
    { month: 5, row: 1, col: 3 },
    { month: 6, row: 2, col: 3 },
    { month: 7, row: 3, col: 3 },
    { month: 8, row: 3, col: 2 },
    { month: 9, row: 3, col: 1 },
    { month: 10, row: 3, col: 0 },
    { month: 11, row: 2, col: 0 },
    { month: 12, row: 1, col: 0 },
  ];

  const handleSubmitRotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;

    onUpdateStatus('rotation', activeMonth.toString(), {
      notes: notesInput,
      fileName: fileNameInput,
      fileUrl: 'certificate-placeholder-url'
    });

    setNotesInput('');
    setFileNameInput('');
  };

  // Drag and drop simulator
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileNameInput(file.name);
    }
  };

  const selectSuggestedFile = () => {
    const defaultName = `${student.name}_${MONTH_NAMES[activeMonth - 1].split(' ')[0]}輪訓證明.pdf`;
    setFileNameInput(defaultName);
  };

  return (
    <div className={`space-y-6 transition-colors ${boardTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Overview Card */}
      <div className={`rounded-xl border p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        boardTheme === 'dark' 
          ? 'bg-slate-900 border-slate-800 shadow-xl text-slate-100' 
          : 'bg-white border-slate-200 shadow-sm text-slate-900'
      }`}>
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Map className="h-5 w-5 text-teal-500" />
              急診 12 個月輪訓地圖
            </h2>
            
            {/* Theme switcher */}
            <div className="flex items-center space-x-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setBoardTheme('light')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  boardTheme === 'light' ? 'bg-white text-teal-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>☀️ 淺色棋盤 (預設)</span>
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme('dark')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                  boardTheme === 'dark' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🌙 深色戰情</span>
              </button>
            </div>
          </div>

          <p className={`text-xs leading-relaxed ${boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
            依據您的年度課表規律，點擊地圖中的任一月份科別。您可以在右側/下方查看該科別的核心訓練目標與重點任務，並在此上傳佐證資料申報學分。
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className={boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>📅 目前進行訓練月份：</span>
              <div className="flex items-center space-x-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-md px-2 py-0.5 text-xs font-black">
                <span>{MONTH_NAMES[currentMonthIndex - 1]} (M{currentMonthIndex})</span>
                <span className="text-[8px] bg-teal-600 text-white font-extrabold px-1 py-0.25 rounded-md flex items-center">
                  🔒 後台
                </span>
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg border ${
              boardTheme === 'dark' 
                ? 'text-slate-300 bg-slate-800/80 border-slate-700' 
                : 'text-slate-600 bg-slate-100/90 border-slate-200/80'
            }`}>
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>系統時間：{(() => {
                if (!systemDateText) return '2026年7月5日';
                const parts = systemDateText.split('-');
                if (parts.length === 3) {
                  return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
                }
                return systemDateText;
              })()}</span>
              {currentTimeText && (
                <span className="font-mono font-bold text-teal-400 bg-teal-950/60 px-1.5 py-0.25 rounded border border-teal-800/80">
                  {currentTimeText}
                </span>
              )}
              <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded ${
                clockMode === 'auto' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {clockMode === 'auto' ? '即時時鐘' : '手動排程'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Approved counts */}
        <div className={`flex items-center space-x-3 rounded-lg px-4 py-2 text-xs shrink-0 self-start md:self-auto border ${
          boardTheme === 'dark' 
            ? 'bg-teal-950/60 border-teal-800/70 text-teal-200' 
            : 'bg-teal-50 border-teal-100 text-teal-900'
        }`}>
          <CheckCircle2 className="h-5 w-5 text-teal-400" />
          <div>
            <span className="block text-[10px] text-teal-400 font-extrabold uppercase font-mono tracking-wider">ROUNDS COMPLETED</span>
            <span className="text-sm font-black font-mono">
              {Object.values(student.rotationStatus).filter(s => s.status === 'approved').length} <span className="text-slate-400 font-normal">/ 12 個月</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Monopoly Board (Left) + Side Panel Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monopoly Board (Col-span 7) */}
        <div className={`lg:col-span-7 rounded-2xl border p-4 flex flex-col items-center justify-center min-h-[460px] transition-colors ${
          boardTheme === 'dark' 
            ? 'bg-slate-950/90 border-slate-800 shadow-2xl' 
            : 'bg-slate-100/90 border-slate-200 shadow-sm'
        }`}>
          
          <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full max-w-[440px] aspect-square relative">
            
            {/* Center Area (Row 1-2, Col 1-2) with interactive Dice */}
            <div className="col-start-2 col-end-4 row-start-2 row-end-4 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-center text-white border border-teal-500/20 shadow-inner z-10 select-none overflow-hidden">
              {unrolledMonths.length > 0 ? (
                <div className="flex flex-col items-center justify-center space-y-1.5 w-full">
                  <span className="text-[8px] font-black tracking-widest text-teal-400 font-mono animate-pulse uppercase">
                    🎲 BONUS DICE ROUND
                  </span>
                  
                  {/* Interactive Dice Face */}
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={handleRollDice}
                    className={`group transition-transform cursor-pointer ${isRolling ? 'animate-bounce' : 'hover:scale-110 active:scale-95'}`}
                  >
                    {/* Dice Dot Rendering */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2 h-14 w-14 bg-white border-2 border-slate-300 rounded-xl shadow-md shrink-0 relative transition-all group-hover:border-teal-400 group-hover:shadow-teal-400/20">
                      {(value => {
                        const getDiceDots = (v: number) => {
                          switch (v) {
                            case 1: return [4];
                            case 2: return [2, 6];
                            case 3: return [2, 4, 6];
                            case 4: return [0, 2, 6, 8];
                            case 5: return [0, 2, 4, 6, 8];
                            case 6: return [0, 2, 3, 5, 6, 8];
                            default: return [];
                          }
                        };
                        const dots = getDiceDots(value);
                        return [...Array(9)].map((_, i) => (
                          <div key={i} className="flex items-center justify-center">
                            {dots.includes(i) && (
                              <div className="h-2 w-2 rounded-full bg-slate-950" />
                            )}
                          </div>
                        ));
                      })(diceValue)}
                    </div>
                  </button>

                  <div className="text-center">
                    <p className="text-[10px] font-black text-white">
                      {isRolling ? '正在旋轉擲骰...' : '點擊骰子擲骰！'}
                    </p>
                    <span className="inline-flex items-center justify-center bg-teal-500/10 border border-teal-400/20 text-teal-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1">
                      尚有 {unrolledMonths.length} 次機會
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <span className="text-[8px] font-black tracking-widest text-teal-400 font-mono">CGH ER TRACK</span>
                  <h3 className="text-xs font-black tracking-tight mt-1 text-white">
                    急診輪訓地圖
                  </h3>
                  
                  {/* Idle/disabled Dice */}
                  <div className="my-2 grid grid-cols-3 grid-rows-3 gap-1 p-2 h-11 w-11 bg-slate-800 border border-slate-700 rounded-lg shadow-inner opacity-40">
                    <div className="col-start-2 row-start-2 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 leading-tight px-1">
                    申報任一月份輪訓完畢，即可獲得輪訓地圖額外擲骰 XP 獎勵！
                  </p>
                </div>
              )}
            </div>

            {/* Render 12 months with alternating colors */}
            {boardLayout.map((layout) => {
              const currentDeptId = student.schedule[layout.month - 1] || 'adult-er';
              const currentDept = DEPARTMENTS[currentDeptId];
              const mStatus = student.rotationStatus[layout.month];
              const isSelected = activeMonth === layout.month;
              const isEvenMonth = layout.month % 2 === 0;

              // Grid position strings
              let gridRowClass = 'row-start-1';
              if (layout.row === 1) gridRowClass = 'row-start-2';
              else if (layout.row === 2) gridRowClass = 'row-start-3';
              else if (layout.row === 3) gridRowClass = 'row-start-4';

              let gridColClass = 'col-start-1';
              if (layout.col === 1) gridColClass = 'col-start-2';
              else if (layout.col === 2) gridColClass = 'col-start-3';
              else if (layout.col === 3) gridColClass = 'col-start-4';

              // Determine styling with alternating light green and deeper green contrast (輪訓地圖綠色主題)
              let bgClass = '';
              if (boardTheme === 'dark') {
                // Alternating deep emerald / forest tones for dark mode
                bgClass = isEvenMonth 
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700/80 text-emerald-100' 
                  : 'bg-slate-950/95 hover:bg-emerald-950/60 border-slate-800/90 text-emerald-200';

                if (mStatus) {
                  if (mStatus.status === 'approved') {
                    bgClass = isEvenMonth
                      ? 'bg-emerald-800/90 hover:bg-emerald-750 border-emerald-500 text-white font-black'
                      : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-400 text-emerald-100 font-black';
                  } else if (mStatus.status === 'pending') {
                    bgClass = 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/80 text-amber-200 animate-pulse';
                  } else if (mStatus.status === 'rejected') {
                    bgClass = 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/80 text-rose-200';
                  }
                }

                if (isSelected) {
                  bgClass = 'bg-teal-600 text-white border-teal-400 ring-4 ring-teal-400/50 shadow-lg shadow-teal-500/30 scale-105 z-20';
                } else if (layout.month === currentMonthIndex) {
                  bgClass += ' ring-2 ring-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.45)] border-teal-400';
                }
              } else {
                // High contrast alternating green: Even months Deeper Green (較深一點的綠色), Odd months Light Green (淺綠色)
                if (isEvenMonth) {
                  // Deeper Green Block (較深一點的綠色)
                  bgClass = 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 text-white shadow-xs';
                  if (mStatus) {
                    if (mStatus.status === 'approved') {
                      bgClass = 'bg-emerald-800 hover:bg-emerald-850 border-emerald-900 text-white shadow-xs font-black ring-2 ring-emerald-300/40';
                    } else if (mStatus.status === 'pending') {
                      bgClass = 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-xs animate-pulse';
                    } else if (mStatus.status === 'rejected') {
                      bgClass = 'bg-rose-600 hover:bg-rose-700 border-rose-700 text-white shadow-xs';
                    }
                  }
                } else {
                  // Light Green Block (淺綠色)
                  bgClass = 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-950 shadow-xs';
                  if (mStatus) {
                    if (mStatus.status === 'approved') {
                      bgClass = 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white shadow-xs font-black ring-2 ring-emerald-400/40';
                    } else if (mStatus.status === 'pending') {
                      bgClass = 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-950 shadow-xs animate-pulse';
                    } else if (mStatus.status === 'rejected') {
                      bgClass = 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-950 shadow-xs';
                    }
                  }
                }

                if (isSelected) {
                  bgClass = 'bg-teal-600 text-white border-teal-500 ring-4 ring-teal-400/50 shadow-lg shadow-teal-500/25 scale-105 z-20';
                } else if (layout.month === currentMonthIndex) {
                  bgClass += ' ring-2 ring-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.35)] border-teal-500';
                }
              }

              return (
                <button
                  key={layout.month}
                  onClick={() => setActiveMonth(layout.month)}
                  className={`relative rounded-xl border p-2 flex flex-col justify-between items-center text-center transition-all cursor-pointer select-none ${gridRowClass} ${gridColClass} ${bgClass}`}
                >
                  {/* Top: Month ID */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[9px] font-black font-mono tracking-wider ${
                      isSelected 
                        ? 'text-teal-200' 
                        : boardTheme === 'dark' 
                        ? 'text-emerald-300' 
                        : isEvenMonth
                        ? 'text-emerald-100'
                        : 'text-emerald-800'
                    }`}>
                      M{layout.month}
                    </span>
                    {layout.month === currentMonthIndex && (
                      <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded ${isSelected ? 'bg-teal-500 text-white' : 'bg-teal-500 text-white animate-pulse'}`}>
                        目前進行
                      </span>
                    )}
                  </div>

                  {/* Mid: Icon */}
                  <div className={`my-1 ${
                    isSelected 
                      ? 'text-white scale-110' 
                      : boardTheme === 'dark' 
                      ? 'text-emerald-300' 
                      : isEvenMonth 
                      ? 'text-emerald-100' 
                      : 'text-emerald-700'
                  }`}>
                    {getDeptIcon(currentDept?.icon || 'User')}
                  </div>

                  {/* Bot: Dept Label */}
                  <span className={`text-[10px] font-extrabold truncate w-full ${
                    isSelected 
                      ? 'text-white' 
                      : boardTheme === 'dark' 
                      ? 'text-emerald-100' 
                      : isEvenMonth 
                      ? 'text-white' 
                      : 'text-emerald-950'
                  }`}>
                    {currentDept?.name || '成人急診'}
                  </span>

                  {/* Small absolute indicator status */}
                  {!isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      {mStatus?.status === 'approved' && <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-80" />}
                      {mStatus?.status === 'pending' && <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 animate-ping" />}
                      {mStatus?.status === 'rejected' && <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400" />}
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          {/* Prompt banner under board */}
          <div className="mt-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center">
              當前選定：{MONTH_NAMES[activeMonth - 1]}
            </span>
          </div>

        </div>

        {/* Side Panel Month Detail & Submission Form (Col-span 5) */}
        <div className={`lg:col-span-5 rounded-2xl border p-5 transition-colors space-y-4 ${
          boardTheme === 'dark' 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl' 
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          
          {/* Month & Dept details */}
          <div className={`border-b pb-3 ${boardTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className="rounded bg-teal-500/20 border border-teal-400/30 px-2 py-0.5 text-[9px] font-extrabold text-teal-300 tracking-wider font-mono">
              MONTH {activeMonth} STATUS
            </span>
            <h3 className={`text-base font-extrabold mt-1 ${boardTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {MONTH_NAMES[activeMonth - 1]} 輪訓：{selectedDept.fullName}
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${boardTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {selectedDept.description}
            </p>
          </div>

          {/* Tasks & Milestones */}
          <div className={`space-y-1.5 p-3.5 rounded-xl border ${
            boardTheme === 'dark' 
              ? 'bg-slate-800/80 border-slate-700/80' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            <h4 className={`text-xs font-black uppercase tracking-wider flex items-center ${
              boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <AlertCircle className="h-4 w-4 mr-1 text-teal-400" />
              本月 core tasks 訓練指標：
            </h4>
            <div className="space-y-1">
              {selectedDept.tasks.map((task, i) => (
                <div key={i} className={`flex items-start text-xs leading-normal ${
                  boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  <span className="text-teal-400 font-bold mr-1.5">•</span>
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rotation Status Details / Submission */}
          <div className="pt-2">
            {rotationStatus ? (
              // Case A: Submission already exists
              <div className="space-y-4">
                <div className={`rounded-xl border p-4 space-y-3 text-xs ${
                  boardTheme === 'dark' 
                    ? 'bg-slate-800/60 border-slate-700/80' 
                    : 'bg-slate-50/50 border-slate-100'
                }`}>
                  
                  {/* Status row */}
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${boardTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>當前審查進度：</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      rotationStatus.status === 'approved' 
                        ? 'bg-teal-500/20 border border-teal-400/40 text-teal-300' 
                        : rotationStatus.status === 'pending' 
                        ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300' 
                        : 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                    }`}>
                      {rotationStatus.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          已核可通過 (+50 XP)
                        </>
                      ) : rotationStatus.status === 'pending' ? (
                        <>
                          <Clock className="h-3 w-3 mr-1 animate-spin" />
                          指導 VS 審核中
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          遭退回修改
                        </>
                      )}
                    </span>
                  </div>

                  {/* Submission detail */}
                  <div className={`space-y-2 pt-2 border-t ${boardTheme === 'dark' ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div>
                      <span className="block text-[10px] font-black text-slate-400">上傳之心得與反思：</span>
                      <p className={`leading-relaxed italic whitespace-pre-wrap mt-0.5 ${
                        boardTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        &ldquo;{rotationStatus.notes || '無填寫心得'}&rdquo;
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black text-slate-400">提交之佐證檔案：</span>
                      <div className={`flex items-center space-x-2 mt-1 p-2 rounded border ${
                        boardTheme === 'dark' 
                          ? 'bg-slate-800 border-slate-700 text-slate-200' 
                          : 'bg-white border-slate-100 text-slate-700'
                      }`}>
                        <FileText className="h-4 w-4 text-teal-400" />
                        <span className="font-semibold truncate">{rotationStatus.fileName}</span>
                      </div>
                    </div>

                    {rotationStatus.feedback && (
                      <div className="bg-amber-500/10 p-2.5 rounded border border-amber-400/20 mt-2">
                        <span className="block text-[10px] font-black text-amber-300">VS 導師回饋意見：</span>
                        <p className="text-amber-200 font-medium italic mt-0.5">
                          &ldquo;{rotationStatus.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* If rejected, let them resubmit */}
                {rotationStatus.status === 'rejected' && (
                  <div className={`pt-2 border-t ${boardTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                      onClick={() => {
                        // Clear to allow re-entry
                        setNotesInput(rotationStatus.notes);
                        setFileNameInput(rotationStatus.fileName);
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-950 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>填寫修正申報資料</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Case B: No submission yet, render Form
              <form onSubmit={handleSubmitRotation} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    輪訓學習心得與成果反思 (Reflective Learning)
                  </label>
                  <textarea
                    placeholder="請輸入您在本輪訓科別期間的學習反思，例如：學習了哪些特定手術/技術、特殊急症處置心得或需要改進之處..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={3}
                    className={`w-full rounded-lg border p-2.5 text-xs focus:outline-none transition-colors ${
                      boardTheme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-teal-400' 
                        : 'bg-white border-slate-300 text-slate-700 placeholder-slate-400 focus:border-teal-500'
                    }`}
                    required
                  />
                </div>

                {/* Drag and Drop Upload Area */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    上傳輪訓完畢科別簽章或評估表 (佐證證明)
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center transition-all relative ${
                      dragActive 
                        ? 'border-teal-400 bg-teal-500/10' 
                        : fileNameInput 
                        ? 'border-teal-400 bg-teal-500/10' 
                        : boardTheme === 'dark'
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/40'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    
                    {fileNameInput ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-teal-400 truncate max-w-xs">{fileNameInput}</p>
                        <p className="text-[10px] text-slate-400">已就緒。可點擊重新拖曳</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className={`text-xs font-semibold ${boardTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          拖曳檔案至此或 <span className="text-teal-400 underline cursor-pointer">點擊選擇</span>
                        </p>
                        <p className="text-[10px] text-slate-400">支援 PDF, JPG, PNG 掃描檔證明</p>
                      </div>
                    )}
                    
                    {/* Simulated input clicker */}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFileNameInput(e.target.files[0].name);
                        }
                      }}
                    />
                  </div>

                  {/* Suggest standard mock proof file */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">還沒掃描？先使用預設證明</span>
                    <button
                      type="button"
                      onClick={selectSuggestedFile}
                      className="text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      帶入預設證明名稱
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!fileNameInput}
                  className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                    fileNameInput 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/10 cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>提交本月完訓審核 (+50 XP)</span>
                </button>

              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
