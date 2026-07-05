import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  BookOpen, 
  FileText, 
  Upload, 
  ShieldAlert, 
  Waves, 
  Skull, 
  Ambulance, 
  Activity, 
  Heart,
  Calendar
} from 'lucide-react';
import { Student, Course, CourseCategory, COURSES } from '../types';

interface CoursesViewProps {
  student: Student;
  onUpdateStatus: (
    type: 'rotation' | 'course' | 'homework',
    itemId: string,
    submission: { notes: string; fileName: string; fileUrl: string }
  ) => void;
}

const CATEGORIES: { id: CourseCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'ultrasound', name: '急診超音波學', icon: <Waves className="h-4 w-4 text-sky-500" /> },
  { id: 'toxicology', name: '臨床毒物學', icon: <Skull className="h-4 w-4 text-emerald-500" /> },
  { id: 'disaster', name: '災難醫學', icon: <ShieldAlert className="h-4 w-4 text-rose-500" /> },
  { id: 'ems', name: '緊急救護 (EMS)', icon: <Ambulance className="h-4 w-4 text-indigo-500" /> },
  { id: 'triage', name: '五級檢傷分類', icon: <Activity className="h-4 w-4 text-teal-500" /> },
  { id: 'assessment', name: '能力進展評量', icon: <Heart className="h-4 w-4 text-purple-500" /> },
  { id: 'geriatrics', name: '高齡急診學', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
];

export default function CoursesView({ student, onUpdateStatus }: CoursesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Submit state
  const [submittingCourseId, setSubmittingCourseId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');

  // Filter courses based on student's admission year
  const applicableCourses = COURSES.filter(c => student.admissionYear >= c.applicableFrom);

  // Filter based on search & category
  const filteredCourses = applicableCourses.filter(c => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalCourses = applicableCourses.length;
  const completedCourses = applicableCourses.filter(c => student.courseStatus[c.id]?.status === 'approved').length;
  const pendingCourses = applicableCourses.filter(c => student.courseStatus[c.id]?.status === 'pending').length;

  const handleSubmitCourseProof = (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!fileNameInput.trim()) return;

    onUpdateStatus('course', courseId, {
      notes: notesInput,
      fileName: fileNameInput,
      fileUrl: 'course-certificate-placeholder'
    });

    // Reset uploader form states
    setSubmittingCourseId(null);
    setNotesInput('');
    setFileNameInput('');
  };

  const handleSelectSuggestedFile = (courseName: string) => {
    setFileNameInput(`${student.name}_學會_${courseName}_認證證書.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and stats bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center">
              <Award className="h-5 w-5 text-indigo-600 mr-2" />
              急診醫學會專科必修學分與核心課程
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              依據您的訓練年度 <strong>{student.admissionYear} 年度</strong>，本系統已自動為您過濾所有急診醫學會指定必修學分、線上課程及案例 Logbook。
            </p>
          </div>

          <div className="flex space-x-3 self-start md:self-auto bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
            <div className="text-center px-2 border-r border-slate-200">
              <span className="block text-[9px] font-bold text-slate-400">必修總數</span>
              <span className="text-sm font-black text-slate-700 font-mono">{totalCourses}</span>
            </div>
            <div className="text-center px-2 border-r border-slate-200">
              <span className="block text-[9px] font-bold text-teal-500">已核可</span>
              <span className="text-sm font-black text-teal-600 font-mono">{completedCourses}</span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[9px] font-bold text-amber-500">待審核</span>
              <span className="text-sm font-black text-amber-600 font-mono">{pendingCourses}</span>
            </div>
          </div>
        </div>

        {/* Global search & category tabs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋學會必修項目名稱或課程內容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CourseCategory | 'all')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">所有類別 (All Categories)</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cohort Alerts */}
      {student.admissionYear >= 115 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900 flex items-start space-x-2.5">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-extrabold block">⚠️ 115 訓練年度急診住院醫師高齡新制必修提醒</span>
            <p className="mt-0.5 text-amber-800/85">
              依據最新急診專科訓練評鑑，自 115 訓練年度起住院醫師必須於訓練期間修習完畢 9 大項高齡急診線上課程（本頁面最下方，具備黃色標籤）。請在訓練空檔儘早至急診醫學會線上平台觀看並申報。
            </p>
          </div>
        </div>
      )}

      {student.admissionYear >= 112 && student.admissionYear < 115 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 text-xs text-rose-900 flex items-start space-x-2.5">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">🚨 112-114 學年災難醫學核心時數提醒</span>
            <p className="mt-0.5 text-rose-800/85">
              112學年度起收訓之急診住院醫師必修災難醫學項目，含初階訓練課程、毒化災/核災各 6 小時課程、聯合討論會 3 次以及不同型態災難演習 3 場。請記得填妥紙本災難評核表並在此處上傳證明以利核銷。
            </p>
          </div>
        </div>
      )}

      {/* Grid List of Courses */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Award className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">無相符的學會必修項目</p>
          <p className="text-xs text-slate-400 mt-1">請嘗試修改搜尋關鍵字，或切換其他類別標籤。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => {
            const status = student.courseStatus[course.id];
            const isSubmitting = submittingCourseId === course.id;

            return (
              <div 
                key={course.id}
                className={`rounded-xl border bg-white p-5 shadow-sm transition-all flex flex-col justify-between ${
                  status?.status === 'approved' 
                    ? 'border-teal-200 bg-teal-50/10' 
                    : status?.status === 'pending'
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 border border-slate-200 text-slate-600 uppercase tracking-wide">
                      {CATEGORIES.find(cat => cat.id === course.category)?.name || course.category}
                    </span>

                    {/* RLevel Badge */}
                    <span className="text-[9px] font-bold text-slate-400 font-mono">
                      建議級數: {course.suggestedYear}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {course.name}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {course.description}
                  </p>
                </div>

                {/* Status or Upload trigger */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                  
                  {status ? (
                    // Submission exists
                    <div className="text-xs space-y-2.5">
                      
                      {/* Status row */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">審查狀態：</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.25 text-[10px] font-extrabold uppercase tracking-wide ${
                          status.status === 'approved' 
                            ? 'bg-teal-100 text-teal-700' 
                            : status.status === 'pending' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {status.status === 'approved' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              VS核可 (+100 XP)
                            </>
                          ) : status.status === 'pending' ? (
                            <>
                              <Clock className="h-3 w-3 mr-1 animate-spin" />
                              待VS導師審核
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              退回，請修改
                            </>
                          )}
                        </span>
                      </div>

                      {/* Detail block */}
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                        {status.notes && (
                          <p className="text-[11px] text-slate-600 leading-relaxed italic">
                            &ldquo;{status.notes}&rdquo;
                          </p>
                        )}
                        <div className="flex items-center space-x-1 text-[10px] text-teal-700 font-bold font-mono">
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{status.fileName}</span>
                        </div>
                      </div>

                      {status.feedback && (
                        <div className="bg-amber-50/50 p-2 rounded border border-amber-100 text-[10px] text-amber-800">
                          <strong>指導 VS 評語：</strong> &ldquo;{status.feedback}&rdquo;
                        </div>
                      )}

                      {/* Rejected retry */}
                      {status.status === 'rejected' && !isSubmitting && (
                        <button
                          onClick={() => {
                            setSubmittingCourseId(course.id);
                            setNotesInput(status.notes);
                            setFileNameInput(status.fileName);
                          }}
                          className="w-full text-center text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          修正申報資料並重送 ✎
                        </button>
                      )}

                    </div>
                  ) : (
                    // No submission yet
                    !isSubmitting ? (
                      <button
                        onClick={() => setSubmittingCourseId(course.id)}
                        className="w-full flex items-center justify-center space-x-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        申報取得此課程學分 (+100 XP)
                      </button>
                    ) : null
                  )}

                  {/* Submission Form Overlay */}
                  {isSubmitting && (
                    <form onSubmit={(e) => handleSubmitCourseProof(e, course.id)} className="space-y-3 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200 text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">1. 修習筆記 / 得心應手之處 (50字以上)</label>
                        <textarea
                          placeholder="請輸入您修習此課程的重點摘要、反思心得、或操作 Logbook 之學習收穫..."
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          rows={2}
                          className="w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-700 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-slate-700">2. 輸入學分證書 / 簽章 Logbook 檔名</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="例如：林大明_超音波證書.pdf"
                            value={fileNameInput}
                            onChange={(e) => setFileNameInput(e.target.value)}
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestedFile(course.name)}
                            className="bg-slate-200 hover:bg-slate-300 text-[10px] font-semibold text-slate-700 px-2 rounded shrink-0"
                          >
                            自動帶入
                          </button>
                        </div>
                      </div>

                      <div className="flex space-x-2 justify-end pt-1.5 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittingCourseId(null);
                            setNotesInput('');
                            setFileNameInput('');
                          }}
                          className="rounded bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 text-[11px] font-bold"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1 text-[11px] font-bold shadow shadow-indigo-600/10 cursor-pointer"
                        >
                          確認上傳送審 (+100 XP)
                        </button>
                      </div>
                    </form>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
