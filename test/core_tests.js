(function($) {
  test('Basic plugin functionality', function() {
    // Given this state machine:
    $("#test").machine({
      one: {
        defaultState: true,
        onEnter: function() {
          this.data("lastEntered", "one");
        },
        onExit: function() {
          this.data("lastExited", "one");
        },
        events: {
          click: "two",
          customevent: "three",
          keypress: "deadlock",
          mouseover: function(evt) {
            this.data("IHazAccessTo", evt.type);
            return false;
          }
        }
      },
      two: {
        onEnter: function(evt, previousState) {
          this.data("lastEntered", "two");
          this.data("enteredWithEvt", evt.type);
          this.data("previousState", previousState);
        },
        onExit: function(evt, nextState) {
          this.data("lastExited", "two");
          this.data("exitedWithEvt", evt.type);
          this.data("nextState", nextState);
        },
        events: {
          click: "one",
          customevent: function() {
            return "three";
          }
        }
      },
      three: {
        events: {
          customevent: "one"
        }
      },
      deadlock: {}
    });
    
    $("#test").on("click", function(){
      $("#test").data("clicked", "yes");
    });
    
    equal($("#test").data("state"), "one", "State should be initially set to default value of 'one'");
    equal($("#test").data("lastEntered"), "one", "onEnter should be called even at initialization");
    
    $("#test").trigger("click");
    equal($("#test").data("state"), "two", "When in state 'one' and click is triggered, state should transition to 'two'");
    equal($("#test").data("lastEntered"), "two", "onEnter should be called correctly");
    equal($("#test").data("lastExited"), "one", "onExit should be called correctly");
    equal($("#test").data("enteredWithEvt"), "click", "onEnter should be passed the event object.");
    equal($("#test").data("previousState"), "one", "onEnter should be passed the previous state as the second argument.");
    
    $("#test").trigger("customevent");
    equal($("#test").data("state"), "three", "When in state 'two' and customevent is triggered, state should transition to 'three' (function returns 'three')");
    equal($("#test").data("lastEntered"), "two", "onEnter should not be called if not defined");
    equal($("#test").data("lastExited"), "two", "onExit should be called correctly");
    equal($("#test").data("exitedWithEvt"), "customevent", "onExit should be passed the event object.");
    equal($("#test").data("nextState"), "three", "onExit should be passed the next state as the second argument.");
    
    $("#test").trigger("click");
    equal($("#test").data("state"), "three", "When in state 'three' and click is triggered, nothing should happen");
    equal($("#test").data("lastEntered"), "two", "onEnter should not be called");
    equal($("#test").data("lastExited"), "two", "onExit should not be called");
    
    $("#test").trigger("customevent");
    equal($("#test").data("state"), "one", "When in state 'three' and customevent is triggered, state should transition to 'one'");
    equal($("#test").data("lastEntered"), "one", "onEnter should be called correctly");
    equal($("#test").data("lastExited"), "two", "onExit should not be called if not defined");
    
    $("#test").trigger("mouseover");
    equal($("#test").data("state"), "one", "When in state 'one' and mouseover is triggered, state should stay the same (function returns false)");
    equal($("#test").data("IHazAccessTo"), "mouseover", "Exit function for mouseover should have access to event object, and 'this' should be $('#test')");
    
    $("#test").trigger("keypress");
    equal($("#test").data("state"), "deadlock", "When in state 'one' and keypress is triggered, state should transition to 'deadlock'");
    
    $("#test").trigger("click");
    equal($("#test").data("state"), "deadlock", "When in state 'deadlock' and keypress is triggered, state should stay the same");

    $("#test").data("clicked", "");
    $("#test").trigger("click");
    equal($("#test").data("clicked"), "yes", "It should not unbind event handlers not set by jquery-machine");
  });
  
  test("scoped state machines", function() {
    // Given this state machine:
    $("#test").machine({
      defaultState: {
        events: {
          click: "two"
        }
      },
      two: {
        events: {
          click: "defaultState"
        }
      }
    }, { scope: "myScope" });
    
    // And this other state machine
    $("#test").machine({
      abc: {
        defaultState: true,
        events: {
          mouseover: "def"
        }
      },
      def: {
        events: {
          click: "abc"
        }
      }
    }, { scope: "myOtherScope" });
    
    equal($("#test").data("myScope-state"), "defaultState", "State with scope 'myScope' should be initially set to default value of 'defaultState'");
    equal($("#test").data("myOtherScope-state"), "abc", "State with scope 'myOtherScope' should co-exist and be initially set to default value of 'abc'");
    
    $("#test").trigger("click");
    equal($("#test").data("myScope-state"), "two", "When myScope-state is 'start' and click is triggered, state should transition to 'two'");
    equal($("#test").data("myOtherScope-state"), "abc", "myOtherScope-state shouldn't be affected by changes of myScope-state");
    
    $("#test").trigger("mouseover");
    equal($("#test").data("myOtherScope-state"), "def", "When myOtherScope-state is 'abc' and mouseover is triggered, state should transition to 'def'");
    
    $("#test").trigger("click");
    equal($("#test").data("myScope-state"), "defaultState", "When myScope-state is 'two' and click is triggered, state should transition to 'defaultState'");
    equal($("#test").data("myOtherScope-state"), "abc", "myOtherScope-state should transition to 'abc' when in 'def' and click is triggered");
    
  });
  
  test("setClass option", function() {
    // Given this state machine, where setClass option is set to true:
    $("#test2").machine({
      defaultState: {
        events: {
          click: "two"
        }
      },
      two: {
        events: {
          click: "defaultState"
        }
      }
    }, { setClass: true });
    
    ok($("#test2").hasClass("defaultState"), "When state is initially set to default value, a corresponding class should be set.");
    
    $("#test2").trigger("click");
    ok($("#test2").hasClass("two"), "When state transitions to 'two', a corresponding class should be set.");
    ok(!$("#test2").hasClass("defaultState"), "When state transitions, the class corresponding to the previous state should be removed.");
    
    // And given this state machine, where setClass option is set to true and a scope is used:
    $("#test2").machine({
      defaultState: {
        events: {
          mouseover: "two"
        }
      },
      two: {
        events: {
          mouseover: "defaultState"
        }
      }
    }, { setClass: true, scope: "myScope" });
    
    ok($("#test2").hasClass("myScope-defaultState"), "When state is initially set to default value, a corresponding scoped class should be set.");
    
    $("#test2").trigger("mouseover");
    ok($("#test2").hasClass("myScope-two"), "When state transitions to 'two', a corresponding scoped class should be set.");
    ok(!$("#test2").hasClass("myScope-defaultState"), "When state transitions, the scoped class corresponding to the previous state should be removed.");
    
  });
  
  test("Option defaultState", function() {
    // Given this state machine, where default state is overridden by option defaultState
    $("#test3").machine({
      defaultState: {},
      stateTwo: {}
    }, { setClass: true, defaultState: "stateTwo" });
    
    equal($("#test3").data("state"), "stateTwo", "Option defaultState should override default state as defined in the machine object");
  });
  
  test("Option defaultState with function evaluation", function() {
    // Given this state machine, where defaultClass is overridden by option defaultState using a function
    $("#test3").machine({
      stateOne: { defaultState: true },
      stateTwo: {}
    }, { scope: "myscope", setClass: true, defaultState: function() {
      if (this.attr("id") === "test3") {
        return "stateTwo";
      }
    }});
    
    equal($("#test3").data("myscope-state"), "stateTwo", "Option defaultState should override default state as defined in the machine object");
  });

  test("Namespaced custom events", function() {
    // Given this state machine, where a transition occurs due to a namespaced event
    $("#test4").machine({
      defaultState: {
        events: { "custom_event.my_namespace": "stateTwo" }
      },
      stateTwo: {}
    }, { setClass: true });

    $("#test4").trigger("custom_event.my_namespace");

    equal($("#test4").data("state"), "stateTwo", "Namespaced events should be handled correctly.");
  });

  test("Self-triggered transition from default state", function() {
    // Given this state machine, where a transition occurs immediately due to the state machine raising an event in it's own onEnter callback
    $("#test5").machine({
      defaultState: {
        onEnter: function() { this.trigger("custom_event.my_namespace"); },
        events: { "custom_event.my_namespace": "stateTwo" }
      },
      stateTwo: {}
    }, { setClass: true });

    equal($("#test5").data("state"), "stateTwo", "It should be possible to trigger a transition immediately from the default state onEnter callback.");
  });

  test("Selectors in event map", function() {
    // Given this state machine, where a transition occurs immediately due to the state machine raising an event in it's own onEnter callback
    $("#test6").machine({
      defaultState: {
        events: {
          "click .handle": "stateTwo"
        }
      },
      stateTwo: {
        events: {
          "click .handle #nested, keypress .handle #nested": function() {
            return "stateThree";
          }
        }
      },
      stateThree: {}
    });

    $("#test6").trigger("click");
    equal($("#test6").data("state"), "defaultState", "If a selector is specified in the event map, the state transition should not be triggered by events on elements outside the selected ones");

    $("#test6 .handle").trigger("click");
    equal($("#test6").data("state"), "stateTwo", "If a selector is specified in the event map, the state transition should be triggered by events on the selected element");

    $("#test6 .handle #nested").trigger("keypress");
    equal($("#test6").data("state"), "stateThree", "It should be possible to specify multiple comma-separated events/selectors");
  });

  test("Missing defaultState throws an error", function() {
    throws(function(){
      $("#test7").machine({
        stateOne: {
          events: {
            update: "stateTwo"
          }
        },
        stateTwo: {
          events: {
            update: "stateOne"
          }
        }
      });
    }, "must throw an error");
  });

}(jQuery));
