'use strict';

angular.module('agrinaut.admin.users', ['app.config', 'agrinaut.notices', 'agrinaut.data.mongodb'])
    .config(['$routeProvider', 'agrinautModuleBase', function($routeProvider, agrinautModuleBase) {        
            $routeProvider.
                when('/admin/users', {
                    templateUrl: agrinautModuleBase + '/search/grid.tpl.html',
                    controller: 'AdminUserListController'
                }).
                when('/admin/users/new', {
                    templateUrl: agrinautModuleBase + '/admin/users/user-edit.tpl.html',
                    controller: 'AdminNewUserController'
                }).
                when('/admin/users/edit/:username', {
                    templateUrl: agrinautModuleBase + '/admin/users/user-edit.tpl.html',
                    controller: 'AdminEditUserController'
                });
        }
    ])

    .provider('adminUserData', function() {

        this.collection = 'users/';

        this.$get = ['$http', '$resource', 'mongodbData', function($http, $resource, mongodbData) {
            var collection = this.collection;
            return {
                getBaseUrl: function() {                    
                    return mongodbData.getBaseUrl() + '/' + collection
                },

                getUser: function(username) {
                    return $resource(this.getBaseUrl() + ':username', { username: username }, { update: { method: 'PUT' } } )                 
                },

                getUsers: function(config) {                    
                    return mongodbData.getData(collection, config)                    
                },

                newUser: function() {
                    return $resource(this.getBaseUrl(), {}, { create: { method: 'PUT' } } )                 
                }
            }
        }];

        this.setCollection = function(collection) {
            this.collection = collection;
        };
    });