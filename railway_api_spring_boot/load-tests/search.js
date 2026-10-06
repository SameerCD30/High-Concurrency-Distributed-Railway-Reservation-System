import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 50,
    duration: '30s',
    summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

const URL = 'http://localhost:8080/api/search?fromStationId=6&toStationId=9&journeyDate=2031-01-15';

export default function () {
    const res = http.get(URL);
    check(res, { 'status is 200': (r) => r.status === 200 });
}