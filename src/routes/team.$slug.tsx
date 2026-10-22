import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { team } from "@/data/site";

export const Route = createFileRoute("/team/$slug")({
  loader: ({ params }) => {
    const member = team.find((m) => m.slug === params.slug);
    if (!member) throw notFound();
    return { member };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Profile unavailable — Altair Academy" }, { name: "robots", content: "noindex" }],
      };
    }
    const { member } = loaderData;
    return {
      meta: [
        { title: `${member.name}, ${member.role} — Altair Academy` },
        { name: "description", content: member.bio },
        { property: "og:title", content: `${member.name} — Altair Academy` },
        { property: "og:description", content: member.bio },
      ],
    };
  },
  component: TeamDetail,
});

function TeamDetail() {
  const { member } = Route.useLoaderData();
  return (
    <PageShell eyebrow="Management Team" title={member.name} intro={member.role}>
      <div className="grid gap-10 md:grid-cols-3">
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          width={800}
          height={800}
          className="w-full rounded-lg object-cover"
        />
        <p className="text-base text-muted-foreground md:col-span-2">{member.bio}</p>
      </div>
    </PageShell>
  );
}
