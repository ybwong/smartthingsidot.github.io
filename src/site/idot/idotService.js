(function() {
  'use strict';

  angular
  .module("devPortal")
  .factory("IdotService",IdotService);

  /* @ngInject */
  function IdotService($resource, IfStudioClient) {
    return $resource(IfStudioClient.apiBaseSmartThings + 'devices/:devId', {
      devId: '@devId'
    }, {
      'update': { method: 'PUT' }
    });
  }
})();
