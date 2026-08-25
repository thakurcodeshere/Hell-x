/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * User Journey & Information Architecture Modeler
 */

import { RequirementArtifact } from "../core/artifacts.js";
import { UserJourney, UserJourneyStep } from "./types.js";

export class JourneyModeler {
  /**
   * Derives user journeys directly from requirements and workflows
   */
  public modelJourneys(requirements: RequirementArtifact[]): UserJourney[] {
    const journeys: UserJourney[] = [];

    for (const req of requirements) {
      const steps: UserJourneyStep[] = [];

      for (let i = 0; i < req.workflow.length; i++) {
        const stepText = req.workflow[i];
        steps.push({
          stepNumber: i + 1,
          name: `Step ${i + 1}: ${stepText.slice(0, 30)}`,
          userGoal: stepText,
          screenId: `screen-${req.code.toLowerCase()}-${i + 1}`,
          actionTaken: `Execute ${stepText}`,
          nextStepOnSuccess: i + 2 <= req.workflow.length ? i + 2 : "COMPLETE",
          nextStepOnError: "RETRY",
        });
      }

      journeys.push({
        id: `journey-${req.code.toLowerCase()}`,
        title: `${req.title} End-to-End User Journey`,
        actor: req.actor,
        description: `Guides ${req.actor} through ${req.objective}`,
        steps,
        traceRequirementCodes: [req.code],
      });
    }

    return journeys;
  }
}
