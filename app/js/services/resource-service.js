/**
 * Resource Service
 * Service to declare methods around resource issues that happen throughout blueprint.
 */
'use strict';

angular
    .module('app.services')
    .service('ResourceService', function() {
        /**
         * Resource Id To Resource
         * Takes resource data and returns a map from:
         * resource Id => resource
         * By looping through the resourceData.
         */
        this.resourceIdToResource = function(resourceData) {
            var resourceDict = {};

            _(resourceData).forEach(function(resource) {
                resourceDict[resource.id] = resource;
            });

            return resourceDict;
        };

        /**
         * Resource relation to a map
         * Takes a resource with the relationship data and a resouceIdToRelation hash map
         * and returns a hashmap that has the relationships mapped out for the particular resource.
         */
        this.resourceRelationToMap = function(resource, resouceData, resourceIdToRelation) {
            _(resouceData).forEach(function(singleRelationship) {
                if(!(singleRelationship.id in resourceIdToRelation)) {
                    resourceIdToRelation[singleRelationship.id] = [];
                }
                resourceIdToRelation[singleRelationship.id].push(resource);
            });
        }
    });