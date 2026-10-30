import http from 'k6/http';

const BASE_URL = 'https://quickpizza.grafana.com';

const PARAMS = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'token abcdef0123456789',
  },
};

export default function () {
  const body = JSON.stringify({
    excludedIngredients: ['pepperoni'],
    excludedTools: ['knife'],
  });

  const res = http.post(`${BASE_URL}/api/pizza`, body, PARAMS);

  console.log('STATUS: ' + res.status);
  console.log('RESPONSE: ' + res.body);
}