/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Mission Control Server & Web Dashboard Types
 */

export interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string;
  enableSSE: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface DAGGraphDTO {
  nodes: {
    id: string;
    code: string;
    title: string;
    targetRole: string;
    status: string;
    tier: number;
  }[];
  edges: {
    from: string;
    to: string;
  }[];
}

export interface CanaryStatusDTO {
  activeDeploymentId?: string;
  currentState: string;
  trafficPercentage: number;
  p99LatencyMs: number;
  errorRate: number;
  isHealthy: boolean;
}
