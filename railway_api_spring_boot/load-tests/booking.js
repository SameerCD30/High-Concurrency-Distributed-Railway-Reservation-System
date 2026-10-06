import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

const confirmed = new Counter('bookings_confirmed');
const waitlisted = new Counter('bookings_waitlisted');

export const options = {
    scenarios: {
        rush: {
            executor: 'shared-iterations',
            vus: 50,
            iterations: 200,
            maxDuration: '2m',
        },
    },
    summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

const DATE = __ENV.DATE || '2032-05-01';

export default function () {
    const body = JSON.stringify({
        trainId: 2, journeyDate: DATE, classType: 'SL',
        fromStationId: 6, toStationId: 9,
        passengerName: `Load ${__VU}-${__ITER}`, passengerAge: 30,
    });
    const res = http.post('http://localhost:8080/api/bookings', body,
        { headers: { 'Content-Type': 'application/json' } });

    const ok = check(res, { 'status is 200': (r) => r.status === 200 });
    if (ok) {
        if (res.json('status') === 'CONFIRMED') confirmed.add(1);
        else waitlisted.add(1);
    }
}