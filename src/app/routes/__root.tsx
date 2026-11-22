import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { useEffect } from "react";

import { ErrorPage } from "@/pages/error";
import { NotFoundPage } from "@/pages/not-found";
import { getSessionFn, type Session } from "@/shared/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/shadcn/sidebar";
import { Toaster } from "@/shared/ui/shadcn/toast";
import { TooltipProvider } from "@/shared/ui/shadcn/tooltip";

import { AppSidebar, Devtools, Footer } from "../layouts";

// oxlint-disable-next-line import/max-dependencies -- root route wires app shell, providers, and error boundaries
import appCss from "../styles/index.css?url";

export interface RootRouterContext {
  queryClient: QueryClient;
  session?: Session | null;
}

export const Route = createRootRouteWithContext<RootRouterContext>()({
  beforeLoad: async () => {
    const session = await getSessionFn();
    return { session };
  },
  errorComponent: ErrorPage,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Dog Training Levels",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.dataset["hydrated"] = "true";
  }, []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body
        className="flex min-h-svh flex-col font-sans wrap-anywhere antialiased"
        data-hydrated="false"
      >
        <a
          className="fixed top-4 left-4 z-60 -translate-y-20 rounded-md bg-background px-4 py-2 text-foreground shadow-md focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="#main-content"
        >
          Skip to content
        </a>
        <RootShellContent>{children}</RootShellContent>
        <Toaster />
        <Devtools />
        <Scripts />
      </body>
    </html>
  );
}

function RootShellContent({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <main
            className="container mx-auto flex flex-1 flex-col px-4 py-8"
            id="main-content"
            tabIndex={-1}
          >
            {children}
          </main>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
