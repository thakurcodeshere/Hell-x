/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Explicit Unknowns Engine (No Silent Hallucination)
 */

import { ExplicitUnknown } from "./types.js";
import { HellxError } from "../core/errors.js";

export class UnknownsEngine {
  private unknowns: Map<string, ExplicitUnknown> = new Map();

  public registerUnknown(params: {
    code?: string;
    category: ExplicitUnknown["category"];
    question: string;
    impactOnRequirements: string[];
    proposedDefaultAssumption: string;
  }): ExplicitUnknown {
    const count = this.unknowns.size + 1;
    const code = params.code || `UNKNOWN-${count.toString().padStart(3, "0")}`;
    const id = `unk-${Date.now()}-${count}`;

    const unknownItem: ExplicitUnknown = {
      id,
      code,
      category: params.category,
      question: params.question,
      impactOnRequirements: params.impactOnRequirements,
      proposedDefaultAssumption: params.proposedDefaultAssumption,
      status: "OPEN",
    };

    this.unknowns.set(unknownItem.id, unknownItem);
    return unknownItem;
  }

  public resolveUnknown(unknownIdOrCode: string, resolution: string, actorId: string): ExplicitUnknown {
    let target = this.unknowns.get(unknownIdOrCode);
    if (!target) {
      for (const u of this.unknowns.values()) {
        if (u.code === unknownIdOrCode) {
          target = u;
          break;
        }
      }
    }

    if (!target) {
      throw new HellxError(`Explicit unknown '${unknownIdOrCode}' not found.`, "UNKNOWN_NOT_FOUND");
    }

    target.status = "RESOLVED";
    target.resolution = resolution;
    target.resolvedByActorId = actorId;

    return target;
  }

  public getOpenUnknowns(): ExplicitUnknown[] {
    return Array.from(this.unknowns.values()).filter((u) => u.status === "OPEN");
  }

  public getAll(): ExplicitUnknown[] {
    return Array.from(this.unknowns.values());
  }

  public getUnknownsForRequirement(reqCode: string): ExplicitUnknown[] {
    return Array.from(this.unknowns.values()).filter((u) =>
      u.impactOnRequirements.includes(reqCode)
    );
  }
}
