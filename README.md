jQuery-Machine, finite state machines that rock
===============================================

The jQuery plugin `jquery-machine` implements a simple and clean API to bind elements to finite state machines. You can use it to build awesome multy-state UI elements and widgets.


Usage
=====

```javascript
$("#myelement").machine({
  stateOne: {
    defaultState: true, // stateOne is the default state. Alternatively, just call the default state "defaultState"
    onEnter: function() {
      // Do something when entering stateOne. Here 'this' is $("#myelement")
    },
    onExit: function() {
      // Do something when exiting stateOne. Here 'this' is $("#myelement")
    },
    exits: {
      // Here you define the possible exits from stateOne
      click: "stateTwo", // When in stateOne and event 'click' is triggered, state transitions to stateTwo
      dblclick: "stateThree" // When in stateOne and event 'dblclick' is triggered, state transitions to stateThree
    }
  },
  stateTwo: {
    onEnter: function(evt) {
      // Do something when entering stateTwo. Note that the argument 'evt' is the
      // event object that triggered the state transition into stateTwo
    },
    onExit: function(evt) {
      // Do something when exiting stateTwo. Note that the argument 'evt' is the
      // event object that triggered the state transition into stateTwo
    },
    exits: {
      // Here you define the possible exits from stateTwo
      click: "stateThree", // When in stateTwo and event 'click' is triggered, state transitions to stateThree
      customevent: "stateOne", // When in stateTwo and event 'customevent' is triggered, go back to stateOne
      keypress: function(evt) { // You can use a function for more advanced exit conditions
        // Here 'evt' is the event object. You can thus access event attributes like keyCode, which, etc.
        // Return a string with the name of the state to transition to,
        // or false to stay in the same state
      }
    }
  },
  stateThree: {
    // And so on...
  }
});
```

Getting the state
-----------------

You can read the state of an element in any moment with `$("#myelement").data("state")`.

Setting the state
-----------------

Let the events trigger automatically the state transitions as you specified: you shouldn't use `$("#myelement").data("state", "myForcedState")` to force the state, because that puts the state machine out of sync (`onExit` and `onEnter` don't get called). When needed, you can always trigger events programmatically via the jQuery function `.trigger()`.