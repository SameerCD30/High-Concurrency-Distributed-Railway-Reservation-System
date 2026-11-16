package com.Sameer.railway_api_spring_boot.controller;

import com.Sameer.railway_api_spring_boot.entity.Station;
import com.Sameer.railway_api_spring_boot.repository.StationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {
    @Autowired
    StationRepo stationRepo;

    @GetMapping
    public ResponseEntity<List<Station>> getStations(){
        return new ResponseEntity<>(stationRepo.findAll(), HttpStatus.OK);
    }

}