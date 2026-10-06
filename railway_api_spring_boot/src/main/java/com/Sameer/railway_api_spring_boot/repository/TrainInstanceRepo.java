package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.TrainInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

public interface TrainInstanceRepo extends JpaRepository<TrainInstance, Long> {
    Optional<TrainInstance> findByTrainIdAndJourneyDate(Long trainId, LocalDate journeyDate);
    @Modifying
    @Query(value = """
        INSERT INTO train_instances (train_id, journey_date, status)
        VALUES (:trainId, :journeyDate, 'OPEN')
        ON CONFLICT (train_id, journey_date) DO NOTHING
        """, nativeQuery = true)
    int insertIfAbsent(@Param("trainId") Long trainId, @Param("journeyDate") LocalDate journeyDate);
}
