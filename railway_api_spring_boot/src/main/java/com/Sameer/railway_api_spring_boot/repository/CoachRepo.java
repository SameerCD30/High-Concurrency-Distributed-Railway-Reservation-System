package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.Coach;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CoachRepo extends JpaRepository<Coach, Long> {
    List<Coach> findByTrainId(Long trainId);
    List<Coach> findByTrainIdAndClassType(Long trainId, String classType);
    @Query(value = "SELECT DISTINCT class_type FROM coaches WHERE train_id = :trainId ORDER BY class_type",
            nativeQuery = true)
    List<String> findClassTypesByTrainId(@Param("trainId") Long trainId);
}