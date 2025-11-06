/**
 * Composable to access Supabase client
 */
export const useSupabase = () => {
  const { $supabase } = useNuxtApp()
  return $supabase
}
