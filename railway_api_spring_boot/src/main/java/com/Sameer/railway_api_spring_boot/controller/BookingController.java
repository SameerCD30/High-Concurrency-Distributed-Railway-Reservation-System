package com.Sameer.railway_api_spring_boot.controller;

import com.Sameer.railway_api_spring_boot.dto.BookingRequest;
import com.Sameer.railway_api_spring_boot.dto.BookingResponse;
import com.Sameer.railway_api_spring_boot.Service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public BookingResponse book(@RequestBody BookingRequest req) {
        return bookingService.createBooking(req);
    }
}