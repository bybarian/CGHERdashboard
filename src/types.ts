export type RLevel = 'R1' | 'R2' | 'R3' | 'R4';

export interface Student {
  id: string;
  name: string;
  admissionYear: number; // 112, 113, 114, 115
  rLevel: RLevel;
  xp: number;
  level: number;
  schedule: string[]; // 12 elements (Jan-Dec), containing department IDs
  rotationStatus: Record<number, SubmissionStatus>; // key: month index (1-12)
  courseStatus: Record<string, SubmissionStatus>;   // key: courseId
  homeworkStatus: Record<string, SubmissionStatus>; // key: homeworkId
  rotationRolled?: Record<number, boolean>;          // key: month index (1-12)
  homeworkRolled?: Record<string, boolean>;          // key: homeworkId
  avatar?: string;
  currentOngoingMonth?: number;
}

export interface SubmissionStatus {
  completed: boolean;
  notes: string;
  fileUrl: string; // Base64 or mock placeholder URL
  fileName: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt?: string;
}

export type CourseCategory = 'ultrasound' | 'toxicology' | 'disaster' | 'ems' | 'triage' | 'assessment' | 'geriatrics';

export interface Course {
  id: string;
  name: string;
  category: CourseCategory;
  description: string;
  applicableFrom: number; // e.g., 112 (disaster), 115 (geriatrics)
  suggestedYear: RLevel | 'Any';
}

export interface Homework {
  id: string;
  title: string;
  month: number; // 1 to 12
  rLevel: RLevel;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  fullName: string;
  icon: string;
  description: string;
  tasks: string[];
}

export interface TeacherFeedback {
  id: string;
  studentId: string;
  itemName: string; // e.g., "1月 成人急診", "基礎超音波課程", "R1 1月 作業"
  itemType: 'rotation' | 'course' | 'homework';
  itemId: string; // month number, courseId, or homeworkId
  status: 'approved' | 'rejected';
  feedback: string;
  timestamp: string;
}

export const DEPARTMENTS: Record<string, Department> = {
  'adult-er': {
    id: 'adult-er',
    name: '成人急診',
    fullName: '成人急診 (Adult ER)',
    icon: 'User',
    description: '學習檢傷分類、基礎急症處置、內外科急症認定。開始練習看急救室 (R room) 病人及全區掌控 (Flow control)。',
    tasks: ['學習檢傷分類', '基礎急症處置', '內外科急症認定', '練習看急救室 (R room) 病人', '全區掌控 (Flow control)']
  },
  'neuro': {
    id: 'neuro',
    name: '神經內科',
    fullName: '神經內科 (Neurology)',
    icon: 'Brain',
    description: '腦中風評估 (NIHSS)、神經學檢查 (NE)。',
    tasks: ['腦中風評估 (NIHSS)', '神經學檢查 (NE)']
  },
  'peds': {
    id: 'peds',
    name: '兒科',
    fullName: '兒科 (Pediatrics)',
    icon: 'Baby',
    description: '外訓 2 個月，學習小兒發燒、腸胃炎處置。',
    tasks: ['小兒發燒評估與處置', '小兒腸胃炎脫水處置', '兒科常用藥物劑量計算']
  },
  'obgyn': {
    id: 'obgyn',
    name: '婦產科',
    fullName: '婦產科 (OB/GYN)',
    icon: 'Venus',
    description: '跟診或會診訓練，學習內診、產急處置。',
    tasks: ['婦產科跟診與急照會診訓練', '學習陰道內診與鴨嘴鏡操作', '產科急症處置']
  },
  'oph': {
    id: 'oph',
    name: '眼科',
    fullName: '眼科 (Ophthalmology)',
    icon: 'Eye',
    description: '裂隙燈操作、眼底鏡、異物移除。',
    tasks: ['裂隙燈 (Slit Lamp) 操作', '眼底鏡檢查', '角膜異物移除']
  },
  'ent': {
    id: 'ent',
    name: '耳鼻喉科',
    fullName: '耳鼻喉科 (ENT)',
    icon: 'Ear',
    description: '鼻填塞、異物夾除、氣切管更換。',
    tasks: ['前鼻孔與後鼻孔鼻填塞止血', '耳鼻喉異物夾除', '氣切管 (Tracheostomy) 更換']
  },
  'ems': {
    id: 'ems',
    name: '緊急救護',
    fullName: '緊急救護 (EMS)',
    icon: 'Ambulance',
    description: '消防隊實習（出勤/派遣/案例討論）。完成救護出勤、派遣及討論。',
    tasks: ['消防隊實習救護出勤 (4件)', '救護派遣實習 (2件)', '救護案例討論 (1件)']
  },
  'psych': {
    id: 'psych',
    name: '精神科',
    fullName: '精神科 (Psychiatry)',
    icon: 'Smile',
    description: '暴力病人處置、自殺評估、強制就醫流程。',
    tasks: ['暴力病人處置與保護約束', '自殺風險評估', '強制就醫與通報流程']
  },
  'icu': {
    id: 'icu',
    name: '重症醫學',
    fullName: '重症醫學 (ICU)',
    icon: 'Activity',
    description: '內科加護病房，學習呼吸器設定、休克處置。累積滿衛福部要求之重症月數。',
    tasks: ['呼吸器參數設定與調整', '休克病人處力與強心劑使用', '多重器官衰竭與重症加護邏輯']
  },
  'echo': {
    id: 'echo',
    name: '超音波科',
    fullName: '超音波 (Ultrasound)',
    icon: 'AudioLines',
    description: '包月訓練。至 GI room 或 2D echo室，大量累積 Logbook 案例。',
    tasks: ['累積 8 大類超音波案例各 10 例', '精熟心臟與外傷焦點式超音波 (FOCUS)', 'VS 簽章與病例回顧']
  },
  'elective': {
    id: 'elective',
    name: '自選科',
    fullName: '自選科 (Elective)',
    icon: 'Sparkles',
    description: '2 個月 (如麻醉/皮膚/骨科/影像)，後半月需回急診值班。',
    tasks: ['麻醉科插管與鎮靜實習', '骨科石膏固定與關節復位', '影像科 X-ray/CT 判讀']
  },
  'disaster': {
    id: 'disaster',
    name: '災難醫學',
    fullName: '災難醫學 (Disaster)',
    icon: 'CloudLightning',
    description: '參與大型演習、指揮系統 (ICS)。具備特殊中毒與災難處理能力。',
    tasks: ['參與大型災難演習 (3場)', '理解事故指揮系統 (ICS)', '檢傷分類 (START) 實務']
  },
  'toxicology': {
    id: 'toxicology',
    name: '毒物科',
    fullName: '毒物科 (Toxicology)',
    icon: 'Skull',
    description: '照顧中毒個案、參與毒物討論會、撰寫報告。累積照顧 12 例個案。',
    tasks: ['照顧並報告中毒個案', '參與毒物個案討論會', '撰寫中毒個案報告']
  },
  'remote': {
    id: 'remote',
    name: '偏遠地區',
    fullName: '偏遠地區 (Remote)',
    icon: 'Mountain',
    description: '綁年休。在資源有限環境下獨立處置與轉診。',
    tasks: ['偏鄉醫療獨立處置', '緊急轉診綠色通道連繫', '資源受限醫療決策']
  },
  'admin': {
    id: 'admin',
    name: '急診總醫師',
    fullName: '急診總醫師 (Admin/Teaching)',
    icon: 'Crown',
    description: '排班、處理行政客訴、安排教學活動、指導學弟妹。',
    tasks: ['急診排班與人力調配', '行政客訴與衝突危機處理', '安排學術晨會與教學活動']
  },
  'annual-leave': {
    id: 'annual-leave',
    name: '年休',
    fullName: '年休 (Annual Leave)',
    icon: 'Calendar',
    description: '住院醫師年度特休假、年休假。',
    tasks: ['完成休假期間職務代理交代', '妥善安排個人特休假規劃']
  },
  'not-started': {
    id: 'not-started',
    name: '尚未開始訓練',
    fullName: '尚未開始訓練 (Not Started)',
    icon: 'Clock',
    description: '該月份尚未正式進入急診住院醫師常規輪訓階段。',
    tasks: ['準備新科別報到事宜', '預先熟讀該科別訓練核心指標']
  },
  'completed-training': {
    id: 'completed-training',
    name: '完訓',
    fullName: '完訓 (Completed Training)',
    icon: 'Trophy',
    description: '已順利完成全部急診住院醫師專業訓練，具備專科醫師報考資格。',
    tasks: ['完成訓練證明書簽核與核章', '登錄醫學會專科醫師甄審系統']
  }
};

export const COURSES: Course[] = [
  // Ultrasound
  {
    id: 'echo-basic',
    name: '基礎超音波課程',
    category: 'ultrasound',
    description: '若 PGY 未完成需補上，學會認證。可委由訓練醫院辦理，但須經學會認證。',
    applicableFrom: 0,
    suggestedYear: 'R1'
  },
  {
    id: 'echo-adv',
    name: '進階超音波課程',
    category: 'ultrasound',
    description: '學會主辦。建議在 Echo 包月前完成。',
    applicableFrom: 0,
    suggestedYear: 'R2'
  },
  {
    id: 'echo-logbook',
    name: '超音波案例 Logbook (80例)',
    category: 'ultrasound',
    description: '8大類 (主動脈評估、心包膜評估、外傷評估、肝膽急症、產科評估、泌尿道評估、深部靜脈栓塞評估、US-assisted paracentesis/thoracentesis) 各 10 例，需 VS 簽章。',
    applicableFrom: 0,
    suggestedYear: 'R2'
  },
  // Toxicology
  {
    id: 'tox-report',
    name: '訓練醫院或學術研討會中報告中毒個案',
    category: 'toxicology',
    description: '於院內晨會或急診學會發表至少一次中毒個案報告。',
    applicableFrom: 0,
    suggestedYear: 'R3'
  },
  {
    id: 'tox-course',
    name: '參加毒化災訓練課程',
    category: 'toxicology',
    description: '急診醫學會認證之毒化災訓練，提升危害應變能力。',
    applicableFrom: 0,
    suggestedYear: 'R3'
  },
  {
    id: 'tox-drill',
    name: '參加毒化災實兵演習',
    category: 'toxicology',
    description: '參與院內或跨院之毒化災實兵動員演習。',
    applicableFrom: 0,
    suggestedYear: 'R3'
  },
  {
    id: 'tox-meeting',
    name: '參加學會主辦之中毒個案討論會',
    category: 'toxicology',
    description: '學會主辦，需有參與證明。',
    applicableFrom: 0,
    suggestedYear: 'R3'
  },
  {
    id: 'tox-ails',
    name: 'AILS 中毒生命支持術課程並取得證書',
    category: 'toxicology',
    description: '急診醫學會主辦之 AILS 課程，取得效期內證書，為 R3 毒物月做準備。',
    applicableFrom: 0,
    suggestedYear: 'R2'
  },
  {
    id: 'tox-logbook',
    name: '訓練過程中照顧或被照會之中毒病例 (12例)',
    category: 'toxicology',
    description: '累積照顧或照會之急診中毒病患 12 例紀錄。',
    applicableFrom: 0,
    suggestedYear: 'R3'
  },
  // Disaster
  {
    id: 'dis-basic',
    name: '住院醫師初階災難訓練課程',
    category: 'disaster',
    description: '急診醫學會主辦。自 112.08.01 起收訓住院醫師必修。',
    applicableFrom: 112,
    suggestedYear: 'R3'
  },
  {
    id: 'dis-chem',
    name: '毒化災 6 小時課程 (學會認證)',
    category: 'disaster',
    description: '急診醫學會認證之災難醫學訓練時數。自 112.08.01 起收訓住院醫師必修。',
    applicableFrom: 112,
    suggestedYear: 'R3'
  },
  {
    id: 'dis-nuclear',
    name: '核災 6 小時課程',
    category: 'disaster',
    description: '急診醫學會認證之放射性核子災害醫療應變課程。自 112.08.01 起收訓住院醫師必修。',
    applicableFrom: 112,
    suggestedYear: 'R3'
  },
  {
    id: 'dis-other',
    name: '其他經學會認證之相關災難課程 6 小時',
    category: 'disaster',
    description: '補足災難醫學其他認證時數。自 112.08.01 起收訓住院醫師必修。',
    applicableFrom: 112,
    suggestedYear: 'R3'
  },
  {
    id: 'dis-joint-meet',
    name: '學會主辦之災難應變與醫療聯合討論會 (3次)',
    category: 'disaster',
    description: '每兩個月辦理一次。自 112.08.01 起收訓住院醫師必修。',
    applicableFrom: 112,
    suggestedYear: 'R3'
  },
  {
    id: 'dis-drills',
    name: '災難演習 (不同型態) 含實兵或桌演 (3場)',
    category: 'disaster',
    description: '需參加 3 場不同型態演習，並填具災難醫學訓練評核表 (演習) 3 張。自 112.08.01 起收訓住院醫師必修。',
    applicableFrom: 112,
    suggestedYear: 'R3'
  },
  // EMS
  {
    id: 'ems-course',
    name: '住院醫師緊急醫療系統訓練課程',
    category: 'ems',
    description: '配合 EMS 輪訓月完成。同意住院醫師於 PGY 期間完成課程認證者可抵免。',
    applicableFrom: 0,
    suggestedYear: 'R1'
  },
  {
    id: 'ems-dispatch-out',
    name: '消防單位實習書面紀錄 - 救護出勤 (4件)',
    category: 'ems',
    description: '消防隊隨車實習，完成 4 件救護出勤之完整書面紀錄。',
    applicableFrom: 0,
    suggestedYear: 'R1'
  },
  {
    id: 'ems-dispatch-send',
    name: '消防單位實習書面紀錄 - 救護派遣 (2件)',
    category: 'ems',
    description: '119救災救護指揮中心實習，完成 2 件派遣紀錄。',
    applicableFrom: 0,
    suggestedYear: 'R1'
  },
  {
    id: 'ems-dispatch-discuss',
    name: '消防單位實習書面紀錄 - 救護案例討論 (1件)',
    category: 'ems',
    description: '完成 1 件 EMS 救護案例分析與科內/隊內討論。',
    applicableFrom: 0,
    suggestedYear: 'R1'
  },
  // Triage & Other General
  {
    id: 'triage-ttas',
    name: '臺灣急診五級檢傷 (TTAS) 學員訓練課程',
    category: 'triage',
    description: '中華民國急重症護理學會辦理，需取得學員證書。自 111.08.01 起收訓必修。',
    applicableFrom: 111,
    suggestedYear: 'R1'
  },
  {
    id: 'acls-ettc',
    name: 'ACLS / ETTC 證書',
    category: 'assessment',
    description: '確認證書在有效期限內。',
    applicableFrom: 0,
    suggestedYear: 'R1'
  },
  {
    id: 'eval-midterm',
    name: '住院醫師期中能力進展評量',
    category: 'assessment',
    description: '急診醫學會主辦之筆試與臨床評量。自 111.08.01 起收訓必修。',
    applicableFrom: 111,
    suggestedYear: 'R3'
  },
  // Geriatrics (115 必修提醒!)
  {
    id: 'geri-model',
    name: '高齡急診照護評估模式',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-atypical',
    name: '高齡急診非典型表現與多重共病',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-cognition',
    name: '高齡急診認知與行為問題',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-trauma',
    name: '高齡急診外傷',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-decline',
    name: '高齡急診急性功能下降',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-palliative-1',
    name: '高齡急診安寧緩和照護①',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-palliative-2',
    name: '高齡急診安寧緩和照護②',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-transition',
    name: '高齡急診照護轉銜',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  },
  {
    id: 'geri-drugs',
    name: '高齡急診藥物處理',
    category: 'geriatrics',
    description: '學會主辦之線上課程。自 115.08.01 起收訓住院醫師必修項目。',
    applicableFrom: 115,
    suggestedYear: 'Any'
  }
];

export const DEFAULT_HOMEWORKS: Homework[] = [
  // R1
  { id: 'hw-r1-1', title: '1月：急診檢傷分類心得筆記', month: 1, rLevel: 'R1', description: '針對檢傷一至五級進行案例分析與分類心得撰寫。' },
  { id: 'hw-r1-2', title: '2月：神經學檢查 NE 實務操作紀錄', month: 2, rLevel: 'R1', description: '操作 5 例 NIHSS 腦中風評估與詳細神經學檢查紀錄。' },
  { id: 'hw-r1-3', title: '3月：小兒發燒與脫水處置案例分析', month: 3, rLevel: 'R1', description: '兒科外訓期間，收集並分析 2 例小兒急症病例。' },
  { id: 'hw-r1-4', title: '4月：小兒腸胃炎輸液治療報告', month: 4, rLevel: 'R1', description: '小兒輸液劑量計算與臨床脫水嚴重度評估心得。' },
  { id: 'hw-r1-5', title: '5月：產科急症與陰道內診實作反思', month: 5, rLevel: 'R1', description: '婦產科外訓期間，紀錄 3 例內診或急產處置流程。' },
  { id: 'hw-r1-6', title: '6月：裂隙燈檢查與異物移除報告', month: 6, rLevel: 'R1', description: '眼科外訓實作，詳細描述裂隙燈使用與角膜異物取出步驟。' },
  { id: 'hw-r1-7', title: '7月：鼻填塞止血與氣切管更換紀錄', month: 7, rLevel: 'R1', description: '耳鼻喉科外訓，氣切套管更換及前鼻填塞止血 2 例。' },
  { id: 'hw-r1-8', title: '8月：消防隊隨車救護出勤紀錄簿', month: 8, rLevel: 'R1', description: 'EMS實習，登錄出勤 4 件、派遣 2 件之消防局實習報告。' },
  { id: 'hw-r1-9', title: '9月：EMS 救護案例線上討論發表', month: 9, rLevel: 'R1', description: '與線上指導醫師討論之救護案例 1 件，填寫討論紀錄。' },
  { id: 'hw-r1-10', title: '10月：內外科常見急症認定病例討論', month: 10, rLevel: 'R1', description: '挑選成人急診 2 例心肌梗塞或主動脈剝離之診斷與處置分析。' },
  { id: 'hw-r1-11', title: '11月：ACLS 急救流程與團隊指引反思', month: 11, rLevel: 'R1', description: '針對心肺復甦術與去顫電擊之操作重點進行總結。' },
  { id: 'hw-r1-12', title: '12月：R1 年度核心能力自評與回顧', month: 12, rLevel: 'R1', description: '回顧 R1 整年度的輪訓與學習歷程，撰寫學習反思報告。' },

  // R2
  { id: 'hw-r2-1', title: '1月：精神急症與保護約束案例報告', month: 1, rLevel: 'R2', description: '針對暴力病人處置、自殺評估、強制就醫流程撰寫報告。' },
  { id: 'hw-r2-2', title: '2月：呼吸器設定與參數調整紀錄', month: 2, rLevel: 'R2', description: '加護病房 (ICU) 實習中 3 例呼吸衰竭病患之呼吸器參數調整。' },
  { id: 'hw-r2-3', title: '3月：敗血性休克升壓劑與輸液治療反思', month: 3, rLevel: 'R2', description: 'ICU 期間，針對休克血流動力學監測與治療之案例分析。' },
  { id: 'hw-r2-4', title: '4月：超音波 FAST 與 RUSH 流程演練', month: 4, rLevel: 'R2', description: '超音波包月實習中，利用超音波評估休克與外傷之實務報告。' },
  { id: 'hw-r2-5', title: '5月：心臟焦點式超音波 (FOCUS) 實習紀錄', month: 5, rLevel: 'R2', description: '記錄 5 例心導管室或急診心臟超音波之射出分率 (EF) 評估。' },
  { id: 'hw-r2-6', title: '6月：超音波導引穿刺 (Paracentesis) 心得', month: 6, rLevel: 'R2', description: '在超音波導引下進行腹水或胸水穿刺 3 例之技術報告。' },
  { id: 'hw-r2-7', title: '7月：自選科：局部麻醉與鎮靜 (PSA) 紀錄', month: 7, rLevel: 'R2', description: '自選科麻醉實習，執行或參與急診深度鎮靜與止痛流程。' },
  { id: 'hw-r2-8', title: '8月：自選科：複雜性關節復位與石膏固定', month: 8, rLevel: 'R2', description: '骨科外訓，執行肩關節或橈骨骨折復位與石膏副木固定報告。' },
  { id: 'hw-r2-9', title: '9月：急救室 (R room) 病人處置初階報告', month: 9, rLevel: 'R2', description: '開始看急救室重症病患，描述 3 例急救室插管或急救處置流程。' },
  { id: 'hw-r2-10', title: '10月：AILS 中毒生命支持術考照心得', month: 10, rLevel: 'R2', description: '分享 AILS 課程中常見中毒（如農藥、安眠藥）處置的關鍵點。' },
  { id: 'hw-r2-11', title: '11月：進階超音波臨床應用與 Log 累積', month: 11, rLevel: 'R2', description: '報告超音波 8 大類案例累積進度，並挑選 1 特殊病例討論。' },
  { id: 'hw-r2-12', title: '12月：R2 核心重症能力與超音波進度總結', month: 12, rLevel: 'R2', description: '彙整 R2 重症及超音波核心技能之自評與未來展望。' },

  // R3
  { id: 'hw-r3-1', title: '1月：毒物科常見農藥中毒個案分析', month: 1, rLevel: 'R3', description: '毒物科實習，分析 1 例有機磷或巴拉刈中毒患者之解毒與照顧過程。' },
  { id: 'hw-r3-2', title: '2月：毒物科一氧化碳或重金屬中毒報告', month: 2, rLevel: 'R3', description: '撰寫一例環境或職業中毒之診斷、高壓氧治療或螯合劑使用。' },
  { id: 'hw-r3-3', title: '3月：中毒案例討論會發表簡報與紀錄', month: 3, rLevel: 'R3', description: '檢附參加學會中毒討論會或科內發表的簡報 PDF 截圖與摘要。' },
  { id: 'hw-r3-4', title: '4月：事故指揮系統 (ICS) 架構分析報告', month: 4, rLevel: 'R3', description: '災難醫學實習中，針對醫院或大型事故 ICS 架構之實作說明。' },
  { id: 'hw-r3-5', title: '5月：參與大型災難演習 (實兵/桌演) 心得', month: 5, rLevel: 'R3', description: '紀錄參與之災難演習（如大傷、毒化災），並檢附評核表。' },
  { id: 'hw-r3-6', title: '6月：毒化災與核災醫療應變流程圖製作', month: 6, rLevel: 'R3', description: '設計一份急診面對化學災害或輻射除污之動線與防護流程圖。' },
  { id: 'hw-r3-7', title: '7月：偏遠地區獨立醫療處置演練紀錄', month: 7, rLevel: 'R3', description: '偏鄉外訓，模擬在無後援環境下處置心肌梗塞之決策過程。' },
  { id: 'hw-r3-8', title: '8月：偏遠地區緊急轉診與空中救護分析', month: 8, rLevel: 'R3', description: '討論偏鄉離島之急症患者轉診流程與潛在風險預防。' },
  { id: 'hw-r3-9', title: '9月：重症加護 (ICU) 進階血流動力學反思', month: 9, rLevel: 'R3', description: 'ICU 累積月數訓練，針對 PiCCO 或 Swan-Ganz 監測案例之學習。' },
  { id: 'hw-r3-10', title: '10月：期中能力進展評量筆試自評與分析', month: 10, rLevel: 'R3', description: '針對學會期中評量之試題或臨床弱點進行檢討與精進規劃。' },
  { id: 'hw-r3-11', title: '11月：災難聯合討論會 (M&M) 與案例學習', month: 11, rLevel: 'R3', description: '參與學會災難聯合討論會 3 次之學習摘要與反思。' },
  { id: 'hw-r3-12', title: '12月：R3 毒物、災難與偏鄉醫療核心實踐總結', month: 12, rLevel: 'R3', description: '撰寫 R3 階段對於獨立執業與系統性應變能力之成長報告。' },

  // R4
  { id: 'hw-r4-1', title: '1月：急診排班表編排與人力調配心得', month: 1, rLevel: 'R4', description: '總醫師實習，撰寫排班邏輯、勞基法限制與緊急缺班調度方案。' },
  { id: 'hw-r4-2', title: '2月：急診醫療爭議與行政客訴處理報告', month: 2, rLevel: 'R4', description: '分析一例急診客訴或爭議事件之處理經過、溝通技巧與預防對策。' },
  { id: 'hw-r4-3', title: '3月：晨會與讀書會教學活動設計與主持', month: 3, rLevel: 'R4', description: '主導科內教學晨會，提供會議大綱、簡報大綱與指導紀錄。' },
  { id: 'hw-r4-4', title: '4月：指導學弟妹臨床處置 (DOPS 評估) 心得', month: 4, rLevel: 'R4', description: '作為學長姐角色，指導並評量 R1 執行侵入性處置之回饋反思。' },
  { id: 'hw-r4-5', title: '5月：臨床操作評量 DOPS/Mini-CEX 指引彙整', month: 5, rLevel: 'R4', description: '檢附當月接受 VS 評量之 Mini-CEX 或 DOPS 紀錄與自我改進計畫。' },
  { id: 'hw-r4-6', title: '6月：導師晤談紀錄與核心職能發展檢視', month: 6, rLevel: 'R4', description: '檢附 RRC 評鑑必查之當季導師晤談摘要，包含職涯與考前輔導。' },
  { id: 'hw-r4-7', title: '7月：加護病房 (MICU) 進階重症整合報告', month: 7, rLevel: 'R4', description: '整合性重症案例報告，討論多重器官衰竭之跨科整合治療。' },
  { id: 'hw-r4-8', title: '8月：成人急診 Flow Control (流速全區掌控) 心得', month: 8, rLevel: 'R4', description: '急診全區流量管控實作，如何減少急診壅塞與優化住院流程。' },
  { id: 'hw-r4-9', title: '9月：專科醫師甄審筆試模擬與重點筆記', month: 9, rLevel: 'R4', description: '整理歷屆急診專科醫師考題之難題解析與考前衝刺筆記。' },
  { id: 'hw-r4-10', title: '10月：專科醫師口試模擬演練紀錄', month: 10, rLevel: 'R4', description: '與科內 VS 進行口試模擬演練（大傷、重症、毒物），檢討口說邏輯。' },
  { id: 'hw-r4-11', title: '11月：急診核心能力指標 (Milestones) 總檢視', month: 11, rLevel: 'R4', description: '對照急診醫學會核心里程碑 (CBME Milestone) 之自我評等。' },
  { id: 'hw-r4-12', title: '12月：CR 卸任交接與急專考取心得回顧', month: 12, rLevel: 'R4', description: '總結四年住院醫師訓練，傳承急診CR行政與教學實務經驗。' }
];

export const MONTH_NAMES = [
  '一月 (Jan)',
  '二月 (Feb)',
  '三月 (Mar)',
  '四月 (Apr)',
  '五月 (May)',
  '六月 (Jun)',
  '七月 (Jul)',
  '八月 (Aug)',
  '九月 (Sep)',
  '十月 (Oct)',
  '十一月 (Nov)',
  '十二月 (Dec)'
];

export const MONTHLY_CHECKLISTS: { [key: number]: string[] } = {
  1: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    'CBD評量表',
    '360度評量表〈教師〉',
    '360度評量表〈同儕〉',
    '教師課堂表現評核表',
    '教師教學臨床表現評核表',
    '住院醫師EPA 7支〈自評〉',
    'Milestone 27支〈自評〉'
  ],
  2: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    '案例報告'
  ],
  3: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表'
  ],
  4: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    'CBD評量表',
    '360度評量表〈教師〉',
    '案例報告'
  ],
  5: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表'
  ],
  6: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    '案例報告'
  ],
  7: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    'CBD評量表',
    '360度評量表〈教師〉',
    '360度評量表〈同儕〉',
    '教師課堂表現評核表',
    '教師教學臨床表現評核表',
    '住院醫師EPA 7支〈自評〉',
    'Milestone 27支〈自評〉'
  ],
  8: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    '案例報告'
  ],
  9: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表'
  ],
  10: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    'CBD評量表',
    '360度評量表〈教師〉',
    '案例報告'
  ],
  11: [
    '核心課程評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表'
  ],
  12: [
    '核心課程評量',
    '年度總結評量',
    'OSCE評量',
    '導師生座談會紀錄／回饋',
    '各科輪訓表',
    'ad hoc評量表 DOPS',
    'Mini-CEX評量表',
    '住院醫師年度訓練總結'
  ]
};

export const LEVEL_UP_XP = 500; // XP required per level

// Preloaded Students
export const PRELOADED_STUDENTS: Student[] = [
  {
    id: 'student-r1',
    name: '林大明',
    admissionYear: 115,
    rLevel: 'R1',
    xp: 220,
    level: 1,
    schedule: ['adult-er', 'adult-er', 'neuro', 'peds', 'peds', 'obgyn', 'oph', 'ent', 'ems', 'adult-er', 'adult-er', 'adult-er'],
    rotationStatus: {
      1: { completed: true, notes: '學習了基礎成人急診檢傷分類與一般內外科急症處置。', fileUrl: 'certificate-placeholder', fileName: 'R1_Jan_ER_Certificate.pdf', status: 'approved', submittedAt: '2026-01-31' },
      2: { completed: true, notes: '成人急診第二個月，精熟縫合技術與基本傷口處置。', fileUrl: 'certificate-placeholder', fileName: 'R1_Feb_ER_Report.pdf', status: 'approved', submittedAt: '2026-02-28' },
      3: { completed: false, notes: '', fileUrl: '', fileName: '', status: 'pending' }
    },
    courseStatus: {
      'acls-ettc': { completed: true, notes: '效期內證書', fileUrl: 'certificate-placeholder', fileName: 'ACLS_card.jpg', status: 'approved', submittedAt: '2026-01-15' },
      'triage-ttas': { completed: true, notes: '完成急重症護理學會主辦之檢傷訓練並取得證書。', fileUrl: 'certificate-placeholder', fileName: 'TTAS_Certificate.pdf', status: 'approved', submittedAt: '2026-02-20' }
    },
    homeworkStatus: {
      'hw-r1-1': { completed: true, notes: '完成1月份檢傷心得。', fileUrl: 'certificate-placeholder', fileName: 'R1_林大明_1月作業.docx', status: 'approved', submittedAt: '2026-01-25' },
      'hw-r1-2': { completed: true, notes: '腦中風神經學檢查實務操作5例報告。', fileUrl: 'certificate-placeholder', fileName: 'R1_林大明_2月作業_NE.pdf', status: 'approved', submittedAt: '2026-02-24' }
    }
  },
  {
    id: 'student-r2',
    name: '陳美玲',
    admissionYear: 114,
    rLevel: 'R2',
    xp: 410,
    level: 3,
    schedule: ['psych', 'icu', 'icu', 'echo', 'echo', 'elective', 'elective', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    rotationStatus: {
      1: { completed: true, notes: '完成精神科訓練，精熟暴力病人鎮靜藥物與強制就醫流程。', fileUrl: 'certificate-placeholder', fileName: 'R2_Jan_Psych.pdf', status: 'approved', submittedAt: '2026-01-31' },
      2: { completed: true, notes: '內科加護病房第一個月，熟悉呼吸器設定。', fileUrl: 'certificate-placeholder', fileName: 'R2_Feb_ICU_Report.pdf', status: 'approved', submittedAt: '2026-02-28' },
      3: { completed: true, notes: 'ICU第二個月，學習休克血流動力學之支持。', fileUrl: 'certificate-placeholder', fileName: 'R2_Mar_ICU_2.pdf', status: 'approved', submittedAt: '2026-03-31' },
      4: { completed: true, notes: '超音波科第一個月，累積20例FAST與RUSH個案。', fileUrl: 'certificate-placeholder', fileName: 'R2_Apr_Echo.pdf', status: 'approved', submittedAt: '2026-04-30' },
      5: { completed: false, notes: '', fileUrl: '', fileName: '', status: 'pending' }
    },
    courseStatus: {
      'echo-basic': { completed: true, notes: 'PGY未完成，已於R1完成補訓。', fileUrl: 'certificate-placeholder', fileName: 'Echo_Basic_Cert.pdf', status: 'approved', submittedAt: '2025-05-10' },
      'echo-adv': { completed: true, notes: '完成學會進階超音波課程。', fileUrl: 'certificate-placeholder', fileName: 'Echo_Advanced_Cert.pdf', status: 'approved', submittedAt: '2026-04-12' },
      'tox-ails': { completed: true, notes: '取得 AILS 中毒生命支持術證書。', fileUrl: 'certificate-placeholder', fileName: 'AILS_Cert.pdf', status: 'approved', submittedAt: '2026-05-18' }
    },
    homeworkStatus: {
      'hw-r2-1': { completed: true, notes: '完成精神急症案例報告。', fileUrl: 'certificate-placeholder', fileName: 'R2_陳美玲_1月作業.pdf', status: 'approved', submittedAt: '2026-01-22' },
      'hw-r2-2': { completed: true, notes: 'ICU呼吸器設定作業。', fileUrl: 'certificate-placeholder', fileName: 'R2_陳美玲_2月作業.docx', status: 'approved', submittedAt: '2026-02-26' },
      'hw-r2-3': { completed: true, notes: '休克治療學習反思。', fileUrl: 'certificate-placeholder', fileName: 'R2_陳美玲_3月作業.pdf', status: 'approved', submittedAt: '2026-03-25' },
      'hw-r2-4': { completed: true, notes: 'FAST超音波流程紀錄。', fileUrl: 'certificate-placeholder', fileName: 'R2_陳美玲_4月作業.pdf', status: 'approved', submittedAt: '2026-04-28' }
    }
  },
  {
    id: 'student-r3',
    name: '張建國',
    admissionYear: 113,
    rLevel: 'R3',
    xp: 150,
    level: 5,
    schedule: ['toxicology', 'toxicology', 'disaster', 'disaster', 'remote', 'remote', 'icu', 'icu', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    rotationStatus: {
      1: { completed: true, notes: '毒物科第一個月，學習常見農藥與安眠藥物中毒處置。', fileUrl: 'certificate-placeholder', fileName: 'R3_Jan_Tox_Cert.pdf', status: 'approved', submittedAt: '2026-01-31' },
      2: { completed: true, notes: '毒物科第二個月，報告中毒個案：有機磷中毒患者。', fileUrl: 'certificate-placeholder', fileName: 'R3_Feb_Tox_CaseReport.pdf', status: 'approved', submittedAt: '2026-02-28' },
      3: { completed: true, notes: '災難醫學第一個月，學習ICS系統與事故應變。', fileUrl: 'certificate-placeholder', fileName: 'R3_Mar_Disaster.pdf', status: 'approved', submittedAt: '2026-03-31' },
      4: { completed: true, notes: '災難醫學第二個月，參與年度大傷演習。', fileUrl: 'certificate-placeholder', fileName: 'R3_Apr_Disaster_Drill.pdf', status: 'approved', submittedAt: '2026-04-30' },
      5: { completed: true, notes: '偏遠地區外訓第一個月，在資源受限下執業。', fileUrl: 'certificate-placeholder', fileName: 'R3_May_Remote.pdf', status: 'approved', submittedAt: '2026-05-31' },
      6: { completed: false, notes: '', fileUrl: '', fileName: '', status: 'pending' }
    },
    courseStatus: {
      'dis-basic': { completed: true, notes: '參與學會初階災難訓練。', fileUrl: 'certificate-placeholder', fileName: 'Disaster_Basic_Cert.pdf', status: 'approved', submittedAt: '2026-03-15' },
      'dis-chem': { completed: true, notes: '完成急診學會認證之 6 小時毒化災。', fileUrl: 'certificate-placeholder', fileName: 'Tox_Hazmat_6h.pdf', status: 'approved', submittedAt: '2026-04-10' },
      'dis-nuclear': { completed: true, notes: '完成 6 小時核災培訓。', fileUrl: 'certificate-placeholder', fileName: 'Nuclear_Hazmat_6h.pdf', status: 'approved', submittedAt: '2026-04-11' },
      'tox-ails': { completed: true, notes: 'R2已考取證書。', fileUrl: 'certificate-placeholder', fileName: 'AILS_Cert.pdf', status: 'approved', submittedAt: '2025-06-20' }
    },
    homeworkStatus: {
      'hw-r3-1': { completed: true, notes: '農藥中毒報告。', fileUrl: 'certificate-placeholder', fileName: 'R3_張建國_1月作業.pdf', status: 'approved', submittedAt: '2026-01-25' },
      'hw-r3-2': { completed: true, notes: '一氧化碳中毒與螯合劑分析。', fileUrl: 'certificate-placeholder', fileName: 'R3_張建國_2月作業.pdf', status: 'approved', submittedAt: '2026-02-27' },
      'hw-r3-3': { completed: true, notes: '中毒討論會簡報與報告。', fileUrl: 'certificate-placeholder', fileName: 'R3_張建國_3月作業.docx', status: 'approved', submittedAt: '2026-03-24' },
      'hw-r3-4': { completed: true, notes: 'ICS架構分析報告。', fileUrl: 'certificate-placeholder', fileName: 'R3_張建國_4月作業.pdf', status: 'approved', submittedAt: '2026-04-26' },
      'hw-r3-5': { completed: true, notes: '災難實兵演習心得與評核表。', fileUrl: 'certificate-placeholder', fileName: 'R3_張建國_5月作業.pdf', status: 'approved', submittedAt: '2026-05-28' }
    }
  },
  {
    id: 'student-r4',
    name: '王小芬',
    admissionYear: 112,
    rLevel: 'R4',
    xp: 350,
    level: 8,
    schedule: ['admin', 'admin', 'micu', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er', 'adult-er'],
    rotationStatus: {
      1: { completed: true, notes: '擔任總醫師行政職，負責全科排班與行政客訴處理。', fileUrl: 'certificate-placeholder', fileName: 'R4_Jan_Admin_CR.pdf', status: 'approved', submittedAt: '2026-01-31' },
      2: { completed: true, notes: '總醫師第二個月，籌辦全科教學晨會與住院醫師模擬考。', fileUrl: 'certificate-placeholder', fileName: 'R4_Feb_CR_Teaching.pdf', status: 'approved', submittedAt: '2026-02-28' },
      3: { completed: true, notes: '補足MICU重症月數，熟習進階MICU整合治療。', fileUrl: 'certificate-placeholder', fileName: 'R4_Mar_MICU_Report.pdf', status: 'approved', submittedAt: '2026-03-31' },
      4: { completed: true, notes: '成人急診區，練習全區 flow control。', fileUrl: 'certificate-placeholder', fileName: 'R4_Apr_ER_Flow.pdf', status: 'approved', submittedAt: '2026-04-30' },
      5: { completed: true, notes: '成人急診區，精進急診急救室重症決策流程。', fileUrl: 'certificate-placeholder', fileName: 'R4_May_ER_Resus.pdf', status: 'approved', submittedAt: '2026-05-31' },
      6: { completed: false, notes: '', fileUrl: '', fileName: '', status: 'pending' }
    },
    courseStatus: {
      'acls-ettc': { completed: true, notes: '持續維持證書效期內。', fileUrl: 'certificate-placeholder', fileName: 'ACLS_ETTC_R4.pdf', status: 'approved', submittedAt: '2026-01-10' }
    },
    homeworkStatus: {
      'hw-r4-1': { completed: true, notes: '總醫師排班心得與優化方案。', fileUrl: 'certificate-placeholder', fileName: 'R4_王小芬_1月作業.docx', status: 'approved', submittedAt: '2026-01-25' },
      'hw-r4-2': { completed: true, notes: '醫療行政爭議與客訴演練。', fileUrl: 'certificate-placeholder', fileName: 'R4_王小芬_2月作業.pdf', status: 'approved', submittedAt: '2026-02-24' },
      'hw-r4-3': { completed: true, notes: '科內讀書會簡報大綱與投影片。', fileUrl: 'certificate-placeholder', fileName: 'R4_王小芬_3月作業.pdf', status: 'approved', submittedAt: '2026-03-27' },
      'hw-r4-4': { completed: true, notes: '臨床指導學弟妹 Mini-CEX 回饋。', fileUrl: 'certificate-placeholder', fileName: 'R4_王小芬_4月作業.pdf', status: 'approved', submittedAt: '2026-04-25' },
      'hw-r4-5': { completed: true, notes: 'Mini-CEX 自我評估與 RRC 評鑑檢核。', fileUrl: 'certificate-placeholder', fileName: 'R4_王小芬_5月作業.pdf', status: 'approved', submittedAt: '2026-05-26' }
    }
  }
];
