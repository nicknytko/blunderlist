function get_base_url() {
    return window.location.href.split("/").slice(0, -1).join("/");
}

function ajax_request(method, url, data, cb) {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function () {
        if (req.readyState == 4 && cb != null) {
            var resp = null;

            try {
                resp = JSON.parse(req.response);
            } catch (exception) {
                console.log(exception);
            }

            if (resp) {
                cb(resp);
            } else {
                cb({});
            }
        }
    };
    req.open(method, get_base_url() + url, true);
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    if (data != null) {
        req.send(JSON.stringify(data));
    } else {
        req.send();
    }
}

function api_all(cb) {
    ajax_request("get", "/api/all", null, cb);
}

function api_new(data, cb) {
    ajax_request("post", "/api/new", data, cb);
}

function api_update(id, data, cb) {
    ajax_request("put", "/api/" + id.toString() + "/update", data, cb);
}

function api_version(cb) {
    ajax_request("get", "/api/version", null, cb);
}

function api_delete(id, cb) {
    ajax_request("delete", "/api/" + id.toString() + "/delete", null, cb);
}
