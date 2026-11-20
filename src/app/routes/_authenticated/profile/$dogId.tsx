import { createFileRoute } from "@tanstack/react-router";

import { DogDetailPage } from "@/pages/profile-hub";

const Route = createFileRoute("/_authenticated/profile/$dogId")({
  component: ProfileDogRoute,
});

function ProfileDogRoute() {
  const { dogId } = Route.useParams();
  return <DogDetailPage dogId={dogId} />;
}

export { Route };
