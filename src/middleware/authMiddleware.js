const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener usuario del token y adjuntarlo al request (excluyendo la contraseña)
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!req.user || !req.user.activo) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo', error: 'Not Authorized' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Token no válido o expirado', error: 'Not Authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No hay token, acceso denegado', error: 'Not Authorized' });
  }
};

module.exports = { protect };