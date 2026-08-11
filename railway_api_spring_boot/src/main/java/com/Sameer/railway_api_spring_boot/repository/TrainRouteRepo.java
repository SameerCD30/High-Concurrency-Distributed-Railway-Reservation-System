package com.Sameer.railway_api_spring_boot.repository;

import com.Sameer.railway_api_spring_boot.entity.TrainRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TrainRouteRepo extends JpaRepository<TrainRoute, Long> {

    // gives you the full ordered stop list for one train
    List<TrainRoute> findByTrainIdOrderBySequenceNoAsc(Long trainId);

    // the search query: find train IDs where fromStation comes before toStation
    @Query("""
        SELECT tr1.train.id
        FROM TrainRoute tr1
        JOIN TrainRoute tr2 ON tr1.train.id = tr2.train.id
        WHERE tr1.station.id = :fromStationId
          AND tr2.station.id = :toStationId
          AND tr1.sequenceNo < tr2.sequenceNo
        """)
    List<Long> findTrainIdsBetweenStations(
            @Param("fromStationId") Long fromStationId,
            @Param("toStationId") Long toStationId
    );

    // fetch the specific route row for a given train+station (needed to get times/seq)
    TrainRoute findByTrainIdAndStationId(Long trainId, Long stationId);
}