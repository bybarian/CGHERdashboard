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
  Trophy,
  GraduationCap,
  Check,
  Filter,
  Info,
  Lock,
  Unlock,
  Send,
  Hourglass,
  ShieldCheck,
  FileCheck,
  UserCheck,
  Users,
  KeyRound
} from 'lucide-react';
import { 
  Student, 
  Course, 
  Homework, 
  DEPARTMENTS, 
  COURSES, 
  MONTH_NAMES, 
  ClockMode, 
  RLevel,
  RECOMMENDED_CURRICULUM_MATRIX, 
  RecommendedCurriculumItem,
  checkPromotionEligibility,
  getApplicableMonthsForRLevel,
  NEXT_R_LEVEL,
  PromotionCheckResult,
  Mentor,
  DEFAULT_MENTORS,
  getCurriculumReminders
} from '../types';


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
  systemOngoingMonth: number;
  systemDateText: string;
  clockMode?: ClockMode;
  currentTimeText?: string;
  onToggleCurriculumItem?: (studentId: string, itemId: string, completed: boolean) => void;
  onApplyPromotion?: (studentId: string, notes?: string) => void;
  onCancelPromotion?: (studentId: string) => void;
  onRevertPromotion?: (studentId: string) => void;
  onUpdateMentor?: (studentId: string, mentorName: string, mentorTitle?: string) => void;
  mentors?: Mentor[];
  onOpenChangePassword?: () => void;
  onLockStudent?: () => void;
  residentPasswordRequired?: boolean;
  isUnlocked?: boolean;
}

export default function DashboardView({ 
  student, 
  onTabChange, 
  systemOngoingMonth, 
  systemDateText,
  clockMode = 'auto',
  currentTimeText = '',
  onToggleCurriculumItem,
  onApplyPromotion,
  onCancelPromotion,
  onRevertPromotion,
  onUpdateMentor,
  mentors = DEFAULT_MENTORS,
  onOpenChangePassword,
  onLockStudent,
  residentPasswordRequired = true,
  isUnlocked = false
}: DashboardViewProps) {
  const currentMonthIndex = systemOngoingMonth;

  // Curriculum Filter State
  const [curriculumFilter, setCurriculumFilter] = React.useState<'all' | 'myYear' | 'R1' | 'R2' | 'R3' | 'R4' | 'incomplete'>('all');

  // Promotion States
  const promotionEligibility = checkPromotionEligibility(student);
  const [showPromotionModal, setShowPromotionModal] = React.useState(false);
  const [promotionNotes, setPromotionNotes] = React.useState('');
  const [isSubmittingPromotion, setIsSubmittingPromotion] = React.useState(false);

  // Mentor Setting States
  const [showMentorModal, setShowMentorModal] = React.useState(false);
  const [selectedMentorName, setSelectedMentorName] = React.useState(student.mentorName || '');
  const [selectedMentorTitle, setSelectedMentorTitle] = React.useState(student.mentorTitle || '急診專科指導醫師');
  const [isCustomMentor, setIsCustomMentor] = React.useState(false);
  const [isSavingMentor, setIsSavingMentor] = React.useState(false);

  // Synchronize mentor inputs when student changes
  React.useEffect(() => {
    if (student.mentorName) {
      setSelectedMentorName(student.mentorName);
      setSelectedMentorTitle(student.mentorTitle || '急診專科指導醫師');
    }
  }, [student.mentorName, student.mentorTitle]);

  const currentDeptId = student.schedule[currentMonthIndex - 1] || 'adult-er';
  const currentDept = DEPARTMENTS[currentDeptId] || DEPARTMENTS['adult-er'];

  // Calculate statistics (R4 training extends to June of next year, so 6 months)
  const totalRotationsCount = student.rLevel === 'R4' ? 6 : 12;
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

  // Filter homework for current RLevel based on applicable frequency (R4: 1~6月共6個月)
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

  // Compute 112-115 Curriculum Reminders based on R1-R4 Recommended Matrix
  const curriculumReminders = getCurriculumReminders(student);

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

            {/* Resident Assigned Mentor Pill & Setting Button */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white">
                <UserCheck className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-slate-300">專屬指導導師：</span>
                <span className="font-extrabold text-teal-300">
                  {student.mentorName ? `${student.mentorName} (${student.mentorTitle || '指導醫師'})` : '尚未指定導師'}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedMentorName(student.mentorName || '');
                  setSelectedMentorTitle(student.mentorTitle || '急診專科指導醫師');
                  setIsCustomMentor(false);
                  setShowMentorModal(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/25 hover:bg-teal-500/40 border border-teal-400/50 text-teal-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="點擊設定或更換您的急診教學指導導師"
              >
                <Users className="h-3.5 w-3.5" />
                <span>{student.mentorName ? '更換導師' : '設定導師'}</span>
                <ChevronRight className="h-3 w-3" />
              </button>

              {/* Resident Security Status & Change Password Actions */}
              {residentPasswordRequired && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs text-white">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-200 font-bold">個人密碼安全保護中</span>
                  {onOpenChangePassword && (
                    <button
                      onClick={onOpenChangePassword}
                      className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all cursor-pointer"
                      title="修改您個人的登入密碼"
                    >
                      <KeyRound className="h-3 w-3 text-amber-300" />
                      <span>修改密碼</span>
                    </button>
                  )}
                  {onLockStudent && (
                    <button
                      onClick={onLockStudent}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-[11px] font-bold transition-all cursor-pointer"
                      title="鎖定當前醫師帳戶，下次需重新輸入密碼"
                    >
                      <Lock className="h-3 w-3" />
                      <span>鎖定</span>
                    </button>
                  )}
                </div>
              )}
            </div>
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
          <div className="relative pt-28 pb-8 sm:pt-36 sm:pb-10 px-4 sm:px-12 mt-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-xs">
            
            {/* Connector Line Track */}
            <div className="absolute top-[128px] sm:top-[160px] left-4 right-4 sm:left-12 sm:right-12 h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
            
            {/* Active Connector Line */}
            <div 
              className="absolute top-[128px] sm:top-[160px] left-4 sm:left-12 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 -translate-y-1/2 rounded-full transition-all duration-1000" 
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
                      <div className="absolute bottom-11 sm:bottom-12 flex flex-col items-center animate-bounce duration-1000 shrink-0 select-none z-20">
                        {/* Completion Bubble */}
                        <div className="bg-white text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap mb-1.5 relative border border-teal-400 flex items-center gap-1">
                          <span className="text-slate-900">{student.name}</span>
                          <span className="text-teal-600 font-mono font-extrabold">{totalProgressPercent}%</span>
                          {/* Downward triangle arrow */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-teal-400 rotate-45" />
                        </div>

                        {/* Character Avatar Emoji/Photo (Enlarged to 64px-80px for high visual clarity) */}
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-3 border-teal-400 bg-slate-900 flex items-center justify-center text-3xl sm:text-4xl overflow-hidden shadow-2xl shadow-teal-950/70 ring-4 ring-teal-400/30">
                          {student.avatar && (student.avatar.startsWith('data:') || student.avatar.startsWith('http')) ? (
                            <img 
                              src={student.avatar} 
                              referrerPolicy="no-referrer" 
                              alt={student.name} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <span>{student.avatar || '👨‍⚕️'}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Milestone circle node */}
                    <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 flex items-center justify-center font-black text-xs tracking-tight transition-all duration-500 ${nodeBg}`}>
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



      {/* Resident Annual Level Promotion & Mentor Approval Card */}
      <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
        promotionEligibility.isMaxLevel
          ? 'bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border-emerald-200'
          : student.promotionStatus?.status === 'pending'
          ? 'bg-gradient-to-r from-amber-50/60 to-orange-50/40 border-amber-300'
          : promotionEligibility.isOneYearCompleted
          ? 'bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/60 border-teal-300 shadow-md ring-2 ring-teal-400/20'
          : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              promotionEligibility.isMaxLevel
                ? 'bg-emerald-600 text-white'
                : student.promotionStatus?.status === 'pending'
                ? 'bg-amber-500 text-white animate-pulse'
                : promotionEligibility.isOneYearCompleted
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  急診專科住院醫師年度晉級升等審查
                </h3>
                {promotionEligibility.isMaxLevel ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                    R4 總醫師完訓
                  </span>
                ) : student.promotionStatus?.status === 'pending' ? (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 animate-pulse flex items-center gap-1">
                    <Hourglass className="h-3 w-3" /> 導師審查中
                  </span>
                ) : promotionEligibility.isOneYearCompleted ? (
                  <span className="bg-teal-100 text-teal-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-teal-300">
                    滿一年訓練合格 達標
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    滿一年訓練進行中
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                訓練規範：由 <strong>{student.rLevel}</strong> 晉升 <strong>{promotionEligibility.nextRLevel || '下一級'}</strong> 須完成<strong>滿一年訓練 (12 個月臨床輪訓及全年度常規評量審核通過)</strong>，且須由<strong>臨床指導導師核准</strong>。
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Criteria Checkpoints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
          
          {/* Criterion 1: 12-Month Rotation */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            promotionEligibility.approvedRotationsCount >= 12
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : 'bg-slate-50/80 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-600" />
                1. 臨床科別輪訓 (滿1年)
              </span>
              <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                promotionEligibility.approvedRotationsCount >= 12
                  ? 'bg-emerald-200/70 text-emerald-900'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {promotionEligibility.approvedRotationsCount} / 12 個月
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {promotionEligibility.approvedRotationsCount >= 12 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 12 個月輪訓皆已審核合格
                </span>
              ) : (
                <span>尚缺 <strong>{12 - promotionEligibility.approvedRotationsCount}</strong> 個月輪訓審查（需指導醫師核准）</span>
              )}
            </p>
            {/* Mini progress bar */}
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  promotionEligibility.approvedRotationsCount >= 12 ? 'bg-emerald-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, (promotionEligibility.approvedRotationsCount / 12) * 100)}%` }}
              />
            </div>
          </div>

          {/* Criterion 2: Annual Homework & Evaluations */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            promotionEligibility.approvedHomeworksCount >= promotionEligibility.totalRequiredHomeworks
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : 'bg-slate-50/80 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-teal-600" />
                2. 全年度常規作業與評量
              </span>
              <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                promotionEligibility.approvedHomeworksCount >= promotionEligibility.totalRequiredHomeworks
                  ? 'bg-emerald-200/70 text-emerald-900'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {promotionEligibility.approvedHomeworksCount} / {promotionEligibility.totalRequiredHomeworks} 項
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {promotionEligibility.approvedHomeworksCount >= promotionEligibility.totalRequiredHomeworks ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 全年度應申報作業全數核可
                </span>
              ) : (
                <span>尚缺 <strong>{promotionEligibility.totalRequiredHomeworks - promotionEligibility.approvedHomeworksCount}</strong> 項常規作業/自檢評量</span>
              )}
            </p>
            {/* Mini progress bar */}
            <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  promotionEligibility.approvedHomeworksCount >= promotionEligibility.totalRequiredHomeworks ? 'bg-emerald-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(100, (promotionEligibility.approvedHomeworksCount / (promotionEligibility.totalRequiredHomeworks || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Criterion 3: Teacher Mentor Approval */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            promotionEligibility.isMaxLevel
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : student.promotionStatus?.status === 'approved'
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : student.promotionStatus?.status === 'pending'
              ? 'bg-amber-50/60 border-amber-300 text-amber-950'
              : 'bg-slate-50/80 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                3. 急診教學導師線上核准
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                student.promotionStatus?.status === 'approved'
                  ? 'bg-emerald-200 text-emerald-900'
                  : student.promotionStatus?.status === 'pending'
                  ? 'bg-amber-200 text-amber-900 font-black'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {promotionEligibility.isMaxLevel ? '已完訓' :
                 student.promotionStatus?.status === 'approved' ? '導師已核准' : 
                 student.promotionStatus?.status === 'pending' ? '等候導師審核' : 
                 student.promotionStatus?.status === 'rejected' ? '需補訓退回' : '尚未送審'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {promotionEligibility.isMaxLevel ? (
                <span className="text-emerald-700 font-bold">全階段導師簽核完畢</span>
              ) : student.promotionStatus?.status === 'pending' ? (
                <span className="text-amber-800 font-bold">
                  已送交專屬導師【{student.mentorName || '教學導師'}】，請靜候核准簽核
                </span>
              ) : student.promotionStatus?.status === 'approved' ? (
                <span className="text-emerald-700 font-bold">{student.promotionStatus.approvedBy || student.mentorName || '急診導師'} 已核准</span>
              ) : student.promotionStatus?.status === 'rejected' ? (
                <span className="text-rose-700 font-bold">導師意見：{student.promotionStatus.rejectionReason}</span>
              ) : (
                <span>
                  負責簽核導師：<strong className="text-slate-700">{student.mentorName || '尚未指定 (請先於上方設定)'}</strong>。完成滿一年訓練後即可提出。
                </span>
              )}
            </p>
          </div>

        </div>

        {/* Promotion Action Area */}
        <div className="pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {promotionEligibility.isMaxLevel ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <span>您目前為最高階 R4 總住院醫師，已滿足急診專科甄審要求！</span>
            </div>
          ) : student.promotionStatus?.status === 'pending' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 bg-amber-100/60 p-3 rounded-xl border border-amber-200 w-full">
              <div className="flex items-center space-x-2">
                <Hourglass className="h-4 w-4 text-amber-700 animate-spin shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold">晉級申請審核中：</span>
                  <span>
                    已於 {student.promotionStatus.appliedAt} 提出由 <strong>{student.rLevel}</strong> 晉升 <strong>{promotionEligibility.nextRLevel}</strong> 之申請。請等候導師於「導師專區」完成簽核。
                  </span>
                </div>
              </div>
              {onCancelPromotion && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('確定要取消 / 撤回本次晉升送審申請嗎？撤回後可重新編輯送出。')) {
                      onCancelPromotion(student.id);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1 self-end sm:self-auto"
                >
                  <span>✕ 撤回 / 取消送審</span>
                </button>
              )}
            </div>
          ) : promotionEligibility.isOneYearCompleted ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
              <div className="text-xs text-teal-900 font-medium">
                <span className="font-black text-teal-800 text-sm block">
                  🎉 滿一年訓練核檢通過！具備升等資格
                </span>
                <span>您已完成 12/12 個月輪訓與常規作業，請點擊右側按鈕向急診教學導師提出升等審查申請。</span>
              </div>
              <button
                onClick={() => setShowPromotionModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
              >
                <Send className="h-4 w-4" />
                <span>向導師提出晉升【{promotionEligibility.nextRLevel}】申請</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700 block flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  尚未符合滿一年訓練門檻 (目前進度未達 12 個月輪訓)
                </span>
                <span>{promotionEligibility.missingReasons.join('，')}。需全年度訓練完成並經指導醫師核准後方能升等。</span>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 cursor-not-allowed flex items-center justify-center space-x-1.5 shrink-0"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>未完成滿一年訓練（無法申請升等）</span>
              </button>
            </div>
          )}
        </div>

        {/* Promotion Modal */}
        {showPromotionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-6 w-6 text-teal-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    向導師提出【{student.rLevel} 晉升 {promotionEligibility.nextRLevel}】審查申請
                  </h3>
                </div>
                <button
                  onClick={() => setShowPromotionModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 space-y-1.5">
                  <span className="font-bold text-teal-900 block">訓練審查資格自動查核：</span>
                  <div className="flex items-center space-x-1 text-teal-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>本學年 12 個月臨床科別輪訓：已完成並核可 (12/12) ✓</span>
                  </div>
                  <div className="flex items-center space-x-1 text-teal-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>本學年常規作業與核心檢核表：已完成並核可 ({promotionEligibility.approvedHomeworksCount}/{promotionEligibility.totalRequiredHomeworks}) ✓</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    年度自我回顧與學習備忘 (選填，將呈交指導導師參閱)：
                  </label>
                  <textarea
                    rows={3}
                    placeholder="請在此簡述過去一年臨床輪訓心得、急診核心技能成長，或對未來次年訓練之期許..."
                    value={promotionNotes}
                    onChange={(e) => setPromotionNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowPromotionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (onApplyPromotion) {
                      setIsSubmittingPromotion(true);
                      await onApplyPromotion(student.id, promotionNotes);
                      setIsSubmittingPromotion(false);
                      setShowPromotionModal(false);
                    }
                  }}
                  disabled={isSubmittingPromotion}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmittingPromotion ? '送出中...' : '確認送交導師審核'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mentor Selection Modal */}
        {showMentorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-6 w-6 text-teal-600" />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      設定專屬急診指導導師 (Assign Mentor)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      負責您 {student.rLevel} 住院醫師期間的臨床教學評核與年度晉級審查
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMentorModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 leading-relaxed">
                  💡 <strong>導師職責提示：</strong>急診專科住院醫師訓練新制規範，住院醫師由 R1 晉升 R2...需完成滿一年訓練並由<strong>專屬教學導師</strong>於導師專區審核核准。
                </div>

                {/* Quick Select from Hospital Mentor Faculty */}
                <div>
                  <span className="block font-bold text-slate-700 mb-2">
                    選擇急診醫學科教學指導主治醫師群：
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS).map((m) => {
                      const isPicked = selectedMentorName === m.name && !isCustomMentor;
                      return (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => {
                            setSelectedMentorName(m.name);
                            setSelectedMentorTitle(m.title);
                            setIsCustomMentor(false);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isPicked 
                              ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block">{m.name}</span>
                            <span className="text-[10px] text-slate-500 block">{m.title}</span>
                          </div>
                          {isPicked && <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Or Custom input */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">自行輸入其他主治醫師：</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomMentor(!isCustomMentor)}
                      className="text-xs text-teal-600 font-bold hover:underline cursor-pointer"
                    >
                      {isCustomMentor ? '切換為選單選擇' : '自訂輸入導師'}
                    </button>
                  </div>

                  {isCustomMentor && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          導師姓名：
                        </label>
                        <input
                          type="text"
                          placeholder="例如：陳建銘 醫師"
                          value={selectedMentorName}
                          onChange={(e) => setSelectedMentorName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          導師職稱：
                        </label>
                        <input
                          type="text"
                          placeholder="例如：急診專科指導主治醫師"
                          value={selectedMentorTitle}
                          onChange={(e) => setSelectedMentorTitle(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowMentorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (!selectedMentorName.trim()) {
                      alert('請選擇或輸入導師姓名！');
                      return;
                    }
                    if (onUpdateMentor) {
                      setIsSavingMentor(true);
                      await onUpdateMentor(student.id, selectedMentorName.trim(), selectedMentorTitle.trim());
                      setIsSavingMentor(false);
                      setShowMentorModal(false);
                    }
                  }}
                  disabled={isSavingMentor || !selectedMentorName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow transition-colors cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{isSavingMentor ? '儲存中...' : '確認指派為我的指導導師'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
                {student.rLevel === 'R4' ? 'R4 輪訓進度 (至隔年6月完訓)' : '12 個月輪訓地圖'}
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">
                {completedRotationsCount} / {totalRotationsCount} 個月
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }).map((_, idx) => {
                const month = idx + 1;
                const deptId = student.schedule[idx] || 'adult-er';
                const dept = DEPARTMENTS[deptId];
                const status = student.rotationStatus[month]?.status;
                const isEvenMonth = month % 2 === 0;

                // Alternating light green (odd) and deeper green (even)
                let stateColor = isEvenMonth
                  ? 'bg-emerald-100/90 hover:bg-emerald-200/90 border-emerald-300 text-emerald-950 font-medium'
                  : 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900 font-medium';

                if (status === 'approved') {
                  stateColor = isEvenMonth
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-850 font-black shadow-xs'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 font-black shadow-xs';
                } else if (status === 'pending') {
                  stateColor = 'bg-amber-500 text-white border-amber-600 font-bold animate-pulse';
                }

                return (
                  <div 
                    key={month} 
                    className={`rounded-lg border p-1 text-center text-[10px] transition-all flex flex-col justify-between h-11 shadow-xs cursor-pointer ${stateColor}`}
                    onClick={() => onTabChange('monopoly')}
                    title={`${month}月份輪訓: ${dept?.fullName || ''} (狀態: ${status === 'approved' ? '已核准' : status === 'pending' ? '審核中' : '未提交'}，點擊前往輪訓地圖)`}
                  >
                    <span className={`block font-black text-[9px] ${
                      status === 'approved' 
                        ? 'text-emerald-100' 
                        : isEvenMonth 
                        ? 'text-emerald-950' 
                        : 'text-emerald-800'
                    }`}>
                      {month}月
                    </span>
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
                const isEvenMonth = monthNum % 2 === 0;

                // Alternating light red (odd) and deeper red (even)
                let stateColor = isEvenMonth
                  ? 'bg-rose-100/90 hover:bg-rose-200/90 border-rose-300 text-rose-950 font-medium'
                  : 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-200 text-rose-900 font-medium';

                if (status === 'approved') {
                  stateColor = isEvenMonth
                    ? 'bg-rose-700 hover:bg-rose-800 text-white border-rose-850 font-black shadow-xs'
                    : 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 font-black shadow-xs';
                } else if (status === 'pending') {
                  stateColor = 'bg-amber-500 text-white border-amber-600 font-bold animate-pulse';
                }

                return (
                  <div 
                    key={monthNum}
                    className={`rounded-lg border p-1 text-center text-[10px] transition-all flex flex-col justify-between h-11 shadow-xs cursor-pointer ${stateColor}`}
                    onClick={() => onTabChange('homework')}
                    title={`${monthNum}月作業: ${status === 'approved' ? '已核可' : status === 'pending' ? '審核中' : '未完成'} (點擊前往每月作業)`}
                  >
                    <span className={`block font-black text-[9px] ${
                      status === 'approved' 
                        ? 'text-rose-100' 
                        : isEvenMonth 
                        ? 'text-rose-950' 
                        : 'text-rose-800'
                    }`}>
                      {monthNum}月
                    </span>
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
                  <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg px-2.5 py-1 text-xs font-black shadow-sm">
                    <span>{MONTH_NAMES[currentMonthIndex - 1]} (M{currentMonthIndex})</span>
                    <span className="text-[9px] bg-teal-600 text-white font-extrabold px-1.5 py-0.25 rounded-md flex items-center">
                      🔒 後台管控
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-600 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    <span>系統時間：</span>
                  </div>
                  <span className="font-mono text-slate-700">
                    {(() => {
                      if (!systemDateText) return '2026年7月5日';
                      const parts = systemDateText.split('-');
                      if (parts.length === 3) {
                        return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
                      }
                      return systemDateText;
                    })()}
                  </span>
                  {currentTimeText && (
                    <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.25 rounded border border-teal-200/60">
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
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-bold">
                <span>💡 系統進行月份目前由教學部進行後台統一排程管控，不開放住院醫師自行手動變更，以確保教學進度正確性。</span>
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

          {/* 112-115 Cohort Smart Alert Notice Board (Mandatory Course Checklist based on R1-R4 Recommended Matrix) */}
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/60 pb-3.5 gap-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-slate-900">
                      急診醫學會 112-115 專科訓練新制必修提醒
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-300 text-[10px] font-extrabold font-mono">
                      {student.rLevel} 專屬課表
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    依據<strong>「各年級建議核心必修課程與進展清單 (R1 - R4 建議修習課表)」</strong>為您即時比對必修指標
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTabChange('courses')}
                  className="flex items-center text-xs font-extrabold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors cursor-pointer shrink-0"
                >
                  前往必修課程區 <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            {/* R-Level Designated Curriculum Reminders Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-amber-200/70 shadow-2xs">
                <div>
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    【{student.rLevel} 本年級核心必修目標】(✓ 標記項目)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    學會建議於 <strong>{student.rLevel}</strong> 訓練年度內完成下列課程與證照取得：
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    完成率：{curriculumReminders.designatedCompletedCount} / {curriculumReminders.designatedItems.length} 項
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    curriculumReminders.designatedCompletedCount === curriculumReminders.designatedItems.length
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {curriculumReminders.designatedCompletedCount === curriculumReminders.designatedItems.length ? '本年必修達標 ✓' : '尚有待修課程 ⚠️'}
                  </span>
                </div>
              </div>

              {/* Designated items grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {curriculumReminders.designatedItems.map((entry) => {
                  const item = entry.item;
                  const isCompleted = entry.isCompleted;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.25 rounded text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.domain}
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              {item.itemName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            規範：<strong>{item.requirement}</strong>
                          </p>
                        </div>

                        {isCompleted ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 shrink-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> 已核准通過
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300 shrink-0 animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" /> 建議本年修習
                          </span>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 text-[10px]">
                          {item.description || '學會核心培訓項目'}
                        </span>
                        {item.linkedCourseId ? (
                          <button
                            onClick={() => onTabChange('courses')}
                            className="text-amber-700 hover:text-amber-900 font-bold hover:underline cursor-pointer"
                          >
                            {isCompleted ? '查看課程記錄' : '前往申報修課 ➔'}
                          </button>
                        ) : onToggleCurriculumItem ? (
                          <button
                            onClick={() => onToggleCurriculumItem(student.id, item.id, !isCompleted)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              isCompleted 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            }`}
                          >
                            {isCompleted ? '已取得證明' : '標記完成'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continuous Tracking and Year 112-115 Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {/* Disaster Medicine 112 Rule */}
              <div className={`rounded-xl border p-3.5 bg-white ${showDisasterAlert ? 'border-amber-200 shadow-2xs' : 'border-slate-200 opacity-70'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    112 新制：災難醫學專科修習指標
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    {student.admissionYear >= 112 ? '112起適用' : '參考指引'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                  含初階災難訓練、毒化災/核災各6h、災難討論會3次、演習參加3場。
                </p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">已核准進度：</span>
                  <span className="font-mono font-black text-slate-800">{finishedDisasterCount} / 6 項目</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(finishedDisasterCount / 6) * 100}%` }} />
                </div>
              </div>

              {/* Geriatric EM 115 Rule */}
              <div className={`rounded-xl border p-3.5 bg-white ${showGeriatricsAlert ? 'border-amber-200 shadow-2xs' : 'border-slate-200 opacity-70'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    115 新制：高齡急診核心 9 課
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    {student.admissionYear >= 115 ? '115起適用' : '建議修習'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                  含高齡急診評估、非典型表現、藥物、安寧緩和、外傷等 9 項線上訓練課程。
                </p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-bold">已核准進度：</span>
                  <span className="font-mono font-black text-slate-800">{finishedGeriCount} / 9 堂課</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(finishedGeriCount / 9) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Continuous progression items note */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-700">📌 全階段持續進展提醒 (→ 跨年級累積)：</span>
                <span className="text-slate-500">
                  毒物急症 (12例)、災難演習 (3場)、救護車出勤派遣 (20趟) 持續累積中。
                </span>
              </div>
              <button
                onClick={() => onTabChange('curriculum')}
                className="text-teal-700 hover:text-teal-900 font-bold shrink-0 cursor-pointer hover:underline"
              >
                查看 R1-R4 完整課表 ➔
              </button>
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

      {/* R1 - R4 Recommended Curriculum & Milestones Table (按照圖中建議呈現) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-teal-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                各年級建議核心必修課程與進展清單 (R1 - R4 建議修習課表)
              </h3>
              <span className="bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-black px-2 py-0.5 rounded-md">
                急診專科訓練指引
              </span>
            </div>
            <p className="text-xs text-slate-500">
              涵蓋超音波、毒物、災難、EMS、檢傷、能力進展評量與高齡急症七大急診專科核心訓練領域。
            </p>
          </div>

          {/* Progress Tracker Card */}
          {(() => {
            const totalCount = RECOMMENDED_CURRICULUM_MATRIX.length;
            const completedCount = RECOMMENDED_CURRICULUM_MATRIX.filter(item => {
              if (student.curriculumCompleted && student.curriculumCompleted[item.id] !== undefined) {
                return !!student.curriculumCompleted[item.id];
              }
              return !!(item.linkedCourseId && student.courseStatus?.[item.linkedCourseId]?.status === 'approved');
            }).length;
            const percent = Math.round((completedCount / totalCount) * 100);

            return (
              <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3 shrink-0">
                <div>
                  <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-700 mb-1">
                    <span>個人訓練進展完成率：</span>
                    <span className="font-mono text-teal-700 font-black">
                      {completedCount} / {totalCount} 項 ({percent}%)
                    </span>
                  </div>
                  <div className="w-48 sm:w-56 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Legend & Filter Controls */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-bold text-[11px] flex items-center mr-1">
                <Filter className="h-3 w-3 mr-0.5" /> 聚焦篩選：
              </span>
              <button
                onClick={() => setCurriculumFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1 ${
                  curriculumFilter === 'all'
                    ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-400/40'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>👁️ 全部 (看全部18項)</span>
              </button>
              
              {(['R1', 'R2', 'R3', 'R4'] as RLevel[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setCurriculumFilter(curriculumFilter === r ? 'all' : r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition-all cursor-pointer flex items-center space-x-1 ${
                    curriculumFilter === r
                      ? 'bg-slate-900 text-white shadow-xs ring-2 ring-teal-400/50'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={`點擊聚焦 ${r} 項目，其他反灰`}
                >
                  <span>{r}</span>
                  {curriculumFilter === r && <span className="text-[10px] text-teal-300">✓聚焦</span>}
                </button>
              ))}

              <button
                onClick={() => setCurriculumFilter(curriculumFilter === 'myYear' ? 'all' : 'myYear')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  curriculumFilter === 'myYear'
                    ? 'bg-teal-700 text-white shadow-xs ring-2 ring-teal-400/40'
                    : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                🌟 我當前 ({student.rLevel})
              </button>

              <button
                onClick={() => setCurriculumFilter(curriculumFilter === 'incomplete' ? 'all' : 'incomplete')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  curriculumFilter === 'incomplete'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                待完成項目
              </button>
            </div>

            {/* Symbol Legend */}
            <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center space-x-1">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">✓</span>
                <span>核心要求</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-sky-100 text-sky-800 font-black text-[10px]">→</span>
                <span>跨年級累積</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded border border-slate-300 bg-white text-slate-600 font-black text-[10px]">☑</span>
                <span>核取進度</span>
              </span>
            </div>
          </div>

          {/* Focus Notification Banner */}
          {curriculumFilter !== 'all' && (
            <div className="flex flex-wrap items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-3.5 py-2 text-xs text-teal-900 gap-2 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 font-bold">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-200 text-teal-800 text-xs font-black">🎯</span>
                <span>
                  目前已鎖定【{curriculumFilter === 'myYear' ? `我當前年級 (${student.rLevel})` : curriculumFilter}】建議修習課表（符合項目正常高亮，非該年級項目已自動反灰處理）
                </span>
              </div>
              <button
                onClick={() => setCurriculumFilter('all')}
                className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-extrabold shadow-xs transition-colors cursor-pointer text-xs flex items-center space-x-1"
              >
                <span>👁️ 點此看全部 (解除反灰)</span>
              </button>
            </div>
          )}
        </div>

        {/* The Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 text-xs font-black border-b border-slate-200">
                <th className="py-3 px-3.5 w-24 text-center">領域</th>
                <th className="py-3 px-3.5 min-w-[150px]">項目</th>
                <th className="py-3 px-3 w-24 text-center">要求</th>
                
                {/* Interactive R1 Header */}
                <th 
                  onClick={() => setCurriculumFilter(curriculumFilter === 'R1' ? 'all' : 'R1')}
                  className={`py-2 px-2 w-18 text-center transition-all cursor-pointer select-none group ${
                    curriculumFilter === 'R1' 
                      ? 'bg-slate-900 text-white ring-2 ring-teal-400' 
                      : student.rLevel === 'R1' 
                      ? 'bg-teal-100/80 text-teal-900 hover:bg-teal-200' 
                      : 'hover:bg-slate-200'
                  }`}
                  title="點擊聚焦 R1 項目，其他反灰"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-extrabold font-mono">R1</span>
                    {curriculumFilter === 'R1' ? (
                      <span className="text-[9px] bg-teal-400 text-slate-950 font-black px-1 rounded mt-0.5">聚焦中</span>
                    ) : student.rLevel === 'R1' ? (
                      <span className="text-[9px] text-teal-800 font-bold">當前</span>
                    ) : (
                      <span className="text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">點擊聚焦</span>
                    )}
                  </div>
                </th>

                {/* Interactive R2 Header */}
                <th 
                  onClick={() => setCurriculumFilter(curriculumFilter === 'R2' ? 'all' : 'R2')}
                  className={`py-2 px-2 w-18 text-center transition-all cursor-pointer select-none group ${
                    curriculumFilter === 'R2' 
                      ? 'bg-slate-900 text-white ring-2 ring-teal-400' 
                      : student.rLevel === 'R2' 
                      ? 'bg-teal-100/80 text-teal-900 hover:bg-teal-200' 
                      : 'hover:bg-slate-200'
                  }`}
                  title="點擊聚焦 R2 項目，其他反灰"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-extrabold font-mono">R2</span>
                    {curriculumFilter === 'R2' ? (
                      <span className="text-[9px] bg-teal-400 text-slate-950 font-black px-1 rounded mt-0.5">聚焦中</span>
                    ) : student.rLevel === 'R2' ? (
                      <span className="text-[9px] text-teal-800 font-bold">當前</span>
                    ) : (
                      <span className="text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">點擊聚焦</span>
                    )}
                  </div>
                </th>

                {/* Interactive R3 Header */}
                <th 
                  onClick={() => setCurriculumFilter(curriculumFilter === 'R3' ? 'all' : 'R3')}
                  className={`py-2 px-2 w-18 text-center transition-all cursor-pointer select-none group ${
                    curriculumFilter === 'R3' 
                      ? 'bg-slate-900 text-white ring-2 ring-teal-400' 
                      : student.rLevel === 'R3' 
                      ? 'bg-teal-100/80 text-teal-900 hover:bg-teal-200' 
                      : 'hover:bg-slate-200'
                  }`}
                  title="點擊聚焦 R3 項目，其他反灰"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-extrabold font-mono">R3</span>
                    {curriculumFilter === 'R3' ? (
                      <span className="text-[9px] bg-teal-400 text-slate-950 font-black px-1 rounded mt-0.5">聚焦中</span>
                    ) : student.rLevel === 'R3' ? (
                      <span className="text-[9px] text-teal-800 font-bold">當前</span>
                    ) : (
                      <span className="text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">點擊聚焦</span>
                    )}
                  </div>
                </th>

                {/* Interactive R4 Header */}
                <th 
                  onClick={() => setCurriculumFilter(curriculumFilter === 'R4' ? 'all' : 'R4')}
                  className={`py-2 px-2 w-18 text-center transition-all cursor-pointer select-none group ${
                    curriculumFilter === 'R4' 
                      ? 'bg-slate-900 text-white ring-2 ring-teal-400' 
                      : student.rLevel === 'R4' 
                      ? 'bg-teal-100/80 text-teal-900 hover:bg-teal-200' 
                      : 'hover:bg-slate-200'
                  }`}
                  title="點擊聚焦 R4 項目，其他反灰"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-extrabold font-mono">R4</span>
                    {curriculumFilter === 'R4' ? (
                      <span className="text-[9px] bg-teal-400 text-slate-950 font-black px-1 rounded mt-0.5">聚焦中</span>
                    ) : student.rLevel === 'R4' ? (
                      <span className="text-[9px] text-teal-800 font-bold">當前</span>
                    ) : (
                      <span className="text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">點擊聚焦</span>
                    )}
                  </div>
                </th>

                <th className="py-3 px-4 w-36 text-center">完成</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(() => {
                // Determine whether a row matches the selected year focus
                const isItemInYear = (item: RecommendedCurriculumItem, filterYear: 'R1' | 'R2' | 'R3' | 'R4' | 'myYear'): boolean => {
                  if (filterYear === 'myYear') {
                    const rKey = student.rLevel.toLowerCase() as 'r1' | 'r2' | 'r3' | 'r4';
                    return item[rKey] === '✓' || item[rKey] === '→';
                  }
                  if (filterYear === 'R1') return item.r1 === '✓' || item.r1 === '→';
                  if (filterYear === 'R2') return item.r2 === '✓' || item.r2 === '→';
                  if (filterYear === 'R3') return item.r3 === '✓' || item.r3 === '→';
                  if (filterYear === 'R4') return item.r4 === '✓' || item.r4 === '→';
                  return true;
                };

                const isYearFilter = ['R1', 'R2', 'R3', 'R4', 'myYear'].includes(curriculumFilter);

                // If filter is 'incomplete', strictly filter out finished ones
                const itemsToRender = curriculumFilter === 'incomplete'
                  ? RECOMMENDED_CURRICULUM_MATRIX.filter(item => {
                      const isDone = student.curriculumCompleted && student.curriculumCompleted[item.id] !== undefined
                        ? !!student.curriculumCompleted[item.id]
                        : !!(item.linkedCourseId && student.courseStatus?.[item.linkedCourseId]?.status === 'approved');
                      return !isDone;
                    })
                  : RECOMMENDED_CURRICULUM_MATRIX;

                if (itemsToRender.length === 0) {
                  return (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        查無符合篩選條件的課程建議項目
                      </td>
                    </tr>
                  );
                }

                return itemsToRender.map((item) => {
                  const isDone = student.curriculumCompleted && student.curriculumCompleted[item.id] !== undefined
                    ? !!student.curriculumCompleted[item.id]
                    : !!(item.linkedCourseId && student.courseStatus?.[item.linkedCourseId]?.status === 'approved');

                  const isApprovedFromCourses = item.linkedCourseId && student.courseStatus?.[item.linkedCourseId]?.status === 'approved';

                  // Is this item matching the active focused year?
                  const matchesFocus = isYearFilter
                    ? isItemInYear(item, curriculumFilter as 'R1' | 'R2' | 'R3' | 'R4' | 'myYear')
                    : true;

                  // Gray out class if not matching focused year
                  const grayOutClass = !matchesFocus
                    ? 'opacity-25 grayscale bg-slate-100/75 select-none hover:opacity-75 transition-opacity'
                    : isDone
                    ? 'bg-emerald-50/20 hover:bg-emerald-50/30'
                    : 'hover:bg-slate-50/80';

                  const activeFocusYear = curriculumFilter === 'myYear' ? student.rLevel : curriculumFilter;

                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${grayOutClass}`}
                    >
                      {/* Domain column */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black shadow-2xs ${item.domainBg} ${item.domainText}`}>
                          {item.domain}
                        </span>
                      </td>

                      {/* Item column */}
                      <td className="py-3 px-3.5">
                        <div className="flex flex-col">
                          <div className="flex items-center flex-wrap gap-1">
                            <span className={`font-extrabold text-slate-900 ${isDone ? 'text-emerald-950 font-black' : ''}`}>
                              {item.itemName}
                            </span>
                            {isYearFilter && matchesFocus && (
                              <span className="px-1.5 py-0.25 rounded bg-teal-100 text-teal-900 text-[10px] font-black tracking-tight">
                                🌟 {activeFocusYear}核心
                              </span>
                            )}
                            {isYearFilter && !matchesFocus && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                (非 {activeFocusYear} 項目)
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Requirement column */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {item.requirement}
                      </td>

                      {/* R1 */}
                      <td className={`py-3 px-3 text-center font-black ${curriculumFilter === 'R1' ? 'bg-teal-100/50' : student.rLevel === 'R1' ? 'bg-teal-50/50' : ''}`}>
                        {item.r1 === '✓' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 shadow-2xs font-bold">
                            ✓
                          </span>
                        ) : item.r1 === '→' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-800 font-bold">
                            →
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* R2 */}
                      <td className={`py-3 px-3 text-center font-black ${curriculumFilter === 'R2' ? 'bg-teal-100/50' : student.rLevel === 'R2' ? 'bg-teal-50/50' : ''}`}>
                        {item.r2 === '✓' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 shadow-2xs font-bold">
                            ✓
                          </span>
                        ) : item.r2 === '→' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-800 font-bold">
                            →
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* R3 */}
                      <td className={`py-3 px-3 text-center font-black ${curriculumFilter === 'R3' ? 'bg-teal-100/50' : student.rLevel === 'R3' ? 'bg-teal-50/50' : ''}`}>
                        {item.r3 === '✓' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 shadow-2xs font-bold">
                            ✓
                          </span>
                        ) : item.r3 === '→' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-800 font-bold">
                            →
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* R4 */}
                      <td className={`py-3 px-3 text-center font-black ${curriculumFilter === 'R4' ? 'bg-teal-100/50' : student.rLevel === 'R4' ? 'bg-teal-50/50' : ''}`}>
                        {item.r4 === '✓' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 shadow-2xs font-bold">
                            ✓
                          </span>
                        ) : item.r4 === '→' ? (
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-800 font-bold">
                            →
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Complete Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleCurriculumItem) {
                              onToggleCurriculumItem(student.id, item.id, !isDone);
                            }
                          }}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isDone 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                              : 'bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          <span className={`flex items-center justify-center h-4 w-4 rounded ${isDone ? 'bg-white text-emerald-600' : 'border border-slate-400 bg-white'}`}>
                            {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </span>
                          <span>{isDone ? '已完成' : '標記完成'}</span>
                        </button>
                        {isApprovedFromCourses && (
                          <div className="text-[9px] text-teal-600 font-bold mt-1">
                            ✓ 必修課程審核通過
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Footnote */}
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
          <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            註：本清單由急診部依學會 R1-R4 專科住院醫師核心能力進展標準彙整，住院醫師可隨時自主檢視並勾選修課狀況；若科內審核通過對應課程證照，系統亦會同步對應標示。
          </span>
        </div>
      </div>

    </div>
  );
}
