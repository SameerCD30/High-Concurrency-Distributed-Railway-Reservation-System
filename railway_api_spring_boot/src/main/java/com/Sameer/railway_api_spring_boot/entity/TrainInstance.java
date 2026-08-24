package com.Sameer.railway_api_spring_boot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "train_instances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TrainInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_id", nullable = false)
    private Train train;

    @Column(name = "journey_date", nullable = false)
    private LocalDate journeyDate;

    @Column(nullable = false)
    private String status = "OPEN";
}