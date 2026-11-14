import { describe, expect, it } from "vite-plus/test";

import type { UserRole } from "../../db/schema";
import { hasPermission, type Permission } from "../permissions";

const ALL_PERMISSIONS = [
  "curriculum:read",
  "progress:update",
] as const satisfies readonly Permission[];

describe("hasPermission authorization helper", () => {
  describe.each(["admin", "user"] as const)("%s role", (role) => {
    it.each(ALL_PERMISSIONS)("grants %s permission", (permission) => {
      expect.assertions(1);

      // Act
      const result = hasPermission(role, permission);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("missing or unrecognized role", () => {
    it("denies permission when role is undefined", () => {
      expect.assertions(1);

      // Act
      const result = hasPermission(undefined, "curriculum:read");

      // Assert
      expect(result).toBe(false);
    });

    it("denies permission for unrecognized roles", () => {
      expect.assertions(1);

      // Act
      const result = hasPermission("guest" as unknown as UserRole, "curriculum:read");

      // Assert
      expect(result).toBe(false);
    });
  });
});
