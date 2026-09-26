package com.Sameer.railway_api_spring_boot.Service;

import com.Sameer.railway_api_spring_boot.dto.TrainSearchResult;
import com.Sameer.railway_api_spring_boot.entity.Train;
import com.Sameer.railway_api_spring_boot.entity.TrainRoute;
import com.Sameer.railway_api_spring_boot.repository.CoachRepo;
import com.Sameer.railway_api_spring_boot.repository.TrainRepo;
import com.Sameer.railway_api_spring_boot.repository.TrainRouteRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainSearchService {

    private final TrainRouteRepo trainRouteRepo;
    private final TrainRepo trainRepo;
    private final CoachRepo coachRepo;
    private final AvailabilityService availabilityService;

    public List<TrainSearchResult> searchTrains(Long fromStationId, Long toStationId, LocalDate journeyDate) {
        List<Long> trainIds = trainRouteRepo.findTrainIdsBetweenStations(fromStationId, toStationId);

        return trainIds.stream().map(trainId -> {
            Train train = trainRepo.findById(trainId).orElseThrow();
            TrainRoute fromRoute = trainRouteRepo.findByTrainIdAndStationId(trainId, fromStationId);
            TrainRoute toRoute = trainRouteRepo.findByTrainIdAndStationId(trainId, toStationId);

            int distance = toRoute.getDistanceKm() - fromRoute.getDistanceKm();

            Map<String, Long> availableSeats = new LinkedHashMap<>();
            for (String classType : coachRepo.findClassTypesByTrainId(trainId)) {
                long count = availabilityService.getAvailableSeats(
                        trainId, journeyDate, classType,
                        fromRoute.getSequenceNo(), toRoute.getSequenceNo());
                availableSeats.put(classType, count);
            }

            return new TrainSearchResult(
                    train.getId(),
                    train.getNumber(),
                    train.getName(),
                    fromRoute.getDepartureTime(),
                    toRoute.getArrivalTime(),
                    distance,
                    availableSeats
            );
        }).collect(Collectors.toList());
    }
}