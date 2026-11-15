# Deployment guide

**Status:** Template · Not approved  
**Owner:** To be assigned  
**Approver:** To be assigned  
**Last reviewed:** Pending  
**Applies to:** To be defined

!!! info "Before use"
    Complete and approve this document for the applicable platform. Store internal evidence in an approved access-controlled location.

## Prerequisites

- [ ] Approved design, change record, deployment scope, and accountable owner.
- [ ] Hardware inventory and [approved platform baseline](../product-engineering/approved-versions.md).
- [ ] Power, cooling, cabling, management access, network, DNS, and time services ready.
- [ ] Approved addressing, storage, access model, and credential handling.
- [ ] Recovery plan, escalation contacts, and evidence location.

## Deployment sequence

1. Record inventory and inspect hardware health before provisioning.
2. Apply the approved firmware and BIOS configuration.
3. Install the approved OS, storage layout, network configuration, and security baseline.
4. Install supported drivers, compute runtime, and required platform services.
5. Configure monitoring, logging, alert routing, and management integration.
6. Record the final configuration and any exceptions.
7. Complete [validation](validation-procedure.md), then [burn-in](burn-in-procedure.md).
8. Obtain acceptance before exposing capacity to provisioning or service consumers.

## Recovery and acceptance

Document rollback triggers, recovery actions, and the accountable decision maker in the deployment-specific plan. Attach the deployment record, validation results, and burn-in evidence to the handover.
