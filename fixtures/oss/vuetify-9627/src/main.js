// Vue 2's full build (the build aliases "vue" to it for this stack), so the
// template compiles in the browser and Vuetify's bundle shares the same Vue.
import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";

Vue.use(Vuetify);

// The issue's page: several buttons and one dialog.
new Vue({
  vuetify: new Vuetify(),
  data: () => ({ dialog: false }),
  template: `
    <v-app>
      <v-content>
        <div style="padding: 2rem">
          <v-btn id="before">Before</v-btn>
          <v-btn id="open" @click="dialog = true">Open dialog</v-btn>
          <v-btn id="after">After</v-btn>
          <v-dialog v-model="dialog" width="400">
            <v-card id="card">
              <v-card-title>Edit name</v-card-title>
              <v-card-text><input id="name" aria-label="Name" /></v-card-text>
              <v-card-actions>
                <v-btn id="cancel" @click="dialog = false">Cancel</v-btn>
                <v-btn id="save" @click="dialog = false">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-content>
    </v-app>`,
}).$mount("#app");
