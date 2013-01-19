// App-Angular.js

function VoteCtrl($scope, $http) {
	// Data Storage
	// TODO: REST
	$scope.frameworks = [
		{text: 'jQuery', votes: '3'},
		{text: 'Zepto', votes: '1'},
		{text: 'Underscore', votes: '7'}
	];

	// Add Choice Function
	$scope.addChoice = function () {
		$scope.frameworks.push({text: $scope.choiceName, votes: '1'});
		// TODO: REST

		// Input zurücksetzen
		$scope.choiceName = '';
		// Layout zurücksetzen
		$scope.newchoice = false;
		// Filter zurücksetzen
		$scope.search = '';
	};
}

