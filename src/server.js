require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const userRoutes = require('./routes/userRoutes');

// Inicializar app de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // para parsear application/json
app.use(express.urlencoded({ extended: true })); // para parsear application/x-www-form-urlencoded

// Rate Limiter
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos' }
});
app.use(limiter);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/user', userRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Politecnicos Galactic!' });
});

// Ruta de prueba de conexión a la base de datos
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      success: true, 
      message: 'Conexión a la base de datos exitosa',
      database: process.env.DB_DIALECT,
      host: process.env.DB_HOST
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error de conexión a la base de datos',
      error: error.message 
    });
  }
});

// Manejador de errores (debe ser el último middleware)
app.use(errorHandler);

// Sincronizar base de datos y arrancar servidor
sequelize.sync() // Usar { force: true } para resetear la BD en desarrollo
  .then(() => {
    console.log('Base de datos conectada y sincronizada.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err);
  });