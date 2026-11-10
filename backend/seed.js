require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Progress = require('./models/Progress');
const Customization = require('./models/Customization');

const MONGO_URI = process.env.MONGO_URI;

async function runSeed() {
  try {
    console.log('⏳ Conectando a MongoDB Atlas para poblar esquemas modulares...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conexión establecida con MongoDB Atlas');

    const testerEmail = 'tester@neuron.com';
    const testerPass = 'tester123';

    // Generar hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testerPass, salt);

    // 1. Colección 'users'
    let user = await User.findOne({email: testerEmail});
    if (user) {
      user.password = hashedPassword;
      user.userName = 'Tester NehurOn';
      await user.save();
      console.log('👤 [users] Documento actualizado para:', testerEmail);
    } else {
      user = new User({
        email: testerEmail,
        password: hashedPassword,
        userName: 'Tester NehurOn',
      });
      await user.save();
      console.log('👤 [users] Documento creado para:', testerEmail);
    }

    // 2. Colección 'progress' (Recompensas, Tokens y Productividad)
    let progress = await Progress.findOne({userId: user._id});
    if (progress) {
      progress.points = 9999;
      progress.streakDays = 5;
      progress.focusHours = 12.5;
      progress.lastActiveDate = new Date().toISOString().split('T')[0];
      await progress.save();
      console.log('🪙 [progress] Documento actualizado para userId:', user._id);
    } else {
      progress = new Progress({
        userId: user._id,
        points: 9999,
        streakDays: 5,
        focusHours: 12.5,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
      await progress.save();
      console.log('🪙 [progress] Documento creado para userId:', user._id);
    }

    // 3. Colección 'customizations' (Inventario y Accesorios Mascota)
    let customization = await Customization.findOne({userId: user._id});
    if (customization) {
      customization.unlockedItems = ['hat_gorra', 'hat_birrete', 'gl_pixel', 'gl_sol'];
      customization.equippedHat = 'hat_gorra';
      customization.equippedGlasses = 'gl_pixel';
      await customization.save();
      console.log('🎩 [customizations] Documento actualizado para userId:', user._id);
    } else {
      customization = new Customization({
        userId: user._id,
        unlockedItems: ['hat_gorra', 'hat_birrete', 'gl_pixel', 'gl_sol'],
        equippedHat: 'hat_gorra',
        equippedGlasses: 'gl_pixel',
      });
      await customization.save();
      console.log('🎩 [customizations] Documento creado para userId:', user._id);
    }

    console.log('====================================================');
    console.log('🎉 SEED COMPLETADO EN 3 COLECCIONES INDEPENDIENTES:');
    console.log('  1. users:          Email, contraseña cifrada, nombre');
    console.log('  2. progress:       9999 tokens/puntos, 5 racha, 12.5h');
    console.log('  3. customizations: hat_gorra, hat_birrete, gl_pixel, gl_sol');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seed modular:', error);
    process.exit(1);
  }
}

runSeed();
