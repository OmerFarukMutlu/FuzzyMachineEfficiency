package com.example.fuzzymachineefficiency.service;

// DTO paket ismin farklıysa burayı düzelt

import com.example.fuzzymachineefficiency.dto.MachineAnalizResponse;
import com.example.fuzzymachineefficiency.dto.MachineDataRequest;
import net.sourceforge.jFuzzyLogic.FIS;
import net.sourceforge.jFuzzyLogic.FunctionBlock;
import net.sourceforge.jFuzzyLogic.rule.Variable;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class FuzzyService {

    // DİKKAT: Bu dosya adının src/main/resources içindeki dosya ile HARFİ HARFİNE aynı olduğundan emin ol.
    private static final String FCL_FILENAME = "machineefficiency.fcl";

    public MachineAnalizResponse hesapla(MachineDataRequest request) {

        // 1. ADIM: FCL Dosyasını Yükle
        // getResourceAsStream kullanıyoruz ki .jar olduğunda da çalışsın.
        InputStream in = this.getClass().getClassLoader().getResourceAsStream(FCL_FILENAME);

        // InputStream'in null olup olmadığını burada kontrol etmek daha güvenlidir
        if (in == null) {
            throw new RuntimeException("HATA: FCL dosyası bulunamadı! Lütfen 'src/main/resources/" + FCL_FILENAME + "' dosyasını kontrol et.");
        }

        FIS fis = FIS.load(in, true);

        if (fis == null) {
            throw new RuntimeException("HATA: FIS yüklenemedi. FCL dosya içeriğinde sözdizimi hatası olabilir.");
        }

        // 2. ADIM: Fonksiyon Bloğunu (FunctionBlock) Al
        // Dosyada tek bir FUNCTION_BLOCK tanımladığımız için null diyerek varsayılanı alabiliriz.
        FunctionBlock fb = fis.getFunctionBlock(null);

        // 3. ADIM: Girdileri (Inputs) Set Et
        // Dikkat: Buradaki isimler ("uretimMiktari" vb.) FCL dosyasındaki VAR_INPUT isimleriyle AYNI olmalı.
        fb.setVariable("uretimMiktari", request.getUretimMiktari());
        fb.setVariable("hataPayi", request.getHataPayi());
        fb.setVariable("bakimAraligi", request.getBakimAraligi());
        fb.setVariable("beklemeSuresi", request.getBeklemeSuresi());
        fb.setVariable("enerjiTuketimi", request.getEnerjiTuketimi());

        // 4. ADIM: Motoru Çalıştır (Evaluate)
        fb.evaluate();

        // 5. ADIM: Sonucu (Output) Oku
        Variable sonucDegiskeni = fb.getVariable("verimlilikSkoru");

        // Puanı al (Örn: 87.453...)
        double puan = sonucDegiskeni.getValue();

        // Eğer FCL bir sonuç üretemezse (kural dışı durum), varsayılan 0 gelir.
        if (Double.isNaN(puan)) {
            puan = 0.0;
        }

        // 6. ADIM: Cevabı Hazırla (Response DTO)
        MachineAnalizResponse response = new MachineAnalizResponse();

        // Puanı virgülden sonra 2 hane olacak şekilde yuvarla
        response.setVerimlilikPuani(Math.round(puan * 100.0) / 100.0);

        // Puanın sözel karşılığını bul (Java tarafında hızlı kontrol)
        response.setVerimlilikDurumu(puanaGoreDurumGetir(puan));

        return response;
    }

    /**
     * FCL'den çıkan 0-100 arasındaki puana göre sözel durum döner.
     * Bu metot FCL'deki DEFUZZIFY bloklarıyla uyumlu olmalıdır.
     */
    private String puanaGoreDurumGetir(double puan) {
        if (puan >= 90) return "Çok İyi (Efsane)";
        if (puan >= 75) return "İyi (Verimli)";
        if (puan >= 50) return "Orta (Standart)";
        if (puan >= 25) return "Kötü (Verimsiz)";
        return "Çok Kötü (Kritik)";
    }
}