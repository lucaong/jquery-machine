jQuery-Machine, finite state machines that rock
===============================================

The jQuery plugin `jquery-machine` implements a simple and clean API to bind elements to finite state machines. You can use it to build awesome multy-state UI elements and widgets.


Motivation
==========

As Web Developers, we tend to structure web apps in pages. The Web started as hypertext content, so we have web *pages*, HTML *documents* and *links*. That's nowadays a huge limitation: the metaphore of the page should be just one of the many possible UI metaphores, only used when appropriate. In fact, a page is something you can read, browse or navigate, but not something you _use_. But web apps should actually be _used_.

Thinking in terms of UI widgets that independently transition between multiple states in response to events is a possible way out to this "page metaphore trap". And `jquery-machine` is our neat weapon.


Usage
=====

```javascript
var myStateMachine = {
  stateOne: {
    defaultState: true, // stateOne is the default state. Alternatively, just call the default state "defaultState"
    onEnter: function() {
      // Do something when entering stateOne. Here 'this' is $("#myelement")
    },
    onExit: function() {
      // Do something when exiting stateOne. Here 'this' is $("#myelement")
    },
    exits: {
      // Here you define the possible exits from stateOne in the form `event: "state"`
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
};
$("#myelement").machine(myStateMachine);
```

Getting the state
-----------------

You can read the state of an element in any moment with `$("#myelement").data("state")`.


Setting the state
-----------------

Let the events trigger automatically the state transitions you specified: you shouldn't use `$("#myelement").data("state", "myForcedState")` to force the state, because that puts the state machine out of sync (`onExit` and `onEnter` don't get called). When needed, you can always trigger events programmatically via the jQuery function `.trigger()`.


Options
=======

`jquery-machine` accepts an object containing configuration options as the second argument of the `machine()` function. The full list of options is the following:

* `defaultState` (string or function): a string specifying the default or starting state, or a function evaluating to a string.
* `setClass` (boolean): whether a class corresponding to the current state should be automatically set, allowing for easy styling of different states. By default it is set to `false`.
* `scope` (string): a scope for the state machine, useful to attach multiple independent state machines to the same element avoiding name conflicts.

Further explanation of these configuration options follows.


Default state
-------------

There are three way of specifying the state initially set by default:

1. By naming a state `defaultState`
2. By specifying `defaultState: true` in the definition of a state. This overrides the first way.
3. By setting the `defaultState` option value to a string specifying the default state, or to a function evaluating to a string (in the scope of the function, `this` refers to the jQuery selector on which `machine()` is called). This overrides the first and second methods.

The last method let you attach the same state machine to different elements, with different starting states.


Classes corresponding to the current state
------------------------------------------

Often it is useful to set classes corresponding to the present state of an element. This way, it is easy to change the style of the element depending on its state. You can get this behavior automatically setting the `setClass` option to `true`:

```javascript
$("#myelement").machine({
  active: {
    // ...
  },
  inactive: {
    // ...
  }
}, { setClass: true });
```


Scoping and multiple state machines on the same element
-------------------------------------------------------

You can attach multiple independent state machines to the same element by giving them different scopes:

```javascript
$("#myelement").machine({
  active: {
    // definition of state 'active'
  },
  inactive: {
    // definition of state 'inactive'
  }
}, { scope: "activation" })
.machine({
  open: {
    // definition of state 'open'
  },
  closed: {
    // definition of state 'closed'
  }
}, { scope: "openess" });
```

If you give a scope to a state machine, a prefix will be used to avoid name collision:

```javascript
$("#myelement").data("activation-state"); // it may return 'active' or 'inactive'
$("#myelement").data("openess-state"); // it may return 'open' or 'closed'
```

Classes set by `jquery-machine` when you set the option `setClass` to `true` will be prefixed as well.