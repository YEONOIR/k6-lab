# K6 Lab Results

## Part 0: First Tests and Requirements

### Step 0.1 – First Test

- Script: `01-first-test.js`
- Initial attempt: K6 could not find the script file.
- After the script was available:
  - VUs: 1
  - Iterations: 1
  - Checks succeeded: 100% (1/1)
  - HTTP status: 200
  - Average response time: 418.98 ms
  - HTTP request failures: 0%

### Additional Test – 5 VUs for 20 Seconds

- Command: `k6 run --vus 5 --duration 20s 01-first-test.js`
- VUs: 5
- Duration: 20 seconds
- Total requests: 38
- Checks succeeded: 100% (38/38)
- Average response time: 1.44 s
- Median response time: 619.95 ms
- 95th percentile: 5.81 s
- Maximum response time: 11.75 s
- HTTP request failures: 0%

### Step 0.4 – Pizza API

- Script: `04-pizza-api.js`
- Checks:
  - Status is 200: PASS
  - Pizza has a name: PASS
  - Every ingredient is vegetarian: PASS
- Checks succeeded: 100% (3/3)
- Average response time: 629.43 ms
- HTTP request failures: 0%

### Step 0.5 – Request Without Token

- Script: `05-no-token.js`
- Check: Request without a token is refused.
- Result: PASS
- Checks succeeded: 100% (1/1)
- Average response time: 735.01 ms
- HTTP request failures: 0%

### Step 0.6 – Thresholds

**Normal threshold test**

- Script: `06-thresholds.js`
- VUs: 3
- Duration: 30 seconds
- Checks success rate: 100% (94/94) — PASS
- HTTP request failure rate: 0% — PASS
- p(95) requirement: less than 1500 ms
- Actual p(95): 2.45 s — FAIL
- Total requests: 47

**Test with environment variable P95=300**

- Command: `k6 run -e P95=300 06-thresholds.js`
- Actual p(95): 2.32 s
- Required p(95): less than 300 ms — FAIL
- Checks success rate: 100% (98/98)
- HTTP request failure rate: 0%
- Total requests: 49

### Step 0.7 – Requirement Test

- Script: `07-requirement.js`
- VUs: 3
- Duration: 30 seconds

**Normal run**

| Requirement | Actual result | Status |
|---|---:|---|
| p(95) < 1000 ms | 2390 ms | FAIL |
| p(99) < 1500 ms | 3690 ms | FAIL |
| http_req_failed < 1% | 0% | PASS |

- Total requests: 45
- Checks succeeded: 100% (90/90)
- Average response time: 936.38 ms
- Maximum response time: 4.48 s

**Modified threshold test**

- Changed p(95) threshold to less than 1 ms.
- Actual p(95): 2.1 s — FAIL
- Actual p(99): 2.39 s — FAIL
- HTTP request failure rate: 0% — PASS
- Checks succeeded: 100% (102/102)
- Total requests: 51
- Exit code: **99**
- Result: K6 exited with a threshold failure.

**Note:** The exact process exit code was not captured because `$LASTEXITCODE` was entered in CMD instead of PowerShell.

## Part A: Performance Test Results

| Test | Result |
|---|---|
| A1 – Smoke Test | Not recorded yet |
| A2 – Average Load Test | Not recorded yet |
| A3 – Stress Test | Not recorded yet |
| A4 – Spike Test | Not recorded yet |
| A5 – Soak Test | Not recorded yet |

## Part B: Reflection

Answers not recorded yet. Complete the reflection questions from the lab instructions.

## Notes

- All recorded tests used no more than 5 VUs.
- The 5-VU test ran for 20 seconds.
- Some response-time thresholds failed even though all checks passed and the HTTP request failure rate was 0%.
- A failed threshold does not necessarily mean that the HTTP request itself failed.
