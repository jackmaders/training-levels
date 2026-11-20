import { ArrowLeft } from "lucide-react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import { COMEBEFORE_PREREQUISITES, FOUNDATION_ARTICLES } from "../model/stub-data";

export function TheoryFoundationsPage() {
  const defaultTab = FOUNDATION_ARTICLES[0]?.id ?? "how-levels-work";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/theory" />}>
          <ArrowLeft className="size-3.5" />
          Back to Theory
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Foundations</h1>
        <p className="text-sm text-muted-foreground">
          Essential learning theory, marker mechanics, and Comebefore prerequisites underpinning
          Levels 1–4.
        </p>
      </header>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap">
          {FOUNDATION_ARTICLES.map((article) => (
            <TabsTrigger key={article.id} value={article.id}>
              {article.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {FOUNDATION_ARTICLES.map((article) => (
          <TabsContent key={article.id} value={article.id} className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{article.title}</CardTitle>
                  <Badge variant="secondary">{article.readTime}</Badge>
                </div>
                <CardDescription>{article.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {article.sections.map((section, index) => (
                  <div key={section.heading} className="space-y-1.5">
                    {index > 0 ? <Separator className="mb-4" /> : null}
                    <h2 className="font-heading text-sm font-semibold">{section.heading}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                  </div>
                ))}

                {article.id === "comebefore-prerequisites" ? (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h2 className="font-heading text-sm font-semibold">Key Comebefore Chains</h2>
                      <div className="divide-y rounded-lg border">
                        {COMEBEFORE_PREREQUISITES.map((item) => (
                          <div key={item.id} className="space-y-1.5 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-medium">{item.behavior}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {item.requires.map((req) => (
                                  <Badge key={req} variant="outline">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
