(function() {
  'use strict';

  angular
    .module("devPortal")
    .factory("IdotManageService", IdotManageService);

  /* @ngInject */
  function IdotManageService(IdotService) {

    return {
      getDevices: getDevices,
      getDeviceStatus: getDeviceStatus
    };

    function getDevices() {
      return IdotService.query().$promise;
    }

    function getDeviceStatus(deviceID) {
      return IdotService.get({ devId: deviceID, status: 'status' }).$promise;
    }

    function addDevice(authCode, clientId, clientSecret, redirectUrl) {
      return IdotService.save({
        auth_code: authCode,
        client_id: clientId,
        client_secret: clientSecret
      }).$promise;
    }
  }
})();
