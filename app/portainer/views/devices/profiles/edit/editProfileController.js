import angular from 'angular';
import { editor } from '@@/BoxSelector/common-options/build-methods';
import { getProfile, updateProfile } from 'Portainer/hostmanagement/fdo/fdo.service';

angular.module('portainer.app').controller('EditProfileController', EditProfileController);

/* @ngInject */
export default function EditProfileController($scope, $async, $state, $window, Notifications) {
  $scope.buildMethods = [editor];

  $scope.formValues = {
    name: '',
    profileFileContent: '',
  };

  $scope.state = {
    profileID: $state.params.id,
    method: 'editor',
    actionInProgress: false,
    isEditorDirty: false,
  };

  $window.onbeforeunload = () => {
    if ($scope.state.method === 'editor' && $scope.formValues.profileFileContent && $scope.state.isEditorDirty) {
      return '';
    }
  };

  $scope.$on('$destroy', function () {
    $scope.state.isEditorDirty = false;
  });

  $scope.onChangeFormValues = onChangeFormValues;

  $scope.updateProfileAsync = function () {
    return $async(async () => {
      const method = $scope.state.method;

      const name = $scope.formValues.name;
      const fileContent = $scope.formValues.profileFileContent;

      if (method !== 'editor' && fileContent === '') {
        $scope.state.formValidationError = '配置文件内容不能为空';
        return;
      }

      $scope.state.actionInProgress = true;

      try {
        await updateProfile($scope.state.profileID, name, fileContent);
        Notifications.success('成功', '配置文件更新成功');
        $scope.state.isEditorDirty = false;
        $state.go('portainer.settings.edgeCompute');
    } catch (err) {
        Notifications.error('失败', err, '无法更新配置文件');
    } finally {
        $scope.state.actionInProgress = false;
    }
    });
  };

  $scope.onChangeFileContent = function onChangeFileContent(value) {
    $scope.formValues.profileFileContent = value;
    $scope.state.isEditorDirty = true;
  };

  function onChangeFormValues(newValues) {
    $scope.formValues = newValues;
  }

  async function initView() {
    return $async(async () => {
      try {
        const profile = await getProfile($scope.state.profileID);

        $scope.formValues = {
          name: profile.name,
          profileFileContent: profile.fileContent,
        };
        $scope.state.isEditorDirty = false;
      } catch (err) {
        Notifications.error('失败', err, '无法获取配置文件详情');
      }
    });
  }

  initView();
}
