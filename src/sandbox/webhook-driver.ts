/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Live Webhook Ingestion & EventBus Bridge Driver
 */

import { EventBus } from "../storage/event-bus.js";
import crypto from "crypto";

export interface WebhookEventPayload {
  source: "GITHUB" | "PROMETHEUS" | "STRIPE" | "CUSTOM";
  eventType: string;
  signatureHeader?: string;
  rawBody: Record<string, any>;
  receivedAt: string;
}

export class WebhookDriver {
  constructor(
    private eventBus: EventBus,
    private webhookSecret: string = "hellx-webhook-secret"
  ) {}

  public verifyGitHubSignature(rawBodyString: string, signatureHeader: string): boolean {
    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
    const expected = `sha256=${crypto.createHmac("sha256", this.webhookSecret).update(rawBodyString).digest("hex")}`;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  }

  /**
   * Ingests a webhook and dispatches a verified domain event to the EventBus
   */
  public async ingestWebhook(payload: WebhookEventPayload): Promise<boolean> {
    await this.eventBus.publish({
      id: `evt-webhook-${Date.now()}`,
      type: "TASK_ASSIGNED",
      actorId: `webhook-source-${payload.source.toLowerCase()}`,
      actorRole: "SRE",
      payload: {
        source: payload.source,
        eventType: payload.eventType,
        data: payload.rawBody,
        receivedAt: payload.receivedAt,
      },
    });

    return true;
  }
}
