import { Notify, Cookies } from 'quasar'
import { quest_request } from "../service/user_request"
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
function set_user_token(token, expires) {
    Cookies.set("_yuanshen_map_usertoken", token, {
        expires: `${expires}s`,
    });
}
function check_user_token() {
    if (Cookies.get('_yuanshen_map_usertoken') == null) {
        quest_request().then(res => {
            set_user_token(res.data.access_token, res.data.expires_in)
        })
    }
    return get_user_token();

}
function get_user_token() {
    return Cookies.get('_yuanshen_map_usertoken')
}
function data_statistics() {
    var _hmt = _hmt || [];
    (function () {
        var hm = document.createElement('script')
        hm.src = 'https://hm.baidu.com/hm.js?cd4f7eed0a6e62d83b92c5dfb9f1a20f'
        var s = document.getElementsByTagName('script')[0]
        s.parentNode.insertBefore(hm, s)
    })()
}
export {
    create_notify,
    set_user_token,
    check_user_token,
    get_user_token,
    switch_area_list,
    data_statistics
}