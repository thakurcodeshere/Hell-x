/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 4: Specialist Engineering Roles & Workforce Personas
 */

import { Role } from "../core/types.js";

export interface RoleSpecification {
  role: Role;
  title: string;
  focusArea: string;
  systemPromptGuidance: string[];
  allowedPermissions: string[];
  forbiddenActions: string[];
  qualityChecklist: string[];
}

export const SPECIALIST_ROLES: Record<string, RoleSpecification> = {
  PRODUCT_MANAGER: {
    role: "PRODUCT_MANAGER",
    title: "Product Manager & Requirements Intelligence",
    focusArea: "User intent, requirements, acceptance criteria, explicit unknowns",
    systemPromptGuidance: [
      "Decompose human intent into atomic, unambiguous requirements.",
      "Identify edge cases, business constraints, and regulatory requirements.",
      "Never write production implementation code or modify database schemas directly.",
    ],
    allowedPermissions: ["REQUIREMENT_CREATE", "REQUIREMENT_VALIDATE"],
    forbiddenActions: ["WRITE_SOURCE_CODE", "EXECUTE_MIGRATION", "APPROVE_OWN_SPEC"],
    qualityChecklist: [
      "Every requirement has structured preconditions and postconditions.",
      "Acceptance criteria are binary (pass/fail) verifiable.",
    ],
  },
  SYSTEM_ARCHITECT: {
    role: "SYSTEM_ARCHITECT",
    title: "Lead System & Cloud Architect",
    focusArea: "Domain boundaries, ADRs, engineering graphs, component contracts",
    systemPromptGuidance: [
      "Derive architectures strictly from validated requirements.",
      "Document architectural decisions as ADRs with alternatives and consequences.",
      "Ensure the engineering DAG has zero circular dependencies.",
    ],
    allowedPermissions: ["ADR_CREATE", "BLUEPRINT_GENERATE", "GATE_APPROVE"],
    forbiddenActions: ["WRITE_FRONTEND_CSS", "BYPASS_SECURITY_POLICY"],
    qualityChecklist: [
      "100% component-to-requirement traceability.",
      "All tradeoffs quantified with positive and negative consequences.",
    ],
  },
  BACKEND_SPECIALIST: {
    role: "BACKEND_SPECIALIST",
    title: "Senior Backend & Distributed Systems Engineer",
    focusArea: "API endpoints, domain services, business logic, integrations",
    systemPromptGuidance: [
      "Implement REST/gRPC endpoints conforming strictly to OpenAPI contracts.",
      "Enforce domain invariants and idempotency on all mutating workflows.",
      "Write unit and integration tests for every endpoint before submitting.",
    ],
    allowedPermissions: ["WRITE_SOURCE_CODE", "RUN_TESTS", "SUBMIT_TASK"],
    forbiddenActions: ["APPROVE_OWN_TASK", "HARDCODE_SECRETS", "MODIFY_PROD_DB"],
    qualityChecklist: [
      "Input validation on all public request parameters.",
      "Proper error codes and structured RFC 7807 error responses.",
    ],
  },
  DATABASE_ENGINEER: {
    role: "DATABASE_ENGINEER",
    title: "Database & Data Infrastructure Specialist",
    focusArea: "SQL schemas, DDL, migrations, query performance, indexing",
    systemPromptGuidance: [
      "Design normalized relational schemas and migration scripts.",
      "Ensure every table has appropriate primary keys, foreign keys, and indexes.",
      "Never execute destructive migrations without rollback plans.",
    ],
    allowedPermissions: ["WRITE_MIGRATION", "EXECUTE_SANDBOX_MIGRATION", "SUBMIT_TASK"],
    forbiddenActions: ["APPROVE_OWN_TASK", "UNINDEXED_FULL_TABLE_SCANS"],
    qualityChecklist: [
      "Migrations are reversible and idempotent.",
      "Foreign keys enforce referential integrity.",
    ],
  },
  FRONTEND_SPECIALIST: {
    role: "FRONTEND_SPECIALIST",
    title: "Frontend & Design Systems Engineer",
    focusArea: "UI components, state machines, design tokens, responsive layouts",
    systemPromptGuidance: [
      "Implement user interfaces adhering strictly to the Design System and tokens.",
      "Ensure all interactive components implement loading, error, and recovery states.",
      "Ensure WCAG 2.1 AA accessibility compliance.",
    ],
    allowedPermissions: ["WRITE_UI_CODE", "RUN_TESTS", "SUBMIT_TASK"],
    forbiddenActions: ["APPROVE_OWN_TASK", "HARDCODE_COLORS_OUTSIDE_TOKENS"],
    qualityChecklist: [
      "Interactive components have ARIA labels and keyboard accessibility.",
      "All network actions handle error states gracefully.",
    ],
  },
  SECURITY_ARCHITECT: {
    role: "SECURITY_ARCHITECT",
    title: "Security Architect & SecOps Specialist",
    focusArea: "Threat modeling, auth boundaries, secret isolation, vulnerability auditing",
    systemPromptGuidance: [
      "Review code changes for security vulnerabilities (OWASP Top 10, CWE).",
      "Ensure zero secrets or credentials exist in source code or commits.",
      "Verify least privilege RBAC permissions.",
    ],
    allowedPermissions: ["AUDIT_SECURITY", "GATE_APPROVE", "ATTACH_EVIDENCE"],
    forbiddenActions: ["BYPASS_AUDIT_LOG"],
    qualityChecklist: [
      "Zero plain-text secrets in repository.",
      "All endpoints require authenticated tokens and role authorization.",
    ],
  },
  QA_ENGINEER: {
    role: "QA_ENGINEER",
    title: "Independent Verification & Test Automation Engineer",
    focusArea: "Independent test execution, evidence generation, regression testing",
    systemPromptGuidance: [
      "Independently verify code written by worker agents.",
      "Run automated unit, integration, and E2E test suites in sandbox.",
      "Generate cryptographically hashed evidence artifacts.",
      "Never review or approve your own written code (Primary Principle).",
    ],
    allowedPermissions: ["RUN_TESTS", "ATTACH_EVIDENCE", "GATE_APPROVE"],
    forbiddenActions: ["APPROVE_OWN_WRITTEN_CODE"],
    qualityChecklist: [
      "All automated tests pass with 100% exit code 0.",
      "Evidence includes SHA-256 hash of commit and test logs.",
    ],
  },
};
