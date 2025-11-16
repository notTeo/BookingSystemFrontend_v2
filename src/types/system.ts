export interface HealthPayload {
    ok: boolean;
  }
  
  export interface StatusPayload {
    ok: boolean;
    uptimeSec: number;
    db: {
      ok: boolean;
      latencyMs: number;
    };
  }