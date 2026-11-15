# Internal benchmarking procedure

**Status:** Template · Not approved  
**Owner:** To be assigned  
**Approver:** To be assigned  
**Last reviewed:** Pending  
**Applies to:** To be defined

!!! info "Before use"
    Complete and approve this document for the applicable platform. Store internal evidence in an approved access-controlled location.

## Purpose

Define a repeatable method for measuring AI infrastructure performance.

## Before testing

- [ ] Confirm authorization, test scope, and isolation from production workloads.
- [ ] Identify the approved platform baseline and test suite version.
- [ ] Define the workload, measurement method, repetitions, and acceptance criteria.
- [ ] Confirm monitoring, evidence storage, and stop conditions.
- [ ] Record configuration and confirm no unresolved readiness faults.

## Execution

1. Capture inventory, software versions, settings, and initial telemetry.
2. Run the agreed warm-up.
3. Execute the fixed workload and parameters for the approved repetitions.
4. Collect raw output, resource utilization, power, thermals, and error events.
5. Record deviations and repeat only under a documented method.
6. Summarize results and variability without discarding unexplained outliers.

## Stop conditions

Stop and investigate hardware faults, unsafe thermal conditions, data integrity errors, or other limits defined by the platform owner. Exact limits must be approved for the hardware.

## Review and publication

Review reproducibility, baseline compliance, and exceptions. Record the decision in [benchmarking results](benchmarking-results.md). Internal raw evidence must remain access controlled.
