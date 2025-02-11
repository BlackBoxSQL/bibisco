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
  component('relationexport', {
    templateUrl: 'components/relations/relation-export.html',
    controller: RelationExportController
  });

function RelationExportController($injector, $location, $rootScope, $scope, $timeout, 
  ExportService, FileSystemService, PopupBoxesService) {

  var self = this;
  var RelationsService = $injector.get('RelationsService');
  const { shell } = require('electron');

  self.$onInit = function() {

    $rootScope.$emit('EXPORT_SELECT_DIRECTORY');

    self.breadcrumbitems = [];
    self.breadcrumbitems.push({
      label: 'relations_title',
      href: '/relations/view'
    });
    self.breadcrumbitems.push({
      label: 'common_export',
    });

    self.saving = false;
    self.exportpath;

    self.checkExit = {
      active: true
    };
  };

  self.export = function(isValid) {
    if (isValid && !self.forbiddenDirectory) {
      self.checkExit = {
        active: false
      };
      self.saving = true;
      $timeout(function () {
        self.executeExport();
      }, 250);
    }
  },

  self.executeExport = function() {
    
    // create dummy div to host network to export
    let div = document.createElement('div');    
    let style = document.createAttribute('style');      
    style.value = 'width: 2048px; height: 1080px; background-color: white;';                           
    div.setAttributeNode(style);   
    document.body.appendChild(div);;

    // create network to export
    let exportnetwork = new vis.Network(div, {
      nodes: new vis.DataSet(RelationsService.getRelationsNodes()),
      edges: new vis.DataSet(RelationsService.getRelationsEdges())
    }, {
      edges: {
        arrows: 'to',
        color: '#AECF00',
        font: {
          strokeWidth: 0, // px
        },
        smooth: false
      },
      groups: {
        objects: {
          shape: 'triangle',
        },
        main_characters: {
          shape: 'dot',
        },
        secondary_characters: {
          shape: 'dot',
        },
        locations: {
          shape: 'square',
        }
      },
      interaction: {
        dragNodes: false,
        dragView: false,
        navigationButtons: false,
        keyboard: {
          enabled: false,
          bindToWindow: false
        },
        zoomView: false
      }, 
      layout: {
        randomSeed: 2
      }, 
      nodes: {
        font: {
          bold: 'true'
        }
      },
      physics: {
        enabled: false
      }
    });
    exportnetwork.redraw();

    let canvas = div.getElementsByTagName('canvas')[0];

    // create a dummy canvas
    let destinationCanvas = document.createElement('canvas');
    destinationCanvas.width = canvas.width;
    destinationCanvas.height = canvas.height;
    
    // export on white background
    destCtx = destinationCanvas.getContext('2d');
    destCtx.fillStyle = '#FFFFFF';
    destCtx.fillRect(0,0,canvas.width,canvas.height);
    destCtx.drawImage(canvas, 0, 0);
  
    // export image
    let dataURL = destinationCanvas.toDataURL('image/png');
    let exportfilepath = ExportService.calculateExportFilePath(self.exportpath, 'relations', new Date());
    FileSystemService.writeBase64DataToFile(dataURL, exportfilepath+'.png');
    
    // remove dummy div
    document.body.removeChild(div);

    // show item in folder
    shell.showItemInFolder(self.exportpath);

    // back to relations page
    $timeout(function () {
      $location.path('/relations/view');
    }, 0);
  };

  self.selectProjectsDirectory = function (directory) {
    self.exportpath = directory;
    if (FileSystemService.canWriteDirectory(directory)) {
      self.forbiddenDirectory = false;
    } else {
      self.forbiddenDirectory = true;
    }
    
    $scope.$apply();
  };

  $scope.$on('$locationChangeStart', function (event) {
    PopupBoxesService.locationChangeConfirm(event, self.exportpath, self.checkExit);
  });

}
