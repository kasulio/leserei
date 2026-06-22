/** Longest-key-first multi-string replace (same idea as Calibre's MReplace). */
export function mreplace(replacements: Record<string, string>) {
  const pairs = Object.entries(replacements).sort(
    ([a], [b]) => b.length - a.length,
  );
  return (text: string): string => {
    let result = text;
    for (const [from, to] of pairs) result = result.replaceAll(from, to);
    return result;
  };
}
