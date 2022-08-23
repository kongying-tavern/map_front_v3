import axios from 'axios'
import { create_notify } from "../api/common"
//游客权限认证
function quest_request() {
    return axios({
        method: 'post',
        url: 'https://cloud.yuanshen.site/oauth/token',
        params: {
            scope: 'all',
            grant_type: 'client_credentials',
        },
        headers: {
            'Authorization': `Basic Y2xpZW50OnNlY3JldA==`
        }
    }).catch(error => {
        if (error.response) {
            create_notify(`${error.response.status} ${error.response.statusText}`, 'negative')
        } else if (error.request) {
            create_notify('链接失败，请稍后重试', 'negative')
        } else {
            create_notify(error.message, 'negative')
        }
    })
}
export {
    quest_request
}