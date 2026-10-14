import { Children, type ReactNode } from 'react';
import { View } from 'react-native';

/** Simple responsive grid: lays children out in `columns` equal-width columns. */
export function Grid({
  columns,
  gap = 16,
  children,
}: {
  columns: number;
  gap?: number;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  if (columns <= 1) return <View style={{ gap }}>{items}</View>;
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns));
  return (
    <View style={{ gap }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap }}>
          {row.map((child, c) => (
            <View key={c} style={{ flex: 1, minWidth: 0 }}>
              {child}
            </View>
          ))}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`spacer-${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}
