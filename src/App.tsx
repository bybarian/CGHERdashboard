import React, { useState, useEffect } from 'react';
import { 
  Student, 
  Course, 
  Homework, 
  RLevel, 
  ClockMode,
  PromotionStatus,
  PromotionRecord,
  checkPromotionEligibility,
  NEXT_R_LEVEL,
  PRELOADED_STUDENTS, 
  COURSES, 
  DEFAULT_HOMEWORKS, 
  LEVEL_UP_XP,
  Mentor,
  DEFAULT_MENTORS 
} from './types';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import RotationBoard from './components/RotationBoard';
import CoursesView from './components/CoursesView';
import HomeworkView from './components/HomeworkView';
import TeacherView from './components/TeacherView';
import ResidentAuthModal from './components/ResidentAuthModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { Trophy, Award, Sparkles, CheckCircle2, Star, Activity, X, BookOpen, Crown, Monitor, Map, AlertCircle } from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Resident Authentication & Password Protection states
  const [residentPasswordRequired, setResidentPasswordRequired] = useState<boolean>(true);
  const [unlockedStudentIds, setUnlockedStudentIds] = useState<Record<string, boolean>>({});
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

  // Gamification celebratory states
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ studentName: string; oldLevel: number; newLevel: number } | null>(null);
  const [showXpBanner, setShowXpBanner] = useState(false);
  const [xpBannerText, setXpBannerText] = useState('');

  // Custom courses and homework extensions
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [customHomeworks, setCustomHomeworks] = useState<Homework[]>([]);
  const [logoError, setLogoError] = useState(false);

  // SYSTEM TIME & CLOCK STATES: Built-in Live Clock & Manual Setting
  const [clockMode, setClockMode] = useState<ClockMode>('auto');
  const [systemOngoingMonth, setSystemOngoingMonth] = useState<number>(7);
  const [systemDateText, setSystemDateText] = useState<string>('2026-07-05');
  const [currentLiveTime, setCurrentLiveTime] = useState<Date>(new Date());
  const [rLevelTemplates, setRLevelTemplates] = useState<Record<RLevel, string[]>>({
    R1: ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
    R2: ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    R3: ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    R4: ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training']
  });
  const [mentors, setMentors] = useState<Mentor[]>(DEFAULT_MENTORS);

  // Ticking built-in clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live real-time values
  const liveYear = currentLiveTime.getFullYear();
  const liveMonth = currentLiveTime.getMonth() + 1;
  const liveDay = currentLiveTime.getDate();
  const liveDateText = `${liveYear}-${String(liveMonth).padStart(2, '0')}-${String(liveDay).padStart(2, '0')}`;
  const liveTimeText = currentLiveTime.toTimeString().split(' ')[0]; // HH:mm:ss

  // Effective ongoing month and date: in auto mode, follows the built-in live clock; in manual mode, uses manual values
  const effectiveOngoingMonth = clockMode === 'auto' ? liveMonth : systemOngoingMonth;
  const effectiveDateText = clockMode === 'auto' ? liveDateText : systemDateText;

  const handleUpdateSystemTime = async (month: number, dateText: string, mode?: ClockMode) => {
    const targetMode = mode !== undefined ? mode : clockMode;
    setSystemOngoingMonth(month);
    setSystemDateText(dateText);
    if (mode !== undefined) {
      setClockMode(mode);
    }
    try {
      await setDoc(doc(db, 'config', 'system'), {
        systemOngoingMonth: month,
        systemDateText: dateText,
        clockMode: targetMode
      }, { merge: true });
      if (targetMode === 'manual') {
        setXpBannerText(`已儲存手動設定時間：${dateText} (進行中：${month}月)`);
        setShowXpBanner(true);
        setTimeout(() => setShowXpBanner(false), 3000);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'config/system');
    }
  };

  const handleToggleClockMode = async (newMode: ClockMode) => {
    setClockMode(newMode);
    try {
      const updatePayload: { clockMode: ClockMode; systemOngoingMonth?: number; systemDateText?: string } = {
        clockMode: newMode
      };
      if (newMode === 'auto') {
        updatePayload.systemOngoingMonth = liveMonth;
        updatePayload.systemDateText = liveDateText;
        setSystemOngoingMonth(liveMonth);
        setSystemDateText(liveDateText);
      }
      await setDoc(doc(db, 'config', 'system'), updatePayload, { merge: true });
      setXpBannerText(newMode === 'auto' 
        ? `🟢 已切換為「內建即時時鐘」：目前為 ${liveMonth}月 (M${liveMonth})，系統隨真實時間自動運作` 
        : `🟡 已切換為「手動設定時間」：您可以自由指定測試日期與進行月份`
      );
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'config/system');
    }
  };

  const handleUpdateRLevelTemplates = async (templates: Record<RLevel, string[]>) => {
    try {
      await setDoc(doc(db, 'config', 'system'), {
        rLevelTemplates: templates
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'config/system');
    }
  };

  const handleApplyRLevelTemplateToAll = async (rLevel: RLevel) => {
    const template = rLevelTemplates[rLevel];
    if (!template) return;
    try {
      const batch = writeBatch(db);
      students.forEach((s) => {
        if (s.rLevel === rLevel) {
          batch.update(doc(db, 'students', s.id), { schedule: [...template] });
        }
      });
      await batch.commit();

      setXpBannerText(`已將 ${rLevel} 預設範本成功套用至所有該年級住院醫師！`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 4000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students');
    }
  };

  const ensureFourYearSchedules = (list: Student[]): Student[] => {
    return list.map((s) => {
      if (!s.fourYearSchedules) {
        return {
          ...s,
          fourYearSchedules: {
            R1: s.rLevel === 'R1' ? [...s.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
            R2: s.rLevel === 'R2' ? [...s.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
            R3: s.rLevel === 'R3' ? [...s.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
            R4: s.rLevel === 'R4' ? [...s.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training'],
          }
        };
      }
      return s;
    });
  };

  // 1. Initial State Load & Real-time Snapshot Synchronization
  useEffect(() => {
    // A. Subscribe to Students
    const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      if (snapshot.empty) {
        // Populate Firestore with default student list with 4-year schedules initialized
        const defaultList = ensureFourYearSchedules(PRELOADED_STUDENTS);
        defaultList.forEach(async (student) => {
          try {
            await setDoc(doc(db, 'students', student.id), student);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `students/${student.id}`);
          }
        });
      } else {
        const list = snapshot.docs.map(doc => doc.data() as Student);
        const parsed = ensureFourYearSchedules(list);
        parsed.sort((a, b) => a.id.localeCompare(b.id));
        setStudents(parsed);

        // Retain or select active student
        setCurrentStudentId(prev => {
          if (prev && parsed.some(s => s.id === prev)) {
            return prev;
          }
          const savedId = localStorage.getItem('em_residents_current_student_id');
          if (savedId && parsed.some(s => s.id === savedId)) {
            return savedId;
          }
          return parsed.length > 0 ? parsed[0].id : '';
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    // B. Subscribe to Global Configuration document
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'system'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.clockMode !== undefined) {
          setClockMode(data.clockMode);
        }
        if (data.systemOngoingMonth !== undefined) {
          setSystemOngoingMonth(data.systemOngoingMonth);
        }
        if (data.systemDateText !== undefined) {
          setSystemDateText(data.systemDateText);
        }
        if (data.rLevelTemplates !== undefined) {
          setRLevelTemplates(data.rLevelTemplates);
        }
        if (data.mentors !== undefined && Array.isArray(data.mentors) && data.mentors.length > 0) {
          setMentors(data.mentors);
        }
        if (data.residentPasswordRequired !== undefined) {
          setResidentPasswordRequired(data.residentPasswordRequired);
        }
      } else {
        // Initialize default system config in Firestore
        try {
          setDoc(doc(db, 'config', 'system'), {
            clockMode: 'auto',
            systemOngoingMonth: 7,
            systemDateText: '2026-07-05',
            mentors: DEFAULT_MENTORS,
            residentPasswordRequired: true,
            rLevelTemplates: {
              R1: ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
              R2: ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
              R3: ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
              R4: ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training']
            }
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'config/system');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/system');
    });

    // C. Subscribe to Custom Courses
    const unsubscribeCourses = onSnapshot(collection(db, 'custom_courses'), (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as Course);
      setCustomCourses(list);
      list.forEach(course => {
        if (!COURSES.some(c => c.id === course.id)) {
          COURSES.push(course);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'custom_courses');
    });

    // D. Subscribe to Custom Homeworks
    const unsubscribeHomeworks = onSnapshot(collection(db, 'custom_homeworks'), (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as Homework);
      setCustomHomeworks(list);
      list.forEach(hw => {
        if (!DEFAULT_HOMEWORKS.some(h => h.id === hw.id)) {
          DEFAULT_HOMEWORKS.push(hw);
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'custom_homeworks');
    });

    // E. Keep teacher view state in localStorage (user specific)
    const savedTeacher = localStorage.getItem('em_residents_isteacher');
    if (savedTeacher === 'true') {
      setIsTeacher(true);
    }

    return () => {
      unsubscribeStudents();
      unsubscribeConfig();
      unsubscribeCourses();
      unsubscribeHomeworks();
    };
  }, []);


  const currentStudent = students.find(s => s.id === currentStudentId);

  // Switch active resident
  const handleStudentChange = (id: string) => {
    // If selecting the currently active student and it's already unlocked or password is not required
    if (id === currentStudentId && (unlockedStudentIds[id] || !residentPasswordRequired || isTeacher)) {
      return;
    }

    // If teacher mode or global password check is disabled or resident already unlocked in this session
    if (isTeacher || !residentPasswordRequired || unlockedStudentIds[id]) {
      setCurrentStudentId(id);
      try {
        localStorage.setItem('em_residents_current_student_id', id);
      } catch {
        // ignore storage errors
      }
      setActiveTab('dashboard');
    } else {
      // Require resident password authentication
      setPendingStudentId(id);
      setIsAuthModalOpen(true);
    }
  };

  // Successful resident login
  const handleResidentAuthSuccess = (authenticatedStudentId: string) => {
    setUnlockedStudentIds(prev => ({ ...prev, [authenticatedStudentId]: true }));
    setCurrentStudentId(authenticatedStudentId);
    try {
      localStorage.setItem('em_residents_current_student_id', authenticatedStudentId);
    } catch {
      // ignore storage errors
    }
    setIsAuthModalOpen(false);
    setPendingStudentId(null);
    setActiveTab('dashboard');

    const targetStudent = students.find(s => s.id === authenticatedStudentId);
    setXpBannerText(`密碼驗證通過！歡迎 ${targetStudent?.name || ''} 醫師！`);
    setShowXpBanner(true);
    setTimeout(() => setShowXpBanner(false), 3000);
  };

  // Lock current resident session
  const handleLockCurrentStudent = () => {
    if (!currentStudentId) return;
    setUnlockedStudentIds(prev => ({ ...prev, [currentStudentId]: false }));
    setXpBannerText('已鎖定當前醫師帳戶。下次切換進入需再次輸入密碼。');
    setShowXpBanner(true);
    setTimeout(() => setShowXpBanner(false), 3000);
  };

  // Toggle global resident password enforcement
  const handleToggleResidentPasswordRequired = async (enabled: boolean) => {
    setResidentPasswordRequired(enabled);
    try {
      await setDoc(doc(db, 'config', 'system'), {
        residentPasswordRequired: enabled
      }, { merge: true });
      setXpBannerText(enabled ? '全院住院醫師密碼安全防護：已啟動' : '全院住院醫師密碼安全防護：已關閉 (公開演示模式)');
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'config/system');
    }
  };

  // Teacher action: Reset a student's password
  const handleResetStudentPassword = async (studentId: string, newPassword?: string) => {
    const pass = newPassword || '1234';
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, password: pass } : s));
    try {
      await updateDoc(doc(db, 'students', studentId), { password: pass });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Teacher action: Inspect student directly without password
  const handleInspectStudent = (studentId: string) => {
    setUnlockedStudentIds(prev => ({ ...prev, [studentId]: true }));
    setCurrentStudentId(studentId);
    try {
      localStorage.setItem('em_residents_current_student_id', studentId);
    } catch {}
    setIsTeacher(false);
    setActiveTab('dashboard');
    const s = students.find(x => x.id === studentId);
    setXpBannerText(`以導師權限進入【${s?.name || ''} 醫師】個人儀表板 (已自動解鎖)`);
    setShowXpBanner(true);
    setTimeout(() => setShowXpBanner(false), 3000);
  };

  // Resident action: Change personal password
  const handleUpdatePassword = async (
    studentId: string, 
    oldPass: string, 
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      return { success: false, message: '找不到該醫師資料' };
    }
    const currentActualPassword = student.password || '1234';
    if (oldPass !== currentActualPassword) {
      return { success: false, message: '目前原密碼輸入錯誤，請重新確認！' };
    }

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, password: newPass } : s));
    try {
      await updateDoc(doc(db, 'students', studentId), { password: newPass });
      setXpBannerText(`【${student.name} 醫師】密碼已更新成功！請記住您的新密碼。`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3500);
      return { success: true, message: '密碼已成功更新！' };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
      return { success: false, message: '更新失敗，請檢查網路連線或稍後再試。' };
    }
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
  const handleUpdateStatus = async (
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    submission: { notes: string; fileName: string; fileUrl: string }
  ) => {
    if (!currentStudentId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;

    try {
      const newSubmission = {
        completed: true,
        notes: submission.notes,
        fileName: submission.fileName,
        fileUrl: submission.fileUrl,
        status: 'pending',
        submittedAt: todayStr
      };

      const updateField: any = {};
      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        updateField[`rotationStatus.${mKey}`] = newSubmission;
      } else if (type === 'course') {
        updateField[`courseStatus.${itemId}`] = newSubmission;
      } else if (type === 'homework') {
        updateField[`homeworkStatus.${itemId}`] = newSubmission;
      }

      await updateDoc(doc(db, 'students', currentStudentId), updateField);

      // Trigger success notification
      setXpBannerText('申報資料已送出！待指導 VS 核准後將可獲取學分與 XP！');
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 4000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + currentStudentId);
    }
  };

  // Student action: Mark dice rolled and add bonus XP
  const handleMarkRolled = async (
    type: 'rotation' | 'homework',
    itemId: string,
    bonusXp: number,
    message: string
  ) => {
    if (!currentStudentId) return;

    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;

    try {
      let nextXp = student.xp + bonusXp;
      let nextLevel = student.level;

      if (nextXp >= LEVEL_UP_XP) {
        nextLevel += 1;
        nextXp = nextXp - LEVEL_UP_XP;
        
        // Trigger Level-Up Modal
        setLevelUpData({
          studentName: student.name,
          oldLevel: student.level,
          newLevel: nextLevel
        });
        setShowLevelUpModal(true);
      }

      const updateField: any = {
        xp: nextXp,
        level: nextLevel
      };

      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        updateField[`rotationRolled.${mKey}`] = true;
      } else if (type === 'homework') {
        updateField[`homeworkRolled.${itemId}`] = true;
      }

      await updateDoc(doc(db, 'students', currentStudentId), updateField);

      // Trigger XP gain banner
      setXpBannerText(message);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 4500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + currentStudentId);
    }
  };

  const handleUpdateOngoingMonth = async (month: number) => {
    if (!currentStudentId) return;
    try {
      await updateDoc(doc(db, 'students', currentStudentId), {
        currentOngoingMonth: month
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + currentStudentId);
    }
  };

  // Teacher action: Approve or reject submissions
  const handleApproveReject = async (
    studentId: string,
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    status: 'approved' | 'rejected',
    feedback: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      let xpReward = 0;
      const updateField: any = {};

      // Determine XP gains
      if (type === 'rotation') {
        const mKey = parseInt(itemId);
        const prevStatus = student.rotationStatus[mKey]?.status;
        
        updateField[`rotationStatus.${mKey}.status`] = status;
        updateField[`rotationStatus.${mKey}.feedback`] = feedback;

        // Award XP only if first time approved
        if (status === 'approved' && prevStatus !== 'approved') {
          xpReward = 50; // Rotation awards 50 XP
        }
      } else if (type === 'course') {
        const prevStatus = student.courseStatus[itemId]?.status;
        
        updateField[`courseStatus.${itemId}.status`] = status;
        updateField[`courseStatus.${itemId}.feedback`] = feedback;

        if (status === 'approved' && prevStatus !== 'approved') {
          xpReward = 100; // Society course awards 100 XP
        }
      } else if (type === 'homework') {
        const prevStatus = student.homeworkStatus[itemId]?.status;
        
        updateField[`homeworkStatus.${itemId}.status`] = status;
        updateField[`homeworkStatus.${itemId}.feedback`] = feedback;

        if (status === 'approved' && prevStatus !== 'approved') {
          xpReward = 40; // Homework awards 40 XP
        }
      }

      // Add XP & Check for Level Up!
      if (xpReward > 0) {
        let nextXp = student.xp + xpReward;
        let nextLevel = student.level;

        if (nextXp >= LEVEL_UP_XP) {
          nextLevel += 1;
          nextXp = nextXp - LEVEL_UP_XP;
          
          // Trigger Level-Up Modal
          setLevelUpData({
            studentName: student.name,
            oldLevel: student.level,
            newLevel: nextLevel
          });
          setShowLevelUpModal(true);
        }

        updateField.xp = nextXp;
        updateField.level = nextLevel;

        // Trigger XP gain banner
        setXpBannerText(`[VS 導師核可成功] 已核發給 ${student.name} 醫師 +${xpReward} XP！`);
        setShowXpBanner(true);
        setTimeout(() => setShowXpBanner(false), 4000);
      }

      await updateDoc(doc(db, 'students', studentId), updateField);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  const handleUpdateStudentXP = async (
    studentId: string,
    level: number,
    xp: number,
    name?: string,
    rLevel?: RLevel,
    admissionYear?: number,
    avatar?: string,
    trainingStartDate?: string
  ) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;

    try {
      const updateField: any = { level, xp };
      if (name !== undefined) updateField.name = name;
      if (avatar !== undefined) updateField.avatar = avatar;
      if (admissionYear !== undefined) updateField.admissionYear = admissionYear;
      if (trainingStartDate !== undefined) updateField.trainingStartDate = trainingStartDate;
      if (rLevel !== undefined && rLevel !== s.rLevel) {
        updateField.rLevel = rLevel;
        // Synchronize active schedule with their stored fourYearSchedules for the new year level!
        if (s.fourYearSchedules && s.fourYearSchedules[rLevel]) {
          updateField.schedule = [...s.fourYearSchedules[rLevel]];
        } else {
          const template = rLevelTemplates[rLevel] || Array(12).fill('adult-er');
          updateField.schedule = [...template];
        }
      }

      // Optimistically update local students state so UI reflects changes immediately
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            ...updateField
          };
        }
        return student;
      }));

      await updateDoc(doc(db, 'students', studentId), updateField);

      setXpBannerText(`[管理模式] 已成功更新住院醫師【${name || s.name}】的基本資訊、頭像與學習歷程！`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Update Resident Assigned Mentor
  const handleUpdateMentor = async (studentId: string, mentorName: string, mentorTitle?: string) => {
    try {
      const updateData = { 
        mentorName, 
        mentorTitle: mentorTitle || '急診專科指導醫師' 
      };

      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updateData } : s));
      await updateDoc(doc(db, 'students', studentId), updateData);

      setXpBannerText(`已為住院醫師設定專屬指導導師：${mentorName} (${mentorTitle || '急診專科指導醫師'})`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Resident Action: Apply for Promotion
  const handleApplyPromotion = async (studentId: string, notes?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const eligibility = checkPromotionEligibility(student);
    if (!eligibility.isOneYearCompleted) {
      setXpBannerText(`[無法送出] 尚未完成全階段規定之訓練！${eligibility.missingReasons.join('，')}`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 5000);
      return;
    }

    if (!eligibility.nextRLevel) {
      setXpBannerText('該醫師已為最高層級 (R4)，無需申請晉級！');
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3000);
      return;
    }

    try {
      const promotionStatus: PromotionStatus = {
        status: 'pending',
        requestedRLevel: eligibility.nextRLevel,
        appliedAt: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        notes: notes || '已修畢全年度 12 個月臨床輪訓與常規評量，申請晉級。'
      };

      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, promotionStatus } : s));
      await updateDoc(doc(db, 'students', studentId), { promotionStatus });

      setXpBannerText(`已成功向急診醫學科教學導師送出【${eligibility.currentRLevel} 升等 ${eligibility.nextRLevel}】審查申請！請靜候導師審核。`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 4500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Teacher Action: Approve or Reject Promotion
  const handleApprovePromotion = async (studentId: string, approved: boolean, feedback?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const eligibility = checkPromotionEligibility(student);

    if (approved) {
      // Strictly enforce 1-year training requirement!
      if (!eligibility.isOneYearCompleted) {
        setXpBannerText(`[核准失敗] 該學員尚未完成全階段規定訓練月份，不符晉升條件！`);
        setShowXpBanner(true);
        setTimeout(() => setShowXpBanner(false), 4500);
        return;
      }

      const targetLevel = eligibility.nextRLevel;
      if (!targetLevel) return;

      try {
        const todayStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const newRecord: PromotionRecord = {
          fromLevel: student.rLevel,
          toLevel: targetLevel,
          approvedAt: todayStr,
          approvedBy: '急診醫學部教學指導導師',
          academicYear: student.admissionYear,
          feedback: feedback || '通過全年度 12 個月輪訓與常規作業審核，臨床核心能力達標，准予晉級。'
        };

        const targetSchedule = student.fourYearSchedules?.[targetLevel] || rLevelTemplates[targetLevel] || Array(12).fill('adult-er');
        const bonusXp = 300;
        let nextXp = student.xp + bonusXp;
        let nextLevel = student.level + 1;

        const updatedPromotionStatus: PromotionStatus = {
          status: 'approved',
          requestedRLevel: targetLevel,
          approvedAt: todayStr,
          approvedBy: '急診醫學部教學指導導師',
          feedback: feedback || '通過全年度 12 個月輪訓審核，准予晉級。'
        };

        const updatedHistory = [...(student.promotionHistory || []), newRecord];

        const updateField: any = {
          rLevel: targetLevel,
          schedule: [...targetSchedule],
          xp: nextXp,
          level: nextLevel,
          promotionStatus: updatedPromotionStatus,
          promotionHistory: updatedHistory
        };

        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updateField } : s));
        await updateDoc(doc(db, 'students', studentId), updateField);

        // Trigger celebratory banner / level-up modal
        setLevelUpData({
          studentName: student.name,
          oldLevel: student.level,
          newLevel: nextLevel
        });
        setShowLevelUpModal(true);

        setXpBannerText(`🎉【導師核准晉級】已成功核准 ${student.name} 醫師自 ${student.rLevel} 晉升為 ${targetLevel} 住院醫師！並核發晉級獎勵 +${bonusXp} XP！`);
        setShowXpBanner(true);
        setTimeout(() => setShowXpBanner(false), 5000);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
      }
    } else {
      // Rejection / Require remedial training
      try {
        const updatedPromotionStatus: PromotionStatus = {
          status: 'rejected',
          requestedRLevel: eligibility.nextRLevel || undefined,
          rejectionReason: feedback || '未達晉級標準或需補足相關臨床訓練，請與指導導師面談。'
        };

        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, promotionStatus: updatedPromotionStatus } : s));
        await updateDoc(doc(db, 'students', studentId), { promotionStatus: updatedPromotionStatus });

        setXpBannerText(`已退回 ${student.name} 醫師的升等申請（要求補足訓練）。`);
        setShowXpBanner(true);
        setTimeout(() => setShowXpBanner(false), 3500);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
      }
    }
  };

  // Update Mentors List in system config
  const handleUpdateMentors = async (newMentors: Mentor[]) => {
    setMentors(newMentors);
    try {
      await setDoc(doc(db, 'config', 'system'), {
        mentors: newMentors
      }, { merge: true });
      setXpBannerText(`已更新急診專科臨床指導導師名冊 (共 ${newMentors.length} 位導師)！`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'config/system');
    }
  };

  // Resident or Teacher Action: Cancel pending promotion application
  const handleCancelPromotion = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, promotionStatus: undefined } : s));
      await updateDoc(doc(db, 'students', studentId), {
        promotionStatus: deleteField()
      });

      setXpBannerText(`已取消 ${student.name} 醫師之晉升審查申請。`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Teacher or Resident Action: Revert / Cancel approved promotion (Rollback to previous R level)
  const handleRevertPromotion = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const history = [...(student.promotionHistory || [])];
    let prevRLevel: RLevel = 'R1';
    let lastRecord: PromotionRecord | undefined;

    if (history.length > 0) {
      lastRecord = history.pop();
      prevRLevel = (lastRecord?.fromLevel as RLevel) || 'R1';
    } else {
      if (student.rLevel === 'R4') prevRLevel = 'R3';
      else if (student.rLevel === 'R3') prevRLevel = 'R2';
      else if (student.rLevel === 'R2') prevRLevel = 'R1';
      else prevRLevel = 'R1';
    }

    try {
      const targetSchedule = student.fourYearSchedules?.[prevRLevel] || rLevelTemplates[prevRLevel] || Array(12).fill('adult-er');
      const bonusXp = 300;
      const nextXp = Math.max(0, student.xp - bonusXp);
      const nextLevel = Math.max(1, student.level - 1);

      const updateFields: any = {
        rLevel: prevRLevel,
        schedule: [...targetSchedule],
        xp: nextXp,
        level: nextLevel,
        promotionStatus: deleteField(),
        promotionHistory: history
      };

      setStudents(prev => prev.map(s => s.id === studentId ? { 
        ...s, 
        rLevel: prevRLevel, 
        schedule: [...targetSchedule], 
        xp: nextXp, 
        level: nextLevel, 
        promotionStatus: undefined, 
        promotionHistory: history 
      } : s));

      await updateDoc(doc(db, 'students', studentId), updateFields);

      setXpBannerText(`已成功取消晉升，${student.name} 醫師已回復為 ${prevRLevel} 住院醫師職級。`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 4500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  const handleModifyDeleteSubmission = async (
    studentId: string,
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    action: 'modify' | 'delete',
    updatedNotes?: string,
    updatedStatus?: 'approved' | 'pending' | 'rejected'
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      const updatedStudent = { ...student };
      
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

      await setDoc(doc(db, 'students', studentId), updatedStudent);

      setXpBannerText(action === 'delete' ? '已成功刪除該申報紀錄。' : '已成功修改該申報之內容與狀態。');
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Teacher action: Batch Import / Update Schedule & 4-Year Schedules
  const handleUpdateSchedule = async (
    studentId: string,
    schedule: string[],
    fourYearSchedules?: Record<RLevel, string[]>
  ) => {
    try {
      const updateData: any = { schedule };
      if (fourYearSchedules) {
        updateData.fourYearSchedules = fourYearSchedules;
      }
      await updateDoc(doc(db, 'students', studentId), updateData);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  // Custom Registry Additions
  const handleAddCustomCourse = async (course: Course) => {
    try {
      await setDoc(doc(db, 'custom_courses', course.id), course);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'custom_courses/' + course.id);
    }
  };

  const handleAddCustomHomework = async (homework: Homework) => {
    try {
      await setDoc(doc(db, 'custom_homeworks', homework.id), homework);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'custom_homeworks/' + homework.id);
    }
  };

  const handleAddStudent = async (newStudent: Student) => {
    try {
      const studentWith4Year: Student = {
        ...newStudent,
        fourYearSchedules: newStudent.fourYearSchedules || {
          R1: newStudent.rLevel === 'R1' ? [...newStudent.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
          R2: newStudent.rLevel === 'R2' ? [...newStudent.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
          R3: newStudent.rLevel === 'R3' ? [...newStudent.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
          R4: newStudent.rLevel === 'R4' ? [...newStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training'],
        }
      };

      // Optimistically add to local students array so user sees it right away
      setStudents(prev => {
        const filtered = prev.filter(s => s.id !== newStudent.id);
        return [...filtered, studentWith4Year];
      });
      setCurrentStudentId(newStudent.id);

      await setDoc(doc(db, 'students', newStudent.id), studentWith4Year);

      setXpBannerText(`已成功新增住院醫師【${newStudent.name}】(${newStudent.rLevel})！`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3500);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + newStudent.id);
    }
  };

  const handleToggleCurriculumItem = async (studentId: string, itemId: string, completed: boolean) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      const nextCompleted = {
        ...(student.curriculumCompleted || {}),
        [itemId]: completed
      };

      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            curriculumCompleted: nextCompleted
          };
        }
        return s;
      }));

      await updateDoc(doc(db, 'students', studentId), {
        curriculumCompleted: nextCompleted
      });

      setXpBannerText(completed ? '已標記完成核心建議課程項目！' : '已取消完成標記。');
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteDoc(doc(db, 'students', studentId));
      const updated = students.filter(s => s.id !== studentId);
      if (updated.length > 0) {
        setCurrentStudentId(updated[0].id);
      } else {
        setCurrentStudentId('');
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + studentId);
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
        systemOngoingMonth={effectiveOngoingMonth}
        systemDateText={effectiveDateText}
        clockMode={clockMode}
        currentTimeText={liveTimeText}
        unlockedStudentIds={unlockedStudentIds}
        residentPasswordRequired={residentPasswordRequired}
        onLockCurrentStudent={handleLockCurrentStudent}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
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
                    src={`${import.meta.env.BASE_URL}logo.png`} 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                    onError={() => setLogoError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Activity className="h-5 w-5 animate-pulse" />
                )}
              </div>
              <div className="whitespace-nowrap shrink-0">
                <span className="block text-[10px] font-black tracking-wider text-teal-400 whitespace-nowrap">國泰綜合醫院急診部</span>
                <span className="text-xs font-black text-slate-200 whitespace-nowrap">電子輔助訓練系統</span>
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
                    <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-600 text-xs">
                      {currentStudent.avatar && (currentStudent.avatar.startsWith('data:') || currentStudent.avatar.startsWith('http')) ? (
                        <img src={currentStudent.avatar} alt={currentStudent.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      ) : (
                        <span>{currentStudent.avatar || '👨‍⚕️'}</span>
                      )}
                    </div>
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
            systemOngoingMonth={effectiveOngoingMonth}
            systemDateText={effectiveDateText}
            clockMode={clockMode}
            currentTimeText={liveTimeText}
            onUpdateSystemTime={handleUpdateSystemTime}
            onToggleClockMode={handleToggleClockMode}
            rLevelTemplates={rLevelTemplates}
            onUpdateRLevelTemplates={handleUpdateRLevelTemplates}
            onApplyRLevelTemplateToAll={handleApplyRLevelTemplateToAll}
            onApprovePromotion={handleApprovePromotion}
            onCancelPromotion={handleCancelPromotion}
            onRevertPromotion={handleRevertPromotion}
            onUpdateMentor={handleUpdateMentor}
            mentors={mentors}
            onUpdateMentors={handleUpdateMentors}
            residentPasswordRequired={residentPasswordRequired}
            onToggleResidentPasswordRequired={handleToggleResidentPasswordRequired}
            onResetStudentPassword={handleResetStudentPassword}
            onInspectStudent={handleInspectStudent}
          />
        ) : (
          // 2. Student Resident Active View
          currentStudent && (
            <div className="space-y-6">
              
              {activeTab === 'dashboard' && (
                <DashboardView 
                  student={currentStudent} 
                  onTabChange={setActiveTab} 
                  systemOngoingMonth={effectiveOngoingMonth}
                  systemDateText={effectiveDateText}
                  clockMode={clockMode}
                  currentTimeText={liveTimeText}
                  onToggleCurriculumItem={handleToggleCurriculumItem}
                  onApplyPromotion={handleApplyPromotion}
                  onCancelPromotion={handleCancelPromotion}
                  onRevertPromotion={handleRevertPromotion}
                  onUpdateMentor={handleUpdateMentor}
                  mentors={mentors}
                  residentPasswordRequired={residentPasswordRequired}
                  onOpenChangePassword={() => setIsChangePasswordOpen(true)}
                  onLockStudent={handleLockCurrentStudent}
                  isUnlocked={unlockedStudentIds[currentStudent.id]}
                />
              )}

              {activeTab === 'monopoly' && (
                <RotationBoard 
                  student={currentStudent} 
                  onUpdateStatus={handleUpdateStatus} 
                  onMarkRolled={handleMarkRolled}
                  systemOngoingMonth={effectiveOngoingMonth}
                  systemDateText={effectiveDateText}
                  clockMode={clockMode}
                  currentTimeText={liveTimeText}
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
                  systemOngoingMonth={effectiveOngoingMonth}
                  systemDateText={effectiveDateText}
                  clockMode={clockMode}
                  currentTimeText={liveTimeText}
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

      {/* Resident Authentication Password Modal */}
      {isAuthModalOpen && pendingStudentId && (() => {
        const target = students.find(s => s.id === pendingStudentId);
        if (!target) return null;
        return (
          <ResidentAuthModal
            isOpen={isAuthModalOpen}
            targetStudent={target}
            onSuccess={handleResidentAuthSuccess}
            onClose={() => {
              setIsAuthModalOpen(false);
              setPendingStudentId(null);
            }}
          />
        );
      })()}

      {/* Resident Change Password Modal */}
      {isChangePasswordOpen && currentStudent && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          student={currentStudent}
          onClose={() => setIsChangePasswordOpen(false)}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

    </div>
  );
}
