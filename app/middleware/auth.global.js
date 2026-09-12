export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();
  const isDemo = to.query.demo === "true";

  // Jika user belum login dan mencoba masuk ke dashboard tanpa mode demo
  if (!user.value && to.path === "/dashboard" && !isDemo) {
    return navigateTo("/login");
  }

  // Jika user sudah login tapi mencoba akses halaman login atau confirm
  if (
    user.value &&
    (to.path === "/login" || to.path === "/confirm")
  ) {
    return navigateTo("/dashboard");
  }
}); 
