var express = require("express");
var app = express();
var path = require("path");
var fileUpload = require('express-fileupload');
var fs = require('fs');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var cookieParser = require('cookie-parser');
var path = require('path');
var zipper = require('zip-local');
var multer  = require('multer');
var dir = './Documents/Transfers/'
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}
app.use(busboy());
app.use(cookieParser());
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var storage = multer.diskStorage({
  destination: function (req, files, cb) {
    cb(null, './Documents/Transfers/intransit/')
  },
  filename: function (req, files, cb) {
    cb(null, files.originalname)
  }
})

var upload = multer({ storage: storage })

if (!fs.existsSync('./Documents/Transfers/intransit/')){
  fs.mkdirSync('./Documents/Transfers/intransit/');
}

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/FTS.html'));

  //__dirname : It will resolve to your project folder.
});
app.get('/login',function(req,res){
  res.sendFile(path.join(__dirname+'/public/login.html'));

  //__dirname : It will resolve to your project folder.
});
app.get('/transfer',function(req,res){
  res.sendFile(path.join(__dirname+'/public/transfer.html'));

  //__dirname : It will resolve to your project folder.
});


app.use(express.static(__dirname + '/public'));

app.post('/fileupload', function(req, res) {
    if(req.cookies['LoggedIn'] == undefined){
      return res.redirect('/login');
    }else{
    var user = req.cookies['LoggedIn'];
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        var type = (path.extname(filename)).substring(1);
        if (!fs.existsSync('./Documents/Transfers/'+user+'/')){
          fs.mkdirSync('./Documents/Transfers/'+user+'/');
        }
        if (!fs.existsSync('./Documents/Transfers/'+user+'/' + type)){
          fs.mkdirSync('./Documents/Transfers/'+user+'/' + type);
        }
        fstream = fs.createWriteStream('./Documents/Transfers/'+user+'/' + type + '/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {

        });

    });
    res.redirect('back');
  }
});

app.post('/sendFile' ,upload.any(), function(req, res){
res.setHeader('Content-Type', 'application/JSON');

if (!fs.existsSync('./Documents/Transfers/zipped/')){
  fs.mkdirSync('./Documents/Transfers/zipped/');
}
var transferCode = req.body.sCode;

zipper.sync.zip('./Documents/Transfers/intransit/').compress().save('./Documents/Transfers/zipped/' + transferCode + ".zip");
var directory = './Documents/Transfers/intransit/';

fs.readdir(directory, (err, files) => {
  if (err) throw err;

  for (var file of files) {
    fs.unlink(path.join(directory, file), err => {
      if (err) throw err;
    });
  }
});
res.redirect('back');

});



app.post('/recieveFile', function(req, res){

  var responseCode = req.body.rCode;
  var path = './Documents/Transfers/zipped/'+responseCode+'.zip';
  if(fs.existsSync(path)){
  res.download(path, function(err) {
     fs.unlinkSync(path);
  });
}else{
  res.redirect('back');
}
});





app.post('/login',urlencodedParser , function(req, res) {
    res.setHeader('Content-Type', 'application/JSON');
    var username = req.body.user;
    var password = req.body.pass;
    var data = fs.readFileSync(__dirname+'/public/lii/lii.txt', 'utf8');
    var splitData = data.split(',');
    var passData = fs.readFileSync(__dirname+'/public/lii/liip.txt', 'utf8');
    var splitPassData = passData.split(',');

    if(splitData[1] == username && password == splitPassData[1]){

      res.cookie('LoggedIn', 'Eli');
    }else if(splitData[2] == username && password == splitPassData[2]){

      res.cookie('LoggedIn', 'Ben');
    }else if(splitData[3] == username && password == splitPassData[3]){

      res.cookie('LoggedIn', 'Dawna');
    }else if(splitData[4] == username && password == splitPassData[4]){

      res.cookie('LoggedIn', 'Hannah');
    }else if(splitData[5] == username && password == splitPassData[5]){

      res.cookie('LoggedIn', 'Abby');
    }else{
      res.redirect('/login');
      return console.log("Inccorect Password or Username");
    }
    return res.redirect('/');
});

app.listen(3000);
console.log("Server running at Port 3000");
