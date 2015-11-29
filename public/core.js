// public/core.js
(function() {

        angular
            .module('runGenerator', [])
            .controller('mainController', mainController);
            //should I have more than one controller?

        function mainController($scope, $http) {
                $scope.routes = {}; // init
                $scope.runs = {};
                $scope.newruns = {};
                $scope.exists = {};

                // when landing on the home page, get the runs so we can print the number
                $http.get('/api/runs')
                        .success(function(data) {
                                $scope.routes = data; // this is so there's no overlap with chooseRun
                                //console.log(data);
                        })
                        .error(function(data) {
                                console.log('Error: ' + data);
                        });

                $scope.chooseRun = function() {
                        $http.post('/choose-run', $scope.Input)
                                .success(function(data) {
                                        /* leaving out a field won't cause blank data to be printed anyway */
                                        if ($scope.Input.dist > 0) {
                                                $scope.runs = data;
                                        }
                                        //$scope.Input = {}; //this clears the input fields
                                        //console.log(data);
                                })
                                .error(function(data) {
                                        console.log('Error: ' + data);
                                });
                };

                $scope.addRun = function() {
                        $http.post('/add-run', $scope.Run)
                                .success(function(data) {
                                        //$scope.runs = {};
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

                // won't use this link... I don't think...
                // $scope.createRun = function() {
                //         $http.post('/api/runs', $scope.formData)
                //                 .success(function(data) {
                //                         $scope.formData = {}; //clear the form so our user is ready to enter another
                //                         $scope.runs = data;
                //                         console.log(data);
                //                 })
                //                 .error(function(data) {
                //                         console.log('Error: ' + data);
                //                 });
                // };
        }
})();