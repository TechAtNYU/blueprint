'use strict';

angular
.module('app.controllers')
.controller('DiversityCtrl', function($scope, $location, Restangular) {
    $scope.loadingPromise = Restangular.one('people')
        .get()
        .then(function(people) {
            var gender = {
                eboard: {"name": "E-board", "male": 0, "female": 0},
                general: {"name": "General", "male": 0, "female": 0},
                alumni: {"name": "Alumni", "male": 0, "female": 0}
            };
            _(people).forEach(function(val) {
                if (val.attributes && val.attributes.gender) {
                    var currentGender = val.attributes.gender.toLowerCase();
                    var roles = val.attributes.roles;
                    if (roles && roles.length > 0) {
                        if (roles.indexOf("TEAM_MEMBER") > -1)
                            gender.eboard[currentGender] += 1;
                        else
                            gender.alumni[currentGender] += 1;
                    } else {
                        gender.general[currentGender] += 1;
                    }
                }
            }).value();
            console.log(gender);
            $scope.gender = gender;
        });
});
