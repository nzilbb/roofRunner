(function(){

'use strict';

angular.module('RoofRunnerApp')
.factory('distributionService', distributionService);

distributionService.$inject = ['$http','$q','SweetAlert', '$timeout', 'shuffleService'];
function distributionService($http, $q, SweetAlert, $timeout, shuffleService){
	var distributionService = {};

	distributionService.expId;

	distributionService.getList = function(expId, shuffle){
		var def = $q.defer();
		distributionService.expId = expId;
		getMaster()
		.then(determineLeastUsedList)
		.then(getTargetList)
		.then(function(result){
			if(shuffle == true){
				result.data = shuffleService.shuffleArray(result.data);
			}
			def.resolve(result.data);
		});
		return(def.promise);
	}


	function getMaster(){
		//load experiment JSON file
		var getListDeffered = $q.defer();
		var promise = $http.get('experiments/' + distributionService.expId + '/master.json?' + (new Date().getTime()));
		promise.then(function(result) {
			getListDeffered.resolve(result.data);
		}, function(reason) {
			SweetAlert.swal({
						title: "Error!",
						text: "Could not get master experiment script. Please contact the requester for more details.",
						type: "error"
					});
			getListDeffered.reject(reason);
			console.log(reason);
		});

		return(getListDeffered.promise);
	}

	function determineLeastUsedList(master){
		var def = $q.defer();

		//0. first create count property on master object
		for(var l in master){
			master[l].count = 0;
		}

		//1. get used lists
		var ref = firebase.database().ref().child(distributionService.expId).child('lists');
		ref.orderByChild("filename").on("value", function(lists){
			var usedLists = lists.val();
			ref.off("value");

			//2. iterate and compare
			for(var p in usedLists){
				if(usedLists.hasOwnProperty(p)){
					for(var l=0;l<master.length;l++){
						if(master[l].filename == usedLists[p].filename){
								master[l].count += 1;
						}
					}
				};
			}

			//sort descending based on count property
			master = master.sort(function(obj1, obj2) {
				return obj1.count - obj2.count;
			})

			def.resolve(master[0]);
		});

		return(def.promise);
	}

	function getTargetList(targetList){
		var def = $q.defer();

		var list = targetList.filename;
		var shuffle = targetList.shuffle;

		$http.get('experiments/' + distributionService.expId + "/lists/" + list + "?" + (new Date().getTime()))
		.then(function(result){
			if(shuffle == true){
				result.data = shuffleService.shuffleArray(result.data);
			}
			def.resolve(result);
		}, function(reason) {
			SweetAlert.swal({
						title: "Error!",
						text: "Could not get individual list. Please contact the requester for more details.",
						type: "error"
					});
			def.reject(reason);
			console.log(reason);
		})

		//store used list on server
				var ref = firebase.database().ref().child(distributionService.expId).child('lists');
		ref.push({"filename":list});


		return(def.promise);
	}


	return distributionService;
}

})();
