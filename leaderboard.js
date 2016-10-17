PlayersList = new Mongo.Collection('players')

Meteor.methods({
    'createPlayer': function(playerNameVar) {
      var currentUserId = Meteor.userId()
      if(!currentUserId) {
        console.log('You must be logged-in to use this feature.')
        return
      }
      check(playerNameVar, String)
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: currentUserId
      })
    },
    'removePlayer': function(selectedPlayer) {
      var currentUserId = Meteor.userId()
      if(!currentUserId) {
        console.log('You must be logged-in to use this feature.')
        return
      }
      check(selectedPlayer, String)
      PlayersList.remove({ _id: selectedPlayer, createdBy: currentUserId })
    },
    'updateScore': function(selectedPlayer, scoreValue) {
      check(selectedPlayer, String)
      check(scoreValue, Number)
      var currentUserId = Meteor.userId();
      if(currentUserId){
          PlayersList.update( { _id: selectedPlayer, createdBy: currentUserId },
                              { $inc: {score: scoreValue} });
      }
    }
})


if (Meteor.isClient) {
  console.log("Hello client")
  Meteor.subscribe('thePlayers')

  Template.leaderboard.helpers({
    player: function() {
      var currentUserId = Meteor.userId();
      return PlayersList.find({ createdBy: currentUserId },
                              { sort: {score: -1, name: 1} });
    },
    'selectedPlayer': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne({ _id: selectedPlayer });
    },
    'selectedClass': function() {
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if(playerId == selectedPlayer) {
        return "selected"
      }
    }
  })

  Template.addPlayerForm.events( {
    'submit form': function() {
      event.preventDefault()
      var playerNameVar = event.target.playerName.value
      Meteor.call('createPlayer', playerNameVar)
      event.target.playerName.value = ""
    }
  })

  Template.leaderboard.events({
      'click .player': function() {
        var playerId = this._id
        Session.set('selectedPlayer', playerId)
      },
      'click .increment': function() {
        var selectedPlayer = Session.get('selectedPlayer');
        Meteor.call('updateScore', selectedPlayer, 5);
      },
      'click .decrement': function() {
        var selectedPlayer = Session.get('selectedPlayer')
        Meteor.call('updateScore', selectedPlayer, -5);
      },
      'click .remove': function(){
        var selectedPlayer = Session.get('selectedPlayer')
        Meteor.call('removePlayer', selectedPlayer)
      },
      'dblclick .player': function() {
          console.log('You dblclicked something')
      }
  });
}

if (Meteor.isServer) {
  Meteor.publish('thePlayers', function() {
    return PlayersList.find({ createdBy: this.userId })
  })
}
