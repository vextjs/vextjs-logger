export const smallPayload = {
  requestId: "req-1",
  method: "GET",
  route: "/health",
  statusCode: 200
};

export const childBindings = {
  service: "api",
  region: "local",
  requestId: "req-1"
};

export const nestedPayload = {
  requestId: "req-1",
  user: {
    id: "user-1",
    role: "admin"
  },
  route: {
    method: "POST",
    path: "/api/orders",
    params: {
      id: "order-1"
    }
  },
  metrics: {
    durationMs: 12.3,
    dbMs: 4.2
  }
};

export const fixtureError = new Error("database timeout");
fixtureError.code = "ETIMEDOUT";
