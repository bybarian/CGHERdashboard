import React, { useState, useEffect } from 'react';
import { 
  Student, 
  Course, 
  Homework, 
  RLevel, 
  PRELOADED_STUDENTS, 
  COURSES, 
  DEFAULT_HOMEWORKS, 
  LEVEL_UP_XP 
} from './types';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import RotationBoard from './components/RotationBoard';
import CoursesView from './components/CoursesView';
import HomeworkView from './components/HomeworkView';
import TeacherView from './components/TeacherView';
import { Trophy, Award, Sparkles, CheckCircle2, Star, Activity, X, BookOpen, Crown, Monitor, Map, AlertCircle } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Gamification celebratory states
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ studentName: string; oldLevel: number; newLevel: number } | null>(null);
  const [showXpBanner, setShowXpBanner] = useState(false);
  const [xpBannerText, setXpBannerText] = useState('');

  // Custom courses and homework extensions
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [customHomeworks, setCustomHomeworks] = useState<Homework[]>([]);
  const [logoError, setLogoError] = useState(false);

  // 1. Initial State Load
  useEffect(() => {
    const savedStudents = localStorage.getItem('em_residents_students');
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents);
        setStudents(parsed);
        if (parsed.length > 0) {
          setCurrentStudentId(parsed[0].id);
        }
      } catch (e) {
        setStudents(PRELOADED_STUDENTS);
        setCurrentStudentId(PRELOADED_STUDENTS[0].id);
      }
    } else {
      setStudents(PRELOADED_STUDENTS);
      setCurrentStudentId(PRELOADED_STUDENTS[0].id);
    }

    const savedTeacher = localStorage.getItem('em_residents_isteacher');
    if (savedTeacher === 'true') {
      setIsTeacher(true);
    }

    // Load custom course list or homeworks if saved
    const savedCourses = localStorage.getItem('em_residents_custom_courses');
    if (savedCourses) {
      try {
        setCustomCourses(JSON.parse(savedCourses));
      } catch (e) {}
    }
    const savedHws = localStorage.getItem('em_residents_custom_hws');
    if (savedHws) {
      try {
        setCustomHomeworks(JSON.parse(savedHws));
      } catch (e) {}
    }
  }, []);

  // 2. Persist state changes
  const saveStudents = (updated: Student[]) => {
    setStudents(updated);
    localStorage.setItem('em_residents_students', JSON.stringify(updated));
  };

  const currentStudent = students.find(s => s.id === currentStudentId);

  // Switch active resident
  const handleStudentChange = (id: string) => {
    setCurrentStudentId(id);
    setActiveTab('dashboard');
  };

  // Teacher password validation
  const handleTeacherLogin = (password: string) => {
    if (password === '00000') {
      setIsTeacher(true);
      localStorage.setItem('em_residents_isteacher', 'true');
      return true;
    }
    return false;
  };

  const handleTeacherLogout = () => {
    setIsTeacher(false);
    localStorage.setItem('em_residents_isteacher', 'false');
    setActiveTab('dashboard');
  };

  // Student action: Submit elements
  const handleUpdateStatus = (
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    submission: { notes: string; fileName: string; fileUrl: string }
  ) => {
    if (!currentStudentId) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const updatedStudents = students.map((s) => {
      if (s.id !== currentStudentId) return s;

      const updatedStudent = { ...s };

      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        updatedStudent.rotationStatus = {
          ...updatedStudent.rotationStatus,
          [mKey]: {
            completed: true,
            notes: submission.notes,
            fileName: submission.fileName,
            fileUrl: submission.fileUrl,
            status: 'pending',
            submittedAt: todayStr
          }
        };
      } else if (type === 'course') {
        updatedStudent.courseStatus = {
          ...updatedStudent.courseStatus,
          [itemId]: {
            completed: true,
            notes: submission.notes,
            fileName: submission.fileName,
            fileUrl: submission.fileUrl,
            status: 'pending',
            submittedAt: todayStr
          }
        };
      } else if (type === 'homework') {
        updatedStudent.homeworkStatus = {
          ...updatedStudent.homeworkStatus,
          [itemId]: {
            completed: true,
            notes: submission.notes,
            fileName: submission.fileName,
            fileUrl: submission.fileUrl,
            status: 'pending',
            submittedAt: todayStr
          }
        };
      }

      return updatedStudent;
    });

    saveStudents(updatedStudents);
    
    // Trigger success notification
    setXpBannerText('申報資料已送出！待指導 VS 核准後將可獲取學分與 XP！');
    setShowXpBanner(true);
    setTimeout(() => setShowXpBanner(false), 4000);
  };

  // Student action: Mark dice rolled and add bonus XP
  const handleMarkRolled = (
    type: 'rotation' | 'homework',
    itemId: string,
    bonusXp: number,
    message: string
  ) => {
    if (!currentStudentId) return;

    const updatedStudents = students.map((s) => {
      if (s.id !== currentStudentId) return s;

      const updatedStudent = { ...s };

      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        updatedStudent.rotationRolled = {
          ...(updatedStudent.rotationRolled || {}),
          [mKey]: true
        };
      } else if (type === 'homework') {
        updatedStudent.homeworkRolled = {
          ...(updatedStudent.homeworkRolled || {}),
          [itemId]: true
        };
      }

      // Add XP & Check for Level Up!
      let nextXp = updatedStudent.xp + bonusXp;
      let nextLevel = updatedStudent.level;

      if (nextXp >= LEVEL_UP_XP) {
        nextLevel += 1;
        nextXp = nextXp - LEVEL_UP_XP;
        
        // Trigger Level-Up Modal
        setLevelUpData({
          studentName: updatedStudent.name,
          oldLevel: updatedStudent.level,
          newLevel: nextLevel
        });
        setShowLevelUpModal(true);
      }

      updatedStudent.xp = nextXp;
      updatedStudent.level = nextLevel;

      // Trigger XP gain banner
      setXpBannerText(message);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 4500);

      return updatedStudent;
    });

    saveStudents(updatedStudents);
  };

  const handleUpdateOngoingMonth = (month: number) => {
    if (!currentStudentId) return;
    const updatedStudents = students.map((s) => {
      if (s.id !== currentStudentId) return s;
      return { ...s, currentOngoingMonth: month };
    });
    saveStudents(updatedStudents);
  };

  // Teacher action: Approve or reject submissions
  const handleApproveReject = (
    studentId: string,
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    status: 'approved' | 'rejected',
    feedback: string
  ) => {
    const updatedStudents = students.map((s) => {
      if (s.id !== studentId) return s;

      const updatedStudent = { ...s };
      let xpReward = 0;

      // Determine XP gains
      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        const prevStatus = s.rotationStatus[mKey]?.status;
        
        updatedStudent.rotationStatus = {
          ...updatedStudent.rotationStatus,
          [mKey]: {
            ...updatedStudent.rotationStatus[mKey],
            status,
            feedback
          }
        };
        // Award XP only if first time approved
        if (status === 'approved' && prevStatus !== 'approved') {
          xpReward = 50; // Rotation awards 50 XP
        }
      } else if (type === 'course') {
        const prevStatus = s.courseStatus[itemId]?.status;
        updatedStudent.courseStatus = {
          ...updatedStudent.courseStatus,
          [itemId]: {
            ...updatedStudent.courseStatus[itemId],
            status,
            feedback
          }
        };
        if (status === 'approved' && prevStatus !== 'approved') {
          xpReward = 100; // Society course awards 100 XP
        }
      } else if (type === 'homework') {
        const prevStatus = s.homeworkStatus[itemId]?.status;
        updatedStudent.homeworkStatus = {
          ...updatedStudent.homeworkStatus,
          [itemId]: {
            ...updatedStudent.homeworkStatus[itemId],
            status,
            feedback
          }
        };
        if (status === 'approved' && prevStatus !== 'approved') {
          xpReward = 40; // Homework awards 40 XP
        }
      }

      // Add XP & Check for Level Up!
      if (xpReward > 0) {
        let nextXp = updatedStudent.xp + xpReward;
        let nextLevel = updatedStudent.level;

        if (nextXp >= LEVEL_UP_XP) {
          nextLevel += 1;
          nextXp = nextXp - LEVEL_UP_XP;
          
          // Trigger Level-Up Modal
          setLevelUpData({
            studentName: updatedStudent.name,
            oldLevel: updatedStudent.level,
            newLevel: nextLevel
          });
          setShowLevelUpModal(true);
        }

        updatedStudent.xp = nextXp;
        updatedStudent.level = nextLevel;

        // Trigger XP gain banner
        setXpBannerText(`[VS 導師核可成功] 已核發給 ${updatedStudent.name} 醫師 +${xpReward} XP！`);
        setShowXpBanner(true);
        setTimeout(() => setShowXpBanner(false), 4000);
      }

      return updatedStudent;
    });

    saveStudents(updatedStudents);
  };

  const handleUpdateStudentXP = (studentId: string, level: number, xp: number) => {
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, level, xp };
      }
      return s;
    });
    saveStudents(updatedStudents);
    setXpBannerText(`[管理模式] 已手動更新醫師等級為 L${level} 與 XP 經驗值 ${xp}！`);
    setShowXpBanner(true);
    setTimeout(() => setShowXpBanner(false), 3000);
  };

  const handleModifyDeleteSubmission = (
    studentId: string,
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    action: 'modify' | 'delete',
    updatedNotes?: string,
    updatedStatus?: 'approved' | 'pending' | 'rejected'
  ) => {
    const updatedStudents = students.map((s) => {
      if (s.id !== studentId) return s;

      const updatedStudent = { ...s };
      
      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        const nextStatus = { ...updatedStudent.rotationStatus };
        if (action === 'delete') {
          delete nextStatus[mKey];
          if (updatedStudent.rotationRolled) {
            const nextRolled = { ...updatedStudent.rotationRolled };
            delete nextRolled[mKey];
            updatedStudent.rotationRolled = nextRolled;
          }
        } else {
          if (nextStatus[mKey]) {
            nextStatus[mKey] = {
              ...nextStatus[mKey],
              notes: updatedNotes !== undefined ? updatedNotes : nextStatus[mKey].notes,
              status: updatedStatus !== undefined ? updatedStatus : nextStatus[mKey].status,
            };
          }
        }
        updatedStudent.rotationStatus = nextStatus;
      } else if (type === 'course') {
        const nextStatus = { ...updatedStudent.courseStatus };
        if (action === 'delete') {
          delete nextStatus[itemId];
        } else {
          if (nextStatus[itemId]) {
            nextStatus[itemId] = {
              ...nextStatus[itemId],
              notes: updatedNotes !== undefined ? updatedNotes : nextStatus[itemId].notes,
              status: updatedStatus !== undefined ? updatedStatus : nextStatus[itemId].status,
            };
          }
        }
        updatedStudent.courseStatus = nextStatus;
      } else if (type === 'homework') {
        const nextStatus = { ...updatedStudent.homeworkStatus };
        if (action === 'delete') {
          delete nextStatus[itemId];
          if (updatedStudent.homeworkRolled) {
            const nextRolled = { ...updatedStudent.homeworkRolled };
            delete nextRolled[itemId];
            updatedStudent.homeworkRolled = nextRolled;
          }
        } else {
          if (nextStatus[itemId]) {
            nextStatus[itemId] = {
              ...nextStatus[itemId],
              notes: updatedNotes !== undefined ? updatedNotes : nextStatus[itemId].notes,
              status: updatedStatus !== undefined ? updatedStatus : nextStatus[itemId].status,
            };
          }
        }
        updatedStudent.homeworkStatus = nextStatus;
      }

      return updatedStudent;
    });

    saveStudents(updatedStudents);
    setXpBannerText(action === 'delete' ? '已成功刪除該申報紀錄。' : '已成功修改該申報之內容與狀態。');
    setShowXpBanner(true);
    setTimeout(() => setShowXpBanner(false), 3000);
  };

  // Teacher action: Batch Import / Update Schedule
  const handleUpdateSchedule = (studentId: string, schedule: string[]) => {
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, schedule };
      }
      return s;
    });
    saveStudents(updatedStudents);
  };

  // Custom Registry Additions
  const handleAddCustomCourse = (course: Course) => {
    const nextList = [...customCourses, course];
    setCustomCourses(nextList);
    localStorage.setItem('em_residents_custom_courses', JSON.stringify(nextList));
    // Also inject into general list (handled inside CoursesView via concat if needed)
    COURSES.push(course);
  };

  const handleAddCustomHomework = (homework: Homework) => {
    const nextList = [...customHomeworks, homework];
    setCustomHomeworks(nextList);
    localStorage.setItem('em_residents_custom_hws', JSON.stringify(nextList));
    // Inject into DEFAULT_HOMEWORKS
    DEFAULT_HOMEWORKS.push(homework);
  };

  const handleAddStudent = (newStudent: Student) => {
    const updated = [...students, newStudent];
    saveStudents(updated);
    setCurrentStudentId(newStudent.id);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter(s => s.id !== studentId);
    saveStudents(updated);
    if (updated.length > 0) {
      setCurrentStudentId(updated[0].id);
    } else {
      setCurrentStudentId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Global Toast Banner */}
      {showXpBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0 animate-spin" />
          <span>{xpBannerText}</span>
        </div>
      )}

      {/* Primary Header/Navbar */}
      <Navbar
        students={students}
        currentStudentId={currentStudentId}
        onStudentChange={handleStudentChange}
        isTeacher={isTeacher}
        onTeacherLogin={handleTeacherLogin}
        onTeacherLogout={handleTeacherLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Left Margin Quick Link Hover Edge Trigger */}
      <div 
        className="fixed left-0 top-16 bottom-0 w-3.5 z-40 bg-transparent hover:bg-teal-500/5 group transition-colors cursor-pointer flex items-center justify-center"
        onMouseEnter={() => setIsSidebarOpen(true)}
        title="滑鼠移入此邊緣展開捷徑選單 (Hover to expand Quick Links)"
      >
        <div className="h-16 w-1 bg-teal-500/10 group-hover:bg-teal-500/40 rounded-full transition-all duration-300" />
      </div>

      {/* Auto-Hiding Left Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar drawer content */}
          <div 
            className="relative flex w-full max-w-[280px] flex-col bg-slate-950 text-white shadow-2xl p-5 border-r border-white/10 animate-in slide-in-from-left duration-250"
            onMouseLeave={() => setIsSidebarOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              title="關閉選單"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Logo/Branding */}
            <div className="mt-4 flex items-center space-x-3 border-b border-white/10 pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md overflow-hidden">
                {!logoError ? (
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Activity className="h-5 w-5 animate-pulse" />
                )}
              </div>
              <div>
                <span className="block text-[10px] font-black tracking-wider text-teal-400">國泰綜合醫院急診部</span>
                <span className="text-xs font-black text-slate-200">電子輔助訓練系統</span>
              </div>
            </div>

            {/* Current Active User Info */}
            <div className="mt-5 p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">當前登入身分</span>
              {isTeacher ? (
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-xs font-black text-indigo-300">教學指導教師 (VS)</span>
                </div>
              ) : currentStudent ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{currentStudent.avatar && currentStudent.avatar.startsWith('data:') ? '👤' : (currentStudent.avatar || '👨‍⚕️')}</span>
                    <span className="text-xs font-black text-white">{currentStudent.name} 醫師</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <span className="bg-teal-500/20 border border-teal-500/35 px-1 rounded text-teal-300">{currentStudent.rLevel}</span>
                    <span>{currentStudent.admissionYear}年度</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Sidebar Tab Links */}
            <nav className="mt-8 flex-1 space-y-1.5">
              <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider px-2 mb-2">
                核心系統模組
              </span>

              {isTeacher ? (
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      activeTab === 'dashboard' 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    <span>教師管理後台</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center space-x-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                      activeTab === 'dashboard' 
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    <span>學習主儀表板</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('monopoly');
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center space-x-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                      activeTab === 'monopoly' 
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Map className="h-4 w-4" />
                    <span>12 個月輪訓地圖</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('courses');
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center space-x-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                      activeTab === 'courses' 
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>學會必修課程</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('homework');
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center space-x-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                      activeTab === 'homework' 
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>每月臨床作業</span>
                  </button>
                </div>
              )}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-white/10 pt-4 text-center">
              <span className="text-[9px] text-slate-500 font-mono block">CGH ER System v1.0</span>
              <span className="text-[8px] text-slate-600 block mt-0.5">Kathay General Hospital</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {isTeacher ? (
          // 1. Teacher Panel View
          <TeacherView
            students={students}
            onApproveReject={handleApproveReject}
            onUpdateSchedule={handleUpdateSchedule}
            onAddCustomCourse={handleAddCustomCourse}
            onAddCustomHomework={handleAddCustomHomework}
            onUpdateStudentXP={handleUpdateStudentXP}
            onModifyDeleteSubmission={handleModifyDeleteSubmission}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        ) : (
          // 2. Student Resident Active View
          currentStudent && (
            <div className="space-y-6">
              
              {activeTab === 'dashboard' && (
                <DashboardView 
                  student={currentStudent} 
                  onTabChange={setActiveTab} 
                  onUpdateOngoingMonth={handleUpdateOngoingMonth}
                />
              )}

              {activeTab === 'monopoly' && (
                <RotationBoard 
                  student={currentStudent} 
                  onUpdateStatus={handleUpdateStatus} 
                  onMarkRolled={handleMarkRolled}
                  onUpdateOngoingMonth={handleUpdateOngoingMonth}
                />
              )}

              {activeTab === 'courses' && (
                <CoursesView 
                  student={currentStudent} 
                  onUpdateStatus={handleUpdateStatus} 
                />
              )}

              {activeTab === 'homework' && (
                <HomeworkView 
                  student={currentStudent} 
                  onUpdateStatus={handleUpdateStatus} 
                  onMarkRolled={handleMarkRolled}
                />
              )}

            </div>
          )
        )}

      </main>

      {/* Bottom Footer block */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          <p>2026 國泰綜合醫院急診醫學部電子輔助訓練系統 CGH ER Digital Augmented Training System Ver1.0</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">國泰綜合醫院急診醫學部 x 教學部數位科技暨網路資源中心</p>
        </div>
      </footer>

      {/* Gamified LEVEL UP Celebration modal */}
      {showLevelUpModal && levelUpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 via-teal-950 to-slate-900 p-8 text-center text-white border border-teal-500/30 shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Visual celebration particles */}
            <div className="absolute top-0 left-0 w-full h-full opacity-25 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <div className="absolute top-1/3 right-1/4 h-3 w-3 rounded-full bg-teal-400 animate-pulse" />
              <div className="absolute bottom-1/4 left-1/2 h-1.5 w-1.5 rounded-full bg-emerald-300 animate-bounce" />
            </div>

            {/* Glowing Golden Trophy */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 mb-6 scale-110">
              <Trophy className="h-10 w-10 animate-pulse" />
            </div>

            <span className="block text-[10px] font-black tracking-widest text-teal-400 uppercase font-mono mb-2">
              CONGRATULATIONS!
            </span>
            
            <h3 className="text-xl font-black font-display tracking-tight text-white mb-2">
              等級晉升！Level Up！
            </h3>
            
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              恭喜 <strong>{levelUpData.studentName}</strong> 醫師！您的完訓審查獲得指導主治醫師(VS)高度核可，獲取大量經驗值並成功躍升至下一級！
            </p>

            {/* Level jump indicators */}
            <div className="flex items-center justify-center space-x-6 bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="text-center">
                <span className="block text-[10px] text-slate-400 font-bold">先前級數</span>
                <span className="text-2xl font-black font-mono text-slate-400">L{levelUpData.oldLevel}</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <span className="block text-[10px] text-teal-400 font-bold">新級數</span>
                <span className="text-3xl font-black font-mono text-teal-300 animate-pulse">L{levelUpData.newLevel}</span>
              </div>
            </div>

            <button
              id="dismiss-levelup-btn"
              onClick={() => {
                setShowLevelUpModal(false);
                setLevelUpData(null);
              }}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-slate-950 font-black py-3 text-xs shadow-lg transition-colors cursor-pointer"
            >
              繼續我的學習之路
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
