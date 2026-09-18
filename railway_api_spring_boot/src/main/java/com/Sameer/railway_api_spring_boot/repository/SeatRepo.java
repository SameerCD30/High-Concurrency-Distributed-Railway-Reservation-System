package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

import java.util.List;

public interface SeatRepo extends JpaRepository<Seat, Long> {

    List<Seat> findByCoachIdOrderBySeatNumberAsc(Long coachId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :seatId")
    Seat findByIdForUpdate(Long seatId);
}