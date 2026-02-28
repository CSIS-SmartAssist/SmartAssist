// Citation card below AI response (Saksham)

type Props = { title: string; snippet?: string };

export const CitationCard = ({ title, snippet }: Props) => (
  <div className="rounded border bg-muted/50 p-2 text-sm">
    <div className="font-medium">{title}</div>
    {snippet && <div className="text-muted-foreground truncate">{snippet}</div>}
  </div>
);
