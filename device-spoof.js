/**
 * FRIDA SCRIPT - Device Fingerprint Spoofing
 * 
 * ⚠️  AVISO IMPORTANTE:
 * Este script é para fins de PESQUISA DE SEGURANÇA e DETECÇÃO DE VULNERABILIDADES.
 * Uso indevido pode violar termos de serviço e leis locais.
 * 
 * COMO USAR:
 * frida -U -f com.tappsi.client.android -l device-spoof.js --no-pause
 * 
 * O QUE ELE FAZ:
 * - Spoofs Android ID
 * - Spoofs IMEI / Device ID
 * - Spoofs Serial Number
 * - Spoofs MAC Address
 * - Spoofs Advertising ID
 * - Spoofs Build properties (model, manufacturer, etc)
 * - Spoofs MediaDRM ID (mais difícil de detectar)
 * - Spoofs SIM info
 */

Java.perform(function() {
    console.log("\n╔════════════════════════════════════════════════╗");
    console.log("║   FRIDA DEVICE FINGERPRINT SPOOFING ATIVO     ║");
    console.log("╚════════════════════════════════════════════════╝\n");

    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    
    const VERBOSE = false; // Mude para true para ver TODOS os hooks
    const FAKE_VALUES = {
        androidId: generateRandomHex(16),
        imei: generateRandomIMEI(),
        serial: generateRandomSerial(),
        macAddress: generateRandomMAC(),
        advertisingId: generateRandomUUID(),
        mediaDrmId: generateRandomHex(64),
        simSerial: generateRandomIMSI(),
        phoneNumber: "+55119" + Math.floor(10000000 + Math.random() * 90000000),
        
        // Build properties
        brand: "Samsung",
        manufacturer: "samsung",
        model: "SM-G973F",
        device: "beyond1lte",
        product: "beyond1ltexx",
        hardware: "exynos9820",
        board: "universal9820"
    };

    console.log("📱 Valores Fake Gerados:");
    console.log("   Android ID:", FAKE_VALUES.androidId);
    console.log("   IMEI:", FAKE_VALUES.imei);
    console.log("   Serial:", FAKE_VALUES.serial);
    console.log("   MAC:", FAKE_VALUES.macAddress);
    console.log("   Advertising ID:", FAKE_VALUES.advertisingId);
    console.log("   Model:", FAKE_VALUES.model);
    console.log("");

    // ============================================
    // 1. ANDROID ID SPOOFING
    // ============================================
    
    try {
        const Settings = Java.use('android.provider.Settings$Secure');
        Settings.getString.overload('android.content.ContentResolver', 'java.lang.String').implementation = function(resolver, name) {
            if (name === "android_id") {
                if (VERBOSE) console.log("[✓] Android ID interceptado → retornando fake:", FAKE_VALUES.androidId);
                return FAKE_VALUES.androidId;
            }
            return this.getString(resolver, name);
        };
        console.log("✅ Android ID hooking ativo");
    } catch (e) {
        console.log("❌ Erro no Android ID hook:", e.message);
    }

    // ============================================
    // 2. IMEI / DEVICE ID SPOOFING
    // ============================================
    
    try {
        const TelephonyManager = Java.use('android.telephony.TelephonyManager');
        
        // getDeviceId
        TelephonyManager.getDeviceId.overload().implementation = function() {
            console.log("[✓] getDeviceId() interceptado → retornando IMEI fake");
            return FAKE_VALUES.imei;
        };
        
        // getImei
        if (TelephonyManager.getImei) {
            TelephonyManager.getImei.overload().implementation = function() {
                console.log("[✓] getImei() interceptado → retornando IMEI fake");
                return FAKE_VALUES.imei;
            };
            
            TelephonyManager.getImei.overload('int').implementation = function(slotIndex) {
                console.log("[✓] getImei(slot) interceptado → retornando IMEI fake");
                return FAKE_VALUES.imei;
            };
        }
        
        // getSubscriberId (IMSI)
        TelephonyManager.getSubscriberId.overload().implementation = function() {
            console.log("[✓] getSubscriberId() interceptado → retornando IMSI fake");
            return FAKE_VALUES.simSerial;
        };
        
        // getLine1Number (Phone number)
        TelephonyManager.getLine1Number.overload().implementation = function() {
            console.log("[✓] getLine1Number() interceptado → retornando número fake");
            return FAKE_VALUES.phoneNumber;
        };
        
        // getSimSerialNumber
        TelephonyManager.getSimSerialNumber.overload().implementation = function() {
            console.log("[✓] getSimSerialNumber() interceptado → retornando SIM fake");
            return FAKE_VALUES.simSerial;
        };
        
        console.log("✅ Telephony Manager hooking ativo");
    } catch (e) {
        console.log("❌ Erro no TelephonyManager hook:", e);
    }

    // ============================================
    // 3. SERIAL NUMBER SPOOFING
    // ============================================
    
    try {
        const Build = Java.use('android.os.Build');
        Build.getSerial.implementation = function() {
            console.log("[✓] Build.getSerial() interceptado → retornando serial fake");
            return FAKE_VALUES.serial;
        };
        
        // Build.SERIAL (field)
        Build.SERIAL.value = FAKE_VALUES.serial;
        
        console.log("✅ Serial Number hooking ativo");
    } catch (e) {
        console.log("❌ Erro no Serial hook:", e);
    }

    // ============================================
    // 4. MAC ADDRESS SPOOFING
    // ============================================
    
    try {
        const WifiInfo = Java.use('android.net.wifi.WifiInfo');
        
        WifiInfo.getMacAddress.implementation = function() {
            console.log("[✓] getMacAddress() interceptado → retornando MAC fake");
            return FAKE_VALUES.macAddress;
        };
        
        WifiInfo.getBSSID.implementation = function() {
            console.log("[✓] getBSSID() interceptado → retornando BSSID fake");
            return FAKE_VALUES.macAddress;
        };
        
        console.log("✅ MAC Address hooking ativo");
    } catch (e) {
        console.log("❌ Erro no MAC hook:", e);
    }

    // ============================================
    // 5. ADVERTISING ID SPOOFING
    // ============================================
    
    try {
        const AdvertisingIdClient = Java.use('com.google.android.gms.ads.identifier.AdvertisingIdClient');
        const Info = Java.use('com.google.android.gms.ads.identifier.AdvertisingIdClient$Info');
        
        AdvertisingIdClient.getAdvertisingIdInfo.implementation = function(context) {
            console.log("[✓] getAdvertisingIdInfo() interceptado → retornando Ad ID fake");
            
            return Info.$new(FAKE_VALUES.advertisingId, false);
        };
        
        console.log("✅ Advertising ID hooking ativo");
    } catch (e) {
        console.log("⚠️  Advertising ID hook não aplicado (normal se app não usa):", e.message);
    }

    // ============================================
    // 6. BUILD PROPERTIES SPOOFING
    // ============================================
    
    try {
        const Build = Java.use('android.os.Build');
        
        Build.BRAND.value = FAKE_VALUES.brand;
        Build.MANUFACTURER.value = FAKE_VALUES.manufacturer;
        Build.MODEL.value = FAKE_VALUES.model;
        Build.DEVICE.value = FAKE_VALUES.device;
        Build.PRODUCT.value = FAKE_VALUES.product;
        Build.HARDWARE.value = FAKE_VALUES.hardware;
        Build.BOARD.value = FAKE_VALUES.board;
        
        console.log("✅ Build Properties hooking ativo");
    } catch (e) {
        console.log("❌ Erro no Build Properties hook:", e);
    }

    // ============================================
    // 7. MEDIADRM ID SPOOFING (DIFÍCIL DE DETECTAR)
    // ============================================
    
    try {
        const MediaDrm = Java.use('android.media.MediaDrm');
        
        MediaDrm.getPropertyByteArray.implementation = function(property) {
            try {
                if (property === "deviceUniqueId") {
                    if (VERBOSE) console.log("[✓] MediaDRM deviceUniqueId interceptado → retornando ID fake");
                    
                    // Converte hex para byte array JAVA corretamente
                    const hexString = FAKE_VALUES.mediaDrmId;
                    const bytes = [];
                    
                    for (let i = 0; i < hexString.length; i += 2) {
                        const byteValue = parseInt(hexString.substr(i, 2), 16);
                        // Java byte é signed (-128 a 127)
                        bytes.push(byteValue > 127 ? byteValue - 256 : byteValue);
                    }
                    
                    // Retorna como Java byte[]
                    return Java.array('byte', bytes);
                }
                
                // Se não for deviceUniqueId, chama o método original
                return this.getPropertyByteArray(property);
                
            } catch (e) {
                // Se der erro, chama o método original
                console.log("⚠️  MediaDRM erro interno (ignorando):", e.message);
                return this.getPropertyByteArray(property);
            }
        };
        
        console.log("✅ MediaDRM ID hooking ativo");
    } catch (e) {
        console.log("⚠️  MediaDRM hook não aplicado:", e.message);
    }

    // ============================================
    // 8. FIREBASE INSTANCE ID SPOOFING
    // ============================================
    
    try {
        const FirebaseInstanceId = Java.use('com.google.firebase.iid.FirebaseInstanceId');
        
        FirebaseInstanceId.getId.implementation = function() {
            const fakeId = generateRandomHex(32);
            console.log("[✓] Firebase Instance ID interceptado → retornando ID fake");
            return fakeId;
        };
        
        console.log("✅ Firebase Instance ID hooking ativo");
    } catch (e) {
        console.log("⚠️  Firebase hook não aplicado (normal se app não usa):", e.message);
    }

    // ============================================
    // 9. BLUETOOTH MAC SPOOFING
    // ============================================
    
    try {
        const BluetoothAdapter = Java.use('android.bluetooth.BluetoothAdapter');
        
        BluetoothAdapter.getAddress.implementation = function() {
            console.log("[✓] Bluetooth Address interceptado → retornando MAC fake");
            return FAKE_VALUES.macAddress;
        };
        
        console.log("✅ Bluetooth MAC hooking ativo");
    } catch (e) {
        console.log("⚠️  Bluetooth hook não aplicado:", e.message);
    }

    // ============================================
    // FUNÇÕES AUXILIARES
    // ============================================
    
    function generateRandomHex(length) {
        let result = '';
        const characters = '0123456789abcdef';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    function generateRandomIMEI() {
        // Gera IMEI válido (com checksum correto)
        const tac = '35' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const snr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const imei = tac + snr;
        
        // Calcula Luhn checksum
        let sum = 0;
        for (let i = 0; i < 14; i++) {
            let digit = parseInt(imei[i]);
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        const checksum = (10 - (sum % 10)) % 10;
        
        return imei + checksum;
    }
    
    function generateRandomSerial() {
        return generateRandomHex(16).toUpperCase();
    }
    
    function generateRandomMAC() {
        const mac = [];
        for (let i = 0; i < 6; i++) {
            mac.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
        }
        return mac.join(':');
    }
    
    function generateRandomUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    function generateRandomIMSI() {
        // MCC (Brasil = 724) + MNC (2 dígitos) + MSIN (10 dígitos)
        return '724' + Math.floor(10 + Math.random() * 90) + 
               Math.floor(1000000000 + Math.random() * 9000000000);
    }

    console.log("\n✅ Todos os hooks ativos!");
    console.log("⚠️  LEMBRE-SE: Apps modernos usam múltiplas camadas de detecção");
    console.log("   (IP, GPS, padrões de uso, device fingerprinting avançado)\n");
});