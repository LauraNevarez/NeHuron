const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Array de IDs de accesorios desbloqueados/comprados (ej: 'hat_cap', 'gl_pixel')
    unlockedItems: {
      type: [String],
      default: [],
    },
    // Accesorio de cabeza actualmente equipado
    equippedHat: {
      type: String,
      default: null,
    },
    // Accesorio de ojos/gafas actualmente equipado
    equippedGlasses: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'customizations', // Nombre explícito de la colección en MongoDB Atlas
  }
);

module.exports = mongoose.model('Customization', customizationSchema);
