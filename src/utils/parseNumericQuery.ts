// utils/parseNumericQuery.ts
export function parseNumericQuery(input: string): {
  preptest?: number;
  section?: number;
  question?: number;
} {
  const compactMatch = input.match(/^(\d{2,3})\.(\d)\.(\d{1,2})$/);
  if (compactMatch) {
    return {
      preptest: parseInt(compactMatch[1], 10),
      section: parseInt(compactMatch[2], 10),
      question: parseInt(compactMatch[3], 10),
    };
  }

  const verboseMatch = input.match(
    /PrepTest\s*(\d+).*Section\s*(\d+).*Question\s*(\d+)/i
  );
  if (verboseMatch) {
    return {
      preptest: parseInt(verboseMatch[1], 10),
      section: parseInt(verboseMatch[2], 10),
      question: parseInt(verboseMatch[3], 10),
    };
  }

  return {};
}
