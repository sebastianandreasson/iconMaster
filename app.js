var async = require('async'),
    express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

var routes = require('./routes');
var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
// app.set("view options", { layout: false });
//
// app.use(favicon());
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', routes);
//
// var server = app.listen(3000, function () {
//     var host = server.address().address;
//     var port = server.address().port;
//
//   console.log('Example app listening at http://%s:%s', host, port);
// });


(function(){

    var iconCreator = require('./iconCreator.js');
    iconCreator = new iconCreator("test");

    iconCreator.download("https://upload.wikimedia.org/wikipedia/commons/1/1c/%C3%89l%C3%A9phant_(d%C3%A9tour%C3%A9).png")
    .resizeAndCenter()
    .contrast()
    .toBmp()
    .pixelate();

    // iconCreator.toBmp().toSvg();

}());
