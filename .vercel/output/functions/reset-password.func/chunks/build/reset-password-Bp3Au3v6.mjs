import { _ as _sfc_main$1 } from './Card-CvXBImPH.mjs';
import { _ as _sfc_main$2, a as _sfc_main$1$1 } from './FormField-Dg9jc304.mjs';
import { a7 as useSupabaseUser, a8 as useToast, i as _sfc_main$8, J as navigateTo } from './server.mjs';
import { ref, mergeProps, withCtx, createVNode, createTextVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "reset-password",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const toast = useToast();
    const oldPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const isLoading = ref(false);
    const handleResetPassword = async () => {
      if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        return toast.add({
          title: "Gagal",
          description: "Semua kolom wajib diisi!",
          color: "error",
          icon: "i-heroicons-x-circle"
        });
      }
      if (newPassword.value.length < 6) {
        return toast.add({
          title: "Gagal",
          description: "Kata sandi baru minimal harus terdiri dari 6 karakter!",
          color: "error",
          icon: "i-heroicons-x-circle"
        });
      }
      if (newPassword.value !== confirmPassword.value) {
        return toast.add({
          title: "Gagal",
          description: "Konfirmasi kata sandi tidak cocok!",
          color: "error",
          icon: "i-heroicons-x-circle"
        });
      }
      isLoading.value = true;
      try {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.value.email,
          password: oldPassword.value
        });
        if (verifyError) {
          throw new Error("Kata sandi lama yang Anda masukkan salah!");
        }
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword.value
        });
        if (updateError) throw updateError;
        toast.add({
          title: "Sukses",
          description: "Kata sandi Anda berhasil diperbarui. Mengalihkan ke dashboard...",
          color: "success",
          icon: "i-heroicons-check-circle"
        });
        oldPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
        setTimeout(() => {
          navigateTo("/dashboard", { replace: true });
        }, 2e3);
      } catch (error) {
        toast.add({
          title: "Gagal memperbarui",
          description: error.message,
          color: "error",
          icon: "i-heroicons-exclamation-circle"
        });
      } finally {
        isLoading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$1;
      const _component_UFormField = _sfc_main$2;
      const _component_UInput = _sfc_main$1$1;
      const _component_UButton = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-md mx-auto mt-20 px-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UCard, null, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="text-lg font-bold leading-6 text-gray-900 dark:text-white"${_scopeId}> Ubah Kata Sandi </h3><p class="text-xs text-gray-500 dark:text-gray-400 mt-1"${_scopeId}> Demi keamanan, Anda wajib memasukkan kata sandi lama sebelum menetapkan kata sandi baru. </p>`);
          } else {
            return [
              createVNode("h3", { class: "text-lg font-bold leading-6 text-gray-900 dark:text-white" }, " Ubah Kata Sandi "),
              createVNode("p", { class: "text-xs text-gray-500 dark:text-gray-400 mt-1" }, " Demi keamanan, Anda wajib memasukkan kata sandi lama sebelum menetapkan kata sandi baru. ")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<form class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Kata Sandi Lama",
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: oldPassword.value,
                    "onUpdate:modelValue": ($event) => oldPassword.value = $event,
                    type: "password",
                    placeholder: "••••••••",
                    icon: "i-heroicons-lock-closed",
                    loading: isLoading.value
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: oldPassword.value,
                      "onUpdate:modelValue": ($event) => oldPassword.value = $event,
                      type: "password",
                      placeholder: "••••••••",
                      icon: "i-heroicons-lock-closed",
                      loading: isLoading.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<hr class="border-gray-200 dark:border-gray-800 my-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Kata Sandi Baru",
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: newPassword.value,
                    "onUpdate:modelValue": ($event) => newPassword.value = $event,
                    type: "password",
                    placeholder: "••••••••",
                    icon: "i-heroicons-lock-closed",
                    loading: isLoading.value
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: newPassword.value,
                      "onUpdate:modelValue": ($event) => newPassword.value = $event,
                      type: "password",
                      placeholder: "••••••••",
                      icon: "i-heroicons-lock-closed",
                      loading: isLoading.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Konfirmasi Kata Sandi Baru",
              required: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: confirmPassword.value,
                    "onUpdate:modelValue": ($event) => confirmPassword.value = $event,
                    type: "password",
                    placeholder: "••••••••",
                    icon: "i-heroicons-lock-closed",
                    loading: isLoading.value
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: confirmPassword.value,
                      "onUpdate:modelValue": ($event) => confirmPassword.value = $event,
                      type: "password",
                      placeholder: "••••••••",
                      icon: "i-heroicons-lock-closed",
                      loading: isLoading.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              type: "submit",
              color: "primary",
              variant: "solid",
              block: "",
              class: "mt-6 cursor-pointer",
              loading: isLoading.value
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Perbarui Kata Sandi `);
                } else {
                  return [
                    createTextVNode(" Perbarui Kata Sandi ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form>`);
          } else {
            return [
              createVNode("form", {
                onSubmit: withModifiers(handleResetPassword, ["prevent"]),
                class: "space-y-4"
              }, [
                createVNode(_component_UFormField, {
                  label: "Kata Sandi Lama",
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UInput, {
                      modelValue: oldPassword.value,
                      "onUpdate:modelValue": ($event) => oldPassword.value = $event,
                      type: "password",
                      placeholder: "••••••••",
                      icon: "i-heroicons-lock-closed",
                      loading: isLoading.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                  ]),
                  _: 1
                }),
                createVNode("hr", { class: "border-gray-200 dark:border-gray-800 my-4" }),
                createVNode(_component_UFormField, {
                  label: "Kata Sandi Baru",
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UInput, {
                      modelValue: newPassword.value,
                      "onUpdate:modelValue": ($event) => newPassword.value = $event,
                      type: "password",
                      placeholder: "••••••••",
                      icon: "i-heroicons-lock-closed",
                      loading: isLoading.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                  ]),
                  _: 1
                }),
                createVNode(_component_UFormField, {
                  label: "Konfirmasi Kata Sandi Baru",
                  required: ""
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UInput, {
                      modelValue: confirmPassword.value,
                      "onUpdate:modelValue": ($event) => confirmPassword.value = $event,
                      type: "password",
                      placeholder: "••••••••",
                      icon: "i-heroicons-lock-closed",
                      loading: isLoading.value
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "loading"])
                  ]),
                  _: 1
                }),
                createVNode(_component_UButton, {
                  type: "submit",
                  color: "primary",
                  variant: "solid",
                  block: "",
                  class: "mt-6 cursor-pointer",
                  loading: isLoading.value
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Perbarui Kata Sandi ")
                  ]),
                  _: 1
                }, 8, ["loading"])
              ], 32)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reset-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reset-password-Bp3Au3v6.mjs.map
