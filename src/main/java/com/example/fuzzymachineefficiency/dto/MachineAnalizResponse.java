package com.example.fuzzymachineefficiency.dto;

import lombok.Data;

@Data
public class MachineAnalizResponse {
    private double verimlilikPuani;   // Örn: 87.5
    private String verimlilikDurumu;  // Örn: "Çok İyi (Efsane)"
}
