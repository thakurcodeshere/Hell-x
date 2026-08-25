import { describe, it, expect } from "vitest";
import { WebhookDriver } from "../src/sandbox/webhook-driver.js";
import { EventBus } from "../src/storage/event-bus.js";
import crypto from "crypto";

describe("WebhookDriver (Milestone 9)", () => {
  it("verifies HMAC signature and publishes domain event", async () => {
    const bus = new EventBus();
    await bus.initialize();

    const secret = "test-secret-key-123";
    const driver = new WebhookDriver(bus, secret);

    const bodyStr = JSON.stringify({ action: "opened", pull_request: { number: 42 } });
    const hmac = `sha256=${crypto.createHmac("sha256", secret).update(bodyStr).digest("hex")}`;

    const isValid = driver.verifyGitHubSignature(bodyStr, hmac);
    expect(isValid).toBe(true);

    const ingested = await driver.ingestWebhook({
      source: "GITHUB",
      eventType: "pull_request.opened",
      signatureHeader: hmac,
      rawBody: JSON.parse(bodyStr),
      receivedAt: new Date().toISOString(),
    });

    expect(ingested).toBe(true);
  });
});
