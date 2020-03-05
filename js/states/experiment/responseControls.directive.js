(function(){
    'use strict';

    angular.module('RoofRunnerApp')
	.directive('responseControls', responseControls);

    function responseControls(){
	var d = new Date();
	var directive = {
	    restrict: 'EA',
	    scope: {
		expId: '=',
		listItems: '=',
		index: '=',
		currentItem: '&',
		responseButtonClicked: '&',
		afterResponseButtonClicked: '&',
		listCompleted: '&'
	    },
	    controller: responseControlsController,
	    controllerAs: 'responseControlsCtrl',
	    bindToController: true,
	    templateUrl: 'js/states/experiment/responseControls.template.html?d=' + d.getTime()
	}
	return directive;
    }


    responseControlsController.$inject = ['$scope', 'shuffleService', 'preloaderService'];
    function responseControlsController($scope, shuffleService, preloaderService){
	var vm = this;
	vm.promptImage;
	vm.promptTitle;
	vm.promptName;
	vm.targetImage;
	vm.sentenceFrame;
	vm.button1Label;
	vm.button2Label;
	vm.button3Label;
	vm.button4Label;
	vm.button1Image;
	vm.button2Image;
	vm.button3Image;
	vm.button4Image;
	vm.button1ImageLabel;
	vm.button2ImageLabel;
	vm.button3ImageLabel;
	vm.button4ImageLabel;
	vm.hideBubbleHero;
	vm.hidePromptBubble;

	//trigger listCompleted function when the index reaches the end of the listItems array
	$scope.$watch(angular.bind(this, function () {
	    return vm.currentItem()(); 
	}), function (newVal, oldVal) {
	    if(vm.index!=null){
		if(vm.index < 0 ){
		    vm.index = 0;
		}
		if(!vm.currentItem()()){
		    vm.listCompleted()
		} else {
		    processNextItem();
		}
	    }
	});

	function processNextItem(){
	    if(vm.currentItem()().phase == "instructions"){
		vm.sentenceFrame = vm.currentItem()().sentenceFrame;
	    } else {
		vm.sentenceFrame = null;
	    }
	    vm.interlocutor = vm.currentItem()().interlocutor;
	    if(vm.currentItem()().promptImage == null){
		vm.promptImage = null;
	    } else {
		vm.promptImage = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().promptImage);
		//vm.promptImage = "experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().promptImage;
	    }
	    
	    // robert ...TODO preload
	    if(vm.currentItem()().promptSound == null){
		vm.promptSound = null;

	    } else if(vm.currentItem()().promptSound instanceof Array) {
		// list of possible sounds - choose one at random
		var s = Math.floor(Math.random() * vm.currentItem()().promptSound.length);
		vm.promptSound = "experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().promptSound[s] + "?" + vm.currentItem()().instance;
	    } else {
		//				vm.promptSound = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().promptSound);
		vm.promptSound = "experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().promptSound + "?" + vm.currentItem()().instance;
	    }
	    
	    vm.promptTitle = vm.currentItem()().promptTitle
	    vm.promptName = vm.currentItem()().promptName
	    if(vm.currentItem()().targetImage == null){
		vm.targetImage = null;
	    } else {
		vm.targetImage = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().targetImage);
		//vm.targetImage = "experiments/" + vm.expId + "/stimuli/" + vm.currentItem()().targetImage;
	    }

	    vm.targetDelay = vm.currentItem()().targetDelay;
	    vm.hideBubbleHero = vm.targetDelay > 0;
	    vm.hidePromptBubble = false;

	    if(vm.currentItem()().targetName){
		var buttons = shuffleService.shuffleArray(vm.currentItem()().targetName);
		vm.button1Label = null;
		vm.button2Label = null;
		vm.button3Label = null;
		vm.button4Label = null;
		vm.button1Image = null;
		vm.button2Image = null;
		vm.button3Image = null;
		vm.button4Image = null;
		vm.button1ImageLabel = null;
		vm.button2ImageLabel = null;
		vm.button3ImageLabel = null;
		vm.button4ImageLabel = null;
		if(vm.currentItem()().imageButton == false){
		    vm.button1Label = buttons[0];
		    if(buttons.length >= 2){
			vm.button2Label = buttons[1];
		    }
		    if(buttons.length >= 3){
			vm.button3Label = buttons[2];
		    }
		    if(buttons.length >= 4){
			vm.button4Label = buttons[3];
		    }
		} else {
		    vm.button1Image = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + buttons[0]);
		    vm.button1ImageLabel = buttons[0];
		    if(buttons.length >= 2){
			vm.button2Image = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + buttons[1]);
			vm.button2ImageLabel = buttons[1];
		    }
		    if(buttons.length >= 3){
			vm.button3Image = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + buttons[2]);
			vm.button3ImageLabel = buttons[2];
		    }
		    if(buttons.length >= 4){
			vm.button4Image = preloaderService.getImage("experiments/" + vm.expId + "/stimuli/" + buttons[3]);
			vm.button4ImageLabel = buttons[3];
		    }
		}
	    }

	}

	vm.promptSoundFinished = function() {
	    //console.log("promptSoundFinished");
	    //document.getElementById('promptBubble').style.opacity = 0.1;
	    //vm.hidePromptBubble = true;
	    //console.log("vm.hidePromptBubble: " + vm.hidePromptBubble);
	    if (vm.targetDelay) {
		window.setTimeout(function() {
		    vm.hideBubblxeHero = false;
		    //console.log("vm.hideBubbleHero: " + vm.hideBubbleHero);
		}, vm.targetDelay);
	    }
	}
	
	vm.buttonClicked = function(label){
	    var buttonOrder = [];
	    if(vm.currentItem()().imageButton == false){
		if(vm.button1Label != null){
		    buttonOrder.push(vm.button1Label);
		}
		if(vm.button2Label != null){
		    buttonOrder.push(vm.button2Label);
		}
		if(vm.button3Label != null){
		    buttonOrder.push(vm.button3Label);
		}
		if(vm.button4Label != null){
		    buttonOrder.push(vm.button4Label);
		}
	    } else {
		if(vm.button1ImageLabel != null){
		    buttonOrder.push(vm.button1ImageLabel);
		}
		if(vm.button2ImageLabel != null){
		    buttonOrder.push(vm.button2ImageLabel);
		}
		if(vm.button3ImageLabel != null){
		    buttonOrder.push(vm.button3ImageLabel);
		}
		if(vm.button4ImageLabel != null){
		    buttonOrder.push(vm.button4ImageLabel);
		}
	    }

	    vm.responseButtonClicked()(label, buttonOrder);

	    // remove focus from the button
	    var button = document.getElementById(label);
	    if (button) button.blur();
	}

	vm.instructionsButtonClicked = function(){
	    vm.responseButtonClicked()("instructions", []);
	}
    }
})();
