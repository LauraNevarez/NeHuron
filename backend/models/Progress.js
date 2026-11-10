const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Monedas virtuales / tokens de productividad ganados
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Racha diaria actual
    streakDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Horas totales de enfoque acumuladas
    focusHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Última fecha en la que completó una sesión (formato YYYY-MM-DD)
    lastActiveDate: {
      type: String,
      default: null,
    },
    // Registro histórico diario: { 'YYYY-MM-DD': minutos }
    focusLog: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'progress', // Nombre explícito de la colección en MongoDB Atlas
  }
);

module.exports = mongoose.model('Progress', progressSchema);
