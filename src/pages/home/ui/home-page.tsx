import { SignInCard } from "@/features/user-sign-in";
import { SignUpCard } from "@/features/user-sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="max-w-md space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Dog Training Levels</h1>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account to read the curriculum and track your dog&apos;s progress
          through Levels 1–4.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <SignInCard />
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <SignUpCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
