package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.PassengerBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PassengerBookingRepo extends JpaRepository<PassengerBooking, Long> {

    @Query("""
    SELECT pb FROM PassengerBooking pb
    WHERE pb.seat.id = :seatId
      AND pb.booking.trainInstance.id = :trainInstanceId
      AND pb.status = 'CONFIRMED'
      AND pb.boardSeq < :deboardSeq
      AND :boardSeq < pb.deboardSeq
    """)
    List<PassengerBooking> findOverlappingBookings(
            @Param("seatId") Long seatId,
            @Param("trainInstanceId") Long trainInstanceId,
            @Param("boardSeq") Integer boardSeq,
            @Param("deboardSeq") Integer deboardSeq
    );
}