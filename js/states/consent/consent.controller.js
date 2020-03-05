(function(){

'use strict';

angular.module('RoofRunnerApp')
.controller('ConsentController',ConsentController);

ConsentController.$inject = ['$location', '$routeParams', 'SweetAlert', '$http', 'expId', 'mode', 'workerId'];
function ConsentController($location, $routeParams, SweetAlert, $http, expId, mode, workerId){
	var vm = this;
	vm.consentPath;
	vm.ready = false;

	function init(){
		vm.ready = false;
		vm.consentPath = 'experiments/' + expId + "/consent/consent.html?d=" + (new Date()).getTime();
	}
	init();

	vm.consentLoaded = function(){
		vm.ready = true;
	}

	vm.acceptClicked = function(){
		if(mode == "live" && ($routeParams.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE' || $routeParams.assignmentId == ''
			|| $routeParams.assignmentId == null)){
				//worker has not accepted the HIT
				SweetAlert.swal({
							title: "You must accept this HIT to continue",
							text: "To accept this HIT, click the yellow 'Accept HIT' button at the top of this window.",
							type: "error"
						});
		} else {
			//HIT accepted (or in debug or inlab mode)
			//store consent
			var ref = firebase.database().ref().child(expId).child('consent').child(workerId);
			ref.push({"consent":true, "timestamp":firebase.database.ServerValue.TIMESTAMP});

			//go to experiment
			$location.path('/survey');
		}
	}

	vm.declineClicked = function(){
		SweetAlert.swal({
					title: "You have declined participation",
					text: "Please return this HIT by clicking the yellow 'Return HIT' button at the top of this page. Thank you.",
				});
	}

}



})()
