import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Crown, 
  User, 
  Lock, 
  Unlock, 
  Activity, 
  Trophy, 
  Award,
  ChevronDown,
  BookOpen,
  Calendar,
  CheckSquare,
  Menu,
  Monitor,
  Map,
  AlertCircle
} from 'lucide-react';
import { Student, RLevel } from '../types';

interface NavbarProps {
  students: Student[];
  currentStudentId: string;
  onStudentChange: (id: string) => void;
  isTeacher: boolean;
  onTeacherLogin: (password: string) => boolean;
  onTeacherLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export default function Navbar({
  students,
  currentStudentId,
  onStudentChange,
  isTeacher,
  onTeacherLogin,
  onTeacherLogout,
  activeTab,
  setActiveTab,
  onToggleSidebar
}: NavbarProps) {
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const selectedStudent = students.find(s => s.id === currentStudentId);

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onTeacherLogin(passwordInput);
    if (success) {
      setShowTeacherModal(false);
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const calculateXpPercentage = (student: Student) => {
    return Math.min(100, (student.xp / 500) * 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Department */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="mr-1 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="開啟左側導覽地圖/選單"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-100 overflow-hidden">
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
            <span className="block text-xs font-semibold tracking-wider text-teal-600 font-display">國泰綜合醫院急診醫學部電子輔助訓練系統</span>
            <span className="text-[11px] font-black text-slate-700 font-display sm:text-xs">CGH ER Digital Augmented Training System</span>
          </div>
        </div>

        {/* Dynamic XP Progress & Info (Hidden for Teacher view) */}
        {!isTeacher && selectedStudent && (
          <div className="hidden md:flex items-center space-x-6">
            {/* Student Info Badge */}
            <div className="flex items-center space-x-2 rounded-lg bg-slate-50 px-3 py-1 border border-slate-100">
              <span className="text-xs font-bold text-slate-500">訓練年度:</span>
              <span className="text-xs font-extrabold text-slate-700 bg-teal-100/60 px-1.5 py-0.5 rounded text-teal-700 font-mono">
                {selectedStudent.admissionYear}年度
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-bold text-slate-500">層級:</span>
              <span className="text-xs font-extrabold text-white bg-teal-600 px-1.5 py-0.5 rounded font-mono">
                {selectedStudent.rLevel}
              </span>
            </div>

            {/* Gamified XP Progress */}
            <div className="flex flex-col w-48 lg:w-64">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center text-xs font-bold text-slate-600">
                  <Trophy className="h-3.5 w-3.5 text-amber-500 mr-1" />
                  等級 {selectedStudent.level}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {selectedStudent.xp} / 500 XP
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 ease-out"
                  style={{ width: `${calculateXpPercentage(selectedStudent)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Switching Controls */}
        <div className="flex items-center space-x-3">
          {/* Student Selector Dropdown (Hidden when teacher is active) */}
          {!isTeacher ? (
            <div className="relative">
              <button 
                id="student-select-btn"
                onClick={() => setShowStudentDropdown(!showStudentDropdown)}
                className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm">
                  {selectedStudent?.avatar && selectedStudent.avatar.startsWith('data:') ? '👤' : (selectedStudent?.avatar || '👨‍⚕️')}
                </span>
                <span>{selectedStudent?.name} ({selectedStudent?.rLevel})</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showStudentDropdown && (
                <div 
                  id="student-dropdown-menu"
                  className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-2 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    切換住院醫師
                  </div>
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        onStudentChange(student.id);
                        setShowStudentDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs ${
                        student.id === currentStudentId 
                          ? 'bg-teal-50 text-teal-700 font-bold' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        <span>{student.avatar && student.avatar.startsWith('data:') ? '👤' : (student.avatar || '👨‍⚕️')}</span>
                        <span>{student.name}</span>
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1 py-0.25 rounded">
                        {student.rLevel} ({student.admissionYear}年度)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
              <Crown className="h-4 w-4 text-indigo-600" />
              <span>教師管理模式</span>
            </div>
          )}

          {/* Teacher Login / Logout Button */}
          {isTeacher ? (
            <button
              id="logout-teacher-btn"
              onClick={onTeacherLogout}
              className="flex items-center space-x-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <Unlock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">登出教師區</span>
            </button>
          ) : (
            <button
              id="login-teacher-btn"
              onClick={() => {
                setShowTeacherModal(true);
                setLoginError(false);
              }}
              className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">教師登入</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation for Students */}
      {!isTeacher && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-6 overflow-x-auto py-1" aria-label="Tabs">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 border-b-2 px-1 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'dashboard'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span>學習主儀表板</span>
              </button>

              <button
                id="tab-monopoly"
                onClick={() => setActiveTab('monopoly')}
                className={`flex items-center space-x-1.5 border-b-2 px-1 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'monopoly'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>輪訓地圖</span>
              </button>

              <button
                id="tab-courses"
                onClick={() => setActiveTab('courses')}
                className={`flex items-center space-x-1.5 border-b-2 px-1 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'courses'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>學會必修課程</span>
              </button>

              <button
                id="tab-homework"
                onClick={() => setActiveTab('homework')}
                className={`flex items-center space-x-1.5 border-b-2 px-1 py-2.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'homework'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>每月臨床作業</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Teacher Authentication Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center">
              <Lock className="h-4 w-4 text-indigo-600 mr-2" />
              教師系統登入認證
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              請輸入教師認證密碼以進階至審核及課表管理介面。
            </p>

            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="請輸入5位數密碼"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError(false);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-center tracking-widest font-mono focus:border-teal-500 focus:outline-none"
                  autoFocus
                />
                {loginError && (
                  <p className="mt-1.5 text-center text-xs font-bold text-red-500">
                    密碼錯誤，請重新輸入！
                  </p>
                )}
              </div>

              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
                >
                  確認登入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
