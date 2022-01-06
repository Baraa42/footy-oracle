import NotFound from "../views/errors/NotFound.vue";
import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    redirect: "/sport/soccer",
  },
  {
    path: "/swap",
    name: "swap",
    component: () => import(/* webpackChunkName: "swap" */ "../views/Swap.vue"),
  },
  {
    path: "/playground",
    name: "playground",
    component: () => import(/* webpackChunkName: "playground" */ "../views/Playground.vue"),
  },
  {
    path: "/nft-editor",
    name: "nft-editor",
    component: () => import(/* webpackChunkName: "nft-editor" */ "../views/NftEditor.vue"),
  },
  {
    path: "/history",
    name: "history",
    component: () => import(/* webpackChunkName: "history" */ "../views/History.vue"),
  },
  {
    path: "/marketplace",
    name: "marketplace-list",
    component: () => import(/* webpackChunkName: "marketplace" */ "../views/marketplace/MarketplaceList.vue"),
  },
  {
    path: "/marketplace/:tokenId",
    name: "marketplace-detail",
    component: () => import(/* webpackChunkName: "marketplace" */ "../views/marketplace/MarketplaceDetail.vue"),
  },
  {
    path: "/nftMarketplace",
    name: "nftMarketplace",
    component: () => import(/* webpackChunkName: "nftMarketplace" */ "../views/NftMarketplace.vue"),
  },
  {
    path: "/sport/:sport",
    name: "sport",
    component: () => import(/* webpackChunkName: "sport" */ "../views/Sport.vue"),
  },
  {
    path: "/sport/:sport/league/:league",
    name: "league",
    component: () => import(/* webpackChunkName: "league" */ "../views/League.vue"),
  },
  {
    path: "/sport/:sport/league/:league/event/:event",
    name: "event",
    component: () => import(/* webpackChunkName: "event" */ "../views/Event.vue"),
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
