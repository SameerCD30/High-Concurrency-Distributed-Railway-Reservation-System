package com.Sameer.railway_api_spring_boot.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalTime;
import java.util.Map;

@Getter
@AllArgsConstructor
public class TrainSearchResult {
    private Long trainId;
    private String trainNumber;
    private String trainName;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private Integer distanceKm;
    private Map<String, Long> availableSeats;
}