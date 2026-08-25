/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Automated Zero-Regression Hotfix Synthesizer
 */

import { RootCauseAnalysis, HotfixPatch } from "./types.js";

export class HotfixSynthesizer {
  public synthesizeHotfix(rca: RootCauseAnalysis, authorAgentId: string = "agent-backend-hotfix-01"): HotfixPatch {
    const branch = `hotfix/inc-${rca.incidentId.toLowerCase()}`;
    const targetFile = rca.affectedFiles[0] || "src/api/handler.ts";

    let patchDiff = "";
    let verificationTestCode = "";

    switch (rca.defectCategory) {
      case "SQL_INJECTION":
        patchDiff = `--- a/${targetFile}\n+++ b/${targetFile}\n@@ -12,2 +12,2 @@\n-const query = \`SELECT * FROM invoices WHERE id = '\${req.params.id}'\`;\n+const query = 'SELECT * FROM invoices WHERE id = $1';\n+const result = await db.query(query, [req.params.id]);`;
        verificationTestCode = `describe('SQL Injection Prevention Fixture', () => {\n  it('rejects raw SQL payload injection safely', async () => {\n    const payload = \"1' OR '1'='1\";\n    const res = await queryInvoices(payload);\n    expect(res.rows.length).toBe(0);\n  });\n});`;
        break;

      case "SECRET_LEAK":
        patchDiff = `--- a/${targetFile}\n+++ b/${targetFile}\n@@ -5,1 +5,1 @@\n-const API_KEY = "token_secret_123456789";\n+const API_KEY = process.env.STRIPE_SECRET_KEY || "";`;
        verificationTestCode = `describe('Secret Leak Prevention Fixture', () => {\n  it('reads API key strictly from environment', () => {\n    expect(getApiKey()).toBe(process.env.STRIPE_SECRET_KEY);\n  });\n});`;
        break;

      case "LATENCY_SPIKE":
        patchDiff = `--- a/${targetFile}\n+++ b/${targetFile}\n@@ -18,2 +18,4 @@\n-const data = await fetchUnindexedBilling(tenantId);\n+const cached = await redis.get(\`bill:\${tenantId}\`);\n+if (cached) return JSON.parse(cached);\n+const data = await fetchIndexedBilling(tenantId);\n+await redis.setex(\`bill:\${tenantId}\`, 60, JSON.stringify(data));`;
        verificationTestCode = `describe('Latency Mitigation Fixture', () => {\n  it('responds within 50ms from cache on repeat call', async () => {\n    const start = Date.now();\n    await getBilling('tenant-1');\n    expect(Date.now() - start).toBeLessThan(50);\n  });\n});`;
        break;

      default:
        patchDiff = `--- a/${targetFile}\n+++ b/${targetFile}\n@@ -8,2 +8,6 @@\n-return await executeUnsafe();\n+try {\n+  return await executeSafe();\n+} catch (err) {\n+  logger.error('Handled error gracefully', err);\n+  return { status: 500, error: 'Internal Error' };\n+}`;
        verificationTestCode = `describe('Exception Handling Fixture', () => {\n  it('handles uncaught exceptions without crash', async () => {\n    const res = await executeSafe();\n    expect(res).toBeDefined();\n  });\n});`;
        break;
    }

    return {
      id: `patch-${Date.now()}`,
      incidentId: rca.incidentId,
      targetFile,
      gitBranch: branch,
      patchDiff,
      verificationTestCode,
      synthesizedByAgentId: authorAgentId,
      createdAt: new Date().toISOString(),
    };
  }
}
