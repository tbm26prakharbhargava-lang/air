export function ProfileSummaryCard({ profile, reliability }: { profile: any; reliability: any }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-card p-4">
      <h2 className="text-xl font-semibold">{profile.name}</h2>
      <p className="text-sm text-muted">{profile.locality}, {profile.city}</p>
      <p className="mt-2 text-sm">{profile.bio}</p>
      <p className="mt-3 text-sm text-success">Attendance rate: {(reliability.attendanceRate * 100).toFixed(0)}%</p>
    </div>
  );
}
