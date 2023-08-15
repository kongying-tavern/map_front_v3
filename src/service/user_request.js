import axios from "axios";
import { create_notify, get_Storage } from "../api/common";
import { client_list } from "../api/client";
//游客权限认证
function quest_request() {
  return axios({
    method: "post",
    url: "https://cloud.yuanshen.site/oauth/token",
    params: {
      scope: "all",
      grant_type: "client_credentials",
    },
    headers: {
      Authorization: `Basic Y2xpZW50OnNlY3JldA==`,
    },
  }).catch((error) => {
    if (error.response) {
      create_notify(
        `${error.response.status} ${error.response.statusText}`,
        "negative",
      );
    } else if (error.request) {
      create_notify("链接失败，请稍后重试", "negative");
    } else {
      create_notify(error.message, "negative");
    }
  });
}
//gitee请求access_token
function get_gitee_token() {
  let params = {};
  if (process.env.DEV) {
    params = {
      grant_type: "authorization_code",
      code: get_Storage("_gitee_usercode"),
      client_id:
        "277ea02bae5fce96d432b7609ba03266482c00ef2d99639c71f5d3389ff01228",
      redirect_uri: "http://localhost:9000/",
      client_secret:
        "bf49d65a1a9e66878a29ff71756d599243206959d24cc1dc623de3d8dfcfb049",
    };
  } else {
    params = {
      grant_type: "authorization_code",
      code: get_Storage("_gitee_usercode"),
      client_id: client_list[localStorage.getItem("_yuanshenmap_client_id")][0],
      redirect_uri: "https://yuanshen.site/login.html",
      client_secret:
        client_list[localStorage.getItem("_yuanshenmap_client_id")][1],
    };
  }
  return axios({
    method: "post",
    url: "https://gitee.com/oauth/token",
    params: params,
  });
}
//刷新token
function refresh_gitee_token() {
  return axios({
    method: "post",
    url: "https://gitee.com/oauth/token",
    params: {
      grant_type: "refresh_token",
      refresh_token: get_Storage("_gitee_refresh_token"),
    },
  });
}

//gitee相关操作，详情请见 https://gitee.com/api/v5/swagger#/
//获取存档信息
function get_gitee_gist() {
  return axios({
    method: "get",
    url: "https://gitee.com/api/v5/gists",
    params: {
      access_token: get_Storage("_gitee_access_token"),
      page: 1,
      per_page: 50,
    },
  });
}
//新增存档信息
function add_gitee_gist(data) {
  return axios({
    method: "post",
    url: "https://gitee.com/api/v5/gists",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      ...data,
      access_token: get_Storage("_gitee_access_token"),
    },
  });
}
//编辑存档信息
function edit_gitee_gist(data) {
  return axios({
    method: "patch",
    url: `https://gitee.com/api/v5/gists/${data.id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      ...data,
      access_token: get_Storage("_gitee_access_token"),
    },
  });
}
//删除存档
function delete_gitee_gist(data) {
  return axios({
    method: "delete",
    url: `https://gitee.com/api/v5/gists/${data.id}`,
    params: {
      access_token: get_Storage("_gitee_access_token"),
    },
  });
}
export {
  quest_request,
  get_gitee_token,
  refresh_gitee_token,
  add_gitee_gist,
  get_gitee_gist,
  edit_gitee_gist,
  delete_gitee_gist,
};
