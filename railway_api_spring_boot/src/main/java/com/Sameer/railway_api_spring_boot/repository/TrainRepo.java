package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainRepo extends JpaRepository<Train, Long> {
    Train findByNumber(String number);
}