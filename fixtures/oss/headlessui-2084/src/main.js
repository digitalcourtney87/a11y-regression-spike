import { createApp, h, ref, computed } from "vue";
import { Combobox, ComboboxLabel, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from "@headlessui/vue";

const people = [{ id: 1, name: "Alpha" }, { id: 2, name: "Beta" }];
// Issue #2084 / fix #2087: no defaultValue, with the documented object displayValue.
createApp({ setup() {
  const open = ref(false);
  const selected = ref(people[0]);
  const query = ref("");
  const filtered = computed(() => people.filter((person) => person.name.toLowerCase().includes(query.value.toLowerCase())));
  return () => h("main", null, [
    h("h1", "Assignee selection"),
    h("button", { onClick: () => { open.value = true; } }, "Choose assignee"),
    open.value ? h(Combobox, { as: "div", modelValue: selected.value, "onUpdate:modelValue": (person) => { selected.value = person; } }, { default: () => [
      h(ComboboxLabel, null, { default: () => "Assignee" }),
      h(ComboboxInput, { id: "assignee", onFocus: (event) => event.target.select(), onClick: (event) => event.target.select(), displayValue: (person) => person.name, onChange: (event) => { query.value = event.target.value; } }),
      h(ComboboxButton, null, { default: () => "Show choices" }),
      h(ComboboxOptions, null, { default: () => filtered.value.map((person) => h(ComboboxOption, { key: person.id, value: person }, { default: () => person.name })) }),
    ] }) : null,
    h("p", { id: "chosen" }, `Chosen ${selected.value.name}`),
  ]);
} }).mount("#app");
