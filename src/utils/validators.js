const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
        success: false, 
        message: 'Error de validación',
        error: errors.array() 
    });
  }
  next();
};

const registerRules = () => [
  body('username').isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres').isAlphanumeric().withMessage('El username solo puede contener letras y números.'),
  body('email').isEmail().withMessage('Debe ser un email válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];

const loginRules = () => [
  body('login').notEmpty().withMessage('El campo de login (username o email) es requerido.'),
  body('password').notEmpty().withMessage('La contraseña es requerida.')
];

const scoreRules = () => [
  body('puntuacion').isInt({ min: 0, max: 9999999 }).withMessage('La puntuación debe ser un número positivo y razonable.'),
  body('nivel_alcanzado').optional().isInt({ min: 1 }).withMessage('El nivel debe ser un número positivo.'),
  body('enemigos_destruidos').optional().isInt({ min: 0 }).withMessage('Los enemigos destruidos deben ser un número positivo.'),
  body('tiempo_jugado').optional().isInt({ min: 0 }).withMessage('El tiempo jugado debe ser un número positivo.')
];

module.exports = {
  handleValidationErrors,
  registerRules,
  loginRules,
  scoreRules
};