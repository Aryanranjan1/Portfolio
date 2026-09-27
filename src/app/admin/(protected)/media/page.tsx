import { getMediaLibrary } from "@/db/queries/media";

export default async function MediaPage() {
  const items = await getMediaLibrary();
  return (
    <main>
      <h1>Media</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.url}>{item.filename}</a> ({item.mimeType})
          </li>
        ))}
      </ul>
    </main>
  );
}
