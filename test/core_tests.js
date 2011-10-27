$(document).ready(function() {
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
        exits: {
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
        onEnter: function(evt) {
          this.data("lastEntered", "two");
          this.data("enteredWithEvt", evt.type);
        },
        onExit: function(evt) {
          this.data("lastExited", "two");
          this.data("exitedWithEvt", evt.type);
        },
        exits: {
          click: "one",
          customevent: function() {
            return "three";
          }
        }
      },
      three: {
        exits: {
          customevent: "one"
        }
      },
      deadlock: {}
    });
    
    equal($("#test").data("state"), "one", "State should be initially set to default value of 'one'");
    equal($("#test").data("lastEntered"), "one", "onEnter should be called even at initialization");
    
    $("#test").trigger("click");
    equal($("#test").data("state"), "two", "When in state 'one' and click is triggered, state should transition to 'two'");
    equal($("#test").data("lastEntered"), "two", "onEnter should be called correctly");
    equal($("#test").data("lastExited"), "one", "onExit should be called correctly");
    equal($("#test").data("enteredWithEvt"), "click", "onEnter should be passed the event object.");
    
    $("#test").trigger("customevent");
    equal($("#test").data("state"), "three", "When in state 'two' and customevent is triggered, state should transition to 'three' (function returns 'three')");
    equal($("#test").data("lastEntered"), "two", "onEnter should not be called if not defined");
    equal($("#test").data("lastExited"), "two", "onExit should be called correctly");
    equal($("#test").data("exitedWithEvt"), "customevent", "onExit should be passed the event object.");
    
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
  });
  
  test("scoped state machines", function() {
    // Given this state machine:
    $("#test").machine({
      start: {
        exits: {
          click: "two"
        }
      },
      two: {
        exits: {
          click: "start"
        }
      }
    }, { scope: "myScope" });
    
    // And this other state machine
    $("#test").machine({
      abc: {
        defaultState: true,
        exits: {
          mouseover: "def"
        }
      },
      def: {
        exits: {
          click: "abc"
        }
      }
    }, { scope: "myOtherScope" });
    
    equal($("#test").data("myScope-state"), "start", "State with scope 'myScope' should be initially set to default value of 'start'");
    equal($("#test").data("myOtherScope-state"), "abc", "State with scope 'myOtherScope' should co-exist and be initially set to default value of 'abc'");
    
    $("#test").trigger("click");
    equal($("#test").data("myScope-state"), "two", "When myScope-state is 'start' and click is triggered, state should transition to 'two'");
    equal($("#test").data("myOtherScope-state"), "abc", "myOtherScope-state shouldn't be affected by changes of myScope-state");
    
    $("#test").trigger("mouseover");
    equal($("#test").data("myOtherScope-state"), "def", "When myOtherScope-state is 'abc' and mouseover is triggered, state should transition to 'def'");
    
    $("#test").trigger("click");
    equal($("#test").data("myScope-state"), "start", "When myScope-state is 'two' and click is triggered, state should transition to 'start'");
    equal($("#test").data("myOtherScope-state"), "abc", "myOtherScope-state should transition to 'abc' when in 'def' and click is triggered");
    
  });
});
