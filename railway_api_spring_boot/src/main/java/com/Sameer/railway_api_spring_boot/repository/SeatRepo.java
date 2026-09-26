package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

import java.util.List;

public interface SeatRepo extends JpaRepository<Seat, Long> {

    List<Seat> findByCoachIdOrderBySeatNumberAsc(Long coachId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :seatId")
    Seat findByIdForUpdate(Long seatId);

    @Query(value = """
        SELECT COUNT(*)
        FROM seats s
        JOIN coaches c ON c.id = s.coach_id
        WHERE c.train_id = :trainId
          AND c.class_type = :classType
          AND NOT EXISTS (
              SELECT 1
              FROM passenger_bookings pb
              JOIN bookings b ON b.id = pb.booking_id
              JOIN train_instances ti ON ti.id = b.train_instance_id
              WHERE pb.seat_id = s.id
                AND ti.train_id = :trainId
                AND ti.journey_date = :journeyDate
                AND pb.status = 'CONFIRMED'
                AND pb.board_seq < :deboardSeq
                AND :boardSeq < pb.deboard_seq
          )
        """, nativeQuery = true)
    long countAvailableSeats(@Param("trainId") Long trainId,
                             @Param("journeyDate") LocalDate journeyDate,
                             @Param("classType") String classType,
                             @Param("boardSeq") int boardSeq,
                             @Param("deboardSeq") int deboardSeq);
}