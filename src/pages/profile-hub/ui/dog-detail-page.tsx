import { ArrowLeftIcon, HistoryIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/shadcn/table";

import { formatShortDate, STUB_DOGS } from "../model/stub-data";
import type { ProfileDog } from "../model/types";

interface DogDetailPageProps {
  dogId: string;
}

function RenameDogDialog({
  dogName,
  onRename,
}: {
  dogName: string;
  onRename: (nextName: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(dogName);

  React.useEffect(() => {
    if (open) setName(dogName);
  }, [open, dogName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onRename(trimmed);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon data-icon="inline-start" />
        Rename
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Rename dog</DialogTitle>
            <DialogDescription>Update {dogName}&apos;s name on their profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rename-dog-input">Dog name</Label>
            <Input
              id="rename-dog-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={128}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              Save name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDogDialog({ dogName, onDelete }: { dogName: string; onDelete: () => void }) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2Icon data-icon="inline-start" />
        Delete Dog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {dogName}?</DialogTitle>
          <DialogDescription>
            This removes {dogName}&apos;s profile and training progress in this prototype view.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete Dog
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DogDetailPage({ dogId }: DogDetailPageProps) {
  const [dogs, setDogs] = React.useState<ProfileDog[]>(STUB_DOGS);
  const dog = dogs.find((item) => item.id === dogId);

  const handleRename = (nextName: string) => {
    setDogs((prev) =>
      prev.map((item) =>
        item.id === dogId ? { ...item, name: nextName, updatedAt: new Date() } : item,
      ),
    );
  };

  const handleDelete = () => {
    setDogs((prev) => prev.filter((item) => item.id !== dogId));
  };

  if (!dog) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        <div>
          <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/profile" />}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back to Profile
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dog not found</CardTitle>
            <CardDescription>
              No profile matches ID <span className="font-mono">{dogId}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" nativeButton={false} render={<a href="/profile" />}>
              Return to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<a href="/profile" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Profile
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{dog.name}</h1>
            <Badge variant="secondary">Level {dog.activeLevel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Added {formatShortDate(dog.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <RenameDogDialog dogName={dog.name} onRename={handleRename} />
          <DeleteDogDialog dogName={dog.name} onDelete={handleDelete} />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Training Levels 1–4</CardTitle>
          <CardDescription>
            {dog.completedSteps} of {dog.totalSteps} total steps completed
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href="/training/history" />}
            >
              <HistoryIcon data-icon="inline-start" />
              Training History
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Level</TableHead>
                <TableHead>Completed Steps</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="pr-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dog.levels.map((lvl) => {
                const pct =
                  lvl.totalSteps === 0
                    ? 0
                    : Math.round((lvl.completedSteps / lvl.totalSteps) * 100);
                return (
                  <TableRow key={lvl.level}>
                    <TableCell className="pl-4 font-medium">{lvl.title}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {lvl.completedSteps} / {lvl.totalSteps}
                    </TableCell>
                    <TableCell className="min-w-36">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="w-24" />
                        <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        variant={lvl.level === dog.activeLevel ? "default" : "outline"}
                        size="xs"
                        nativeButton={false}
                        render={<a href={`/training?level=${lvl.level}`} />}
                      >
                        {lvl.completedSteps >= lvl.totalSteps ? "Review" : "Train"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
