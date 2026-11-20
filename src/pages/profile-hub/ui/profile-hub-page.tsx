import { CheckCircle2Icon, PlusIcon, PencilIcon } from "lucide-react";
import * as React from "react";

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadcn/dialog";
import { Input } from "@/shared/ui/shadcn/input";
import { Label } from "@/shared/ui/shadcn/label";
import { Progress } from "@/shared/ui/shadcn/progress";
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

import { createStubDog, formatShortDate, STUB_DOGS, STUB_USER } from "../model/stub-data";
import type { ProfileDog, ProfileUser, ProfileVariant } from "../model/types";

interface ProfileHubPageProps {
  variant?: ProfileVariant;
}

function getCompletionPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function EditAccountDialog({
  user,
  onSave,
}: {
  user: ProfileUser;
  onSave: (nextName: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(user.name);

  React.useEffect(() => {
    if (open) setName(user.name);
  }, [open, user.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon data-icon="inline-start" />
        Edit Account
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit account</DialogTitle>
            <DialogDescription>Update the display name on your profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddDogDialog({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon data-icon="inline-start" />
        Add Dog
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add a dog</DialogTitle>
            <DialogDescription>Create a training profile for your dog.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-dog-name">Dog name</Label>
            <Input
              id="new-dog-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Biscuit"
              maxLength={128}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              Add Dog
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccountCard({
  user,
  onSaveName,
}: {
  user: ProfileUser;
  onSaveName: (nextName: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
        <CardAction>
          <EditAccountDialog user={user} onSave={onSaveName} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={user.emailVerified ? "secondary" : "outline"}>
          {user.emailVerified && <CheckCircle2Icon data-icon="inline-start" />}
          {user.emailVerified ? "Verified" : "Unverified"}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
        <span className="ml-auto">Member since {formatShortDate(user.createdAt)}</span>
      </CardContent>
    </Card>
  );
}

function DogCard({ dog }: { dog: ProfileDog }) {
  const pct = getCompletionPercent(dog.completedSteps, dog.totalSteps);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dog.name}</CardTitle>
        <CardDescription>
          Active: Level {dog.activeLevel} · {dog.completedSteps} of {dog.totalSteps} steps
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={`/profile/${dog.id}`} />}
          >
            View Details
          </Button>
          <Button size="sm" nativeButton={false} render={<a href="/training" />}>
            Start Training
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <Progress value={pct} aria-label={`${dog.name} overall progress`} />
      </CardContent>
    </Card>
  );
}

function DogsTableCard({ dogs }: { dogs: ProfileDog[] }) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Dog</TableHead>
              <TableHead>Active Level</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dogs.map((dog) => {
              const pct = getCompletionPercent(dog.completedSteps, dog.totalSteps);
              return (
                <TableRow key={dog.id}>
                  <TableCell className="pl-4 font-medium">{dog.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Level {dog.activeLevel}</Badge>
                  </TableCell>
                  <TableCell className="min-w-36">
                    <div className="flex items-center gap-2">
                      <Progress value={pct} className="w-24" />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {dog.completedSteps}/{dog.totalSteps}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        nativeButton={false}
                        render={<a href={`/profile/${dog.id}`} />}
                      >
                        View Details
                      </Button>
                      <Button size="xs" nativeButton={false} render={<a href="/training" />}>
                        Start Training
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ProfileHubPage({ variant = "A" }: ProfileHubPageProps) {
  const [user, setUser] = React.useState<ProfileUser>(STUB_USER);
  const [dogs, setDogs] = React.useState<ProfileDog[]>(STUB_DOGS);

  const handleSaveName = (nextName: string) => {
    setUser((prev) => ({ ...prev, name: nextName }));
  };

  const handleAddDog = (dogName: string) => {
    setDogs((prev) => [...prev, createStubDog(user.id, dogName)]);
  };

  if (variant === "B") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your dogs and account details.</p>
        </div>

        <Tabs defaultValue="dogs" className="gap-4">
          <TabsList>
            <TabsTrigger value="dogs">Dogs ({dogs.length})</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="dogs" className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-medium">Your Dogs</h2>
              <AddDogDialog onAdd={handleAddDog} />
            </div>
            <div className="grid gap-3">
              {dogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="account">
            <AccountCard user={user} onSaveName={handleSaveName} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (variant === "C") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Account settings and training roster.</p>
        </div>

        <div className="grid items-start gap-6 md:grid-cols-[280px_1fr]">
          <AccountCard user={user} onSaveName={handleSaveName} />

          <section className="grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-medium">Dogs ({dogs.length})</h2>
              <AddDogDialog onAdd={handleAddDog} />
            </div>
            <DogsTableCard dogs={dogs} />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and your dogs.</p>
      </div>

      <AccountCard user={user} onSaveName={handleSaveName} />

      <Separator />

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-medium">Dogs</h2>
            <p className="text-sm text-muted-foreground">
              {dogs.length} {dogs.length === 1 ? "dog" : "dogs"} in training
            </p>
          </div>
          <AddDogDialog onAdd={handleAddDog} />
        </div>

        <div className="grid gap-3">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      </section>
    </div>
  );
}
