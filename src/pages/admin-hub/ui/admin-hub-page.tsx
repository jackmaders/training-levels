import {
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { Permission } from "@/shared/auth/permissions";
import type { UserRole } from "@/shared/db/schema/auth";
import { Badge } from "@/shared/ui/shadcn/badge";
import { Button } from "@/shared/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/card";
import { Checkbox } from "@/shared/ui/shadcn/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/shadcn/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/shadcn/dropdown-menu";
import { Input } from "@/shared/ui/shadcn/input";
import { Label } from "@/shared/ui/shadcn/label";
import { Separator } from "@/shared/ui/shadcn/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/shadcn/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

import { STUB_ADMIN_USERS } from "../model/stub-data";
import {
  ADMIN_PERMISSIONS,
  type AdminDogSummary,
  type AdminRoleFilter,
  type AdminTab,
  type AdminUserRecord,
  type AdminVariant,
} from "../model/types";

interface AdminHubPageProps {
  variant?: AdminVariant;
}

const ROLE_FILTER_LABELS: Record<AdminRoleFilter, string> = {
  all: "All Roles",
  admin: "Admin",
  user: "User",
};

function matchesUserQuery(user: AdminUserRecord, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return (
    user.name.toLowerCase().includes(normalizedQuery) ||
    user.email.toLowerCase().includes(normalizedQuery) ||
    user.dogs.some((dog) => dog.name.toLowerCase().includes(normalizedQuery))
  );
}

function matchesDogQuery(dog: AdminDogSummary, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return (
    dog.name.toLowerCase().includes(normalizedQuery) ||
    dog.ownerName.toLowerCase().includes(normalizedQuery) ||
    dog.ownerEmail.toLowerCase().includes(normalizedQuery) ||
    dog.currentLevel.toLowerCase().includes(normalizedQuery)
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>
      {role === "admin" ? "admin" : "user"}
    </Badge>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <Badge variant={verified ? "outline" : "destructive"}>
      {verified ? "Verified" : "Unverified"}
    </Badge>
  );
}

function FilterToolbar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  resultSummary,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: AdminRoleFilter;
  onRoleFilterChange: (value: AdminRoleFilter) => void;
  resultSummary: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Filter by user, email, or dog..."
            aria-label="Filter admin records"
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="default" />}>
            <SlidersHorizontalIcon className="size-3.5" />
            <span>{ROLE_FILTER_LABELS[roleFilter]}</span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Role</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={roleFilter}
              onValueChange={(value) => onRoleFilterChange(value as AdminRoleFilter)}
            >
              <DropdownMenuRadioItem value="all">All Roles</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="text-xs text-muted-foreground">{resultSummary}</span>
    </div>
  );
}

function PermissionCheckboxes({
  user,
  idPrefix,
  onTogglePermission,
}: {
  user: AdminUserRecord;
  idPrefix: string;
  onTogglePermission: (userId: string, permission: Permission) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {ADMIN_PERMISSIONS.map((permission) => {
        const checked = user.permissions.includes(permission);
        const checkboxId = `${idPrefix}-${user.id}-${permission}`;
        return (
          <div key={permission} className="flex items-center gap-2">
            <Checkbox
              id={checkboxId}
              checked={checked}
              onCheckedChange={() => onTogglePermission(user.id, permission)}
            />
            <Label htmlFor={checkboxId} className="font-mono text-xs font-normal">
              {permission}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

function RoleSwitchButtons({
  role,
  onSelectRole,
}: {
  role: UserRole;
  onSelectRole: (role: UserRole) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="xs"
        variant={role === "user" ? "default" : "outline"}
        onClick={() => onSelectRole("user")}
      >
        user
      </Button>
      <Button
        type="button"
        size="xs"
        variant={role === "admin" ? "default" : "outline"}
        onClick={() => onSelectRole("admin")}
      >
        admin
      </Button>
    </div>
  );
}

function DogsTableCard({ dogs }: { dogs: AdminDogSummary[] }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Dogs & Training Data</CardTitle>
        <CardDescription>
          Cross-user dog profiles with step completion and practice attempt totals.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Dog</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Current Level</TableHead>
              <TableHead className="text-right">Completed Steps</TableHead>
              <TableHead className="text-right">Practice Attempts</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="pr-4 text-right">Inspect</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No dogs match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              dogs.map((dog) => (
                <TableRow key={dog.id}>
                  <TableCell className="pl-4 font-medium">{dog.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{dog.ownerName}</span>
                      <span className="text-xs text-muted-foreground">{dog.ownerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{dog.currentLevel}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {dog.completedStepsCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {dog.practiceAttemptsCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {dog.lastActiveAt}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      nativeButton={false}
                      variant="outline"
                      size="xs"
                      render={<a href={`/profile/${dog.id}`} />}
                    >
                      <span>Profile</span>
                      <ExternalLinkIcon className="size-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ManageUserDialog({
  user,
  open,
  onOpenChange,
  onUpdateRole,
  onTogglePermission,
}: {
  user: AdminUserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateRole: (userId: string, role: UserRole) => void;
  onTogglePermission: (userId: string, permission: Permission) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user ? (
          <>
            <DialogHeader>
              <DialogTitle>{user.name}</DialogTitle>
              <DialogDescription>
                {user.email} · Joined {user.createdAt}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Role</span>
                  <span className="text-xs text-muted-foreground">
                    Controls admin hub access and moderation privileges.
                  </span>
                </div>
                <RoleSwitchButtons
                  role={user.role}
                  onSelectRole={(role) => onUpdateRole(user.id, role)}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Effective Permissions</span>
                <PermissionCheckboxes
                  user={user}
                  idPrefix="dialog"
                  onTogglePermission={onTogglePermission}
                />
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Dogs ({user.dogs.length})</span>
                {user.dogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No dog profiles registered.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {user.dogs.map((dog) => (
                      <div
                        key={dog.id}
                        className="flex items-center justify-between rounded-md bg-muted/40 px-2.5 py-1.5"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{dog.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {dog.currentLevel} · {dog.completedStepsCount} steps
                          </span>
                        </div>
                        <Button
                          nativeButton={false}
                          variant="ghost"
                          size="xs"
                          render={<a href={`/profile/${dog.id}`} />}
                        >
                          Inspect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter showCloseButton />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function AdminHubPage({ variant = "B" }: AdminHubPageProps) {
  const [users, setUsers] = useState<AdminUserRecord[]>(STUB_ADMIN_USERS);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AdminRoleFilter>("all");
  const [managedUserId, setManagedUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>(STUB_ADMIN_USERS[0]?.id ?? "");
  const [expandedUserIds, setExpandedUserIds] = useState<Record<string, boolean>>({
    [STUB_ADMIN_USERS[0]?.id ?? ""]: true,
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }
      return matchesUserQuery(user, normalizedQuery);
    });
  }, [users, roleFilter, normalizedQuery]);

  const filteredDogs = useMemo(() => {
    return users
      .filter((user) => roleFilter === "all" || user.role === roleFilter)
      .flatMap((user) => user.dogs)
      .filter((dog) => matchesDogQuery(dog, normalizedQuery));
  }, [users, roleFilter, normalizedQuery]);

  const managedUser = useMemo(
    () => users.find((user) => user.id === managedUserId) ?? null,
    [users, managedUserId],
  );

  const selectedUser = useMemo(
    () =>
      filteredUsers.find((user) => user.id === selectedUserId) ??
      filteredUsers[0] ??
      users[0] ??
      null,
    [filteredUsers, selectedUserId, users],
  );

  function handleUpdateRole(userId: string, nextRole: UserRole) {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: nextRole } : user)),
    );
  }

  function handleTogglePermission(userId: string, permission: Permission) {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) {
          return user;
        }
        const exists = user.permissions.includes(permission);
        const permissions = exists
          ? user.permissions.filter((item) => item !== permission)
          : [...user.permissions, permission];
        return { ...user, permissions };
      }),
    );
  }

  function handleToggleExpanded(userId: string, open: boolean) {
    setExpandedUserIds((prev) => ({ ...prev, [userId]: open }));
  }

  const resultSummary =
    variant === "A" && activeTab === "dogs"
      ? `${filteredDogs.length} dogs`
      : `${filteredUsers.length} of ${users.length} users`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight">Admin Hub</h1>
          <Badge variant="outline">
            <ShieldCheckIcon className="size-3" />
            <span>Access & Data</span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage user roles, effective permissions, and cross-user dog training progress.
        </p>
      </header>

      {variant === "A" ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminTab)}>
          <div className="flex flex-col gap-3">
            <TabsList>
              <TabsTrigger value="users">Users & Access ({filteredUsers.length})</TabsTrigger>
              <TabsTrigger value="dogs">Dogs & Training Data ({filteredDogs.length})</TabsTrigger>
            </TabsList>

            <FilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              resultSummary={resultSummary}
            />
          </div>

          <TabsContent value="users">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Users & Access</CardTitle>
                <CardDescription>
                  Toggle roles or manage permissions and linked dog profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">User</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Dogs</TableHead>
                      <TableHead className="pr-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          No users match the current filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="pl-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <VerifiedBadge verified={user.emailVerified} />
                          </TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {user.permissions.length === 0 ? (
                                <span className="text-xs text-muted-foreground">None</span>
                              ) : (
                                user.permissions.map((permission) => (
                                  <Badge key={permission} variant="outline" className="font-mono">
                                    {permission}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {user.dogs.length}
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => setManagedUserId(user.id)}
                              >
                                Manage
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={<Button variant="ghost" size="icon-xs" />}
                                  aria-label={`Actions for ${user.name}`}
                                >
                                  <MoreHorizontalIcon className="size-3.5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateRole(
                                        user.id,
                                        user.role === "admin" ? "user" : "admin",
                                      )
                                    }
                                  >
                                    {user.role === "admin" ? "Demote to user" : "Promote to admin"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setManagedUserId(user.id)}>
                                    Manage permissions & dogs
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dogs">
            <DogsTableCard dogs={filteredDogs} />
          </TabsContent>
        </Tabs>
      ) : null}

      {variant === "B" ? (
        <div className="flex flex-col gap-4">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            resultSummary={resultSummary}
          />

          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Users</CardTitle>
                <CardDescription>Select a row to edit access and inspect dogs.</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">User</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="pr-4 text-right">Dogs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No users match the current filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = selectedUser?.id === user.id;
                        return (
                          <TableRow
                            key={user.id}
                            data-state={isSelected ? "selected" : undefined}
                            className="cursor-pointer"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <TableCell className="pl-4">
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <VerifiedBadge verified={user.emailVerified} />
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell className="pr-4 text-right tabular-nums">
                              {user.dogs.length}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader className="border-b">
                <CardTitle>{selectedUser ? selectedUser.name : "Selected User"}</CardTitle>
                <CardDescription>
                  {selectedUser
                    ? `${selectedUser.email} · Joined ${selectedUser.createdAt}`
                    : "Choose a user from the table."}
                </CardDescription>
              </CardHeader>
              {selectedUser ? (
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Role</span>
                    <RoleSwitchButtons
                      role={selectedUser.role}
                      onSelectRole={(role) => handleUpdateRole(selectedUser.id, role)}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Permissions</span>
                    <PermissionCheckboxes
                      user={selectedUser}
                      idPrefix="detail"
                      onTogglePermission={handleTogglePermission}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Dogs ({selectedUser.dogs.length})</span>
                    {selectedUser.dogs.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No dog profiles registered.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedUser.dogs.map((dog) => (
                          <div
                            key={dog.id}
                            className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-2"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{dog.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {dog.currentLevel} · {dog.practiceAttemptsCount} attempts
                              </span>
                            </div>
                            <Button
                              nativeButton={false}
                              variant="ghost"
                              size="xs"
                              render={<a href={`/profile/${dog.id}`} />}
                            >
                              Inspect
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}

      {variant === "C" ? (
        <div className="flex flex-col gap-4">
          <FilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            resultSummary={resultSummary}
          />

          <Card>
            <CardHeader className="border-b">
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                Expand a user row to adjust role, permissions, and inspect dogs inline.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No users match the current filter.
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => {
                    const isOpen = Boolean(expandedUserIds[user.id]);
                    return (
                      <Collapsible
                        key={user.id}
                        open={isOpen}
                        onOpenChange={(open) => handleToggleExpanded(user.id, open)}
                      >
                        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40">
                          <div className="flex min-w-0 items-center gap-2.5">
                            {isOpen ? (
                              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                            )}
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-medium">{user.name}</span>
                              <span className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <VerifiedBadge verified={user.emailVerified} />
                            <RoleBadge role={user.role} />
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {user.dogs.length} {user.dogs.length === 1 ? "dog" : "dogs"}
                            </span>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="bg-muted/25 px-4 pt-1 pb-4">
                          <div className="grid gap-4 pt-2 sm:grid-cols-[220px_1fr]">
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Role
                                </span>
                                <RoleSwitchButtons
                                  role={user.role}
                                  onSelectRole={(role) => handleUpdateRole(user.id, role)}
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Permissions
                                </span>
                                <PermissionCheckboxes
                                  user={user}
                                  idPrefix="collapsible"
                                  onTogglePermission={handleTogglePermission}
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Dogs ({user.dogs.length})
                              </span>
                              {user.dogs.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  No dog profiles registered.
                                </p>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  {user.dogs.map((dog) => (
                                    <div
                                      key={dog.id}
                                      className="flex items-center justify-between rounded-md bg-background px-3 py-2 ring-1 ring-foreground/10"
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{dog.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {dog.currentLevel} · {dog.completedStepsCount} steps ·{" "}
                                          {dog.practiceAttemptsCount} attempts
                                        </span>
                                      </div>
                                      <Button
                                        nativeButton={false}
                                        variant="outline"
                                        size="xs"
                                        render={<a href={`/profile/${dog.id}`} />}
                                      >
                                        <span>Inspect</span>
                                        <ExternalLinkIcon className="size-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ManageUserDialog
        user={managedUser}
        open={managedUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setManagedUserId(null);
          }
        }}
        onUpdateRole={handleUpdateRole}
        onTogglePermission={handleTogglePermission}
      />
    </div>
  );
}
