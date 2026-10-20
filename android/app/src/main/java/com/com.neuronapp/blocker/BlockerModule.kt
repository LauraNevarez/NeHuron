package com.neuronapp.blocker

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.io.File

class BlockerModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {

    companion object {
        const val PREFS = "neuron_blocker"
        const val KEY_ACTIVE = "active"
        const val KEY_BLOCKED = "blocked"
        const val KEY_BREAK_UNTIL = "break_until"
        private const val IMAGE_PICK_REQUEST = 9182
    }

    override fun getName() = "BlockerModule"

    private val prefs get() = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private var pickPromise: Promise? = null

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == IMAGE_PICK_REQUEST) {
                if (resultCode == Activity.RESULT_OK && data?.data != null) {
                    val srcUri = data.data!!
                    try {
                        val fileName = "evidence_${System.currentTimeMillis()}.jpg"
                        val destFile = File(activity.filesDir, fileName)
                        activity.contentResolver.openInputStream(srcUri)?.use { input ->
                            destFile.outputStream().use { output ->
                                input.copyTo(output)
                            }
                        }
                        pickPromise?.resolve("file://${destFile.absolutePath}")
                    } catch (e: Exception) {
                        pickPromise?.resolve(srcUri.toString())
                    }
                } else {
                    pickPromise?.resolve(null)
                }
                pickPromise = null
            }
        }
    }

    init {
        ctx.addActivityEventListener(activityEventListener)
    }

    @ReactMethod
    fun pickImage(promise: Promise) {
        val activity = ctx.currentActivity
        if (activity == null) {
            promise.reject("ERR_NO_ACTIVITY", "Actividad no disponible")
            return
        }
        pickPromise = promise
        try {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                addCategory(Intent.CATEGORY_OPENABLE)
            }
            activity.startActivityForResult(
                Intent.createChooser(intent, "Selecciona tus apuntes o evidencia"),
                IMAGE_PICK_REQUEST
            )
        } catch (e: Exception) {
            pickPromise?.reject("ERR_PICK", e)
            pickPromise = null
        }
    }

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val am = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
            val enabledServices = am?.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK) ?: emptyList()
            val me = BlockerAccessibilityService::class.java.name

            val isEnabledByManager = enabledServices.any {
                it.resolveInfo.serviceInfo.packageName == ctx.packageName &&
                it.resolveInfo.serviceInfo.name == me
            }

            if (isEnabledByManager) {
                promise.resolve(true)
                return
            }

            val enabled = Settings.Secure.getString(
                ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val expectedLong = "${ctx.packageName}/$me"
            val expectedShort = "${ctx.packageName}/.blocker.BlockerAccessibilityService"
            val isEnabledBySettings = enabled.split(':').any {
                it.equals(expectedLong, ignoreCase = true) || it.equals(expectedShort, ignoreCase = true)
            }
            promise.resolve(isEnabledBySettings)
        } catch (e: Exception) {
            promise.reject("ERR_A11Y", e)
        }
    }

    @ReactMethod
    fun isOverlayEnabled(promise: Promise) {
        promise.resolve(Settings.canDrawOverlays(ctx))
    }

    @ReactMethod
    fun isBatteryOptimizationIgnored(promise: Promise) {
        try {
            val pm = ctx.getSystemService(Context.POWER_SERVICE) as? PowerManager
            val isIgnored = pm?.isIgnoringBatteryOptimizations(ctx.packageName) ?: false
            promise.resolve(isIgnored)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimization() {
        try {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${ctx.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            ctx.startActivity(intent)
        } catch (e: Exception) {
            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            ctx.startActivity(intent)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val i = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(i)
    }

    @ReactMethod
    fun openOverlaySettings() {
        val i = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${ctx.packageName}"))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(i)
    }

    @ReactMethod
    fun setBlockedPackages(packages: ReadableArray, promise: Promise) {
        val set = HashSet<String>()
        for (i in 0 until packages.size()) packages.getString(i)?.let { set.add(it) }
        val ok = prefs.edit().putStringSet(KEY_BLOCKED, set).commit()
        promise.resolve(ok)
    }

    @ReactMethod
    fun startBlocking(promise: Promise) {
        val ok = prefs.edit()
            .putBoolean(KEY_ACTIVE, true)
            .putLong(KEY_BREAK_UNTIL, 0L)
            .commit()
        promise.resolve(ok)
    }

    @ReactMethod
    fun stopBlocking(promise: Promise) {
        val ok = prefs.edit()
            .putBoolean(KEY_ACTIVE, false)
            .putLong(KEY_BREAK_UNTIL, 0L)
            .commit()
        promise.resolve(ok)
    }

    @ReactMethod
    fun setGraceBreak(minutes: Double, promise: Promise) {
        val until = System.currentTimeMillis() + (minutes * 60 * 1000).toLong()
        val ok = prefs.edit()
            .putBoolean(KEY_ACTIVE, false)
            .putLong(KEY_BREAK_UNTIL, until)
            .commit()
        promise.resolve(ok)
    }

    @ReactMethod
    fun endGraceBreak(promise: Promise) {
        val ok = prefs.edit()
            .putBoolean(KEY_ACTIVE, true)
            .putLong(KEY_BREAK_UNTIL, 0L)
            .commit()
        promise.resolve(ok)
    }
}
