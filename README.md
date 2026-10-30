# Grafana k6 Performance Testing Lab

This repository contains the scripts and HTML reports for the Grafana k6
lab. The tests use the public QuickPizza demo API and cover basic k6
checks, thresholds, and performance-test scenarios.

## Requirements

-   Windows
-   Grafana k6 installed and available from Command Prompt (`k6`
    command)
-   A working internet connection to access
    `https://quickpizza.grafana.com`
-   A code editor such as Visual Studio Code

Check that k6 is available:

``` cmd
k6 version
```

## Project structure

``` text
k6-lab/
├── 01-first-test.js
├── 04-pizza-api.js
├── 05-no-token.js
├── 06-thresholds.js
├── 07-requirement.js
├── 08-bug-hunt.js
├── explore.js
├── journey.js
├── a1-smoke.js
├── a2-average.js
├── a3-stress.js
├── a4-spike.js
├── a5-soak.js
├── RESULTS.md
├── README.md
└── reports/
    ├── a2-average.html
    ├── a3-stress.html
    ├── a4-spike.html
    └── a5-soak.html
```

The `reports` directory contains the exported HTML dashboards from
A2--A5. Create the directory before running those commands if it does
not already exist:

``` cmd
mkdir reports
```

## Run the tests

Open Command Prompt and change to the project directory:

``` cmd
cd /d "D:\Pimthida\University\Y3\T1\QA\Lab\k6-lab"
```

### Part 0 --- Basics

``` cmd
k6 run 01-first-test.js
k6 run --vus 5 --duration 20s 01-first-test.js
k6 run --vus 5 --iterations 20 01-first-test.js
k6 run 04-pizza-api.js
k6 run 05-no-token.js
k6 run 06-thresholds.js
k6 run -e P95=300 06-thresholds.js
k6 run 07-requirement.js
k6 run 08-bug-hunt.js
```

After a test that has thresholds, check its exit code immediately in
CMD:

``` cmd
echo %ERRORLEVEL%
```

A k6 run with passing thresholds normally returns exit code `0`. A
threshold failure in this lab returned exit code `99`.

### Part A --- User journey tests

Run the smoke test:

``` cmd
k6 run a1-smoke.js
```

Run the average-load test and export its HTML report:

``` cmd
k6 run --out web-dashboard=export=reports/a2-average.html a2-average.js
```

Run the stress test:

``` cmd
k6 run --out web-dashboard=export=reports/a3-stress.html a3-stress.js
```

Run the spike test:

``` cmd
k6 run --out web-dashboard=export=reports/a4-spike.html a4-spike.js
```

Run the soak test:

``` cmd
k6 run --out web-dashboard=export=reports/a5-soak.html a5-soak.js
```

The lab scenarios use a maximum of 5 VUs. The soak test is the longer
11-minute scenario with a maximum of 2 VUs. Follow the lab's load and
duration limits; do not increase them against a public service.

## View the reports

After each report-export command finishes, open the corresponding
`.html` file in a web browser. The reports show metrics over time,
including request rate, response duration, VUs, and transfer rate.

## Results

See [RESULTS.md](RESULTS.md) for:

-   Part 0 measurements and threshold exit codes
-   A1--A5 performance-test results
-   Analysis of the spike and soak graphs
-   Answers to the nine reflection questions

## Important note

The tests target a public demo service. Results can vary due to shared
service load and internet conditions. Run only the load levels permitted
by the lab and never perform high-load testing against systems without
explicit authorization.
