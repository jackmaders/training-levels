import { createServerFn } from "@tanstack/react-start";

import { permissionMiddleware } from "@/shared/auth";

import {
  getPageGeneralizationInputSchema,
  saveComeafterInputSchema,
  saveHomeworkInputSchema,
} from "./generalization-schema";
import {
  getPageGeneralization,
  saveComeafterRecord,
  saveHomeworkReflection,
} from "./generalization-service";

export const getPageGeneralizationFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .validator(getPageGeneralizationInputSchema)
  .handler(
    async ({ context, data }) =>
      await getPageGeneralization(data.pageSlug, { userId: context.user.id }),
  );

export const saveComeafterRecordFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(saveComeafterInputSchema)
  .handler(
    async ({ context, data }) => await saveComeafterRecord(data, { userId: context.user.id }),
  );

export const saveHomeworkReflectionFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(saveHomeworkInputSchema)
  .handler(
    async ({ context, data }) => await saveHomeworkReflection(data, { userId: context.user.id }),
  );
