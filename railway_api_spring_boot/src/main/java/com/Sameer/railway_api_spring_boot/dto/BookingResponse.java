package com.Sameer.railway_api_spring_boot.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class BookingResponse {
    private String pnr;
    private String status;       // CONFIRMED / WAITLIST
    private String seatNumber;   // null if waitlisted
    private String coachNumber;  // null if waitlisted
}