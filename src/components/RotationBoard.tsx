import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Student, DEPARTMENTS, MONTH_NAMES } from '../types';

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
}

export default function RotationBoard({ student, onUpdateStatus, onMarkRolled }: RotationBoardProps) {
  // Find first unfinished or pending month to set as default active month
  let defaultActiveMonth = 1;
  for (let m = 1; m <= 12; m++) {
    if (!student.rotationStatus[m] || student.rotationStatus[m].status !== 'approved') {
      defaultActiveMonth = m;
      break;
    }
  }

  const [activeMonth, setActiveMonth] = useState<number>(defaultActiveMonth);
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
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center">
            <Trophy className="h-5 w-5 text-teal-600 mr-2" />
            急診 12 個月輪訓地圖
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            依據您的年度課表規律，點擊地圖中的任一月份科別。您可以在右側/下方查看該科別的核心訓練目標與重點任務，並在此上傳佐證資料申報學分。
          </p>
        </div>
        
        {/* Approved counts */}
        <div className="flex items-center space-x-3 bg-teal-50 border border-teal-100 rounded-lg px-4 py-2 text-xs shrink-0 self-start md:self-auto">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          <div>
            <span className="block text-[10px] text-teal-700 font-extrabold uppercase font-mono tracking-wider">ROUNDS COMPLETED</span>
            <span className="text-sm font-black text-slate-800 font-mono">
              {Object.values(student.rotationStatus).filter(s => s.status === 'approved').length} <span className="text-slate-400 font-normal">/ 12 個月</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Monopoly Board (Left) + Side Panel Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monopoly Board (Col-span 7) */}
        <div className="lg:col-span-7 bg-slate-900/5 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[460px]">
          
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

            {/* Render 12 months */}
            {boardLayout.map((layout) => {
              const currentDeptId = student.schedule[layout.month - 1] || 'adult-er';
              const currentDept = DEPARTMENTS[currentDeptId];
              const mStatus = student.rotationStatus[layout.month];
              const isSelected = activeMonth === layout.month;

              // Grid position strings
              const gridRowClass = `row-start-${layout.row + 1}`;
              const gridColClass = `col-start-${layout.col + 1}`;

              // Determine styling
              let bgClass = 'bg-white hover:bg-slate-50 border-slate-200';
              let badgeColor = 'bg-slate-100 text-slate-500';
              let badgeText = '未申報';

              if (mStatus) {
                if (mStatus.status === 'approved') {
                  bgClass = 'bg-teal-50/70 hover:bg-teal-50 border-teal-300';
                  badgeColor = 'bg-teal-500 text-white';
                  badgeText = '已核可';
                } else if (mStatus.status === 'pending') {
                  bgClass = 'bg-amber-50/70 hover:bg-amber-50 border-amber-300';
                  badgeColor = 'bg-amber-500 text-white';
                  badgeText = '待審核';
                } else if (mStatus.status === 'rejected') {
                  bgClass = 'bg-rose-50/70 hover:bg-rose-50 border-rose-300';
                  badgeColor = 'bg-rose-500 text-white';
                  badgeText = '退回';
                }
              }

              if (isSelected) {
                bgClass = 'bg-teal-600 text-white border-teal-700 ring-4 ring-teal-200 shadow-md';
              }

              return (
                <button
                  key={layout.month}
                  onClick={() => setActiveMonth(layout.month)}
                  className={`relative rounded-xl border p-2 flex flex-col justify-between items-center text-center transition-all cursor-pointer select-none ${gridRowClass} ${gridColClass} ${bgClass}`}
                >
                  {/* Top: Month ID */}
                  <span className={`text-[9px] font-black font-mono tracking-wider ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                    M{layout.month}
                  </span>

                  {/* Mid: Icon */}
                  <div className={`my-1 ${isSelected ? 'text-white scale-110' : 'text-teal-600'}`}>
                    {getDeptIcon(currentDept?.icon || 'Activity')}
                  </div>

                  {/* Bot: Dept Label */}
                  <span className={`text-[10px] font-extrabold truncate w-full ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {currentDept?.name || '成人急診'}
                  </span>

                  {/* Small absolute indicator status */}
                  {!isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      {mStatus?.status === 'approved' && <span className="absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />}
                      {mStatus?.status === 'pending' && <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 animate-ping" />}
                      {mStatus?.status === 'rejected' && <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500" />}
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
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          
          {/* Month & Dept details */}
          <div className="border-b border-slate-100 pb-3">
            <span className="rounded bg-teal-50 border border-teal-100 px-2 py-0.5 text-[9px] font-extrabold text-teal-700 tracking-wider font-mono">
              MONTH {activeMonth} STATUS
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              {MONTH_NAMES[activeMonth - 1]} 輪訓：{selectedDept.fullName}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {selectedDept.description}
            </p>
          </div>

          {/* Tasks & Milestones */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-teal-600" />
              本月 core tasks 訓練指標：
            </h4>
            <div className="space-y-1">
              {selectedDept.tasks.map((task, i) => (
                <div key={i} className="flex items-start text-xs text-slate-600 leading-normal">
                  <span className="text-teal-500 font-bold mr-1.5">•</span>
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
                <div className="rounded-xl border p-4 bg-slate-50/50 space-y-3 text-xs">
                  
                  {/* Status row */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500">當前審查進度：</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      rotationStatus.status === 'approved' 
                        ? 'bg-teal-100 text-teal-700' 
                        : rotationStatus.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-rose-100 text-rose-700'
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
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="block text-[10px] font-black text-slate-400">上傳之心得與反思：</span>
                      <p className="text-slate-700 leading-relaxed italic whitespace-pre-wrap mt-0.5">
                        &ldquo;{rotationStatus.notes || '無填寫心得'}&rdquo;
                      </p>
                    </div>

                    <div>
                      <span className="block text-[10px] font-black text-slate-400">提交之佐證檔案：</span>
                      <div className="flex items-center space-x-2 mt-1 p-2 rounded bg-white border border-slate-100">
                        <FileText className="h-4 w-4 text-teal-600" />
                        <span className="font-semibold text-slate-700 truncate">{rotationStatus.fileName}</span>
                      </div>
                    </div>

                    {rotationStatus.feedback && (
                      <div className="bg-amber-50/50 p-2.5 rounded border border-amber-100 mt-2">
                        <span className="block text-[10px] font-black text-amber-800">VS 導師回饋意見：</span>
                        <p className="text-amber-900 font-medium italic mt-0.5">
                          &ldquo;{rotationStatus.feedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* If rejected, let them resubmit */}
                {rotationStatus.status === 'rejected' && (
                  <div className="pt-2 border-t border-slate-100">
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
                  <label className="block text-xs font-bold text-slate-700">
                    輪訓學習心得與成果反思 (Reflective Learning)
                  </label>
                  <textarea
                    placeholder="請輸入您在本輪訓科別期間的學習反思，例如：學習了哪些特定手術/技術、特殊急症處置心得或需要改進之處..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Drag and Drop Upload Area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    上傳輪訓完畢科別簽章或評估表 (佐證證明)
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center flex flex-col items-center justify-center transition-all relative ${
                      dragActive 
                        ? 'border-teal-500 bg-teal-50/50' 
                        : fileNameInput 
                        ? 'border-teal-300 bg-teal-50/10' 
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}
                  >
                    <Upload className="h-6 w-6 text-slate-400 mb-2" />
                    
                    {fileNameInput ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-teal-800 truncate max-w-xs">{fileNameInput}</p>
                        <p className="text-[10px] text-slate-400">已就緒。可點擊重新拖曳</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-600">
                          拖曳檔案至此或 <span className="text-teal-600 underline cursor-pointer">點擊選擇</span>
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
                      className="text-teal-600 font-bold hover:underline cursor-pointer"
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
