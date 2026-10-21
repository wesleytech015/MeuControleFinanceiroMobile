import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = { title: string; description: string };

export function PlaceholderScreen({ title, description }: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.badge}>Em desenvolvimento</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, gap: 16,
    borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  description: { fontSize: 16, lineHeight: 24, color: colors.muted },
  badge: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
