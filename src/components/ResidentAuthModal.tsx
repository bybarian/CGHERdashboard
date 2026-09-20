import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  X, 
  KeyRound, 
  AlertCircle,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Student } from '../types';

interface ResidentAuthModalProps {
  targetStudent: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studentId: string) => void;
  onTeacherLoginPrompt?: () => void;
}

export default function ResidentAuthModal({
  targetStudent,
  isOpen,
  onClose,
  onSuccess,
  onTeacherLoginPrompt
}: ResidentAuthModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetStudent) return null;

  const expectedPassword = targetStudent.password || '1234';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Verification check
    if (password.trim() === expectedPassword) {
      setTimeout(() => {
        setIsSubmitting(false);
        setPassword('');
        onSuccess(targetStudent.id);
      }, 150);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setErrorMsg('密碼不正確！若忘記密碼，請聯繫教學指導導師從後台為您一鍵重設。');
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with emerald gradient banner */}
        <div className="relative bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-teal-200 hover:text-white hover:bg-teal-700/50 transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600/60 border border-teal-400/40 flex items-center justify-center shadow-inner">
              <Lock className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>住院醫師身分驗證</span>
                <span className="text-[10px] font-bold bg-teal-500/40 border border-teal-300/30 px-1.5 py-0.5 rounded text-teal-100">
                  密碼保護
                </span>
              </h2>
              <p className="text-xs text-teal-100/90 mt-0.5">
                切換進入前請輸入專屬密碼，維護訓練資料安全
              </p>
            </div>
          </div>
        </div>

        {/* Student Target Summary */}
        <div className="p-6 space-y-5">
          <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="h-12 w-12 rounded-full bg-white border-2 border-teal-500/40 flex items-center justify-center text-xl shadow-xs overflow-hidden shrink-0">
              {targetStudent.avatar && (targetStudent.avatar.startsWith('data:') || targetStudent.avatar.startsWith('http')) ? (
                <img 
                  src={targetStudent.avatar} 
                  alt={targetStudent.name} 
                  referrerPolicy="no-referrer" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <span>{targetStudent.avatar || '👨‍⚕️'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 text-sm truncate">
                  {targetStudent.name} 醫師
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 font-mono">
                  {targetStudent.rLevel}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{targetStudent.admissionYear}年度</span>
                <span>•</span>
                <span>指導導師: {targetStudent.mentorName || '尚未指定'}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-teal-600" />
                  <span>請輸入登入密碼：</span>
                </span>
                <span className="text-[11px] font-mono text-teal-600 font-semibold">
                  (初始預設：1234)
                </span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="resident-password-input"
                  autoFocus
                  required
                  placeholder="請輸入醫師個人密碼..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono tracking-wider transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Hint Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                <span>安全防護說明</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                密碼驗證通過後，在本次使用連線期間可自由瀏覽與操作該醫師之大富翁輪訓與作業申報。完成後可隨時點選「鎖定帳號」。
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer text-center"
              >
                取消
              </button>

              <button
                type="submit"
                id="btn-confirm-resident-login"
                disabled={isSubmitting || !password.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-black shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Unlock className="h-4 w-4" />
                <span>{isSubmitting ? '驗證中...' : '解鎖並進入'}</span>
              </button>
            </div>
          </form>

          {/* Teacher assistance prompt */}
          {onTeacherLoginPrompt && (
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onTeacherLoginPrompt}
                className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <HelpCircle className="h-3 w-3" />
                <span>我是教學導師，欲由後台管理重設密碼或查閱全體狀況</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
