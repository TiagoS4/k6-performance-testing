import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getListUsers = new Trend('get_contacts', true);
export const RateContentOK = new Rate('content_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    get_contacts: ['p(99)<500'],
    content_OK: ['rate>0.95'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 60 },
    { duration: '60s', target: 120 },
    { duration: '60s', target: 180 },
    { duration: '60s', target: 240 },
    { duration: '60s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://reqres.in/api/users?page=2';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getListUsers.add(res.timings.duration);

  RateContentOK.add(res.status === OK);

  check(res, {
    'GET Contacts - Status 200': () => res.status === OK
  });
}

//Trabalho finalizado
