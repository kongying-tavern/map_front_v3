import { Notify, Cookies } from 'quasar'
import { get_gitee_token, refresh_gitee_token, } from "../service/user_request"
const switch_area_list = ["渊下宫", "三界路飨祭", "金苹果群岛", "地下矿区"];
//提示框
function create_notify(msg, type = 'positive') {
    Notify.create({
        type: type,
        message: msg,
        position: 'top',
        timeout: 1000,
    })
}
//设置cookies
function set_Cookies(token_name, token, expires) {
    Cookies.set(token_name, token, {
        expires: `${expires}s`,
    });
}
//设置localstorage
function set_Storage(name, value) {
    localStorage.setItem(name, value);
}
//获取cookies
function get_Cookies(name) {
    return Cookies.get(name)
}
//获取localstorage
function get_Storage(name) {
    return localStorage.getItem(name);
}
//检查gitee相关token状态
function check_gitee_tokens() {
    if (get_Storage("_gitee_usercode") != undefined) {
        if (get_Storage("_gitee_access_token") != undefined) {
            if (get_Cookies("_gitee_access_expires") == null) {
                refresh_gitee_token().then((res) => {
                    set_Storage("_gitee_access_token", res.data.access_token);
                    set_Cookies("_gitee_access_expires", true, res.data.expires_in);
                    set_Storage("_gitee_refresh_token", res.data.refresh_token);
                });
            } else {
            }
        } else {
            get_gitee_token().then((res) => {
                set_Storage("_gitee_access_token", res.data.access_token);
                set_Cookies("_gitee_access_expires", true, res.data.expires_in);
                set_Storage("_gitee_refresh_token", res.data.refresh_token);
            });
        }
    }
}
export {
    create_notify,
    switch_area_list,
    set_Cookies,
    set_Storage,
    get_Cookies,
    get_Storage,
    check_gitee_tokens
}