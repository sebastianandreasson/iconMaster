const async = require('async')
const express = require('express')
const path = require('path')
const favicon = require('static-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const IconCreator = require('./iconCreator.js')

const routes = require('./routes');
const app = express();

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

    const IconCreator = require('./iconCreator.js')
    const iconCreator = new IconCreator('test')
    // const imageURL = 'https://upload.wikimedia.org/wikipedia/commons/1/1c/%C3%89l%C3%A9phant_(d%C3%A9tour%C3%A9).png'
    const imageURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfe7ZbjY1-ZCCrDyjnitjD47SI7ZqPBzqh7pcRxzRz0cjnsQtU'

    iconCreator.download(imageURL)
    .resizeAndCenter()
    .contrast()
    .toBmp()
    // .pixelate()
    // .toSvg()
    .done(() => {
      setTimeout(() => {
        iconCreator.pixelate().toSvg()
      }, 500)
    })

}());
