package com.Sameer.railway_api_spring_boot.Service;

import com.Sameer.railway_api_spring_boot.dto.BookingRequest;
import com.Sameer.railway_api_spring_boot.dto.BookingResponse;
import com.Sameer.railway_api_spring_boot.entity.*;
import com.Sameer.railway_api_spring_boot.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final TrainInstanceRepo trainInstanceRepo;
    private final TrainRouteRepo trainRouteRepo;
    private final CoachRepo coachRepo;
    private final SeatRepo seatRepo;
    private final BookingRepo bookingRepo;
    private final PassengerBookingRepo passengerBookingRepo;

    @Transactional
    public BookingResponse createBooking(BookingRequest req) {

        //create the train_instance for this date
        TrainInstance instance = trainInstanceRepo
                .findByTrainIdAndJourneyDate(req.getTrainId(), req.getJourneyDate())
                .orElseGet(() -> {
                    TrainInstance ti = new TrainInstance();
                    ti.setTrain(new Train(req.getTrainId(), null, null, null)); // just need the id reference
                    ti.setJourneyDate(req.getJourneyDate());
                    ti.setStatus("OPEN");
                    return trainInstanceRepo.save(ti);
                });

        //board/deboard sequence numbers from train_routes
        TrainRoute fromRoute = trainRouteRepo.findByTrainIdAndStationId(req.getTrainId(), req.getFromStationId());
        TrainRoute toRoute = trainRouteRepo.findByTrainIdAndStationId(req.getTrainId(), req.getToStationId());
        int boardSeq = fromRoute.getSequenceNo();
        int deboardSeq = toRoute.getSequenceNo();

        //get all seats in the requested class for this train
        List<Coach> coaches = coachRepo.findByTrainIdAndClassType(req.getTrainId(), req.getClassType());

        Seat availableSeat = null;
        outer:
        for (Coach coach : coaches) {
            List<Seat> seats = seatRepo.findByCoachIdOrderBySeatNumberAsc(coach.getId());
            for (Seat seat : seats) {
                Seat lockedSeat = seatRepo.findByIdForUpdate(seat.getId());   // acquire lock first
                List<PassengerBooking> overlaps =
                        passengerBookingRepo.findOverlappingBookings(lockedSeat.getId(), instance.getId(), boardSeq, deboardSeq);
                if (overlaps.isEmpty()) {
                    availableSeat = lockedSeat;
                    break outer;
                }
            }
        }

        //create the booking record
        Booking booking = new Booking();
        booking.setPnr(generatePnr());
        booking.setTrainInstance(instance);
        booking.setStatus(availableSeat != null ? "CONFIRMED" : "WAITLISTED");
        booking = bookingRepo.save(booking);

        //create the passenger_booking record
        PassengerBooking pb = new PassengerBooking();
        pb.setBooking(booking);
        pb.setSeat(availableSeat);   // null if waitlisted
        pb.setPassengerName(req.getPassengerName());
        pb.setPassengerAge(req.getPassengerAge());
        pb.setBoardSeq(boardSeq);
        pb.setDeboardSeq(deboardSeq);
        pb.setStatus(availableSeat != null ? "CONFIRMED" : "WAITLIST");
        passengerBookingRepo.save(pb);

        // build response
        return new BookingResponse(
                booking.getPnr(),
                booking.getStatus(),
                availableSeat != null ? String.valueOf(availableSeat.getSeatNumber()) : null,
                availableSeat != null ? availableSeat.getCoach().getCoachNumber() : null
        );
    }

    private String generatePnr() {
        return "PNR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}