Java.perform(function() {
    console.log("[FRIDA] Hookando métodos específicos para mascarar dados...");
    
    // Hooks para SecurityUtil
    try {
        var SecurityUtil = Java.use('com.didi.sdk.security.SecurityUtil');
        
        if (SecurityUtil.getDeviceId) {
            SecurityUtil.getDeviceId.implementation = function() {
                var deviceId = "spoofed_" + (Math.floor(Math.random() * 1000000000)).toString();
                console.log("[FRIDA] SecurityUtil.getDeviceId -> " + deviceId);
                return deviceId;
            };
        }
        
        if (SecurityUtil.getAndroidID) {
            SecurityUtil.getAndroidID.implementation = function() {
                var androidId = "0000000000000000";
                console.log("[FRIDA] SecurityUtil.getAndroidID -> " + androidId);
                return androidId;
            };
        }
        
        if (SecurityUtil.getSUUID) {
            SecurityUtil.getSUUID.implementation = function() {
                var suuid = "spoofed_suuid_" + (Math.floor(Math.random() * 1000000000)).toString();
                console.log("[FRIDA] SecurityUtil.getSUUID -> " + suuid);
                return suuid;
            };
        }
        
        if (SecurityUtil.getUUID) {
            SecurityUtil.getUUID.implementation = function() {
                var uuid = "spoofed_uuid_" + (Math.floor(Math.random() * 1000000000)).toString();
                console.log("[FRIDA] SecurityUtil.getUUID -> " + uuid);
                return uuid;
            };
        }
        
        // Hook para generateSignature se existir
        if (SecurityUtil.generateSignature && SecurityUtil.generateSignature.overload('java.util.Map')) {
            SecurityUtil.generateSignature.overload('java.util.Map').implementation = function(map) {
                console.log("[FRIDA] SecurityUtil.generateSignature chamado com mapa:");
                
                // Modificar os valores no mapa antes de calcular a assinatura
                var iterator = map.entrySet().iterator();
                while (iterator.hasNext()) {
                    var entry = iterator.next();
                    var key = entry.getKey();
                    var value = entry.getValue();
                    
                    if (key === "brand") {
                        entry.setValue("Samsung");
                    } else if (key === "model") {
                        entry.setValue("SM-G973F");
                    } else if (key === "imei") {
                        entry.setValue("355000000000000");
                    } else if (key === "android_id") {
                        entry.setValue("0000000000000000");
                    } else if (key === "device_id") {
                        entry.setValue("spoofed_device_id_123");
                    }
                }
                
                console.log("[FRIDA] Mapa modificado para assinatura");
                return SecurityUtil.generateSignature.call(this, map);
            };
        }
        
    } catch(e) {
        console.log("[FRIDA] Erro ao hookar SecurityUtil: " + e);
    }
    
    // Hooks para SystemUtil
    try {
        var SystemUtil = Java.use('com.didi.sdk.util.SystemUtil');
        
        if (SystemUtil.getModel) {
            SystemUtil.getModel.implementation = function() {
                console.log("[FRIDA] SystemUtil.getModel -> SM-G973F");
                return "SM-G973F";
            };
        }
        
        if (SystemUtil.getBrand) {
            SystemUtil.getBrand.implementation = function() {
                console.log("[FRIDA] SystemUtil.getBrand -> Samsung");
                return "Samsung";
            };
        }
        
        if (SystemUtil.getIMEI) {
            SystemUtil.getIMEI.implementation = function() {
                console.log("[FRIDA] SystemUtil.getIMEI -> 355000000000000");
                return "355000000000000";
            };
        }
        
        if (SystemUtil.getMacSerialno) {
            SystemUtil.getMacSerialno.implementation = function() {
                console.log("[FRIDA] SystemUtil.getMacSerialno -> 02:00:00:00:00:00");
                return "02:00:00:00:00:00";
            };
        }
        
        if (SystemUtil.getVersionName) {
            SystemUtil.getVersionName.implementation = function() {
                return "6.57.0";
            };
        }
        
        if (SystemUtil.getVersionCode) {
            SystemUtil.getVersionCode.implementation = function() {
                return 1406570008;
            };
        }
        
        if (SystemUtil.getNetworkType) {
            SystemUtil.getNetworkType.implementation = function() {
                return "wifi";
            };
        }
        
        if (SystemUtil.getChannelId) {
            SystemUtil.getChannelId.implementation = function() {
                return "default";
            };
        }
        
    } catch(e) {
        console.log("[FRIDA] Erro ao hookar SystemUtil: " + e);
    }
    
    // Hook para TravelUtil.createBaseParams() - abordagem direta
    try {
        var TravelUtil = Java.use('com.didi.travel.psnger.v2.TravelUtil');
        
        // Procurar por métodos que criam parâmetros
        var methods = TravelUtil.class.getDeclaredMethods();
        for (var i = 0; i < methods.length; i++) {
            var method = methods[i];
            var methodName = method.getName();
            
            if (methodName === "createBaseParams") {
                console.log("[FRIDA] Encontrado TravelUtil.createBaseParams");
                
                TravelUtil.createBaseParams.implementation = function(context) {
                    console.log("[FRIDA] TravelUtil.createBaseParams chamado!");
                    
                    // Chamar o método original
                    var originalMap = TravelUtil.createBaseParams.call(this, context);
                    
                    // Modificar os valores no mapa
                    if (originalMap) {
                        originalMap.put("brand", "Samsung");
                        originalMap.put("model", "SM-G973F");
                        originalMap.put("imei", "355000000000000");
                        originalMap.put("android_id", "0000000000000000");
                        originalMap.put("device_id", "spoofed_device_id_" + (Math.floor(Math.random() * 1000000000)).toString());
                        originalMap.put("dviceid", originalMap.get("device_id"));
                        originalMap.put("suuid", "spoofed_suuid_" + (Math.floor(Math.random() * 1000000000)).toString());
                        originalMap.put("uuid", "spoofed_uuid_" + (Math.floor(Math.random() * 1000000000)).toString());
                    }
                    
                    return originalMap;
                };
                break;
            }
        }
    } catch(e) {
        console.log("[FRIDA] Erro ao hookar TravelUtil: " + e);
    }
    
    // Hook para a classe Build do Android
    try {
        var Build = Java.use('android.os.Build');
        Build.BRAND.value = "Samsung";
        Build.MODEL.value = "SM-G973F";
        Build.VERSION.RELEASE.value = "10";
        Build.VERSION.SDK_INT.value = 29;
        
        // Para arquitetura (pode ser necessário para a requisição de risco)
        Build.SUPPORTED_ABIS.value = Java.array('java.lang.String', ['armeabi-v7a', 'armeabi']);
        
        console.log("[FRIDA] Build hooks aplicados");
    } catch(e) {
        console.log("[FRIDA] Erro ao hookar Build: " + e);
    }
    
    // Hook para Settings.Secure (Android ID)
    try {
        var SettingsSecure = Java.use('android.provider.Settings$Secure');
        SettingsSecure.getString.implementation = function(contentResolver, name) {
            if (name === "android_id") {
                console.log("[FRIDA] SettingsSecure.getString (android_id) -> 0000000000000000");
                return "0000000000000000";
            }
            return SettingsSecure.getString.call(this, contentResolver, name);
        };
    } catch(e) {
        console.log("[FRIDA] Erro ao hookar SettingsSecure: " + e);
    }
    
    // Hook para TelephonyManager (IMEI, IMSI, etc.)
    try {
        var TelephonyManager = Java.use('android.telephony.TelephonyManager');
        
        if (TelephonyManager.getDeviceId) {
            TelephonyManager.getDeviceId.implementation = function() {
                console.log("[FRIDA] TelephonyManager.getDeviceId -> 355000000000000");
                return "355000000000000";
            };
        }
        
        if (TelephonyManager.getImei) {
            TelephonyManager.getImei.implementation = function() {
                console.log("[FRIDA] TelephonyManager.getImei -> 355000000000000");
                return "355000000000000";
            };
        }
        
        if (TelephonyManager.getSubscriberId) {
            TelephonyManager.getSubscriberId.implementation = function() {
                console.log("[FRIDA] TelephonyManager.getSubscriberId -> 310000000000000");
                return "310000000000000";
            };
        }
        
    } catch(e) {
        console.log("[FRIDA] Erro ao hookar TelephonyManager: " + e);
    }
    
    // Hook para obter timestamp dinâmico
    var System = Java.use('java.lang.System');
    System.currentTimeMillis.implementation = function() {
        var timestamp = Date.now();
        console.log("[FRIDA] System.currentTimeMillis -> " + timestamp);
        return timestamp;
    };
    
    // Hook adicional para qualquer classe que possa gerar o UID do dispositivo
    // Procura por classes que contenham "DeviceInfo" ou similar
    var classes = Java.enumerateLoadedClassesSync();
    for (var i = 0; i < classes.length; i++) {
        var className = classes[i];
        
        if (className.toLowerCase().includes("deviceinfo") || 
            className.toLowerCase().includes("deviceid") ||
            className.toLowerCase().includes("riskdevice")) {
            
            try {
                var targetClass = Java.use(className);
                var methods = targetClass.class.getDeclaredMethods();
                
                for (var j = 0; j < methods.length; j++) {
                    var method = methods[j];
                    var methodName = method.getName().toLowerCase();
                    
                    if ((methodName.includes("getuid") || methodName.includes("getdeviceid")) && 
                        method.getReturnType().getName() === "java.lang.String") {
                        
                        console.log("[FRIDA] Hookando " + className + "." + method.getName());
                        
                        targetClass[method.getName()].implementation = function() {
                            var spoofedId = "spoofed_" + (Math.floor(Math.random() * 1000000000)).toString();
                            console.log("[FRIDA] " + className + "." + method.getName() + " -> " + spoofedId);
                            return spoofedId;
                        };
                    }
                }
            } catch(e) {}
        }
    }
    
    console.log("[FRIDA] Todos os hooks foram aplicados com sucesso!");
});