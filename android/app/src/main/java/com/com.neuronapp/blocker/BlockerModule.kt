package com.neuronapp.blocker

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

class BlockerModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {

    companion object {
        const val PREFS = "neuron_blocker"
        const val KEY_ACTIVE = "active"
        const val KEY_BLOCKED = "blocked"
    }

    override fun getName() = "BlockerModule"

    private val prefs get() = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    @ReactMethod
    fun isAccessibilityEnabled(promise: Promise) {
        try {
            val enabled = Settings.Secure.getString(
                ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val me = "${ctx.packageName}/${BlockerAccessibilityService::class.java.name}"
            promise.resolve(enabled.split(':').any { it.equals(me, ignoreCase = true) })
        } catch (e: Exception) {
            promise.reject("ERR_A11Y", e)
        }
    }

    @ReactMethod
    fun isOverlayEnabled(promise: Promise) {
        promise.resolve(Settings.canDrawOverlays(ctx))
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
        prefs.edit().putStringSet(KEY_BLOCKED, set).apply()
        promise.resolve(true)
    }

    @ReactMethod
    fun startBlocking(promise: Promise) {
        prefs.edit().putBoolean(KEY_ACTIVE, true).apply()
        promise.resolve(true)
    }

    @ReactMethod
    fun stopBlocking(promise: Promise) {
        prefs.edit().putBoolean(KEY_ACTIVE, false).apply()
        promise.resolve(true)
    }
}
