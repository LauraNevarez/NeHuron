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

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'NeurOn API',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Conexión a MongoDB Atlas
async function startServer() {
  try {
    console.log('⏳ Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado exitosamente a MongoDB Atlas (Base de datos: neuron)');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor NeurOn escuchando en el puerto ${PORT}`);
      console.log(`👉 Endpoint Auth: http://localhost:${PORT}/api/auth/login`);
    });

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ El puerto ${PORT} ya está en uso por otro proceso.`);
        console.error(`👉 Puedes liberarlo ejecutando: npx kill-port ${PORT}`);
      } else {
        console.error('❌ Error en el servidor:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
    process.exit(1);
  }
}

startServer();
