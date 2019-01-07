// ==========================================
//         Initialize Firebase
//===========================================
var config = {
    apiKey: "AIzaSyCcgMJJA2lFR1BtuOajaz5bfmICSbd_R90",
    authDomain: "trainschedule-dcc38.firebaseapp.com",
    databaseURL: "https://trainschedule-dcc38.firebaseio.com",
    projectId: "trainschedule-dcc38",
    storageBucket: "trainschedule-dcc38.appspot.com",
    messagingSenderId: "770488404692"
  };  

    firebase.initializeApp(config);

// ===========================================
//       Firebase Realtime Database
//   Get a reference to the database service
//============================================

var database = firebase.database();

// ===========================================
//          Detecting Connection State
//============================================

//ConnectionsRef references a specific location in our database. All connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

    connectedRef.on("value", function(snap) {
        // If they are connected, snap.val()===true
        if (snap.val()) {
            // Add user to the connections list.
            var con = connectionsRef.push(true);
                // Remove user from the connection list when they disconnect.
                con.onDisconnect().remove();
        };
    });

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#connected-admins").html(snap.numChildren());
});

// ===========================================
//     Filled Form To Enable Submit Button
//============================================

$("form input").keyup(function() {

  var empty = false;

  $("form input").each(function() {
    event.preventDefault();
      if ($(this).val() == '') {
        console.log(empty)
        empty = true;
      }
      if (empty) {
        $("#submit_id").attr("disabled", "disabled");
        
      } else {
        $("#submit_id").removeAttr("disabled");
      }
  });
});

// ===========================================
//         Click Event, Submit Button
//============================================
$("#submit_id").on("click", function(event) {
  event.preventDefault();
  //Disable submit button after clicked
  $("#submit_id").attr("disabled", "disabled");
  var trName = $("#train-name").val().trim();
  var trDestination = $("#destination").val().trim();
  var trFirstTrainTime = $("#firstTrainTime").val().trim();  //moment here
  var trFrequency = $("#frequency").val().trim();   //moment calculate here
  
 // Creates local "temporary" object for holding trains data
  var newtr = {
    trName: trName,
    // trName,
    trDestination: trDestination,
    // trDestination,
    trFirstTrainTime: trFirstTrainTime,
    // trFirstTrainTime,
    trFrequency: trFrequency,
    // trFrequency,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  };

  
  // Upload new train data to Firebase 'trains' database
  database.ref('/trains').push(newtr);

   // Clear form
  $("#train-name").val("");
  $("#destination").val("");
  $("#firstTrainTime").val("");
  $("#frequency").val("");
});
  

// ===========================================
//          Calculation and Display
//============================================
// The Firebase 'child_added' event is typically used when retrieving a list of items from the database.
// Create Firebase event for adding train to the database and a row in the html when a user adds an entry

database.ref('/trains').on("child_added", function(childSnapshot) {

  // Store data into a variable.
  var newName = childSnapshot.val().trName;
  var newDestination = childSnapshot.val().trDestination;
  var newFirstTrainTime = childSnapshot.val().trFirstTrainTime;
  var newFrequency = childSnapshot.val().trFrequency;

  //Time calculation
  var trFrequency =newFrequency;
  var firstTime = newFirstTrainTime;
  var firstTimeconverted = moment(firstTime,"HH:mm")//.subtract(1,"year")
  
  var diffTime = moment().diff(moment(firstTimeconverted),"minutes");
  var trRemainder = diffTime%trFrequency;
  var trMinutesTillTrain = trFrequency -trRemainder;
  var nextTrain = moment().add(trMinutesTillTrain,"minutes");
  var nextArrival = moment(nextTrain).format("HH:mm");
  console.log(nextArrival)
  // Add each train's data into the table
  $("#train-table> tbody").append("<tr><td>" + newName + "</td><td>" + newDestination + "</td><td>" +
  newFrequency + "</td><td>" + nextArrival +"</td><td>"+trMinutesTillTrain+"</td></tr>");
  }, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});

//=========================
//        Show Clock
//=========================
function update() {
  $('#clock').html(moment().format('MMMM D, YYYY H:mm:ss'));
}

setInterval(update, 1000);

// ===========================================
//        Refresh Page Every 1 Min
//============================================
setTimeout(function(){
  window.location.reload();
}, 60000);