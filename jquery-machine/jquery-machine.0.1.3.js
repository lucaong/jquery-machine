/*!
 * jquery-machine Plugin for jQuery
 *
 * Version 0.1.3
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 */ 
 
(function( $ ){
  "use strict";
  $.fn.machine = function(machine, options) {
    // Merge options with default
    options = $.extend({ scope: false, setClass: false, defaultState: false }, options);

    // Variables
    var $this = this,
        events = [],
        states = [],
        defaultState = "defaultState",
        scopePrefix = options.scope ? (options.scope + "-") : "",
        stateKey = scopePrefix + "state",
        machineKey = scopePrefix + "machine",
        callMethodIfExisting = function(obj, method) {
          if(obj && typeof obj[method] === "function") {
            return obj[method].apply($this, Array.prototype.slice.call( arguments, 2));
          }
        };

    // Populate states and events array, get default state
    for(var state in machine) {
      if (machine.hasOwnProperty(state)) {
        states.push(state);
        if(machine[state].defaultState) {
          defaultState = state;
        }
        machine[state].exits = machine[state].exits || {};
        for(var evt in machine[state].exits) {
          if (machine[state].exits.hasOwnProperty(evt)) {
            events.push(evt);
          }
        }
      }
    }
    events = $.unique(events);
    // Override default state if defaultState option is set
    if (options.defaultState) {
      if (typeof options.defaultState === "function") {
        defaultState = options.defaultState.apply($this) || defaultState;
      } else {
        defaultState = options.defaultState;
      }
    }

    // Store state machine object
    $(this).data(machineKey, machine);

    // Set default state
    $(this).data(stateKey, defaultState);
    if (options.setClass) {
      $(this).addClass(scopePrefix+defaultState);
    }
    callMethodIfExisting($(this).data(machineKey)[defaultState], "onEnter");

    // Event handler
    $this.bind(events.join(" "), function(evt) {
      var machine = $(this).data(machineKey),
          currentState = $(this).data(stateKey),
          nextState = (typeof machine[currentState].exits[evt.type] === "function") ?
            machine[currentState].exits[evt.type].apply($this, arguments) :
            machine[currentState].exits[evt.type];
      if (nextState) {
        callMethodIfExisting(machine[currentState], "onExit", evt, nextState);
        if (options.setClass) {
          $(this).removeClass(scopePrefix+currentState);
        }
        $(this).data(stateKey, nextState);
        if (options.setClass) {
          $(this).addClass(scopePrefix+nextState);
        }
        callMethodIfExisting(machine[nextState], "onEnter", evt, currentState);
      }
    });

    // Maintain chainability
    return $this;
  };

})(jQuery);