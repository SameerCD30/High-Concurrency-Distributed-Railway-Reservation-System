package com.Sameer.railway_api_spring_boot.Service;

import com.Sameer.railway_api_spring_boot.dto.TrainSearchResult;
import com.Sameer.railway_api_spring_boot.entity.Train;
import com.Sameer.railway_api_spring_boot.entity.TrainRoute;
import com.Sameer.railway_api_spring_boot.repository.TrainRepo;
import com.Sameer.railway_api_spring_boot.repository.TrainRouteRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainSearchService {

    private final TrainRouteRepo trainRouteRepo;
    private final TrainRepo trainRepo;

    public List<TrainSearchResult> searchTrains(Long fromStationId, Long toStationId) {
        List<Long> trainIds = trainRouteRepo.findTrainIdsBetweenStations(fromStationId, toStationId);

        return trainIds.stream().map(trainId -> {
            Train train = trainRepo.findById(trainId).orElseThrow();
            TrainRoute fromRoute = trainRouteRepo.findByTrainIdAndStationId(trainId, fromStationId);
            TrainRoute toRoute = trainRouteRepo.findByTrainIdAndStationId(trainId, toStationId);

            int distance = toRoute.getDistanceKm() - fromRoute.getDistanceKm();

            return new TrainSearchResult(
                    train.getId(),
                    train.getNumber(),
                    train.getName(),
                    fromRoute.getDepartureTime(),
                    toRoute.getArrivalTime(),
                    distance
            );
        }).collect(Collectors.toList());
    }
}