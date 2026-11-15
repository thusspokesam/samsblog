# Burn-in procedure

**Status:** Template · Not approved  
**Owner:** To be assigned  
**Approver:** To be assigned  
**Last reviewed:** Pending  
**Applies to:** To be defined

!!! info "Before use"
    Complete and approve this document for the applicable platform. Store internal evidence in an approved access-controlled location.

## Approved test plan

Complete this plan before running a sustained load.

| Parameter | Required definition |
| --- | --- |
| Platform and baseline | Hardware configuration and approved version combination |
| Workload | Approved accelerator, CPU, memory, storage, and network coverage |
| Duration and stages | Platform-specific duration, load levels, warm-up, and cooldown |
| Limits | Vendor-supported power, thermal, and health boundaries |
| Pass criteria | Defined stability, error, and performance requirements |
| Stop conditions | Faults or limits that require immediate termination |
| Owners | Operator, reviewer, and escalation contact |

No universal burn-in duration or threshold is specified here.

## Procedure

1. Confirm [validation](validation-procedure.md) passed and testing is authorized.
2. Capture idle health, event logs, configuration, and telemetry.
3. Run the approved staged workload while continuously monitoring health.
4. Record errors, resets, throttling, link events, and performance deviations.
5. Stop on approved abort conditions and preserve evidence.
6. After cooldown, review health and compare before-and-after events.
7. Obtain review and record Pass, Fail, or Incomplete.

## Failure and retest

Record the fault, investigation, corrective action, and retest scope. Require a documented acceptance decision before [onboarding](onboarding-process.md).
