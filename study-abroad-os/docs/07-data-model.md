# Data Model / ERD Direction v0.1

## Core entities
- User
- StudentProfile
- LanguageScore
- Country
- University
- Program
- Intake
- Requirement
- RequirementNationalityRule
- Scholarship
- ScholarshipRequirement
- ScholarshipBenefit
- SavedProgram / Shortlist
- Application
- ApplicationTask
- ApplicationDocument
- ApplicationDeadline
- Source
- SourceVersion
- Verification

## Later entities
- Community
- CommunityMembership
- CommunityPost/Thread
- MentorProfile
- MentorSkill
- MentorAvailability
- MentorBooking
- Review
- Payment
- Report
- HousingListing
- HousingProvider
- Property
- HousingVerification

## Relationship direction
Country -> University -> Program -> Intake -> Requirements

StudentProfile + Requirements -> EligibilityResult

StudentProfile -> Shortlist -> Application -> Tasks/Documents/Deadlines

University/Program/Scholarship/Application data -> Source/Version/Verification metadata

## Requirement modeling
Prefer structured rules where possible, e.g.:
- minimum_gpa >= value
- maximum_age <= value
- IELTS >= value
- HSK >= value
- nationality include/exclude

Retain original source text alongside normalized structured fields for traceability.
