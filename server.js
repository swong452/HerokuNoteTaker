// Create express framework
var express = require('express');
var path = require("path");
var fs = require('fs');

var app = express();
// Static Port if run on my PC
//var PORT = 3002;

// Dynamic Port on Heroku
var PORT = process.env.PORT || 3000;

var notesArray = [];

// setup express to handle JSON data parsing and obj/string
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'))

// ================================================================================
// ROUTER
// The below points our server to a series of "route" files.
// These routes give our server a "map" of how to respond when users visit or request data from various URLs.
// ================================================================================

app.get('/notes', function (req, res) {
    res.sendFile(path.join(__dirname, "/public/notes.html"))
})

// This Route will Read notes content from db.json, into a noteObj
// Need to enter this before *, else * will match first.
app.get('/api/notes', function (req, res) {

    //let data = fs.readFileSync('./db/db.json', "utf8")
    //console.log("Data is: ", data, data.length);
    console.log("API GETS Function");
    fs.readFile('./db/db.json', "utf8", function (err, data) {
        if (err) throw err;
        console.log("Read db.json file: current data is ", data, data.length);
        console.log("During Read db.json file: current notesArray is ", notesArray);

        if (data.length > 0) {
            let noteObj = JSON.parse(data);

            // Every time we get notes; we set the notesArray conent = one from db.json parsed list of notes
            notesArray = noteObj;

            console.log("After json parse , noteObj is:", noteObj, typeof (noteObj));
            return res.json(noteObj);
        } else {
            noteObj = [];
            return res.json(noteObj);
        }
    });
})

app.post('/api/notes', function (req, res) {
    var newNote = req.body;
    console.log("POST Function");
    console.log("note array Before:", notesArray);
    console.log("Posted new note Object:", newNote, typeof (newNote));
    notesArray.push(newNote);
    console.log("New note array list After Push is:", notesArray);

    // before write to a file, convert object into JSON Text 
    let notesArrayText = JSON.stringify(notesArray);

    fs.writeFile('./db/db.json', notesArrayText, function (err, data) {
        if (err) throw err;
        console.log("file saved");

        // Question: it needs to return sth for the code to work
        // but the subsequent .then does not really need any return of this call back
        // what is the best practice to handle this ?
        return res.json(notesArray);


    });
}) // end app.post


app.delete('/api/notes/:id', function (req, res) {
    console.log(" APP.DELETE: the Note ID to be deleted is:", req.params.id);
    // read the db.json into the object array

    fs.readFile('./db/db.json', "utf8", function (err, data) {
        if (err) throw err;
        console.log("APP.DELTE: Read db.json file: list of objects are ", data, data.length);
        // convert the string into Object
        let noteObj = JSON.parse(data)

        // use filter, to remove the object with id = req.params.id, create a new array
        let noteObjRemain = noteObj.filter(obj => (obj.id !== req.params.id));
        console.log("After deleted the object, the new array is:", noteObjRemain);

        // Copy the content of this reduced array, to the current array 
        notesArray = noteObjRemain;

        // save it back to db.json

        // before write to a file, convert object into JSON Text 
        let notesArrayText = JSON.stringify(noteObjRemain);

        fs.writeFile('./db/db.json', notesArrayText, function (err, data) {
            if (err) throw err;
            console.log("file saved with obj removed");
            return res.json(true);
        })
    })

})

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, "/public/index.html"))
})

app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});

