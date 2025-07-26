const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};


exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ where: { [Op.or]: [{ username }, { email }] }});
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario o email ya existe.' });
    }
    
    const user = await User.create({ username, email, password_hash: password });

    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: { token, user: { id: user.id, username: user.username, email: user.email } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};


exports.login = async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await User.findOne({ where: { [Op.or]: [{ username: login }, { email: login }] }});
        if (user && (await user.comparePassword(password))) {
            await user.update({ ultimo_login: new Date() });
            
            const token = generateToken(user.id);
            res.json({
                success: true,
                message: 'Inicio de sesión exitoso.',
                data: { token, user: { id: user.id, username: user.username, email: user.email } }
            });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
};


exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logout exitoso. Por favor, elimine el token del cliente.' });
};


exports.verifyToken = (req, res) => {
  res.json({
    success: true,
    message: 'Token válido.',
    data: { user: req.user }
  });
};