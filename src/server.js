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


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Rate Limiter
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos' }
});
app.use(limiter);


app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/user', userRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Politecnicos Galactic!' });
});


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


app.use(errorHandler);


sequelize.sync() 
  .then(() => {
    console.log('Base de datos conectada y sincronizada.');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err);
  });