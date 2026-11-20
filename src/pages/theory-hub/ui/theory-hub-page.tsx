import { ArrowRight, BookOpen, Compass, Search } from "lucide-react";
import { useMemo, useState } from "react";

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
import { Input } from "@/shared/ui/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/shadcn/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import { APPENDIX_ARTICLES, FOUNDATION_ARTICLES, THEORY_LEVELS } from "../model/stub-data";
import type { TheoryVariant } from "../model/types";

export interface TheoryHubPageProps {
  variant?: TheoryVariant;
}

interface DirectoryRow {
  id: string;
  title: string;
  section: string;
  summary: string;
  href: string;
}

export function TheoryHubPage({ variant = "A" }: TheoryHubPageProps) {
  if (variant === "B") {
    return <TheoryHubTabsVariant />;
  }
  if (variant === "C") {
    return <TheoryHubDirectoryVariant />;
  }
  return <TheoryHubDefaultVariant />;
}

function TheoryHubHeader() {
  return (
    <header className="space-y-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Theory & Curriculum</h1>
      <p className="text-sm text-muted-foreground">
        Core principles, progressive behavior criteria for Levels 1–4, and practical training
        appendices.
      </p>
    </header>
  );
}

function TheoryHubDefaultVariant() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <TheoryHubHeader />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Foundations
            </CardTitle>
            <CardDescription>
              How Levels work, marker timing, reinforcement mechanics, and Comebefore prerequisites.
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href="/theory/foundations" />}
              >
                Read
                <ArrowRight className="size-3.5" />
              </Button>
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="size-4 text-muted-foreground" />
              Appendices
            </CardTitle>
            <CardDescription>
              Target sticks, Zen variations, and troubleshooting guides when progress plateaus.
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<a href="/theory/appendices" />}
              >
                Explore
                <ArrowRight className="size-3.5" />
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      <section aria-labelledby="levels-heading" className="space-y-4">
        <h2 id="levels-heading" className="font-heading text-base font-semibold">
          Levels 1–4
        </h2>

        <div className="space-y-4">
          {THEORY_LEVELS.map((level) => (
            <Card key={level.id}>
              <CardHeader>
                <CardTitle>{level.title}</CardTitle>
                <CardDescription>{level.focus}</CardDescription>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<a href={`/theory/${level.id}`} />}
                  >
                    Level overview
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {level.behaviors.map((behavior) => (
                  <Button
                    key={behavior.id}
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<a href={`/theory/${level.id}/${behavior.id}`} />}
                  >
                    {behavior.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function TheoryHubTabsVariant() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <TheoryHubHeader />

      <Tabs defaultValue="levels">
        <TabsList>
          <TabsTrigger value="levels">Levels 1–4</TabsTrigger>
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="appendices">Appendices</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="mt-4 space-y-4">
          {THEORY_LEVELS.map((level) => (
            <Card key={level.id}>
              <CardHeader>
                <CardTitle>{level.title}</CardTitle>
                <CardDescription>{level.focus}</CardDescription>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<a href={`/theory/${level.id}`} />}
                  >
                    Overview
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {level.behaviors.map((behavior) => (
                  <Button
                    key={behavior.id}
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<a href={`/theory/${level.id}/${behavior.id}`} />}
                  >
                    {behavior.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="foundations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Foundations</CardTitle>
              <CardDescription>
                Core learning theory and Comebefore dependencies for Levels 1–4.
              </CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href="/theory/foundations" />}
                >
                  Open reader
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="divide-y">
              {FOUNDATION_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.summary}</p>
                  </div>
                  <Badge variant="secondary">{article.readTime}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appendices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appendices</CardTitle>
              <CardDescription>
                Supplementary mechanics, variations, and diagnostic checklists.
              </CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href="/theory/appendices" />}
                >
                  Open reader
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="divide-y">
              {APPENDIX_ARTICLES.map((appendix) => (
                <div
                  key={appendix.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{appendix.title}</p>
                    <p className="text-xs text-muted-foreground">{appendix.summary}</p>
                  </div>
                  <Badge variant="outline">{appendix.category}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TheoryHubDirectoryVariant() {
  const [query, setQuery] = useState("");

  const rows = useMemo<DirectoryRow[]>(() => {
    const foundationRows: DirectoryRow[] = FOUNDATION_ARTICLES.map((article) => ({
      id: `foundation-${article.id}`,
      title: article.title,
      section: "Foundations",
      summary: article.summary,
      href: "/theory/foundations",
    }));

    const levelRows: DirectoryRow[] = THEORY_LEVELS.flatMap((level) =>
      level.behaviors.map((behavior) => ({
        id: `${level.id}-${behavior.id}`,
        title: behavior.name,
        section: `Level ${level.number}`,
        summary: behavior.summary,
        href: `/theory/${level.id}/${behavior.id}`,
      })),
    );

    const appendixRows: DirectoryRow[] = APPENDIX_ARTICLES.map((appendix) => ({
      id: `appendix-${appendix.id}`,
      title: appendix.title,
      section: "Appendices",
      summary: appendix.summary,
      href: "/theory/appendices",
    }));

    return [...foundationRows, ...levelRows, ...appendixRows];
  }, []);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(term) ||
        row.section.toLowerCase().includes(term) ||
        row.summary.toLowerCase().includes(term),
    );
  }, [query, rows]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <TheoryHubHeader />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search behaviors, foundations, or appendices..."
          className="pl-8"
          aria-label="Search theory directory"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="hidden sm:table-cell">Summary</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No theory topics match "{query}".
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.section}</Badge>
                    </TableCell>
                    <TableCell className="hidden max-w-md truncate text-muted-foreground sm:table-cell">
                      {row.summary}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        nativeButton={false}
                        render={<a href={row.href} />}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
