import { SecondaryButton } from "./SecondaryButton";

export function MatchCard({ match }: { match: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-card p-4">
      <p className="font-semibold">{match.target.profile.name}</p>
      <p className="text-sm text-muted">{match.target.profile.locality} · score {(match.score * 100).toFixed(0)}%</p>
      <ul className="mt-2 text-sm text-zinc-300 list-disc pl-5">
        {(match.reasonsJson as any).reasons?.map((r: string) => <li key={r}>{r}</li>)}
      </ul>
      <div className="mt-3 flex gap-2"><SecondaryButton>View Profile</SecondaryButton><SecondaryButton>Invite to Event</SecondaryButton></div>
    </div>
  );
}
