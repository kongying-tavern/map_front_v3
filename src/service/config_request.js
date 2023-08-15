import axios from "axios";

function fetch_config() {
  return axios
    .get(`https://assets.yuanshen.site/web-map.json?r=${Math.random()}`)
    .then((res) => res.data || {})
    .catch(() => ({}));
}

export { fetch_config };
