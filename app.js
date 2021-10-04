var express = require("express");
var req = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');
var csrf = require('csurf');

var app = express();
app.set('view engine', 'ejs');
// app.use(express.static(__dirname + '/views'));
app.use('/assets', express.static('static'));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.get('/', function (request, response) {
    var opts = {};

    if (request.query.apitoken && request.query.projectid && request.query.cteamid && request.query.synthesisid) {
        var baseurl = 'https://www.geodesignhub.com/api/v1/projects/';
        // var baseurl = 'http://local.test:8000/api/v1/projects/';
        const apikey = request.query.apitoken;
        const projectid = request.query.projectid;
        const cred = "Token " + apikey;
        const systems_url = baseurl + projectid + '/systems/';
        const bounds_url = baseurl + projectid + '/bounds/';
        const cteamid = request.query.cteamid;
        const synthesisid = request.query.synthesisid;
        const synprojectsurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/';
        
        let URLS = [systems_url, synprojectsurl, bounds_url]

        async.map(URLS, function (url, done) {
            req({
                url: url,
                headers: {
                    "Authorization": cred,
                    "Content-Type": "application/json"
                }
            }, function (err, response, body) {
                if (err || response.statusCode !== 200) {
                    return done(err || new Error());
                }
                return done(null, JSON.parse(body));
            });
        }, function (err, results) {
            if (err) return response.sendStatus(500);
            let opts = {
                "data": results,
            
            };
            response.render('kaledioscope', opts);
        });

    } else {
        response.status(400);
        response.send('Please pass all the valid parameters.');
    }

});

app.listen(process.env.PORT || 5001);