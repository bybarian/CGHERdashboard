import React, { useState } from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  X, 
  AlertCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { Student } from '../types';

interface ChangePasswordModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePassword: (studentId: string, oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
}

export default function ChangePasswordModal({
  student,
  isOpen,
  onClose,
  onUpdatePassword
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword.length < 4) {
      setStatusMsg({ type: 'error', text: '新密碼長度至少需 4 個字元以上！' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: '兩次輸入的新密碼不相符，請再次確認！' });
      return;
    }

    setIsSubmitting(true);
    const result = await onUpdatePassword(student.id, oldPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setStatusMsg({ type: 'success', text: result.message || '密碼已成功更新！' });
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setStatusMsg(null);
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: result.message || '原密碼不正確，請重新確認！' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center shadow-inner">
              <KeyRound className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>修改登入密碼</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {student.name} 醫師 ({student.rLevel}) • 自訂個人防護密碼
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Old Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                目前原密碼：
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  placeholder="請輸入目前的密碼 (預設: 1234)"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-10 text-xs text-slate-800 focus:border-teal-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showOldPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                設定新密碼：
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="請設定至少 4 個字元的新密碼"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 pr-10 text-xs text-slate-800 focus:border-teal-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                再次確認新密碼：
              </label>
              <input
                type="password"
                required
                placeholder="請再次輸入新密碼以供核對"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>

            {/* Status Message */}
            {statusMsg && (
              <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}>
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                取消
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-black shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Lock className="h-4 w-4 text-amber-300" />
                <span>{isSubmitting ? '儲存中...' : '確認更新密碼'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
