import { $ as useHead, a7 as useSupabaseUser, a4 as useRoute, j as clearNuxtData, J as navigateTo, _ as __nuxt_component_0$2, c as __nuxt_component_1$1 } from './server.mjs';
import { _ as _sfc_main$2 } from './Skeleton-BGmu2OTi.mjs';
import { mergeProps, ref, computed, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr } from 'vue/server-renderer';
import { z as publicAssetsURL } from '../_/nitro.mjs';
import { u as useSupabaseClient } from './useSupabaseClient-DpUjSdiM.mjs';
import 'vue-router';
import '@supabase/ssr';
import '@iconify/vue';
import 'tailwindcss/colors';
import '@vue/shared';
import '@vueuse/core';
import '@vueuse/shared';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';

const _imports_0 = publicAssetsURL("/favicon.ico");
const _sfc_main$1 = {
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const user = useSupabaseUser();
    const supabase = useSupabaseClient();
    useRoute();
    const localAvatarStyle = ref(
      user.value?.user_metadata?.avatar_style || "initials"
    );
    const updateAvatarStyle = async (style) => {
      localAvatarStyle.value = style;
      await supabase.auth.updateUser({
        data: { avatar_style: style }
      });
    };
    computed(() => {
      if (localAvatarStyle.value === "icon") {
        return {
          icon: "i-heroicons-user",
          class: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        };
      } else {
        const email = user.value?.email || "User";
        return {
          src: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random&color=fff&bold=true`
        };
      }
    });
    computed(() => [
      [
        {
          label: "Akun",
          slot: "account",
          // Kita buat custom slot untuk nampilin email
          disabled: true
        }
      ],
      [
        {
          label: "Pakai Icon Bawaan",
          icon: "i-heroicons-user",
          disabled: localAvatarStyle.value === "icon",
          // Disable tombol jika sudah terpilih
          onSelect: () => updateAvatarStyle("icon")
        },
        {
          label: "Pakai Inisial Email",
          icon: "i-heroicons-envelope",
          disabled: localAvatarStyle.value === "initials",
          // Disable tombol jika sudah terpilih
          onSelect: () => updateAvatarStyle("initials")
        }
      ],
      [
        {
          label: "Logout",
          icon: "i-heroicons-arrow-left-on-rectangle",
          onSelect: logout
        }
      ]
    ]);
    computed(() => {
      if (!user.value) return null;
      if (user.value.user_metadata?.avatar_url) {
        return user.value.user_metadata.avatar_url;
      }
      const email = user.value.email || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random&color=fff&bold=true`;
    });
    const logout = async () => {
      await supabase.auth.signOut();
      clearNuxtData();
      navigateTo("/login", { replace: true });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_ClientOnly = __nuxt_component_1$1;
      const _component_USkeleton = _sfc_main$2;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-between mt-10" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition shrink-0"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", _imports_0)} class="w-8 h-8 sm:w-10 sm:h-10 rounded-md"${_scopeId}><span class="text-3xl font-extrabold"${_scopeId}>FTracker</span>`);
          } else {
            return [
              createVNode("img", {
                src: _imports_0,
                class: "w-8 h-8 sm:w-10 sm:h-10 rounded-md"
              }),
              createVNode("span", { class: "text-3xl font-extrabold" }, "FTracker")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_USkeleton, { class: "h-8 w-8 rounded-full" }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_USkeleton, { class: "h-8 w-8 rounded-full" })
            ];
          }
        })
      }, _parent));
      _push(`</header>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Header.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com"
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Red+Rose:wght@300..700&display=swap"
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Header = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto max-w-4xl px-4 sm:px-0" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Header, null, null, _parent));
      _push(`<main class="my-10">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BcifObIF.mjs.map
