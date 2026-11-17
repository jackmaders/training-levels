import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";

export function AboutPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">About Dog Training Levels</h1>
          </CardTitle>
          <CardDescription>
            A practical, progressive curriculum for everyday dog training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Work through Levels 1–4 at your own pace. Each level builds useful skills through clear
            criteria, short practice sessions, and positive reinforcement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
