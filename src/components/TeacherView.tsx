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
  Save,
  RotateCcw,
  Sliders,
  Check,
  Zap,
  Play,
  Camera,
  GraduationCap,
  Hourglass,
  Lock,
  Unlock,
  ShieldCheck,
  Award,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { 
  Student, 
  Course, 
  Homework, 
  DEPARTMENTS, 
  COURSES, 
  DEFAULT_HOMEWORKS, 
  MONTH_NAMES, 
  RLevel, 
  ClockMode, 
  CourseCategory, 
  MONTHLY_CHECKLISTS,
  checkPromotionEligibility,
  NEXT_R_LEVEL,
  PromotionRecord,
  PromotionStatus,
  PromotionCheckResult,
  Mentor,
  DEFAULT_MENTORS
} from '../types';
import { compressImageToDataUrl } from '../utils/imageUtils';

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
  onUpdateStudentXP?: (
    studentId: string,
    level: number,
    xp: number,
    name?: string,
    rLevel?: RLevel,
    admissionYear?: number,
    avatar?: string,
    trainingStartDate?: string
  ) => void;
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
  
  // System settings props
  systemOngoingMonth: number;
  systemDateText: string;
  clockMode?: ClockMode;
  currentTimeText?: string;
  onUpdateSystemTime: (month: number, dateText: string, mode?: ClockMode) => void;
  onToggleClockMode?: (mode: ClockMode) => void;
  rLevelTemplates: Record<RLevel, string[]>;
  onUpdateRLevelTemplates: (templates: Record<RLevel, string[]>) => void;
  onApplyRLevelTemplateToAll?: (rLevel: RLevel) => void;
  onApprovePromotion?: (studentId: string, approved: boolean, feedback?: string) => void;
  onCancelPromotion?: (studentId: string) => void;
  onRevertPromotion?: (studentId: string) => void;
  onUpdateMentor?: (studentId: string, mentorName: string, mentorTitle?: string) => void;
  mentors: Mentor[];
  onUpdateMentors?: (newMentors: Mentor[]) => void;
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
  clockMode = 'auto',
  currentTimeText = '',
  onUpdateSystemTime,
  onToggleClockMode,
  rLevelTemplates,
  onUpdateRLevelTemplates,
  onApplyRLevelTemplateToAll,
  onApprovePromotion,
  onCancelPromotion,
  onRevertPromotion,
  onUpdateMentor,
  mentors,
  onUpdateMentors
}: TeacherViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'promotion' | 'schedule' | 'create' | 'manage' | 'mentors' | 'settings'>('pending');
  
  // States for Promotion Reviews
  const [promotionFeedbacks, setPromotionFeedbacks] = useState<Record<string, string>>({}); // key: studentId
  const [isProcessingPromotion, setIsProcessingPromotion] = useState<string | null>(null);

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
  const [newStudentStartDate, setNewStudentStartDate] = useState('2026-08-01');
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
  const [editTrainingStartDateInput, setEditTrainingStartDateInput] = useState<string>('2026-08-01');
  const [editAvatarInput, setEditAvatarInput] = useState<string>('👨‍⚕️');
  const [editingSubKey, setEditingSubKey] = useState<string | null>(null);
  const [editSubNotes, setEditSubNotes] = useState<string>('');
  const [editSubStatus, setEditSubStatus] = useState<'approved' | 'pending' | 'rejected'>('pending');

  // Synchronize inputs when selected student changes
  React.useEffect(() => {
    if (selectedManageStudent) {
      setEditLevelInput(selectedManageStudent.level);
      setEditXpInput(selectedManageStudent.xp);
      setEditNameInput(selectedManageStudent.name);
      setEditRLevelInput(selectedManageStudent.rLevel);
      setEditAdmissionYearInput(selectedManageStudent.admissionYear || 115);
      setEditTrainingStartDateInput(
        selectedManageStudent.trainingStartDate || 
        `${1911 + (selectedManageStudent.admissionYear || 115)}-08-01`
      );
      setEditAvatarInput(selectedManageStudent.avatar || '👨‍⚕️');
    }
  }, [selectedManageStudentId, students]);

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setResidentManagementMsg({ type: 'success', text: '正在處理與壓縮醫師照片...' });
      const compressedDataUrl = await compressImageToDataUrl(file, 240, 240, 0.85);
      setEditAvatarInput(compressedDataUrl);
      setResidentManagementMsg({ type: 'success', text: '照片載入並預覽成功！請點擊下方儲存更新按鈕。' });
      setTimeout(() => setResidentManagementMsg(null), 3500);
    } catch (err: any) {
      setResidentManagementMsg({ type: 'error', text: err?.message || '圖片壓縮處理失敗，請重試！' });
    }
  };

  const handleSaveXP = () => {
    if (selectedManageStudent && onUpdateStudentXP) {
      onUpdateStudentXP(
        selectedManageStudent.id,
        editLevelInput,
        editXpInput,
        editNameInput.trim(),
        editRLevelInput,
        editAdmissionYearInput,
        editAvatarInput,
        editTrainingStartDateInput.trim()
      );
    }
  };

  // Clinical Mentors Management State
  const [isEditingMentor, setIsEditingMentor] = useState<boolean>(false);
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [mentorNameInput, setMentorNameInput] = useState<string>('');
  const [mentorTitleInput, setMentorTitleInput] = useState<string>('急診專任主治醫師 / 教學指導導師');
  const [mentorSpecialtyInput, setMentorSpecialtyInput] = useState<string>('急診醫學');

  const handleStartAddMentor = () => {
    setIsEditingMentor(true);
    setEditingMentorId(null);
    setMentorNameInput('');
    setMentorTitleInput('急診專任主治醫師 / 教學指導導師');
    setMentorSpecialtyInput('急診醫學');
  };

  const handleStartEditMentor = (m: Mentor) => {
    setIsEditingMentor(true);
    setEditingMentorId(m.id || m.name);
    setMentorNameInput(m.name);
    setMentorTitleInput(m.title);
    setMentorSpecialtyInput(m.specialty || '');
  };

  const handleSaveMentorForm = () => {
    if (!mentorNameInput.trim()) return;
    const currentList = mentors && mentors.length > 0 ? [...mentors] : [...DEFAULT_MENTORS];
    if (editingMentorId) {
      const idx = currentList.findIndex(m => (m.id && m.id === editingMentorId) || m.name === editingMentorId);
      if (idx >= 0) {
        currentList[idx] = {
          ...currentList[idx],
          name: mentorNameInput.trim(),
          title: mentorTitleInput.trim(),
          specialty: mentorSpecialtyInput.trim()
        };
      }
    } else {
      currentList.push({
        id: 'm-' + Date.now(),
        name: mentorNameInput.trim(),
        title: mentorTitleInput.trim(),
        specialty: mentorSpecialtyInput.trim()
      });
    }
    if (onUpdateMentors) {
      onUpdateMentors(currentList);
    }
    setIsEditingMentor(false);
    setEditingMentorId(null);
  };

  const handleDeleteMentor = (mentorIdOrName: string) => {
    if (!window.confirm('確定要自系統名冊中刪除此位指導導師嗎？')) return;
    const currentList = (mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS).filter(
      m => m.id !== mentorIdOrName && m.name !== mentorIdOrName
    );
    if (onUpdateMentors) {
      onUpdateMentors(currentList);
    }
  };

  const handleResetToDefaultMentors = () => {
    if (!window.confirm('確定要恢復為急診醫學會指定 4 位指導導師（鍾睿元、張昱、吳妍萱、李宥霆）嗎？')) return;
    if (onUpdateMentors) {
      onUpdateMentors(DEFAULT_MENTORS);
    }
  };

  const handleAutoAssignMentors = () => {
    if (!onUpdateMentor) return;
    if (!window.confirm('確定要依年級一鍵指派專屬導師嗎？\n(R1 ➔ 鍾睿元, R2 ➔ 張昱, R3 ➔ 吳妍萱, R4 ➔ 李宥霆)')) return;
    
    const activeMentors = mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS;
    const findMentorByName = (name: string) => activeMentors.find(m => m.name.includes(name)) || activeMentors[0];

    students.forEach(st => {
      let targetMentor = activeMentors[0];
      if (st.rLevel === 'R1') targetMentor = findMentorByName('鍾睿元');
      else if (st.rLevel === 'R2') targetMentor = findMentorByName('張昱');
      else if (st.rLevel === 'R3') targetMentor = findMentorByName('吳妍萱');
      else if (st.rLevel === 'R4') targetMentor = findMentorByName('李宥霆');

      onUpdateMentor(st.id, targetMentor.name, targetMentor.title);
    });
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
      R4: selectedScheduleStudent.rLevel === 'R4' ? [...selectedScheduleStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training']
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
      R4: selectedScheduleStudent.rLevel === 'R4' ? [...selectedScheduleStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training']
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
      trainingStartDate: newStudentStartDate || `${1911 + newStudentYear}-08-01`,
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setResidentManagementMsg({ type: 'success', text: '正在處理與壓縮照片...' });
        const compressedDataUrl = await compressImageToDataUrl(file, 240, 240, 0.85);
        setCustomAvatarBase64(compressedDataUrl);
        setResidentManagementMsg({ type: 'success', text: '照片載入並預覽成功！' });
        setTimeout(() => setResidentManagementMsg(null), 3000);
      } catch (err: any) {
        setResidentManagementMsg({ type: 'error', text: err?.message || '照片上傳失敗，請選擇有效的圖片檔案！' });
      }
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

  const pendingPromotions = students.filter(s => s.promotionStatus?.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Teacher workspace tabs */}
      <div className="border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm flex items-center justify-between gap-4 flex-wrap">
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'pending'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>待審核申報 ({pendingItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('promotion')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'promotion'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>年度晉級升等審查</span>
            {pendingPromotions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.25 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                {pendingPromotions.length} 待審
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
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
            onClick={() => setActiveSubTab('mentors')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubTab === 'mentors'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>臨床指導導師 ({(mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS).length})</span>
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-extrabold text-slate-800">
              住院醫師線上申報審核主控台 (Approvals Console)
            </h3>
            {pendingPromotions.length > 0 && (
              <button
                onClick={() => setActiveSubTab('promotion')}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                <span>有 {pendingPromotions.length} 筆年度晉升申請待審核 ➔</span>
              </button>
            )}
          </div>

          {/* Alert banner if there are pending promotions */}
          {pendingPromotions.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <div>
                  <h4 className="text-xs font-extrabold text-amber-900">
                    有 {pendingPromotions.length} 位住院醫師已送交「年度晉級升等審查申請」！
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    {pendingPromotions.map(s => `${s.name} (${s.rLevel} ➔ ${s.promotionStatus?.requestedRLevel})`).join('、')}，請導師完成 12 個月輪訓核驗與簽核。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab('promotion')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs cursor-pointer shrink-0 flex items-center space-x-1"
              >
                <span>前往簽核升等</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

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

      {/* Sub Tab: Annual Resident Promotion Approval Console */}
      {activeSubTab === 'promotion' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-indigo-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black">
                  <GraduationCap className="h-4 w-4 text-amber-300" />
                  <span>急診專科住院醫師訓練委員會 ‧ 年度晉級審查主控台</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  住院醫師滿 1 年升等與導師簽核中心
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  依據台灣急診醫學會住院醫師訓練規範：住院醫師由 <strong>R1 升 R2、R2 升 R3、R3 升 R4</strong>，必須<strong>完成滿一年訓練（當年度全 12 個月臨床輪訓及全數作業評量考核通過）</strong>，且須<strong>由主治醫師/指導導師審核核准</strong>後，方得完成晉升並核發 <span className="text-amber-300 font-bold">+300 XP 升級獎勵</span>。
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <div className="text-center px-2">
                  <span className="block text-2xl font-black text-amber-300">{pendingPromotions.length}</span>
                  <span className="text-[10px] text-slate-300 font-bold">待簽核申請</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-2xl font-black text-teal-300">
                    {students.filter(s => checkPromotionEligibility(s).isEligible).length}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">已滿一年資格</span>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center px-2">
                  <span className="block text-2xl font-black text-slate-200">{students.length}</span>
                  <span className="text-[10px] text-slate-300 font-bold">總住院醫師</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Pending Promotion Applications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hourglass className="h-5 w-5 text-amber-600" />
                <h4 className="text-sm font-extrabold text-slate-900">
                  待審核晉級升等申請 ({pendingPromotions.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                由住院醫師主動送交之滿一年審查申請，需由導師核駁
              </span>
            </div>

            {pendingPromotions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2 shadow-xs">
                <ShieldCheck className="h-10 w-10 text-teal-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">目前沒有待審核的年度晉級申請</p>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  當住院醫師在其個人儀表板提出「申請年度晉級升等」後，審查單將立即呈現在此供導師複核簽署。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPromotions.map((student) => {
                  const eligibility = checkPromotionEligibility(student);
                  const targetR = student.promotionStatus?.requestedRLevel || eligibility.nextRLevel || 'R2';
                  const feedbackText = promotionFeedbacks[student.id] || '';

                  return (
                    <div 
                      key={student.id}
                      className="bg-white rounded-2xl border-2 border-amber-300 shadow-md overflow-hidden animate-in fade-in"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-3.5 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-11 w-11 rounded-xl bg-white border border-amber-300 flex items-center justify-center text-2xl shadow-xs overflow-hidden shrink-0">
                            {student.avatar && (student.avatar.startsWith('data:') || student.avatar.startsWith('http')) ? (
                              <img src={student.avatar} alt={student.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                            ) : (
                              <span>{student.avatar || '👨‍⚕️'}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-base font-black text-slate-900">{student.name}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-mono font-bold">
                                目前 {student.rLevel}
                              </span>
                              <span className="text-slate-400 font-bold">➔</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black ring-1 ring-amber-600/30">
                                申請晉升 {targetR}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                              <span>入學學年度：民國 {student.admissionYear || 115} 年度</span>
                              <span>‧</span>
                              <span>申請送件：{student.promotionStatus?.appliedAt || '剛剛'}</span>
                              <span>‧</span>
                              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                👨‍⚕️ 專屬指導導師：{student.mentorName ? `${student.mentorName} (${student.mentorTitle || '急診指導醫師'})` : '尚未指派'}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {eligibility.isEligible ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              滿 1 年訓練達標
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-300">
                              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                              未達滿 1 年標準
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        {/* Student Self-declaration note */}
                        {student.promotionStatus?.notes && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                            <span className="font-bold text-slate-900 block mb-1">📝 住院醫師自述與晉級報告：</span>
                            <p className="italic text-slate-600">“{student.promotionStatus.notes}”</p>
                          </div>
                        )}

                        {/* Dual Validation Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* 1. 12-Month Rotation Audit */}
                          <div className={`p-3.5 rounded-xl border ${
                            eligibility.approvedRotationsCount >= 12
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-rose-50/50 border-rose-200'
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-black text-slate-900">
                                1. 全年度臨床輪訓審查 (需滿 12 個月)
                              </span>
                              <span className={`text-xs font-mono font-bold ${
                                eligibility.approvedRotationsCount >= 12 ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {eligibility.approvedRotationsCount} / 12 個月
                              </span>
                            </div>
                            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200/80 mb-2">
                              <div 
                                className={`h-full transition-all ${
                                  eligibility.approvedRotationsCount >= 12 ? 'bg-emerald-500' : 'bg-rose-400'
                                }`}
                                style={{ width: `${Math.min(100, (eligibility.approvedRotationsCount / 12) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-600">
                              {eligibility.approvedRotationsCount >= 12 ? (
                                <span className="text-emerald-800 font-bold flex items-center">
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  12 個月科別臨床輪訓全數審核合格（已滿 1 年訓練）
                                </span>
                              ) : (
                                <span className="text-rose-700 font-semibold flex items-center">
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  尚缺 {12 - eligibility.approvedRotationsCount} 個月輪訓未完成或未核准！依法規不得晉升
                                </span>
                              )}
                            </p>
                          </div>

                          {/* 2. Homework / Evaluations Audit */}
                          <div className={`p-3.5 rounded-xl border ${
                            eligibility.approvedHomeworksCount >= eligibility.totalRequiredHomeworks
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-amber-50/50 border-amber-200'
                          }`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-black text-slate-900">
                                2. 全年度常規作業與臨床評量
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-700">
                                {eligibility.approvedHomeworksCount} / {eligibility.totalRequiredHomeworks} 項通過
                              </span>
                            </div>
                            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200/80 mb-2">
                              <div 
                                className="h-full bg-teal-500 transition-all"
                                style={{ width: `${Math.min(100, (eligibility.approvedHomeworksCount / Math.max(1, eligibility.totalRequiredHomeworks)) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-600">
                              {eligibility.approvedHomeworksCount >= eligibility.totalRequiredHomeworks ? (
                                <span className="text-emerald-800 font-bold flex items-center">
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  全年度各月份自主學習與核心作業均已核可
                                </span>
                              ) : (
                                <span className="text-amber-800 font-semibold flex items-center">
                                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                  尚有 {eligibility.totalRequiredHomeworks - eligibility.approvedHomeworksCount} 項月份作業待審或未補件
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Mentor Feedback & Actions */}
                        <div className="pt-2 border-t border-slate-100 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              導師審核評語與晉升備忘（將存入學員歷史檔案）：
                            </label>
                            <input
                              type="text"
                              value={feedbackText}
                              onChange={(e) => setPromotionFeedbacks(prev => ({ ...prev, [student.id]: e.target.value }))}
                              placeholder="例：全年度急診臨床與科外輪訓表現優異，核心能力符合學會要求，准予升等！"
                              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                            <div className="text-xs text-slate-500">
                              {!eligibility.isEligible && (
                                <span className="text-rose-600 font-bold flex items-center">
                                  <Lock className="h-3.5 w-3.5 mr-1" />
                                  未滿 1 年訓練前，系統依學會規範鎖定晉升按鈕
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Cancel / Withdraw Promotion Application Button */}
                              {onCancelPromotion && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`確定要取消 / 撤回 ${student.name} 醫師的晉升審查申請嗎？`)) {
                                      onCancelPromotion(student.id);
                                    }
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                                  title="取消此審查案件，回復為未送審狀態"
                                >
                                  <RotateCcw className="h-4 w-4 text-slate-500" />
                                  <span>撤回 / 取消送審</span>
                                </button>
                              )}

                              {/* Reject Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (onApprovePromotion) {
                                    onApprovePromotion(student.id, false, feedbackText || '訓練時數或評量未滿一年，請補正後重新申請。');
                                  }
                                }}
                                className="px-3.5 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>退回申請 (要求補訓)</span>
                              </button>

                              {/* Approve Button */}
                              <button
                                type="button"
                                disabled={!eligibility.isEligible}
                                onClick={() => {
                                  if (eligibility.isEligible && onApprovePromotion) {
                                    onApprovePromotion(student.id, true, feedbackText || '經年度導師會議審查，滿 1 年訓練成績合格，准予晉升！');
                                  }
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer ${
                                  eligibility.isEligible
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <GraduationCap className="h-4 w-4" />
                                <span>核准晉升為 {targetR} (+300 XP)</span>
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Full Resident Promotion Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  全體急診住院醫師年度訓練與晉升進度總覽表
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  即時檢視所有學員滿 1 年臨床輪訓（12個月）核准情形、年度作業完成度與晉升資格
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-extrabold">
                    <th className="py-2.5 px-3">住院醫師</th>
                    <th className="py-2.5 px-3 text-center">當前年級</th>
                    <th className="py-2.5 px-3 text-center">入學年度</th>
                    <th className="py-2.5 px-3">12個月臨床輪訓</th>
                    <th className="py-2.5 px-3 text-center">常規評量</th>
                    <th className="py-2.5 px-3 text-center">滿1年訓練資格</th>
                    <th className="py-2.5 px-3 text-center">導師審查狀態</th>
                    <th className="py-2.5 px-3 text-right">導師操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const elig = checkPromotionEligibility(st);
                    const isMax = st.rLevel === 'R4';
                    const isPending = st.promotionStatus?.status === 'pending';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-slate-200">
                              {st.avatar && (st.avatar.startsWith('data:') || st.avatar.startsWith('http')) ? (
                                <img src={st.avatar} alt={st.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                              ) : (
                                <span>{st.avatar || '👨‍⚕️'}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Lv.{st.level} ‧ {st.xp} XP</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                            st.rLevel === 'R1' ? 'bg-teal-100 text-teal-800' :
                            st.rLevel === 'R2' ? 'bg-sky-100 text-sky-800' :
                            st.rLevel === 'R3' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {st.rLevel}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-600">
                          {st.admissionYear || 115}
                        </td>

                        <td className="py-3 px-3">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                              <span className={elig.approvedRotationsCount >= elig.totalRotationsRequired ? 'text-emerald-700' : 'text-slate-600'}>
                                {elig.approvedRotationsCount} / {elig.totalRotationsRequired} 個月
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {Math.round((elig.approvedRotationsCount / elig.totalRotationsRequired) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${elig.approvedRotationsCount >= elig.totalRotationsRequired ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, (elig.approvedRotationsCount / elig.totalRotationsRequired) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`font-mono text-xs font-bold ${
                            elig.approvedHomeworksCount >= elig.totalRequiredHomeworks ? 'text-emerald-700' : 'text-slate-600'
                          }`}>
                            {elig.approvedHomeworksCount}/{elig.totalRequiredHomeworks}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {isMax ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                              已完訓
                            </span>
                          ) : elig.isEligible ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              滿1年達標
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                              尚缺 {elig.totalRotationsRequired - elig.approvedRotationsCount} 月
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {isMax ? (
                            <span className="text-slate-500 font-bold text-[11px]">准考專科</span>
                          ) : isPending ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] animate-pulse">
                              ⏳ 待導師簽核
                            </span>
                          ) : st.promotionStatus?.status === 'approved' ? (
                            <span className="text-emerald-700 font-bold text-[11px]">✅ 已晉升</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">未提出</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isMax ? (
                              <span className="text-[11px] text-purple-700 font-bold">最高訓練層級</span>
                            ) : isPending ? (
                              <button
                                type="button"
                                onClick={() => {
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer"
                              >
                                審核申請
                              </button>
                            ) : elig.isEligible ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onApprovePromotion) {
                                    onApprovePromotion(st.id, true, '導師全年度臨床查核通過，直接簽署升等！');
                                  }
                                }}
                                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center space-x-1"
                                title="滿一年條件已達成，導師可直接簽核晉級"
                              >
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>導師簽核晉級</span>
                              </button>
                            ) : null}

                            {/* Option to cancel/revert promotion */}
                            {onRevertPromotion && (st.rLevel !== 'R1' || (st.promotionHistory && st.promotionHistory.length > 0) || st.promotionStatus?.status === 'approved') && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`確定要取消 ${st.name} 醫師的晉升並回復至上一職級嗎？這將扣回晉升經驗值並還原職級。`)) {
                                    onRevertPromotion(st.id);
                                  }
                                }}
                                className="px-2 py-1 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer transition-colors"
                                title="取消晉升並將學員回復至上一職級"
                              >
                                取消晉升
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Promotion History Archive */}
          {students.some(s => s.promotionHistory && s.promotionHistory.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-slate-800">
                <Award className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-extrabold">急診住院醫師歷年晉升簽核存檔總帳 (Historical Archives)</h4>
              </div>

              <div className="space-y-2">
                {students.flatMap(s => (s.promotionHistory || []).map(h => ({ ...h, studentName: s.name, avatar: s.avatar }))).map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-slate-200">
                        {h.avatar && (h.avatar.startsWith('data:') || h.avatar.startsWith('http')) ? (
                          <img src={h.avatar} alt={h.studentName} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                        ) : (
                          <span>{h.avatar || '👨‍⚕️'}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-slate-900">{h.studentName}</span>
                          <span className="px-2 py-0.25 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                            {h.fromLevel} ➔ {h.toLevel}
                          </span>
                          <span className="text-slate-400 text-[11px]">民國 {h.academicYear} 年度</span>
                        </div>
                        {h.feedback && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            導師簽署評語：<span className="italic">{h.feedback}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        <span>簽核時間：{h.approvedAt}</span>
                        <span className="block text-slate-500 font-bold">簽核導師：{h.approvedBy}</span>
                      </div>
                      {onRevertPromotion && (
                        <button
                          type="button"
                          onClick={() => {
                            const studentMatch = students.find(s => s.name === h.studentName);
                            if (studentMatch && window.confirm(`確定要撤銷 ${h.studentName} 醫師【${h.fromLevel} ➔ ${h.toLevel}】的晉升簽核嗎？學員將回復至 ${h.fromLevel}。`)) {
                              onRevertPromotion(studentMatch.id);
                            }
                          }}
                          className="px-2 py-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-[11px] transition-colors cursor-pointer ml-2 shrink-0"
                          title="撤銷本次晉級核准紀錄，將該學員回復至上一職級"
                        >
                          撤銷簽核 (取消晉升)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  修改 <strong>{selectedScheduleStudent.name}</strong> 醫師於 <strong>{selectedRYearTab}</strong> 階段之輪訓科別
                  {selectedRYearTab === 'R4' && <span className="text-indigo-600 font-bold ml-1">（因8-9月起訓，R4訓練至隔年6月完訓）</span>}：
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                  {MONTH_NAMES.map((monthName, idx) => {
                    const currentFourYearSchedules = selectedScheduleStudent.fourYearSchedules || {
                      R1: selectedScheduleStudent.rLevel === 'R1' ? [...selectedScheduleStudent.schedule] : ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
                      R2: selectedScheduleStudent.rLevel === 'R2' ? [...selectedScheduleStudent.schedule] : ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
                      R3: selectedScheduleStudent.rLevel === 'R3' ? [...selectedScheduleStudent.schedule] : ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
                      R4: selectedScheduleStudent.rLevel === 'R4' ? [...selectedScheduleStudent.schedule] : ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training', 'completed-training']
                    };
                    const currentDeptId = (currentFourYearSchedules[selectedRYearTab] || Array(12).fill('adult-er'))[idx] || 'adult-er';

                    return (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                        <span className="font-extrabold text-slate-800 font-mono shrink-0 w-28">
                          {idx + 1}月份{selectedRYearTab === 'R4' && idx >= 6 ? ' (完訓)' : ''}：
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} 醫師 ({s.rLevel} - Level {s.level}, {s.xp} XP)
                    </option>
                  ))}
                </select>
              </div>

              {selectedManageStudent && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-xs overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                        {selectedManageStudent.avatar && (selectedManageStudent.avatar.startsWith('data:') || selectedManageStudent.avatar.startsWith('http')) ? (
                          <img src={selectedManageStudent.avatar} alt={selectedManageStudent.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                        ) : (
                          <span>{selectedManageStudent.avatar || '👨‍⚕️'}</span>
                        )}
                      </div>
                      <span>{selectedManageStudent.name} 醫師</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-mono">
                      {selectedManageStudent.rLevel} • {selectedManageStudent.admissionYear}年度
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-200/60 text-slate-600">
                    <div>
                      <span className="text-slate-400">起訓日期：</span>
                      <strong className="text-indigo-700 font-mono">
                        {selectedManageStudent.trainingStartDate || `${1911 + (selectedManageStudent.admissionYear || 115)}-08-01`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">臨床導師：</span>
                      <strong className="text-teal-700">
                        {selectedManageStudent.mentorName || '尚未指定'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
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
                        onChange={(e) => {
                          const y = parseInt(e.target.value);
                          setNewStudentYear(y);
                          setNewStudentStartDate(`${1911 + y}-08-01`);
                        }}
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

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 flex items-center justify-between">
                      <span>起訓日期 (Training Start Date)：</span>
                      <span className="text-[10px] text-teal-600 font-mono">例如: 2026-08-01</span>
                    </label>
                    <input
                      type="date"
                      value={newStudentStartDate}
                      onChange={(e) => setNewStudentStartDate(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-teal-500 font-mono font-bold"
                    />
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
                {/* Name, Admission Year & Training Start Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">姓名：</label>
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-bold"
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
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600 flex items-center justify-between">
                      <span>起訓日期：</span>
                      <span className="text-[10px] text-indigo-600 font-normal">例: 2026-08-01</span>
                    </label>
                    <input
                      type="date"
                      value={editTrainingStartDateInput}
                      onChange={(e) => setEditTrainingStartDateInput(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Avatar / Photo Modification Section */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 text-xs flex items-center space-x-1.5">
                      <Camera className="h-3.5 w-3.5 text-indigo-600" />
                      <span>住院醫師照片 / 個人頭像：</span>
                    </label>
                    {editAvatarInput && editAvatarInput.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => setEditAvatarInput('👨‍⚕️')}
                        className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                      >
                        移除自訂照片改用 Emoji
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <div className="relative h-14 w-14 rounded-full border-2 border-indigo-200 bg-white shadow-xs overflow-hidden flex items-center justify-center shrink-0">
                      {editAvatarInput && editAvatarInput.startsWith('data:') ? (
                        <img 
                          referrerPolicy="no-referrer" 
                          src={editAvatarInput} 
                          alt="Resident avatar" 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <span className="text-2xl">{editAvatarInput || '👨‍⚕️'}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '🩺', '🧠', '❤️', '🌟', '🏥'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setEditAvatarInput(emoji)}
                            className={`h-7 w-7 text-sm flex items-center justify-center rounded-lg border transition-all ${
                              editAvatarInput === emoji
                                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 font-bold'
                                : 'bg-white border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50/50 rounded-lg text-[11px] font-bold text-indigo-700 cursor-pointer shadow-2xs transition-colors">
                          <Upload className="h-3 w-3 text-indigo-600" />
                          <span>更換 / 上傳自訂照片</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {editAvatarInput.startsWith('data:') ? '已載入自訂照片' : '目前使用 Emoji'}
                        </span>
                      </div>
                    </div>
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
          {/* Main Card: System Time & Built-in Clock Management */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    系統時間設定 (Global Time & Built-in Clock)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    掌握全院訓練系統運行時間，支援「內建即時時鐘」自動推進與「手動自訂時間」教學演習。
                  </p>
                </div>
              </div>

              {/* Mode indicator pill */}
              <div className="self-start sm:self-auto">
                {clockMode === 'auto' ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>內建即時時鐘 (自動推進)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>手動自訂時間 (教學模擬)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Live Clock Tech Console Box */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 sm:p-6 text-white shadow-xl border border-slate-800">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Digital Clock Display */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-[11px] font-mono font-semibold tracking-wider text-indigo-300 uppercase">
                    <span className={`inline-block h-2 w-2 rounded-full ${clockMode === 'auto' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    <span>CGH ER SYSTEM CLOCK • 內建核心時鐘</span>
                  </div>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-wider">
                      {currentTimeText || new Date().toTimeString().split(' ')[0]}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {(() => {
                        const now = new Date();
                        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                        return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Status & Active Month Display */}
                <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">目前訓練進行月份</span>
                    <span className="text-lg font-black text-white flex items-center space-x-1.5">
                      <span>{MONTH_NAMES[systemOngoingMonth - 1]}</span>
                      <span className="text-xs font-mono bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
                        M{systemOngoingMonth}
                      </span>
                    </span>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden sm:block" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">系統目前採用日期</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {systemDateText}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700">時鐘運作模式切換 (Clock Mode Selection)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Auto Mode Card */}
                <div 
                  onClick={() => onToggleClockMode?.('auto')}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    clockMode === 'auto'
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-lg ${clockMode === 'auto' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                          <span>內建即時時鐘 (自動模式)</span>
                          {clockMode === 'auto' && (
                            <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.25 rounded">
                              使用中
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          隨真實世界時間每秒更新，自動判定進行月份
                        </span>
                      </div>
                    </div>
                    {clockMode === 'auto' && (
                      <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    系統自動根據當前真實日曆日期推移，自動對齊訓練進行月份（例如目前是 9 月即鎖定 M9），學生關卡進度與作業隨真實時間自動解鎖推進，適合常態正式訓練運作。
                  </p>
                </div>

                {/* Manual Override Mode Card */}
                <div 
                  onClick={() => onToggleClockMode?.('manual')}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    clockMode === 'manual'
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-lg ${clockMode === 'manual' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                        <Sliders className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 flex items-center space-x-1.5">
                          <span>手動設定時間 (自訂模擬)</span>
                          {clockMode === 'manual' && (
                            <span className="bg-amber-600 text-white text-[9px] font-extrabold px-1.5 py-0.25 rounded">
                              使用中
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          自訂特定日期與進行月份，保留手動調整彈性
                        </span>
                      </div>
                    </div>
                    {clockMode === 'manual' && (
                      <Check className="h-5 w-5 text-amber-600 shrink-0" />
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    <strong>保留手動自訂功能：</strong>教師端可任意指定特定日期與進行中的輪訓月份 (M1 ~ M12)，方便進行教學演練、提前驗收下個月關卡、或進行補申報測試。
                  </p>
                </div>

              </div>
            </div>

            {/* Manual Controls & Quick Tools */}
            <div className={`rounded-xl border p-5 transition-all ${
              clockMode === 'manual' 
                ? 'bg-amber-50/30 border-amber-200' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-4 w-4 text-slate-700" />
                  <h4 className="text-xs font-extrabold text-slate-800">
                    時間設定控制項 (Time Controls)
                  </h4>
                  {clockMode === 'auto' && (
                    <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded font-bold">
                      （目前處於自動模式，您亦可手動調整或隨時套用）
                    </span>
                  )}
                </div>

                {/* Quick Sync Button */}
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const liveM = now.getMonth() + 1;
                    const liveD = `${now.getFullYear()}-${String(liveM).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    onUpdateSystemTime(liveM, liveD, 'manual');
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="將手動設定直接同步為此刻真實世界時間"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>一鍵同步當前真實時鐘</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Month Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    目前進行訓練月份 (Ongoing Month)
                  </label>
                  <select
                    value={systemOngoingMonth}
                    onChange={(e) => onUpdateSystemTime(parseInt(e.target.value, 10), systemDateText, 'manual')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name} (第 {idx + 1} 個月 - M{idx + 1})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    目前系統顯示日期 (System Date)
                  </label>
                  <input
                    type="date"
                    value={systemDateText}
                    onChange={(e) => onUpdateSystemTime(systemOngoingMonth, e.target.value, 'manual')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Adjustment Shortcuts */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1">快捷切換月份：</span>
                
                <button
                  type="button"
                  onClick={() => {
                    const prevM = systemOngoingMonth === 1 ? 12 : systemOngoingMonth - 1;
                    onUpdateSystemTime(prevM, systemDateText, 'manual');
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  ⏪ 上一個月 (M{systemOngoingMonth === 1 ? 12 : systemOngoingMonth - 1})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextM = systemOngoingMonth === 12 ? 1 : systemOngoingMonth + 1;
                    onUpdateSystemTime(nextM, systemDateText, 'manual');
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  ⏩ 下一個月 (M{systemOngoingMonth === 12 ? 1 : systemOngoingMonth + 1})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const parts = systemDateText.split('-');
                    if (parts.length === 3) {
                      const firstDay = `${parts[0]}-${parts[1]}-01`;
                      onUpdateSystemTime(systemOngoingMonth, firstDay, 'manual');
                    }
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  📅 設為當月 1 號
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-medium flex items-start space-x-3">
              <span className="shrink-0 text-lg">💡</span>
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-extrabold text-indigo-900">
                  全院強制管控原則 (Hospital-wide Synchronization Policy)
                </p>
                <p className="text-slate-600">
                  無論使用「內建即時時鐘」或「手動設定時間」，系統時間與進行月份皆由後台統一管理。所有住院醫師的個人儀表板、大富翁輪訓地圖、各科作業申報皆會同步對齊此時間設定。學生端僅能檢視，無法任意私自跳月，以維持全體住院醫師考核的一致性與公信力。
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sub Tab: Clinical Mentors Faculty (獨立專屬分頁) */}
      {activeSubTab === 'mentors' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Mentors Overview Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">指導導師名額</span>
                <span className="text-lg font-black text-slate-800">
                  {(mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS).length} <span className="text-xs font-normal text-slate-500">位</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">在訓住院醫師</span>
                <span className="text-lg font-black text-slate-800">
                  {students.length} <span className="text-xs font-normal text-slate-500">位 (R1-R4)</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">已指派指導學員</span>
                <span className="text-lg font-black text-emerald-700">
                  {students.filter(s => !!s.mentorName).length} <span className="text-xs font-normal text-slate-500">位</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">導師配對覆蓋率</span>
                <span className="text-lg font-black text-amber-700">
                  {Math.round((students.filter(s => !!s.mentorName).length / (students.length || 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Main Card: Clinical Mentors & Resident Faculty Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-teal-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <span>急診專科臨床指導導師設定</span>
                    <span className="text-xs font-mono font-normal text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Clinical Mentors Faculty
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    設定與管理急診住院醫師專案指導導師名冊（官方指定：鍾睿元、張昱、吳妍萱、李宥霆），並進行學員專屬導師一對一指派與切換。
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartAddMentor}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>新增指導導師</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaultMentors}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  title="重設名冊為急診專科官方指定的 4 位導師"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>恢復指定 4 位導師</span>
                </button>
              </div>
            </div>

            {/* Inline Add / Edit Form */}
            {isEditingMentor && (
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-4 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-teal-900 text-xs flex items-center space-x-1.5">
                    <Edit3 className="h-4 w-4" />
                    <span>{editingMentorId ? '編輯指導導師資訊' : '新增急診指導導師'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setIsEditingMentor(false); setEditingMentorId(null); }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    取消
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">導師姓名 *</label>
                    <input
                      type="text"
                      value={mentorNameInput}
                      onChange={(e) => setMentorNameInput(e.target.value)}
                      placeholder="例：鍾睿元"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">主治醫師職稱 *</label>
                    <input
                      type="text"
                      value={mentorTitleInput}
                      onChange={(e) => setMentorTitleInput(e.target.value)}
                      placeholder="例：急診專任主治醫師 / 教學指導導師"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">專長領域</label>
                    <input
                      type="text"
                      value={mentorSpecialtyInput}
                      onChange={(e) => setMentorSpecialtyInput(e.target.value)}
                      placeholder="例：急診醫學、臨床重症加護"
                      className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsEditingMentor(false); setEditingMentorId(null); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMentorForm}
                    disabled={!mentorNameInput.trim()}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    儲存導師設定
                  </button>
                </div>
              </div>
            )}

            {/* Mentors Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-slate-700">
                  目前在籍指導導師名冊 (共 {(mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS).length} 位)：
                </span>
                <span className="text-[11px] text-slate-500">
                  學會新制建議：每位住院醫師需至少配置一名臨床教學導師
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS).map((m, idx) => {
                  const assignedStudents = students.filter(s => s.mentorName === m.name || s.mentorName?.includes(m.name));
                  const initials = m.name.slice(0, 1);
                  const colorThemes = [
                    'bg-teal-50 border-teal-200 text-teal-700',
                    'bg-sky-50 border-sky-200 text-sky-700',
                    'bg-indigo-50 border-indigo-200 text-indigo-700',
                    'bg-emerald-50 border-emerald-200 text-emerald-700',
                  ];
                  const colorTheme = colorThemes[idx % colorThemes.length];

                  return (
                    <div
                      key={m.id || m.name}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-extrabold text-sm border ${colorTheme}`}>
                              {initials}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{m.name} 醫師</h4>
                              <span className="text-[10px] text-slate-500 block leading-tight">{m.title}</span>
                            </div>
                          </div>
                        </div>

                        {m.specialty && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            🩺 專長：<span className="font-medium">{m.specialty}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-600">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-bold">指導學員：</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[10px]">
                              {assignedStudents.length} 名
                            </span>
                          </div>
                          {assignedStudents.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {assignedStudents.map(st => (
                                <span key={st.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold">
                                  <div className="h-4 w-4 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden shrink-0 border border-teal-200/60">
                                    {st.avatar && (st.avatar.startsWith('data:') || st.avatar.startsWith('http')) ? (
                                      <img src={st.avatar} alt={st.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-[9px]">{st.avatar || '👨‍⚕️'}</span>
                                    )}
                                  </div>
                                  <span>{st.name} ({st.rLevel})</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic block mt-1">目前尚無指派學員</span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleStartEditMentor(m)}
                          className="text-slate-600 hover:text-teal-700 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>編輯</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMentor(m.id || m.name)}
                          className="text-slate-400 hover:text-rose-600 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>移除</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resident Mentor Assignment Table */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <span>住院醫師專屬導師指派與配對清單</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    可為每位住院醫師指定臨床指導導師。亦可使用右側按鈕一鍵平均指派。
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoAssignMentors}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  title="將四位導師依年級 R1(鍾睿元)、R2(張昱)、R3(吳妍萱)、R4(李宥霆) 依序指派"
                >
                  <Zap className="h-3.5 w-3.5 text-teal-600" />
                  <span>一鍵依年級指派 4 位指定導師</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">住院醫師</th>
                      <th className="py-2.5 px-3">職級 / 入學</th>
                      <th className="py-2.5 px-3">起訓日期</th>
                      <th className="py-2.5 px-3">目前指導導師</th>
                      <th className="py-2.5 px-3 text-right">指派 / 變更專屬導師</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(st => {
                      const currentMentorName = st.mentorName || '';
                      const activeMentors = mentors && mentors.length > 0 ? mentors : DEFAULT_MENTORS;

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center space-x-2.5">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-base overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                                {st.avatar && (st.avatar.startsWith('data:') || st.avatar.startsWith('http')) ? (
                                  <img src={st.avatar} alt={st.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{st.avatar || '👨‍⚕️'}</span>
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-tight">{st.name} 醫師</span>
                                <span className="text-[10px] text-slate-400 font-mono">({st.id})</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[10px] mr-1">
                              {st.rLevel}
                            </span>
                            <span className="text-slate-500 text-[11px]">{st.admissionYear} 年班</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              {st.trainingStartDate || `${1911 + st.admissionYear}-08-01`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {currentMentorName ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-[11px]">
                                <UserCheck className="h-3 w-3 text-teal-600" />
                                <span>{currentMentorName}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">尚未指派</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <select
                              value={currentMentorName}
                              onChange={(e) => {
                                const selectedName = e.target.value;
                                const match = activeMentors.find(m => m.name === selectedName);
                                if (onUpdateMentor) {
                                  onUpdateMentor(
                                    st.id, 
                                    selectedName, 
                                    match?.title || '急診專任主治醫師 / 教學指導導師'
                                  );
                                }
                              }}
                              className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                            >
                              <option value="">-- 請選擇指導導師 --</option>
                              {activeMentors.map(m => (
                                <option key={m.name} value={m.name}>
                                  {m.name} 醫師 ({m.title})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
