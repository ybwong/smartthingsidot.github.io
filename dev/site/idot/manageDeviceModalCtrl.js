(function() {
  'use strict';

  angular
    .module('devPortal')
    .controller('ManageDeviceModalCtrl', ManageDeviceModalCtrl);

  /* @ngInject */
  function ManageDeviceModalCtrl($log, $state, $stateParams, IdotManageService) {
    var vm = this;

    vm.cmd_name = 'switch';
    vm.cmd_value = true;
    vm.cmd_type = 'BOOLEAN';

    vm.isDisabled = false;

    vm.close = close;
    vm.done = done;

    //////////

    function close() {
      $('#ManageDeviceModal').off('hidden.bs.modal');
      $state.go('ManageDev');
    }

    function done() {
      var data = {
        cmd_name: vm.cmd_name,
        cmd_type: vm.cmd_type,
        cmd_value: vm.cmd_value,
        min_range: vm.min_range,
        max_range: vm.max_range
      };
      IdotManageService.saveDeviceStatus(vm.deviceID, data).then(function() {}, function(error) {
        $log.log('failed to save device status', error)
      });

    }

    function init() {
      vm.deviceID = $stateParams.deviceID;

      IdotManageService.getDeviceStatus(vm.deviceID).then(function(data) {
        vm.cmd_name = data.cmd_name;
        vm.cmd_type = data.cmd_type;
        vm.cmd_value = data.cmd_value;
        vm.min_range = data.min_range;
        vm.max_range = data.max_range;
      });


      $('#ManageDeviceModal').modal();
      $('#ManageDeviceModal').on('hidden.bs.modal', function(e) {
        vm.close();
      });
    }

    init();
  }
})();
