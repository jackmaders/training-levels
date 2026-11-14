import { createServerFn } from "@tanstack/react-start";

import { permissionMiddleware } from "@/shared/auth";

import { getCurriculumPageInputSchema, toggleStepInputSchema } from "./curriculum-schema";
import { getPage, getStepProgress, getSyllabus, toggleStep } from "./curriculum-service";

export const getCurriculumSyllabusFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .handler(() => getSyllabus());

export const getCurriculumPageFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .validator(getCurriculumPageInputSchema)
  .handler(({ data }) => getPage(data.pageSlug));

export const getStepProgressFn = createServerFn({ method: "GET" })
  .middleware([permissionMiddleware("curriculum:read")])
  .handler(async ({ context }) => await getStepProgress({ userId: context.user.id }));

export const toggleStepFn = createServerFn({ method: "POST" })
  .middleware([permissionMiddleware("progress:update")])
  .validator(toggleStepInputSchema)
  .handler(async ({ context, data }) => await toggleStep(data, { userId: context.user.id }));
