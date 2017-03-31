'use strict';

/*
 TODO: category - add/edit
 TODO: suburb - availability edit popup
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

    $scope.getAllUsers = function () {

        http.getAllUsers({
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {
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

        if (deleteSingleUser) {

            http.deleteUser(user).then(function (response) {
                console.log('user deleted: ', response);
                $scope._users.splice(index, 1);
                $scope.users.splice(index, 1);
            });


        }
    };

    $scope.openExtensionModal = function (user, index) {

        if (user.sub_end == "") {
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

            switch (response.status) {
                case 'success':
                    $scope.updateEndSubscription(response, index);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    $scope.updateEndSubscription = function (response, index) {

        if (response.data.new_end_subscription != "") {
            $scope._users[index].sub_end = response.data.new_end_subscription;
        }

    };

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllUsers();
    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'users'
        }).then(function (response) {
            console.log('status toggled');
            $scope._users[index].status = response.data.status;
        })

    };

    $scope.addMember = function () {

        $scope.memberData = {
            name:'',
            email:'',
            role_id:''
        };
        $scope.memberAction = 'add';

        $scope.openMemberModal();

    };

    $scope.editUser = function (category, index) {
        $scope.memberData = category;
        $scope.memberAction = 'edit';
        $scope.openMemberModal();
    };

    $scope.openMemberModal = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'member-modal.html',
            controller: 'MemberModalCtrl',
            // size: 'lg',
            resolve: {
                memberData: function () {
                    return $scope.memberData;
                },
                memberAction: function () {
                    return $scope.memberAction
                },
                roles: function () {
                    return $scope.roles
                }
            }
        });

        modalInstance.result.then(function (response) {

            switch (response.status) {
                case 'success':
                    $scope.changePage($scope.currentPage);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    $scope.getAllRoles = function () {

        http.getAllRoles().then(function(response){
            console.log('all roles: ', response);
            $scope.roles = response.data.roles;
        });

    };

    $scope.exportToExcel = function () {

        http.exportMembers().then(function(response){
            console.log('response export: ', response);
            window.location.href=$baseUrl+'/exports/members.xlsx';
        });

    };


    // initialize
    $scope.getAllUsers();
    $scope.getAllRoles();

}]);

housestars.controller('MemberModalCtrl', ['$scope', 'memberData', 'memberAction', 'roles', '$uibModalInstance', 'http', 'validator', function ($scope, memberData, memberAction, roles, $uibModalInstance, http, validator) {

    console.log('MemberModalCtrl', memberData);

    $scope.errors = {};
    $scope.$watch('errors', function (errors) {
        if (errors !== undefined) {
            validator.errors = errors;
        }
    });
    $scope.hasError = validator.hasError;
    $scope.showErrorBlock = validator.showErrorBlock;

    $scope.memberData = angular.copy(memberData);
    $scope.memberAction = memberAction;
    $scope.roles = roles;

    if(typeof memberAction == "undefined"){
        $scope.memberAction = 'add';
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };

    $scope.save = function () {

        switch($scope.memberAction){
            case 'add':
                $scope.createMember();
                break;
            case 'edit':
                $scope.updateMember();
                break;
        }



    };

    $scope.createMember = function (){

        http.createMember($scope.memberData).then(function (response) {
            console.log('member created: ', response);
            $scope.errors = {};
            $scope.close({
                status: 'success'
            });
        }, function (errResponse) {
            console.log('error: ', errResponse);
            $scope.errors = errResponse.validator;
        });

    };

    $scope.updateMember = function () {

        console.log('member data: ', $scope.memberData);

        http.updateMember($scope.memberData).then(function (response) {
            console.log('member updated: ', response);
            $scope.errors = {};
            $scope.close({
                status: 'success'
            });
        }, function (errResponse) {
            console.log('error: ', errResponse);
            $scope.errors = errResponse.validator;
        });

    };


}]);

housestars.controller('ExtendMemberSubscriptionModalCtrl', ['$scope', 'userData', '$uibModalInstance', 'http', function ($scope, userData, $uibModalInstance, http) {

    console.log('ExtendMemberSubscriptionModalCtrl');

    $scope.userData = userData;

    $scope.extendSubscriptionUser = function () {

        http.extendUserSubscription($scope.userData).then(function (response) {
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
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {

            console.log('properties', response);
            $scope.properties = response.data.properties;
            $scope._properties = angular.copy($scope.properties);
            $scope.totalItems = response.data.length;

        });

    };

    $scope.deleteProperty = function (property, index) {

        var deleteThisProperty = confirm('Are you sure you want to delete?');

        if (deleteThisProperty) {

            console.log(property);

            http.deleteProperty(property).then(function (response) {
                console.log('property deleted: ', response);
                $scope._properties.splice(index, 1);
                $scope.properties.splice(index, 1);
            });


        }

    };

    $scope.editProperty = function (property, index) {

        http.getProperty(property).then(function (response) {

            console.log('property: ', response);
            $scope.propertyData = response.data;
            $scope.openEditPropertyModal(index);

        });

    };

    $scope.showAgency = function (property) {

        http.getAgency(property).then(function (response) {
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

            switch (response.status) {
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

        switch (property.process) {
            case 'Pending':
                http.updatePropertyProcessStatus(property).then(function (response) {
                    console.log('property process status updated: ', response);
                    $scope._properties[index].process = response.data.process;
                });
                break;
        }

    };

    $scope.changePage = function (newPage) {
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
        http.getAllUsers().then(function (response) {
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

        http.updateProperty(propertyObj).then(function (response) {
            console.log('save property: ', response);
            $scope.close({
                status: 'success',
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

    $scope.reviewees = [];

    $scope.reviews = [];
    $scope._reviews = angular.copy($scope.reviews);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.currentFilter = 'all';

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;

        switch($scope.currentFilter){
            case 'all':
                $scope.getAllReviews();
                break;
            case 'reviewee':
                $scope.filterReviews();
                break;
        }


    };

    $scope.getAllReviews = function () {
        http.getAllReviews({
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {
            console.log('reviews: ', response);
            $scope.reviews = response.data.reviews;
            $scope._reviews = angular.copy($scope.reviews);
            $scope.totalItems = response.data.length;
            $scope.currentFilter = 'all';
        });
    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'reviews'
        }).then(function (response) {
            console.log('status toggled');
            $scope._reviews[index].status = response.data.status;
        })

    };

    $scope.deleteReview = function (review, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if (confirmation) {
            http.deleteReview({
                id: review.id
            }).then(function (response) {
                console.log('review deleted: ', response);
                $scope._reviews.splice(index, 1);
            });
        }

    };

    $scope.getAllReviewees = function () {
        http.getAllReviewees().then(function (response) {
            console.log('reviewees: ', response);
            $scope.reviewees = response.data.reviewees;
        });
    };

    $scope.filterReviews = function () {

        console.log('filter reviews: ', $scope.revieweeFilter);

        if($scope.revieweeFilter == "" || $scope.revieweeFilter == null){
            $scope.getAllReviews();
            return false;
        }

        http.getReviewsByFilter({
            filter_by:'reviewee',
            filter_id:$scope.revieweeFilter,
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function(response){
            console.log('filter response: ', response);
            $scope.reviews = response.data.reviews;
            $scope._reviews = angular.copy($scope.reviews);
            $scope.totalItems = response.data.length;
            $scope.currentFilter = 'reviewee';
        });
    };

    // initialize
    $scope.getAllReviews();
    $scope.getAllReviewees();

}]);

housestars.controller('CategoriesCtrl', ['$scope', 'http', '$uibModal', function ($scope, http, $uibModal) {

    console.log('categoriesCtrl');

    $scope.categories = [];
    $scope._categories = angular.copy($scope.categories);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllCategories();
    };

    $scope.getAllCategories = function () {
        http.getAllCategories({
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {
            console.log('all categories: ', response);
            $scope.categories = response.data.categories;
            $scope._categories = angular.copy($scope.categories);
            $scope.totalItems = response.data.length;
        });
    };

    $scope.deleteCategory = function (category, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if (confirmation) {
            http.deleteCategory({
                id: category.id
            }).then(function (response) {
                console.log('category deleted: ', response);
                $scope._categories.splice(index, 1);
            });
        }
    };

    $scope.toggleStatus = function (category, index) {

        http.toggleStatus({
            value: category.id,
            status: category.status,
            table: 'categories'
        }).then(function (response) {
            console.log('status toggled');
            $scope._categories[index].status = response.data.status;
        })

    };

    $scope.addCategory = function () {

        $scope.categoryData = {
            category:''
        };
        $scope.categoryAction = 'add';

        $scope.openCategoryModal();

    };

    $scope.editCategory = function (category, index) {
        $scope.categoryData = category;
        $scope.categoryAction = 'edit';
        $scope.openCategoryModal();
    };

    $scope.openCategoryModal = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'category-modal.html',
            controller: 'CategoryModalCtrl',
            // size: 'lg',
            resolve: {
                categoryData: function () {
                    return $scope.categoryData;
                },
                categoryAction: function () {
                    return $scope.categoryAction
                }
            }
        });

        modalInstance.result.then(function (response) {

            switch (response.status) {
                case 'success':
                    $scope.changePage($scope.currentPage);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };


    // initialize
    $scope.getAllCategories();

}]);

housestars.controller('CategoryModalCtrl', ['$scope', 'categoryData', 'categoryAction', '$uibModalInstance', 'http', 'validator', function ($scope, categoryData, categoryAction, $uibModalInstance, http, validator) {

    console.log('CategoryModalCtrl', categoryData);

    /*$scope.$on('event', function (event, data) {
        console.log(data); // 'Data to send'
    });*/

    $scope.errors = {};
    $scope.$watch('errors', function (errors) {
        if (errors !== undefined) {
            validator.errors = errors;
        }
    });
    $scope.hasError = validator.hasError;
    $scope.showErrorBlock = validator.showErrorBlock;

    $scope.categoryData = angular.copy(categoryData);
    $scope.categoryAction = categoryAction;

    if(typeof categoryAction == "undefined"){
        $scope.categoryAction = 'add';
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };

    $scope.save = function () {

        switch($scope.categoryAction){
            case 'add':
                $scope.createCategory();
                break;
            case 'edit':
                $scope.updateCategory();
                break;
        }



    };

    $scope.createCategory = function (){

        http.saveCategory($scope.categoryData).then(function (response) {
            console.log('category saved: ', response);
            $scope.errors = {};
            $scope.close({
                status: 'success'
            });
        }, function (errResponse) {
            console.log('error: ', errResponse);
            $scope.errors = errResponse.validator;
        });

    };

    $scope.updateCategory = function () {

        console.log('category data: ', $scope.categoryData);

        http.updateCategory($scope.categoryData).then(function (response) {
            console.log('category updated: ', response);
            $scope.errors = {};
            $scope.close({
                status: 'success'
            });
        }, function (errResponse) {
            console.log('error: ', errResponse);
            $scope.errors = errResponse.validator;
        });

    };


}]);

housestars.controller('SuburbsCtrl', ['$scope', 'http', '$uibModal', function ($scope, http, $uibModal) {

    console.log('suburbsCtrl');

    $scope.suburbs = [];
    $scope._suburbs = angular.copy($scope.suburbs);

    $scope.currentSuburb = "";

    $scope.suburbsLength = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllSuburbs();
    };

    $scope.getAllSuburbs = function () {
        http.getAllSuburbs({
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {
            console.log('all suburbs: ', response);
            $scope.suburbs = response.data.suburbs;
            $scope._suburbs = angular.copy($scope.suburbs);
            $scope.suburbsLength = response.data.length;
        });
    };

    $scope.deleteSuburb = function (suburb, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if (confirmation) {
            http.deleteSuburb({
                id: suburb.id
            }).then(function (response) {
                console.log('suburb deleted: ', response);
                $scope._suburbs.splice(index, 1);
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

        modalInstance.result.then(function (response) {

            switch (response.status) {
                case 'success':
                    $scope.changePage($scope.currentPage);
                    break;
            }

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
        }).then(function (response) {
            console.log('status toggled');
            $scope._suburbs[index].status = response.data.status;
        })

    };

    $scope.saveMaxTradie = function (suburb) {

        http.saveMaxTradie(suburb).then(function(response){
            console.log('save max tradie: ', response);
        });

    };


    // initialize
    $scope.getAllSuburbs();

}]);

housestars.controller('SuburbAvailabilityCtrl', ['$scope', 'currentSuburb', '$uibModalInstance', 'http', function ($scope, currentSuburb, $uibModalInstance, http) {

    console.log('SuburbAvailabilityCtrl', currentSuburb);

    $scope.currentSuburb = currentSuburb;
    $scope.currentSuburb.availability = $scope.currentSuburb.availability + '';
    $scope.agents = [];

    $scope.getSuburbAgents = function () {


        http.getSuburbAgents($scope.currentSuburb).then(function (response) {
            console.log('all availabilities of - ' + $scope.currentSuburb, response);
            $scope.user_metas = response.data.user_metas;
        });

    };

    $scope.getAllAgents = function () {
        http.getAllUsers({
            slug: 'agent'
        }).then(function (response) {
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

    $scope.saveAvailability = function () {

        http.updateSuburbAvailability($scope.currentSuburb).then(function (response) {
            console.log('save availability', response);
            $scope.close({
                status: response.data.type
            })
        });

    };

    $scope.removeAgent = function (user_meta, index) {

        http.removeSuburbAgent({
            user_meta: user_meta,
            current_suburb: $scope.currentSuburb
        }).then(function (response) {
            console.log('remove agent: ', response);
            $scope.user_metas.splice(index, 1);

        });

    };


    // initialize
    //$scope.getAllAgents();
    $scope.getSuburbAgents();

}]);

housestars.controller('AdvertisementsCtrl', ['$scope', 'http', '$uibModal', function ($scope, http, $uibModal) {

    console.log('AdvertisementsCtrl');

    $scope.advertisements = [];
    $scope._advertisements = angular.copy($scope.advertisements);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllAdvertisements();
    };

    $scope.getAllAdvertisements = function () {
        http.getAllAdvertisements({
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {
            console.log('advertisements: ', response);
            $scope.advertisements = response.data.advertisements;
            $scope._advertisements = angular.copy($scope.advertisements);
            $scope.totalItems = response.data.length;
        });
    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'advertisements'
        }).then(function (response) {
            console.log('status toggled');
            $scope._advertisements[index].status = response.data.status;
        })

    };

    $scope.deleteAdvertisement = function (advertisement, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if (confirmation) {
            http.deleteAdvertisement({
                id: advertisement.id
            }).then(function (response) {
                console.log('advertisement deleted: ', response);
                $scope._advertisements.splice(index, 1);
            });
        }

    };

    $scope.openAdvertisementModal = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'advertisement-modal.html',
            controller: 'AdvertisementModalCtrl',
            // size: 'lg',
            resolve: {
                advertisementData: function () {
                    return $scope.advertisementData;
                },
            }
        });

        modalInstance.result.then(function (response) {

            switch (response.status) {
                case 'success':
                    $scope.changePage($scope.currentPage);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    $scope.editAdvertisement = function (advertisement, index) {

        http.getAdvertisement(advertisement).then(function (response) {
            console.log('get advertisement: ', response);
            $scope.advertisementData = response.data.advertisement;
            $scope.openEditAdvertisementModal();
        });

        //$scope.advertisementData = advertisement;
        //$scope.openEditAdvertisementModal();

    };

    $scope.openEditAdvertisementModal = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'edit-advertisement-modal.html',
            controller: 'EditAdvertisementModalCtrl',
            // size: 'lg',
            resolve: {
                advertisementData: function () {
                    return $scope.advertisementData;
                },
            }
        });

        modalInstance.result.then(function (response) {

            switch (response.status) {
                case 'success':
                    $scope.changePage($scope.currentPage);
                    break;
            }

            console.log('Success Modal dismissed at: ' + new Date());
        }, function () {
            console.log('Modal dismissed at: ' + new Date());

        });

    };

    // initialize
    $scope.getAllAdvertisements();

}]);

housestars.controller('AdvertisementModalCtrl', ['$scope', 'advertisementData', '$uibModalInstance', 'http', 'validator', function ($scope, advertisementData, $uibModalInstance, http, validator) {

    console.log('AdvertisementModalCtrl', advertisementData);


    $scope.errors = {};
    $scope.$watch('errors', function (errors) {
        if (errors !== undefined) {
            validator.errors = errors;
        }
    });
    $scope.hasError = validator.hasError;
    $scope.showErrorBlock = validator.showErrorBlock;


    $scope.advertisementData = advertisementData;

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };


    $scope.saveAdvertisement = function () {

        if (typeof $scope.advertisementData == "undefined") {
            $scope.advertisementData = {
                name: '',
                type: '',
                priority: ''
            }
        }

        if (typeof $scope.advertisementData.name == "undefined") {
            $scope.advertisementData.name = '';
        }

        if (typeof $scope.advertisementData.type == "undefined") {
            $scope.advertisementData.type = '';
        }

        var formData = new FormData();
        formData.append('name', $scope.advertisementData.name);
        formData.append('type', $scope.advertisementData.type);
        formData.append('priority', $scope.advertisementData.priority);
        formData.append('adFile', $scope.adFile);

        http.saveAdvertisement(formData).then(function (response) {
            console.log('advertisement saved: ', response);
            $scope.errors = {};
            $scope.close({
                status: 'success'
            });
        }, function (errResponse) {
            console.log('error: ', errResponse);
            $scope.errors = errResponse.validator;
        });

    };


}]);

housestars.controller('EditAdvertisementModalCtrl', ['$scope', 'advertisementData', '$uibModalInstance', 'http', 'validator', function ($scope, advertisementData, $uibModalInstance, http, validator) {

    console.log('EditAdvertisementModalCtrl', advertisementData);


    $scope.errors = {};
    $scope.$watch('errors', function (errors) {
        if (errors !== undefined) {
            validator.errors = errors;
        }
    });
    $scope.hasError = validator.hasError;
    $scope.showErrorBlock = validator.showErrorBlock;

    $scope.advertisementData = advertisementData;
    $scope.advertisementData.priority = $scope.advertisementData.priority + '';
    $scope.adFileSrc =  $baseUrl +  '/' + $scope.advertisementData.image_path;

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.close = function (response) {

        var response = response || {};

        $uibModalInstance.close(response);
    };


    $scope.saveAdvertisement = function () {

        if (typeof $scope.advertisementData == "undefined") {
            $scope.advertisementData = {
                name: '',
                type: '',
                priority: ''
            }
        }

        if (typeof $scope.advertisementData.name == "undefined") {
            $scope.advertisementData.name = '';
        }

        if (typeof $scope.advertisementData.type == "undefined") {
            $scope.advertisementData.type = '';
        }

        var formData = new FormData();
        formData.append('id', $scope.advertisementData.id);
        formData.append('name', $scope.advertisementData.name);
        formData.append('type', $scope.advertisementData.type);
        formData.append('priority', $scope.advertisementData.priority);
        formData.append('adFile', $scope.adFile);

        http.updateAdvertisement(formData).then(function (response) {
            console.log('advertisement saved: ', response);
            $scope.errors = {};
            $scope.close({
                status: 'success'
            });
        }, function (errResponse) {
            console.log('error: ', errResponse);
            $scope.errors = errResponse.validator;
        });

    };


}]);

housestars.controller('MailingListsCtrl', ['$scope', 'http', 'validator', function ($scope, http, validator) {

    console.log('MailingListsCtrl', 'test');

    $scope.customers = [];
    $scope._customers = angular.copy($scope.customers);

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllPotentialCustomers();
    };

    $scope.getAllPotentialCustomers = function () {
        http.getAllPotentialCustomers({
            page_no: $scope.currentPage,
            limit: $scope.limit
        }).then(function (response) {
            console.log('all potential customers: ', response);
            $scope.customers = response.data.potential_customers;
            $scope._customers = angular.copy($scope.customers);
            $scope.totalItems = response.data.length;
        });
    };

    $scope.deleteCustomer = function (customer, index) {

        var confirmation = confirm("Are you sure you want to delete?");

        if (confirmation) {
            http.deletePotentialCustomer({
                id: customer.id
            }).then(function (response) {
                console.log('potential customer deleted: ', response);
                $scope._customers.splice(index, 1);
            });
        }
    };

    $scope.toggleStatus = function (item, index) {

        http.toggleStatus({
            value: item.id,
            status: item.status,
            table: 'potential_customers'
        }).then(function (response) {
            console.log('status toggled');
            $scope._customers[index].status = response.data.status;
        })

    };

    $scope.exportToExcel = function () {

        http.exportPotentialCustomers().then(function(response){
            console.log('response export: ', response);
            window.location.href=$baseUrl+'/exports/mailing-list.xlsx';
        });

    };


    // initialize
    $scope.getAllPotentialCustomers();


}]);

housestars.controller('ReportCtrl', ['$scope', 'http', 'validator', function ($scope, http, validator) {

    console.log('ReportCtrl', 'initialized');

    $scope.sortType     = 'tradesman_id'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.searchFish   = '';     // set the default search/filter term

    $scope.reports = [];
    $scope._reports = angular.copy($scope.reports);

    $scope.totalAgencyCount = 0;
    $scope.totalTradesmanCount = 0;
    $scope.totalTransactions = 0;
    $scope.totalCustomerCount = 0;
    $scope.averageAgentCommission = 0;

    $scope.years = [];

    $scope.currentYear = new Date().getFullYear();

    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.limit = 10;

    $scope.changePage = function (newPage) {
        console.log('new page: ', newPage);
        $scope.currentPage = newPage;
        $scope.getAllPotentialCustomers();
    };

    $scope.getReport = function () {

        http.getTradesmanEarningsReport({
            year: $scope.currentYear
        }).then(function(response){
            console.log('get tradesman earnings: ', response);
            $scope.reports = response.data.report;
            $scope._reports = angular.copy($scope.reports);
        });

    };

    $scope.generateReportByYear = function () {

        $scope.currentYear = $scope.year;

        if($scope.currentYear == "" || $scope.currentYear == null){
            $scope.currentYear = new Date().getFullYear();
        }

        $scope.getReport();

    };

    $scope.getYears = function () {

        http.getTransactionYears().then(function(response){
            console.log('transaction years: ', response);
            $scope.years = response.data.years;
        });

    };

    $scope.getTotalAgency = function () {

        http.getUserCountByRole({
            role: 'agency'
        }).then(function(response){
            console.log('agency count: ', response);
            $scope.totalAgencyCount = response.data.count;
        });

    };

    $scope.getTotalTradesman = function () {

        http.getUserCountByRole({
            role: 'tradesman'
        }).then(function(response){
            console.log('tradesman count: ', response);
            $scope.totalTradesmanCount = response.data.count;
        });

    };

    $scope.getTotalCustomer = function () {

        http.getUserCountByRole({
            role: 'customer'
        }).then(function(response){
            console.log('customer count: ', response);
            $scope.totalCustomerCount = response.data.count;
        });

    };

    $scope.getTotalTransactions = function () {

        http.getTotalTransactions().then(function(response){
            console.log('transaction count: ', response);
            $scope.totalTransactions = response.data.total;
        });

    };

    $scope.getAverageAgentCommission = function () {

        http.getAverageAgentCommission().then(function(response){
            console.log('average agent commission: ', response);
            $scope.averageAgentCommission = response.data.average+"%";
        });

    };

    // initialize
    $scope.getReport();
    $scope.getYears();
    $scope.getTotalAgency();
    $scope.getTotalTradesman();
    $scope.getTotalAgency();
    $scope.getTotalCustomer();
    $scope.getTotalTransactions();
    $scope.getAverageAgentCommission();


}]);
