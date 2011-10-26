$(document).ready(function() {
  test('Basic plugin functionality', function() {
    // Given this state machine:
    $("#test").machine({
      one: {
        default: true,
        onEnter: function() {
          this.data("lastEntered", "one");
        },
        onExit: function() {
          this.data("lastExited", "one");
        },
        exits: {
          click: "two",
          customevent: "three",
          keypress: "deadlock"
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
          customevent: "three"
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
    equal($("#test").data("state"), "three", "When in state 'two' and customevent is triggered, state should transition to 'three'");
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
    
    $("#test").trigger("keypress");
    equal($("#test").data("state"), "deadlock", "When in state 'one' and keypress is triggered, state should transition to 'deadlock'");
    
    $("#test").trigger("click");
    equal($("#test").data("state"), "deadlock", "When in state 'deadlock' and keypress is triggered, state should stay the same");
  });
});
