/*
 * Copyright (C) 2014-2022 Andrea Feccomandi
 *
 * Licensed under the terms of GNU GPL License;
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.gnu.org/licenses/gpl-3.0.en.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 */
angular.
  module('bibiscoApp').
  component('itemdetail', {
    templateUrl: 'components/objects/object-detail.html',
    controller: ObjectDetailController
  });

function ObjectDetailController($location, $routeParams, $window,
  ChapterService, ObjectService, UtilService) {

  var self = this;

  self.$onInit = function () {

    self.breadcrumbitems = [];
    self.object = self.getObject(parseInt($routeParams.id));

    // If we get to the page using the back button it's possible that the resource has been deleted. Let's go back again.
    if (!self.object) {
      $window.history.back();
      return;
    }

    self.mode = $routeParams.mode;
    self.breadcrumbitems.push({
      label: 'objects',
      href: '/objects/params/focus=objects_' + self.object.$loki
    });
    self.breadcrumbitems.push({
      label: self.object.name
    });

    self.deleteforbidden = self.isDeleteForbidden();
  };

  self.changeStatus = function (status) {
    self.object.status = status;
    ObjectService.update(self.object);
  };

  self.changeTitle = function () {
    $location.path('/objects/' + self.object.$loki + '/title');
  };

  self.delete = function () {
    ObjectService.remove(self.object.$loki);
    $window.history.back();
  };

  self.edit = function () {
    $location.path('/objects/ ' + self.object.$loki + '/edit');
  };

  self.getObject = function (id) {
    return ObjectService.getObject(id);
  };

  self.savefunction = function () {
    ObjectService.update(self.object);
  };

  self.showeventsfunction = function() {
    $location.path('/objects/' + self.object.$loki + '/events');
  };

  self.showimagesfunction = function () {
    $location.path('/objects/' + self.object.$loki + '/images');
  };

  self.isDeleteForbidden = function () {

    let deleteForbidden = false;
    let id = self.object.$loki;
    let chapters = ChapterService.getChaptersWithPrologueAndEpilogue();
    for (let i = 0; i < chapters.length && !deleteForbidden; i++) {
      let scenes = ChapterService.getScenes(chapters[i].$loki);
      for (let j = 0; j < scenes.length && !deleteForbidden; j++) {
        let revisions = scenes[j].revisions;
        for (let h = 0; h < revisions.length && !deleteForbidden; h++) {
          if (UtilService.array.contains(revisions[h].sceneobjects, id)) {
            deleteForbidden = true;
          }
        }
      }
    }

    return deleteForbidden;
  };

  self.addprofileimage = function() {
    $location.path('/objects/' + self.object.$loki + '/images/addprofile');
  };
}
