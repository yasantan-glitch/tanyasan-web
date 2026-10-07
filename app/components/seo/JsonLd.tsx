/** Sunucu tarafında JSON-LD yazar. `<` kaçışlanır: içerikteki "</script>"
 * script bloğunu erken kapatamasın. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
