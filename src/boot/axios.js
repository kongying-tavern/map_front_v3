import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { get_user_token, create_notify } from "../api/common"
// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create(
  {
    baseURL: 'https://cloud.yuanshen.site/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyUm9sZXMiOlsiQURNSU4iLCJNQVBfTkVJR1VJIl0sInVzZXJfbmFtZSI6IjcxNzgxODY1MiIsInNjb3BlIjpbImFsbCJdLCJleHAiOjE2NjEyNjk5NjgsInVzZXJJZCI6NywiYXV0aG9yaXRpZXMiOlsiTUFQX05FSUdVSSIsIkFETUlOIl0sImp0aSI6ImExZjIwNWRhLTkzYzEtNGE1Mi04Y2VjLTRjZjU2NGRkYmRmZiIsImNsaWVudF9pZCI6ImNsaWVudCJ9.bMSEv9jY3dZdRExYCRG0CxxDKBFPnbft8ukjAZnpf-JlC-FzL_kYhKNHeQaA3kKzJFjg9ERsFstgCgfJF6GO2y7596oA-f4t3legdG3j1pW9mJZ4jlm1o5EjcQ5IbQdezkGbNEQP3FQ5A_jjZAJ4OLm07sVs6RRYVPqgmUKNIcI5m-PT2lKVJYJy-4rSELgDjEktm7NF3RmhRZxW4rKDIUvotXWhpm7e-PEXg6QJIEbdOAEZtxCXn729w-pJWg-TRN5Lem1l1IuL7umTbBDHb8zI4GRjMOLpPvRAEnR12RolNAofyQ6_jNJG0WCEfP1rAcoh-fILO7Ovrea0Lufglg`
    }
  }
)
api.interceptors.response.use(res => {
  if (res.data.code != 200) {
    create_notify(`${res.data.code} ${res.data.message}`, 'negative');
    return Promise.reject(new Error(`${res.data.message}`));
  }
  return res;
}, error => {
  if (error.response) {
    create_notify(`${error.response.status} ${error.response.statusText}`, 'negative');
  } else if (error.request) {
    create_notify('链接失败，请稍后重试', 'negative');
  } else {
    create_notify(error.message, 'negative');
  }
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

})

export { api }
