var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&query=';
var myApp = angular.module('myApp', ['firebase']);

var playlistAttempt = [];

var myCtrl = myApp.controller('myCtrl', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http) {
  // Create a variable 'ref' to reference your firebase storage
  var ref = new Firebase('https://walruses.firebaseio.com/');

  // Create references to store tweets and users
  var tweetsRef = ref.child('tweets');
  var usersRef = ref.child("users");

  // Create a firebaseArray of your tweets, and store this as part of $scope
  $scope.tweets = $firebaseArray(tweetsRef);

  // Create a firebaseObject of your users, and store this as part of $scope
  $scope.users = $firebaseObject(usersRef);

  // Create authorization object that referes to firebase
  $scope.authObj = $firebaseAuth(ref);

  // Test if already logged in
  var authData = $scope.authObj.$getAuth();
  if (authData) {
    $scope.userId = authData.uid;
  }


  // SignUp function
  $scope.signUp = function() {
    // Create user
    $scope.authObj.$createUser({
      email: $scope.email,
      password: $scope.password,
      lat: $scope.lat,
      lon: $scope.lon
    })

      // Once the user is created, call the logIn function
        .then($scope.logIn)

      // Once logged in, set and save the user data
        .then(function(authData) {
          $scope.userId = authData.uid;
          $scope.users[authData.uid] ={
            handle:$scope.handle,
            userImage:$scope.userImage,
            lat: $scope.lat,
            lon: $scope.lon
          }
          $scope.users.$save()
        })

      // Catch any errors
        .catch(function(error) {
          console.error("Error: ", error);
        });
  }

  // SignIn function
  $scope.signIn = function() {
    $scope.logIn().then(function(authData){
      $scope.userId = authData.uid;
    })
  }

  // LogIn function
  $scope.logIn = function() {
    console.log('log in')
    return $scope.authObj.$authWithPassword({
      email: $scope.email,
      password: $scope.password,
      lat: $scope.lat,
      lon: $scope.lon
    })

  }


  // LogOut function
  $scope.logOut = function() {
    $scope.authObj.$unauth()
    $scope.userId = false
  }



  // Function to like a tweet
  $scope.like = function(tweet) {
    tweet.likes += 1;
    $scope.tweets.$save(tweet)
  }






  $scope.audioObject = {}
  $scope.getSongs = function() {
    $http.get(baseUrl + $scope.track).success(function(response){
      data = $scope.tracks = response.tracks.items
      
    })
  }
  $scope.play = function(song) {
    if($scope.currentSong == song) {
      $scope.audioObject.pause()
      $scope.currentSong = false
      return
    }
    else {
      if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
      $scope.audioObject = new Audio(song);
      $scope.audioObject.play()  
      $scope.currentSong = song
    }
  }

    var fuck = "";

  $scope.add = function(trackName, trackArtist) {
    var li = $('<li>').html(trackName  + ', by ' + trackArtist);
    $('#playlist').append(li);
    fuck += trackName + " by " + trackArtist + " | ";
    };

  $scope.publish = function() {
    // Add a new object to the tweets array using the firebaseArray .$add method.
    $scope.tweets.$add({
      text:$scope.playlistName,
      content: fuck,
      userId:$scope.userId,
      likes:0,
      time:Firebase.ServerValue.TIMESTAMP,
      //lat:$scope.lat,
      //lon:$scope.lon
    })

      // Once the tweet is saved, reset the value of $scope.newTweet to empty string
      .then(function() {
        $scope.playlistName = '';
        $('#playlist').html("");
        fuck = "";
      })
  }










  var map;

  // Function to draw your map
  $scope.drawMap = function(){
    // Create map and set view

    var latitude = 34;
    var longitude = -100;
    var zoom = 4;

    var dataSet;


    map = L.map('mapContainer').setView([latitude, longitude], zoom)

    // Create a tile layer variable using the appropriate url
    var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')

    // Add the layer to your map
    layer.addTo(map)
    var test = new L.LayerGroup();
    var circle = new L.circleMarker([47, -122], {color: '#ff69ff'});
    var circle2 = new L.circleMarker([42, -118], {color: '#ff69ff'});
    circle.addTo(test);
    circle2.addTo(test);
    test.addTo(map);
  }
})