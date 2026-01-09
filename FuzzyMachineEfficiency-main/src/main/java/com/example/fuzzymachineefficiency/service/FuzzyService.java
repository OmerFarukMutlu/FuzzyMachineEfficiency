package com.example.fuzzymachineefficiency.service;

import com.example.fuzzymachineefficiency.dto.MachineAnalysisResponse;
import com.example.fuzzymachineefficiency.dto.MachineDataRequest;
import net.sourceforge.jFuzzyLogic.FIS;
import net.sourceforge.jFuzzyLogic.FunctionBlock;
import net.sourceforge.jFuzzyLogic.rule.Variable;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
public class FuzzyService {

    private static final String FCL_FILENAME = "machineefficiency.fcl";

    public MachineAnalysisResponse calculate(MachineDataRequest request) {
        InputStream in = this.getClass().getClassLoader().getResourceAsStream(FCL_FILENAME);
        if (in == null) {
            throw new RuntimeException("ERROR: FCL file not found! Check resources folder.");
        }

        FIS fis = FIS.load(in, true);
        if (fis == null) {
            throw new RuntimeException("ERROR: FIS loading failed.");
        }

        FunctionBlock fb = fis.getFunctionBlock(null);


        fb.setVariable("productionAmount", request.getDailyProduction());
        fb.setVariable("errorRate", request.getErrorMargin());
        fb.setVariable("maintenanceInterval", request.getMaintenanceInterval());
        fb.setVariable("standbyTime", request.getStandbyTime()); 
        fb.setVariable("energyConsumption", request.getEnergyConsumption());

        fb.evaluate();

        Variable resultVariable = fb.getVariable("efficiencyScore");

        double score = resultVariable.getValue();

        if (Double.isNaN(score)) {
            score = 50.0;
        }

        MachineAnalysisResponse response = new MachineAnalysisResponse();
        response.setEfficiencyScore(Math.round(score * 100.0) / 100.0);
        response.setEfficiencyStatus(getStatusBasedOnScore(score));

        return response;
    }

    private String getStatusBasedOnScore(double score) {
        if (score >= 85) return "Very Good (Legendary)";
        if (score >= 70) return "Good (Efficient)";
        if (score >= 45) return "Medium (Standard)";
        if (score >= 25) return "Bad (Inefficient)";
        return "Very Bad (Critical)";
    }
}