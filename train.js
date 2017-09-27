
    // Initialize Firebase
    var config = {
    apiKey: "AIzaSyCcgMJJA2lFR1BtuOajaz5bfmICSbd_R90",
    authDomain: "trainschedule-dcc38.firebaseapp.com",
    databaseURL: "https://trainschedule-dcc38.firebaseio.com",
    projectId: "trainschedule-dcc38",
    storageBucket: "trainschedule-dcc38.appspot.com",
    messagingSenderId: "770488404692"
  };

    firebase.initializeApp(config);

    // ================================================================================

    // Get a reference to the database service
    var database = firebase.database();



    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    var connectionsRef = database.ref("/connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

    connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#connected-admins").html(snap.numChildren());
});

    //  Button for adding Trains
$("#submitid").on("click", function(event) {
  event.preventDefault();

  var trName = $("#train-name").val().trim();
  var trDestination = $("#destination").val().trim();
  var trFirstTrainTime = $("#firsttraintime").val().trim();  //moment here
  var trFrequency = $("#frequency").val().trim();   //moment calculate here
  

  


 // Creates local "temporary" object for holding trains data
  var newtr = {
    trName: trName,
    trDestination: trDestination ,
    trFirstTrainTime: trFirstTrainTime,
    trfrequency: trFrequency,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  };

  // Uploads trains data to the database
  database.ref('/trains').push(newtr);

  

   // Clears all of the text-boxes
  $("#train-name").val("");
  $("#destination").val("");
  $("#firsttraintime").val("");
  $("#frequency").val("");

})

// Create Firebase event for adding train to the database and a row in the html when a user adds an entry
database.ref('/trains').on("child_added", function(childSnapshot) {

  // Store everything into a variable.
  var newName = childSnapshot.val().trName;
  var newDestination = childSnapshot.val().trDestination;
  var newFirstTrainTime = childSnapshot.val().trFirstTrainTime;
  var newFrequency = childSnapshot.val().trfrequency;
  

//time calculations
  var trFrequency =newFrequency;
  var firstTime = newFirstTrainTime;
  var firstTimeconverted = moment(firstTime,"HH:mm")//.subtract(1,"year")
  var currentTime = moment();
  var diffTime = moment().diff(moment(firstTimeconverted),"minutes");
  var trRemainder = diffTime%trFrequency;
  var trMinutesTillTrain = trFrequency -trRemainder;
  var nextTrain = moment().add(trMinutesTillTrain,"minutes")
  var nextArrival = moment(nextTrain).format("HH:mm")
  // Add each train's data into the table
  $("#train-table> tbody").append("<tr><td>" + newName + "</td><td>" + newDestination + "</td><td>" +
  newFrequency + "</td><td>" + nextArrival +"</td><td>"+trMinutesTillTrain+"</td></tr>");
  }, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});
