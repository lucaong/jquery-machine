/*!
 * jquery-machine Plugin for jQuery
 *
 * Version 0.1.5
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 */ 
 
(function( $ ){
  "use strict";
  $.fn.machine = function( machine, options ) {
    // Merge options with default
    options = $.extend( { scope: false, setClass: false, defaultState: false }, options );

    return this.each(function() {
      // Variables
      var bindEvents, unbindEvents,
          evtRegExp = /([^\s]+)\s*(.+)?/,
          $this = $( this ),
          stateEventMap = {},
          defaultState = "defaultState",
          scopePrefix = options.scope ? ( options.scope + "-" ) : "",
          stateKey = scopePrefix + "state",
          machineKey = scopePrefix + "machine",
          callMethodIfExisting = function( obj, method ) {
            if( obj && typeof obj[ method ] === "function" ) {
              return obj[ method ].apply( $this, Array.prototype.slice.call( arguments, 2 ) );
            }
          };

      // Populate states and events array, get default state
      $.each( machine, function( state, stateObj ) {
        if( stateObj.defaultState ) {
          defaultState = state;
        }
        // For backward compatibility, alias 'events' with 'exits'
        stateObj.events = stateObj.events || stateObj.exits || {};
        stateEventMap[ state ] = {};
        $.each( stateObj.events, function( eventSelectors, exit ) {
          $.each( eventSelectors.split(/\s*,\s*/), function( i, evtSelector ) {
            var match = evtRegExp.exec( evtSelector );
            if ( match[ 1 ] ) {
              stateEventMap[ state ][ evtSelector ] = {
                evt: match[ 1 ],
                selector: match[ 2 ] || "",
                exit: exit
              };
            }
          });
        });
      });
      
      // Override default state if defaultState option is set
      if ( options.defaultState ) {
        if ( typeof options.defaultState === "function" ) {
          defaultState = options.defaultState.apply( $this ) || defaultState;
        } else {
          defaultState = options.defaultState;
        }
      }

      // Store state machine object
      $this.data( machineKey, machine );

      // Set default state
      $this.data( stateKey, defaultState );
      if ( options.setClass ) {
        $this.addClass( scopePrefix + defaultState );
      }

      // Bind event handlers
      bindEvents = function( state ) {
        $.each( stateEventMap[ state ], function( key, map ) {
          var namespacedEvt = map.evt.replace( /^\s+|\s+$/g, "" ) + ".jquery-machine";
          $this.on( namespacedEvt, map.selector, function( evt ) {
            var machine = $this.data( machineKey ),
                currentState = $this.data( stateKey ),
                exit = stateEventMap[ currentState ][ key ] ?
                  stateEventMap[ currentState ][ key ].exit :
                  false,
                nextState = ( $.isFunction( exit ) ) ?
                  exit.apply( $this, arguments ) :
                  exit;
            if ( nextState ) {
              callMethodIfExisting( machine[ currentState ], "onExit", evt, nextState );
              if ( options.setClass ) {
                $this.removeClass( scopePrefix + currentState );
              }
              unbindEvents( currentState );
              $this.data( stateKey, nextState );
              bindEvents( nextState );
              if ( options.setClass ) {
                $this.addClass( scopePrefix + nextState );
              }
              callMethodIfExisting( machine[ nextState ], "onEnter", evt, currentState );
            }
          });
        });
      };

      // Unbind event handlers
      unbindEvents = function( state ) {
        $.each( stateEventMap[ state ], function( key, map ) {
          var namespacedEvt = map.evt.replace( /^\s+|\s+$/g, "" ) + ".jquery-machine";
          $this.off( namespacedEvt, map.selector );
        });
      };

      bindEvents( defaultState );
      callMethodIfExisting( $this.data( machineKey )[ defaultState ], "onEnter" );
    });
  };

})(jQuery);