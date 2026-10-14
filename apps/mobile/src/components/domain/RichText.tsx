import { View } from 'react-native';
import { Text } from '../ui';

/** Renders a tiny markdown subset: paragraphs and `## ` headings. */
export function RichText({ body }: { body: string }) {
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <View style={{ gap: 14 }}>
      {blocks.flatMap((block, i) => {
        const lines = block.split('\n');
        if (lines[0]!.startsWith('## ')) {
          const [heading, ...rest] = lines;
          return [
            <Text
              key={`h${i}`}
              variant="heading"
              accessibilityRole="header"
              style={{ marginTop: 8 }}
            >
              {heading!.slice(3)}
            </Text>,
            ...(rest.length
              ? [
                  <Text key={`p${i}`} style={{ fontSize: 17, lineHeight: 28 }}>
                    {rest.join(' ')}
                  </Text>,
                ]
              : []),
          ];
        }
        return [
          <Text key={`p${i}`} style={{ fontSize: 17, lineHeight: 28 }}>
            {lines.join(' ')}
          </Text>,
        ];
      })}
    </View>
  );
}
