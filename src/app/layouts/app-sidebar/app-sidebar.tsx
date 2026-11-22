import { getRouteApi, Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  Dog,
  Dumbbell,
  FileText,
  GitBranch,
  Home,
  Info,
  Layers,
  User,
} from "lucide-react";
import { useState } from "react";

import { SignInDialog } from "@/features/user-sign-in";
import { SignUpDialog } from "@/features/user-sign-up";
import { hasPermission } from "@/shared/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/ui/shadcn/sidebar";

import { SignOutDialog } from "./sign-out-dialog";

type TrainingLevelId = "level-1" | "level-2" | "level-3" | "level-4";

const TRAINING_LEVELS: readonly { id: TrainingLevelId; label: string }[] = [
  { id: "level-1", label: "Level 1" },
  { id: "level-2", label: "Level 2" },
  { id: "level-3", label: "Level 3" },
  { id: "level-4", label: "Level 4" },
];

const rootRoute = getRouteApi("__root__");

function useCloseMobileOnNavigate(pathname: string) {
  const { setOpenMobile } = useSidebar();
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenMobile(false);
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = rootRoute.useRouteContext();
  const location = useLocation();
  const { pathname } = location;
  const search = location.search as Record<string, unknown>;
  const activeLevel = typeof search["level"] === "string" ? search["level"] : undefined;
  const canReadCurriculum = session ? hasPermission(session.user.role, "curriculum:read") : false;
  useCloseMobileOnNavigate(pathname);

  return (
    <Sidebar {...props}>
      <SidebarBrandHeader />
      <SidebarPrimaryNav
        activeLevel={activeLevel}
        canReadCurriculum={canReadCurriculum}
        isSignedIn={Boolean(session)}
        pathname={pathname}
      />
      <AppSidebarFooter isSignedIn={Boolean(session)} />
    </Sidebar>
  );
}

function SidebarPrimaryNav({
  activeLevel,
  canReadCurriculum,
  isSignedIn,
  pathname,
}: {
  activeLevel: string | undefined;
  canReadCurriculum: boolean;
  isSignedIn: boolean;
  pathname: string;
}) {
  return (
    <SidebarContent>
      <nav aria-label="Primary navigation">
        <SidebarGroup>
          <SidebarGroupContent>
            {isSignedIn ? (
              <AuthenticatedNavItems
                activeLevel={activeLevel}
                canReadCurriculum={canReadCurriculum}
                pathname={pathname}
              />
            ) : (
              <PublicNavItems pathname={pathname} />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </nav>
    </SidebarContent>
  );
}

function SidebarBrandHeader() {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton render={<Link to="/" />} size="lg">
            <Dog className="size-4" />
            <span className="font-semibold">Dog Training Levels</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function PublicNavItems({ pathname }: { pathname: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/"} render={<Link to="/" />}>
          <Home />
          <span>Home</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/about"} render={<Link to="/about" />}>
          <Info />
          <span>About</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AuthenticatedNavItems({
  activeLevel,
  canReadCurriculum,
  pathname,
}: {
  activeLevel: string | undefined;
  canReadCurriculum: boolean;
  pathname: string;
}) {
  return (
    <SidebarMenu>
      {canReadCurriculum && <CurriculumNavItems activeLevel={activeLevel} pathname={pathname} />}
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/profile"} render={<Link to="/profile" />}>
          <User />
          <span>Profile</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/about"} render={<Link to="/about" />}>
          <Info />
          <span>About</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function CurriculumNavItems({
  activeLevel,
  pathname,
}: {
  activeLevel: string | undefined;
  pathname: string;
}) {
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/theory"} render={<Link to="/theory" />}>
          <BookOpen />
          <span>Theory</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <TrainingNavGroup activeLevel={activeLevel} pathname={pathname} />
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/levels"} render={<Link to="/levels" />}>
          <Layers />
          <span>Levels</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={pathname === "/dependencies"}
          render={<Link to="/dependencies" />}
        >
          <GitBranch />
          <span>Foundations</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={pathname === "/appendices"} render={<Link to="/appendices" />}>
          <FileText />
          <span>Appendices</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}

function TrainingNavGroup({
  activeLevel,
  pathname,
}: {
  activeLevel: string | undefined;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isTrainingRoute = pathname === "/training";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        type="button"
      >
        <Dumbbell />
        <span>Training</span>
        <ChevronRight className={`ml-auto transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </SidebarMenuButton>
      {isOpen && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              isActive={isTrainingRoute && activeLevel === undefined}
              render={<Link to="/training" />}
            >
              <span>Up Next / Overview</span>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          {TRAINING_LEVELS.map((level) => (
            <SidebarMenuSubItem key={level.id}>
              <SidebarMenuSubButton
                isActive={isTrainingRoute && activeLevel === level.id}
                render={<Link search={{ level: level.id }} to="/training" />}
              >
                <span>{level.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

function AppSidebarFooter({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <SidebarFooter>
      <SidebarMenu>
        {isSignedIn ? (
          <SidebarMenuItem>
            <SignOutDialog className="w-full" />
          </SidebarMenuItem>
        ) : (
          <>
            <SidebarMenuItem>
              <SignInDialog />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SignUpDialog />
            </SidebarMenuItem>
          </>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
}
