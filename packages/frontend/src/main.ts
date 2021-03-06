import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import router from "./router";
import VueClickAway from "vue3-click-away";
import axios from "axios";
import VueAxios from "vue-axios";
import MoralisPlugin from "@/plugins/moralis";

const app = createApp(App);
app.use(MoralisPlugin).use(router).use(VueAxios, axios).use(VueClickAway);
app.mount("#app");
