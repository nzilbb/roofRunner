(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.factory('preloaderService', preloaderService);

	preloaderService.$inject = ['SweetAlert', '$q', '$rootScope'];
	function preloaderService(SweetAlert, $q, $rootScope){
		var preloaderService = {};

		preloaderService.queue;
		preloaderService.percentLoaded;

		preloaderService.preloadImages = function(listItems, expId){
			var defer = $q.defer();
			var cacheBuster = "?d=" + (new Date()).getTime();
			var queue = new createjs.LoadQueue(true);
			var stimuliPath = "experiments/" + expId + "/stimuli/";
			var interlocutorPath = "experiments/" + expId + "/interlocutors/";
			for(var k=0;k<listItems.length;k++){
				if(listItems[k].promptImage != null){
					queue.loadFile({id:stimuliPath + listItems[k].promptImage, src:stimuliPath + listItems[k].promptImage + cacheBuster})
				}
				if(listItems[k].targetImage != null){
					queue.loadFile({id:stimuliPath + listItems[k].targetImage, src:stimuliPath + listItems[k].targetImage + cacheBuster})
				}
			    if(listItems[k].imageButton == true){
				var targetPrefix = listItems[k].targetPrefix || [""];
				for (var p in targetPrefix) { // for each prefix
				    var prefix = targetPrefix[p];
				    for(var j=0;j<listItems[k].targetName.length;j++){
					queue.loadFile({id:stimuliPath + prefix + listItems[k].targetName[j], src:stimuliPath + prefix + listItems[k].targetName[j] + cacheBuster})
				    } // next target
				} // next prefix
			    } // imageButton
				if(listItems[k].interlocutor != null){
					queue.loadFile({id:interlocutorPath + listItems[k].interlocutor, src:interlocutorPath + listItems[k].interlocutor + cacheBuster})
				}
			}
			queue.load();

			queue.on("progress", function(event){
				preloaderService.percentLoaded = Math.round(event.loaded/event.total * 100);
				$rootScope.$apply();
			})

			queue.on("complete", function(event){
				//vm.testImage = queue.getResult("experiments/simpleExp/stimuli/basket_1.png");
				//vm.testImage = vm.testImage.src;
				preloaderService.queue = queue;
				preloaderService.percentLoaded = 100;
				defer.resolve(queue);
				//$rootScope.$apply();
			});

			queue.on("error", function(event){
				SweetAlert.swal({
							title: "Error!",
							text: "Could not load images. Please contact the requester for more details.",
							type: "error"
						});
				defer.reject(event.message);
			});

			return(defer.promise);
		}

		preloaderService.getImage = function(id){
			var preloadedSrc = preloaderService.queue.getResult(id).src;
			return(preloadedSrc);
		}



		return(preloaderService)
	}


})()
