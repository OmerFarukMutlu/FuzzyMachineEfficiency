package com.example.fuzzymachineefficiency.dto;
import lombok.Data;

@Data // Lombok varsa bunu aç, alttaki Getter/Setter'ları sil.
public class MachineDataRequest {

    private double uretimMiktari;  // Adet
    private double hataPayi;       // %
    private double bakimAraligi;   // Gün
    private double beklemeSuresi;  // Saat
    private double enerjiTuketimi; // kWh
}