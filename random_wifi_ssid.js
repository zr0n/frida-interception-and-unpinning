// random_wifi_ssid_fixed.js - Hook corrigido para gerar SSID aleatório
// Uso: frida -U -f com.app.alvo -l random_wifi_ssid_fixed.js --no-pause

// Função global para gerar SSIDs aleatórios
function generateRandomSSID() {
    var prefixes = ["Home", "Office", "Network", "WiFi", "AndroidAP", "Guest", 
                   "TP-Link", "Netgear", "Linksys", "Cisco", "D-Link", "Xiaomi"];
    var suffixes = ["_2.4G", "_5G", "_EXT", "_SECURE", "_PRIVATE", "_WORK"];
    
    var randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    var randomNum = Math.floor(Math.random() * 999) + 1;
    
    return randomPrefix + randomNum;
}

Java.perform(function() {
    //console.log("[+] Iniciando hook de SSID WiFi aleatório");
    
    // 1. Hook principal: WifiInfo.getSSID() - MÉTODO MAIS COMUM
    try {
        var WifiInfo = Java.use("android.net.wifi.WifiInfo");
        
        WifiInfo.getSSID.implementation = function() {
            var randomSSID = generateRandomSSID();
            //console.log("[+] WifiInfo.getSSID() interceptado");
            //console.log("[+] Retornando SSID aleatório: \"" + randomSSID + "\"");
            return "\"" + randomSSID + "\""; // Aspas são padrão no Android
        };
        
        //console.log("[✓] Hook do WifiInfo.getSSID() aplicado");
    } catch (e) {
        //console.log("[-] Erro no hook WifiInfo.getSSID(): " + e);
    }
    
    // 2. Hook para métodos alternativos que podem retornar SSID
    try {
        var WifiManager = Java.use("android.net.wifi.WifiManager");
        
        WifiManager.getConnectionInfo.implementation = function() {
            //console.log("[+] WifiManager.getConnectionInfo() interceptado");
            return this.getConnectionInfo(); // Deixa o hook do WifiInfo cuidar do resto
        };
        
        //console.log("[✓] Hook do WifiManager.getConnectionInfo() aplicado");
    } catch (e) {
        //console.log("[-] Erro no hook WifiManager: " + e);
    }
    
    // 3. Hook para NetworkInfo.getExtraInfo() (método mais antigo)
    try {
        var NetworkInfo = Java.use("android.net.NetworkInfo");
        
        NetworkInfo.getExtraInfo.implementation = function() {
            if (this.getType() === 1) { // TYPE_WIFI = 1
                var randomSSID = generateRandomSSID();
                //console.log("[+] NetworkInfo.getExtraInfo() para WiFi");
                //console.log("[+] Retornando: " + randomSSID);
                return randomSSID;
            }
            return this.getExtraInfo();
        };
        
        //console.log("[✓] Hook do NetworkInfo.getExtraInfo() aplicado");
    } catch (e) {
        //console.log("[-] NetworkInfo não encontrado: " + e);
    }
    
    //console.log("\n[✓] Hooks aplicados com sucesso!");
    //console.log("[+] Testando geração de SSIDs:");
    for (var i = 0; i < 3; i++) {
        //console.log("    " + (i+1) + ". " + generateRandomSSID());
    }
    //console.log("\n[+] Pronto! Agora seu app verá SSIDs aleatórios.");
});

// Comandos para usar no console Frida:
function showCurrentSSID() {
    Java.perform(function() {
        try {
            var wifiManager = Java.use("android.net.wifi.WifiManager");
            var context = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
            var wm = context.getSystemService("wifi");
            var info = wm.getConnectionInfo();
            //console.log("[+] SSID atual reportado: " + info.getSSID());
        } catch(e) {
            //console.log("[-] Erro: " + e);
        }
    });
}

function setFixedSSID(ssidName) {
    // Sobrescreve a função para retornar um SSID fixo
    generateRandomSSID = function() {
        return ssidName;
    };
    //console.log("[✓] SSID fixado para: " + ssidName);
}