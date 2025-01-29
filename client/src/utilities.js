/**
 * utility functions to make API requests.
 */

function formatParams(params) {
  return Object.keys(params)
    .map((key) => key + "=" + encodeURIComponent(params[key]))
    .join("&");
}

function convertToJSON(res) {
  if (!res.ok) {
    throw `API request failed with response status ${res.status} and text: ${res.statusText}`;
  }
  return res
    .clone()
    .json()
    .catch((error) => {
      return res.text().then((text) => {
        throw `API request's result could not be converted to JSON object:\n${text}`;
      });
    });
}

export function get(endpoint, params = {}) {
  const fullPath = endpoint + "?" + formatParams(params);
  return fetch(fullPath, {
    method: "GET",
    credentials: "include", // crucial
  })
    .then(convertToJSON)
    .catch((error) => {
      throw `GET request to ${fullPath} failed with error:\n${error}`;
    });
}

export function post(endpoint, params = {}) {
  return fetch(endpoint, {
    method: "POST",
    credentials: "include", // crucial
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
    .then(convertToJSON)
    .catch((error) => {
      throw `POST request to ${endpoint} failed with error:\n${error}`;
    });
}
