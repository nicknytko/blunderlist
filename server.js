var express = require("express"),
    Sequelize = require("sequelize"),
    bodyParser = require("body-parser"),
    config = require("config"),
    uglify_js = require("uglify-js"),
    fs = require("fs");
var app = express(),
    router = express.Router();

const sequelize = new Sequelize(
    config.get("db.name"),
    config.get("db.username"),
    config.get("db.password"),
    {
        host: config.get("db.host"),
        dialect: config.get("db.dialect"),
        storage: config.get("db.sqlite_file"),
    },
);
const Event = sequelize.define("event", {
    event_type: { allowNull: false, defaultValue: 0, type: Sequelize.INTEGER },
    title: { allowNull: false, type: Sequelize.STRING },
    class_org: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING },
    due_date: { type: Sequelize.DATE },
    reserve: { defaultValue: false, type: Sequelize.BOOLEAN },
    reserve_date: { type: Sequelize.DATE },
    reserve_notes: { type: Sequelize.TEXT },
    notes: { type: Sequelize.TEXT },
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var version = require("child_process")
    .execSync("git rev-parse HEAD")
    .toString()
    .trim();

function sanitize_input(event) {
    var return_event = {};

    for (key in event) {
        switch (key) {
        case "event_type":
            if (event.event_type == 1) {
                return_event.event_type = 1;
            } else {
                return_event.event_type = 0;
            }
            break;

        case "title":
        case "class_org":
        case "location":
        case "reserve_notes":
        case "notes":
            return_event[key] = event[key];
            break;

        case "reserve":
            if (event.reserve == true) {
                return_event.reserve = true;
            } else {
                return_event.reserve = false;
            }
            break;

        case "due_date":
        case "reserve_date":
            {
                let date = Date.parse(event[key]);

                if (date != NaN) {
                    return_event[key] = new Date(event[key]);
                }
            }
            break;
        }
    }

    return return_event;
}

router.use(express.static("public"));

router.get("/api/all", (req, res) => {
    Event.findAll().then((events) => {
        res.json(events);
    });
});

router.post("/api/new", (req, res) => {
    let input = sanitize_input(req.body);

    Event.create(input).then((event) => {
        res.json(event);
    });
});

router.get("/api/version", (req, res) => {
    res.json({
        git: version,
        git_small: version.slice(0, 7),
    });
});

router.get("/api/:id/", (req, res) => {
    Event.findOne({ where: { id: req.params.id } }).then((event) => {
        res.json(event);
    });
});

router.put("/api/:id/update", (req, res) => {
    let input = sanitize_input(req.body);

    Event.update(input, { where: { id: req.params.id } }).then((event) => {
        res.json(event);
    });
});

router.delete("/api/:id/delete", (req, res) => {
    Event.destroy({ where: { id: req.params.id } }).then((event) => {
        res.json(event);
    });
});

function js_minify() {
    var client_files = fs.readdirSync("client_js");
    var code = {};

    client_files.forEach((file) => {
        code[file] = fs.readFileSync("client_js/" + file, "utf8");
    });

    var result = uglify_js.minify(code);
    fs.writeFileSync("public/js/blunderlist.min.js", result.code);

    return result;
}

if (
    process.argv.length == 2 ||
        (process.argv.length == 3 && process.argv[2].match(/serve/i))
) {
    Event.sync({}).then(() => {
        js_minify();

        app.use(config.get("server.base_url"), router);
        app.listen(config.get("server.port"));
    });
} else if (process.argv.length == 3) {
    switch (process.argv[2]) {
    case "minify":
        {
            var result = js_minify();

            if (result.error != undefined) {
                console.log("Minify error: " + result.error);
            } else {
                console.log(
                    'Minified successfully to "public/js/blunderlist.min.js"',
                );
            }
        }
        break;

    default:
        console.log('Unknown command "' + process.argv[2] + '"');
        break;
    }
}
