// public/core.js
(function() {

        angular
            .module('runGenerator', [])
            .controller('homeController', homeController)
            .controller('chooseRunController', chooseRunController)
            .controller('addRunController', addRunController);

        function homeController($scope, $http) {
                $scope.routes = {};

                $http.get('/api/runs')
                        .success(function(data) {
                                $scope.routes = data;
                        })
                        .error(function(data) {
                                console.log('Error: ' + data);
                        });
        }

        function chooseRunController($scope, $http) {
                $scope.runs = {};
                $scope.results = {};

                $scope.chooseRun = function() {
                        $http.post('/choose-run', $scope.Input)
                                .success(function(data) {
                                        if ($scope.Input.dist > 0) {
                                                $scope.runs = data;
                                                $scope.results = $scope.Input;
                                                $scope.Input = {};
                                        }
                                })
                                .error(function(data) {
                                        console.log('Error: ' + data);
                                });
                };
        }

        function addRunController($scope, $http) {
                $scope.newruns = {};
                $scope.exists = {};

                $scope.addRun = function() {
                        $http.post('/add-run', $scope.Run)
                                .success(function(data) {
                                        if (data.length > 0) {
                                            $scope.newruns = {};
                                            $scope.exists = data;
                                        } else {
                                            $scope.newruns = data;
                                            $scope.exists = {};
                                        }
                                })
                                .error(function(data) {
                                        console.log('Error: ' + data);
                                });
                };
        }
})();