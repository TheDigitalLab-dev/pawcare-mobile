import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  AdoptionDetailScreen,
  AdoptionLandingScreen,
  AdoptionListScreen,
  CheckoutScreen,
  ContactScreen,
  PrivacyScreen,
  ProductDetailScreen,
  ProductsScreen,
  PublicLandingScreen,
  ServicesScreen,
  SponsorshipDetailScreen,
  SponsorshipsListScreen,
  TermsScreen,
  UploadProofScreen,
} from '@/screens/public';
import { AuthStack } from './AuthStack';
import type { PublicStackParamList } from './types';

const Stack = createNativeStackNavigator<PublicStackParamList>();

// Los endpoints públicos están en vías de retirarse del backend: la app sin
// sesión arranca directo en Auth (Login). Las pantallas públicas siguen
// registradas solo para no romper los flujos internos que aún navegan entre
// ellas mientras dure la transición.
export function PublicStack() {
  return (
    <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PublicLanding" component={PublicLandingScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="UploadProof" component={UploadProofScreen} />
      <Stack.Screen name="AdoptionLanding" component={AdoptionLandingScreen} />
      <Stack.Screen name="AdoptionList" component={AdoptionListScreen} />
      <Stack.Screen name="AdoptionDetail" component={AdoptionDetailScreen} />
      <Stack.Screen name="SponsorshipsList" component={SponsorshipsListScreen} />
      <Stack.Screen name="SponsorshipDetail" component={SponsorshipDetailScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}
