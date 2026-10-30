# K6 Lab Results

## Part 0: K6 Basics

### Step 0.1 --- First test

-   Virtual users: 1
-   Iterations: 1
-   HTTP status: 200
-   Checks: 1/1 passed (100%)
-   `http_req_duration`: average 418.98 ms
-   `http_req_failed`: 0%

### Step 0.2 --- 5 VUs for 20 seconds

Command:

``` cmd
k6 run --vus 5 --duration 20s 01-first-test.js
```

-   Virtual users: 5
-   Duration: 20 seconds
-   HTTP requests: 38
-   Request rate: 1.693733 requests/second
-   `http_req_duration` p(95): 5.81 s
-   Average response time: 1.44 s
-   Maximum response time: 11.75 s
-   Checks: 38/38 passed (100%)
-   `http_req_failed`: 0%

The request rate stayed below 5 requests/second because 5 VUs do not
necessarily generate one request every second. Each VU waits for the
request to finish and follows the script's pacing (including its
sleep/think time) before sending another request. Network and server
response time also affect how many iterations each VU can complete.

### Step 0.3 --- Fixed number of iterations

Command:

``` cmd
k6 run --vus 5 --iterations 20 01-first-test.js
```

-   Maximum VUs: 5
-   Iterations: 20 shared among the VUs
-   HTTP requests: 20
-   Request rate: 2.698288 requests/second
-   `http_req_duration`: average 400.65 ms, p(95) 445.02 ms, maximum
    2.02 s
-   Checks: 20/20 passed (100%)
-   `http_req_failed`: 0%
-   Actual run time: 7.4 seconds

The test stopped after completing the 20 shared iterations.

### Step 0.4 --- Pizza API

-   Virtual users: 1
-   Iterations: 1
-   Checks: 3/3 passed (status 200, pizza name, vegetarian ingredients)
-   Average `http_req_duration`: 629.43 ms
-   `http_req_failed`: 0%

### Step 0.5 --- Request without token

-   The check that verifies a request without a token is refused passed:
    1/1.
-   Average `http_req_duration`: 735.01 ms
-   `http_req_failed`: 0%

### Step 0.6 --- Thresholds

**Normal run**

Command:

``` cmd
k6 run 06-thresholds.js
```

-   Checks: 132/132 passed (100%)
-   `http_req_duration` p(95): 387.09 ms; threshold `<1500 ms` passed
-   `http_req_failed`: 0%; threshold `<1%` passed
-   Exit code: **0**

**Run with a stricter p(95) threshold**

Command:

``` cmd
k6 run -e P95=300 06-thresholds.js
```

-   Checks: 122/122 passed (100%)
-   `http_req_duration` p(95): 1.32 s (1,320 ms); threshold `<300 ms`
    failed
-   `http_req_failed`: 0%; threshold `<1%` passed
-   Exit code: **99**

The second run failed because the measured p(95) response time (1,320
ms) was greater than the configured 300 ms limit. The HTTP requests and
checks themselves still succeeded.

### Step 0.7 --- Performance requirement

**Normal run**

-   Checks: 90/90 passed (100%)
-   `http_req_duration` p(95): 2.39 s; requirement `<1000 ms` failed
-   `http_req_duration` p(99): 3.69 s; requirement `<1500 ms` failed
-   `http_req_failed`: 0%; requirement `<1%` passed
-   HTTP requests: 45
-   Average response time: 936.38 ms
-   Maximum response time: 4.48 s

**After changing the p(95) threshold to `<1 ms`**

-   Checks: 102/102 passed (100%)
-   p(95): 2.1 s; threshold failed
-   p(99): 2.39 s; threshold failed
-   `http_req_failed`: 0%; threshold passed
-   Exit code: **99**

The response-time thresholds failed, even though the checks passed and
no HTTP request failures were recorded.

### Step 0.8 --- Bug hunt

The original request used lowercase values:

``` js
excludedIngredients: ['pepperoni'],
excludedTools: ['knife'],
```

The API's returned names use capitalization (`Pepperoni` and `Knife`).
Changing the request values to the exact names fixed the checks:

``` js
excludedIngredients: ['Pepperoni'],
excludedTools: ['Knife'],
```

**Before the fix (5 VUs, 20 seconds):** - Checks passed: 188/213
(88.26%) - Checks failed: 25/213 (11.73%) - The `no pepperoni` and
`no knife needed` checks failed intermittently. - HTTP request failure
rate: 0%

**After the fix (5 VUs, 20 seconds):** - Checks passed: 201/201 (100%) -
Checks failed: 0 - HTTP request failure rate: 0% - HTTP requests: 67 -
Average response time: 464.84 ms - p(95): 1.19 s - Maximum response
time: 2.32 s

The problem was the case-sensitive ingredient/tool names in the request,
not an HTTP transport failure.

------------------------------------------------------------------------

## Part A: Performance test scenarios

### A1--A5 results

The table uses the maximum VUs, the `http_reqs` rate, p(95) and maximum
`http_req_duration`, HTTP failure rate, and check success rate from each
run.

  ------------------------------------------------------------------------------------
  Test         Maximum   Requests/sec      p(95)        Max       HTTP   Checks passed
                 users                             response     failed 
                                                       time            
  --------- ---------- -------------- ---------- ---------- ---------- ---------------
  A1 Smoke           1       0.571609     1.15 s     1.17 s         0%    100% (27/27)

  A2                 3       1.776018     1.24 s     2.45 s         0%  100% (480/480)
  Average                                                              

  A3 Stress          5       2.695557     1.57 s     8.91 s         0%  100% (729/729)

  A4 Spike           5       1.207476     1.61 s     5.39 s         0%  100% (255/255)

  A5 Soak            2       1.393538     1.13 s     4.58 s         0%            100%
                                                                         (1,380/1,380)
  ------------------------------------------------------------------------------------

### A1 --- Smoke test

-   1 VU for 30 seconds
-   Checks: 27/27 passed
-   HTTP request failure rate: 0%
-   Overall p(95): 1.15 s
-   Maximum response time: 1.17 s

The smoke test completed successfully. It verified that the basic user
journey worked with a single VU.

### A2 --- Average-load test

-   Up to 3 VUs over 3 minutes
-   HTTP requests: 320
-   Request rate: 1.776018 requests/second
-   Checks: 480/480 passed
-   HTTP request failure rate: 0%
-   Overall p(95): 1.24 s
-   Maximum response time: 2.45 s

The checks and HTTP failure thresholds passed. However, the `home`
group's p(95) was 1.37 s, so its threshold of `<1000 ms` failed. The
`recommendation` group's p(95) was 1.11 s, so its threshold of
`<1500 ms` passed.

### A3 --- Stress test

-   Up to 5 VUs over 3 minutes
-   HTTP requests: 486
-   Request rate: 2.695557 requests/second
-   Checks: 729/729 passed
-   HTTP request failure rate: 0%
-   p(95): 1.57 s
-   Maximum response time: 8.91 s

The test reached 5 VUs without recorded HTTP request failures or failed
checks. Response times showed a longer tail, including a maximum of 8.91
seconds.

### A4 --- Spike test

-   Up to 5 VUs during the spike stage
-   Test duration: 2 minutes 20 seconds
-   HTTP requests: 170
-   Request rate: 1.207476 requests/second
-   Checks: 255/255 passed
-   HTTP request failure rate: 0%
-   p(95): 1.61 s
-   Maximum response time: 5.39 s

From the VU and HTTP request duration graphs, response time rose during
the higher-load period and returned close to its earlier level
approximately 5--10 seconds after the VU count dropped back to 1. This
recovery time is an estimate from the graph, not a directly reported k6
metric.

### A5 --- Soak test

-   Up to 2 VUs over 11 minutes
-   HTTP requests: 920
-   Request rate: 1.393538 requests/second
-   Checks: 1,380/1,380 passed
-   HTTP request failure rate: 0%
-   Average response time: 404.11 ms
-   p(95): 1.13 s
-   Maximum response time: 4.58 s

The overview graph showed response-time fluctuations and occasional
peaks, but no clear continuous upward trend over the test. The HTTP
request failure rate remained at 0%. Based on this 11-minute run, no
clear degradation was observed. A longer soak test could reveal issues
that need more time to develop.

------------------------------------------------------------------------

## Part B: Reflection questions

### 1. Fill in the A1--A5 results table.

See the A1--A5 results table above. It reports maximum VUs, request
rate, p(95), maximum response time, HTTP failure rate, and check success
rate.

### 2. Why did the request rate stay below 5 requests/second with 5 VUs in Step 0.2?

Five VUs do not mean five requests are sent every second. Each VU waits
for its current request to complete and follows the script's pacing,
including any sleep or think time, before starting another iteration.
Server response time and network latency also reduce the number of
iterations each VU can complete per second.

### 3. Did response time grow from the average-load test to the stress test? Explain using the operational envelope.

Yes. The overall p(95) increased from 1.24 s in A2 (up to 3 VUs) to 1.57
s in A3 (up to 5 VUs). The maximum response time also increased from
2.45 s to 8.91 s. This indicates slower tail response under the higher
load. However, the stress run still recorded 0% HTTP request failures
and 100% checks passed. The observed results show increased latency at 5
VUs, but do not show request failures within the tested range. The A2
`home` p(95) threshold was already exceeded, so that performance target
was not met even at average load.

### 4. In the spike test, how long did response time take to return to normal after the spike?

The graph suggests approximately 5--10 seconds after the VU count
dropped back to 1. This is an estimate based on the plotted
response-time trend.

### 5. In the soak test, did response time or error rate get worse? Name a defect a multi-hour soak could reveal.

No clear continuous increase in response time was observed during the
11-minute test, and the HTTP request failure rate remained at 0%.
Response time fluctuated and had occasional peaks. A multi-hour soak
test could reveal a memory leak, where memory usage gradually increases
and eventually causes slower performance or an application crash.

### 6. Why use p(95) rather than the average response time in thresholds?

The average can hide slow requests because fast responses can pull the
average down. p(95) describes the response-time boundary for 95% of
requests and gives a better view of the slower experiences near the
tail. It helps detect performance problems that an average alone may
conceal.

### 7. Give two reasons tests against a shared public internet site differ from tests against a lab system.

1.  The public service is shared with other users, so its load and
    response time can change independently of this test.
2.  Internet routing, network congestion, and latency vary between the
    tester and the public server. These factors are outside the tester's
    control.

### 8. Why should you never run stress, spike, or breakpoint tests with hundreds of users against a site you do not own?

A high-load test can consume resources, slow down the service for real
users, cause errors or outages, and be mistaken for a denial-of-service
attack. Only test systems you own or have explicit permission to test,
and follow the agreed load limits.

### 9. Rewrite a vague performance requirement for an application used daily as a testable requirement, and show k6 thresholds.

**Vague requirement:** The application should be fast and reliable for
daily users.

**Testable requirement (example):** Under the agreed normal daily
workload, at least 95% of HTTP requests must complete in less than 2
seconds, fewer than 1% of HTTP requests may fail, and at least 99% of
defined checks must pass.

Example k6 thresholds:

``` js
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};
```

The workload (such as the number of VUs and test duration) should also
be specified and agreed for the application being tested.
