(function() {
  'use strict';

  angular
    .module('devPortal')
    .controller('OnboardDeviceCtrl', OnboardDeviceCtrl);

  /* @ngInject */
  function OnboardDeviceCtrl($log, $q, store, IdpClient, IdotManageService) {
    var vm = this;

    vm.clientId = '';
    vm.clientSecret = '';

    vm.addDevice = addDevice;

    //////////

    function addDevice() {
      var deferred = $q.defer();
      var deviceData = {
        clientId: vm.clientId,
        clientSecret: vm.clientSecret,
        authCodePromise: deferred.promise
      }
      store.remove('deviceData');
      // store.set('deviceData', deviceData);
      IdpClient.smartThingsLogin(vm.clientId, function() {});
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

  }

})()
