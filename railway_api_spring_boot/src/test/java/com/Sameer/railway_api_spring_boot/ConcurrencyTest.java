package com.Sameer.railway_api_spring_boot;

import com.Sameer.railway_api_spring_boot.dto.BookingRequest;
import com.Sameer.railway_api_spring_boot.dto.BookingResponse;
import com.Sameer.railway_api_spring_boot.Service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest
public class ConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Test
    void manyUsersBookingSameSeatSimultaneously() throws InterruptedException {

        int numberOfThreads = 20;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(numberOfThreads);
        AtomicInteger confirmedCount = new AtomicInteger(0);
        AtomicInteger waitlistedCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final int passengerNum = i;
            executor.submit(() -> {
                try {
                    startGate.await();

                    BookingRequest req = new BookingRequest();
                    req.setTrainId(2L);
                    req.setJourneyDate(LocalDate.of(2026, 9, 20));
                    req.setClassType("SL");
                    req.setFromStationId(6L);
                    req.setToStationId(9L);
                    req.setPassengerName("Concurrent-" + passengerNum);
                    req.setPassengerAge(30);

                    BookingResponse resp = bookingService.createBooking(req);

                    if ("CONFIRMED".equals(resp.getStatus())) {
                        confirmedCount.incrementAndGet();
                    } else {
                        waitlistedCount.incrementAndGet();
                    }

                } catch (Exception e) {
                    System.out.println("Thread failed: " + e.getMessage());
                } finally {
                    doneSignal.countDown();
                }
            });
        }

        startGate.countDown();
        doneSignal.await(30, TimeUnit.SECONDS);
        executor.shutdown();

        System.out.println("Confirmed: " + confirmedCount.get());
        System.out.println("Waitlisted: " + waitlistedCount.get());
    }
}