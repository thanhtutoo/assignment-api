import {body, query, validationResult } from "express-validator"

export function registerValidationRules () {
  return [
    body('teacher').exists().withMessage('required!'),
    body('students').exists().withMessage('required!'),

  ]
}

export function teacherValidationRules () {
  return [
    query('teacher').exists().withMessage('required!'),

  ]
}

export function studentValidationRules () {
  return [
    body('student').exists().withMessage('required!'),

  ]
}

export function notificationValidationRules () {
  return [
    body('teacher').exists().withMessage('required!'),
    body('notification').exists().withMessage('required!'),

  ]
}

export function validate (req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push( err.param +':'+err.msg ))

  return res.status(422).json({
    message: extractedErrors,
  })
}
