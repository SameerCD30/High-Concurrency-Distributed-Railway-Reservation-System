package com.Sameer.railway_api_spring_boot.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "passenger_bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PassengerBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id")
    private Seat seat;

    @Column(name = "passenger_name", nullable = false)
    private String passengerName;

    @Column(name = "passenger_age", nullable = false)
    private Integer passengerAge;

    @Column(name = "board_seq", nullable = false)
    private Integer boardSeq;

    @Column(name = "deboard_seq", nullable = false)
    private Integer deboardSeq;

    @Column(nullable = false)
    private String status = "CONFIRMED";
}