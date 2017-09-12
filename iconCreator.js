const async = require('async')
const request = require('request')
const fs = require('fs')
const imagemagick = require('imagemagick')
const gm = require('gm').subClass({ imageMagick: true })
const exec = require('child_process').exec

class iconCreator {
  constructor (name) {
    this.name = name.split(" ").join("")
    this.path = "./icons/"
    this.filePath = null
    this.filePath_bmp = null
    this.filePath_svg = null
    this.url = null
    this.icon = null
    this.operationQueue = async.queue((task, callback) => {
      console.log('item pushed')
      task(callback)
    }, 1)
  }

  download (url) {
    const self = this
    self.url = url
  
    self.operationQueue.push(queueCallback => {
      self.icon = gm(request(self.url)).stream((err, stdout, stderr) => {
        self.filePath = self.path + self.name + ".png"
        var writeStream = fs.createWriteStream(self.filePath)
        stdout.pipe(writeStream)
  
        writeStream.on('error', err => {
          console.log(err)
          queueCallback()
        })
  
        writeStream.on('finish', () => {
          console.log("download finish")
          queueCallback()
        })
        stdout.on('error', err => {
          console.log('err: ' + err)
          queueCallback()
        })
      })
    })
    return self
  }

  contrast (amount) {
    console.log("iconCreator.prototype.contrast call")
    const self = this
    self.operationQueue.push(queueCallback => {
      amount = amount ? amount : 10
      const cute = `convert ${self.filePath} -fuzz ${amount} % -fill black +opaque black ${self.filePath}`
      exec(cute, function (error, stdout, stderr) {
        if (error || stderr) {
          console.log(error || stderr)
        }
        queueCallback()
      })
    })
    return self
  }

  monochrome () {
    const self = this
    self.operationQueue.push(queueCallback => {
      const cute = `convert ${self.filePath} -fill black +opaque black ${self.filePath}`
      exec(cute, function (error, stdout, stderr) {
        if (error || stderr) {
          console.log(error || stderr)
        }
        queueCallback()
      })
    })
    return self  
  }

  checkColor(x, y) {
    const self = this
    self.operationQueue.push(queueCallback => {
      x = x ? x : 1
      y = y ? y : 1
      const cute = `convert ${self.filePath} -scale ${x}x ${y}y \! -format '%[pixel:u]' info:-`
      exec(cute, function (error, stdout, stderr) {
        if (error || stderr) {
          console.log(error || stderr)
        }
        if (stdout === 'gray(0)' || stdout === 'srgb(0,0,0)') {
          self.abort = true
        }
        queueCallback()
      })
    })
    return self
  }

  resizeAndCenter(size) {
    const self = this
    self.operationQueue.push(queueCallback => {
      size = size ? size : "220x220"
      const cute = `convert -define png:size=${size} ${self.filePath} -thumbnail \"200x200\" -background transparent -gravity center -extent 220x220 ${self.filePath}`
      exec(cute, (error, stdout, stderr) => {
        if (error || stderr) {
          console.log(error || stderr)
        }
        queueCallback()
      })
    })
    return self
  }

  toBmp() {
    const self = this
    self.operationQueue.push(queueCallback => {
      self.filePath_bmp = self.filePath.replace(".png", ".bmp")
      const cute = `convert ${self.filePath} -background \"#FFFFFF\" -flatten ${self.filePath_bmp}`
      exec(cute, (error, stdout, stderr) => {
        if (error || stderr) {
          console.log(error || stderr)
        }
        queueCallback()
      })
    })
    return self  
  }

  toSvg () {
    const self = this
    self.operationQueue.push(queueCallback => {
      self.filePath_svg = self.filePath_bmp.replace(".bmp", ".svg")
      const cute = `potrace -s -o ${self.filePath_svg} ${self.filePath_bmp}`
      exec(cute, (error, stdout, stderr) => {
        if (error || stderr) {
          console.log(error || stderr)
        }
        queueCallback()
      })
    })
    return self  
  }

  pixelate (filter, scale, threshold) {
    const self = this
    self.operationQueue.push(queueCallback => {
      filter = filter ? filter : 1
      scale = scale ? scale : 2
      threshold = threshold ? threshold : 0.5
      const cute = `mkbitmap ${self.filePath_bmp} -f ${filter} -s ${scale} -t ${threshold} -o ${self.filePath_bmp}`
      exec(cute, (error, stdout, stderr) => {
        if (error || stderr) {
          console.log(error || stderr)
        }
        queueCallback()
      })
    })
    return self
  }
}

module.exports = iconCreator
