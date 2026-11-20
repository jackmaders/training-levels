import { ArrowLeft } from "lucide-react";

import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Separator } from "@/shared/ui/shadcn/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import { APPENDIX_ARTICLES } from "../model/stub-data";

export function TheoryAppendicesPage() {
  const defaultTab = APPENDIX_ARTICLES[0]?.id ?? "target-sticks";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/theory" />}>
          <ArrowLeft className="size-3.5" />
          Back to Theory
        </Button>
      </div>

      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Appendices</h1>
        <p className="text-sm text-muted-foreground">
          Practical tools, impulse-control variations, and troubleshooting playbooks.
        </p>
      </header>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex-wrap">
          {APPENDIX_ARTICLES.map((appendix) => (
            <TabsTrigger key={appendix.id} value={appendix.id}>
              {appendix.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {APPENDIX_ARTICLES.map((appendix) => (
          <TabsContent key={appendix.id} value={appendix.id} className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{appendix.title}</CardTitle>
                  <Badge variant="outline">{appendix.category}</Badge>
                </div>
                <CardDescription>{appendix.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appendix.sections.map((section, index) => (
                  <div key={section.heading} className="space-y-2">
                    {index > 0 ? <Separator className="mb-4" /> : null}
                    <h2 className="font-heading text-sm font-semibold">{section.heading}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                    {section.tips && section.tips.length > 0 ? (
                      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        {section.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
