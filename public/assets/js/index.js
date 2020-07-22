var $noteTitle = $(".note-title");
var $noteText = $(".note-textarea");
var $saveNoteBtn = $(".save-note");
var $newNoteBtn = $(".new-note");
var $noteList = $(".list-container .list-group");


// activeNote is used to keep track of the note in the textarea
var activeNote = {};
var noteID = 0;  // initialize note ID 

// A function for getting all notes from the db
var getNotes = function() {
  return $.ajax({
    url: "/api/notes",
    method: "GET"
  });
};

// A function for saving a note to the db
var saveNote = function(note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  });
};




// After user click on save note button, trigger this handle note save function
// Get the note data from the inputs, save it to the db and update the view
var handleNoteSave = function() {
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val(),
    id:noteID
  };

  console.log("Entered handleNoteSave function, User added this note: ", newNote);
  saveNote(newNote).then(function(data) {
    console.log("Inside handleNote Save, after .then (before noteID increment)");
    getAndRenderNotes();
    renderActiveNote();
    noteID++;
    console.log("NoteID value is now:", noteID);
  });
};

// Delete the clicked note
var handleNoteDelete = function(event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  var note = $(this)
    .parent(".list-group-item")
    .data();

  console.log("Clicked Delete on this note:", note)
  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(function() {
    getAndRenderNotes();
    renderActiveNote();
  });
};


// A function for deleting a note from the db
var deleteNote = function(id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE"
  });
};


// handleNoteView is called when user clicked on a historical note
// Sets the activeNote and displays it
var handleNoteView = function() {
  console.log("A Note is clicked", this);
  activeNote = $(this).data();
  console.log("activeNote Data() is:", activeNote);
  renderActiveNote();
};

// Previous function handleNoteView , will pass in the exact note obj being clicked
// so, as long as this obj ID is not null; it will be rendered on active note page.
// If there is an activeNote, display it, otherwise render empty inputs
var renderActiveNote = function() {
  console.log("RenderActiveNote Entered");

  $saveNoteBtn.hide();  // while rendering active note, hide the save button.

  if (activeNote.id) {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};

// Sets the activeNote to and empty object and allows the user to enter a new note
var handleNewNoteView = function() {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
var handleRenderSaveBtn = function() {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
var renderNoteList = function(notes) {
  $noteList.empty();
  console.log("Enter renderNodeList function", notes);


  var noteListItems = [];

  for (var i = 0; i < notes.length; i++) {
    console.log("In renderNodeList function, notesArray Length is: ", notes.length);
    console.log("each note is:", notes[i]);
    var note = notes[i];
    var $li = $("<li class='list-group-item'>").data(note);
    var $span = $("<span>").text(note.title);
    var $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
    );

    $li.append($span, $delBtn);
    noteListItems.push($li);
  }

  $noteList.append(noteListItems);
};

// 1st function being called when run index.html , or note.html.
// Gets notes from the db and renders them to the sidebar
var getAndRenderNotes = function() {
  console.log("getAndRednerNote entered" );
  return getNotes().then(function(data) {
    //console.log("After getNotes, in this .then; data received back is: ", data, data.length);

    // get the max note ID so far. the new one is that + 1
    var maxID = Math.max(...data.map(o=>o.id),0);
    console.log("Calculated max ID of current list of note obj: ", maxID)

    // maxID is current obj that has highest ID. Next one to be assigned
    // Next one to be assigned = current maxID + 1
    noteID = maxID + 1; 
    renderNoteList(data);
  });
};

$saveNoteBtn.on("click", handleNoteSave);

// Listener for all the 'li' notes added , which all have the class .list-group-item
$noteList.on("click", ".list-group-item", handleNoteView); 
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();
