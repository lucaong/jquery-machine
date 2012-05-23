jQuery-Machine, finite state machines that rock
===============================================

The jQuery plugin `jquery-machine` implements a simple and clean DSL to attach finite state machines to DOM elements. You can use it to build awesome multy-state UI elements and widgets with ease.


Motivation
==========

As Web developers striving to build beautiful and usable apps, we are often confronted with the design of fairly complex client-side UI widgets, transitioning between different states in response to various events. Often that leads to spaghetti JavaScript code which is difficult to maintain, and sometimes we even find ourselves surrending to second-best but more manageable solutions.

Surrender no more to complexity! Here is `jquery-machine`, our neat weapon.

`jquery-machine` provides you with a beautiful DSL to attach finite state machines to DOM objects, and automatically handles states transitions and events for you.


Usage
=====

Attach a finite state machine to a jQuery selection:

```javascript
$("#my_element").machine( { /* state machine description */ } )
```

The state machine is described by an object literal with the state names as keys:

```javascript
$("#my_element").machine({
  stateOne: { /* object describing stateOne */ },
  stateTwo: { /* object describing stateThree */ },
  stateThree: { /* object describing stateThree */ }
});
```

Each state is described by these optional properties:

  - `events`: an event map whose keys are the events that cause a transition out from this state, and the values are the names of the next state to transition into
  - `onEnter`: a callback to be executed when transitioning into this state
  - `onExit`: a callback to be executed when transitioning out from this state
  - `defaultState`: a boolean specifying whether this state is the default (the state in which the machine is in at the beginning, before any event is triggered)

A full example:

```javascript
$("#myelement").machine({
  // Define state 'stateOne'
  stateOne: {
    defaultState: true, // stateOne is the default state. Alternatively, just call the default state "defaultState"
    onEnter: function() {
      // Callback function executed when entering stateOne. Here `this` is $("#myelement")
    },
    onExit: function() {
      // Callback function executed when exiting stateOne. Here `this` is $("#myelement")
    },
    events: {
      // Here you define an event map, specifying the events that trigger a transition from stateOne
      // to another state in the form `event: "nextState"`.
      click: "stateTwo", // When in stateOne and event `click` is triggered, state transitions to stateTwo
      dblclick: "stateThree", // When in stateOne and event `dblclick` is triggered, state transitions to stateThree
      "click .handle": "stateThree" // You can also specify selectors (in this case the transition
                                    // to stateThree is triggered when element of class handle is clicked)
    }
  },

  // Define state 'stateTwo'
  stateTwo: {
    onEnter: function( evt, previousState ) {
      // Executed when entering stateTwo. Note that the argument `evt` is the
      // event object that triggered the state transition into stateTwo.
      // The second argument is the previous state, the starting point of the transition.
    },
    onExit: function( evt, nextState ) {
      // Executed when exiting stateTwo. Note that the argument `evt` is the
      // event object that triggered the state transition out from stateTwo.
      // The second argument is the next state, the end point of the transition.
    },
    events: {
      // Events triggering transitions from stateTwo
      click: "stateThree",
      customevent: "stateOne",
      keypress: function( evt ) {
        // You can use a function for more advanced exit conditions
        // Here `evt` is the event object. You can thus access event attributes like `evt.which`, etc.
        // Return a string with the name of the state to transition to,
        // or false to stay in the current state
      }
    }
  },

  // Define state 'stateThree'
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

You should not set the state programmatically. Let the events trigger automatically the state transitions you specified: you shouldn't use `$("#myelement").data("state", "myForcedState")` to force the state, because that puts the state machine out of sync (`onExit` and `onEnter` don't get called). When needed, you can always trigger events programmatically via the jQuery function `.trigger()`.


Configuration options
=====================

The `machine()` function optionally accepts an object containing configuration options as the second argument. The full list of options is the following:

* `defaultState` (string or function): a string specifying the default or starting state, or a function evaluating to a string.
* `setClass` (boolean): whether a class corresponding to the current state should be automatically set, allowing for easy styling of different states. By default it is set to `false`.
* `scope` (string): a scope for the state machine, useful to attach multiple independent state machines to the same element avoiding name conflicts.

Further explanation of these configuration options follows.


Default state
-------------

There are three ways of specifying the state initially set by default:

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


Changelog
=========

- **vx.y.z** New event map with support for multiple events and selectors. Requires jQuery 1.7+
- **v0.1.5** Support for namespaced events and bugfixes (thanks to [leemhenson](https://github.com/leemhenson))
- **v0.1.4** Attach an independent machine to each DOM element in the jQuery selection instead of a single one