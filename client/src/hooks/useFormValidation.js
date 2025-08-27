import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation rules
  const validators = {
    required: (value) => value && value.toString().trim() !== '' ? null : 'This field is required',
    minLength: (min) => (value) => 
      value && value.toString().length >= min ? null : `Minimum length is ${min} characters`,
    maxLength: (max) => (value) => 
      value && value.toString().length <= max ? null : `Maximum length is ${max} characters`,
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : 'Invalid email format';
    },
    date: (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) ? null : 'Invalid date format';
    },
    ...validationRules
  };

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const fieldRules = validationRules[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      let validator;
      let params;

      if (typeof rule === 'string') {
        validator = validators[rule];
      } else if (typeof rule === 'object') {
        validator = validators[rule.type];
        params = rule.params;
      }

      if (validator) {
        const error = params ? validator(params)(value) : validator(value);
        if (error) return error;
      }
    }

    return null;
  }, [validationRules, validators]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  // Handle input change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Handle input blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // Reset form
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    isFormValid,
    setValues,
    setErrors
  };
};
