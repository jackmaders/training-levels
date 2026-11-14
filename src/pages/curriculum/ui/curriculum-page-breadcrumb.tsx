import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import type { CurriculumPage, CurriculumSyllabus } from "@/shared/curriculum-data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui/shadcn/breadcrumb";

import { getSectionFirstPage, toLevelRouteParams } from "../model/curriculum-levels";

interface CurriculumPageBreadcrumbProps extends ComponentProps<typeof Breadcrumb> {
  page: CurriculumPage;
  syllabus: CurriculumSyllabus;
}

function CurriculumPageBreadcrumb({ page, syllabus, ...props }: CurriculumPageBreadcrumbProps) {
  const currentSection = syllabus.sections.find(
    (section) => section.sectionSlug === page.sectionSlug,
  );
  const currentEntry = currentSection?.pages.find((entry) => entry.pageSlug === page.pageSlug);
  const levelTitle = currentSection?.title ?? page.sectionSlug;
  const leafTitle = currentEntry?.title ?? page.title;
  const firstPage = currentSection === undefined ? null : getSectionFirstPage(currentSection);
  const firstPageParams = firstPage === null ? null : toLevelRouteParams(firstPage.pageSlug);

  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {firstPageParams === null ? (
            <span>{levelTitle}</span>
          ) : (
            <BreadcrumbLink render={<Link params={firstPageParams} to="/levels/$section/$page" />}>
              {levelTitle}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{leafTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export { CurriculumPageBreadcrumb };
