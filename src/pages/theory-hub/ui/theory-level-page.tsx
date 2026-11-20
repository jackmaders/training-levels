import { ArrowLeft, ArrowRight } from "lucide-react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";

import { getLevelById } from "../model/stub-data";

export interface TheoryLevelPageProps {
  levelId: string;
}

export function TheoryLevelPage({ levelId }: TheoryLevelPageProps) {
  const level = getLevelById(levelId);

  if (!level) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/theory" />}>
          <ArrowLeft className="size-3.5" />
          Back to Theory
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Level not found</CardTitle>
            <CardDescription>
              No curriculum level matches "{levelId}". Return to the Theory hub to browse Levels
              1–4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" nativeButton={false} render={<a href="/theory" />}>
              Browse Theory Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/theory" />}>
          <ArrowLeft className="size-3.5" />
          Theory
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Level {level.number}</Badge>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{level.title}</h1>
          <p className="text-sm text-muted-foreground">{level.focus}</p>
        </div>

        <Button nativeButton={false} render={<a href={`/training?level=${level.id}`} />}>
          Train Level
          <ArrowRight className="size-4" />
        </Button>
      </header>

      <section className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {level.overview.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <Separator />

      <section aria-labelledby="behaviors-heading" className="space-y-4">
        <h2 id="behaviors-heading" className="font-heading text-base font-semibold">
          Behaviors in Level {level.number}
        </h2>

        <div className="space-y-3">
          {level.behaviors.map((behavior) => (
            <Card key={behavior.id}>
              <CardHeader>
                <CardTitle>{behavior.name}</CardTitle>
                <CardDescription>{behavior.summary}</CardDescription>
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<a href={`/theory/${level.id}/${behavior.id}`} />}
                  >
                    Read criteria
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{behavior.steps.length} steps</Badge>
                {behavior.prerequisites.length > 0 ? (
                  behavior.prerequisites.map((prereq) => (
                    <Badge key={prereq} variant="outline">
                      Requires: {prereq}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No prerequisites</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
