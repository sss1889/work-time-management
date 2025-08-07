import { useState, useCallback, useEffect } from 'react';
import { ValidationResult } from '@/lib/validation';

export interface FormField {
  value: string;
  validation: ValidationResult;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface ValidationRules {
  [key: string]: (value: string, formState?: FormState) => ValidationResult;
}

export const useFormValidation = (
  initialValues: { [key: string]: string },
  validationRules: ValidationRules
) => {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        validation: { isValid: true },
        touched: false
      };
    });
    return state;
  });

  const [isFormValid, setIsFormValid] = useState(true);

  // フィールド値の更新
  const updateField = useCallback((fieldName: string, value: string) => {
    setFormState(prev => {
      const newState = {
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          touched: true
        }
      };

      // バリデーション実行
      if (validationRules[fieldName]) {
        newState[fieldName].validation = validationRules[fieldName](value, newState);
      }

      return newState;
    });
  }, [validationRules]);

  // すべてのフィールドをバリデート
  const validateAll = useCallback(() => {
    setFormState(prev => {
      const newState = { ...prev };
      
      Object.keys(newState).forEach(fieldName => {
        newState[fieldName] = {
          ...newState[fieldName],
          touched: true
        };
        
        if (validationRules[fieldName]) {
          newState[fieldName].validation = validationRules[fieldName](
            newState[fieldName].value,
            newState
          );
        }
      });
      
      return newState;
    });
  }, [validationRules]);

  // フォーム全体の有効性をチェック
  useEffect(() => {
    const allValid = Object.values(formState).every(field => field.validation.isValid);
    setIsFormValid(allValid);
  }, [formState]);

  // フィールドにタッチマークを付ける
  const touchField = useCallback((fieldName: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true
      }
    }));
  }, []);

  // フォームをリセット
  const resetForm = useCallback(() => {
    setFormState(prev => {
      const newState: FormState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = {
          value: initialValues[key] || '',
          validation: { isValid: true },
          touched: false
        };
      });
      return newState;
    });
  }, [initialValues]);

  // 値だけを取得するヘルパー
  const getValues = useCallback(() => {
    const values: { [key: string]: string } = {};
    Object.keys(formState).forEach(key => {
      values[key] = formState[key].value;
    });
    return values;
  }, [formState]);

  // エラーがあるフィールドを取得
  const getErrors = useCallback(() => {
    const errors: { [key: string]: string } = {};
    Object.keys(formState).forEach(key => {
      const field = formState[key];
      if (!field.validation.isValid && field.validation.error) {
        errors[key] = field.validation.error;
      }
    });
    return errors;
  }, [formState]);

  return {
    formState,
    updateField,
    validateAll,
    touchField,
    resetForm,
    getValues,
    getErrors,
    isFormValid
  };
};