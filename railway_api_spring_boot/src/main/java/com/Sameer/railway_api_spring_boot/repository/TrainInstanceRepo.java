package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.TrainInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface TrainInstanceRepo extends JpaRepository<TrainInstance, Long> {
    Optional<TrainInstance> findByTrainIdAndJourneyDate(Long trainId, LocalDate journeyDate);
}