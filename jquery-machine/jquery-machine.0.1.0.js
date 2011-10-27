/*!
 * jquery-machine Plugin for jQuery
 *
 * Version 0.1.0
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 */ 
 
(function( $ ){
  "use strict";
  $.fn.machine = function(machine, options) {
    // merge options with default
    options = $.extend({ scope: false }, options);

    // variables
    var $this = this,
        events = [],
        states = [],
        defaultState = "start",
        scopePrefix = !!options.scope ? (options.scope + "-") : "",
        stateKey = scopePrefix + "state",
        machineKey = scopePrefix + "machine",
        callMethodIfExisting = function(obj, method) {
          if(!!obj && typeof obj[method] === "function") {
            return obj[method].apply($this, Array.prototype.slice.call( arguments, 2));
          }
        };

    // populate states and event array, get default state
    for(var state in machine) {
      if (machine.hasOwnProperty(state)) {
        states.push(state);
        if(!!machine[state].defaultState) {
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

    // Store state machine object
    $(this).data(machineKey, machine);

    // Enter default state
    $(this).data(stateKey, defaultState);
    callMethodIfExisting($(this).data(machineKey)[defaultState], "onEnter");

    // Event handler
    $this.bind(events.join(" "), function(evt) {
      var machine = $(this).data(machineKey),
          currentState = $(this).data(stateKey),
          nextState = (typeof machine[currentState].exits[evt.type] === "function") ?
            machine[currentState].exits[evt.type].apply($this, arguments) :
            machine[currentState].exits[evt.type];
      if (!!nextState) {
        callMethodIfExisting(machine[currentState], "onExit", evt);
        $(this).data(stateKey, nextState);
        callMethodIfExisting(machine[nextState], "onEnter", evt);
      }
    });

    return $this;
  };

})(jQuery);