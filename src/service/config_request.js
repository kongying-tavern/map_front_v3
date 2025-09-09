import axios from "axios";

function fetch_config() {
  const url = !import.meta.env.DEV
    ? `https://assets.yuanshen.site/web-map.json?r=${Math.random()}`
    : `https://assets.yuanshen.site/web-map-preview.json?r=${Math.random()}`;
  return axios
    .get(url)
    .then((res) => res.data || {})
    .catch(() => ({}));
}

export { fetch_config };
