angular.module('bridge.service')
.service('resourceMgrSvc', function(k8s) {
  'use strict';

  function removeByIndex(ary, index) {
    if (!ary || !ary.length) {
      return;
    }
    if (index > -1) {
      ary.splice(index, 1);
    }
  }

  // The detail page link of a resource.
  this.getLink = function(resource, kind) {
    var meta, path = '';
    if (!resource || !resource.metadata) {
      return '';
    }
    meta = resource.metadata;
    if (meta.namespace) {
      path = '/ns/' + meta.namespace;
    }
    return path + '/' + kind.path + '/' + meta.name;
  };

  // The edit page link of a resource.
  this.getEditLink = function(resource, kind) {
    var link = this.getLink(resource, kind);
    if (!link) {
      return '';
    }
    return link + '/edit';
  }.bind(this);

  this.removeFromList = function(list, resource) {
    var idx;
    if (!list || !resource || !resource.metadata) {
      return;
    }

    idx = k8s.util.findIndexByUID(list, resource.metadata.uid);
    if (idx !== -1) {
      removeByIndex(list, idx);
    }
  };

  // Updates a resource in a list if it exists and is newer,
  // or appends to the list if a previous version is not found.
  this.updateInList = function(list, resource) {
    var idx, current;
    if (!list || !resource || !resource.metadata) {
      return;
    }

    idx = k8s.util.findIndexByUID(list, resource.metadata.uid);
    // not in list, do insert
    if (idx === -1) {
      list.push(resource);
      return;
    }

    current = list[idx];
    if (current && current.metadata.resourceVersion < resource.metadata.resourceVersion) {
      list[idx] = resource;
    }
  };

});
