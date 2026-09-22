import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  FileSpreadsheet, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  AlertCircle,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Info,
  Save,
  Edit3,
  X,
  Calendar,
  User,
  FileEdit,
  History,
  Sparkles
} from 'lucide-react';
import { Student } from '../types';
import { 
  HANDBOOK_META, 
  ROTATION_SYLLABUS_OVERVIEW, 
  HANDBOOK_DEPARTMENT_SECTIONS, 
  PROCEDURE_AUTHORIZATIONS, 
  MILESTONES_LIST,
  CLINICAL_WORK_RULES,
  HandbookProgress,
  SkillLogEntry,
  CurriculumCaseRecord,
  CurriculumItemProgress
} from '../data/handbookData';
import { exportHandbookToExcel } from '../utils/handbookExcelExporter';

interface HandbookViewProps {
  student: Student;
  isTeacher?: boolean;
  onUpdateHandbookProgress: (updatedProgress: HandbookProgress) => void;
}

type HandbookTab = 'curriculum' | 'authorizations' | 'skillLogs' | 'milestones' | 'rules' | 'syllabus';

interface ActiveCurriculumModalItem {
  id: string;
  name: string;
  number: number | string;
  sectionTitle: string;
  yearLevel: string;
}

export const HandbookView: React.FC<HandbookViewProps> = ({
  student,
  isTeacher = false,
  onUpdateHandbookProgress
}) => {
  const [activeTab, setActiveTab] = useState<HandbookTab>('curriculum');
  const [selectedYearFilter, setSelectedYearFilter] = useState<'All' | 'R1' | 'R2' | 'R3' | 'R4'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'er-r1': true,
    'peds-r1': false
  });

  // Save Feedback Toast
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modal State for Case Recording and Self-Study Details
  const [activeModalItem, setActiveModalItem] = useState<ActiveCurriculumModalItem | null>(null);
  const [modalTab, setModalTab] = useState<'cases' | 'selfStudy'>('cases');

  // Case Form States
  const [caseDate, setCaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [caseChartNo, setCaseChartNo] = useState<string>('');
  const [casePatientInfo, setCasePatientInfo] = useState<string>('');
  const [caseNotes, setCaseNotes] = useState<string>('');
  const [caseSupervisor, setCaseSupervisor] = useState<string>('');
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  // Self-Study Modal States
  const [selfStudiedState, setSelfStudiedState] = useState<boolean>(false);
  const [selfStudyDateState, setSelfStudyDateState] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selfStudyNotesState, setSelfStudyNotesState] = useState<string>('');

  // Quick inline inputs state: itemId -> string
  const [inlineCaseInputs, setInlineCaseInputs] = useState<Record<string, string>>({});

  // Modal / form state for adding new Skill Log
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [newSkillYear, setNewSkillYear] = useState<number>(2026);
  const [newSkillItem, setNewSkillItem] = useState('');
  const [newSkillChartNo, setNewSkillChartNo] = useState('');
  const [newSkillDate, setNewSkillDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSkillNotes, setNewSkillNotes] = useState('');

  const progress: HandbookProgress = student.handbookProgress || {
    clinicalCurriculum: {},
    mentorSignatures: {},
    milestones: {},
    skillLogs: []
  };

  const triggerToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => {
      setSaveToast((current) => (current === message ? null : current));
    }, 2800);
  };

  const handleExportExcel = () => {
    setExporting(true);
    try {
      exportHandbookToExcel(student, progress);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  // Toggle Section Collapse
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Case & Self-Study Modal
  const openCurriculumModal = (
    item: { id: string; name: string; number: number | string },
    section: { title: string; yearLevel: string },
    defaultTab: 'cases' | 'selfStudy' = 'cases'
  ) => {
    setActiveModalItem({
      id: item.id,
      name: item.name,
      number: item.number,
      sectionTitle: section.title,
      yearLevel: section.yearLevel
    });
    setModalTab(defaultTab);

    // Reset case form
    setCaseDate(new Date().toISOString().split('T')[0]);
    setCaseChartNo('');
    setCasePatientInfo('');
    setCaseNotes('');
    setCaseSupervisor(student.mentorName || '');
    setEditingCaseId(null);

    // Populate self study state
    const cur = progress.clinicalCurriculum?.[item.id];
    setSelfStudiedState(cur?.selfStudied || false);
    setSelfStudyDateState(cur?.selfStudyDate || new Date().toISOString().split('T')[0]);
    setSelfStudyNotesState(cur?.selfStudyNotes || '');
  };

  // 1. Curriculum: Toggle Self-Study
  const handleToggleCurriculumSelfStudy = (itemId: string, itemName?: string) => {
    const cur = progress.clinicalCurriculum?.[itemId] || { selfStudied: false };
    const nextStudied = !cur.selfStudied;
    const studyDate = nextStudied ? (cur.selfStudyDate || new Date().toISOString().split('T')[0]) : undefined;
    const nextProgress: HandbookProgress = {
      ...progress,
      clinicalCurriculum: {
        ...(progress.clinicalCurriculum || {}),
        [itemId]: {
          ...cur,
          selfStudied: nextStudied,
          selfStudyDate: studyDate
        }
      }
    };
    onUpdateHandbookProgress(nextProgress);
    triggerToast(nextStudied ? `✅ 已存檔：${itemName || '項目'} 標記為完成自學！` : `ℹ️ 已取消：${itemName || '項目'} 自學標記`);
  };

  // Save Self-Study Details in Modal
  const handleSaveSelfStudy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeModalItem) return;

    const cur = progress.clinicalCurriculum?.[activeModalItem.id] || { selfStudied: false };
    const nextProgress: HandbookProgress = {
      ...progress,
      clinicalCurriculum: {
        ...(progress.clinicalCurriculum || {}),
        [activeModalItem.id]: {
          ...cur,
          selfStudied: selfStudiedState,
          selfStudyDate: selfStudiedState ? selfStudyDateState : undefined,
          selfStudyNotes: selfStudyNotesState.trim()
        }
      }
    };
    onUpdateHandbookProgress(nextProgress);
    triggerToast(`💾 已成功存檔「${activeModalItem.name}」自學研讀紀錄！`);
  };

  // Save or Update a Case Record (支援多次登記與存檔)
  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem) return;

    if (!caseChartNo.trim() && !caseNotes.trim()) {
      alert('請填寫病歷號碼或案例學習心得處置重點！');
      return;
    }

    const curProg = progress.clinicalCurriculum?.[activeModalItem.id] || { selfStudied: false };
    const existingCases = curProg.cases || [];

    let updatedCases: CurriculumCaseRecord[];
    if (editingCaseId) {
      updatedCases = existingCases.map(c => {
        if (c.id === editingCaseId) {
          return {
            ...c,
            date: caseDate || new Date().toISOString().split('T')[0],
            chartNo: caseChartNo.trim(),
            patientInfo: casePatientInfo.trim(),
            notes: caseNotes.trim(),
            supervisor: caseSupervisor.trim()
          };
        }
        return c;
      });
    } else {
      const newCase: CurriculumCaseRecord = {
        id: `case-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        date: caseDate || new Date().toISOString().split('T')[0],
        chartNo: caseChartNo.trim(),
        patientInfo: casePatientInfo.trim(),
        notes: caseNotes.trim(),
        supervisor: caseSupervisor.trim(),
        createdAt: new Date().toISOString()
      };
      updatedCases = [newCase, ...existingCases];
    }

    const nextProgress: HandbookProgress = {
      ...progress,
      clinicalCurriculum: {
        ...(progress.clinicalCurriculum || {}),
        [activeModalItem.id]: {
          ...curProg,
          cases: updatedCases,
          actualCase: updatedCases.length > 0 
            ? `${updatedCases[0].chartNo ? '歷號#' + updatedCases[0].chartNo + ' ' : ''}${updatedCases[0].notes}`
            : ''
        }
      }
    };

    onUpdateHandbookProgress(nextProgress);
    
    // Reset inputs
    setCaseChartNo('');
    setCasePatientInfo('');
    setCaseNotes('');
    setEditingCaseId(null);

    triggerToast(`💾 成功存檔「${activeModalItem.name}」案例！(目前共累計 ${updatedCases.length} 筆案例)`);
  };

  // Edit an existing case in modal
  const handleStartEditCase = (c: CurriculumCaseRecord) => {
    setEditingCaseId(c.id);
    setCaseDate(c.date || new Date().toISOString().split('T')[0]);
    setCaseChartNo(c.chartNo || '');
    setCasePatientInfo(c.patientInfo || '');
    setCaseNotes(c.notes || '');
    setCaseSupervisor(c.supervisor || student.mentorName || '');
  };

  // Cancel editing
  const handleCancelEditCase = () => {
    setEditingCaseId(null);
    setCaseDate(new Date().toISOString().split('T')[0]);
    setCaseChartNo('');
    setCasePatientInfo('');
    setCaseNotes('');
    setCaseSupervisor(student.mentorName || '');
  };

  // Delete a case from item
  const handleDeleteCase = (itemId: string, caseId: string, itemName: string) => {
    if (!window.confirm('確定要刪除此筆案例紀錄嗎？')) return;
    const curProg = progress.clinicalCurriculum?.[itemId];
    if (!curProg) return;

    const updatedCases = (curProg.cases || []).filter(c => c.id !== caseId);
    const nextProgress: HandbookProgress = {
      ...progress,
      clinicalCurriculum: {
        ...(progress.clinicalCurriculum || {}),
        [itemId]: {
          ...curProg,
          cases: updatedCases,
          actualCase: updatedCases.length > 0 
            ? `${updatedCases[0].chartNo ? '歷號#' + updatedCases[0].chartNo + ' ' : ''}${updatedCases[0].notes}`
            : ''
        }
      }
    };
    onUpdateHandbookProgress(nextProgress);
    triggerToast(`🗑️ 已刪除「${itemName}」的該筆案例 (剩餘 ${updatedCases.length} 筆)`);
  };

  // Quick inline save for case on table row
  const handleQuickSaveCase = (itemId: string, itemName: string) => {
    const text = (inlineCaseInputs[itemId] || '').trim();
    if (!text) return;

    const curProg = progress.clinicalCurriculum?.[itemId] || { selfStudied: false };
    const existingCases = curProg.cases || [];

    // Check if starts with chart number (digits)
    const match = text.match(/^(\d{5,10})\s*(.*)$/);
    const chartNo = match ? match[1] : '';
    const notes = match ? match[2] || text : text;

    const newCase: CurriculumCaseRecord = {
      id: `case-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      chartNo: chartNo,
      notes: notes,
      supervisor: student.mentorName || '',
      createdAt: new Date().toISOString()
    };

    const updatedCases = [newCase, ...existingCases];

    const nextProgress: HandbookProgress = {
      ...progress,
      clinicalCurriculum: {
        ...(progress.clinicalCurriculum || {}),
        [itemId]: {
          ...curProg,
          cases: updatedCases,
          actualCase: `${chartNo ? '歷號#' + chartNo + ' ' : ''}${notes}`
        }
      }
    };

    onUpdateHandbookProgress(nextProgress);
    setInlineCaseInputs(prev => ({ ...prev, [itemId]: '' }));
    triggerToast(`💾 成功快速存檔「${itemName}」第 ${updatedCases.length} 筆案例！`);
  };

  const handleSignSection = (sectionId: string) => {
    const curSig = progress.mentorSignatures?.[sectionId];
    const nextSigned = !curSig?.signed;
    const nextProgress: HandbookProgress = {
      ...progress,
      mentorSignatures: {
        ...(progress.mentorSignatures || {}),
        [sectionId]: {
          signed: nextSigned,
          signedBy: nextSigned ? (student.mentorName || '急診指導教師') : undefined,
          signedAt: nextSigned ? new Date().toISOString().split('T')[0] : undefined,
          caseReportNotes: curSig?.caseReportNotes || ''
        }
      }
    };
    onUpdateHandbookProgress(nextProgress);
  };

  const handleUpdateSectionReportNotes = (sectionId: string, notes: string) => {
    const curSig = progress.mentorSignatures?.[sectionId] || { signed: false };
    const nextProgress: HandbookProgress = {
      ...progress,
      mentorSignatures: {
        ...(progress.mentorSignatures || {}),
        [sectionId]: {
          ...curSig,
          caseReportNotes: notes
        }
      }
    };
    onUpdateHandbookProgress(nextProgress);
  };

  // 2. Skill Log Operations
  const handleAddSkillLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillItem.trim() || !newSkillChartNo.trim()) return;

    const newEntry: SkillLogEntry = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      year: Number(newSkillYear),
      item: newSkillItem.trim(),
      chartNo: newSkillChartNo.trim(),
      date: newSkillDate,
      notes: newSkillNotes.trim()
    };

    const nextLogs = [newEntry, ...(progress.skillLogs || [])];
    const nextProgress: HandbookProgress = {
      ...progress,
      skillLogs: nextLogs
    };
    onUpdateHandbookProgress(nextProgress);

    // Reset Form
    setNewSkillItem('');
    setNewSkillChartNo('');
    setNewSkillNotes('');
    setIsAddSkillOpen(false);
  };

  const handleDeleteSkillLog = (id: string) => {
    const nextLogs = (progress.skillLogs || []).filter(l => l.id !== id);
    const nextProgress: HandbookProgress = {
      ...progress,
      skillLogs: nextLogs
    };
    onUpdateHandbookProgress(nextProgress);
  };

  // 3. Milestone Rating Updates
  const handleUpdateMilestone = (milestoneId: string, periodKey: string, level: number) => {
    const curRecord = progress.milestones?.[milestoneId] || {};
    const nextMilestones = {
      ...(progress.milestones || {}),
      [milestoneId]: {
        ...curRecord,
        [periodKey]: level
      }
    };
    const nextProgress: HandbookProgress = {
      ...progress,
      milestones: nextMilestones
    };
    onUpdateHandbookProgress(nextProgress);
  };

  // Filtered Sections
  const filteredSections = useMemo(() => {
    return HANDBOOK_DEPARTMENT_SECTIONS.filter(sec => {
      if (selectedYearFilter !== 'All' && sec.yearLevel !== selectedYearFilter) {
        return false;
      }
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      return (
        sec.title.toLowerCase().includes(lower) ||
        sec.items.some(i => {
          const prog = progress.clinicalCurriculum?.[i.id];
          const matchName = i.name.toLowerCase().includes(lower);
          const matchLegacy = prog?.actualCase?.toLowerCase().includes(lower);
          const matchNotes = prog?.selfStudyNotes?.toLowerCase().includes(lower);
          const matchCases = prog?.cases?.some(c => 
            (c.chartNo && c.chartNo.toLowerCase().includes(lower)) ||
            (c.notes && c.notes.toLowerCase().includes(lower)) ||
            (c.patientInfo && c.patientInfo.toLowerCase().includes(lower)) ||
            (c.supervisor && c.supervisor.toLowerCase().includes(lower))
          );
          return matchName || matchLegacy || matchNotes || matchCases;
        })
      );
    });
  }, [selectedYearFilter, searchTerm, progress.clinicalCurriculum]);

  // Overall Statistics
  const totalCurriculumItems = useMemo(() => {
    return HANDBOOK_DEPARTMENT_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  }, []);

  const completedCurriculumCount = useMemo(() => {
    return Object.values(progress.clinicalCurriculum || {}).filter(c => c.selfStudied).length;
  }, [progress.clinicalCurriculum]);

  const totalRecordedCasesCount = useMemo(() => {
    return Object.values(progress.clinicalCurriculum || {}).reduce((acc, c) => {
      return acc + (c.cases?.length || (c.actualCase ? 1 : 0));
    }, 0);
  }, [progress.clinicalCurriculum]);

  const skillLogCount = progress.skillLogs?.length || 0;

  const currentLevelKey = student.rLevel.toLowerCase() as 'r1' | 'r2' | 'r3' | 'r4';
  const authorizedCount = PROCEDURE_AUTHORIZATIONS.filter(a => a[currentLevelKey]).length;

  return (
    <div id="handbook-container" className="space-y-6">
      
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                  {HANDBOOK_META.edition}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {HANDBOOK_META.committee}
                </span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{HANDBOOK_META.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              依據台灣急診醫學科專科訓練醫師核心課程編訂。收錄四年輪訓大綱、分科自學與實際案例(支援多次登錄存檔)、55項操作授權矩陣、27項里程碑考核及臨床技術日誌。
            </p>

            {/* Resident Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                學員：{student.name} 醫師 ({student.rLevel})
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs text-slate-300 bg-slate-800 border border-slate-700">
                年班：{student.admissionYear} 年班
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs text-slate-300 bg-slate-800 border border-slate-700">
                指導導師：{student.mentorName || '科內指定專科導師'} ({student.mentorTitle || '主治醫師'})
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
                起訓：{student.trainingStartDate || `${1911 + (student.admissionYear || 115)}-08-01`}
              </span>
            </div>
          </div>

          {/* Action Buttons & Statistics Overview */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 shrink-0">
            <button
              id="export-handbook-excel-btn"
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 active:scale-98 transition-all border border-emerald-400/30"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{exporting ? '正在打包 Excel...' : '一鍵匯出完整手冊 Excel (.xlsx)'}</span>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 text-center">
              <div className="px-2">
                <span className="text-[10px] text-slate-400 block">自學進度</span>
                <span className="text-xs font-bold text-teal-300">
                  {completedCurriculumCount} / {totalCurriculumItems}
                </span>
              </div>
              <div className="px-2 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 block">臨床案例</span>
                <span className="text-xs font-bold text-emerald-400">
                  {totalRecordedCasesCount} 筆
                </span>
              </div>
              <div className="px-2 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 block">操作授權</span>
                <span className="text-xs font-bold text-teal-200">
                  {authorizedCount} / {PROCEDURE_AUTHORIZATIONS.length}
                </span>
              </div>
              <div className="px-2 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 block">Skill Log</span>
                <span className="text-xs font-bold text-amber-400">
                  {skillLogCount} 筆
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-700/80 pt-4">
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'curriculum'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>分科訓練自學與案例</span>
            <span className="ml-1 rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px]">
              {completedCurriculumCount} 項 ‧ {totalRecordedCasesCount} 案例
            </span>
          </button>

          <button
            onClick={() => setActiveTab('authorizations')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'authorizations'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>55項操作處置授權表</span>
            <span className="ml-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/40 px-1.5 py-0.2 text-[10px]">
              {student.rLevel} 授權 {authorizedCount}項
            </span>
          </button>

          <button
            onClick={() => setActiveTab('skillLogs')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'skillLogs'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>技術操作日誌 (Skill Log)</span>
            <span className="ml-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-700/40 px-1.5 py-0.2 text-[10px]">
              {skillLogCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'milestones'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>急診醫學里程碑考核 (27項)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>工作須知與交班看診規程</span>
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
              activeTab === 'syllabus'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>手冊宗旨與四年輪訓規劃</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 分科訓練核心自學與案例 (Curriculum) */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          
          {/* Controls: Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋自學項目名稱、案例病歷號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-500 font-medium shrink-0">年級篩選：</span>
              {(['All', 'R1', 'R2', 'R3', 'R4'] as const).map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYearFilter(yr)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all shrink-0 ${
                    selectedYearFilter === yr
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {yr === 'All' ? '全部科別' : yr}
                </button>
              ))}
            </div>
          </div>

          {/* Department Sections List */}
          <div className="space-y-4">
            {filteredSections.map(section => {
              const isExpanded = expandedSections[section.id] ?? false;
              const sectionItemCount = section.items.length;
              const sectionCompletedCount = section.items.filter(
                i => progress.clinicalCurriculum?.[i.id]?.selfStudied
              ).length;
              const percent = Math.round((sectionCompletedCount / sectionItemCount) * 100);
              const mentorSig = progress.mentorSignatures?.[section.id];

              return (
                <div 
                  key={section.id} 
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all"
                >
                  {/* Section Header */}
                  <div 
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-b border-slate-200/80 select-none"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {section.yearLevel}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>{section.title}</span>
                          <span className="text-xs font-normal text-slate-500">
                            (受訓：{section.durationDesc})
                          </span>
                        </h3>
                        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                          <span>共 {sectionItemCount} 項核心題目</span>
                          <span>‧</span>
                          <span className="text-teal-600 font-bold">已自學完成 {sectionCompletedCount} 項 ({percent}%)</span>
                          {mentorSig?.signed && (
                            <>
                              <span>‧</span>
                              <span className="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                導師已簽核 ({mentorSig.signedBy})
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="hidden sm:block w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Section Body (Expanded) */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      
                      {/* Teacher Sign-off & Case Report Notes Box */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-700 block mb-1">
                            科別導師簽核與案例報告心得：
                          </span>
                          <input
                            type="text"
                            placeholder="可輸入本科學習重點評語、病例報告題目（例如：報告 Kawasaki 典型胸部X光與超音波表現）..."
                            value={mentorSig?.caseReportNotes || ''}
                            onChange={(e) => handleUpdateSectionReportNotes(section.id, e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div className="shrink-0 flex items-center space-x-2">
                          <button
                            onClick={() => handleSignSection(section.id)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              mentorSig?.signed
                                ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>{mentorSig?.signed ? `已由 ${mentorSig.signedBy} 簽核` : '導師簽章核可'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2.5 w-12 text-center">項次</th>
                              <th className="px-3 py-2.5 min-w-[200px]">臨床訓練課程名稱</th>
                              <th className="px-3 py-2.5 w-44 text-center">自我研讀 (存檔)</th>
                              <th className="px-3 py-2.5 min-w-[340px]">實際臨床案例 (可多次登錄 ‧ 存檔)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {section.items.map(item => {
                              const cur = progress.clinicalCurriculum?.[item.id] || { selfStudied: false };
                              const casesList = cur.cases || [];
                              const hasCases = casesList.length > 0;
                              const latestCase = hasCases ? casesList[0] : null;

                              return (
                                <tr 
                                  key={item.id}
                                  className={`hover:bg-teal-50/40 transition-colors ${
                                    cur.selfStudied ? 'bg-emerald-50/20' : ''
                                  }`}
                                >
                                  <td className="px-3 py-3 font-mono text-slate-500 font-medium text-center">
                                    {item.number}
                                  </td>
                                  
                                  <td className="px-3 py-3 font-medium text-slate-900">
                                    <div className="space-y-1">
                                      <span className="font-semibold text-slate-900 block">{item.name}</span>
                                      {cur.selfStudyNotes && (
                                        <p className="text-[11px] text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-200/60 inline-flex items-center gap-1">
                                          <FileEdit className="h-2.5 w-2.5 shrink-0" />
                                          <span className="truncate max-w-[200px]">心得備忘: {cur.selfStudyNotes}</span>
                                        </p>
                                      )}
                                    </div>
                                  </td>

                                  {/* 自我研讀欄位 */}
                                  <td className="px-3 py-3 text-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCurriculumSelfStudy(item.id, item.name)}
                                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                                          cur.selfStudied
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                        }`}
                                      >
                                        {cur.selfStudied ? (
                                          <>
                                            <Check className="h-3 w-3" />
                                            <span>已自學 ({cur.selfStudyDate || '已存檔'})</span>
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="h-3 w-3 text-slate-400" />
                                            <span>標記自學完成</span>
                                          </>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => openCurriculumModal(item, section, 'selfStudy')}
                                        className="text-[11px] text-slate-500 hover:text-teal-700 hover:underline flex items-center gap-1"
                                      >
                                        <Edit3 className="h-2.5 w-2.5" />
                                        <span>{cur.selfStudyNotes ? '查看/修改研讀心得' : '＋ 填寫研讀心得備忘'}</span>
                                      </button>
                                    </div>
                                  </td>

                                  {/* 實際案例欄位 (支援多次登錄與存檔) */}
                                  <td className="px-3 py-3">
                                    <div className="space-y-2">
                                      {/* Existing Cases Summary & Modal Trigger */}
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center space-x-1.5">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                            hasCases 
                                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                              : (cur.actualCase ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-500 border border-slate-200')
                                          }`}>
                                            {hasCases ? `已存檔 ${casesList.length} 筆案例` : (cur.actualCase ? '已存檔 1 筆案例' : '尚未登錄案例')}
                                          </span>
                                          
                                          {hasCases && latestCase && (
                                            <span className="text-[11px] text-slate-600 truncate max-w-[260px] hidden sm:inline" title={latestCase.notes}>
                                              最新: {latestCase.chartNo ? `#${latestCase.chartNo}` : ''} {latestCase.patientInfo ? `(${latestCase.patientInfo})` : ''} {latestCase.notes}
                                            </span>
                                          )}
                                          {!hasCases && cur.actualCase && (
                                            <span className="text-[11px] text-slate-600 truncate max-w-[260px] hidden sm:inline">
                                              {cur.actualCase}
                                            </span>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => openCurriculumModal(item, section, 'cases')}
                                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 transition-colors shrink-0"
                                        >
                                          <History className="h-3 w-3 text-teal-600" />
                                          <span>{hasCases ? `歷程管理 (${casesList.length}) / ＋再登記` : '＋ 完整案例登記'}</span>
                                        </button>
                                      </div>

                                      {/* Quick Inline Add & Save */}
                                      <div className="flex items-center space-x-1.5">
                                        <input
                                          type="text"
                                          placeholder="快速登記新案例 (例如: 12345678 心肌梗塞急救送ICU)..."
                                          value={inlineCaseInputs[item.id] || ''}
                                          onChange={(e) => setInlineCaseInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              handleQuickSaveCase(item.id, item.name);
                                            }
                                          }}
                                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder:text-slate-400"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleQuickSaveCase(item.id, item.name)}
                                          disabled={!inlineCaseInputs[item.id]?.trim()}
                                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs shrink-0"
                                          title="存檔此筆案例"
                                        >
                                          <Save className="h-3 w-3" />
                                          <span>存檔</span>
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 55 項操作處置授權規範表 (Authorizations) */}
      {/* ========================================================================= */}
      {activeTab === 'authorizations' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                  <span>國泰急診臨床操作授權規範表 (55 項技術處置)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  依急診醫學部醫學教育委員會規章，各級住院醫師需依年資及考核授權執行。未獲授權之處置必須在資深住院醫師或主治醫師親自督導下方可操作。
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-teal-800 font-bold">
                  當前學員級別：{student.rLevel}
                </span>
                <span className="text-xs text-teal-700">
                  (已獲授權 {authorizedCount} / {PROCEDURE_AUTHORIZATIONS.length} 項)
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 w-12 text-center">編號</th>
                    <th className="px-3 py-2.5 min-w-[180px]">處置技術名稱 (中文)</th>
                    <th className="px-3 py-2.5 min-w-[200px]">英文名稱</th>
                    <th className="px-3 py-2.5 w-24 text-center">R1</th>
                    <th className="px-3 py-2.5 w-24 text-center">R2</th>
                    <th className="px-3 py-2.5 w-24 text-center">R3</th>
                    <th className="px-3 py-2.5 w-24 text-center">R4</th>
                    <th className="px-3 py-2.5 min-w-[160px] text-center bg-slate-200/60 font-bold">
                      {student.name} ({student.rLevel}) 當前資格
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PROCEDURE_AUTHORIZATIONS.map((proc, index) => {
                    const isAuthorized = proc[currentLevelKey];

                    return (
                      <tr 
                        key={proc.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isAuthorized ? 'bg-emerald-50/10' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          {proc.nameZh}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 font-mono text-[11px]">
                          {proc.nameEn}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {proc.r1 ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">○ 授權</span>
                          ) : (
                            <span className="text-slate-400">需督導</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {proc.r2 ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">○ 授權</span>
                          ) : (
                            <span className="text-slate-400">需督導</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {proc.r3 ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">○ 授權</span>
                          ) : (
                            <span className="text-slate-400">需督導</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {proc.r4 ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">○ 授權</span>
                          ) : (
                            <span className="text-slate-400">需督導</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center bg-slate-50">
                          {isAuthorized ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-md text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>已授權獨立操作</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-amber-800 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-xs">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>需主治/資深指導</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 技術操作日誌 (Skill Log 2026-2029) */}
      {/* ========================================================================= */}
      {activeTab === 'skillLogs' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <span>急診技術操作日誌 (Skill Log 2026 ~ 2029)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  登錄您在急診臨床執行各項侵入性處置與技術之病歷號與日期。可做為專科醫師受訓資格審查與操作評量統計依據。
                </p>
              </div>

              <button
                onClick={() => setIsAddSkillOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>登錄新操作紀錄</span>
              </button>
            </div>

            {/* Quick add modal */}
            {isAddSkillOpen && (
              <form onSubmit={handleAddSkillLog} className="bg-slate-50 rounded-xl p-4 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800">登錄技術操作紀錄</span>
                  <button
                    type="button"
                    onClick={() => setIsAddSkillOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    取消
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">受訓年度</label>
                    <select
                      value={newSkillYear}
                      onChange={(e) => setNewSkillYear(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    >
                      <option value={2026}>2026 年度</option>
                      <option value={2027}>2027 年度</option>
                      <option value={2028}>2028 年度</option>
                      <option value={2029}>2029 年度</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">操作品項名稱</label>
                    <input
                      type="text"
                      placeholder="例：氣管內管插管術 (Endotracheal intubation)"
                      value={newSkillItem}
                      onChange={(e) => setNewSkillItem(e.target.value)}
                      required
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {/* Quick shortcuts */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['氣管插管', 'CVC置入', '胸管置入', '腰椎穿刺(LP)', '動脈導管(A-line)', '骨內針(IO)', '關節復位', '傷口縫合'].map(shortcut => (
                        <button
                          key={shortcut}
                          type="button"
                          onClick={() => setNewSkillItem(shortcut)}
                          className="text-[10px] bg-slate-200/80 hover:bg-teal-100 hover:text-teal-800 text-slate-700 px-1.5 py-0.5 rounded transition-all"
                        >
                          +{shortcut}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">病歷號 (Chart No.)</label>
                    <input
                      type="text"
                      placeholder="例：12345678"
                      value={newSkillChartNo}
                      onChange={(e) => setNewSkillChartNo(e.target.value)}
                      required
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">執行日期</label>
                    <input
                      type="date"
                      value={newSkillDate}
                      onChange={(e) => setNewSkillDate(e.target.value)}
                      required
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">備註 / 導師指導心得</label>
                    <input
                      type="text"
                      placeholder="例：首次順利獨立置入，無併發症..."
                      value={newSkillNotes}
                      onChange={(e) => setNewSkillNotes(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700"
                  >
                    儲存操作日誌
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            {progress.skillLogs && progress.skillLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5 w-12 text-center">項次</th>
                      <th className="px-3 py-2.5 w-20">年度</th>
                      <th className="px-3 py-2.5 min-w-[200px]">操作品項名稱</th>
                      <th className="px-3 py-2.5 w-32 font-mono">病歷號</th>
                      <th className="px-3 py-2.5 w-28">執行日期</th>
                      <th className="px-3 py-2.5 min-w-[200px]">備註與心得</th>
                      <th className="px-3 py-2.5 w-16 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {progress.skillLogs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-700">
                          {log.year}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          {log.item}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-teal-700 font-bold">
                          {log.chartNo}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 font-mono">
                          {log.date}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">
                          {log.notes || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => handleDeleteSkillLog(log.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="刪除此筆紀錄"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Stethoscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">目前尚無操作日誌紀錄</p>
                <button
                  onClick={() => setIsAddSkillOpen(true)}
                  className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  + 點此立即新增第一筆紀錄
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 急診醫學里程碑考核 (Milestones 1~27) */}
      {/* ========================================================================= */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-600" />
                <span>急診醫學核心能力里程碑考核 (Milestones 1 ~ 27)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                依照急診專科醫師訓練評量，每半年由學員自我省思或導師評定各核心領域之表現階段 (Level 1 新手 ~ Level 5 專家)。
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 w-12 text-center">編號</th>
                    <th className="px-3 py-2.5 min-w-[220px]">核心能力項目</th>
                    <th className="px-3 py-2.5 w-24 text-center">R1 (上)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R1 (下)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R2 (上)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R2 (下)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R3 (上)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R3 (下)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R4 (上)</th>
                    <th className="px-3 py-2.5 w-24 text-center">R4 (下)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MILESTONES_LIST.map((m) => {
                    const mRecords = progress.milestones?.[m.id] || {};
                    const periods = [
                      { key: 'r1_1', label: 'R1上' },
                      { key: 'r1_2', label: 'R1下' },
                      { key: 'r2_1', label: 'R2上' },
                      { key: 'r2_2', label: 'R2下' },
                      { key: 'r3_1', label: 'R3上' },
                      { key: 'r3_2', label: 'R3下' },
                      { key: 'r4_1', label: 'R4上' },
                      { key: 'r4_2', label: 'R4下' }
                    ];

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                          {m.number}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">
                          {m.title}
                          <span className="block text-[10px] font-normal text-slate-500">
                            {m.category}
                          </span>
                        </td>
                        {periods.map(p => {
                          const currentVal = mRecords[p.key];

                          return (
                            <td key={p.key} className="px-2 py-2 text-center">
                              <select
                                value={currentVal !== undefined ? currentVal : ''}
                                onChange={(e) => {
                                  const val = e.target.value ? Number(e.target.value) : 0;
                                  handleUpdateMilestone(m.id, p.key, val);
                                }}
                                className="w-full text-[11px] px-1 py-1 rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-center"
                              >
                                <option value="">-</option>
                                <option value="1">L 1</option>
                                <option value="2">L 2</option>
                                <option value="3">L 3</option>
                                <option value="4">L 4</option>
                                <option value="5">L 5</option>
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 工作須知與臨床照護規範 (Rules) */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Shift Handover Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-teal-700">
              <Clock className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-900">
                {CLINICAL_WORK_RULES.shiftTransfer.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-teal-50/60 p-2.5 rounded-lg border border-teal-100">
              {CLINICAL_WORK_RULES.shiftTransfer.schedule}
            </p>
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1.5">
                交班落實六大要素 (逐一病人檢視)：
              </span>
              <ul className="space-y-1.5">
                {CLINICAL_WORK_RULES.shiftTransfer.sixElements.map((el, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consultation & Admission Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-indigo-700">
              <FileText className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-900">
                {CLINICAL_WORK_RULES.consultation.title}
              </h3>
            </div>
            <ul className="space-y-2">
              {CLINICAL_WORK_RULES.consultation.rules.map((rule, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/60">
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Teaching Activities Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-amber-700">
              <Award className="h-5 w-5" />
              <h3 className="text-sm font-bold text-slate-900">
                {CLINICAL_WORK_RULES.teachingActivities.title}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CLINICAL_WORK_RULES.teachingActivities.rules.map((rule, i) => (
                <div key={i} className="text-xs text-slate-700 leading-relaxed bg-amber-50/30 p-3.5 rounded-xl border border-amber-100 flex items-start space-x-2">
                  <span className="font-bold text-amber-800 shrink-0">●</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: 手冊宗旨與四年輪訓規劃 (Syllabus) */}
      {/* ========================================================================= */}
      {activeTab === 'syllabus' && (
        <div className="space-y-5">
          {/* Intro Text */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              【壹、簡介與編寫初衷】
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {HANDBOOK_META.introText.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* 4 Years Rotation Plan Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              【貳、急診專科四年輪訓計畫總覽】
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROTATION_SYLLABUS_OVERVIEW.map((plan) => (
                <div key={plan.year} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                  <div className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>{plan.year}</span>
                    <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">12 個月</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {plan.rotations.map((r, i) => (
                      <li key={i} className="flex items-center justify-between py-0.5">
                        <span>{r.name}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{r.months}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: 多次案例登記與自學心得存檔 (Multi-Case Logging & Self Study) */}
      {/* ========================================================================= */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-white shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5 text-white flex items-start justify-between">
              <div className="space-y-1 pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                    {activeModalItem.yearLevel} - 第 {activeModalItem.number} 項
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {activeModalItem.sectionTitle}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {activeModalItem.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sub-tabs inside modal */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
              <button
                type="button"
                onClick={() => setModalTab('cases')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  modalTab === 'cases'
                    ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="h-3.5 w-3.5 text-teal-600" />
                <span>實際臨床案例紀錄 (可多次登記)</span>
                <span className="ml-1 rounded-full bg-teal-100 text-teal-800 px-1.5 py-0.2 text-[10px]">
                  {progress.clinicalCurriculum?.[activeModalItem.id]?.cases?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('selfStudy')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
                  modalTab === 'selfStudy'
                    ? 'border-teal-600 text-teal-700 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-teal-600" />
                <span>自學進度與研讀心得</span>
                {progress.clinicalCurriculum?.[activeModalItem.id]?.selfStudied && (
                  <Check className="h-3 w-3 text-emerald-600 ml-1" />
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto space-y-5">
              
              {/* TAB A: Cases Logging */}
              {modalTab === 'cases' && (
                <div className="space-y-5">
                  {/* New / Edit Case Form */}
                  <form onSubmit={handleSaveCase} className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <FileEdit className="h-3.5 w-3.5 text-teal-600" />
                        <span>{editingCaseId ? '編輯此筆案例資料' : '＋ 登錄新案例 (支援多次登記與存檔)'}</span>
                      </span>
                      {editingCaseId && (
                        <button
                          type="button"
                          onClick={handleCancelEditCase}
                          className="text-[11px] text-slate-500 hover:text-slate-700 font-medium underline"
                        >
                          取消編輯，改為新增
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          案例就醫 / 處置日期
                        </label>
                        <input
                          type="date"
                          value={caseDate}
                          onChange={(e) => setCaseDate(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          病歷號碼 Chart No. <span className="text-teal-700 font-normal">(必填)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="例如：10829381"
                          value={caseChartNo}
                          onChange={(e) => setCaseChartNo(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          病患年齡 / 性別 / 診斷概要
                        </label>
                        <input
                          type="text"
                          placeholder="例如：68歲 男性 / 前壁 STEMI 併心因性休克"
                          value={casePatientInfo}
                          onChange={(e) => setCasePatientInfo(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          指導主治醫師 / VS
                        </label>
                        <input
                          type="text"
                          placeholder="例如：蔡醫師"
                          value={caseSupervisor}
                          onChange={(e) => setCaseSupervisor(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        臨床處置重點、學習心得與討論 <span className="text-teal-700 font-normal">(必填)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="請記錄關鍵急診處置、判讀依據、處方用藥或指導醫師給予之回饋..."
                        value={caseNotes}
                        onChange={(e) => setCaseNotes(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="flex items-center space-x-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-98 transition-all"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{editingCaseId ? '💾 儲存並更新此案例' : '💾 儲存並存檔此案例 (可持續登記)'}</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Previous Cases */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-slate-500" />
                        <span>已存檔案例歷程清單 (共 {progress.clinicalCurriculum?.[activeModalItem.id]?.cases?.length || 0} 筆)</span>
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        點擊右側圖示可修改或刪除
                      </span>
                    </div>

                    {(!progress.clinicalCurriculum?.[activeModalItem.id]?.cases || progress.clinicalCurriculum?.[activeModalItem.id]?.cases?.length === 0) ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                        目前尚未登錄任何案例。填寫上方表單後點擊「儲存並存檔此案例」即可開始累計案例！
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {progress.clinicalCurriculum?.[activeModalItem.id]?.cases?.map((c, idx) => (
                          <div 
                            key={c.id}
                            className={`p-3 rounded-xl border transition-all ${
                              editingCaseId === c.id 
                                ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-400' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-white">
                                  案例 #{idx + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  歷號：{c.chartNo}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({c.date})
                                </span>
                                {c.patientInfo && (
                                  <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                                    {c.patientInfo}
                                  </span>
                                )}
                                {c.supervisor && (
                                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    指導VS: {c.supervisor}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCase(c)}
                                  className="p-1 text-slate-400 hover:text-teal-600 rounded hover:bg-slate-100 transition-colors"
                                  title="編輯此案例"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCase(activeModalItem.id, c.id, activeModalItem.name)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                                  title="刪除此案例"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              {c.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB B: Self-Study Details */}
              {modalTab === 'selfStudy' && (
                <form onSubmit={handleSaveSelfStudy} className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="selfStudyCheckModal"
                        checked={selfStudiedState}
                        onChange={(e) => setSelfStudiedState(e.target.checked)}
                        className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                      />
                      <label htmlFor="selfStudyCheckModal" className="text-xs font-bold text-slate-900 cursor-pointer">
                        已完成此訓練核心項目之自我研讀研習
                      </label>
                    </div>

                    {selfStudiedState && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          完成自學日期
                        </label>
                        <input
                          type="date"
                          value={selfStudyDateState}
                          onChange={(e) => setSelfStudyDateState(e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        自我研讀學習心得 / 參考文獻或指引重點摘要
                      </label>
                      <textarea
                        rows={4}
                        placeholder="例如：研讀 2026 AHA CPR 指引重點、Tintinalli Ch. 24，掌握心電圖判讀與急診救命術流程..."
                        value={selfStudyNotesState}
                        onChange={(e) => setSelfStudyNotesState(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="flex items-center space-x-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-98 transition-all"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>💾 儲存並存檔自學進度</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 sm:px-5 flex items-center justify-between text-xs text-slate-500">
              <span>儲存後將自動存檔至學員手冊並支援 Excel 完整匯出</span>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Toast Notification */}
      {/* ========================================================================= */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/40 backdrop-blur-md">
          <div className="h-7 w-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{saveToast}</p>
            <p className="text-[10px] text-slate-400">已自動同步儲存至個人臨床訓練手冊資料庫</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default HandbookView;
