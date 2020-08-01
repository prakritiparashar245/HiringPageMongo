const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
var mongo = require('mongodb');
//const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();

// Middleware
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
	extended: true
}));

app.use(methodOverride('_method'));


// Mongo URI
const mongoURI = 'mongodb://localhost:27017/comunev';
var new_db = "mongodb://localhost:27017/comunev";

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;


conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('hiring');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: 'hiring'
        };
        resolve(fileInfo);
    });
  }
});
//UPLOADS FILE IN FOLDER NAME UPLOADS
const upload= multer({  dest:'uploads/' });


//@route GET/defaultpage

app.get('/',function(req,res){
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('/public/index.html');
}).listen(3000);
console.log("Server listening at : 3000");


// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => 
{

	var name = req.body.name;
	var email= req.body.email;
	var position= req.body.position;
	var qualification = req.body.qualification;
	
	
	var data = {
		"name":name,
		"email":email,
		"position": position, 
		"qualification" : qualification
	}
		mongo.connect(new_db , function(error , db){
		if (error){
			throw error;
		}
		console.log("connected to database COMUNEV successfully");
		var dbo=db.db("comunev");
		dbo.collection("hiring").insertOne(data, (err , collection) => {
			if(err) throw err;
			console.log("Record inserted successfully in HIRE");
			console.log(collection);
   			
		});
});
   //console.log('res.json({ file: req.file })');
  //res.redirect('/success.html');
console.log(`file added to hiring collection`)
return res.redirect('/public/success.html'); 
//res.redirect('/'); 
});

