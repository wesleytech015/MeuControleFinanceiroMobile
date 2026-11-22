import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { IncomeScreen } from '../screens/IncomeScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { colors } from '../theme';
import type { RootTabParamList } from '../types/navigation';
import { LogoutButton } from '../components/LogoutButton';
import { WhatsAppScreen } from '../screens/WhatsAppScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const icons: Record<keyof RootTabParamList, string> = {
  Inicio: '⌂', Receitas: '+', Despesas: '−', Movimentacoes: '↔', WhatsApp: '',
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: {
      ...DefaultTheme.colors, primary: colors.primary, background: colors.background,
      card: colors.surface, text: colors.text, border: colors.border,
    } }}>
      <Tab.Navigator screenOptions={({ route }) => ({
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => route.name === 'WhatsApp'
          ? <FontAwesome name="whatsapp" size={size} color={color} accessible={false} />
          : <Text accessible={false} style={{ color, fontSize: 24 }}>{icons[route.name]}</Text>,
      })}>
        <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Início' }} />
        <Tab.Screen name="Receitas" component={IncomeScreen} />
        <Tab.Screen name="Despesas" component={ExpensesScreen} />
        <Tab.Screen name="Movimentacoes" component={TransactionsScreen} options={{ title: 'Movimentações' }} />
        <Tab.Screen name="WhatsApp" component={WhatsAppScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
