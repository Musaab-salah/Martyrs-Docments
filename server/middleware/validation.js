const { body, validationResult } = require('express-validator');

// Validation rules for martyr data
const martyrValidation = [
  body('name_ar')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Arabic name must be between 2 and 255 characters'),
  body('name_en')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('English name must be between 2 and 255 characters'),
  body('date_of_martyrdom')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('place_of_martyrdom')
    .notEmpty()
    .withMessage('Place of martyrdom is required'),
  body('education_level')
    .isIn(['primary', 'secondary', 'university', 'postgraduate', 'other'])
    .withMessage('Invalid education level'),
  body('occupation')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Occupation must be between 2 and 255 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Bio must not exceed 2000 characters'),
  body('university_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('University name must not exceed 255 characters'),
  body('faculty')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Faculty must not exceed 255 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Department must not exceed 255 characters'),
  body('school_state')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('School state must not exceed 255 characters'),
  body('school_locality')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('School locality must not exceed 255 characters'),
  body('spouse')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Spouse name must not exceed 255 characters'),
  body('children')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Children information must not exceed 500 characters'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90')
];

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

module.exports = {
  martyrValidation,
  handleValidationErrors
};
