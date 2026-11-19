import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { cn } from "cn";
import { BookOpen, CheckSquare, ChevronRight, Dumbbell, Info, Shield, User } from "lucide-react";
import { useState } from "react";

import { SignInDialog } from "@/features/user-sign-in";
import { SignUpDialog } from "@/features/user-sign-up";
import { hasPermission } from "@/shared/auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/shadcn/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/ui/shadcn/sidebar";

import { SignOutDialog } from "./header/sign-out-dialog";

const rootRouteApi = getRouteApi("__root__");

const TRAINING_LEVELS = [
  { id: "level-1", label: "Level 1" },
  { id: "level-2", label: "Level 2" },
  { id: "level-3", label: "Level 3" },
  { id: "level-4", label: "Level 4" },
] as const;

export function AppSidebar() {
  const { session } = rootRouteApi.useRouteContext();
  const canReadCurriculum = hasPermission(session?.user.role, "curriculum:read");
  const isAdmin = session?.user.role === "admin";
  const [trainingOpen, setTrainingOpen] = useState(true);

  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const activeLevel = new URLSearchParams(searchStr).get("level");

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/">
                  <CheckSquare aria-hidden="true" className="size-5" />
                  <span className="font-semibold">Dog Training Levels</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {canReadCurriculum ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname.startsWith("/theory")}
                      tooltip="Theory"
                      render={
                        <Link to="/theory">
                          <BookOpen aria-hidden="true" />
                          <span>Theory</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>

                  <Collapsible
                    open={trainingOpen}
                    onOpenChange={setTrainingOpen}
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          isActive={pathname.startsWith("/training")}
                          tooltip="Training"
                        >
                          <Dumbbell aria-hidden="true" />
                          <span>Training</span>
                          <ChevronRight
                            aria-hidden="true"
                            className={cn(
                              "ml-auto transition-transform",
                              trainingOpen && "rotate-90",
                            )}
                          />
                        </SidebarMenuButton>
                      }
                    />
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={pathname === "/training" && !activeLevel}
                            render={
                              <Link to="/training">
                                <span>Up Next / Overview</span>
                              </Link>
                            }
                          />
                        </SidebarMenuSubItem>

                        {TRAINING_LEVELS.map((level) => (
                          <SidebarMenuSubItem key={level.id}>
                            <SidebarMenuSubButton
                              isActive={pathname === "/training" && activeLevel === level.id}
                              render={
                                <Link search={{ level: level.id }} to="/training">
                                  <span>{level.label}</span>
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        ))}

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            isActive={pathname === "/training/history"}
                            render={
                              <a href="/training/history">
                                <span>History</span>
                              </a>
                            }
                          />
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : null}

              {session ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === "/profile"}
                    tooltip="Profile"
                    render={
                      <Link to="/profile">
                        <User aria-hidden="true" />
                        <span>Profile</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ) : null}

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/about"}
                  tooltip="About"
                  render={
                    <Link to="/about">
                      <Info aria-hidden="true" />
                      <span>About</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>

              {isAdmin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/admin")}
                    tooltip="Admin"
                    render={
                      <a href="/admin">
                        <Shield aria-hidden="true" />
                        <span>Admin</span>
                      </a>
                    }
                  />
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {session ? (
          <SignOutDialog />
        ) : (
          <div className="flex flex-col gap-2">
            <SignInDialog />
            <SignUpDialog />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
