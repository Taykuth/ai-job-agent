import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(
  overrides: Partial<AuthenticatedUser> = {}
): { ctx: TrpcContext; clearedCookies: { name: string; options: Record<string, unknown> }[] } {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    plan: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const { ctx } = createUserContext({ name: "Jane Doe", email: "jane@example.com" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.name).toBe("Jane Doe");
    expect(result?.email).toBe("jane@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("application.getUsage", () => {
  it("returns free plan usage info for free users", async () => {
    const { ctx } = createUserContext({ plan: "free" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.getUsage();

    expect(result.plan).toBe("free");
    expect(result.limit).toBe(5);
    expect(typeof result.used).toBe("number");
    expect(typeof result.canCreate).toBe("boolean");
  });

  it("returns unlimited for premium users", async () => {
    const { ctx } = createUserContext({ plan: "premium" });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.getUsage();

    expect(result.plan).toBe("premium");
    expect(result.limit).toBeNull();
    expect(result.canCreate).toBe(true);
  });
});

describe("cv.list", () => {
  it("returns an array for authenticated users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cv.list();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("application.list", () => {
  it("returns an array for authenticated users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.application.list();

    expect(Array.isArray(result)).toBe(true);
  });
});
