'use strict';

/*

 */

var housestars = angular.module('houseStarsControllers', []);

housestars.controller('MainCtrl', ['$scope', function ($scope) {

    console.log('mainCtrl');

}]);

housestars.controller('DashboardCtrl', ['$scope', function ($scope) {

    console.log('dashboardCtrl');

}]);

housestars.controller('MembersCtrl', ['$scope', 'http', '$uibModal', function ($scope, http, $uibModal) {

    console.log('membersCtrl');

    $scope.users = [];
    $scope._users = angular.copy($scope.users);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.getAllUsers = function (){

        http.getAllUsers({
            page_no:$scope.currentPage,
            limit:$scope.limit
        }).then(function(response){
            console.log('all users: ', response);
            $scope.users = response.data.users;
            $scope._users = angular.copy($scope.users);
            $scope.totalItems = response.data.length;
        });
    };

    $scope.editUser = function (user, index) {

    };

    $scope.deleteUser = function (user, index) {

        var deleteSingleUser = confirm('Are you sure you want to delete?');

        if(deleteSingleUser){

            http.deleteUser(user).then(function(response){
                console.log('user deleted: ', response);
                $scope._users.splice(index, 1);
                $scope.users.splice(index, 1);
            });


        }
    };

    $scope.openExtensionModal = function (user, index){

        if(user.sub_end == ""){
            return false;
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'extend-member-subscription-modal.html',
            controller: 'ExtendMemberSubscriptionModalCtrl',
            // size: 'lg',
            resolve: {
                userData: function () {
                    return user;
                },
            }
        });

        modalInstance.result.then(function (response) {

            switch(response.status){
                case 'success':
                    $scope.updateEndSubscription(response, index);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    $scope.updateEndSubscription = function(response, index){

        if(response.data.new_end_subscription != ""){
            $scope._users[index].sub_end = response.data.new_end_subscription;
        }

    };

    $scope.changePage = function(newPage){
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllUsers();
    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'users'
        }).then(function(response){
            console.log('status toggled');
            $scope._users[index].status = response.data.status;
        })

    };


    // initialize
    $scope.getAllUsers();

}]);

housestars.controller('ExtendMemberSubscriptionModalCtrl', ['$scope', 'userData', '$uibModalInstance', 'http', function ($scope, userData, $uibModalInstance, http) {

    console.log('ExtendMemberSubscriptionModalCtrl');

    $scope.userData = userData;

    $scope.extendSubscriptionUser = function () {

        http.extendUserSubscription($scope.userData).then(function(response){
            console.log('extend user subscription: ', response);

            $scope.close({
                status: 'success',
                data: response.data
            });

        });

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };

}]);

housestars.controller('PropertiesCtrl', ['$scope', 'http', '$uibModal', function ($scope, http, $uibModal) {

    console.log('propertiesCtrl');

    $scope.properties = [];
    $scope._properties = angular.copy($scope.properties);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.getAllProperties = function () {

        http.getAllProperties({
            page_no:$scope.currentPage,
            limit:$scope.limit
        }).then(function(response){

            console.log('properties', response);
            $scope.properties = response.data.properties;
            $scope._properties = angular.copy($scope.properties);
            $scope.totalItems = response.data.length;

        });

    };

    $scope.deleteProperty = function (property, index) {

        var deleteThisProperty = confirm('Are you sure you want to delete?');

        if(deleteThisProperty){

            console.log(property);

            http.deleteProperty(property).then(function(response){
                console.log('property deleted: ', response);
                $scope._properties.splice(index, 1);
                $scope.properties.splice(index, 1);
            });


        }

    };

    $scope.editProperty = function (property, index) {

        http.getProperty(property).then(function(response){

            console.log('property: ', response);
            $scope.propertyData = response.data;
            $scope.openEditPropertyModal(index);

        });

    };

    $scope.showAgency = function (property) {

        http.getAgency(property).then(function(response){
            console.log('agency: ', response);
            $scope.agencyData = response.data;
            $scope.openAgencyModal();
        });

    };

    $scope.openAgencyModal = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'agency-modal.html',
            controller: 'AgencyModalCtrl',
            // size: 'lg',
            resolve: {
                agencyData: function () {
                    return $scope.agencyData;
                },
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });
    };

    $scope.openEditPropertyModal = function (index) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'edit-property-modal.html',
            controller: 'EditPropertyModalCtrl',
            // size: 'lg',
            resolve: {
                propertyData: function () {
                    return $scope.propertyData;
                },
            }
        });

        modalInstance.result.then(function (response) {

            switch(response.status){
                case 'success':
                    $scope.reloadSingleProperty(index);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    $scope.reloadSingleProperty = function (index) {
        $scope.getAllProperties();
    };

    $scope.updateProcessStatus = function (property, index) {

        switch(property.process){
            case 'Pending':
                http.updatePropertyProcessStatus(property).then(function(response){
                    console.log('property process status updated: ', response);
                    $scope._properties[index].process = response.data.process;
                });
                break;
        }

    };

    $scope.changePage = function(newPage){
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllProperties();
    };


    // initialize
    $scope.getAllProperties();

}]);

housestars.controller('AgencyModalCtrl', ['$scope', 'agencyData', '$uibModalInstance', function ($scope, agencyData, $uibModalInstance) {

    console.log('AgencyModalCtrl', agencyData);

    $scope.metas = agencyData.metas;

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function () {

        $uibModalInstance.close();
    };

}]);

housestars.controller('EditPropertyModalCtrl', ['$scope', 'propertyData', '$uibModalInstance', 'http', function ($scope, propertyData, $uibModalInstance, http) {

    console.log('EditPropertyModalCtrl', propertyData);

    $scope.code = propertyData.code;
    $scope.user_id = propertyData.user_id;
    $scope.metas = propertyData.metas;
    $scope.users = [];

    $scope.getAllUsers = function () {
        http.getAllUsers().then(function(response){
            console.log('all users:', response);
            $scope.users = response.data.users;
        })
    };

    $scope.saveProperty = function () {

        var propertyObj = {
            code: $scope.code,
            user_id: $scope.user_id,
            metas: $scope.metas
        };

        http.updateProperty(propertyObj).then(function(response){
            console.log('save property: ', response);
            $scope.close({
                status:'success',
                code: $scope.code
            });
        })
    };


    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };


    // initialize
    $scope.getAllUsers();

}]);

housestars.controller('ReviewsCtrl', ['$scope', 'http', function ($scope, http) {

    console.log('reviewsCtrl');

    $scope.reviews = [];
    $scope._reviews = angular.copy($scope.reviews);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function(newPage){
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllReviews();
    };

    $scope.getAllReviews = function () {
        http.getAllReviews({
            page_no:$scope.currentPage,
            limit:$scope.limit
        }).then(function(response){
            console.log('reviews: ', response);
            $scope.reviews = response.data.reviews;
            $scope._reviews = angular.copy($scope.reviews);
            $scope.totalItems = response.data.length;
        });
    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'reviews'
        }).then(function(response){
            console.log('status toggled');
            $scope._reviews[index].status = response.data.status;
        })

    };

    $scope.deleteReview = function (review, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if(confirmation){
            http.deleteReview({
                id:review.id
            }).then(function(response){
                console.log('review deleted: ', response);
                $scope._reviews.splice(index,1);
            });
        }

    };

    // initialize
    $scope.getAllReviews();

}]);

housestars.controller('CategoriesCtrl', ['$scope', 'http', function ($scope, http) {

    console.log('categoriesCtrl');

    $scope.categories = [];
    $scope._categories = angular.copy($scope.categories);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function(newPage){
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllCategories();
    };

    $scope.getAllCategories = function () {
        http.getAllCategories({
            page_no:$scope.currentPage,
            limit:$scope.limit
        }).then(function(response){
            console.log('all categories: ', response);
            $scope.categories = response.data.categories;
            $scope._categories = angular.copy($scope.categories);
            $scope.totalItems = response.data.length;
        });
    };

    $scope.deleteCategory = function (category, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if(confirmation){
            http.deleteCategory({
                id:category.id
            }).then(function(response){
                console.log('category deleted: ', response);
                $scope._categories.splice(index,1);
            });
        }
    };

    $scope.toggleStatus = function (category, index) {

        http.toggleStatus({
            value: category.id,
            status: category.status,
            table: 'categories'
        }).then(function(response){
            console.log('status toggled');
            $scope._categories[index].status = response.data.status;
        })

    };


    // initialize
    $scope.getAllCategories();

}]);

housestars.controller('SuburbsCtrl', ['$scope', 'http', '$uibModal', function ($scope, http, $uibModal) {

    console.log('suburbsCtrl');

    $scope.suburbs = [];
    $scope._suburbs = angular.copy($scope.suburbs);

    $scope.currentSuburb = "";

    $scope.suburbsLength = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function(newPage){
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllSuburbs();
    };

    $scope.getAllSuburbs = function () {
        http.getAllSuburbs({
            page_no:$scope.currentPage,
            limit:$scope.limit
        }).then(function(response){
            console.log('all suburbs: ', response);
            $scope.suburbs = response.data.suburbs;
            $scope._suburbs = angular.copy($scope.suburbs);
            $scope.suburbsLength = response.data.length;
        });
    };

    $scope.deleteSuburb = function (suburb, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if(confirmation){
            http.deleteSuburb({
                id:suburb.id
            }).then(function(response){
                console.log('suburb deleted: ', response);
                $scope._suburbs.splice(index,1);
            });
        }
    };

    $scope.showAvailabilities = function (currentSuburb) {
        $scope.currentSuburb = currentSuburb;
        $scope.openAvailabilityModal();
    };

    $scope.openAvailabilityModal = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'suburb-availability-modal.html',
            controller: 'SuburbAvailabilityCtrl',
            // size: 'lg',
            resolve: {
                currentSuburb: function () {
                    return $scope.currentSuburb;
                },
            }
        });

        modalInstance.result.then(function (selectedItem) {
            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'suburbs'
        }).then(function(response){
            console.log('status toggled');
            $scope._suburbs[index].status = response.data.status;
        })

    };


    // initialize
    $scope.getAllSuburbs();

}]);

housestars.controller('SuburbAvailabilityCtrl', ['$scope', 'currentSuburb', '$uibModalInstance', 'http', function ($scope, currentSuburb, $uibModalInstance, http) {

    console.log('SuburbAvailabilityCtrl', currentSuburb);

    $scope.currentSuburb = currentSuburb;
    $scope.agents = [];

    $scope.getSuburbAgents = function () {


        http.getSuburbAgents($scope.currentSuburb).then(function(response){
            console.log('all availabilities of - '+$scope.currentSuburb, response);
            $scope.user_metas = response.data.user_metas;
        });

    };

    $scope.getAllAgents = function () {
        http.getAllUsers({
            slug:'agent'
        }).then(function(response){
            console.log('all agents: ', response);
            $scope.agents = response.data.users;
        })
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };



    $scope.removeAgent = function (user_meta, index) {

        http.removeSuburbAgent({
            user_meta: user_meta,
            current_suburb: $scope.currentSuburb
        }).then(function(response){
            console.log('remove agent: ', response);
            $scope.user_metas.splice(index,1);

        });

    };


    // initialize
    $scope.getAllAgents();
    $scope.getSuburbAgents();

}]);