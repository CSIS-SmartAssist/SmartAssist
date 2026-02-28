// Documents + status badges (Saksham)

type Doc = {
  id: string;
  filename: string;
  source: string;
  status: string;
  date: string;
};

type Props = { documents: Doc[] };

export function DocumentsTable({ documents }: Props) {
  if (documents.length === 0) {
    return <p className="text-muted-foreground text-sm">No documents.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Filename</th>
            <th className="text-left">Source</th>
            <th className="text-left">Status</th>
            <th className="text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.id}>
              <td>{d.filename}</td>
              <td>{d.source}</td>
              <td>{d.status}</td>
              <td>{d.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
