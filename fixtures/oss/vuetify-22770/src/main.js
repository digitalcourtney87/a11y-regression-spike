import { createApp, h } from "vue";
import { createVuetify } from "vuetify";
import { VApp, VAutocomplete } from "vuetify/components";
import "vuetify/styles";

// Issue #22770 / fix #23031: keyboard wrap must reach all 100 items.
const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
createApp({ render: () => h(VApp, null, { default: () => h("main", null, [
  h("h1", "Autocomplete navigation"),
  h(VAutocomplete, { label: "Select an item", items, density: "comfortable", menuProps: { maxHeight: 220 } }),
]) }) }).use(createVuetify()).mount("#app");
