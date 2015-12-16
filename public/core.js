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
                $scope.runs    = null;
                $scope.results = null;
                $scope.err     = null;

                $scope.chooseRun = function() {
                        $http.post('/choose-run', $scope.Input)
                                .success(function(data) {
                                    if (!data.err) {
                                        $scope.err = null;
                                        if ($scope.Input.dist > 0) {
                                                $scope.runs = data;
                                                $scope.results = $scope.Input;
                                                $scope.Input = null;
                                        }
                                    } else {
                                        $scope.err     = $scope.Input;
                                        $scope.runs    = null;
                                        $scope.results = null;
                                    }
                                })
                                .error(function(data) {
                                        console.log('Error: ' + data);
                                });
                };
        }

        function addRunController($scope, $http) {
                $scope.newrun = null;
                $scope.exists = null;
                $scope.err    = null;

                $scope.addRun = function() {
                        $http.post('/add-run', $scope.Run)
                                .success(function(data) {
                                    if (!data.err) {
                                        if (data.length > 0) {
                                            $scope.exists = data;
                                            $scope.newrun = null;
                                            $scope.err    = null
                                        } else {
                                            $scope.newrun = data;
                                            $scope.exists = null;
                                            $scope.err    = null;
                                        }
                                    } else {
                                        $scope.err = $scope.Run;
                                        $scope.newrun = null;
                                        $scope.exists = null;
                                    }
                                })
                                .error(function(data) {
                                        console.log('Error: ' + data);
                                });
                };
        }
})();