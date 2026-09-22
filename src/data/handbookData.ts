export interface HandbookDepartmentItem {
  id: string;
  number: number | string;
  name: string;
  subItems?: string[];
  note?: string;
}

export interface HandbookDepartmentSection {
  id: string;
  title: string;
  yearLevel: 'R1' | 'R2' | 'R3' | 'R4' | 'All';
  durationDesc: string;
  items: HandbookDepartmentItem[];
  activities?: { name: string; date?: string; note?: string }[];
}

export interface ProcedureAuthorizationItem {
  id: string;
  nameEn: string;
  nameZh: string;
  r1: boolean;
  r2: boolean;
  r3: boolean;
  r4: boolean;
  category: 'airway' | 'cardiac' | 'vascular' | 'gi_gu' | 'wound_ortho' | 'general' | 'special';
}

export interface MilestoneItem {
  id: string;
  number: number;
  title: string;
  category?: string;
}

export interface SkillLogEntry {
  id: string;
  year: number; // 2026, 2027, 2028, 2029
  item: string;
  chartNo: string;
  date: string;
  notes?: string;
}

export interface CurriculumCaseRecord {
  id: string;
  date: string;
  chartNo: string;
  patientInfo?: string;
  notes: string;
  supervisor?: string;
  createdAt: string;
}

export interface CurriculumItemProgress {
  selfStudied: boolean;
  selfStudyDate?: string;
  selfStudyNotes?: string;
  actualCase?: string;
  cases?: CurriculumCaseRecord[];
}

export interface HandbookProgress {
  clinicalCurriculum?: Record<string, CurriculumItemProgress>;
  mentorSignatures?: Record<string, { signed: boolean; signedBy?: string; signedAt?: string; caseReportNotes?: string }>;
  milestones?: Record<string, Record<string, number | string>>; // milestoneId -> { r1_1: 1~5, r1_2: 1~5, ... }
  skillLogs?: SkillLogEntry[];
  medicalRecordsCourses?: Array<{ id: string; date: string; topic: string; reflections: string }>;
  simulationLogs?: Array<{ id: string; date: string; topic: string; notes: string }>;
  certifications?: Record<string, { passDate1?: string; passDate2?: string }>;
}

export const HANDBOOK_META = {
  title: '國泰急診醫學科住院醫師工作手冊 暨 學習手冊',
  edition: '2014.Jul 初版 / 2026.Jun 十二修',
  committee: '急診醫學部醫學教育委員會 審訂',
  hospital: '國泰綜合醫院 Cathay General Hospital',
  introText: `有鑑於急診醫學錯綜複雜，常需到各科學習訓練，而真正到各科學習時，常又因對該科之不夠熟悉，常常不知道要學什麼，就自行放空了。而各科老師或因不夠了解急診、太忙、病例一時之缺乏……等因素，亦未能及時給予完全之訓練。

故本委員會參考「台灣急診醫學科專科訓練醫師核心課程」制定本科住院醫師訓練計畫，再以之為經緯，編此手冊，期望各級住院醫師輪派至各個科別時，能迅速了解自己該學些什麼，甚至以此學習手冊作為目錄，來完成自己的學習資料夾，記錄自己的學習內容與過程。將來更能夠對通過專科考試及急診執業有所幫助。

本手冊志在幫助住院醫師自我學習而不在評核，並提供教育委員會了解學生之學習狀況，請務必確實登錄。若未能在訓練時段內完成之學習項目，也請自行補上。希望這本手冊能給予學弟妹學習上的些微幫助，而不是只是增加文書作業。`
};

export const ROTATION_SYLLABUS_OVERVIEW = [
  {
    year: '訓練年一 (R1)',
    rotations: [
      { name: '成人急診醫學', months: '6 個月' },
      { name: '兒科學', months: '1 個月' },
      { name: '內科學', months: '1 個月' },
      { name: '外科學', months: '1 個月' },
      { name: '婦產科', months: '1 個月' },
      { name: '耳鼻喉科', months: '1 個月' },
      { name: '眼科', months: '1 個月' }
    ]
  },
  {
    year: '訓練年二 (R2)',
    rotations: [
      { name: '成人急診醫學', months: '4 個月' },
      { name: '兒科學', months: '1 個月' },
      { name: '外科學', months: '1 個月' },
      { name: '神經科', months: '1 個月' },
      { name: '災難醫學', months: '分散式' },
      { name: '影像醫學', months: '1 個月' },
      { name: '重症醫學', months: '2 個月' },
      { name: '自選科', months: '1 個月' }
    ]
  },
  {
    year: '訓練年三 (R3)',
    rotations: [
      { name: '成人急診醫學', months: '4 個月' },
      { name: '兒童急診醫學', months: '1 個月' },
      { name: '精神科', months: '1 個月' },
      { name: '緊急救護體系(EMS)', months: '1 個月' },
      { name: '超音波', months: '分散式' },
      { name: '毒物學', months: '1 個月' },
      { name: '重症醫學', months: '2 個月' },
      { name: '自選科', months: '1 個月' }
    ]
  },
  {
    year: '訓練年四 (R4)',
    rotations: [
      { name: '成人急診醫學', months: '3 個月' },
      { name: '兒童急診醫學', months: '1 個月' },
      { name: '自選科', months: '2 個月' }
    ]
  }
];

// 55 項操作授權規範矩陣
export const PROCEDURE_AUTHORIZATIONS: ProcedureAuthorizationItem[] = [
  { id: 'auth-1', nameZh: '一般身體評估', nameEn: 'General physical assessment', r1: true, r2: true, r3: true, r4: true, category: 'general' },
  { id: 'auth-2', nameZh: '快速麻醉插管', nameEn: 'Rapid sequence intubation (RSI)', r1: false, r2: false, r3: true, r4: true, category: 'airway' },
  { id: 'auth-3', nameZh: '經口氣管內管插管術', nameEn: 'Orotracheal intubation', r1: false, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-4', nameZh: '徒手經口氣管內管插管術', nameEn: 'Digital orotracheal intubation', r1: false, r2: false, r3: true, r4: true, category: 'airway' },
  { id: 'auth-5', nameZh: '光源通條插管術', nameEn: 'Light stylet intubation', r1: true, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-6', nameZh: '經鼻氣管內管插管術', nameEn: 'Nasotracheal intubation', r1: false, r2: false, r3: true, r4: true, category: 'airway' },
  { id: 'auth-7', nameZh: '逆行性導線插管術', nameEn: 'Retrograde guidewire intubation', r1: false, r2: false, r3: false, r4: true, category: 'airway' },
  { id: 'auth-8', nameZh: '環甲軟骨切開術', nameEn: 'Cricothyroidotomy', r1: false, r2: false, r3: true, r4: true, category: 'airway' },
  { id: 'auth-9', nameZh: '氣管切開術', nameEn: 'Tracheostomy', r1: false, r2: false, r3: true, r4: true, category: 'airway' },
  { id: 'auth-10', nameZh: '氣切管更換術', nameEn: 'Change tracheostomy tube', r1: false, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-11', nameZh: '喉頭罩氣管插管術', nameEn: 'Laryngeal mask airway (LMA)', r1: true, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-12', nameZh: '心臟電擊整流及去顫術', nameEn: 'Cardioversion and defibrillation', r1: false, r2: false, r3: true, r4: true, category: 'cardiac' },
  { id: 'auth-13', nameZh: '心包膜穿刺術', nameEn: 'Pericardiocentesis', r1: false, r2: false, r3: true, r4: true, category: 'cardiac' },
  { id: 'auth-14', nameZh: '胸部針刺減壓', nameEn: 'Needle thoracostomy', r1: false, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-15', nameZh: '胸管置入', nameEn: 'Tube thoracostomy', r1: false, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-16', nameZh: '胸腔穿刺術', nameEn: 'Thoracentesis', r1: false, r2: true, r3: true, r4: true, category: 'airway' },
  { id: 'auth-17', nameZh: '緊急開胸術', nameEn: 'Emergent thoracotomy', r1: false, r2: false, r3: false, r4: true, category: 'cardiac' },
  { id: 'auth-18', nameZh: '直接心臟按摩', nameEn: 'Open cardiac massage', r1: false, r2: false, r3: false, r4: true, category: 'cardiac' },
  { id: 'auth-19', nameZh: '中央靜脈管置放術 (CVC)', nameEn: 'Central venous line insertion', r1: false, r2: true, r3: true, r4: true, category: 'vascular' },
  { id: 'auth-20', nameZh: '周邊血管切開術', nameEn: 'Peripheral venous cutdown', r1: false, r2: false, r3: true, r4: true, category: 'vascular' },
  { id: 'auth-21', nameZh: '骨內針置放術 (IO)', nameEn: 'Intraosseous line placement', r1: false, r2: true, r3: true, r4: true, category: 'vascular' },
  { id: 'auth-22', nameZh: '臍血管導管置放術', nameEn: 'Umbilical vessel catheterization', r1: false, r2: true, r3: true, r4: true, category: 'vascular' },
  { id: 'auth-23', nameZh: '動脈穿刺術', nameEn: 'Arterial puncture', r1: true, r2: true, r3: true, r4: true, category: 'vascular' },
  { id: 'auth-24', nameZh: '動脈留置針置放術 (A-line)', nameEn: 'Arterial cannulation', r1: false, r2: false, r3: true, r4: true, category: 'vascular' },
  { id: 'auth-25', nameZh: '鼻胃管放置術 (NG)', nameEn: 'NG intubation', r1: true, r2: true, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-26', nameZh: '胃灌洗術', nameEn: 'Gastric lavage', r1: true, r2: true, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-27', nameZh: '胃食道球管置放術', nameEn: 'SB tube tamponade', r1: false, r2: false, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-28', nameZh: '腹水抽取術', nameEn: 'Paracentesis', r1: false, r2: true, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-29', nameZh: '診斷性腹腔灌洗術 (DPL)', nameEn: 'Diagnostic peritoneal lavage', r1: false, r2: false, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-30', nameZh: '腔室內壓測量', nameEn: 'Compartment pressure measurement', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-31', nameZh: '肌腱修補術', nameEn: 'Tendon repair', r1: false, r2: false, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-32', nameZh: '關節穿刺術', nameEn: 'Arthrocentesis', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-33', nameZh: '脫臼復位術', nameEn: 'Joint reduction', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-34', nameZh: '骨折復位術', nameEn: 'Fracture reduction', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-35', nameZh: '石膏固定術', nameEn: 'Cast immobilization', r1: true, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-36', nameZh: '護木固定術', nameEn: 'Splint immobilization', r1: true, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-37', nameZh: '基本傷口縫合', nameEn: 'Basic wound repair', r1: true, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-38', nameZh: '複雜傷口縫合', nameEn: 'Complex wound repair', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-39', nameZh: '皮下異物移除', nameEn: 'Subcutaneous foreign body removal', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-40', nameZh: '魚鉤移除術', nameEn: 'Fishhook removal', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-41', nameZh: '指環移除', nameEn: 'Ring removal', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-42', nameZh: '甲床血腫引流術', nameEn: 'Subungual hematoma evacuation', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-43', nameZh: '皮下膿瘍切開引流術 (I&D)', nameEn: 'Subcutaneous abscess I&D', r1: true, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-44', nameZh: '腰椎穿刺 (LP)', nameEn: 'Lumbar puncture', r1: false, r2: true, r3: true, r4: true, category: 'general' },
  { id: 'auth-45', nameZh: '重症肌無力測試', nameEn: 'Tensilon test', r1: false, r2: false, r3: true, r4: true, category: 'special' },
  { id: 'auth-46', nameZh: '局部麻醉術', nameEn: 'Local anesthesia', r1: true, r2: true, r3: true, r4: true, category: 'general' },
  { id: 'auth-47', nameZh: '區域神經阻斷術', nameEn: 'Regional nerve block', r1: false, r2: true, r3: true, r4: true, category: 'general' },
  { id: 'auth-48', nameZh: '意識鎮靜 (Sedation)', nameEn: 'Conscious sedation', r1: false, r2: false, r3: true, r4: true, category: 'general' },
  { id: 'auth-49', nameZh: '陰道生產術', nameEn: 'Vaginal delivery', r1: false, r2: false, r3: true, r4: true, category: 'special' },
  { id: 'auth-50', nameZh: '性侵評估', nameEn: 'Sexual assault examination', r1: true, r2: true, r3: true, r4: true, category: 'special' },
  { id: 'auth-51', nameZh: '尿管置放術 (Foley)', nameEn: 'Urethral catheterization', r1: true, r2: true, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-52', nameZh: '恥骨上膀胱穿刺術', nameEn: 'Suprapubic bladder aspiration', r1: false, r2: false, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-53', nameZh: '睪丸復位術', nameEn: 'Testicular detorsion', r1: false, r2: true, r3: true, r4: true, category: 'gi_gu' },
  { id: 'auth-54', nameZh: '眼壓測量 (Schiotz/Tono)', nameEn: 'Intraocular pressure measurement', r1: true, r2: true, r3: true, r4: true, category: 'special' },
  { id: 'auth-55', nameZh: '眼底鏡檢查', nameEn: 'Ophthalmoscopy examination', r1: true, r2: true, r3: true, r4: true, category: 'special' },
  { id: 'auth-56', nameZh: '外聽道異物移除', nameEn: 'External auditory canal foreign body removal', r1: false, r2: true, r3: true, r4: true, category: 'special' },
  { id: 'auth-57', nameZh: '鼻骨骨折復位', nameEn: 'Nasal fracture reduction', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' },
  { id: 'auth-58', nameZh: '鼻血處置 (前/後鼻填塞)', nameEn: 'Epistaxis management', r1: true, r2: true, r3: true, r4: true, category: 'special' },
  { id: 'auth-59', nameZh: '呼吸道異物移除', nameEn: 'Airway foreign body removal', r1: false, r2: false, r3: true, r4: true, category: 'airway' },
  { id: 'auth-60', nameZh: '顳頜關節復位術 (TMJ)', nameEn: 'TMJ joint reduction', r1: false, r2: true, r3: true, r4: true, category: 'wound_ortho' }
];

// 27 項急診醫學里程碑 (Milestones 1~27)
export const MILESTONES_LIST: MilestoneItem[] = [
  { id: 'ms-1', number: 1, title: '緊急穩定處置 (Emergency Stabilization)', category: 'Patient Care' },
  { id: 'ms-2', number: 2, title: '焦點式病史詢問及身體診察 (Focused History & Physical Exam)', category: 'Patient Care' },
  { id: 'ms-3', number: 3, title: '診斷性檢查及檢驗 (Diagnostic Studies)', category: 'Patient Care' },
  { id: 'ms-4', number: 4, title: '診斷 (Diagnosis)', category: 'Patient Care' },
  { id: 'ms-5', number: 5, title: '藥物治療 (Pharmacotherapy)', category: 'Patient Care' },
  { id: 'ms-6', number: 6, title: '觀察與再次評估 (Observation & Reassessment)', category: 'Patient Care' },
  { id: 'ms-7', number: 7, title: '動向安排與照護轉移 (Disposition & Transition of Care)', category: 'Patient Care' },
  { id: 'ms-8', number: 8, title: '任務轉換 (Task Switching & Multi-tasking)', category: 'Patient Care' },
  { id: 'ms-9', number: 9, title: '操作型技能一般原則 (General Procedural Principles)', category: 'Procedural Skills' },
  { id: 'ms-10', number: 10, title: '呼吸道處置 (Airway Management)', category: 'Procedural Skills' },
  { id: 'ms-11', number: 11, title: '麻醉與急性疼痛處置 (Anesthesia & Acute Pain Management)', category: 'Procedural Skills' },
  { id: 'ms-12', number: 12, title: '急診超音波 (Emergency Ultrasound)', category: 'Procedural Skills' },
  { id: 'ms-13', number: 13, title: '傷口處置 (Wound Management)', category: 'Procedural Skills' },
  { id: 'ms-14', number: 14, title: '血管通路 (Vascular Access)', category: 'Procedural Skills' },
  { id: 'ms-15', number: 15, title: '科學知識 (Medical Knowledge / Scientific Knowledge)', category: 'Medical Knowledge' },
  { id: 'ms-16', number: 16, title: '治療與臨床推理 (Treatment & Clinical Reasoning)', category: 'Medical Knowledge' },
  { id: 'ms-17', number: 17, title: '專業行為以及倫理原則 (Professionalism & Ethical Principles)', category: 'Professionalism' },
  { id: 'ms-18', number: 18, title: '當責 (Accountability)', category: 'Professionalism' },
  { id: 'ms-19', number: 19, title: '自我覺察與健康福祉 (Self-awareness & Well-being)', category: 'Professionalism' },
  { id: 'ms-20', number: 20, title: '以病人為中心的溝通 (Patient-Centered Communication)', category: 'Communication' },
  { id: 'ms-21', number: 21, title: '跨專業與團隊溝通 (Interprofessional & Team Communication)', category: 'Communication' },
  { id: 'ms-22', number: 22, title: '健康照護系統內的溝通 (Communication within Healthcare System)', category: 'Communication' },
  { id: 'ms-23', number: 23, title: '循證實踐 (Evidence-Based Practice)', category: 'Practice-Based Learning' },
  { id: 'ms-24', number: 24, title: '執業中的反思並致力於個人的成長 (Reflective Practice & Growth)', category: 'Practice-Based Learning' },
  { id: 'ms-25', number: 25, title: '病人安全與品質改善 (Patient Safety & Quality Improvement)', category: 'Systems-Based Practice' },
  { id: 'ms-26', number: 26, title: '醫療制度下的管理 (System Navigation & Resource Stewardship)', category: 'Systems-Based Practice' },
  { id: 'ms-27', number: 27, title: '科技運用 (Technology Utilization & Digital Health)', category: 'Systems-Based Practice' }
];

// 分科訓練臨床訓練課程各科完整清單 (參、分科訓練)
export const HANDBOOK_DEPARTMENT_SECTIONS: HandbookDepartmentSection[] = [
  {
    id: 'er-r1',
    title: '成人急診醫學(一) 第一年',
    yearLevel: 'R1',
    durationDesc: '6 個月',
    items: [
      { id: 'er-r1-1', number: 1, name: '急診醫學基本概念' },
      { id: 'er-r1-2', number: 2, name: '呼吸道處置技術' },
      { id: 'er-r1-3', number: 3, name: '心臟停止及復甦之處理' },
      { id: 'er-r1-4', number: 4, name: '休克病患' },
      { id: 'er-r1-5', number: 5, name: '檢查結果判讀' },
      { id: 'er-r1-6', number: 6, name: '外傷病患之轉診' },
      { id: 'er-r1-7', number: 7, name: '心室纖維顫動(VF)' },
      { id: 'er-r1-8', number: 8, name: '心室心搏過速(VT)' },
      { id: 'er-r1-9', number: 9, name: '心臟停止(Asystole)' },
      { id: 'er-r1-10', number: 10, name: '無脈搏電氣活動(PEA)' },
      { id: 'er-r1-11', number: 11, name: '心房撲動(AF)' },
      { id: 'er-r1-12', number: 12, name: '心房纖維顫動(Af)' },
      { id: 'er-r1-13', number: 13, name: '房室異跳' },
      { id: 'er-r1-14', number: 14, name: '心室上心搏過速 (SVT)' },
      { id: 'er-r1-15', number: 15, name: '心搏過緩(Bradycardia)' },
      { id: 'er-r1-16', number: 16, name: '病竇症候群 (SSS)' },
      { id: 'er-r1-17', number: 17, name: '急性冠心症 (ACS)' },
      { id: 'er-r1-18', number: 18, name: '心肌梗塞典型變化' },
      { id: 'er-r1-19', number: 19, name: '心肌梗塞非典型變化' },
      { id: 'er-r1-20', number: 20, name: '心電圖變化:心肌缺氧' },
      { id: 'er-r1-21', number: 21, name: '心電圖變化:心內膜下梗塞' },
      { id: 'er-r1-22', number: 22, name: '心電圖變化:全壁層心肌梗塞' },
      { id: 'er-r1-23', number: 23, name: '非典型胸痛的鑑別診斷' },
      { id: 'er-r1-24', number: 24, name: '心絞痛病患的初步處理' },
      { id: 'er-r1-25', number: 25, name: '心包膜疾病' },
      { id: 'er-r1-26', number: 26, name: '急性心肌梗塞以血栓溶解劑治療' },
      { id: 'er-r1-27', number: 27, name: '心臟衰竭' },
      { id: 'er-r1-28', number: 28, name: '二尖瓣膜脫垂' },
      { id: 'er-r1-29', number: 29, name: '主動脈瓣狹窄' },
      { id: 'er-r1-30', number: 30, name: '三尖瓣狹窄' },
      { id: 'er-r1-31', number: 31, name: '肺動脈瓣狹窄' },
      { id: 'er-r1-32', number: 32, name: '主動脈瓣閉鎖不全' },
      { id: 'er-r1-33', number: 33, name: '三尖瓣閉鎖不全' },
      { id: 'er-r1-34', number: 34, name: '人工心臟瓣膜' },
      { id: 'er-r1-35', number: 35, name: '鬱血性心肌病變' },
      { id: 'er-r1-36', number: 36, name: '肥大性心肌病變' },
      { id: 'er-r1-37', number: 37, name: '局限性心肌病變' },
      { id: 'er-r1-38', number: 38, name: '心肌炎' },
      { id: 'er-r1-39', number: 39, name: '急性肺栓塞' },
      { id: 'er-r1-40', number: 40, name: '高血壓危症及急症' },
      { id: 'er-r1-41', number: 41, name: '高血壓腦性腦病變' },
      { id: 'er-r1-42', number: 42, name: '胸腔主動脈剝離之高血壓處理' },
      { id: 'er-r1-43', number: 43, name: '高血壓危症第一線用藥的優缺' },
      { id: 'er-r1-44', number: 44, name: '急性腸繫膜缺血' },
      { id: 'er-r1-45', number: 45, name: '急性主動脈剝離' },
      { id: 'er-r1-46', number: 46, name: '主動脈瘤鑑別診斷' },
      { id: 'er-r1-47', number: 47, name: '急性週邊血管缺血' },
      { id: 'er-r1-48', number: 48, name: '淺層靜脈栓塞' },
      { id: 'er-r1-49', number: 49, name: '深層靜脈栓塞 (DVT)' },
      { id: 'er-r1-50', number: 50, name: '急性血栓靜脈炎' },
      { id: 'er-r1-51', number: 51, name: '肺栓塞' }
    ]
  },
  {
    id: 'peds-r1',
    title: '兒科學(一) 第一年',
    yearLevel: 'R1',
    durationDesc: '1 個月',
    items: [
      { id: 'peds-r1-1', number: 1, name: '嬰兒/小兒急救' },
      { id: 'peds-r1-2', number: 2, name: '小兒呼吸道處置' },
      { id: 'peds-r1-3', number: 3, name: '小兒靜脈穿刺' },
      { id: 'peds-r1-4', number: 4, name: '小兒骨內針放置 (IO)' },
      { id: 'peds-r1-5', number: 5, name: '小兒耳鼻喉檢查' },
      { id: 'peds-r1-6', number: 6, name: '小兒發燒' },
      { id: 'peds-r1-7', number: 7, name: '小兒腦膜炎' },
      { id: 'peds-r1-8', number: 8, name: '小兒敗血症' },
      { id: 'peds-r1-9', number: 9, name: '小兒肺炎' },
      { id: 'peds-r1-10', number: 10, name: '小兒泌尿道感染' },
      { id: 'peds-r1-11', number: 11, name: '小兒脊髓穿刺 (LP)' },
      { id: 'peds-r1-12', number: 12, name: '兒童腸胃炎' },
      { id: 'peds-r1-13', number: 13, name: '兒童腸套疊' },
      { id: 'peds-r1-14', number: 14, name: '兒童腸扭轉' },
      { id: 'peds-r1-15', number: 15, name: '兒童麥氏憩室症' },
      { id: 'peds-r1-16', number: 16, name: '兒童過敏性紫斑症 (HSP)' },
      { id: 'peds-r1-17', number: 17, name: '兒童盲腸炎' },
      { id: 'peds-r1-18', number: 18, name: '兒科患者腹部腫瘤' },
      { id: 'peds-r1-19', number: 19, name: '雷式症候群 (Reye syndrome)' },
      { id: 'peds-r1-20', number: 20, name: '計算脫水童所需電解質與體液' },
      { id: 'peds-r1-21', number: 21, name: '小兒心電圖' },
      { id: 'peds-r1-22', number: 22, name: '先天性發紺的心臟疾病' },
      { id: 'peds-r1-23', number: 23, name: '先天性非發紺的心臟疾病' },
      { id: 'peds-r1-24', number: 24, name: '兒科胸部 X 光片' },
      { id: 'peds-r1-25', number: 25, name: '風濕熱或細菌性心內膜炎' },
      { id: 'peds-r1-26', number: 26, name: '兒童胸痛' },
      { id: 'peds-r1-27', number: 27, name: '小兒科鬱血性心衰竭' },
      { id: 'peds-r1-28', number: 28, name: '小兒呼吸道的解剖生理學' },
      { id: 'peds-r1-29', number: 29, name: '小兒氣喘' },
      { id: 'peds-r1-30', number: 30, name: '小兒細支氣管炎' },
      { id: 'peds-r1-31', number: 31, name: '小兒囊胞性纖維症' },
      { id: 'peds-r1-32', number: 32, name: '小兒肺炎' },
      { id: 'peds-r1-33', number: 33, name: '小兒科臉部及眼窩感染' },
      { id: 'peds-r1-34', number: 34, name: '小兒麻痺' },
      { id: 'peds-r1-35', number: 35, name: '小兒臘腸桿菌中毒' },
      { id: 'peds-r1-36', number: 36, name: 'Landry-Guillain-Barre 症候群 (GBS)' },
      { id: 'peds-r1-37', number: 37, name: '兒童腹瀉' },
      { id: 'peds-r1-38', number: 38, name: '兒童上下腸胃道出血' },
      { id: 'peds-r1-39', number: 39, name: '川崎症候群 (Kawasaki disease)' }
    ]
  },
  {
    id: 'med-r1',
    title: '內科學 第一年',
    yearLevel: 'R1',
    durationDesc: '1 個月',
    items: [
      { id: 'med-r1-1', number: 1, name: '食道疾病' },
      { id: 'med-r1-2', number: 2, name: '傳染性腹瀉' },
      { id: 'med-r1-3', number: 3, name: '肝膽疾病' },
      { id: 'med-r1-4', number: 4, name: '消化道阻塞' },
      { id: 'med-r1-5', number: 5, name: '進行消化道插管程序' },
      { id: 'med-r1-6', number: 6, name: '消化道發炎' },
      { id: 'med-r1-7', number: 7, name: '胃腸道出血' },
      { id: 'med-r1-8', number: 8, name: '鎌狀細胞疾病' },
      { id: 'med-r1-9', number: 9, name: '出血性疾病' },
      { id: 'med-r1-10', number: 10, name: '貧血患者的評估' },
      { id: 'med-r1-11', number: 11, name: '輸血治療' },
      { id: 'med-r1-12', number: 12, name: '愛滋病毒感染 (HIV)' },
      { id: 'med-r1-13', number: 13, name: '非愛滋病造成的免疫機能不足' },
      { id: 'med-r1-14', number: 14, name: '風濕性與自體免疫疾病' },
      { id: 'med-r1-15', number: 15, name: '過敏反應 (Anaphylaxis)' },
      { id: 'med-r1-16', number: 16, name: '細胞及體液免疫力+預防注射' },
      { id: 'med-r1-17', number: 17, name: '淋病、梅毒、破傷風和結核病' },
      { id: 'med-r1-18', number: 18, name: '毒性休克症候群 (TSS)' },
      { id: 'med-r1-19', number: 19, name: '敗血症 (Sepsis)' },
      { id: 'med-r1-20', number: 20, name: '立克次體' },
      { id: 'med-r1-21', number: 21, name: '病毒感染' },
      { id: 'med-r1-22', number: 22, name: '原蟲感染疾病' },
      { id: 'med-r1-23', number: 23, name: '腎絲球疾病' },
      { id: 'med-r1-24', number: 24, name: '腎臟系統感染' },
      { id: 'med-r1-25', number: 25, name: '腎衰竭 (AKI / CKD)' },
      { id: 'med-r1-26', number: 26, name: '透析治療' },
      { id: 'med-r1-27', number: 27, name: '酸鹼異常' },
      { id: 'med-r1-28', number: 28, name: '體液與電解質失衡' },
      { id: 'med-r1-29', number: 29, name: '葡萄糖代謝疾病 (DKA / HHS)' },
      { id: 'med-r1-30', number: 30, name: '常見內分泌異常' },
      { id: 'med-r1-31', number: 31, name: '嚴重營養不良' },
      { id: 'med-r1-32', number: 32, name: '呼吸系統感染' },
      { id: 'med-r1-33', number: 33, name: '急性和慢性呼吸道疾病' },
      { id: 'med-r1-34', number: 34, name: '肺栓塞' },
      { id: 'med-r1-35', number: 35, name: '胸部腫瘤' },
      { id: 'med-r1-36', number: 36, name: '慢性肉芽腫疾病' },
      { id: 'med-r1-37', number: 37, name: '淋巴系統異常' },
      { id: 'med-r1-38', number: 38, name: '造血系統惡性疾病' },
      { id: 'med-r1-39', number: 39, name: '成人呼吸窘迫症候群 (ARDS)' },
      { id: 'med-r1-40', number: 40, name: '多重器官衰竭 (MOF)' },
      { id: 'med-r1-41', number: 41, name: '臨終前的救護' },
      { id: 'med-r1-42', number: 42, name: '宣布病人死亡' },
      { id: 'med-r1-43', number: 43, name: '年長患者的精神狀態檢查' },
      { id: 'med-r1-44', number: 44, name: '年長患者之預立遺囑' },
      { id: 'med-r1-45', number: 45, name: '年長患者之沮喪處理' }
    ]
  },
  {
    id: 'surg-r1',
    title: '外科學 第一年',
    yearLevel: 'R1',
    durationDesc: '1 個月',
    items: [
      { id: 'surg-r1-1', number: 1, name: '急性腹痛之鑑別診斷' },
      { id: 'surg-r1-2', number: 2, name: '緊急手術患者術前照護原則' },
      { id: 'surg-r1-3', number: 3, name: '緊急手術患者術後照護原則' },
      { id: 'surg-r1-4', number: 4, name: '傷口評估與處置技巧' },
      { id: 'surg-r1-5', number: 5, name: '創傷包紮及縫合' },
      { id: 'surg-r1-6', number: 6, name: '疼痛控制' },
      { id: 'surg-r1-7', number: 7, name: '外科傷口記錄' },
      { id: 'surg-r1-8', number: 8, name: '闌尾炎' },
      { id: 'surg-r1-9', number: 9, name: '肝膽系統外科急症' },
      { id: 'surg-r1-10', number: 10, name: '腸胃系統外科急症' },
      { id: 'surg-r1-11', number: 11, name: '泌尿系統外科急症' },
      { id: 'surg-r1-12', number: 12, name: '心血管系統外科急症' }
    ]
  },
  {
    id: 'obgyn-r1',
    title: '婦產科 第一年',
    yearLevel: 'R1',
    durationDesc: '1 個月',
    items: [
      { id: 'obgyn-r1-1', number: 1, name: '婦科理學檢查' },
      { id: 'obgyn-r1-2', number: 2, name: '陰道分泌物' },
      { id: 'obgyn-r1-3', number: 3, name: '下腹疼痛' },
      { id: 'obgyn-r1-4', number: 4, name: '陰道出血之懷孕病患' },
      { id: 'obgyn-r1-5', number: 5, name: '陰道出血之未懷孕病患' },
      { id: 'obgyn-r1-6', number: 6, name: '經痛' },
      { id: 'obgyn-r1-7', number: 7, name: '泌尿生殖器官感染' },
      { id: 'obgyn-r1-8', number: 8, name: '性病 (STD)' },
      { id: 'obgyn-r1-9', number: 9, name: 'Toxic shock syndrome' },
      { id: 'obgyn-r1-10', number: 10, name: '新生兒急救 (NRP)' },
      { id: 'obgyn-r1-11', number: 11, name: '瞭解各種避孕方法' },
      { id: 'obgyn-r1-12', number: 12, name: '子宮外孕' },
      { id: 'obgyn-r1-13', number: 13, name: '前置胎盤' },
      { id: 'obgyn-r1-14', number: 14, name: '胎盤剝離' },
      { id: 'obgyn-r1-15', number: 15, name: '子癇症' },
      { id: 'obgyn-r1-16', number: 16, name: '子癇前症' },
      { id: 'obgyn-r1-17', number: 17, name: '正常產程各階段及其時間' },
      { id: 'obgyn-r1-18', number: 18, name: '計算 APGAR 分數' },
      { id: 'obgyn-r1-19', number: 19, name: '美國婦產科學院對名詞之定義：強姦、法定強姦、性騷擾與變態性侵害' },
      { id: 'obgyn-r1-20', number: 20, name: '性侵害受害者之處置' },
      { id: 'obgyn-r1-21', number: 21, name: '陰部潰瘍' },
      { id: 'obgyn-r1-22', number: 22, name: '卵巢扭轉' },
      { id: 'obgyn-r1-23', number: 23, name: '孕婦之外傷處置' },
      { id: 'obgyn-r1-24', number: 24, name: '瀕死孕婦剖腹產之適應症與方法' },
      { id: 'obgyn-r1-25', number: 25, name: '正常足月自然產之助產' },
      { id: 'obgyn-r1-26', number: 26, name: '妊娠劇吐患者' },
      { id: 'obgyn-r1-27', number: 27, name: '早期破水' },
      { id: 'obgyn-r1-28', number: 28, name: '早產' },
      { id: 'obgyn-r1-29', number: 29, name: '產程遲滯' },
      { id: 'obgyn-r1-30', number: 30, name: '胎兒窘迫' },
      { id: 'obgyn-r1-31', number: 31, name: '子宮破裂' },
      { id: 'obgyn-r1-32', number: 32, name: '臍帶脫垂' },
      { id: 'obgyn-r1-33', number: 33, name: '胎位不正' },
      { id: 'obgyn-r1-34', number: 34, name: '子宮無力' },
      { id: 'obgyn-r1-35', number: 35, name: '子宮倒翻' },
      { id: 'obgyn-r1-36', number: 36, name: '多胞胎' },
      { id: 'obgyn-r1-37', number: 37, name: '死產' },
      { id: 'obgyn-r1-38', number: 38, name: '產後併發子宮內殘留物' },
      { id: 'obgyn-r1-39', number: 39, name: '子宮內膜炎' },
      { id: 'obgyn-r1-40', number: 40, name: '乳腺炎' },
      { id: 'obgyn-r1-41', number: 41, name: '母嬰不同 RH 血型注意事項' },
      { id: 'obgyn-r1-42', number: 42, name: '水囊狀胎塊病患' },
      { id: 'obgyn-r1-43', number: 43, name: '流產之分類' }
    ]
  },
  {
    id: 'ent-r1',
    title: '耳鼻喉科 第一年',
    yearLevel: 'R1',
    durationDesc: '1 個月',
    items: [
      { id: 'ent-r1-1', number: 1, name: '鼻炎' },
      { id: 'ent-r1-2', number: 2, name: '耳炎' },
      { id: 'ent-r1-3', number: 3, name: '內耳迷路炎' },
      { id: 'ent-r1-4', number: 4, name: '竇炎' },
      { id: 'ent-r1-5', number: 5, name: '乳突炎' },
      { id: 'ent-r1-6', number: 6, name: '喉炎' },
      { id: 'ent-r1-7', number: 7, name: '咽頭炎' },
      { id: 'ent-r1-8', number: 8, name: '會厭炎' },
      { id: 'ent-r1-9', number: 9, name: '口腔炎' },
      { id: 'ent-r1-10', number: 10, name: '齒齦炎' },
      { id: 'ent-r1-11', number: 11, name: '耳膜病變及中耳穿孔' },
      { id: 'ent-r1-12', number: 12, name: '口咽膿瘡的切割及引流' },
      { id: 'ent-r1-13', number: 13, name: '牙科急症' },
      { id: 'ent-r1-14', number: 14, name: '下頜骨病變評估(骨折、脫臼)' },
      { id: 'ent-r1-15', number: 15, name: '頭、頸、臉及齒部外傷' },
      { id: 'ent-r1-16', number: 16, name: '唾液腺病變' },
      { id: 'ent-r1-17', number: 17, name: '移除耳鼻喉異物' },
      { id: 'ent-r1-18', number: 18, name: '直接、間接纖維光學的喉鏡檢查' },
      { id: 'ent-r1-19', number: 19, name: '外科呼吸道技術' },
      { id: 'ent-r1-20', number: 20, name: '顏面神經阻斷術' },
      { id: 'ent-r1-21', number: 21, name: '海綿體靜脈竇栓塞' },
      { id: 'ent-r1-22', number: 22, name: '口底之化膿性蜂窩組織炎 (Ludwig angina)' },
      { id: 'ent-r1-23', number: 23, name: '惡性耳炎' }
    ]
  },
  {
    id: 'oph-r1',
    title: '眼科學 第一年',
    yearLevel: 'R1',
    durationDesc: '1 個月',
    items: [
      { id: 'oph-r1-1', number: 1, name: '眼底異常之辨認' },
      { id: 'oph-r1-2', number: 2, name: '角膜異常之檢查' },
      { id: 'oph-r1-3', number: 3, name: '測量眼壓' },
      { id: 'oph-r1-4', number: 4, name: '眼科藥物了解' },
      { id: 'oph-r1-5', number: 5, name: '急性視力衰退' },
      { id: 'oph-r1-6', number: 6, name: '眼睛疼痛' },
      { id: 'oph-r1-7', number: 7, name: '紅眼之病患' },
      { id: 'oph-r1-8', number: 8, name: '眼部化學傷害' },
      { id: 'oph-r1-9', number: 9, name: '眼球與周圍組織之鈍挫傷' },
      { id: 'oph-r1-10', number: 10, name: '眼球與周圍組織之穿刺傷' },
      { id: 'oph-r1-11', number: 11, name: '眼部異物' },
      { id: 'oph-r1-12', number: 12, name: '急性青光眼' },
      { id: 'oph-r1-13', number: 13, name: '眼眶周圍蜂窩組織炎' },
      { id: 'oph-r1-14', number: 14, name: '眼角膜螢光染色' },
      { id: 'oph-r1-15', number: 15, name: '系統性疾病之眼部表徵' },
      { id: 'oph-r1-16', number: 16, name: '眼科緊急會診之適應症' }
    ]
  },
  {
    id: 'er-r2',
    title: '成人急診醫學 第二年 (創傷核心)',
    yearLevel: 'R2',
    durationDesc: '4 個月',
    items: [
      { id: 'er-r2-1', number: 1, name: '創傷患者的輸液救護' },
      { id: 'er-r2-2', number: 2, name: '創傷患者的呼吸道' },
      { id: 'er-r2-3', number: 3, name: '創傷患者的連續性照護' },
      { id: 'er-r2-4', number: 4, name: '口腔插管' },
      { id: 'er-r2-5', number: 5, name: '鼻腔插管' },
      { id: 'er-r2-6', number: 6, name: '靜脈切開術' },
      { id: 'er-r2-7', number: 7, name: '中央靜脈靜脈導管置入術 (CVC)' },
      { id: 'er-r2-8', number: 8, name: '周邊大口徑靜脈導管置入術' },
      { id: 'er-r2-9', number: 9, name: '動脈導管置入術 (A-line)' },
      { id: 'er-r2-10', number: 10, name: '胸廓造口術' },
      { id: 'er-r2-11', number: 11, name: '局部傷口探查術' },
      { id: 'er-r2-12', number: 12, name: '腹膜灌洗' },
      { id: 'er-r2-13', number: 13, name: '血管縫合術' },
      { id: 'er-r2-14', number: 14, name: '簡單裂傷修補' },
      { id: 'er-r2-15', number: 15, name: '複雜裂傷修補' },
      { id: 'er-r2-16', number: 16, name: '肢部骨折支架固定' },
      { id: 'er-r2-17', number: 17, name: '關節脫臼復位術及固定' },
      { id: 'er-r2-18', number: 18, name: '環狀杓骨氣切術' },
      { id: 'er-r2-19', number: 19, name: '韌帶修補術' },
      { id: 'er-r2-20', number: 20, name: '創傷患者的影像檢查' },
      { id: 'er-r2-21', number: 21, name: '創傷傷害機制對評估' },
      { id: 'er-r2-22', number: 22, name: 'Glasgow Coma Score (GCS)' },
      { id: 'er-r2-23', number: 23, name: '創傷患者身上使用脊椎板固定' },
      { id: 'er-r2-24', number: 24, name: '外傷患者肢部骨折' },
      { id: 'er-r2-25', number: 25, name: '外傷患者脫臼與半脫位傷害' },
      { id: 'er-r2-26', number: 26, name: '撕裂傷及扯拉撕脫傷' },
      { id: 'er-r2-27', number: 27, name: '高壓性射入傷害' },
      { id: 'er-r2-28', number: 28, name: '腔室症候群' },
      { id: 'er-r2-29', number: 29, name: '泌尿道傷害' },
      { id: 'er-r2-30', number: 30, name: '外傷患者止痛劑與鎮定劑的使用' },
      { id: 'er-r2-31', number: 31, name: '創傷患者抗生素的使用' },
      { id: 'er-r2-32', number: 32, name: '觀摩學習處理多重創傷患者' },
      { id: 'er-r2-33', number: 33, name: '老年創傷處理' },
      { id: 'er-r2-34', number: 34, name: '孕婦創傷' },
      { id: 'er-r2-35', number: 35, name: '脊椎創傷' },
      { id: 'er-r2-36', number: 36, name: '肌腱創傷' },
      { id: 'er-r2-37', number: 37, name: '截肢性創傷' },
      { id: 'er-r2-38', number: 38, name: '燒傷' },
      { id: 'er-r2-39', number: 39, name: '吸入性煙霧嗆傷' },
      { id: 'er-r2-40', number: 40, name: '外傷患者轉出到創傷中心之適應性' },
      { id: 'er-r2-41', number: 41, name: '顏面外傷' },
      { id: 'er-r2-42', number: 42, name: '頸部外傷' },
      { id: 'er-r2-43', number: 43, name: '胸部鈍傷穿刺傷' },
      { id: 'er-r2-44', number: 44, name: '腹部鈍傷及穿刺傷' },
      { id: 'er-r2-45', number: 45, name: '骨盆骨折' },
      { id: 'er-r2-46', number: 46, name: '骨科術語' },
      { id: 'er-r2-47', number: 47, name: '兒童骨骼之解剖學差異' },
      { id: 'er-r2-48', number: 48, name: '多重骨骼損傷患者治療之順序' },
      { id: 'er-r2-49', number: 49, name: '肌肉骨骼系統之發炎或感染症' },
      { id: 'er-r2-50', number: 50, name: '軟組織內異物' },
      { id: 'er-r2-51', number: 51, name: '人咬傷或動物咬傷' },
      { id: 'er-r2-52', number: 52, name: '神經阻斷式局部麻醉 (hematoma/Bier blocks, 橈/尺/正中/腋/後脛/腓腸神經)' },
      { id: 'er-r2-53', number: 53, name: '下背痛病患之鑑別診斷' },
      { id: 'er-r2-54', number: 54, name: '過度使用症候群' },
      { id: 'er-r2-55', number: 55, name: '評估與保存截肢傷之殘肢' },
      { id: 'er-r2-56', number: 56, name: '關節損傷及其治療' },
      { id: 'er-r2-57', number: 57, name: '穿刺性軟組織傷害' },
      { id: 'er-r2-58', number: 58, name: '壓砸傷 (Crush injury)' },
      { id: 'er-r2-59', number: 59, name: '救護車與空中轉運服務系統' }
    ]
  },
  {
    id: 'neuro-r2',
    title: '神經科 第二年',
    yearLevel: 'R2',
    durationDesc: '1 個月',
    items: [
      { id: 'neuro-r2-1', number: 1, name: '神經解剖學' },
      { id: 'neuro-r2-2', number: 2, name: '缺血性中風' },
      { id: 'neuro-r2-3', number: 3, name: '癲癇發作' },
      { id: 'neuro-r2-4', number: 4, name: '頭痛' },
      { id: 'neuro-r2-5', number: 5, name: '脊椎神經壓擠' },
      { id: 'neuro-r2-6', number: 6, name: 'CSF 分流障礙' },
      { id: 'neuro-r2-7', number: 7, name: '神經感染' },
      { id: 'neuro-r2-8', number: 8, name: '神經炎症性的狀況' },
      { id: 'neuro-r2-9', number: 9, name: '頭蓋骨的神經疾病' },
      { id: 'neuro-r2-10', number: 10, name: '髓鞘脫失' },
      { id: 'neuro-r2-11', number: 11, name: '神經肌肉的疾病' },
      { id: 'neuro-r2-12', number: 12, name: 'Pseudotumor cerebri' },
      { id: 'neuro-r2-13', number: 13, name: '腦水腫' },
      { id: 'neuro-r2-14', number: 14, name: '末梢神經病變' },
      { id: 'neuro-r2-15', number: 15, name: '外傷造成之中樞神經系統傷害' },
      { id: 'neuro-r2-16', number: 16, name: '脊椎脫位、半脫位、斷裂' },
      { id: 'neuro-r2-17', number: 17, name: '緊急手術處理之腦血管及脊椎疾病' },
      { id: 'neuro-r2-18', number: 18, name: '慢性與難治性頭痛' },
      { id: 'neuro-r2-19', number: 19, name: '神經影像學 (Brain CT / MRI)' },
      { id: 'neuro-r2-20', number: 20, name: '腰椎穿刺' },
      { id: 'neuro-r2-21', number: 21, name: '脊椎骨的固定技術' },
      { id: 'neuro-r2-22', number: 22, name: '脊椎壓迫之辨識與處置' },
      { id: 'neuro-r2-23', number: 23, name: '顱內壓的控制技巧 (ICP management)' }
    ]
  },
  {
    id: 'disaster-r2',
    title: '災難醫學 第二年',
    yearLevel: 'R2',
    durationDesc: '分散式',
    items: [
      { id: 'disaster-r2-1', number: 1, name: '災難應變之概念與原則' },
      { id: 'disaster-r2-2', number: 2, name: '國家防災醫療體系' },
      { id: 'disaster-r2-3', number: 3, name: '災難醫療救援隊（DMAT）簡介' },
      { id: 'disaster-r2-4', number: 4, name: '現場指揮系統（ICS）之認識' },
      { id: 'disaster-r2-5', number: 5, name: '災難與大量傷患醫療基本原則 (MCI)' },
      { id: 'disaster-r2-6', number: 6, name: '後勤與物資管理的基本原則' },
      { id: 'disaster-r2-7', number: 7, name: '醫療需求評估' },
      { id: 'disaster-r2-8', number: 8, name: '災難與公共衛生衝擊' },
      { id: 'disaster-r2-9', number: 9, name: '災民的疏散與難民營的建立' },
      { id: 'disaster-r2-10', number: 10, name: '爆炸傷害' },
      { id: 'disaster-r2-11', number: 11, name: '壓碎症候群' },
      { id: 'disaster-r2-12', number: 12, name: '腔室症候群' },
      { id: 'disaster-r2-13', number: 13, name: '創傷性窒息' },
      { id: 'disaster-r2-14', number: 14, name: '微粒吸入傷害' },
      { id: 'disaster-r2-15', number: 15, name: '創傷後症候群 (PTSD)' },
      { id: 'disaster-r2-16', number: 16, name: '基本防護裝備及除污方法介紹' },
      { id: 'disaster-r2-17', number: 17, name: '中毒症候群（Toxidromes）' },
      { id: 'disaster-r2-18', number: 18, name: '生物性災難' },
      { id: 'disaster-r2-19', number: 19, name: '輻射性災難' },
      { id: 'disaster-r2-20', number: 20, name: '災難應變演習與桌上模擬演練' },
      { id: 'disaster-r2-21', number: 21, name: '災難醫療特殊醫療技術' }
    ],
    activities: [
      { name: '大量傷患演習' },
      { name: '野外災難醫療' },
      { name: '醫院緊急應變演習' },
      { name: '災難醫療桌上模擬演練' },
      { name: '核生化演習' },
      { name: '大型活動救護支援' }
    ]
  },
  {
    id: 'rad-r2',
    title: '影像醫學 第二年',
    yearLevel: 'R2',
    durationDesc: '1 個月',
    items: [
      { id: 'rad-r2-1', number: 'A1', name: 'CNS: brain infarction (CT)' },
      { id: 'rad-r2-2', number: 'A2', name: 'CNS: Intracranial hemorrhage (CT)' },
      { id: 'rad-r2-3', number: 'A3', name: 'CNS: herniation signs (CT)' },
      { id: 'rad-r2-4', number: 'A4', name: 'CNS: space occupying lesions (CT)' },
      { id: 'rad-r2-5', number: 'A5', name: 'CNS: Cervical spine injury (X-ray)' },
      { id: 'rad-r2-6', number: 'B1', name: 'Chest: Pneumothorax (X-ray)' },
      { id: 'rad-r2-7', number: 'B2', name: 'Chest: Pneumomediastinum (X-ray)' },
      { id: 'rad-r2-8', number: 'B3', name: 'Chest: Pleural effusion (X-ray)' },
      { id: 'rad-r2-9', number: 'B4', name: 'Chest: Pulmonary infection (X-ray)' },
      { id: 'rad-r2-10', number: 'B5', name: 'Chest: Pulmonary edema (X-ray)' },
      { id: 'rad-r2-11', number: 'C1', name: 'Cardiovascular: Pulmonary embolism (X-ray, CT)' },
      { id: 'rad-r2-12', number: 'C2', name: 'Cardiovascular: Aortic dissection (X-ray, CT)' },
      { id: 'rad-r2-13', number: 'C3', name: 'Cardiovascular: Aortic rupture (X-ray, CT)' },
      { id: 'rad-r2-14', number: 'C4', name: 'Cardiovascular: Pericardial effusion (X-ray)' },
      { id: 'rad-r2-15', number: 'D1', name: 'Abdomen: Diaphragmatic rupture (X-ray, CT)' },
      { id: 'rad-r2-16', number: 'D2', name: 'Abdomen: Pneumoperitoneum (X-ray, CT)' },
      { id: 'rad-r2-17', number: 'D3', name: 'Abdomen: Small bowel obstruction (X-ray, CT)' },
      { id: 'rad-r2-18', number: 'D4', name: 'Abdomen: Cecal and sigmoid volvulus (X-ray, CT)' },
      { id: 'rad-r2-19', number: 'D5', name: 'Abdomen: Large bowel obstruction (X-ray, CT)' },
      { id: 'rad-r2-20', number: 'D6', name: 'Abdomen: Biliary tract obstruction (CT)' },
      { id: 'rad-r2-21', number: 'D7', name: 'Abdomen: Appendicitis (CT)' },
      { id: 'rad-r2-22', number: 'D8', name: 'Abdomen: Urolithiasis (X-ray, CT)' },
      { id: 'rad-r2-23', number: 'E1', name: 'Musculoskeletal: Fr. with extension into joint (X-ray)' },
      { id: 'rad-r2-24', number: 'E2', name: 'Musculoskeletal: Elbow joint effusion (X-ray, MRI)' },
      { id: 'rad-r2-25', number: 'E3', name: 'Musculoskeletal: Shoulder dislocation (X-ray)' },
      { id: 'rad-r2-26', number: 'F1', name: 'Others: Misplaced lines and tubes' },
      { id: 'rad-r2-27', number: 'F2', name: 'Others: Child abuse' }
    ]
  },
  {
    id: 'icu-r2',
    title: '重症醫學 第二年',
    yearLevel: 'R2',
    durationDesc: '2 個月',
    items: [
      { id: 'icu-r2-1', number: 1, name: 'swan ganz 導管置放' },
      { id: 'icu-r2-2', number: 2, name: '經皮節律器置放' },
      { id: 'icu-r2-3', number: 3, name: '動脈管置放 (A-line)' },
      { id: 'icu-r2-4', number: 4, name: '心電圖監測器之使用及判讀' },
      { id: 'icu-r2-5', number: 5, name: '心臟輸出(cardiac outputs) 分析' },
      { id: 'icu-r2-6', number: 6, name: '血液動力監測分析' },
      { id: 'icu-r2-7', number: 7, name: '動脈氣體分析 (ABG)' },
      { id: 'icu-r2-8', number: 8, name: '血氧監測器之使用及判讀' },
      { id: 'icu-r2-9', number: 9, name: '潮氣末二氧化碳監測器之使用 (EtCO2)' },
      { id: 'icu-r2-10', number: 10, name: '呼吸器之使用 (Ventilator mode)' },
      { id: 'icu-r2-11', number: 11, name: '休克 (Shock resuscitation)' },
      { id: 'icu-r2-12', number: 12, name: '心臟衰竭' },
      { id: 'icu-r2-13', number: 13, name: '敗血症' },
      { id: 'icu-r2-14', number: 14, name: '創傷重症' },
      { id: 'icu-r2-15', number: 15, name: '毒物重症' },
      { id: 'icu-r2-16', number: 16, name: '呼吸衰竭' },
      { id: 'icu-r2-17', number: 17, name: '肝衰竭' },
      { id: 'icu-r2-18', number: 18, name: '腎衰竭' },
      { id: 'icu-r2-19', number: 19, name: '體液及電解質不平衡' },
      { id: 'icu-r2-20', number: 20, name: '重症病人的倫理及法律原則' },
      { id: 'icu-r2-21', number: 21, name: '心臟停止相關治療' },
      { id: 'icu-r2-22', number: 22, name: '袋瓣罩換氣 (BVM)' },
      { id: 'icu-r2-23', number: 23, name: '口對口換氣' },
      { id: 'icu-r2-24', number: 24, name: '氣管插管' },
      { id: 'icu-r2-25', number: 25, name: '環甲膜切開術' },
      { id: 'icu-r2-26', number: 26, name: '心律不整之治療及去顫' },
      { id: 'icu-r2-27', number: 27, name: '“不作急救”(DNR) 醫囑相關議題' },
      { id: 'icu-r2-28', number: 28, name: '生前遺囑、及生前意願 (Advance directives)' },
      { id: 'icu-r2-29', number: 29, name: '腦死的標準' }
    ]
  },
  {
    id: 'er-r3',
    title: '成人急診醫學 第三年 (環境/特殊急症)',
    yearLevel: 'R3',
    durationDesc: '4 個月',
    items: [
      { id: 'er-r3-1', number: 1, name: '燒燙傷患者的照護' },
      { id: 'er-r3-2', number: 2, name: '使用 Lund-Browder chart' },
      { id: 'er-r3-3', number: 3, name: '燒燙傷患者的流質餵食' },
      { id: 'er-r3-4', number: 4, name: '燒燙傷患者住院的標準' },
      { id: 'er-r3-5', number: 5, name: '鹽酸灼傷' },
      { id: 'er-r3-6', number: 6, name: '硫酸灼傷' },
      { id: 'er-r3-7', number: 7, name: '氫氟酸灼傷 (HF burn)' },
      { id: 'er-r3-8', number: 8, name: '鹼性物質灼傷' },
      { id: 'er-r3-9', number: 9, name: '白磷灼傷' },
      { id: 'er-r3-10', number: 10, name: '急性化學物質傷害' },
      { id: 'er-r3-11', number: 11, name: '電擊傷害' },
      { id: 'er-r3-12', number: 12, name: '雷擊傷害' },
      { id: 'er-r3-13', number: 13, name: '體溫過低 (Hypothermia)' },
      { id: 'er-r3-14', number: 14, name: '凍瘡及低溫傷害' },
      { id: 'er-r3-15', number: 15, name: '熱中暑 (Heat stroke)' },
      { id: 'er-r3-16', number: 16, name: '熱痙攣及其他熱急症' },
      { id: 'er-r3-17', number: 17, name: '溺水 (Drowning)' },
      { id: 'er-r3-18', number: 18, name: '高山症 (AMS / HAPE / HACE)' },
      { id: 'er-r3-19', number: 19, name: '氣體栓塞及減壓病症 (Decompression sickness)' },
      { id: 'er-r3-20', number: 20, name: '高壓氧治療的適應症 (HBO)' },
      { id: 'er-r3-21', number: 21, name: '潛水意外' },
      { id: 'er-r3-22', number: 22, name: '利用機能估計去評估年長患者日常生活活動力 (ADL/IADL)' },
      { id: 'er-r3-23', number: 23, name: '癡呆與精神錯亂的年長患者疾病的診斷與判定' },
      { id: 'er-r3-24', number: 24, name: '察覺並治療受虐的年長患者 (Elder abuse)' },
      { id: 'er-r3-25', number: 25, name: '疾病在老人患者的表現差異' }
    ]
  },
  {
    id: 'peds-er-r3',
    title: '兒童急診醫學 第三年',
    yearLevel: 'R3',
    durationDesc: '1 個月',
    items: [
      { id: 'peds-er-r3-1', number: 1, name: '會厭炎 (Epiglottitis)' },
      { id: 'peds-er-r3-2', number: 2, name: '受虐兒童診斷及處理流程' },
      { id: 'peds-er-r3-3', number: 3, name: '兒童瘀斑鑑別' },
      { id: 'peds-er-r3-4', number: 4, name: '兒科外傷' },
      { id: 'peds-er-r3-5', number: 5, name: '兒科中各種燒傷型態' },
      { id: 'peds-er-r3-6', number: 6, name: '上呼吸道異物' },
      { id: 'peds-er-r3-7', number: 7, name: '下呼吸道異物' },
      { id: 'peds-er-r3-8', number: 8, name: '包莖、箝閉包莖、龜頭炎' },
      { id: 'peds-er-r3-9', number: 9, name: '睪丸扭轉' },
      { id: 'peds-er-r3-10', number: 10, name: '副睪炎' },
      { id: 'peds-er-r3-11', number: 11, name: '跛行兒童患者' },
      { id: 'peds-er-r3-12', number: 12, name: '兒科脫臼關節復位' },
      { id: 'peds-er-r3-13', number: 13, name: '箝塞性鼠奚部疝氣 (Incarcerated hernia)' }
    ]
  },
  {
    id: 'psych-r3',
    title: '精神科 第三年',
    yearLevel: 'R3',
    durationDesc: '1 個月',
    items: [
      { id: 'psych-r3-1', number: 1, name: '急性精神病患之對談' },
      { id: 'psych-r3-2', number: 2, name: '精神狀態評估 (Mental Status Examination, MSE)' },
      { id: 'psych-r3-3', number: 3, name: '緊急會診精神科' },
      { id: 'psych-r3-4', number: 4, name: '常規會診精神科' },
      { id: 'psych-r3-5', number: 5, name: '評估自殺危險因子' },
      { id: 'psych-r3-6', number: 6, name: '暴力傾向病人之處理' },
      { id: 'psych-r3-7', number: 7, name: '精神疾病 (思想/情緒/焦慮/心身/人格障礙)' },
      { id: 'psych-r3-8', number: 8, name: '精神科治療用藥' },
      { id: 'psych-r3-9', number: 9, name: '精神病患藥理性拘束' },
      { id: 'psych-r3-10', number: 10, name: '精神病患物理性拘束' },
      { id: 'psych-r3-11', number: 11, name: '老年人之痴呆及偽痴呆' },
      { id: 'psych-r3-12', number: 12, name: 'Delirium 之器質性病因' },
      { id: 'psych-r3-13', number: 13, name: '器質性精神異常' },
      { id: 'psych-r3-14', number: 14, name: '功能性精神異常' },
      { id: 'psych-r3-15', number: 15, name: '中毒與戒斷症候群' },
      { id: 'psych-r3-16', number: 16, name: '酒精濫用' },
      { id: 'psych-r3-17', number: 17, name: '藥物濫用' },
      { id: 'psych-r3-18', number: 18, name: '人格障礙的患者互動 (反社會/邊緣/強迫/依賴/戲劇/被動攻擊)' }
    ]
  },
  {
    id: 'ems-r3',
    title: '緊急救護體系 (EMS) 第三年',
    yearLevel: 'R3',
    durationDesc: '1 個月',
    items: [
      { id: 'ems-r3-1', number: 1, name: '縣市地區 EMS 的組成結構' },
      { id: 'ems-r3-2', number: 2, name: '國家性 EMS 的組成結構' },
      { id: 'ems-r3-3', number: 3, name: 'EMS 各種通訊設備' },
      { id: 'ems-r3-4', number: 4, name: 'EMS 各層級救護技術員技術水準' },
      { id: 'ems-r3-5', number: 5, name: '提供各層級救護技術員教育' },
      { id: 'ems-r3-6', number: 6, name: 'EMS 相關之法律責任' },
      { id: 'ems-r3-7', number: 7, name: '參與 EMS 持續的品質改善 (CQI)' },
      { id: 'ems-r3-8', number: 8, name: '參與地面及空中醫療運輸系統' },
      { id: 'ems-r3-9', number: 9, name: '到院前緊急醫療救護標準作業 (SOP)' },
      { id: 'ems-r3-10', number: 10, name: '了解地面及空中救護的適當運作' },
      { id: 'ems-r3-11', number: 11, name: '討論縣、市、及國家各層面災難處置、通報、反應、及醫療照護的程序' },
      { id: 'ems-r3-12', number: 12, name: '討論 EMS 系統中醫療管制的重大性及方法 (MCC)' },
      { id: 'ems-r3-13', number: 13, name: '探討到院前救護常遭遇之環境、毒物、及生物危害和預防受傷的技術' }
    ]
  },
  {
    id: 'echo-r3',
    title: '超音波 第三年',
    yearLevel: 'R3',
    durationDesc: '分散式',
    items: [
      { id: 'echo-r3-1', number: 1, name: '超音波基本原理 (Basic physics)' },
      { id: 'echo-r3-2', number: 2, name: '創傷超音波 (FAST/E-FAST Trauma)' },
      { id: 'echo-r3-3', number: 3, name: '腹部超音波 (Hepatobiliary)' },
      { id: 'echo-r3-4', number: 4, name: '泌尿系統超音波 (Urinary system)' },
      { id: 'echo-r3-5', number: 5, name: '血管超音波-主動脈 (Aorta)' },
      { id: 'echo-r3-6', number: 6, name: '血管超音波-深層靜脈 (Vein DVT)' },
      { id: 'echo-r3-7', number: 7, name: '心臟超音波 (Echocardiography / FOCUS)' },
      { id: 'echo-r3-8', number: 8, name: '胸部超音波 (Thoracic / Lung US)' },
      { id: 'echo-r3-9', number: 9, name: '超音波輔助執行技術 (Procedure guidance)' },
      { id: 'echo-r3-10', number: 10, name: '產科超音波 (Pregnancy)' },
      { id: 'echo-r3-11', number: 11, name: '眼睛超音波 (Ocular)' },
      { id: 'echo-r3-12', number: 12, name: '軟組織超音波 (Soft tissue)' },
      { id: 'echo-r3-13', number: 13, name: '超音波案例討論會 (Case discussion)' }
    ]
  },
  {
    id: 'tox-r3',
    title: '毒物學 第三年',
    yearLevel: 'R3',
    durationDesc: '1 個月',
    items: [
      { id: 'tox-r3-1', number: 1, name: '胃灌洗及處方活性碳' },
      { id: 'tox-r3-2', number: 2, name: '皮膚與眼睛之去污' },
      { id: 'tox-r3-3', number: 3, name: '可得之解毒劑與抗毒血清相關' },
      { id: 'tox-r3-4', number: 4, name: '各種戒斷症候群' },
      { id: 'tox-r3-5', number: 5, name: '可血液透析或灌洗移除之毒物' },
      { id: 'tox-r3-6', number: 6, name: '有毒素之植物' },
      { id: 'tox-r3-7', number: 7, name: '常見之居家毒物 (如殺蟲劑、清潔劑)' },
      { id: 'tox-r3-8', number: 8, name: '各種藥物中毒: APAP, Amphetamine, Anticholinergics, Salicylates, Barbiturates, BZD, Beta-blocker, CCB, CO, Corrosives, Cocaine, Cyanide, TCA, Digoxin, Ethanol, Ethylene glycol, INH, Iron, Lithium, Methanol, Opioids, Organophosphates, Anticonvulsants, Theophylline' },
      { id: 'tox-r3-9', number: 9, name: '有毒素之動物 (蛇咬傷、蜂螫、海洋毒素)' }
    ]
  },
  {
    id: 'icu-r3',
    title: '重症醫學 第三年',
    yearLevel: 'R3',
    durationDesc: '2 個月',
    items: [
      { id: 'icu-r3-1', number: 1, name: '心跳停止後照護 (PCAC / TTM)' },
      { id: 'icu-r3-2', number: 2, name: '目標體溫管理/低體溫療法' },
      { id: 'icu-r3-3', number: 3, name: '急診器官捐贈之醫、法、倫' },
      { id: 'icu-r3-4', number: 4, name: '腦死病人之判定' },
      { id: 'icu-r3-5', number: 5, name: '危急病人急救與整合運用醫院之支援服務' },
      { id: 'icu-r3-6', number: 6, name: '多工能力運作急診 (Emergency leadership)' }
    ]
  },
  {
    id: 'er-r4',
    title: '成人急診醫學 第四年 (行政、教學與品質)',
    yearLevel: 'R4',
    durationDesc: '3 個月',
    items: [
      { id: 'er-r4-1', number: 1, name: '急診醫學相關概念: 專科證照、生涯規劃、人員招募、預算管控、醫療財務、管理式醫療、人員管理、公關、市場分析、醫院管理、操作管理、合約及工作計劃表' },
      { id: 'er-r4-2', number: 2, name: '急診部門成本管控' },
      { id: 'er-r4-3', number: 3, name: '醫院評鑑' },
      { id: 'er-r4-4', number: 4, name: '醫院與急診部門的行政架構' },
      { id: 'er-r4-5', number: 5, name: '學術論文之研究與發表' }
    ]
  },
  {
    id: 'peds-er-r4',
    title: '兒童急診醫學 第四年',
    yearLevel: 'R4',
    durationDesc: '1 個月',
    items: [
      { id: 'peds-er-r4-1', number: 1, name: '嬰兒猝死症候群 (SIDS)' },
      { id: 'peds-er-r4-2', number: 2, name: '新生兒休克' },
      { id: 'peds-er-r4-3', number: 3, name: '新生兒復甦 (NRP)' },
      { id: 'peds-er-r4-4', number: 4, name: '新生兒氣管內管插管' },
      { id: 'peds-er-r4-5', number: 5, name: '新生兒骨針放置' },
      { id: 'peds-er-r4-6', number: 6, name: '兒童常見中毒' },
      { id: 'peds-er-r4-7', number: 7, name: '沉浸或溺斃兒童' },
      { id: 'peds-er-r4-8', number: 8, name: '兒童吞入異物' },
      { id: 'peds-er-r4-9', number: 9, name: '青少年自殺' },
      { id: 'peds-er-r4-10', number: 10, name: '兒童意識狀態改變' }
    ]
  }
];

// 工作須知重點規定
export const CLINICAL_WORK_RULES = {
  shiftTransfer: {
    title: '看診與交班規範 (Handover SOP)',
    schedule: '上下午 07:30 各有一次交班，由主治醫師親自主持，逐一檢視病人。',
    sixElements: [
      '1. 基本資料 (Demographics)',
      '2. 主訴 (Chief Complaint)',
      '3. 過去病史 (Past Medical History)',
      '4. 重要檢查發現 (Lab & Imaging findings)',
      '5. 處置與現況 (Treatment & Current condition)',
      '6. 未來動向 (Disposition & Plan)'
    ]
  },
  consultation: {
    title: '會診與收住院注意事項',
    rules: [
      '聯絡當科值班醫師說明病情，必要時使用公務機傳送相關影像與檢驗數據。',
      '務必確認當科醫師是否會至急診評估，且在當科醫師評估後於 HIS 系統開立會診單。',
      '收住院：判定收治科別並經當科同意後，開立住院同意書及通知單。',
      '跨科爭議：會診大於二個次專科均無法收治時，聯絡當日大內科總醫師判科；若跨各專科(如內科合併外科或婦科)，聯絡李嘉龍醫療副院長判科收治。'
    ]
  },
  teachingActivities: {
    title: '參與教學、會議與評量規範',
    rules: [
      '晨會教學：每週一、三、五早上 07:40~09:30 晨會教學（急診病例討論、死亡與OHCA討論、EKG教學、EBM文獻討論、法倫討論、聯合影像、超音波、三日內返診等）。當日白班住院醫師必須參與。',
      '每月晨會報告：除外放至他科之月份外，每位住院醫師每月需負責準備一次晨會報告。',
      '年度專科模擬考：每年第二季辦理住院醫師評量，參照急診專科考試分為筆試及口試，全員全程參加。',
      '急救證書規定：升任 R3 以前，均須取得效期內 ACLS、APLS/PALS、AILS 及 ETTC/ATLS 證書。'
    ]
  }
};
