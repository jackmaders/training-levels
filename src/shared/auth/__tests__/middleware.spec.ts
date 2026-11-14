import { describe, expect, it, vi } from "vite-plus/test";

import { permissionMiddleware } from "@/shared/auth/middleware";
import { hasPermission, type Permission } from "@/shared/auth/permissions";
import { ensureSession } from "@/shared/auth/session.server";
import { ApplicationError } from "@/shared/errors";
import {
  TEST_ADMIN_SESSION,
  TEST_SESSION,
  createSessionFixture,
  createUserFixture,
} from "@test/vitest/fixtures/session";

vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("@/shared/auth/permissions"), { spy: true });

const ALL_PERMISSIONS = [
  "curriculum:read",
  "progress:update",
] as const satisfies readonly Permission[];

const ROLE_SESSION_CASES = [
  { role: "admin", sessionFixture: TEST_ADMIN_SESSION },
  { role: "user", sessionFixture: TEST_SESSION },
] as const;

function getPermissionServerMiddleware(permission: Permission) {
  const serverFn = permissionMiddleware(permission).options.server;
  if (!serverFn) {
    throw new TypeError("Expected server middleware to be defined");
  }
  return serverFn;
}

type MiddlewareInput = Parameters<ReturnType<typeof getPermissionServerMiddleware>>[0];

describe("permissionMiddleware behavior", () => {
  it.each(
    ALL_PERMISSIONS.flatMap((permission) =>
      ROLE_SESSION_CASES.map(({ role, sessionFixture }) => ({
        permission,
        role,
        sessionFixture,
      })),
    ),
  )(
    "passes the session to next when $role has $permission",
    async ({ permission, sessionFixture }) => {
      expect.assertions(2);

      // Arrange
      vi.mocked(ensureSession).mockResolvedValueOnce(sessionFixture);
      const next = vi.fn<() => Promise<{ status: string }>>().mockResolvedValueOnce({
        status: "success",
      });
      const serverFn = getPermissionServerMiddleware(permission);
      const input = { context: {}, next } as unknown as MiddlewareInput;

      // Act
      const result = await serverFn(input);

      // Assert
      expect(next).toHaveBeenCalledWith({
        context: { session: sessionFixture.session, user: sessionFixture.user },
      });
      expect(result).toStrictEqual({ status: "success" });
    },
  );

  it("rejects when hasPermission returns false and does not call next", async () => {
    expect.assertions(3);

    // Arrange
    vi.mocked(ensureSession).mockResolvedValueOnce(TEST_SESSION);
    vi.mocked(hasPermission).mockReturnValueOnce(false);
    const next = vi.fn<() => Promise<void>>();
    const serverFn = getPermissionServerMiddleware("progress:update");
    const input = { context: {}, next } as unknown as MiddlewareInput;

    // Act
    const action = serverFn(input);

    // Assert
    await expect(action).rejects.toThrow(ApplicationError);
    await expect(action).rejects.toMatchObject({
      code: "USER_FORBIDDEN",
      statusCode: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("propagates error when ensureSession fails and does not call next", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(ensureSession).mockRejectedValueOnce(new Error("Unauthorized"));
    const next = vi.fn<() => Promise<void>>();
    const serverFn = getPermissionServerMiddleware("curriculum:read");
    const input = { context: {}, next } as unknown as MiddlewareInput;

    // Act & Assert
    await expect(serverFn(input)).rejects.toThrow("Unauthorized");
    expect(next).not.toHaveBeenCalled();
  });
});

describe("permissionMiddleware role validation", () => {
  it.each(["guest", "", "constructor", "__proto__"])(
    "rejects an unrecognized session role: %s",
    async (role) => {
      expect.assertions(2);

      // Arrange
      vi.mocked(ensureSession).mockResolvedValueOnce(
        createSessionFixture({
          user: createUserFixture({ role: role as typeof TEST_SESSION.user.role }),
        }),
      );
      const next = vi.fn<() => Promise<void>>();
      const serverFn = getPermissionServerMiddleware("curriculum:read");
      const input = { context: {}, next } as unknown as MiddlewareInput;

      // Act
      const action = serverFn(input);

      // Assert
      await expect(action).rejects.toMatchObject({ code: "USER_FORBIDDEN", statusCode: 403 });
      expect(next).not.toHaveBeenCalled();
    },
  );
});
