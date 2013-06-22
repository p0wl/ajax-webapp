function VoteCtrl($scope, $http) {
	$scope.frameworks = [
		{text: 'jQuery', votes: '3'},
		{text: 'Zepto', votes: '1'},
		{text: 'Underscore', votes: '6'}
	];

	// Add Choice Function
	$scope.addChoice = function () {
		$scope.frameworks.push({text: $scope.choiceName, votes: '1'});
		// Input zurücksetzen
		$scope.choiceName = '';
		// Layout zurücksetzen
		$scope.newchoice = false;
		// Filter zurücksetzen
		$scope.search = '';
	};

	$scope.totalVotes = function () {
		var total = 0;
		angular.forEach($scope.frameworks, function (value, key) {
			total += 1.0*value.votes;
		});
		return total;
	};
}

