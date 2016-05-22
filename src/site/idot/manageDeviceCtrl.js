(function() {
  'use strict';

  angular
    .module('devPortal')
    .controller('ManageDeviceCtrl', ManageDeviceCtrl);

  /* @ngInject */
  function ManageDeviceCtrl($log, $q, $state, IdpClient, IdotManageService) {
    var vm = this;

    vm.devList = [];
    vm.data = {
      cb1: true,
      cb4: true,
      cb5: false
    };

    vm.getDevices = getDevices;
    vm.launchModal = launchModal;
    vm.isPatient = IdpClient.isAuthorized('PATIENT', IdpClient.idotProjectId);

    //////////

    // function getDevices() {
    //   var deferred = $q.defer();
    //   var deviceData = {
    //     clientId: vm.clientId,
    //     clientSecret: vm.clientSecret,
    //     authCodePromise: deferred.promise
    //   }
    //   store.remove('deviceData');
    //   // store.set('deviceData', deviceData);
    //   IdpClient.smartThingsLogin(vm.clientId, function() {});
    // }

    function getDevices() {

      IdotManageService.getDevices().then(function(data) {
        vm.devList = data;
      });


    }

    function launchModal(index) {
      var dev = vm.devList[index];

      $state.go("ManageDev.View", {
        'deviceID': dev.device_id
      });
    }

    // function activate() {
    //   var deviceData = store.get('deviceData')
    //   if (deviceData) {
    //     deviceData.authCodePromise.then(function(data) {
    //       var authCode = data;
    //       IdotManageService.addDevice(authCode,
    //         deviceData.clientId,
    //         deviceData.clientSecret,
    //         IdpClient.redirectUrl);
    //       store.remove('deviceData');
    //     }, function(error) {
    //       store.remove('deviceData');
    //       $log.log('addDevice failed', error);
    //     });
    //   }
    // }

    // activate();
    getDevices();

  }

})()
