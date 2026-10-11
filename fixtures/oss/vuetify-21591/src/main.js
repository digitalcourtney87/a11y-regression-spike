import { createApp, h } from "vue";
import { createVuetify } from "vuetify";
import { VApp, VMenu, VBtn, VList } from "vuetify/components";
import "vuetify/styles";

// Issue #21591 / fix #22242: zero-delay hover menus remain open on keyboard entry.
createApp({ render: () => h(VApp, null, { default: () => h("main", null, [
  h("h1", "Menu navigation"),
  h(VMenu, { openOnHover: true, openDelay: 0, closeDelay: 0, transition: "slide-x-transition" }, {
    activator: ({ props }) => h(VBtn, props, { default: () => "Test menu" }),
    default: () => h(VList, { tabindex: null, items: ["Item 1", "Item 2", "Item 3"].map((title) => ({ title, value: title, props: { link: true } })) }),
  }),
]) }) }).use(createVuetify()).mount("#app");
