export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-3"><h2 className="text-lg font-semibold">{title}</h2>{subtitle && <p className="text-sm text-muted">{subtitle}</p>}</div>;
}
