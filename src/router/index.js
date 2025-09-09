import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import {
  is_visitor_expired,
  quest_request,
  set_user_data,
} from "../service/user_request";
import { set_Cookies, get_Cookies } from "../api/common";
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({
      left: 0,
      top: 0,
    }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });
  Router.beforeEach((to, from, next) => {
    if (window._hmt) {
      if (to.path) {
        window._hmt.push(["_trackPageview", "/#" + to.fullPath]);
      }
    }
    //鉴定是否存在token，若否，默认以游客身份登录
    if (is_visitor_expired()) {
      quest_request().then((res) => {
        set_user_data(res.data || {});
        next();
      });
    } else {
      next();
    }
  });
  return Router;
});
