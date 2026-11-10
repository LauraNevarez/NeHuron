require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middlewares
app.use(cors());
app.use(express.json());

// Logging simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: '🚀 API de NehurOn funcionando correctamente en la nube',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'NeurOn API',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'connecting',
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor HTTP de inmediato para que Render detecte el puerto abierto
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor NeurOn escuchando en el puerto ${PORT}`);
  connectMongoWithRetry();
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ El puerto ${PORT} ya está en uso.`);
  } else {
    console.error('❌ Error en el servidor:', err.message);
  }
});

// Conexión resiliente a MongoDB Atlas con reintentos
function connectMongoWithRetry(retries = 5, delayMs = 5000) {
  if (!MONGO_URI) {
    console.error('⚠️ MONGO_URI no está definida en las variables de entorno.');
    return;
  }

  console.log('⏳ Conectando a MongoDB Atlas...');
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ Conectado exitosamente a MongoDB Atlas (Base de datos: neuron)');
    })
    .catch(err => {
      console.error('❌ Error conectando a MongoDB Atlas:', err.message);
      if (retries > 0) {
        console.log(`⏳ Reintentando conexión en ${delayMs / 1000}s... (${retries} intentos restantes)`);
        setTimeout(() => connectMongoWithRetry(retries - 1, delayMs), delayMs);
      }
    });
}
