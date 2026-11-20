import { ArrowLeft, ChevronRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/shadcn/accordion";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";

import { getBehaviorById } from "../model/stub-data";

export interface TheoryBehaviorPageProps {
  levelId: string;
  behaviorId: string;
}

export function TheoryBehaviorPage({ levelId, behaviorId }: TheoryBehaviorPageProps) {
  const match = getBehaviorById(levelId, behaviorId);

  if (!match) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/theory" />}>
          <ArrowLeft className="size-3.5" />
          Back to Theory
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Behavior not found</CardTitle>
            <CardDescription>
              No behavior "{behaviorId}" was found in "{levelId}".
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<a href="/theory" />}>
              Theory Hub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<a href={`/theory/${levelId}`} />}
            >
              View Level
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { level, behavior } = match;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Button variant="ghost" size="xs" nativeButton={false} render={<a href="/theory" />}>
          Theory
        </Button>
        <ChevronRight className="size-3.5" />
        <Button
          variant="ghost"
          size="xs"
          nativeButton={false}
          render={<a href={`/theory/${level.id}`} />}
        >
          Level {level.number}
        </Button>
        <ChevronRight className="size-3.5" />
        <span className="px-1 font-medium text-foreground">{behavior.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <Badge variant="secondary">Level {level.number}</Badge>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{behavior.name}</h1>
          <p className="text-sm text-muted-foreground">{behavior.summary}</p>
        </div>

        <Button nativeButton={false} render={<a href="/training/session" />}>
          Train This Behavior
        </Button>
      </header>

      <section className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Prerequisites:</span>
        {behavior.prerequisites.length > 0 ? (
          behavior.prerequisites.map((prereq) => (
            <Badge key={prereq} variant="outline">
              {prereq}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary">None (entry behavior)</Badge>
        )}
      </section>

      <Separator />

      <section aria-labelledby="behavior-theory-heading" className="space-y-2">
        <h2 id="behavior-theory-heading" className="font-heading text-base font-semibold">
          Theory & Mechanics
        </h2>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          {behavior.theory.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="step-criteria-heading" className="space-y-3">
        <h2 id="step-criteria-heading" className="font-heading text-base font-semibold">
          Step Criteria Reference
        </h2>

        <Card>
          <CardContent>
            <Accordion>
              {behavior.steps.map((step) => (
                <AccordionItem key={step.step} value={`step-${step.step}`}>
                  <AccordionTrigger>
                    Step {step.step}: {step.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-foreground">{step.criteria}</p>
                    {step.notes ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Coaching note: {step.notes}
                      </p>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
