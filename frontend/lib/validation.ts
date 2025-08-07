// フォームバリデーション用ユーティリティ

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 時間形式の検証
export const validateTime = (time: string): ValidationResult => {
  if (!time) {
    return { isValid: false, error: '時間を入力してください' };
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, error: '正しい時間形式で入力してください (HH:MM)' };
  }
  
  return { isValid: true };
};

// 時間の論理検証（開始 < 終了）
export const validateTimeRange = (startTime: string, endTime: string): ValidationResult => {
  const startValidation = validateTime(startTime);
  const endValidation = validateTime(endTime);
  
  if (!startValidation.isValid) return startValidation;
  if (!endValidation.isValid) return endValidation;
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // 終了時刻が開始時刻より早い場合は翌日とみなす
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const workMinutes = endMinutes - startMinutes;
  
  if (workMinutes < 30) {
    return { isValid: false, error: '勤務時間は30分以上である必要があります' };
  }
  
  if (workMinutes > 24 * 60) {
    return { isValid: false, error: '勤務時間は24時間以内である必要があります' };
  }
  
  return { isValid: true };
};

// 日付の検証
export const validateDate = (date: string): ValidationResult => {
  if (!date) {
    return { isValid: false, error: '日付を選択してください' };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  if (selectedDate > today) {
    return { isValid: false, error: '未来の日付は選択できません' };
  }
  
  if (selectedDate < oneYearAgo) {
    return { isValid: false, error: '1年以上前の日付は選択できません' };
  }
  
  return { isValid: true };
};

// 休憩時間の検証
export const validateBreakMinutes = (breakMinutes: string, startTime: string, endTime: string): ValidationResult => {
  const breakNum = parseInt(breakMinutes, 10);
  
  if (isNaN(breakNum) || breakNum < 0) {
    return { isValid: false, error: '休憩時間は0分以上で入力してください' };
  }
  
  // 勤務時間の計算
  const timeRangeValidation = validateTimeRange(startTime, endTime);
  if (!timeRangeValidation.isValid) {
    return { isValid: true }; // 時間範囲が無効な場合はスキップ
  }
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const totalWorkMinutes = endMinutes - startMinutes;
  
  if (breakNum >= totalWorkMinutes) {
    return { isValid: false, error: '休憩時間は勤務時間より短くする必要があります' };
  }
  
  return { isValid: true };
};

// メールアドレスの検証
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'メールアドレスを入力してください' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '正しいメールアドレスを入力してください' };
  }
  
  return { isValid: true };
};

// パスワードの検証
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'パスワードを入力してください' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'パスワードは6文字以上で入力してください' };
  }
  
  return { isValid: true };
};

// 名前の検証
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: '名前を入力してください' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: '名前は50文字以内で入力してください' };
  }
  
  return { isValid: true };
};

// 給与の検証
export const validatePayRate = (payRate: string): ValidationResult => {
  const rate = parseFloat(payRate);
  
  if (isNaN(rate) || rate <= 0) {
    return { isValid: false, error: '給与は0より大きい値を入力してください' };
  }
  
  if (rate > 100000) {
    return { isValid: false, error: '給与が異常に高い値です' };
  }
  
  return { isValid: true };
};