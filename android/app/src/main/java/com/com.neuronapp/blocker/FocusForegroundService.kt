package com.neuronapp.blocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.neuronapp.MainActivity

class FocusForegroundService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null

    companion object {
        const val CHANNEL_ID = "neuron_focus_foreground_channel"
        const val CHANNEL_NAME = "Modo Enfoque NeurOn"
        const val NOTIFICATION_ID = 40401

        const val ACTION_START = "com.neuronapp.blocker.ACTION_START"
        const val ACTION_STOP = "com.neuronapp.blocker.ACTION_STOP"

        fun startService(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            context.stopService(intent)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            releaseWakeLock()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
            return START_NOT_STICKY
        }

        acquireWakeLock()
        val notification = buildNotification()
        startForeground(NOTIFICATION_ID, notification)

        return START_STICKY
    }

    private fun acquireWakeLock() {
        if (wakeLock == null) {
            val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
            wakeLock = pm?.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "neuron:FocusForegroundServiceWakeLock"
            )?.apply {
                setReferenceCounted(false)
                acquire(4 * 60 * 60 * 1000L) // Máximo 4 horas de seguridad
            }
        }
    }

    private fun releaseWakeLock() {
        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (_: Exception) {}
        wakeLock = null
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Mantiene activo el bloqueo de aplicaciones y el contador de enfoque en segundo plano."
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            manager?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            pendingIntentFlags
        )

        // Usamos el icono del sistema de launcher de la app
        val iconRes = applicationInfo.icon

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(if (iconRes != 0) iconRes else android.R.drawable.ic_lock_lock)
            .setContentTitle("🛡️ NeurOn · Modo Enfoque Activo")
            .setContentText("Bloqueando aplicaciones de distracción en segundo plano.")
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        releaseWakeLock()
        stopForeground(STOP_FOREGROUND_REMOVE)
        super.onDestroy()
    }
}
