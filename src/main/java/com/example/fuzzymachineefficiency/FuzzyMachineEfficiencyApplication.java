package com.example.fuzzymachineefficiency;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationListener;

@Slf4j
@RequiredArgsConstructor
@SpringBootApplication(scanBasePackages = "com.example.fuzzymachineefficiency")
public class FuzzyMachineEfficiencyApplication implements ApplicationListener<ApplicationStartedEvent> {
    public static void main(String[] args) {
        SpringApplication.run(FuzzyMachineEfficiencyApplication.class,args);
    }

    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {

    }
}
