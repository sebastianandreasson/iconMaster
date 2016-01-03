var async = require('async'),
    request = require('request'),
    fs = require('fs'),
    imagemagick = require('imagemagick'),
    gm = require('gm').subClass({ imageMagick: true }),
    exec = require('child_process').exec;

var iconCreator = function(name){
    this.name = name.split(" ").join("");
    this.path = "./icons/";
    this.filePath = null;
    this.filePath_bmp = null;
    this.filePath_svg = null;
    this.url = null;
    this.icon = null;
    this.operationQueue = async.queue(function (task, callback) {
        console.log('item pushed');
        task(callback);
    }, 1);
    return this;
};

iconCreator.prototype.download = function(url){
    console.log("iconCreator.prototype.download call");
    var self = this;
    self.url = url;

    self.operationQueue.push(function(queueCallback){
        self.icon = gm(request(self.url)).stream(function (err, stdout, stderr) {
            self.filePath = self.path + self.name + ".png";
            var writeStream = fs.createWriteStream(self.filePath);
            stdout.pipe(writeStream);

            writeStream.on('error', function(e){
                console.log(e);
                queueCallback();
            });

            writeStream.on('finish', function(){
                console.log("download finish")
                queueCallback();
            });
            stdout.on('error', function(err){
                console.log('err: ' + err);
                queueCallback();
            });
        });
    });
    return self;
};

iconCreator.prototype.contrast = function(amount){
    console.log("iconCreator.prototype.contrast call");
    var self = this;
    self.operationQueue.push(function(queueCallback){
        var cute = 'convert ' + self.filePath + ' -fuzz 10% -fill black +opaque black ' + self.filePath;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            queueCallback();
        });
    });
    return self;
};

iconCreator.prototype.monochrome = function(){
    var self = this;
    self.operationQueue.push(function(queueCallback){
        var cute = 'convert ' + self.filePath + ' -fill black +opaque black ' + self.filePath;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            queueCallback();
        });
    });
    return self;
};

iconCreator.prototype.checkColor = function(){
    var self = this;
    self.operationQueue.push(function(queueCallback){
        var cute = 'convert ' + self.filePath + ' -scale 1x1\! -format \'%[pixel:u]\' info:-';
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            if (stdout === 'gray(0)' || stdout === 'srgb(0,0,0)'){
                self.abort = true;
            }
            queueCallback();
        });
    });
    return self;
};

iconCreator.prototype.resizeAndCenter = function(size){
    var self = this;
    self.operationQueue.push(function(queueCallback){
        var cute = 'convert -define png:size=' + size + ' ' + self.filePath + ' -thumbnail \'200x200\' -background transparent -gravity center -extent 220x220 ' + self.filePath;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            queueCallback();
        });
    });
    return self;
};

iconCreator.prototype.toBmp = function(){
    var self = this;
    self.operationQueue.push(function(queueCallback){
        self.filePath_bmp = self.filePath.replace(".png", ".bmp");
        var cute = 'convert ' + self.filePath +  ' -background "#FFFFFF" -flatten ' + self.filePath_bmp;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            queueCallback();
        });
    });
    return self;
};

// mkbitmap ./test.bmp -f 2 -s 1 -t 0.48 -o ./test1.bmp
// mkbitmap ./test.bmp -f 2 -s 2 -t 0.48 -o ./test1.bmp
// -x -t 0.5


iconCreator.prototype.toSvg = function(){
    var self = this;
    self.operationQueue.push(function(queueCallback){
        self.filePath_svg = self.filePath_bmp.replace(".bmp", ".svg");
        var cute = 'potrace -s -o ' + self.filePath_svg + ' ' + self.filePath_bmp;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            queueCallback();
        });
    });
    return self;
};

iconCreator.prototype.pixelate = function(){
    var self = this;
    self.operationQueue.push(function(queueCallback){
        var cute = 'mkbitmap ' + self.filePath_bmp + ' -f 1 -s 2 -t 0.5 -o ' + self.filePath_bmp;
        exec(cute, function (error, stdout, stderr) {
            if (error || stderr){
                console.log(error || stderr);
            }
            queueCallback();
        });
    });
    return self;
};

// iconCreator.prototype.getPixelMatrix = function(width){
//     // we always assume we're dealing with a square image.
//     var self = this;
//     self.pixelMatrix = [
//         [],
//         []
//     ];
//
//     for (var i = 0; i < width; i++) {
//         array[0].push(i);
//         array[1].push(i);
//     };
//
//
// };


module.exports = iconCreator;
