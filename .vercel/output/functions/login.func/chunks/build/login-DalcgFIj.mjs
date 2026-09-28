import { _ as _sfc_main$1 } from './Card-CvXBImPH.mjs';
import { _ as _sfc_main$2, a as _sfc_main$1$1 } from './FormField-Dg9jc304.mjs';
import { a8 as useToast, a7 as useSupabaseUser, J as navigateTo, i as _sfc_main$8, d as _sfc_main$d } from './server.mjs';
import { ref, watch, mergeProps, unref, withCtx, isRef, createVNode, createTextVNode, toDisplayString, withModifiers, openBlock, createBlock, createCommentVNode, withDirectives, vShow, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderStyle } from 'vue/server-renderer';
import { u as useSupabaseClient } from './useSupabaseClient-DpUjSdiM.mjs';
import '@vueuse/core';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';
import 'vue-router';
import '@supabase/ssr';
import '@iconify/vue';
import 'tailwindcss/colors';
import '@vue/shared';
import '@vueuse/shared';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = {
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const success = ref(false);
    const email = ref("");
    const password = ref("");
    const showPassword = ref(false);
    const authMode = ref("login");
    const isLoading = ref(false);
    const supabase = useSupabaseClient();
    const toast = useToast();
    const user = useSupabaseUser();
    watch(
      user,
      (user2) => {
        if (user2) {
          return navigateTo("/dashboard");
        }
      },
      { immediate: true }
    );
    const handleSubmit = async () => {
      if (!email.value) {
        return toast.add({
          title: "Gagal",
          description: "Email wajib diisi!",
          color: "error",
          icon: "i-heroicons-x-circle"
        });
      }
      if (authMode.value !== "magic-link" && !password.value) {
        return toast.add({
          title: "Gagal",
          description: "Password wajib diisi!",
          color: "error",
          icon: "i-heroicons-x-circle"
        });
      }
      isLoading.value = true;
      try {
        const siteUrl = (void 0).location.origin;
        if (authMode.value === "login") {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value
          });
          if (error) throw error;
          toast.add({
            title: "Login Berhasil!",
            description: "Selamat datang kembali di FTracker.",
            color: "success",
            icon: "i-heroicons-check-circle"
          });
        } else if (authMode.value === "register") {
          const { error } = await supabase.auth.signUp({
            email: email.value,
            password: password.value
          });
          if (error) throw error;
          toast.add({
            title: "Registrasi Berhasil! 📩",
            description: `Link verifikasi telah dikirim ke ${email.value}. Silakan periksa inbox Gmail Anda untuk mengaktifkan akun.`,
            color: "success",
            icon: "i-heroicons-paper-airplane",
            timeout: 8e3
            // Tampil lebih lama (8 detik) agar terbaca utuh
          });
          authMode.value = "login";
        } else if (authMode.value === "magic-link") {
          const { error } = await supabase.auth.signInWithOtp({
            email: email.value,
            options: {
              emailRedirectTo: `${siteUrl}/confirm`
            }
          });
          if (error) throw error;
          toast.add({
            title: "Cek Email Anda",
            description: `Kami telah mengirimkan link login ke ${email.value}. Silahkan periksa kotak masuk.`,
            color: "success",
            icon: "i-heroicons-check-circle"
          });
          success.value = true;
        }
      } catch (error) {
        let errorMessage = error.message;
        if (errorMessage.includes("Invalid login credentials")) {
          errorMessage = "Email atau Password salah!";
        } else if (errorMessage.includes("Email not confirmed")) {
          errorMessage = "Email Anda belum dikonfirmasi! Silakan buka Gmail dan klik link verifikasi yang telah kami kirimkan.";
        } else if (errorMessage.includes("Password should be at least")) {
          errorMessage = "Password minimal 6 karakter!";
        } else if (errorMessage.includes("missing email or phone") || errorMessage.includes("missing email")) {
          errorMessage = "Email wajib diisi!";
        } else if (errorMessage.includes("User already exists") || errorMessage.includes("User already registered")) {
          errorMessage = "Email ini sudah terdaftar! Silakan login menggunakan Magic Link.";
        } else if (errorMessage.includes("Anonymous sign-ins are not disabled") || errorMessage.includes("Signup requires password")) {
          errorMessage = "Password wajib diisi dengan benar !";
        }
        toast.add({
          title: "Gagal",
          description: errorMessage,
          color: "error",
          icon: "i-heroicons-exclamation-circle"
        });
      } finally {
        isLoading.value = false;
      }
    };
    const isResetting = ref(false);
    const handleForgotPassword = async () => {
      if (!email.value) {
        return toast.add({
          title: "Gagal",
          description: "Silakan isi alamat email Anda terlebih dahulu!",
          color: "error",
          icon: "i-heroicons-x-circle"
        });
      }
      isResetting.value = true;
      try {
        const siteUrl = (void 0).location.origin;
        const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
          redirectTo: `${siteUrl}/reset-password`
          // Diarahkan ke halaman reset password baru
        });
        if (error) throw error;
        toast.add({
          title: "Email Reset Terkirim",
          description: `Tautan pengaturan ulang kata sandi telah dikirim ke ${email.value}`,
          color: "success",
          icon: "i-heroicons-check-circle"
        });
      } catch (error) {
        toast.add({
          title: "Gagal Mengirim",
          description: error.message,
          color: "error",
          icon: "i-heroicons-exclamation-circle"
        });
      } finally {
        isResetting.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$1;
      const _component_UFormField = _sfc_main$2;
      const _component_UInput = _sfc_main$1$1;
      const _component_UButton = _sfc_main$8;
      const _component_UIcon = _sfc_main$d;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-md mx-auto mt-20 px-4" }, _attrs))}>`);
      if (!unref(success)) {
        _push(ssrRenderComponent(_component_UCard, null, {
          header: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-between"${_scopeId}><h3 class="text-lg font-bold leading-6 text-gray-900 dark:text-white"${_scopeId}>`);
              if (unref(authMode) === "login") {
                _push2(`<span${_scopeId}>Masuk ke FTracker</span>`);
              } else if (unref(authMode) === "register") {
                _push2(`<span${_scopeId}>Daftar Akun Baru</span>`);
              } else {
                _push2(`<span${_scopeId}>Masuk Tanpa Password</span>`);
              }
              _push2(`</h3></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("h3", { class: "text-lg font-bold leading-6 text-gray-900 dark:text-white" }, [
                    unref(authMode) === "login" ? (openBlock(), createBlock("span", { key: 0 }, "Masuk ke FTracker")) : unref(authMode) === "register" ? (openBlock(), createBlock("span", { key: 1 }, "Daftar Akun Baru")) : (openBlock(), createBlock("span", { key: 2 }, "Masuk Tanpa Password"))
                  ])
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<form class="space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UFormField, {
                label: "Email",
                required: "",
                name: "email"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UInput, {
                      type: "email",
                      placeholder: "email@contoh.com",
                      modelValue: unref(email),
                      "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                      icon: "i-heroicons-envelope",
                      loading: unref(isLoading),
                      class: "w-full"
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_UInput, {
                        type: "email",
                        placeholder: "email@contoh.com",
                        modelValue: unref(email),
                        "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                        icon: "i-heroicons-envelope",
                        loading: unref(isLoading),
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(authMode) !== "magic-link") {
                _push2(ssrRenderComponent(_component_UFormField, {
                  label: "Password",
                  required: "",
                  name: "password"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(_component_UInput, {
                        type: unref(showPassword) ? "text" : "password",
                        placeholder: "••••••••",
                        modelValue: unref(password),
                        "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                        icon: "i-heroicons-lock-closed",
                        loading: unref(isLoading),
                        class: "w-full"
                      }, {
                        trailing: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(ssrRenderComponent(_component_UButton, {
                              color: "neutral",
                              variant: "link",
                              size: "xs",
                              icon: unref(showPassword) ? "i-heroicons-eye-slash" : "i-heroicons-eye",
                              class: "cursor-pointer text-gray-400 hover:text-primary p-0",
                              onClick: ($event) => showPassword.value = !unref(showPassword)
                            }, null, _parent4, _scopeId3));
                          } else {
                            return [
                              createVNode(_component_UButton, {
                                color: "neutral",
                                variant: "link",
                                size: "xs",
                                icon: unref(showPassword) ? "i-heroicons-eye-slash" : "i-heroicons-eye",
                                class: "cursor-pointer text-gray-400 hover:text-primary p-0",
                                onClick: ($event) => showPassword.value = !unref(showPassword)
                              }, null, 8, ["icon", "onClick"])
                            ];
                          }
                        }),
                        _: 1
                      }, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(_component_UInput, {
                          type: unref(showPassword) ? "text" : "password",
                          placeholder: "••••••••",
                          modelValue: unref(password),
                          "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                          icon: "i-heroicons-lock-closed",
                          loading: unref(isLoading),
                          class: "w-full"
                        }, {
                          trailing: withCtx(() => [
                            createVNode(_component_UButton, {
                              color: "neutral",
                              variant: "link",
                              size: "xs",
                              icon: unref(showPassword) ? "i-heroicons-eye-slash" : "i-heroicons-eye",
                              class: "cursor-pointer text-gray-400 hover:text-primary p-0",
                              onClick: ($event) => showPassword.value = !unref(showPassword)
                            }, null, 8, ["icon", "onClick"])
                          ]),
                          _: 1
                        }, 8, ["type", "modelValue", "onUpdate:modelValue", "loading"])
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_UButton, {
                type: "submit",
                color: "primary",
                variant: "solid",
                block: "",
                class: "mt-6",
                loading: unref(isLoading),
                icon: unref(authMode) === "magic-link" ? "i-heroicons-sparkles" : ""
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(authMode) === "login" ? "Masuk" : unref(authMode) === "register" ? "Daftar" : "Kirim Magic Link")}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(authMode) === "login" ? "Masuk" : unref(authMode) === "register" ? "Daftar" : "Kirim Magic Link"), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(authMode) === "login") {
                _push2(`<div class="text-right mt-1"${_scopeId}><button type="button" class="text-xs text-gray-500 hover:text-primary transition font-medium cursor-pointer"${ssrIncludeBooleanAttr(unref(isResetting)) ? " disabled" : ""}${_scopeId}> Lupa password? / Reset Password </button></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</form><div class="mt-6 space-y-3 text-center text-sm"${_scopeId}><div class="relative flex items-center py-2"${_scopeId}><div class="grow border-t border-gray-200 dark:border-gray-800"${_scopeId}></div><span class="shrink-0 mx-4 text-gray-400 text-xs font-medium"${_scopeId}>ATAU</span><div class="grow border-t border-gray-200 dark:border-gray-800"${_scopeId}></div></div><div class="flex flex-col space-y-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UButton, {
                variant: "ghost",
                color: "neutral",
                block: "",
                icon: unref(authMode) === "magic-link" ? "i-heroicons-key" : "i-heroicons-envelope-open",
                onClick: ($event) => authMode.value = unref(authMode) === "magic-link" ? "login" : "magic-link"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(unref(authMode) === "magic-link" ? "Kembali Pakai Password" : "Login Pakai Magic Link")}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(authMode) === "magic-link" ? "Kembali Pakai Password" : "Login Pakai Magic Link"), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<div class="text-gray-500 dark:text-gray-400 mt-2" style="${ssrRenderStyle(unref(authMode) !== "magic-link" ? null : { display: "none" })}"${_scopeId}>${ssrInterpolate(unref(authMode) === "login" ? "Belum punya akun?" : "Sudah punya akun?")} <button type="button" class="text-primary font-semibold hover:underline"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(authMode) === "login" ? "Daftar di sini" : "Masuk di sini")}</button></div></div></div>`);
            } else {
              return [
                createVNode("form", {
                  onSubmit: withModifiers(handleSubmit, ["prevent"]),
                  class: "space-y-4"
                }, [
                  createVNode(_component_UFormField, {
                    label: "Email",
                    required: "",
                    name: "email"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        type: "email",
                        placeholder: "email@contoh.com",
                        modelValue: unref(email),
                        "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
                        icon: "i-heroicons-envelope",
                        loading: unref(isLoading),
                        class: "w-full"
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                    ]),
                    _: 1
                  }),
                  unref(authMode) !== "magic-link" ? (openBlock(), createBlock(_component_UFormField, {
                    key: 0,
                    label: "Password",
                    required: "",
                    name: "password"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        type: unref(showPassword) ? "text" : "password",
                        placeholder: "••••••••",
                        modelValue: unref(password),
                        "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
                        icon: "i-heroicons-lock-closed",
                        loading: unref(isLoading),
                        class: "w-full"
                      }, {
                        trailing: withCtx(() => [
                          createVNode(_component_UButton, {
                            color: "neutral",
                            variant: "link",
                            size: "xs",
                            icon: unref(showPassword) ? "i-heroicons-eye-slash" : "i-heroicons-eye",
                            class: "cursor-pointer text-gray-400 hover:text-primary p-0",
                            onClick: ($event) => showPassword.value = !unref(showPassword)
                          }, null, 8, ["icon", "onClick"])
                        ]),
                        _: 1
                      }, 8, ["type", "modelValue", "onUpdate:modelValue", "loading"])
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  createVNode(_component_UButton, {
                    type: "submit",
                    color: "primary",
                    variant: "solid",
                    block: "",
                    class: "mt-6",
                    loading: unref(isLoading),
                    icon: unref(authMode) === "magic-link" ? "i-heroicons-sparkles" : ""
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(authMode) === "login" ? "Masuk" : unref(authMode) === "register" ? "Daftar" : "Kirim Magic Link"), 1)
                    ]),
                    _: 1
                  }, 8, ["loading", "icon"]),
                  unref(authMode) === "login" ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-right mt-1"
                  }, [
                    createVNode("button", {
                      type: "button",
                      class: "text-xs text-gray-500 hover:text-primary transition font-medium cursor-pointer",
                      onClick: handleForgotPassword,
                      disabled: unref(isResetting)
                    }, " Lupa password? / Reset Password ", 8, ["disabled"])
                  ])) : createCommentVNode("", true)
                ], 32),
                createVNode("div", { class: "mt-6 space-y-3 text-center text-sm" }, [
                  createVNode("div", { class: "relative flex items-center py-2" }, [
                    createVNode("div", { class: "grow border-t border-gray-200 dark:border-gray-800" }),
                    createVNode("span", { class: "shrink-0 mx-4 text-gray-400 text-xs font-medium" }, "ATAU"),
                    createVNode("div", { class: "grow border-t border-gray-200 dark:border-gray-800" })
                  ]),
                  createVNode("div", { class: "flex flex-col space-y-2" }, [
                    createVNode(_component_UButton, {
                      variant: "ghost",
                      color: "neutral",
                      block: "",
                      icon: unref(authMode) === "magic-link" ? "i-heroicons-key" : "i-heroicons-envelope-open",
                      onClick: ($event) => authMode.value = unref(authMode) === "magic-link" ? "login" : "magic-link"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(toDisplayString(unref(authMode) === "magic-link" ? "Kembali Pakai Password" : "Login Pakai Magic Link"), 1)
                      ]),
                      _: 1
                    }, 8, ["icon", "onClick"]),
                    withDirectives(createVNode("div", { class: "text-gray-500 dark:text-gray-400 mt-2" }, [
                      createTextVNode(toDisplayString(unref(authMode) === "login" ? "Belum punya akun?" : "Sudah punya akun?") + " ", 1),
                      createVNode("button", {
                        type: "button",
                        onClick: ($event) => authMode.value = unref(authMode) === "login" ? "register" : "login",
                        class: "text-primary font-semibold hover:underline",
                        disabled: unref(isLoading)
                      }, toDisplayString(unref(authMode) === "login" ? "Daftar di sini" : "Masuk di sini"), 9, ["onClick", "disabled"])
                    ], 512), [
                      [vShow, unref(authMode) !== "magic-link"]
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(ssrRenderComponent(_component_UCard, { class: "text-center" }, {
          header: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white"${_scopeId}> Email Telah Dikirim. </h3>`);
            } else {
              return [
                createVNode("h3", { class: "text-base font-semibold leading-6 text-gray-900 dark:text-white" }, " Email Telah Dikirim. ")
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-center space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-heroicons-paper-airplane",
                class: "w-12 h-12 text-primary mx-auto"
              }, null, _parent2, _scopeId));
              _push2(`<p class="text-gray-500 dark:text-gray-400"${_scopeId}> Silakan cek email <strong${_scopeId}>${ssrInterpolate(unref(email))}</strong> untuk mengonfirmasi login kamu. </p>`);
              _push2(ssrRenderComponent(_component_UButton, {
                variant: "ghost",
                onClick: ($event) => {
                  success.value = false;
                  authMode.value = "login";
                }
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Kembali ke login `);
                  } else {
                    return [
                      createTextVNode(" Kembali ke login ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "text-center space-y-4" }, [
                  createVNode(_component_UIcon, {
                    name: "i-heroicons-paper-airplane",
                    class: "w-12 h-12 text-primary mx-auto"
                  }),
                  createVNode("p", { class: "text-gray-500 dark:text-gray-400" }, [
                    createTextVNode(" Silakan cek email "),
                    createVNode("strong", null, toDisplayString(unref(email)), 1),
                    createTextVNode(" untuk mengonfirmasi login kamu. ")
                  ]),
                  createVNode(_component_UButton, {
                    variant: "ghost",
                    onClick: ($event) => {
                      success.value = false;
                      authMode.value = "login";
                    }
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Kembali ke login ")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-DalcgFIj.mjs.map
