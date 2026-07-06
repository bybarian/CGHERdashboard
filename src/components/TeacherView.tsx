import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  FileText, 
  FileSpreadsheet, 
  RefreshCw, 
  ArrowUpRight, 
  Upload, 
  Download, 
  Edit3,
  HelpCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Trash2,
  Save
} from 'lucide-react';
import { Student, Course, Homework, DEPARTMENTS, COURSES, DEFAULT_HOMEWORKS, MONTH_NAMES, RLevel, CourseCategory, MONTHLY_CHECKLISTS } from '../types';

interface TeacherViewProps {
  students: Student[];
  onApproveReject: (
    studentId: string,
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    status: 'approved' | 'rejected',
    feedback: string
  ) => void;
  onUpdateSchedule: (studentId: string, schedule: string[], fourYearSchedules?: Record<RLevel, string[]>) => void;
  onAddCustomCourse: (course: Course) => void;
  onAddCustomHomework: (homework: Homework) => void;
  onUpdateStudentXP?: (studentId: string, level: number, xp: number, name?: string, rLevel?: RLevel, admissionYear?: number) => void;
  onModifyDeleteSubmission?: (
    studentId: string,
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    action: 'modify' | 'delete',
    updatedNotes?: string,
    updatedStatus?: 'approved' | 'pending' | 'rejected'
  ) => void;
  onAddStudent?: (newStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  
  // New System settings props
  systemOngoingMonth: number;
  systemDateText: string;
  onUpdateSystemTime: (month: number, dateText: string) => void;
  rLevelTemplates: Record<RLevel, string[]>;
  onUpdateRLevelTemplates: (templates: Record<RLevel, string[]>) => void;
  onApplyRLevelTemplateToAll?: (rLevel: RLevel) => void;
}

export default function TeacherView({
  students,
  onApproveReject,
  onUpdateSchedule,
  onAddCustomCourse,
  onAddCustomHomework,
  onUpdateStudentXP,
  onModifyDeleteSubmission,
  onAddStudent,
  onDeleteStudent,
  systemOngoingMonth,
  systemDateText,
  onUpdateSystemTime,
  rLevelTemplates,
  onUpdateRLevelTemplates,
  onApplyRLevelTemplateToAll,
}: TeacherViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'schedule' | 'create' | 'manage' | 'settings'>('pending');
  
  // States for Review action
  const [reviewFeedbacks, setReviewFeedbacks] = useState<Record<string, string>>({}); // key: studentId-type-itemId

  // States for Schedule Management
  const [selectedScheduleStudentId, setSelectedScheduleStudentId] = useState<string>(students[0]?.id || '');
  const [selectedRYearTab, setSelectedRYearTab] = useState<RLevel>('R1');
  const [excelPasteText, setExcelPasteText] = useState('');
  const [excelParseMessage, setExcelParseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Synchronize year tab with selected resident's current R-level
  React.useEffect(() => {
    const student = students.find(s => s.id === selectedScheduleStudentId);
    if (student) {
      setSelectedRYearTab(student.rLevel);
    }
  }, [selectedScheduleStudentId]);

  // States for Adding New Resident
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRLevel, setNewStudentRLevel] = useState<RLevel>('R1');
  const [newStudentYear, setNewStudentYear] = useState(115);
  const [selectedAvatarOption, setSelectedAvatarOption] = useState('👨‍⚕️');
  const [customAvatarBase64, setCustomAvatarBase64] = useState<string | null>(null);
  const [residentManagementMsg, setResidentManagementMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // States for Custom Course Creation
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState<CourseCategory>('ultrasound');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseYear, setNewCourseYear] = useState<RLevel | 'Any'>('Any');
  const [newCourseFrom, setNewCourseFrom] = useState(112);
  const [courseCreatedMsg, setCourseCreatedMsg] = useState(false);

  // States for Custom Homework Creation
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwMonth, setNewHwMonth] = useState(1);
  const [newHwLevel, setNewHwLevel] = useState<RLevel>('R1');
  const [newHwDesc, setNewHwDesc] = useState('');
  const [hwCreatedMsg, setHwCreatedMsg] = useState(false);

  // States for Student Experience & Submission Management (Teacher Panel override)
  const [selectedManageStudentId, setSelectedManageStudentId] = useState<string>(students[0]?.id || '');
  const selectedManageStudent = students.find(s => s.id === selectedManageStudentId);
  const [editLevelInput, setEditLevelInput] = useState<number>(0);
  const [editXpInput, setEditXpInput] = useState<number>(0);
  const [editNameInput, setEditNameInput] = useState<string>('');
  const [editRLevelInput, setEditRLevelInput] = useState<RLevel>('R1');
  const [editAdmissionYearInput, setEditAdmissionYearInput] = useState<number>(115);
  const [editingSubKey, setEditingSubKey] = useState<string | null>(null);
  const [editSubNotes, setEditSubNotes] = useState<string>('');
  const [editSubStatus, setEditSubStatus] = useState<'approved' | 'pending' | 'rejected'>('pending');

  // Synchronize XP inputs when selected student changes
  React.useEffect(() => {
    if (selectedManageStudent) {
      setEditLevelInput(selectedManageStudent.level);
      setEditXpInput(selectedManageStudent.xp);
      setEditNameInput(selectedManageStudent.name);
      setEditRLevelInput(selectedManageStudent.rLevel);
      setEditAdmissionYearInput(selectedManageStudent.admissionYear || 115);
    }
  }, [selectedManageStudentId, students]);

  const handleSaveXP = () => {
    if (selectedManageStudent && onUpdateStudentXP) {
      onUpdateStudentXP(
        selectedManageStudent.id,
        editLevelInput,
        editXpInput,
        editNameInput.trim(),
        editRLevelInput,
        editAdmissionYearInput
      );
    }
  };

  const selectedScheduleStudent = students.find(s => s.id === selectedScheduleStudentId);

  // Gather all pending items from all students
  interface PendingItem {
    studentId: string;
    studentName: string;
    studentRLevel: RLevel;
    type: 'rotation' | 'course' | 'homework';
    itemId: string; // month or courseId or homeworkId
    itemName: string;
    notes: string;
    fileName: string;
    fileUrl: string;
    submittedAt?: string;
    month?: number;
  }

  const pendingItems: PendingItem[] = [];

  students.forEach((student) => {
    // 1. Check Rotations
    Object.entries(student.rotationStatus).forEach(([mStr, s]) => {
      if (s.completed && s.status === 'pending') {
        const m = parseInt(mStr);
        const deptId = student.schedule[m - 1] || 'adult-er';
        const deptName = DEPARTMENTS[deptId]?.name || '成人急診';
        pendingItems.push({
          studentId: student.id,
          studentName: student.name,
          studentRLevel: student.rLevel,
          type: 'rotation',
          itemId: mStr,
          itemName: `${m}月份輪訓 - ${deptName}`,
          notes: s.notes,
          fileName: s.fileName,
          fileUrl: s.fileUrl,
          submittedAt: s.submittedAt
        });
      }
    });

    // 2. Check Courses
    Object.entries(student.courseStatus).forEach(([courseId, s]) => {
      if (s.completed && s.status === 'pending') {
        const course = COURSES.find(c => c.id === courseId);
        pendingItems.push({
          studentId: student.id,
          studentName: student.name,
          studentRLevel: student.rLevel,
          type: 'course',
          itemId: courseId,
          itemName: `必修學會課程 - ${course?.name || courseId}`,
          notes: s.notes,
          fileName: s.fileName,
          fileUrl: s.fileUrl,
          submittedAt: s.submittedAt
        });
      }
    });

    // 3. Check Homework
    Object.entries(student.homeworkStatus).forEach(([hwId, s]) => {
      if (s.completed && s.status === 'pending') {
        const hw = DEFAULT_HOMEWORKS.find(h => h.id === hwId);
        let itemName = '';
        let monthNum: number | undefined = undefined;
        
        if (hwId.startsWith('hw-routine-')) {
          const parts = hwId.split('-');
          const mStr = parts[parts.length - 1];
          monthNum = parseInt(mStr);
          itemName = `${monthNum}月份 常規評量核檢申報`;
        } else {
          itemName = `每月作業 - ${hw?.title || hwId}`;
          monthNum = hw?.month;
        }

        pendingItems.push({
          studentId: student.id,
          studentName: student.name,
          studentRLevel: student.rLevel,
          type: 'homework',
          itemId: hwId,
          itemName,
          notes: s.notes,
          fileName: s.fileName,
          fileUrl: s.fileUrl,
          submittedAt: s.submittedAt,
          month: monthNum
        });
      }
    });
  });

  const handleReview = (item: PendingItem, status: 'approved' | 'rejected') => {
    const feedbackKey = `${item.studentId}-${item.type}-${item.itemId}`;
    const feedbackText = reviewFeedbacks[feedbackKey] || '';
    
    onApproveReject(
      item.studentId,
      item.type,
      item.itemId,
      status,
      feedbackText || (status === 'approved' ? '審核通過，做得很好！' : '請補足相關資料後重新送審。')
    );

    // Clear feedback input
    setReviewFeedbacks(prev => {
      const copy = { ...prev };
      delete copy[feedbackKey];
      return copy;
    });
  };

  const handleManualScheduleChange = (monthIdx: number, deptId: string) => {
    if (!selectedScheduleStudent) return;
    
    const currentFourYearSchedules = selectedScheduleStudent.fourYearSchedules || {
      R1: selectedScheduleStudent.rLevel === 'R1' ? [...selectedScheduleStudent.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
      R2: selectedScheduleStudent.rLevel === 'R2' ? [...selectedScheduleStudent.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
      R3: selectedScheduleStudent.rLevel === 'R3' ? [...selectedScheduleStudent.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
      R4: selectedScheduleStudent.rLevel === 'R4' ? [...selectedScheduleStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er']
    };

    const updatedYearSchedule = [...(currentFourYearSchedules[selectedRYearTab] || Array(12).fill('adult-er'))];
    updatedYearSchedule[monthIdx] = deptId;

    const nextFourYearSchedules = {
      ...currentFourYearSchedules,
      [selectedRYearTab]: updatedYearSchedule
    };

    const nextActiveSchedule = selectedRYearTab === selectedScheduleStudent.rLevel
      ? updatedYearSchedule
      : [...selectedScheduleStudent.schedule];

    onUpdateSchedule(selectedScheduleStudent.id, nextActiveSchedule, nextFourYearSchedules);
  };

  // Excel-like Schedule Importer Parser
  const handleImportExcelText = () => {
    if (!selectedScheduleStudent) return;
    if (!excelPasteText.trim()) {
      setExcelParseMessage({ type: 'error', text: '請輸入或貼上課表文字！' });
      return;
    }

    // Try parsing Excel format. E.g.:
    // "1月:成人急診, 2月:成人急診, 3月:神經內科..." or separated by tabs/newlines
    // Simple parser: Find department keywords for 12 months.
    const deptKeywordsMap: Record<string, string> = {
      '成人急診': 'adult-er', '急診': 'adult-er', 'ER': 'adult-er',
      '神經內科': 'neuro', '神內': 'neuro',
      '兒科': 'peds', '小兒': 'peds',
      '婦產科': 'obgyn', '婦產': 'obgyn',
      '眼科': 'oph', '眼': 'oph',
      '耳鼻喉科': 'ent', '耳鼻喉': 'ent', 'ENT': 'ent',
      '緊急救護': 'ems', '消防隊': 'ems', 'EMS': 'ems',
      '精神科': 'psych', '精神': 'psych',
      '重症醫學': 'icu', '加護病房': 'icu', 'ICU': 'icu', 'MICU': 'icu',
      '超音波': 'echo', 'Ultrasound': 'echo', 'Echo': 'echo',
      '自選科': 'elective', '自選': 'elective',
      '災難醫學': 'disaster', '災難': 'disaster',
      '毒物科': 'toxicology', '毒物': 'toxicology',
      '偏遠地區': 'remote', '偏鄉': 'remote',
      '急診總醫師': 'admin', '總醫師': 'admin', 'Admin': 'admin',
      '年休': 'annual-leave', '放假': 'annual-leave', '特休': 'annual-leave', '休假': 'annual-leave',
      '尚未開始訓練': 'not-started', '尚未開始': 'not-started', '未開始': 'not-started',
      '完訓': 'completed-training', '完成訓練': 'completed-training'
    };

    const currentFourYearSchedules = selectedScheduleStudent.fourYearSchedules || {
      R1: selectedScheduleStudent.rLevel === 'R1' ? [...selectedScheduleStudent.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
      R2: selectedScheduleStudent.rLevel === 'R2' ? [...selectedScheduleStudent.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
      R3: selectedScheduleStudent.rLevel === 'R3' ? [...selectedScheduleStudent.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
      R4: selectedScheduleStudent.rLevel === 'R4' ? [...selectedScheduleStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er']
    };

    const targetYearSchedule = [...(currentFourYearSchedules[selectedRYearTab] || Array(12).fill('adult-er'))];
    let matchedCount = 0;

    // Split text by common separators: commas, tabs, semicolons, newlines
    const tokens = excelPasteText.split(/[\n\t,;，；]+/);

    // We look for month specifications like "1月", "2月" or just indices
    // Loop through 1 to 12
    for (let m = 1; m <= 12; m++) {
      const monthPrefixes = [`${m}月`, `${m}M`, `M${m}`, `Month ${m}`];
      
      // Look for a token containing this month specifier
      let foundDeptId = '';
      
      for (const token of tokens) {
        // Does this token specify the current month 'm'?
        const hasMonthPrefix = monthPrefixes.some(p => token.includes(p));
        
        // If it specifies this month, check for department keywords inside it
        if (hasMonthPrefix) {
          for (const [kw, dId] of Object.entries(deptKeywordsMap)) {
            if (token.includes(kw)) {
              foundDeptId = dId;
              break;
            }
          }
        }
      }

      // Fallback: If no explicit month prefix found but we have 12 tokens in order
      if (!foundDeptId && tokens.length >= 12) {
        const tokenAtIdx = tokens[m - 1];
        if (tokenAtIdx) {
          for (const [kw, dId] of Object.entries(deptKeywordsMap)) {
            if (tokenAtIdx.includes(kw)) {
              foundDeptId = dId;
              break;
            }
          }
        }
      }

      if (foundDeptId) {
        targetYearSchedule[m - 1] = foundDeptId;
        matchedCount++;
      }
    }

    if (matchedCount > 0) {
      const nextFourYearSchedules = {
        ...currentFourYearSchedules,
        [selectedRYearTab]: targetYearSchedule
      };

      const nextActiveSchedule = selectedRYearTab === selectedScheduleStudent.rLevel
        ? targetYearSchedule
        : [...selectedScheduleStudent.schedule];

      onUpdateSchedule(selectedScheduleStudent.id, nextActiveSchedule, nextFourYearSchedules);
      setExcelParseMessage({ 
        type: 'success', 
        text: `匯入成功！已成功解析並更新 ${selectedRYearTab} 的 12 個月中的 ${matchedCount} 個科別輪訓。` 
      });
      setExcelPasteText('');
    } else {
      setExcelParseMessage({ 
        type: 'error', 
        text: '無法辨識科別文字。請確保使用格式如：「1月: ICU, 2月: 兒科」或直接複製整列試算表貼上。' 
      });
    }
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const id = `course-custom-${Date.now()}`;
    onAddCustomCourse({
      id,
      name: newCourseName,
      category: newCourseCategory,
      description: newCourseDesc || '手動新增的必修/推薦學會課程學分。',
      applicableFrom: newCourseFrom,
      suggestedYear: newCourseYear
    });

    setNewCourseName('');
    setNewCourseDesc('');
    setCourseCreatedMsg(true);
    setTimeout(() => setCourseCreatedMsg(false), 3000);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;

    const id = `hw-custom-${newHwLevel.toLowerCase()}-${newHwMonth}-${Date.now()}`;
    onAddCustomHomework({
      id,
      title: `${newHwMonth}月：${newHwTitle}`,
      month: newHwMonth,
      rLevel: newHwLevel,
      description: newHwDesc || '指導VS手動新增之月份應完成作業與Milestones指標。'
    });

    setNewHwTitle('');
    setNewHwDesc('');
    setHwCreatedMsg(true);
    setTimeout(() => setHwCreatedMsg(false), 3000);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      setResidentManagementMsg({ type: 'error', text: '請輸入住院醫師姓名！' });
      return;
    }

    if (!onAddStudent) return;

    // Default 12-month schedule loaded with their R-level template or adult emergency
    const defaultSchedule = rLevelTemplates[newStudentRLevel] || Array(12).fill('adult-er');

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: newStudentName.trim(),
      rLevel: newStudentRLevel,
      level: 1,
      xp: 0,
      admissionYear: newStudentYear,
      avatar: customAvatarBase64 || selectedAvatarOption,
      schedule: [...defaultSchedule],
      fourYearSchedules: {
        R1: [...(rLevelTemplates.R1 || Array(12).fill('adult-er'))],
        R2: [...(rLevelTemplates.R2 || Array(12).fill('adult-er'))],
        R3: [...(rLevelTemplates.R3 || Array(12).fill('adult-er'))],
        R4: [...(rLevelTemplates.R4 || Array(12).fill('adult-er'))]
      },
      rotationStatus: {},
      courseStatus: {},
      homeworkStatus: {}
    };

    onAddStudent(newStudent);

    setNewStudentName('');
    setCustomAvatarBase64(null);
    setResidentManagementMsg({ type: 'success', text: `已成功新增住院醫師 ${newStudent.name} 帳戶！` });
    setTimeout(() => {
      setResidentManagementMsg(null);
    }, 4000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setResidentManagementMsg({ type: 'error', text: '照片檔案過大，請上傳小於 2MB 的圖片！' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarBase64(reader.result as string);
        setResidentManagementMsg({ type: 'success', text: '照片上傳並預覽成功！' });
        setTimeout(() => setResidentManagementMsg(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteStudentSubmit = () => {
    if (!selectedManageStudent) return;
    if (onDeleteStudent) {
      onDeleteStudent(selectedManageStudent.id);
      setResidentManagementMsg({ type: 'success', text: `已成功刪除 ${selectedManageStudent.name} 住院醫師帳戶。` });
      setShowDeleteConfirm(false);
      setTimeout(() => {
        setResidentManagementMsg(null);
      }, 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Teacher workspace tabs */}
      <div className="border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm flex items-center justify-between gap-4 flex-wrap">
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'pending'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>待審核申報 ({pendingItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>手動與Excel課表匯入</span>
          </button>

          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'create'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>新增必修課程與作業</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manage')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'manage'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>歷程與經驗值管理</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'settings'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>系統時間設定</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 text-slate-500 text-xs">
          <Users className="h-4 w-4 text-indigo-600" />
          <span>管理對象：<strong>{students.length} 位急診住院醫師 (R1-R4)</strong></span>
        </div>

      </div>

      {/* Sub Tab: Pending Approvals Console */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800">
            住院醫師線上申報審核主控台 (Approvals Console)
          </h3>

          {pendingItems.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-2">
              <CheckCircle2 className="h-10 w-10 text-teal-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">目前沒有需要審核的申報項目</p>
              <p className="text-xs text-slate-400">當前所有住院醫師的科別輪訓、學會證書、每月臨床作業皆已查核完畢。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item, idx) => {
                const feedbackKey = `${item.studentId}-${item.type}-${item.itemId}`;
                return (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    
                    {/* Item title header */}
                    <div className="bg-slate-900/5 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">
                          {item.studentName} 醫師 ({item.studentRLevel})
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="rounded bg-indigo-100 font-bold px-1.5 py-0.5 text-indigo-800 text-[10px]">
                          {item.type === 'rotation' ? '科別輪訓完畢申報' : item.type === 'course' ? '學會證書申報' : '每月臨床作業'}
                        </span>
                      </div>
                      
                      {item.submittedAt && (
                        <div className="text-slate-400 font-medium text-[10px]">
                          提交時間：{item.submittedAt}
                        </div>
                      )}
                    </div>

                    {/* Submission content details */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Notes & File proofs */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                            項目名稱：
                          </h4>
                          <span className="text-sm font-extrabold text-slate-800">
                            {item.itemName}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                            住院醫師自述心得 / 備忘錄：
                          </h4>
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic whitespace-pre-wrap">
                            &ldquo;{item.notes || '（無填寫心得）'}&rdquo;
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                            上傳之佐證檔案證明：
                          </h4>
                          <div className="flex items-center space-x-2 p-2.5 rounded-lg border border-teal-100 bg-teal-50/30 text-xs">
                            <FileText className="h-5 w-5 text-teal-600 shrink-0" />
                            <span className="font-bold text-teal-800 truncate">{item.fileName}</span>
                            <span className="text-[10px] bg-teal-100 text-teal-700 px-1 py-0.25 rounded shrink-0">有效證明</span>
                          </div>
                        </div>

                        {item.type === 'homework' && item.month && (
                          <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3.5 space-y-2 text-xs mt-2">
                            <span className="font-bold text-rose-900 block flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1.5 text-rose-600" />
                              本月份已確認備齊之檢核項目與評量 ({MONTHLY_CHECKLISTS[item.month]?.length || 0} 項)：
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white p-2 rounded border border-rose-100/50 max-h-[140px] overflow-y-auto scrollbar-thin">
                              {(MONTHLY_CHECKLISTS[item.month] || []).map((chkItem, cidx) => (
                                <div key={cidx} className="flex items-center space-x-1.5 text-[11px] text-slate-700 font-semibold">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                  <span className="leading-snug">{chkItem}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Feedback & Action form */}
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            給予住院醫師的審查意见與回饋 (Feedback)
                          </label>
                          <textarea
                            placeholder="請在此輸入對該報告、心得或佐證的評語，通過審查將自動核發 XP；若退回，此意見將顯示給住院醫師進行修正..."
                            value={reviewFeedbacks[feedbackKey] || ''}
                            onChange={(e) => setReviewFeedbacks({
                              ...reviewFeedbacks,
                              [feedbackKey]: e.target.value
                            })}
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleReview(item, 'rejected')}
                            className="flex items-center justify-center space-x-1.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>退回修改</span>
                          </button>

                          <button
                            onClick={() => handleReview(item, 'approved')}
                            className="flex items-center justify-center space-x-1.5 rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 shadow shadow-teal-600/10 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>核准通過 (+50 XP)</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sub Tab: Schedule Editor & Excel importer */}
      {activeSubTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Manual month selectors (Col-span 7) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-800">
                  住院醫師 4 年輪訓表調整
                </h3>
              </div>
              
              {/* Resident selector */}
              <select
                value={selectedScheduleStudentId}
                onChange={(e) => setSelectedScheduleStudentId(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rLevel})</option>
                ))}
              </select>
            </div>

            {selectedScheduleStudent && (
              <div className="space-y-4">
                {/* 4-Year Tabs Selector */}
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500 pl-1">
                    訓練年度：
                  </span>
                  <div className="flex space-x-1.5">
                    {(['R1', 'R2', 'R3', 'R4'] as RLevel[]).map((rYear) => {
                      const isCurrentGrade = selectedScheduleStudent.rLevel === rYear;
                      const isSelected = selectedRYearTab === rYear;
                      return (
                        <button
                          key={rYear}
                          type="button"
                          onClick={() => setSelectedRYearTab(rYear)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{rYear}</span>
                          {isCurrentGrade && (
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full" title="目前所屬年級" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info Note Banner */}
                {selectedRYearTab !== selectedScheduleStudent.rLevel ? (
                  <div className="bg-amber-50 text-[10px] text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 animate-in fade-in duration-200">
                    <span>⚠️ 提示：您正在編輯非目前所屬年級的課表。當該醫師升為 <strong>{selectedRYearTab}</strong> 時，本課表將自動套用為其主輪訓課表。</span>
                  </div>
                ) : (
                  <div className="bg-teal-50/50 text-[10px] text-teal-900 border border-teal-200/50 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 animate-in fade-in duration-200">
                    <span>✅ 提示：您正在編輯目前所屬年級 <strong>{selectedRYearTab}</strong> 的課表，設定將即時同步於大富翁與作業。</span>
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  修改 <strong>{selectedScheduleStudent.name}</strong> 醫師於 <strong>{selectedRYearTab}</strong> 階段之 12 個月輪訓科別：
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {MONTH_NAMES.map((monthName, idx) => {
                    const currentFourYearSchedules = selectedScheduleStudent.fourYearSchedules || {
                      R1: selectedScheduleStudent.rLevel === 'R1' ? [...selectedScheduleStudent.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
                      R2: selectedScheduleStudent.rLevel === 'R2' ? [...selectedScheduleStudent.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
                      R3: selectedScheduleStudent.rLevel === 'R3' ? [...selectedScheduleStudent.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
                      R4: selectedScheduleStudent.rLevel === 'R4' ? [...selectedScheduleStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er']
                    };
                    const currentDeptId = (currentFourYearSchedules[selectedRYearTab] || Array(12).fill('adult-er'))[idx] || 'adult-er';

                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                        <span className="font-extrabold text-slate-800 font-mono shrink-0 w-16">
                          {idx + 1}月份：
                        </span>
                        
                        <select
                          value={currentDeptId}
                          onChange={(e) => handleManualScheduleChange(idx, e.target.value)}
                          className="w-full max-w-[160px] rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
                        >
                          {Object.values(DEPARTMENTS).map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Excel Importer (Col-span 5) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-800">
                一整年輪訓課表 Excel 批次匯入
              </h3>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                您可以直接從 Excel、試算表或文字紀錄中，複製住院醫師全年的輪訓名單，在下方貼上。系統將自動解析文字，一鍵更新 12 個月的科別表。
              </p>
              
              <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200 text-[10px] text-amber-900 space-y-1 font-medium">
                <div><strong>💡 建議貼上格式範例（以下皆可辨識）：</strong></div>
                <div className="font-mono bg-white p-1 rounded border border-amber-100">
                  1月:成人急診, 2月:兒科, 3月:兒科, 4月:婦產科, 5月:神內, 6月:眼科, 7月:耳鼻喉, 8月:緊急救護, 9月:重症加護, 10月:超音波, 11月:自選科, 12月:成人急診
                </div>
                <div>或是直接複製 12 列純文字（以逗號、空格或換行隔開）：</div>
                <div className="font-mono bg-white p-1 rounded border border-amber-100">
                  ICU, ICU, 兒科, 兒科, 眼科, 耳鼻喉, 婦產科, 急診, 急診, 超音波, 自選科, 偏鄉外訓
                </div>
              </div>

              <textarea
                placeholder="請在此貼上課表文字..."
                value={excelPasteText}
                onChange={(e) => {
                  setExcelPasteText(e.target.value);
                  setExcelParseMessage(null);
                }}
                rows={4}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-700 font-mono focus:border-emerald-500 focus:outline-none"
              />

              {excelParseMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center ${
                  excelParseMessage.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50 border border-rose-100 text-rose-800'
                }`}>
                  {excelParseMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-1.5 text-rose-600 shrink-0" />
                  )}
                  <span>{excelParseMessage.text}</span>
                </div>
              )}

              <button
                onClick={handleImportExcelText}
                className="w-full flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs shadow transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>解析並更新住院醫師課表</span>
              </button>

            </div>

          </div>

        </div>
      )}

      {/* Sub Tab: Add custom Course & Homework */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create custom Course Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-800">
                手動新增學會必修/自訂課程
              </h3>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">課程大類</label>
                <select
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value as CourseCategory)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ultrasound">超音波學</option>
                  <option value="toxicology">毒物學</option>
                  <option value="disaster">災難醫學</option>
                  <option value="ems">緊急醫療救護</option>
                  <option value="triage">檢傷分類</option>
                  <option value="assessment">期中/能力評量</option>
                  <option value="geriatrics">急診高齡醫學 (115新制)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">課程名稱</label>
                <input
                  type="text"
                  placeholder="例如：毒蛇咬傷臨床急處置、高級小兒超音波"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">適用訓練年度 (含起)</label>
                  <input
                    type="number"
                    value={newCourseFrom}
                    onChange={(e) => setNewCourseFrom(parseInt(e.target.value))}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">建議住院醫師層級</label>
                  <select
                    value={newCourseYear}
                    onChange={(e) => setNewCourseYear(e.target.value as RLevel | 'Any')}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="Any">全級 (Any)</option>
                    <option value="R1">R1</option>
                    <option value="R2">R2</option>
                    <option value="R3">R3</option>
                    <option value="R4">R4</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">說明與合格要件</label>
                <textarea
                  placeholder="請輸入此學會課程認證之說明與佐證檔案的要求..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-300 p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              {courseCreatedMsg && (
                <div className="p-2 bg-teal-50 rounded text-xs text-teal-800 font-bold flex items-center animate-in fade-in duration-150">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-teal-600" />
                  已成功新增該學會必修項目！學生將在對應學年或課程頁面中看見。
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-xs shadow transition-colors cursor-pointer"
              >
                確認手動新增學會項目
              </button>

            </form>

          </div>

          {/* Create custom Homework Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Plus className="h-5 w-5 text-rose-600" />
              <h3 className="text-sm font-extrabold text-slate-800">
                手動新增每月臨床科內作業
              </h3>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">應繳月份</label>
                  <select
                    value={newHwMonth}
                    onChange={(e) => setNewHwMonth(parseInt(e.target.value))}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{m}月份</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">限制住院醫師層級</label>
                  <select
                    value={newHwLevel}
                    onChange={(e) => setNewHwLevel(e.target.value as RLevel)}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="R1">R1 住院醫師</option>
                    <option value="R2">R2 住院醫師</option>
                    <option value="R3">R3 住院醫師</option>
                    <option value="R4">R4 住院醫師</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">作業主題與名稱</label>
                <input
                  type="text"
                  placeholder="例如：急診常見傷寒病例分析、外傷手術DOPS紀錄"
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                  className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">作業內容說明與要求</label>
                <textarea
                  placeholder="請輸入此作業的寫作要求、主要CBME里程碑指標..."
                  value={newHwDesc}
                  onChange={(e) => setNewHwDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-slate-300 p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              {hwCreatedMsg && (
                <div className="p-2 bg-teal-50 rounded text-xs text-teal-800 font-bold flex items-center animate-in fade-in duration-150">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-teal-600" />
                  已成功指派此月份作業！
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-xs shadow transition-colors cursor-pointer"
              >
                確認發佈每月作業
              </button>

            </form>

          </div>

        </div>
      )}

      {/* Sub Tab: Manage Student XP and Submissions */}
      {activeSubTab === 'manage' && selectedManageStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          
          {/* Left Panel: Student Selection & XP/Level Management */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Student Selector Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-800">
                  選擇要管理的住院醫師
                </h3>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500">選擇住院醫師：</label>
                <select
                  value={selectedManageStudentId}
                  onChange={(e) => {
                    setSelectedManageStudentId(e.target.value);
                    setEditingSubKey(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} 醫師 ({s.rLevel} - Level {s.level}, {s.xp} XP)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resident Account Management block */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  <h3 className="text-sm font-extrabold text-slate-800">
                    住院醫師帳戶管理
                  </h3>
                </div>
              </div>

              {residentManagementMsg && (
                <div className={`p-3 rounded-lg text-xs font-bold flex items-center space-x-2 ${
                  residentManagementMsg.type === 'success' 
                    ? 'bg-teal-50 border border-teal-100 text-teal-800' 
                    : 'bg-rose-50 border border-rose-100 text-rose-800'
                }`}>
                  <span>{residentManagementMsg.text}</span>
                </div>
              )}

              {/* Accordion 1: Add Resident Form */}
              <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 space-y-3">
                <span className="block text-xs font-black text-slate-700">
                  ➕ 新增住院醫師帳戶
                </span>

                <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">姓名 (Name)：</label>
                    <input
                      type="text"
                      placeholder="例如: 陳建宏"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">訓練階段：</label>
                      <select
                        value={newStudentRLevel}
                        onChange={(e) => setNewStudentRLevel(e.target.value as RLevel)}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none"
                      >
                        <option value="R1">R1 (第一年)</option>
                        <option value="R2">R2 (第二年)</option>
                        <option value="R3">R3 (第三年)</option>
                        <option value="R4">R4 (第四年)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">訓練年度：</label>
                      <select
                        value={newStudentYear}
                        onChange={(e) => setNewStudentYear(parseInt(e.target.value))}
                        className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none font-mono"
                      >
                        <option value={115}>115 年度</option>
                        <option value={114}>114 年度</option>
                        <option value={113}>113 年度</option>
                        <option value={112}>112 年度</option>
                        <option value={111}>111 年度</option>
                      </select>
                    </div>
                  </div>

                  {/* Predefined Avatar & Custom Photo Upload Section */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500">選擇頭像或上傳照片：</label>
                    
                    {/* Predefined Emojis */}
                    <div className="flex gap-1.5 flex-wrap pb-1">
                      {['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '🩺', '🧠', '❤️'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setSelectedAvatarOption(emoji);
                            setCustomAvatarBase64(null);
                          }}
                          className={`h-7 w-7 text-sm flex items-center justify-center rounded-lg border transition-all ${
                            !customAvatarBase64 && selectedAvatarOption === emoji
                              ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-100'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Custom Photo Upload */}
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center justify-center space-x-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer shadow-2xs">
                        <Upload className="h-3 w-3 text-slate-500" />
                        <span>上傳自訂照片</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {customAvatarBase64 ? (
                        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-teal-500 shadow-sm shrink-0">
                          <img referrerPolicy="no-referrer" src={customAvatarBase64} alt="Custom Preview" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-400">目前選擇: {selectedAvatarOption}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>新增住院醫師</span>
                  </button>
                </form>
              </div>

              {/* Accordion 2: Delete Current Resident */}
              {selectedManageStudent && (
                <div className="border border-rose-150 rounded-lg p-3 bg-rose-50/20 space-y-2">
                  <span className="block text-xs font-black text-rose-700">
                    ❌ 刪除目前所選住院醫師
                  </span>
                  
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    將徹底移除 <strong>{selectedManageStudent.name}</strong> 醫師的整個帳戶、輪訓課表以及所有作業審核資料。
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-1.5 text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>刪除此醫師帳戶...</span>
                    </button>
                  ) : (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 space-y-2 animate-in slide-in-from-top-1 duration-150">
                      <span className="block text-[10px] font-black text-rose-800 text-center">
                        ⚠️ 確定要永久刪除 {selectedManageStudent.name} 嗎？
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteStudentSubmit}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-black py-1 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          確定永久刪除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Resident Information & Progress Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-800">
                  修改基本資訊與學習歷程
                </h3>
              </div>
              
              <div className="space-y-3.5 text-xs">
                {/* Name & Admission Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">姓名：</label>
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">入學年度：</label>
                    <select
                      value={editAdmissionYearInput}
                      onChange={(e) => setEditAdmissionYearInput(parseInt(e.target.value))}
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value={115}>115 年度</option>
                      <option value={114}>114 年度</option>
                      <option value={113}>113 年度</option>
                      <option value={112}>112 年度</option>
                      <option value={111}>111 年度</option>
                    </select>
                  </div>
                </div>

                {/* Grade rLevel Selector */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">目前訓練階段 (年級)：</label>
                  <select
                    value={editRLevelInput}
                    onChange={(e) => setEditRLevelInput(e.target.value as RLevel)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-black text-indigo-600"
                  >
                    <option value="R1">R1 (第一年住院醫師)</option>
                    <option value="R2">R2 (第二年住院醫師)</option>
                    <option value="R3">R3 (第三年住院醫師)</option>
                    <option value="R4">R4 (第四年住院醫師)</option>
                  </select>
                </div>

                {/* Level & XP inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">等級 (Level)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={editLevelInput}
                      onChange={(e) => setEditLevelInput(parseInt(e.target.value) || 1)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">目前經驗值 (XP)</label>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={editXpInput}
                      onChange={(e) => setEditXpInput(parseInt(e.target.value) || 0)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 leading-normal space-y-1">
                  <p>💡 系統提示：若您變更該醫師的 <strong>年級訓練階段</strong>，其大富翁主輪訓課表將會 <strong>自動同步載入</strong> 您為其設定的該年級客製輪訓課表！</p>
                </div>

                <button
                  onClick={handleSaveXP}
                  className="w-full flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs shadow hover:shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>儲存更新基本資訊與學習進度</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Submissions Management */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <CheckSquare className="h-5 w-5 text-rose-500" />
              <h3 className="text-sm font-extrabold text-slate-800">
                管理已繳交之作業與申報歷程
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                以下列出 <strong>{selectedManageStudent.name}</strong> 醫師所有已上傳或審核完畢之項目，您可以對其進行<strong>修改心得、調整狀態</strong>或<strong>直接刪除申報記錄</strong>：
              </p>

              {/* List of active student submissions */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {(() => {
                  const items: Array<{
                    type: 'rotation' | 'course' | 'homework';
                    itemId: string;
                    title: string;
                    notes: string;
                    status: 'approved' | 'pending' | 'rejected';
                    fileName: string;
                    submittedAt?: string;
                  }> = [];

                  // 1. Rotations
                  Object.entries(selectedManageStudent.rotationStatus).forEach(([mKey, sub]) => {
                    items.push({
                      type: 'rotation',
                      itemId: mKey,
                      title: `${mKey}月份：科別輪訓`,
                      notes: sub.notes,
                      status: sub.status,
                      fileName: sub.fileName,
                      submittedAt: sub.submittedAt
                    });
                  });

                  // 2. Courses
                  Object.entries(selectedManageStudent.courseStatus).forEach(([courseId, sub]) => {
                    const c = COURSES.find(x => x.id === courseId);
                    items.push({
                      type: 'course',
                      itemId: courseId,
                      title: `學會課程：${c?.name || courseId}`,
                      notes: sub.notes,
                      status: sub.status,
                      fileName: sub.fileName,
                      submittedAt: sub.submittedAt
                    });
                  });

                  // 3. Homeworks
                  Object.entries(selectedManageStudent.homeworkStatus).forEach(([hwId, sub]) => {
                    const hw = DEFAULT_HOMEWORKS.find(x => x.id === hwId);
                    items.push({
                      type: 'homework',
                      itemId: hwId,
                      title: `${hw?.title || hwId}`,
                      notes: sub.notes,
                      status: sub.status,
                      fileName: sub.fileName,
                      submittedAt: sub.submittedAt
                    });
                  });

                  if (items.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        該住院醫師目前尚無任何作業或申報紀錄。
                      </div>
                    );
                  }

                  // Sort by type/id
                  return items.map((subItem) => {
                    const uniqueKey = `${subItem.type}-${subItem.itemId}`;
                    const isEditing = editingSubKey === uniqueKey;

                    return (
                      <div key={uniqueKey} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-3 transition-all">
                        
                        {/* Title and Status Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-800 text-[13px]">
                            {subItem.title}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            subItem.status === 'approved'
                              ? 'bg-teal-100 text-teal-800'
                              : subItem.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {subItem.status === 'approved' ? '已核可' : subItem.status === 'pending' ? '待審核' : '已退回'}
                          </span>
                        </div>

                        {/* Submitted at and File */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium">
                          {subItem.submittedAt && <span>提交時間：{subItem.submittedAt}</span>}
                          {subItem.fileName && <span className="text-teal-600 font-bold">夾檔：{subItem.fileName}</span>}
                        </div>

                        {/* Notes and feedback */}
                        {!isEditing ? (
                          <div className="bg-white p-2.5 rounded border border-slate-100 italic text-slate-600 whitespace-pre-wrap">
                            &ldquo;{subItem.notes || '（無自述心得）'}&rdquo;
                          </div>
                        ) : (
                          <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-400">編輯心得反思 / Case 內容：</label>
                              <textarea
                                value={editSubNotes}
                                onChange={(e) => setEditSubNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded border border-slate-300 p-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black text-slate-400">變更審查狀態：</label>
                              <select
                                value={editSubStatus}
                                onChange={(e) => setEditSubStatus(e.target.value as any)}
                                className="rounded border border-slate-300 p-1 text-xs text-slate-700 bg-white"
                              >
                                <option value="pending">待審核 (Pending)</option>
                                <option value="approved">核可通過 (Approved)</option>
                                <option value="rejected">退回修改 (Rejected)</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => setEditingSubKey(null)}
                                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-500 cursor-pointer"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => {
                                  if (onModifyDeleteSubmission) {
                                    onModifyDeleteSubmission(
                                      selectedManageStudent.id,
                                      subItem.type,
                                      subItem.itemId,
                                      'modify',
                                      editSubNotes,
                                      editSubStatus
                                    );
                                    setEditingSubKey(null);
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                              >
                                <Save className="h-3 w-3" />
                                <span>儲存修改</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        {!isEditing && (
                          <div className="flex items-center justify-end space-x-2 pt-1">
                            <button
                              onClick={() => {
                                setEditingSubKey(uniqueKey);
                                setEditSubNotes(subItem.notes);
                                setEditSubStatus(subItem.status);
                              }}
                              className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>修改內容/狀態</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`確定要刪除「${subItem.title}」的申報紀錄嗎？此動作將會清除此申報，且不可還原。`)) {
                                  if (onModifyDeleteSubmission) {
                                    onModifyDeleteSubmission(
                                      selectedManageStudent.id,
                                      subItem.type,
                                      subItem.itemId,
                                      'delete'
                                    );
                                  }
                                }
                              }}
                              className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>刪除申報</span>
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  });
                })()}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Sub Tab: Global System Settings */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          {/* Section 1: System Time / Ongoing Month Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-800">
                系統時間設定 (Global Time Settings)
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              設定目前系統日期與核心進行月份。<strong>此設定為強制管控，學生在個人端將只能檢視，無法任意變更進行中的月份。</strong>這能確保所有住院醫師皆在相同的教學進度下進行大富翁輪訓與核心學分申報。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">目前進行訓練月份</label>
                <select
                  value={systemOngoingMonth}
                  onChange={(e) => onUpdateSystemTime(parseInt(e.target.value), systemDateText)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name} (M{idx + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">目前系統顯示日期</label>
                <input
                  type="date"
                  value={systemDateText}
                  onChange={(e) => onUpdateSystemTime(systemOngoingMonth, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-semibold flex items-start space-x-2">
              <span className="shrink-0 text-base">💡</span>
              <div className="space-y-1">
                <p>當您變更上述設定後，所有住院醫師的個人首頁、大富翁地圖、作業頁面皆會自動鎖定為該月份。</p>
                <p className="text-slate-500 font-medium text-[11px]">舉例：若設為「七月」，學生端大富翁將直接將其第 7 個月科別標記為「目前進行中」，學生無法自行切換進行中的月份，以達到教學部統一控管之目的。</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
