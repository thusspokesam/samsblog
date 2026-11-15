# Validation procedure

**Status:** Template · Not approved  
**Owner:** To be assigned  
**Approver:** To be assigned  
**Last reviewed:** Pending  
**Applies to:** To be defined

!!! info "Before use"
    Complete and approve this document for the applicable platform. Store internal evidence in an approved access-controlled location.

## Validation checklist

| Area | Required evidence | Acceptance criterion |
| --- | --- | --- |
| Inventory | Expected server and accelerator inventory | Matches approved design |
| Hardware health | Management-controller health and event review | No unresolved blocking faults |
| Firmware / software | Installed version report | Matches approved baseline or approved exception |
| Accelerators | Detection, device health, and diagnostic results | Expected count and approved diagnostic outcome |
| Network | Link, addressing, routing, DNS, time, and required service checks | Matches approved connectivity plan |
| Storage | Capacity, mounts, permissions, and health checks | Matches approved storage design |
| Security | Access and hardening review | Approved security baseline satisfied |
| Observability | Metrics, logs, and test alert evidence | Events reach the assigned operational owner |
| Functional readiness | Agreed workload smoke test | Approved functional criteria met |

## Execution and evidence

Record each check as Pass, Fail, or Not applicable with a reason, timestamp, operator, and evidence reference. Define platform-specific commands and thresholds in the controlled runbook.

## Gate decision

Do not mark validation complete with unresolved blocking failures. Record remediation or an explicitly approved exception, obtain reviewer acceptance, and proceed to [burn-in](burn-in-procedure.md).
