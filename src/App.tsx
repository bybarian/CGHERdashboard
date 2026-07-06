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
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

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

  // NEW STATES: System Ongoing Month & R1-R4 Templates
  const [systemOngoingMonth, setSystemOngoingMonth] = useState<number>(7);
  const [systemDateText, setSystemDateText] = useState<string>('2026-07-05');
  const [rLevelTemplates, setRLevelTemplates] = useState<Record<RLevel, string[]>>({
    R1: ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
    R2: ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    R3: ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    R4: ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er']
  });

  const handleUpdateSystemTime = async (month: number, dateText: string) => {
    try {
      await setDoc(doc(db, 'config', 'system'), {
        systemOngoingMonth: month,
        systemDateText: dateText
      }, { merge: true });
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
            R4: s.rLevel === 'R4' ? [...s.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
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
        if (data.systemOngoingMonth !== undefined) {
          setSystemOngoingMonth(data.systemOngoingMonth);
        }
        if (data.systemDateText !== undefined) {
          setSystemDateText(data.systemDateText);
        }
        if (data.rLevelTemplates !== undefined) {
          setRLevelTemplates(data.rLevelTemplates);
        }
      } else {
        // Initialize default system config in Firestore
        try {
          setDoc(doc(db, 'config', 'system'), {
            systemOngoingMonth: 7,
            systemDateText: '2026-07-05',
            rLevelTemplates: {
              R1: ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
              R2: ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
              R3: ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
              R4: ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er']
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
    admissionYear?: number
  ) => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;

    try {
      const updateField: any = { level, xp };
      if (name !== undefined) updateField.name = name;
      if (admissionYear !== undefined) updateField.admissionYear = admissionYear;
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

      await updateDoc(doc(db, 'students', studentId), updateField);

      setXpBannerText(`[管理模式] 已成功更新住院醫師基本資訊與學習歷程！`);
      setShowXpBanner(true);
      setTimeout(() => setShowXpBanner(false), 3000);
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
      const studentWith4Year = {
        ...newStudent,
        fourYearSchedules: newStudent.fourYearSchedules || {
          R1: newStudent.rLevel === 'R1' ? [...newStudent.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
          R2: newStudent.rLevel === 'R2' ? [...newStudent.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
          R3: newStudent.rLevel === 'R3' ? [...newStudent.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
          R4: newStudent.rLevel === 'R4' ? [...newStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
        }
      };
      await setDoc(doc(db, 'students', newStudent.id), studentWith4Year);
      setCurrentStudentId(newStudent.id);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'students/' + newStudent.id);
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
            systemOngoingMonth={systemOngoingMonth}
            systemDateText={systemDateText}
            onUpdateSystemTime={handleUpdateSystemTime}
            rLevelTemplates={rLevelTemplates}
            onUpdateRLevelTemplates={handleUpdateRLevelTemplates}
            onApplyRLevelTemplateToAll={handleApplyRLevelTemplateToAll}
          />
        ) : (
          // 2. Student Resident Active View
          currentStudent && (
            <div className="space-y-6">
              
              {activeTab === 'dashboard' && (
                <DashboardView 
                  student={currentStudent} 
                  onTabChange={setActiveTab} 
                  systemOngoingMonth={systemOngoingMonth}
                  systemDateText={systemDateText}
                />
              )}

              {activeTab === 'monopoly' && (
                <RotationBoard 
                  student={currentStudent} 
                  onUpdateStatus={handleUpdateStatus} 
                  onMarkRolled={handleMarkRolled}
                  systemOngoingMonth={systemOngoingMonth}
                  systemDateText={systemDateText}
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
