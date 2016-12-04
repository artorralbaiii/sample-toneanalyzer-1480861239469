/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var services = JSON.parse(process.env.VCAP_SERVICES);

var tone_analyzer = new ToneAnalyzerV3({
    username: services.tone_analyzer[0].credentials.username,
    password: services.tone_analyzer[0].credentials.password,
    version_date: '2016-05-19'
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/pages/');

app.get('/', function (req, res) {
    res.render('home', {
        name: ''
    });
});

app.post('/', function (req, res) {
        
    tone_analyzer.tone({
            text: req.body['inputText']
        },
        function (err, tone) {
            if (err)
                console.log(err);
            else
                res.render('analysis', {
                    analysis: tone.document_tone.tone_categories
                });
        });
});

app.get('/vcap', function(req, res){
    res.json(process.env.VCAP_SERVICES);
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function () {
    // print a message when the server starts listening
    console.log("server starting on " + appEnv.url);
});