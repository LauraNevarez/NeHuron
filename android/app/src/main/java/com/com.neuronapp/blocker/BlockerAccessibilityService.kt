package com.neuronapp.blocker

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Color
import android.graphics.PixelFormat
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Detecta la app en primer plano (TYPE_WINDOW_STATE_CHANGED) y, si el Modo Esencial
 * está activo y la app está en la lista, dibuja una pantalla de bloqueo con SYSTEM_ALERT_WINDOW.
 */
class BlockerAccessibilityService : AccessibilityService() {

    private var wm: WindowManager? = null
    private var overlay: View? = null
    private lateinit var prefs: SharedPreferences

    private val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, key ->
        if (key == BlockerModule.KEY_ACTIVE && !prefs.getBoolean(BlockerModule.KEY_ACTIVE, false)) hideOverlay()
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        prefs = getSharedPreferences(BlockerModule.PREFS, Context.MODE_PRIVATE)
        prefs.registerOnSharedPreferenceChangeListener(listener)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return

        val active = prefs.getBoolean(BlockerModule.KEY_ACTIVE, false)
        val blocked = prefs.getStringSet(BlockerModule.KEY_BLOCKED, emptySet()) ?: emptySet()

        if (active && blocked.contains(pkg)) {
            showOverlay()
        } else if (pkg != "com.android.systemui" && pkg != packageName) {
            hideOverlay()
        }
    }

    private fun showOverlay() {
        if (overlay != null || !Settings.canDrawOverlays(this)) return

        val dp = resources.displayMetrics.density
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#F20F1020"))
            setPadding((32 * dp).toInt(), 0, (32 * dp).toInt(), 0)
        }
        root.addView(TextView(this).apply {
            text = "🛡️"
            textSize = 64f
            gravity = Gravity.CENTER
        })
        root.addView(TextView(this).apply {
            text = "Modo Esencial activo"
            setTextColor(Color.WHITE)
            textSize = 26f
            gravity = Gravity.CENTER
        })
        root.addView(TextView(this).apply {
            text = "Esta app está bloqueada mientras te enfocas. ¡Tú puedes!"
            setTextColor(Color.parseColor("#9A9CC0"))
            textSize = 16f
            gravity = Gravity.CENTER
            setPadding(0, (12 * dp).toInt(), 0, (24 * dp).toInt())
        })
        root.addView(Button(this).apply {
            text = "Volver al inicio"
            setOnClickListener {
                performGlobalAction(GLOBAL_ACTION_HOME)
                hideOverlay()
            }
        })

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            PixelFormat.TRANSLUCENT
        )
        wm?.addView(root, params)
        overlay = root
    }

    private fun hideOverlay() {
        overlay?.let { runCatching { wm?.removeView(it) } }
        overlay = null
    }

    override fun onInterrupt() = hideOverlay()

    override fun onDestroy() {
        hideOverlay()
        if (::prefs.isInitialized) prefs.unregisterOnSharedPreferenceChangeListener(listener)
        super.onDestroy()
    }
}
