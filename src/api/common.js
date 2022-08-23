import { Notify, Cookies } from 'quasar'
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
function get_user_token() {
    return Cookies.get('_yuanshen_map_usertoken');
}
export {
    create_notify,
    set_user_token,
    get_user_token
}