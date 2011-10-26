jQuery-Machine, finite state machines that rock
===============================================

The jQuery plugin `jquery-machine` implements a simple and clean API to bind elements to finite state machines. You can use it to build awesome multy-state UI elements and widgets.


Usage
=====

```javascript
$("#myelement").machine({
  stateOne: {
    default: true, // stateOne is the default state. Alternatively, just call the default state "start"
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
      customevent: "stateOne" // When in stateTwo and event 'customevent' is triggered, go back to stateOne
    }
  },
  stateThree: {
    // And so on...
  }
});
```
You can read the state of an element in any moment with `$("#myelement").data("state")`. You shouldn't use `.data()` to set the value of state, because that puts the state machine out of sync.