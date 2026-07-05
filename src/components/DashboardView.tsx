import React from 'react';
import { 
  Activity, 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  FileText,
  User,
  ShieldAlert,
  ArrowUpRight,
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
  Skull,
  Mountain,
  Crown,
  Venus,
  AudioLines,
  CloudLightning,
  Clock,
  Trophy
} from 'lucide-react';
import { Student, Course, Homework, DEPARTMENTS, COURSES, MONTH_NAMES } from '../types';

const renderDeptIcon = (iconName: string) => {
  const props = { className: "h-8 w-8 text-teal-600" };
  switch (iconName) {
    case 'Activity': return <Activity {...props} />;
    case 'Brain': return <Brain {...props} />;
    case 'Baby': return <Baby {...props} />;
    case 'HeartPulse': return <HeartPulse {...props} />;
    case 'Eye': return <Eye {...props} />;
    case 'Ear': return <Ear {...props} />;
    case 'Ambulance': return <Ambulance {...props} />;
    case 'Smile': return <Smile {...props} />;
    case 'Heart': return <Heart {...props} />;
    case 'Waves': return <Waves {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'ShieldAlert': return <ShieldAlert {...props} />;
    case 'Skull': return <Skull {...props} />;
    case 'Mountain': return <Mountain {...props} />;
    case 'Crown': return <Crown {...props} />;
    case 'User': return <User {...props} />;
    case 'Venus': return <Venus {...props} />;
    case 'AudioLines': return <AudioLines {...props} />;
    case 'CloudLightning': return <CloudLightning {...props} />;
    case 'Calendar': return <Calendar {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'Trophy': return <Trophy {...props} />;
    default: return <Activity {...props} />;
  }
};

interface DashboardViewProps {
  student: Student;
  onTabChange: (tab: string) => void;
  onUpdateOngoingMonth?: (month: number) => void;
}

export default function DashboardView({ student, onTabChange, onUpdateOngoingMonth }: DashboardViewProps) {
  // Determine current active month based on unfinished schedules
  // Find first month index (1-12) that is not approved, or use currentOngoingMonth if set by user
  let currentMonthIndex = student.currentOngoingMonth || 0;
  if (!currentMonthIndex) {
    currentMonthIndex = 1;
    for (let m = 1; m <= 12; m++) {
      if (!student.rotationStatus[m] || student.rotationStatus[m].status !== 'approved') {
        currentMonthIndex = m;
        break;
      }
    }
  }

  const currentDeptId = student.schedule[currentMonthIndex - 1] || 'adult-er';
  const currentDept = DEPARTMENTS[currentDeptId] || DEPARTMENTS['adult-er'];

  // Calculate statistics
  const totalRotationsCount = 12;
  const completedRotationsCount = Object.values(student.rotationStatus).filter(s => s.status === 'approved').length;
  const pendingRotationsCount = Object.values(student.rotationStatus).filter(s => s.status === 'pending').length;

  const applicableCourses = COURSES.filter(c => student.admissionYear >= c.applicableFrom);
  const totalCoursesCount = applicableCourses.length;
  const completedCoursesCount = Object.entries(student.courseStatus)
    .filter(([courseId, s]) => {
      const course = COURSES.find(c => c.id === courseId);
      return course && student.admissionYear >= course.applicableFrom && s.status === 'approved';
    }).length;
  const pendingCoursesCount = Object.entries(student.courseStatus)
    .filter(([courseId, s]) => {
      const course = COURSES.find(c => c.id === courseId);
      return course && student.admissionYear >= course.applicableFrom && s.status === 'pending';
    }).length;

  // Filter homework for current RLevel based on applicable frequency
  const getApplicableMonthsForRLevel = (rLevel: string): number[] => {
    switch (rLevel) {
      case 'R1': return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      case 'R2':
      case 'R3': return [1, 4, 7, 10];
      case 'R4': return [1, 12];
      default: return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
  };
  const applicableMonths = getApplicableMonthsForRLevel(student.rLevel);
  const totalHwsCount = applicableMonths.length;

  const completedHwsCount = Object.entries(student.homeworkStatus).filter(([hwId, s]) => {
    const isLevelMatch = hwId.startsWith(`hw-${student.rLevel.toLowerCase()}`);
    if (!isLevelMatch) return false;
    const monthNum = parseInt(hwId.split('-').pop() || '0');
    return applicableMonths.includes(monthNum) && s.status === 'approved';
  }).length;

  const pendingHwsCount = Object.entries(student.homeworkStatus).filter(([hwId, s]) => {
    const isLevelMatch = hwId.startsWith(`hw-${student.rLevel.toLowerCase()}`);
    if (!isLevelMatch) return false;
    const monthNum = parseInt(hwId.split('-').pop() || '0');
    return applicableMonths.includes(monthNum) && s.status === 'pending';
  }).length;

  const totalProgressPercent = Math.round(
    ((completedRotationsCount + completedCoursesCount + completedHwsCount) / 
    (totalRotationsCount + totalCoursesCount + totalHwsCount)) * 100
  );

  // 112-115 cohort check
  const showDisasterAlert = student.admissionYear >= 112;
  const showGeriatricsAlert = student.admissionYear >= 115;

  // Get active alerts
  const disasterCourses = COURSES.filter(c => c.category === 'disaster');
  const finishedDisasterCount = disasterCourses.filter(c => student.courseStatus[c.id]?.status === 'approved').length;
  const pendingDisasterCount = disasterCourses.filter(c => student.courseStatus[c.id]?.status === 'pending').length;

  const geriatricsCourses = COURSES.filter(c => c.category === 'geriatrics');
  const finishedGeriCount = geriatricsCourses.filter(c => student.courseStatus[c.id]?.status === 'approved').length;
  const pendingGeriCount = geriatricsCourses.filter(c => student.courseStatus[c.id]?.status === 'pending').length;

  // Collect feedback
  const feedbackList: { itemName: string; type: string; status: 'approved' | 'rejected' | 'pending'; feedback?: string; date?: string }[] = [];
  
  // Rotations feedback
  Object.entries(student.rotationStatus).forEach(([m, s]) => {
    if (s.status !== 'pending' && (s.feedback || s.status === 'approved')) {
      feedbackList.push({
        itemName: `${m}月份輪訓 - ${DEPARTMENTS[student.schedule[parseInt(m) - 1]]?.name || '成人急診'}`,
        type: '科別輪訓',
        status: s.status,
        feedback: s.feedback,
        date: s.submittedAt
      });
    }
  });

  // Courses feedback
  Object.entries(student.courseStatus).forEach(([cId, s]) => {
    const course = COURSES.find(c => c.id === cId);
    if (course && (s.feedback || s.status === 'approved')) {
      feedbackList.push({
        itemName: `學會課程 - ${course.name}`,
        type: '學會課程',
        status: s.status,
        feedback: s.feedback,
        date: s.submittedAt
      });
    }
  });

  // Homework feedback
  Object.entries(student.homeworkStatus).forEach(([hwId, s]) => {
    if (hwId.startsWith(`hw-${student.rLevel.toLowerCase()}`) && (s.feedback || s.status === 'approved')) {
      const hwIndex = hwId.split('-').pop(); // e.g. "1" from "hw-r1-1"
      feedbackList.push({
        itemName: `${hwIndex}月份臨床作業`,
        type: '每月作業',
        status: s.status,
        feedback: s.feedback,
        date: s.submittedAt
      });
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Welcome Hero with Integrated Promotion Map */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 text-white shadow-xl space-y-6">
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400 via-indigo-900 to-transparent pointer-events-none rounded-r-2xl" />
        
        {/* Top Section: Welcome Info & Level/XP */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-300 uppercase tracking-wider font-mono">
                {student.rLevel} 住院醫師
              </span>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase tracking-wider font-mono">
                {student.admissionYear}年度
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight font-display sm:text-2xl md:text-3xl">
              哈囉，{student.name} 醫師！
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              這是您的電子輔助訓練系統。依據急診醫學會 CBME 精神，請在此掌握您的輪訓、必修學會課程以及每月應繳作業進度。
            </p>
          </div>

          {/* Core Level and XP */}
          <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-xl p-4 self-start md:self-auto backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500 text-white font-extrabold text-xl font-display shadow-md shadow-teal-500/20">
              L{student.level}
            </div>
            <div>
              <span className="block text-[10px] font-extrabold tracking-widest text-teal-400 uppercase font-mono">CURRENT XP</span>
              <span className="text-lg font-black font-mono text-white leading-none">{student.xp} <span className="text-xs text-slate-400 font-normal">/ 500</span></span>
              <div className="mt-1.5 h-1.5 w-32 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-teal-400 rounded-full" 
                  style={{ width: `${(student.xp / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integrated R1-R2-R3-R4 Promotion Map */}
        <div className="border-t border-white/10 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                住院醫師年度訓練晉升地圖 (Resident Promotion Map)
              </h3>
              <p className="text-[11px] text-slate-300 mt-1">
                您當前的訓練階段為 <strong>{student.rLevel}</strong>，此階段學分與核檢任務已完成 <strong className="text-teal-400 font-mono">{totalProgressPercent}%</strong>。完成所有必修學分與作業即可解鎖晉升！
              </p>
            </div>
          </div>

          {/* Visual Progress Track */}
          <div className="relative py-10 px-4 sm:px-12 mt-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            
            {/* Connector Line Track */}
            <div className="absolute top-1/2 left-4 right-4 sm:left-12 sm:right-12 h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
            
            {/* Active Connector Line */}
            <div 
              className="absolute top-1/2 left-4 sm:left-12 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 -translate-y-1/2 rounded-full transition-all duration-1000" 
              style={{
                width: (() => {
                  const levels: Record<string, number> = { 'R1': 0, 'R2': 33, 'R3': 66, 'R4': 100 };
                  const baseWidth = levels[student.rLevel] || 0;
                  // Add sub-percentage proportional progress between milestones!
                  const stepContribution = 33 * (totalProgressPercent / 100);
                  const finalWidth = Math.min(100, baseWidth + stepContribution);
                  return `${finalWidth}%`;
                })()
              }}
            />

            {/* 4 Milestone Nodes (R1, R2, R3, R4) */}
            <div className="relative flex justify-between items-center w-full">
              {['R1', 'R2', 'R3', 'R4'].map((levelName, idx) => {
                const rLevels = ['R1', 'R2', 'R3', 'R4'];
                const currentIdx = rLevels.indexOf(student.rLevel);
                const nodeIdx = idx;
                
                const isPassed = nodeIdx < currentIdx;
                const isCurrent = nodeIdx === currentIdx;

                let nodeBg = 'bg-slate-900 border-slate-700 text-slate-400';
                if (isPassed) {
                  nodeBg = 'bg-teal-500 border-teal-400 text-white shadow-md shadow-teal-500/25';
                } else if (isCurrent) {
                  nodeBg = 'bg-slate-950 border-teal-400 text-teal-300 ring-4 ring-teal-500/35 shadow-md scale-110';
                }

                return (
                  <div key={levelName} className="flex flex-col items-center relative z-10">
                    
                    {/* Floating Character & Bubble above current stage */}
                    {isCurrent && (
                      <div className="absolute bottom-12 flex flex-col items-center animate-bounce duration-1000 shrink-0 select-none">
                        {/* Completion Bubble */}
                        <div className="bg-white text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg shadow-xl whitespace-nowrap mb-1.5 relative border border-teal-400">
                          {student.name} {totalProgressPercent}%
                          {/* Downward triangle arrow */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-teal-400 rotate-45" />
                        </div>

                        {/* Character Avatar Emoji/Photo */}
                        <div className="h-9 w-9 rounded-full border-2 border-teal-400 bg-teal-950 flex items-center justify-center text-base overflow-hidden">
                          {student.avatar && student.avatar.startsWith('data:') ? (
                            <img src={student.avatar} referrerPolicy="no-referrer" alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{student.avatar || '👨‍⚕️'}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Milestone circle node */}
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-xs tracking-tight transition-all duration-500 ${nodeBg}`}>
                      {isPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <span>{levelName}</span>
                      )}
                    </div>

                    {/* Stage Label */}
                    <div className="text-center mt-2.5">
                      <span className={`block text-[10px] font-extrabold ${isCurrent ? 'text-teal-300' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                        {levelName === 'R1' ? 'R1 基礎訓練' : 
                         levelName === 'R2' ? 'R2 重症探索' : 
                         levelName === 'R3' ? 'R3 專長深造' : 
                         'R4 總住院醫師'}
                      </span>
                      <span className="block text-[8px] text-slate-400 font-medium max-w-[80px] leading-tight mx-auto mt-0.5">
                        {levelName === 'R1' ? '核心評量 & 每月申報' : 
                         levelName === 'R2' ? '重症超音波學分' : 
                         levelName === 'R3' ? '災難毒物學分' : 
                         '教學與行政指標'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>



      {/* Visual Completion Summary Card (At a glance completed vs incomplete) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-600 animate-pulse" />
              訓練項目核檢與完成狀態總覽 (At-a-Glance Completion Status)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              一目了然掌握您的「輪訓地圖」、「必修課程」與「每月作業」審核完成度。
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-md bg-teal-500 border border-teal-600 block"></span>已核准</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-md bg-amber-500 border border-amber-600 block"></span>審核中</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-md bg-slate-100 border border-slate-200 block"></span>未申報</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Track 1: 12-Month Rotation Map */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                12 個月輪訓地圖
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">
                {completedRotationsCount} / 12 個月
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }).map((_, idx) => {
                const month = idx + 1;
                const deptId = student.schedule[idx] || 'adult-er';
                const dept = DEPARTMENTS[deptId];
                const status = student.rotationStatus[month]?.status;

                let stateColor = 'bg-white text-slate-400 border-slate-200';
                if (status === 'approved') {
                  stateColor = 'bg-teal-500 text-white border-teal-600 font-bold';
                } else if (status === 'pending') {
                  stateColor = 'bg-amber-500 text-white border-amber-600 font-bold animate-pulse';
                }

                return (
                  <div 
                    key={month} 
                    className={`rounded-lg border p-1 text-center text-[10px] transition-all flex flex-col justify-between h-11 shadow-xs ${stateColor}`}
                    title={`${month}月份輪訓: ${dept?.fullName || ''} (狀態: ${status || '未提交'})`}
                  >
                    <span className="block font-black text-[9px]">{month}月</span>
                    <span className="block text-[8px] truncate max-w-full font-bold">
                      {dept?.name || '無'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 2: Required Courses */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                學會必修課程進度
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                {completedCoursesCount} / {totalCoursesCount} 門
              </span>
            </div>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {applicableCourses.map((course) => {
                const sub = student.courseStatus[course.id];
                const status = sub?.status;

                let iconEl = <div className="h-2 w-2 rounded-full bg-slate-200 shrink-0" />;
                let textStyle = 'text-slate-500';
                let bgStyle = 'bg-white border-slate-200';

                if (status === 'approved') {
                  iconEl = <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />;
                  textStyle = 'text-slate-800 font-bold';
                  bgStyle = 'bg-teal-50 border-teal-100';
                } else if (status === 'pending') {
                  iconEl = <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />;
                  textStyle = 'text-slate-700 font-semibold';
                  bgStyle = 'bg-amber-50 border-amber-100';
                }

                return (
                  <div 
                    key={course.id} 
                    className={`flex items-center justify-between border rounded-lg px-2.5 py-1 text-[10px] shadow-2xs ${bgStyle}`}
                  >
                    <span className={`truncate max-w-[150px] ${textStyle}`} title={course.name}>
                      {course.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[8px] text-slate-400 font-mono">
                        {status === 'approved' ? '已完成' : status === 'pending' ? '審核中' : '未申報'}
                      </span>
                      {iconEl}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Track 3: Monthly Assignment (Homework) */}
          <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                每月臨床作業 ({student.rLevel})
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-mono">
                {completedHwsCount} / {totalHwsCount} 件
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {applicableMonths.map((monthNum) => {
                const hwId = `hw-${student.rLevel.toLowerCase()}-${monthNum}`;
                const sub = student.homeworkStatus[hwId];
                const status = sub?.status;

                let stateColor = 'bg-white text-slate-400 border-slate-200';
                if (status === 'approved') {
                  stateColor = 'bg-rose-500 text-white border-rose-600 font-bold';
                } else if (status === 'pending') {
                  stateColor = 'bg-amber-500 text-white border-amber-600 font-bold animate-pulse';
                }

                return (
                  <div 
                    key={monthNum}
                    className={`rounded-lg border p-1 text-center text-[10px] transition-all flex flex-col justify-between h-11 shadow-xs ${stateColor}`}
                    title={`${monthNum}月作業: ${status === 'approved' ? '已核可' : status === 'pending' ? '審核中' : '未完成'}`}
                  >
                    <span className="block font-black text-[9px]">{monthNum}月</span>
                    <span className="block text-[8px] font-bold">
                      {status === 'approved' ? '已核可' : status === 'pending' ? '待審' : '未交'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Grid: Left Column (Current Rotation & 112-115 alert) | Right Column (Stats & Feedback) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Rotation Cell */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <h3 className="text-sm font-extrabold text-slate-800">
                    目前進行訓練月份：
                  </h3>
                  <select
                    value={currentMonthIndex}
                    onChange={(e) => onUpdateOngoingMonth?.(parseInt(e.target.value))}
                    className="text-xs font-black bg-teal-50 border border-teal-200 text-teal-800 rounded-md px-2.5 py-1 outline-none cursor-pointer focus:ring-1 focus:ring-teal-500 transition-all hover:bg-teal-100"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name} (M{idx + 1})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>系統時間：2026年7月5日</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-bold">
                <span>💡 預設為首個未核准科別 (M{currentMonthIndex})，您可使用選單任意變更目前進行中的月份以供模擬與申報。</span>
                <button 
                  onClick={() => onTabChange('monopoly')}
                  className="flex items-center text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                >
                  進入輪訓地圖 <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-600 shadow-sm">
                {renderDeptIcon(currentDept.icon)}
              </div>
              
              <div className="space-y-2 flex-1">
                <h4 className="text-base font-extrabold text-slate-900">
                  {currentDept.fullName}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {currentDept.description}
                </p>
                
                {/* Core Objectives */}
                <div className="pt-2">
                  <span className="block text-[11px] font-extrabold text-slate-600 mb-1">本月核心任務 & CBME 重點：</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {currentDept.tasks.map((task, i) => (
                      <div key={i} className="flex items-start text-xs text-slate-600">
                        <span className="mr-1.5 text-teal-500 font-bold">•</span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Rotation Checklist Alert */}
                <div className="mt-4 rounded-lg bg-teal-50/50 border border-teal-100 p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-xs font-medium text-teal-900">本月結束前記得完成輪訓表單並上傳證明！</span>
                  </div>
                  <button 
                    onClick={() => onTabChange('monopoly')}
                    className="rounded bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-teal-700 cursor-pointer"
                  >
                    去填表單
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 112-115 Cohort Smart Alert Notice Board (Mandatory Course Checklist) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    急診醫學會 112-115 專科訓練新制必修提醒
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    系統依據您的訓練年度 <strong>{student.admissionYear} 年度</strong> 自動過濾必修科目
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTabChange('courses')}
                className="flex items-center text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                前往必修課程區 <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Disaster Medicine Card */}
              <div className={`rounded-lg border p-3 bg-white ${showDisasterAlert ? 'border-amber-200 shadow-sm' : 'border-slate-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-rose-500" />
                    災難醫學必修 (112年起)
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded ${showDisasterAlert ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                    {showDisasterAlert ? '您符合此規範' : '此年未強制'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  含初階災難訓練、毒化災/核災訓練各6h、災難聯合討論會3次、演習參加3場。
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500">
                    已核准進度：
                  </span>
                  <span className="text-xs font-mono font-black text-slate-800">
                    {finishedDisasterCount} / 6
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(finishedDisasterCount / 6) * 100}%` }}
                  />
                </div>
              </div>

              {/* Geriatric EM Card */}
              <div className={`rounded-lg border p-3 bg-white ${showGeriatricsAlert ? 'border-amber-200 shadow-sm' : 'border-slate-200 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center">
                    <span className="mr-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                    高齡急診醫學 (115年起)
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded ${showGeriatricsAlert ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                    {showGeriatricsAlert ? '您符合此規範' : '此年未強制'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  含高齡急診評估、非典型表現、藥物、安寧緩和、外傷等 9 項線上訓練課程。
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500">
                    已核准進度：
                  </span>
                  <span className="text-xs font-mono font-black text-slate-800">
                    {finishedGeriCount} / 9
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(finishedGeriCount / 9) * 100}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Stats & Teacher Feedbacks */}
        <div className="space-y-6">
          
          {/* Bento Stats Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
              訓練作業與進度統計
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              
              <div 
                onClick={() => onTabChange('monopoly')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-teal-50 border border-teal-100 cursor-pointer hover:bg-teal-100/50 transition-all text-center"
              >
                <span className="text-lg font-black text-teal-700 font-mono">
                  {completedRotationsCount}
                </span>
                <span className="text-[10px] text-slate-500 font-bold mt-1">輪訓完畢</span>
                {pendingRotationsCount > 0 && (
                  <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1 rounded-full mt-0.5">
                    {pendingRotationsCount} 待審
                  </span>
                )}
              </div>

              <div 
                onClick={() => onTabChange('courses')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-50 border border-indigo-100 cursor-pointer hover:bg-indigo-100/50 transition-all text-center"
              >
                <span className="text-lg font-black text-indigo-700 font-mono">
                  {completedCoursesCount}
                </span>
                <span className="text-[10px] text-slate-500 font-bold mt-1">必修核可</span>
                {pendingCoursesCount > 0 && (
                  <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1 rounded-full mt-0.5">
                    {pendingCoursesCount} 待審
                  </span>
                )}
              </div>

              <div 
                onClick={() => onTabChange('homework')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-rose-50 border border-rose-100 cursor-pointer hover:bg-rose-100/50 transition-all text-center"
              >
                <span className="text-lg font-black text-rose-700 font-mono">
                  {completedHwsCount}
                </span>
                <span className="text-[10px] text-slate-500 font-bold mt-1">核可作業</span>
                {pendingHwsCount > 0 && (
                  <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1 rounded-full mt-0.5">
                    {pendingHwsCount} 待審
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Teacher feedback feed */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase flex items-center">
              <MessageCircle className="h-4 w-4 mr-1 text-teal-600" />
              導師最新審核與回饋
            </h3>

            {feedbackList.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                <User className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">目前尚無審核記錄或導師回饋</p>
                <p className="text-[10px] text-slate-300 mt-1">送出輪訓表單、課程或作業後，</p>
                <p className="text-[10px] text-slate-300">導師核可的回饋會顯示於此處</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {feedbackList.slice(-4).reverse().map((fb, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-100 p-3 bg-slate-50/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{fb.itemName}</span>
                      <span className={`flex items-center text-[9px] font-bold px-1.5 py-0.25 rounded ${
                        fb.status === 'approved' 
                          ? 'bg-teal-100 text-teal-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {fb.status === 'approved' ? (
                          <>
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            核可 (+50 XP)
                          </>
                        ) : (
                          <>
                            <XCircle className="h-2.5 w-2.5 mr-0.5" />
                            退回
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] font-medium text-slate-400">
                      <span>{fb.type}</span>
                      {fb.date && (
                        <>
                          <span>•</span>
                          <span>{fb.date}</span>
                        </>
                      )}
                    </div>

                    {fb.feedback ? (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 font-medium italic">
                        &ldquo;{fb.feedback}&rdquo;
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-medium italic">
                        無導師書面回饋
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
