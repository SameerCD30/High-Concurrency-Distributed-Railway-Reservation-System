package com.Sameer.railway_api_spring_boot.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter @Setter
public class BookingRequest {
    private Long trainId;
    private LocalDate journeyDate;
    private String classType;       // "SL", "3A", "2A"
    private Long fromStationId;
    private Long toStationId;
    private String passengerName;
    private Integer passengerAge;
}