import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Upload, 
  Calendar, 
  Trophy, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  CheckSquare,
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
  Skull,
  Mountain,
  Crown,
  User,
  Venus,
  AudioLines,
  CloudLightning,
  ShieldAlert
} from 'lucide-react';
import { Student, Homework, DEFAULT_HOMEWORKS, MONTH_NAMES, MONTHLY_CHECKLISTS, DEPARTMENTS, getApplicableMonthsForRLevel } from '../types';

const getDeptIcon = (iconName: string) => {
  const className = "h-5 w-5";
  switch (iconName) {
    case 'Activity': return <Activity className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Baby': return <Baby className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'Ear': return <Ear className={className} />;
    case 'Ambulance': return <Ambulance className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Waves': return <Waves className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Skull': return <Skull className={className} />;
    case 'Mountain': return <Mountain className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'User': return <User className={className} />;
    case 'Venus': return <Venus className={className} />;
    case 'AudioLines': return <AudioLines className={className} />;
    case 'CloudLightning': return <CloudLightning className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    default: return <Activity className={className} />;
  }
};

interface HomeworkViewProps {
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
}

export default function HomeworkView({ student, onUpdateStatus, onMarkRolled }: HomeworkViewProps) {
  // Get applicable months based on R level frequency (R4 is 1-6 months up to June)
  const applicableMonths = getApplicableMonthsForRLevel(student.rLevel);
  const activeMonthsLimit = student.rLevel === 'R4' ? 6 : 12;

  // All 12 monthly slots (either actual written homework or virtual routine checklist homework)
  const sortedHomeworks = Array.from({ length: 12 }).map((_, idx) => {
    const m = idx + 1;
    const writtenHw = DEFAULT_HOMEWORKS.find(h => h.rLevel === student.rLevel && h.month === m);
    if (writtenHw) return writtenHw;
    return {
      id: `hw-routine-${student.rLevel.toLowerCase()}-${m}`,
      title: `${m}月份：常規評量核檢申報`,
      month: m,
      rLevel: student.rLevel,
      description: '本月為常規核檢月份。免撰寫個案心得與檔案上傳。請核對並確認完成常規之五項臨床評量項目，即可送出本月常規申報。'
    } as Homework;
  });

  // Default to first incomplete month among active months
  let defaultActiveMonth = 1;
  for (let m = 1; m <= activeMonthsLimit; m++) {
    const hwForMonth = sortedHomeworks.find(h => h.month === m);
    if (hwForMonth) {
      const status = student.homeworkStatus[hwForMonth.id];
      if (!status || status.status !== 'approved') {
        defaultActiveMonth = m;
        break;
      }
    }
  }

  const [activeMonth, setActiveMonth] = useState<number>(defaultActiveMonth);
  const [notesInput, setNotesInput] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // For checking the 5 items in routine months
  const [routineChecks, setRoutineChecks] = useState<Record<string, boolean>>({
    core: false,
    mentorship: false,
    rotation: false,
    dops: false,
    minicex: false
  });

  // Default to Light Mode as requested by user ("一個淺色一個深色" - RotationBoard: dark, HomeworkView: light)
  const [hwTheme, setHwTheme] = useState<'light' | 'dark'>('light');

  // Selected homework
  const activeHomework = sortedHomeworks.find(h => h.month === activeMonth)!;
  const activeStatus = student.homeworkStatus[activeHomework.id];

  const checklistItems = MONTHLY_CHECKLISTS[activeMonth] || [];

  // Dice Roll state
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Coordinate map for 4x4 Monopoly board outer ring layout
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

  // Available homework rolls
  // Any monthly slot (written or routine) that is completed and not yet rolled
  const unrolledHomeworks = sortedHomeworks.filter(hw => {
    const status = student.homeworkStatus[hw.id];
    const rolled = student.homeworkRolled?.[hw.id];
    return status && !rolled;
  });

  const handleRollDice = () => {
    if (isRolling || unrolledHomeworks.length === 0) return;

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
        
        // Take the first eligible homework item and reward
        const targetHw = unrolledHomeworks[0];
        const bonusXp = finalValue * 10;
        onMarkRolled(
          'homework',
          targetHw.id,
          bonusXp,
          `🎲 輪訓地圖擲骰成功！您骰出了 ${finalValue} 點，作業額外獲得 +${bonusXp} XP 獎勵！`
        );
      }
    }, 80);
  };

  // Stats (R4 training extends to June of next year, so 6 months)
  const totalHws = activeMonthsLimit;
  const completedHws = sortedHomeworks.filter(h => h.month <= activeMonthsLimit && student.homeworkStatus[h.id]?.status === 'approved').length;
  const pendingHws = sortedHomeworks.filter(h => h.month <= activeMonthsLimit && student.homeworkStatus[h.id]?.status === 'pending').length;

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    const isRoutine = activeHomework.id.startsWith('hw-routine-');

    if (isRoutine) {
      onUpdateStatus('homework', activeHomework.id, {
        notes: '已確認完成五項常規臨床評量：核心課程評量、導師生座談會紀錄／回饋、各科輪訓表、ad hoc評量表 DOPS、Mini-CEX評量表。',
        fileName: '常規五項自檢申報表.pdf',
        fileUrl: 'routine-checklist-completed'
      });
      // Reset checkboxes
      setRoutineChecks({
        core: false,
        mentorship: false,
        rotation: false,
        dops: false,
        minicex: false
      });
    } else {
      if (!fileNameInput.trim()) return;
      onUpdateStatus('homework', activeHomework.id, {
        notes: notesInput,
        fileName: fileNameInput,
        fileUrl: 'homework-submission-mock-url'
      });
      setNotesInput('');
      setFileNameInput('');
    }
  };

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
    if (!activeHomework) return;
    const cleanTitle = activeHomework.title.split('：').pop() || activeHomework.title;
    setFileNameInput(`${student.name}_${student.rLevel}_${cleanTitle}_臨床作業.pdf`);
  };

  return (
    <div className={`space-y-6 transition-colors ${hwTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Overview Block */}
      <div className={`rounded-xl border p-5 transition-colors space-y-4 ${
        hwTheme === 'dark' 
          ? 'bg-slate-900 border-slate-800 shadow-xl text-slate-100' 
          : 'bg-white border-slate-200 shadow-sm text-slate-900'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-500 tracking-wider font-mono">
                  {student.rLevel} RESIDENT TRACK
                </span>
              </div>

              {/* Theme Switcher */}
              <div className="flex md:hidden items-center space-x-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setHwTheme('light')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    hwTheme === 'light' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ☀️ 淺色 (預設)
                </button>
                <button
                  type="button"
                  onClick={() => setHwTheme('dark')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    hwTheme === 'dark' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🌙 深色
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1.5">
              <h2 className="text-base font-extrabold flex items-center">
                <BookOpen className="h-5 w-5 text-rose-500 mr-2" />
                每月急診核心能力與評量申報地圖 (RRC 評鑑檢核項目)
              </h2>

              {/* Theme Switcher Desktop */}
              <div className="hidden md:flex items-center space-x-1 rounded-lg p-0.5 border text-[11px] font-bold ml-4 shrink-0 bg-slate-100 border-slate-200">
                <button
                  type="button"
                  onClick={() => setHwTheme('light')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    hwTheme === 'light' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ☀️ 淺色作業本 (預設)
                </button>
                <button
                  type="button"
                  onClick={() => setHwTheme('dark')}
                  className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    hwTheme === 'dark' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🌙 深色模式
                </button>
              </div>
            </div>

            <p className={`text-xs mt-1 leading-relaxed ${hwTheme === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
              {student.rLevel === 'R4' ? (
                <>配合 <strong>R4 訓練規範</strong>（因 8-9 月起訓，訓練增列至隔年 6 月完訓），本階段共需完成 <strong>1-6 月</strong> 之作業與常規評量申報。每次送審經指導教師簽核，皆可在地圖中央擲骰獲取豐富 XP 經驗值！</>
              ) : (
                <>配合 <strong>{student.rLevel} 訓練規範</strong>，本年度 12 個月份皆需送審申報。其中部分月份為 <strong>免個案報告／免心得上傳</strong> 階段，您只需透過右側 <strong>常規五項自檢申報面板</strong> 一鍵核對即可完成。每次送審經指導教師簽核，皆可在地圖中央擲骰獲取豐富 XP 經驗值！</>
              )}
            </p>
          </div>

          {/* Stats Badging */}
          <div className={`flex space-x-4 rounded-xl p-3 text-xs shrink-0 self-start md:self-auto border ${
            hwTheme === 'dark'
              ? 'bg-rose-950/40 border-rose-900/60'
              : 'bg-rose-50/50 border-rose-100'
          }`}>
            <div className="text-center px-2 border-r border-rose-200/50">
              <span className="block text-[9px] font-bold text-slate-400">總核檢月份</span>
              <span className="text-sm font-black text-rose-500 font-mono">{totalHws} 個月</span>
            </div>
            <div className="text-center px-2 border-r border-rose-200/50">
              <span className="block text-[9px] font-bold text-teal-500">已核可</span>
              <span className="text-sm font-black text-teal-500 font-mono">{completedHws} 月</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[9px] font-bold text-amber-500">待審查</span>
              <span className="text-sm font-black text-amber-500 font-mono">{pendingHws} 月</span>
            </div>
          </div>
        </div>

        {/* Level Progress Slider */}
        <div className={`border-t pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          hwTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            <span className={`font-bold ${hwTheme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>全年度申報進度：</span>
            <span className="font-mono font-black text-rose-500">{totalHws > 0 ? Math.round((completedHws / totalHws) * 100) : 0}%</span>
          </div>
          <div className={`flex-1 max-w-md h-2 rounded-full overflow-hidden ${
            hwTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${totalHws > 0 ? (completedHws / totalHws) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Monopoly Board (Left) + Side Panel Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monopoly Board (Col-span 7) */}
        <div className={`lg:col-span-7 rounded-2xl border p-4 flex flex-col items-center justify-center min-h-[460px] transition-colors ${
          hwTheme === 'dark'
            ? 'bg-slate-950/90 border-slate-800 shadow-2xl'
            : 'bg-slate-100/90 border-slate-200 shadow-sm'
        }`}>
          
          <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full max-w-[440px] aspect-square relative">
            
            {/* Center Area (Row 1-2, Col 1-2) with interactive Dice */}
            <div className="col-start-2 col-end-4 row-start-2 row-end-4 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-center text-white border border-rose-500/20 shadow-inner z-10 select-none overflow-hidden">
              {unrolledHomeworks.length > 0 ? (
                <div className="flex flex-col items-center justify-center space-y-1.5 w-full">
                  <span className="text-[8px] font-black tracking-widest text-rose-400 font-mono animate-pulse uppercase">
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
                    <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2 h-14 w-14 bg-white border-2 border-slate-300 rounded-xl shadow-md shrink-0 relative transition-all group-hover:border-rose-400 group-hover:shadow-rose-400/20">
                      {((value) => {
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
                      {isRolling ? '正在旋轉擲骰...' : '點擊骰子繳交骰！'}
                    </p>
                    <span className="inline-flex items-center justify-center bg-rose-500/10 border border-rose-400/20 text-rose-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1">
                      尚有 {unrolledHomeworks.length} 次機會
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  <span className="text-[8px] font-black tracking-widest text-rose-400 font-mono">CGH ER TRACK</span>
                  <h3 className="text-xs font-black tracking-tight mt-1 text-white">
                    輪訓地圖
                  </h3>
                  
                  {/* Idle/disabled Dice */}
                  <div className="my-2 grid grid-cols-3 grid-rows-3 gap-1 p-2 h-11 w-11 bg-slate-800 border border-slate-700 rounded-lg shadow-inner opacity-40">
                    <div className="col-start-2 row-start-2 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 leading-tight px-1">
                    完成並提交任一月份申報，即可於地圖中央擲骰獲取額外經驗值！
                  </p>
                </div>
              )}
            </div>

            {/* Render 12 months for homework board with alternating colors */}
            {boardLayout.map((layout) => {
              const hw = sortedHomeworks.find(h => h.month === layout.month);
              const isSelected = activeMonth === layout.month;
              const isEvenMonth = layout.month % 2 === 0;
              const hasWrittenHw = hw && !hw.id.startsWith('hw-routine-');
              const hwId = hw ? hw.id : `hw-routine-${student.rLevel.toLowerCase()}-${layout.month}`;
              const hStatus = student.homeworkStatus[hwId];
              const currentDeptId = student.schedule[layout.month - 1] || 'adult-er';
              const currentDept = DEPARTMENTS[currentDeptId];

              // Grid position strings
              const gridRowClass = `row-start-${layout.row + 1}`;
              const gridColClass = `col-start-${layout.col + 1}`;

              // Determine styling with alternating light red and deeper red contrast (每月作業紅色主題)
              let bgClass = '';
              if (hwTheme === 'light') {
                // High contrast alternating red: Even months Deeper Red (較深一點的紅色), Odd months Light Red (淺紅色)
                if (isEvenMonth) {
                  // Deeper Red Block (較深一點的紅色)
                  bgClass = 'bg-rose-700 hover:bg-rose-800 border-rose-800 text-white shadow-xs cursor-pointer';
                  if (hStatus) {
                    if (hStatus.status === 'approved') {
                      bgClass = 'bg-rose-850 hover:bg-rose-900 border-rose-950 text-white shadow-xs font-black ring-2 ring-rose-400/50 cursor-pointer';
                    } else if (hStatus.status === 'pending') {
                      bgClass = 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white shadow-xs animate-pulse cursor-pointer';
                    } else if (hStatus.status === 'rejected') {
                      bgClass = 'bg-slate-900 hover:bg-black border-rose-700 text-rose-300 shadow-xs cursor-pointer';
                    }
                  }
                } else {
                  // Light Red Block (淺紅色)
                  bgClass = 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-950 shadow-xs cursor-pointer';
                  if (hStatus) {
                    if (hStatus.status === 'approved') {
                      bgClass = 'bg-rose-500 hover:bg-rose-600 border-rose-600 text-white shadow-xs font-black ring-2 ring-rose-400/40 cursor-pointer';
                    } else if (hStatus.status === 'pending') {
                      bgClass = 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-950 shadow-xs animate-pulse cursor-pointer';
                    } else if (hStatus.status === 'rejected') {
                      bgClass = 'bg-rose-200 hover:bg-rose-300 border-rose-400 text-rose-950 shadow-xs cursor-pointer';
                    }
                  }
                }

                if (isSelected) {
                  bgClass = 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-400/50 shadow-lg shadow-rose-500/30 scale-105 z-20 cursor-pointer';
                }
              } else {
                // Alternating dark tones: Even months deeper rose-950, Odd months slate-950 with rose tint
                bgClass = isEvenMonth 
                  ? 'bg-rose-950/80 hover:bg-rose-900/90 border-rose-800/80 text-rose-100 cursor-pointer' 
                  : 'bg-slate-950/95 hover:bg-rose-950/60 border-slate-800/90 text-rose-200 cursor-pointer';

                if (hStatus) {
                  if (hStatus.status === 'approved') {
                    bgClass = isEvenMonth
                      ? 'bg-rose-800/90 hover:bg-rose-750 border-rose-500 text-white font-black cursor-pointer'
                      : 'bg-rose-950/90 hover:bg-rose-900 border-rose-400 text-rose-100 font-black cursor-pointer';
                  } else if (hStatus.status === 'pending') {
                    bgClass = 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/80 text-amber-200 animate-pulse cursor-pointer';
                  } else if (hStatus.status === 'rejected') {
                    bgClass = 'bg-rose-950/90 hover:bg-rose-900 border-rose-500 text-rose-200 cursor-pointer';
                  }
                }

                if (isSelected) {
                  bgClass = 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-400/40 shadow-lg shadow-rose-500/30 scale-105 z-20 cursor-pointer';
                }
              }

              return (
                <button
                  key={layout.month}
                  onClick={() => setActiveMonth(layout.month)}
                  className={`relative rounded-xl border p-2 flex flex-col justify-between items-center text-center transition-all select-none ${gridRowClass} ${gridColClass} ${bgClass}`}
                >
                  {/* Top: Month ID */}
                  <span className={`text-[9px] font-black font-mono tracking-wider ${
                    isSelected 
                      ? 'text-rose-200' 
                      : hwTheme === 'dark' 
                      ? 'text-rose-300' 
                      : isEvenMonth
                      ? 'text-rose-100'
                      : 'text-rose-800'
                  }`}>
                    M{layout.month}
                  </span>

                  {/* Mid: Icon */}
                  <div className={`my-1 ${
                    isSelected 
                      ? 'text-white scale-110' 
                      : hwTheme === 'dark' 
                      ? 'text-rose-300' 
                      : isEvenMonth 
                      ? 'text-rose-100' 
                      : 'text-rose-700'
                  }`}>
                    {getDeptIcon(currentDept?.icon || 'User')}
                  </div>

                  {/* Bot: Mini Label */}
                  <span className={`text-[9px] font-bold truncate w-full ${
                    isSelected 
                      ? 'text-white' 
                      : hwTheme === 'dark' 
                      ? 'text-rose-100' 
                      : isEvenMonth 
                      ? 'text-white' 
                      : 'text-rose-950'
                  }`}>
                    {student.rLevel === 'R4' && layout.month > 6 
                      ? '完訓/專科甄審' 
                      : hasWrittenHw 
                      ? (currentDept?.name || '科室作業') 
                      : '常規評量申報'}
                  </span>

                  {/* Small absolute indicator status */}
                  {!isSelected && hStatus && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      {hStatus.status === 'approved' && <span className="absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-80" />}
                      {hStatus.status === 'pending' && <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 animate-ping" />}
                      {hStatus.status === 'rejected' && <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500" />}
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          {/* Prompt banner under board */}
          <div className="mt-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center">
              當前選定月份：{MONTH_NAMES[activeMonth - 1]}
            </span>
          </div>

        </div>

        {/* Side Panel: Selected Assignment details & Submission form (Col-span 5) */}
        <div className={`lg:col-span-5 rounded-2xl border p-5 transition-colors space-y-4 ${
          hwTheme === 'dark' 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl' 
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}>
          
          {activeHomework ? (
            <>
              {/* Assignment Heading */}
              {(() => {
                const currentDeptId = student.schedule[activeMonth - 1] || 'adult-er';
                const currentDept = DEPARTMENTS[currentDeptId];
                const isRoutine = activeHomework.id.startsWith('hw-routine-');
                return (
                  <div className="border-b border-slate-100 pb-3">
                    <span className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-extrabold text-rose-700 tracking-wider font-mono">
                      {student.rLevel} MONTH {activeMonth} STATUS
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {isRoutine ? '常規評量檢核月' : `${currentDept?.name || '臨床科室'} 核心科室作業`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      本月輪訓科別：<strong>{currentDept?.name || '臨床科室'}</strong>。
                      {isRoutine 
                        ? '本月免撰寫個案心得與上傳作業檔案，只需填報下方之常規五項自檢即可申報完核。'
                        : '本月需撰寫記憶最深刻 Case 與學習反思，並上傳科室作業佐證檔案以供審核。'
                      }
                    </p>
                  </div>
                );
              })()}

              {/* Monthly Checklist Section */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-rose-600" />
                    本月核心表單與常規評量細目 ({checklistItems.length} 項)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-200/50 px-1.5 py-0.5 rounded-md">
                    應繳檢核
                  </span>
                </div>
                
                {/* List of reference items */}
                <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1 text-xs scrollbar-thin">
                  {checklistItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center space-x-2 p-1.5 rounded-lg border bg-white border-slate-200 text-slate-700 font-semibold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold text-[11px] leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Form */}
              <div className="pt-1">
                {activeStatus ? (
                  // Case A: Assignment is submitted / approved / rejected
                  <div className="space-y-4">
                    <div className="rounded-xl border p-4 bg-slate-50/50 space-y-3 text-xs">
                      
                      {/* Status Row */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500">簽核審查進度：</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          activeStatus.status === 'approved' 
                            ? 'bg-teal-100 text-teal-700' 
                            : activeStatus.status === 'pending' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {activeStatus.status === 'approved' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              已核可通過 (+50 XP)
                            </>
                          ) : activeStatus.status === 'pending' ? (
                            <>
                              <Clock className="h-3 w-3 mr-1 animate-spin" />
                              教學 VS 審核中
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              退回，請修正
                            </>
                          )}
                        </span>
                      </div>

                      {/* Detail row */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {activeHomework.id.startsWith('hw-routine-') ? (
                          <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/50 space-y-1">
                            <span className="block text-[10px] font-black text-emerald-800">常規申報核檢狀態：</span>
                            <p className="text-[11px] font-semibold text-emerald-900 leading-relaxed">
                              已勾選申報並確認完成：1.核心課程評量、2.導師生座談會紀錄／回饋、3.各科輪訓表、4.ad hoc評量表 DOPS、5.Mini-CEX評量表。
                            </p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="block text-[10px] font-black text-slate-400">上傳之作業反思：</span>
                              <p className="text-slate-700 leading-relaxed italic whitespace-pre-wrap mt-0.5">
                                &ldquo;{activeStatus.notes || '無心得'}&rdquo;
                              </p>
                            </div>

                            <div>
                              <span className="block text-[10px] font-black text-slate-400">作業佐證檔案：</span>
                              <div className="flex items-center space-x-2 mt-1 p-2 rounded bg-white border border-slate-100">
                                <FileText className="h-4 w-4 text-rose-600" />
                                <span className="font-semibold text-slate-700 truncate">{activeStatus.fileName}</span>
                              </div>
                            </div>
                          </>
                        )}

                        {activeStatus.feedback && (
                          <div className="bg-amber-50/50 p-2.5 rounded border border-amber-100 mt-2">
                            <span className="block text-[10px] font-black text-amber-800">VS 導師評語回饋：</span>
                            <p className="text-amber-900 font-medium italic mt-0.5">
                              &ldquo;{activeStatus.feedback}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Rejected Allow resubmit */}
                    {activeStatus.status === 'rejected' && (
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            if (!activeHomework.id.startsWith('hw-routine-')) {
                              setNotesInput(activeStatus.notes);
                              setFileNameInput(activeStatus.fileName);
                            }
                          }}
                          className="w-full flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-950 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>填寫修正申報內容</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeHomework.id.startsWith('hw-routine-') ? (
                  // Case B-1: Routine checklist submission form
                  <form onSubmit={handleSubmitHomework} className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-extrabold text-emerald-800 flex items-center">
                        <CheckSquare className="h-4 w-4 mr-1.5 text-emerald-600" />
                        常規五項臨床評量自檢申報
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        本月份免撰寫專案個案心得。請確認您本月已確實完成以下急診每月份皆需完成之常規核心教學評量：
                      </p>

                      <div className="space-y-2 pt-1">
                        {[
                          { key: 'core', label: '核心課程評量已繳交/評畢' },
                          { key: 'mentorship', label: '導師生座談會紀錄／回饋表已完備' },
                          { key: 'rotation', label: '當月輪訓科表紀錄已確認' },
                          { key: 'dops', label: 'ad hoc評量表 DOPS 臨床查核已核簽' },
                          { key: 'minicex', label: 'Mini-CEX評量表臨床技能查核已核簽' }
                        ].map((chk) => (
                          <label key={chk.key} className="flex items-center space-x-2.5 p-2 rounded-lg bg-white border border-slate-150 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={routineChecks[chk.key as keyof typeof routineChecks]}
                              onChange={(e) => setRoutineChecks({
                                ...routineChecks,
                                [chk.key]: e.target.checked
                              })}
                              className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0"
                            />
                            <span>{chk.label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setRoutineChecks({
                            core: true,
                            mentorship: true,
                            rotation: true,
                            dops: true,
                            minicex: true
                          })}
                          className="text-[10px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          一鍵勾選全部項目
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!Object.values(routineChecks).every(Boolean)}
                      className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                        Object.values(routineChecks).every(Boolean)
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/10 cursor-pointer' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-medium'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>確認並送出本月常規申報 (+30 XP)</span>
                    </button>
                  </form>
                ) : (
                  // Case B-2: Written Homework upload form
                  <form onSubmit={handleSubmitHomework} className="space-y-4">
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 mr-1 text-rose-600" />
                        本月「記憶最深刻的 Case」與臨床學習反思 (至少10字)
                      </label>
                      <textarea
                        placeholder={`請寫下您本月在「${student.schedule[activeMonth - 1] ? DEPARTMENTS[student.schedule[activeMonth - 1]]?.name || '臨床科室' : '臨床科室'}」輪訓中，記憶最深刻或最具教學意義的臨床 Case 案例分享、特殊診斷思維、治療處置或學習心得...`}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20"
                        required
                      />
                    </div>

                    {/* Drag and Drop */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        上傳已撰寫之作業檔案 (PDF / DOCX 證明)
                      </label>
                      
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center transition-all relative ${
                          dragActive 
                            ? 'border-rose-500 bg-rose-50/50' 
                            : fileNameInput 
                            ? 'border-rose-300 bg-rose-50/10' 
                            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                        }`}
                      >
                        <Upload className="h-6 w-6 text-slate-400 mb-2" />
                        
                        {fileNameInput ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-rose-800 truncate max-w-xs">{fileNameInput}</p>
                            <p className="text-[10px] text-slate-400">已就緒。可點擊重新拖曳</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-600">
                              拖曳檔案至此或 <span className="text-rose-600 underline cursor-pointer">點擊選擇</span>
                            </p>
                            <p className="text-[10px] text-slate-400">支援 Word, PDF 檔案格式</p>
                          </div>
                        )}
                        
                        {/* Hidden file input */}
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

                      {/* Mock selector */}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-medium">使用系統預設格式檔名？</span>
                        <button
                          type="button"
                          onClick={selectSuggestedFile}
                          className="text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          自動填入檔名
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!fileNameInput || notesInput.trim().length < 10}
                      className={`w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                        fileNameInput && notesInput.trim().length >= 10
                          ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/10 cursor-pointer' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed font-medium'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>送出本月份作業審核 (+40 XP)</span>
                    </button>

                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-500">無此月份之核心作業指標</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
