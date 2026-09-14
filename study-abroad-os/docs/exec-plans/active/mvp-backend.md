# Active Execution Plan — MVP Backend Foundation

## Objective
Implement the first reliable vertical slice:
Create Account -> Create Student Profile -> Select University/Program/Intake -> Check Eligibility -> Save/Shortlist -> Start Application -> Generate Tasks.

## Sequence
1. Finalize ERD v0.1
2. Choose/finalize technical stack
3. Initialize repo/tooling
4. Implement auth
5. Implement profile domain
6. Implement university/program/intake data model
7. Implement structured requirements
8. Implement eligibility evaluation
9. Implement source/provenance layer
10. Implement application and task generation
11. Add tests and analytics events

## Definition of Done for the first slice
- schema migrated cleanly
- domain constraints documented
- eligibility rules have automated tests
- source metadata exists for critical records
- one seeded sample university/program/intake works end to end
- one sample user can create a profile and receive an eligibility result
- application can be created with generated tasks
