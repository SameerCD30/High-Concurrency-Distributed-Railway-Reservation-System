package com.Sameer.railway_api_spring_boot.controller;

import com.Sameer.railway_api_spring_boot.dto.TrainSearchResult;
import com.Sameer.railway_api_spring_boot.Service.TrainSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class TrainSearchController {

    private final TrainSearchService trainSearchService;

    @GetMapping
    public List<TrainSearchResult> search(
            @RequestParam Long fromStationId,
            @RequestParam Long toStationId){
        return trainSearchService.searchTrains(fromStationId, toStationId);
    }
}