import * as XLSX from 'xlsx';
import { Student } from '../types';
import { 
  HANDBOOK_META, 
  ROTATION_SYLLABUS_OVERVIEW, 
  HANDBOOK_DEPARTMENT_SECTIONS, 
  PROCEDURE_AUTHORIZATIONS, 
  MILESTONES_LIST,
  CLINICAL_WORK_RULES,
  HandbookProgress
} from '../data/handbookData';

export function exportHandbookToExcel(student: Student, progress?: HandbookProgress) {
  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // Sheet 1: 封面與簡介目錄 (Cover & Syllabus)
  // ----------------------------------------------------
  const coverData: (string | number)[][] = [
    [HANDBOOK_META.hospital],
    [HANDBOOK_META.title],
    [`版本：${HANDBOOK_META.edition}`, '', `審訂：${HANDBOOK_META.committee}`],
    [''],
    ['【住院醫師基本資料】'],
    ['姓名', student.name, '訓練層級', student.rLevel],
    ['入學/入科年班', `${student.admissionYear} 年度`, '起訓日期', student.trainingStartDate || `${1911 + (student.admissionYear || 115)}-08-01`],
    ['專屬臨床導師', student.mentorName || '尚未指定', '導師職稱', student.mentorTitle || '急診專科主治醫師'],
    ['累積臨床經驗值 (XP)', student.xp, '系統等級', `Level ${student.level}`],
    ['匯出產出日期', new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })],
    [''],
    ['【急診專科四年輪訓計畫總覽】']
  ];

  ROTATION_SYLLABUS_OVERVIEW.forEach((plan) => {
    coverData.push([`● ${plan.year}`]);
    plan.rotations.forEach((r, idx) => {
      coverData.push(['', `${idx + 1}. ${r.name}`, `受訓期間：${r.months}`]);
    });
    coverData.push(['']);
  });

  coverData.push(['【手冊宗旨與說明】']);
  const introLines = HANDBOOK_META.introText.split('\n');
  introLines.forEach(line => {
    if (line.trim()) coverData.push([line]);
  });

  const wsCover = XLSX.utils.aoa_to_sheet(coverData);
  wsCover['!cols'] = [{ wch: 22 }, { wch: 35 }, { wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsCover, '手冊首頁與目錄');

  // ----------------------------------------------------
  // Sheet 2: 分科訓練核心課程與自學案例紀錄 (Clinical Curriculum)
  // ----------------------------------------------------
  const curriculumData: (string | number)[][] = [
    ['科別章節', '年級', '項次', '臨床訓練課程名稱', '自我學習狀態', '自學登錄日期', '自學重點/筆記', '案例筆數', '實際案例詳細紀錄 (支援多次登錄)', '科別導師簽核', '科別案例報告/心得'],
  ];

  HANDBOOK_DEPARTMENT_SECTIONS.forEach((sec) => {
    const mentorSig = progress?.mentorSignatures?.[sec.id];
    const isSigned = mentorSig?.signed ? `已簽章 (${mentorSig.signedBy || '導師'})` : '未簽核';
    const caseNotes = mentorSig?.caseReportNotes || '無';

    sec.items.forEach((item) => {
      const curProg = progress?.clinicalCurriculum?.[item.id];
      const isStudied = curProg?.selfStudied ? '已完成自學' : '未標記';
      const studyDate = curProg?.selfStudyDate || (curProg?.selfStudied ? '已核' : '-');
      const studyNotes = curProg?.selfStudyNotes || '';
      
      let caseCount = 0;
      let formattedCases = '';
      if (curProg?.cases && curProg.cases.length > 0) {
        caseCount = curProg.cases.length;
        formattedCases = curProg.cases.map((c, idx) => {
          const parts = [
            `【案例 ${idx + 1}】`,
            c.date ? `日期:${c.date}` : '',
            c.chartNo ? `病歷號:${c.chartNo}` : '',
            c.patientInfo ? `診斷/年齡:${c.patientInfo}` : '',
            c.notes ? `學習重點:${c.notes}` : '',
            c.supervisor ? `指導VS:${c.supervisor}` : ''
          ].filter(Boolean);
          return parts.join(' | ');
        }).join('\n');
      } else if (curProg?.actualCase) {
        caseCount = 1;
        formattedCases = curProg.actualCase;
      }

      curriculumData.push([
        sec.title,
        sec.yearLevel,
        item.number,
        item.name,
        isStudied,
        studyDate,
        studyNotes,
        caseCount,
        formattedCases,
        isSigned,
        caseNotes
      ]);
    });
  });

  const wsCurriculum = XLSX.utils.aoa_to_sheet(curriculumData);
  wsCurriculum['!cols'] = [
    { wch: 28 }, // 科別
    { wch: 8 },  // 年級
    { wch: 8 },  // 項次
    { wch: 45 }, // 名稱
    { wch: 14 }, // 自學狀態
    { wch: 15 }, // 自學日期
    { wch: 25 }, // 自學重點/筆記
    { wch: 10 }, // 案例筆數
    { wch: 55 }, // 實際案例詳細紀錄
    { wch: 18 }, // 導師簽核
    { wch: 25 }  // 案例報告
  ];
  XLSX.utils.book_append_sheet(wb, wsCurriculum, '分科訓練核心自學與案例');

  // ----------------------------------------------------
  // Sheet 3: 操作處置授權規範表 (Procedure Authorization Matrix)
  // ----------------------------------------------------
  const authData: (string | number)[][] = [
    ['項次', '處置技術名稱 (中文)', '英文名稱', '處置類別', 'R1 授權', 'R2 授權', 'R3 授權', 'R4 授權', `當前醫師資格 (${student.rLevel})`],
  ];

  const currentLevelKey = student.rLevel.toLowerCase() as 'r1' | 'r2' | 'r3' | 'r4';

  PROCEDURE_AUTHORIZATIONS.forEach((auth, idx) => {
    const isAuthorizedForCurrent = auth[currentLevelKey];
    authData.push([
      idx + 1,
      auth.nameZh,
      auth.nameEn,
      auth.category,
      auth.r1 ? '○ 授權' : '需督導',
      auth.r2 ? '○ 授權' : '需督導',
      auth.r3 ? '○ 授權' : '需督導',
      auth.r4 ? '○ 授權' : '需督導',
      isAuthorizedForCurrent ? '✅ 獨立執行授權' : '⚠️ 需資深/主治督導'
    ]);
  });

  const wsAuth = XLSX.utils.aoa_to_sheet(authData);
  wsAuth['!cols'] = [
    { wch: 8 },
    { wch: 32 },
    { wch: 38 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAuth, '操作處置授權規範');

  // ----------------------------------------------------
  // Sheet 4: 急診醫學里程碑考核 (Milestones)
  // ----------------------------------------------------
  const milestoneData: (string | number)[][] = [
    ['項次', '核心能力次領域 (Milestone)', '範疇分類', '第一年(一)', '第一年(二)', '第二年(一)', '第二年(二)', '第三年(一)', '第三年(二)', '第四年(一)', '第四年(二)'],
  ];

  MILESTONES_LIST.forEach((m) => {
    const mRecords = progress?.milestones?.[m.id] || {};
    milestoneData.push([
      m.number,
      m.title,
      m.category || '',
      mRecords['r1_1'] !== undefined ? `Level ${mRecords['r1_1']}` : '-',
      mRecords['r1_2'] !== undefined ? `Level ${mRecords['r1_2']}` : '-',
      mRecords['r2_1'] !== undefined ? `Level ${mRecords['r2_1']}` : '-',
      mRecords['r2_2'] !== undefined ? `Level ${mRecords['r2_2']}` : '-',
      mRecords['r3_1'] !== undefined ? `Level ${mRecords['r3_1']}` : '-',
      mRecords['r3_2'] !== undefined ? `Level ${mRecords['r3_2']}` : '-',
      mRecords['r4_1'] !== undefined ? `Level ${mRecords['r4_1']}` : '-',
      mRecords['r4_2'] !== undefined ? `Level ${mRecords['r4_2']}` : '-'
    ]);
  });

  const wsMilestone = XLSX.utils.aoa_to_sheet(milestoneData);
  wsMilestone['!cols'] = [
    { wch: 8 },
    { wch: 45 },
    { wch: 22 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsMilestone, '急診醫學里程碑考核');

  // ----------------------------------------------------
  // Sheet 5: 技術操作紀錄表 (Skill Log 2026-2029)
  // ----------------------------------------------------
  const skillLogs = progress?.skillLogs || [];
  const skillLogData: (string | number)[][] = [
    ['項次', '訓練年度', '操作品項名稱', '病歷號 (Chart No.)', '執行日期', '備註與執行心得'],
  ];

  if (skillLogs.length === 0) {
    skillLogData.push([
      1,
      2026,
      '氣管內管插管 (範例)',
      '12345678',
      '2026-08-15',
      '首次在主治醫師指導下順利完成'
    ]);
  } else {
    skillLogs.forEach((log, idx) => {
      skillLogData.push([
        idx + 1,
        log.year,
        log.item,
        log.chartNo,
        log.date,
        log.notes || ''
      ]);
    });
  }

  const wsSkillLog = XLSX.utils.aoa_to_sheet(skillLogData);
  wsSkillLog['!cols'] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 32 },
    { wch: 20 },
    { wch: 15 },
    { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSkillLog, '技術操作紀錄(Skill Log)');

  // ----------------------------------------------------
  // Sheet 6: 工作須知與臨床照護規範 (Rules & Guidelines)
  // ----------------------------------------------------
  const rulesData: (string | number)[][] = [
    ['國泰急診醫學科住院醫師工作須知與照護作業準則'],
    [''],
    ['【一、看診與交班注意事項】'],
    [CLINICAL_WORK_RULES.shiftTransfer.schedule],
    ['交班內容六大重點 (逐一病人落實)：'],
    ...CLINICAL_WORK_RULES.shiftTransfer.sixElements.map(e => ['', e]),
    [''],
    ['【二、會診與收住院處理流程】'],
    ...CLINICAL_WORK_RULES.consultation.rules.map(r => ['', `● ${r}`]),
    [''],
    ['【三、參與教學、會議與評量規範】'],
    ...CLINICAL_WORK_RULES.teachingActivities.rules.map(r => ['', `● ${r}`])
  ];

  const wsRules = XLSX.utils.aoa_to_sheet(rulesData);
  wsRules['!cols'] = [{ wch: 25 }, { wch: 85 }];
  XLSX.utils.book_append_sheet(wb, wsRules, '工作須知與流程規範');

  // Trigger file download in the browser
  const filename = `國泰急診住院醫師工作手冊_${student.name}_${student.rLevel}_${student.admissionYear}年班.xlsx`;
  XLSX.writeFile(wb, filename);
}
