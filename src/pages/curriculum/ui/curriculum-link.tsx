import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

/** Renders an internal curriculum link supporting both typed routes and raw curriculum hrefs. */
function CurriculumLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} />;
}

export { CurriculumLink };
