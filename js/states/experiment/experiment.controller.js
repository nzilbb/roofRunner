(function(){

    'use strict';

    angular.module('RoofRunnerApp')
	.controller('ExperimentController', ExperimentController);

    ExperimentController.$inject = ['$location', 'SweetAlert', 'experimentService', 'expId', 'workerId', 'distributionService', 'shuffleService', 'preloaderService',  '$rootScope'];
    function ExperimentController($location, SweetAlert, experimentService, expId, workerId, distributionService, shuffleService, preloaderService, $rootScope){
	var vm = this;
	vm.listItems;
	vm.index;
	vm.hideResponseControls = false;
	vm.expId = expId;
	vm.status;
	vm.preloaderService = preloaderService;	
	vm.testImage;

	// vm.listItems may be a fixed list of stimili,
	// or it might be a template of stimuli with a distribution for synamic presentation
	vm.dynamic = false;

	function init(){
	    vm.status = "Loading...";
	    
	    //setup game
	    experimentService.init("gameCanvas");
	    
	    //get list
	    distributionService.getList(expId, false)
		.then(
		    function(result){
			vm.listItems = result;
			if (vm.listItems[0].promptSoundSuffixDistribution) {
			    // we have a distribution of stimuli, so vm.listItems isn't a fixed
			    // list, but rather a definition of a set of stimuli that have a
			    // certain answer
			    vm.dynamic = true;

			    // we need a set of running totals for each stimilus,
			    // which are decremented when each stimilus is presented
			    // until the distribution is fulfilled
			    vm.totalStimuli = 0;
			    vm.stimuliSoFar = 0;
			    for (var i in vm.listItems) { // for each item
				var item = vm.listItems[i];
				item.stimuli = {};
				for (var p in item.promptSound) { // for each prompt sound prefix
				    var promptSound = item.promptSound[p];
				    // the sound prefix represents the corresponding target prefix
				    var targetPrefix = item.targetPrefix[p];
				    item.stimuli[promptSound] = [];
				    for (var s in item.promptSoundSuffixDistribution) { // for each suffix
					var suffix = item.promptSoundSuffixDistribution[s];
					var stimulus = {
					    "prefix" : promptSound,
					    "promptSound" : promptSound + suffix.suffix,
					    "count" : suffix.count,
					    "item" : item,
					    "targetPrefix" : targetPrefix
					}
					if (stimulus.count > 0) {
					    //console.log("stimulus: " + stimulus.promptSound + " - " + stimulus.count);
					    item.stimuli[promptSound].push(stimulus);
					    vm.totalStimuli += stimulus.count;
					}
				    } // next suffix
				} // prompt sound prefix
			    } // next item
			}
			return(
			    preloaderService.preloadImages(result, expId)//preload images
			);
		    }
		)
		.then(
		    function(result){
			vm.status = "";
			vm.index = -1;
			nextItem("forward");
		    }
		)
	    
	    //prevent this route from going back to the any previous route (i.e. disable back button)
	    //only allowed path is from this route to the 'end' route
	    $rootScope.$on('$routeChangeStart', function(event, next, current){
		if(current!=undefined && current.$$route.originalPath == "/experiment" && next.$$route.originalPath != "/postGameQuestionnaire" ){
		    event.preventDefault();
		}
	    })
	    
	    //warning before window close or chaneg URL
	    window.onbeforeunload = function(){
		return "Are you sure you want to leave this page?";
	    }
	}
	init();	
	
	function nextItem(direction){
	    if (!vm.dynamic) {
		if(direction == "forward"){
		    vm.index += 1;
		} else {
		    vm.index -= 1;
		}
		
		if(vm.index <0){
		    vm.index = 0;
		    // sound doesn't play again if they get the first one wrong
		    // so the sound-finished event doesn't display the bubble,
		    // so we do it here manually
		    document.getElementById("bubbleHero").style.opacity = 1;
		}
		
		if(vm.index >= vm.listItems.length){
		    //console.log("end")
		    return;
		} else {
		    vm.status = "Progress: " + (vm.index+1) + "/" + vm.listItems.length;
		    //vm.status = "Progress: 1000/1000";
		}
	    } else { // dynamic
		if (vm.stimuliSoFar >= vm.totalStimuli) {
		    // finished
		    //console.log("end")
		    vm.current = null;
		    return;
		} else {
		    if (direction == "forward"
			// or not forward, but we've run out of stimuli
			|| vm.listItems[vm.index].stimuli[vm.soundPrefix].length == 0) {
			// pick a random item
			vm.index = Math.floor(Math.random() * vm.listItems.length);
			//console.log("item: " + vm.index);
			// pick a random sound prefix
			vm.soundPrefixIndex = Math.floor(Math.random() * vm.listItems[vm.index].promptSound.length);
			vm.soundPrefix = vm.listItems[vm.index].promptSound[vm.soundPrefixIndex];
		    } else { // not forward, so re-present this item with a new stimulus
		    }
		    // pick a random sound suffix		
		    vm.stimulusIndex = Math.floor(Math.random() * vm.listItems[vm.index].stimuli[vm.soundPrefix].length);
		    vm.stimulus = vm.listItems[vm.index].stimuli[vm.soundPrefix][vm.stimulusIndex];

		    //console.log("target: " + vm.stimulus.targetPrefix);
		    // create the current item
		    vm.current = {}; // copy everything (except stimuli) from item
		    for (var k in vm.listItems[vm.index]) {
			if (k != "stimuli") {
			    vm.current[k] = vm.listItems[vm.index][k];
			}
		    } // next key
		    vm.current.targetName = []
		    for (var t in vm.listItems[vm.index].targetName) {
			vm.current.targetName.push(vm.stimulus.targetPrefix + vm.listItems[vm.index].targetName[t]);
		    } // next target
		    vm.current.correctAnswer = []
		    for (var t in vm.listItems[vm.index].correctAnswer) {
			vm.current.correctAnswer.push(vm.stimulus.targetPrefix + vm.listItems[vm.index].correctAnswer[t]);
		    } // next target
		    vm.current.promptSound = vm.stimulus.promptSound;
		    vm.current.prefix = vm.stimulus.prefix;
		    // give each instance a different number to ensure audio.src always changes
		    vm.current.instance = vm.stimulus.count; 
		    
		    // decrement the count for this stimulus
		    vm.stimulus.count--;
		    //console.log("Stimulus " + vm.stimulus.promptSound + " " + vm.stimulus.count + " left");
		    // if we've used up all presentations of this stimulus, remove it
		    if (vm.stimulus.count <= 0) {
			//console.log("Removing stimulus " + vm.stimulus.promptSound);
			vm.listItems[vm.index].stimuli[vm.soundPrefix].splice(vm.stimulusIndex,1);
			if (vm.listItems[vm.index].stimuli[vm.soundPrefix].length == 0) {
			    // we've run out of stimili for this prefix
			    //console.log("No more stimuli for " + vm.soundPrefix);
			    // remove the prefix
			    vm.listItems[vm.index].promptSound.splice(vm.soundPrefixIndex,1);
			    if (vm.listItems[vm.index].promptSound.length == 0) {
				// run out of prompt sounds for this item
				//console.log("No more sounds for item " + vm.index);
				vm.listItems.splice(vm.index, 1);
			    }
			}
		    }
		    vm.stimuliSoFar++;
		    vm.status = "Progress: " + (vm.stimuliSoFar) + "/" + vm.totalStimuli;
		} // not the end
	    } // dynamic

	    if(vm.currentItem().interlocutor!=null){
		experimentService.setInterlocutor(preloaderService.getImage("experiments/" + expId + "/interlocutors/" + vm.currentItem().interlocutor));
	    } else {
		experimentService.setInterlocutor(null);
	    }
	    
	    //set day or night background
	    if(vm.currentItem().phase == "test"){
		experimentService.night();
	    } else if(vm.currentItem().phase == "training"){
		experimentService.day();
	    }		    
	}

	vm.responseButtonClicked = function(label, buttonOrder){
	    
	    //store responses
	    var ref = firebase.database().ref().child(expId).child('data').child(workerId);
	    ref.push({"originalData":vm.currentItem(), "response":label, "buttonOrder":buttonOrder, "timestamp":firebase.database.ServerValue.TIMESTAMP});
	    
	    if(vm.currentItem().phase == "training"){
		//if in training stage, then evaluate response
		var correct = false;
		for(var k=0;k<vm.currentItem().correctAnswer.length;k++){
		    //if(vm.currentItem().imageButton == true){
		    //	label = new String(label).substring(label.lastIndexOf('/') + 1);
		    //}
		    //console.log("label: " + label + " correct: " + vm.currentItem().correctAnswer[k]);
		    if(label == vm.currentItem().correctAnswer[k]){
			correct = true;
		    }
		    vm.highlightButton(vm.currentItem().correctAnswer[k], correct);
		}
		    
		window.setTimeout(function() {
		    //hide response controls
		    vm.hideResponseControls = true;
		    document.getElementById("responsControls").style.opacity = 0;
                    //console.log("vm.promptSound " + vm.promptSound);
		    if (vm.promptSound) {
			document.getElementById("bubbleHero").style.opacity = 0;
		    }
		    for(var k=0;k<vm.currentItem().correctAnswer.length;k++){
			vm.unhighlightButton(vm.currentItem().correctAnswer[k]);
		    }
		    if(correct == true){
			experimentService.jump().then(function(result){
			    nextItem("forward");
			    //show response controls
			    vm.hideResponseControls = false;
			    document.getElementById("responsControls").style.opacity = 1;
			})
		    } else {
			experimentService.fall().then(function(result){
			    nextItem("backward");
			    //show response controls
			    vm.hideResponseControls = false;
			    document.getElementById("responsControls").style.opacity = 1;
			})
		    }
		}, vm.currentItem().nextTrialDelay || 0);
	    } else {
		//if in test stage, move to next item without feedback
		//vm.hideResponseControls = false;
		experimentService.interlocutor.alpha = 0;
		window.setTimeout(function() {
		    //hide response controls
		    vm.hideResponseControls = true;
		    document.getElementById("responsControls").style.opacity = 0;	
                    //console.log("vm.promptSound " + vm.promptSound);
		    if (vm.promptSound) {
			document.getElementById("bubbleHero").style.opacity = 0;
		    }
			experimentService.jump().then(function(result){
			    nextItem("forward");
			    //show response controls
			    vm.hideResponseControls = false;
			    document.getElementById("responsControls").style.opacity = 1;
			});
		}, vm.currentItem().nextTrialDelay || 0);
	    }
	};

	vm.highlightButton = function(id, correct) {
	    var button = document.getElementById(id);
	    if (button) {
		var colour = correct?"green":"red";
		button.style.border = "1px solid " + colour;
		button.style.boxShadow = "0 0 10px " + colour;
	    }
	}
	vm.unhighlightButton = function(id) {
	    var button = document.getElementById(id);
	    if (button) {
		button.style.border = "none";
		button.style.boxShadow = "none";
	    }
	}
	
	vm.gotoEnd = function(){
	    //console.log("goto end");
	    $location.path('/postGameQuestionnaire');
	}
	
	vm.currentItem = function() {
	    if (!vm.dynamic) {
		if (!vm.listItems || vm.index >= vm.listItems.length) return null;
		return vm.listItems[vm.index];
	    } else {
		return vm.current;
	    }
	    
	}
	
    }
    
})();
