import angular from 'angular';
import uuidv4 from 'uuid/v4';
import { getEnvironments } from '@/react/portainer/environments/environment.service';

class AuthenticationController {
  /* @ngInject */
  constructor(
    $async,
    $analytics,
    $scope,
    $state,
    $stateParams,
    $window,
    Authentication,
    UserService,
    StateManager,
    Notifications,
    SettingsService,
    URLHelper,
    LocalStorage,
    StatusService
  ) {
    this.$async = $async;
    this.$analytics = $analytics;
    this.$scope = $scope;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$window = $window;
    this.Authentication = Authentication;
    this.UserService = UserService;
    this.StateManager = StateManager;
    this.Notifications = Notifications;
    this.SettingsService = SettingsService;
    this.URLHelper = URLHelper;
    this.LocalStorage = LocalStorage;
    this.StatusService = StatusService;

    this.logo = this.StateManager.getState().application.logo;
    this.formValues = {
      Username: '',
      Password: '',
    };
    this.state = {
      passwordInputType: 'password',
      showOAuthLogin: false,
      showStandardLogin: false,
      AuthenticationError: '',
      loginInProgress: true,
      OAuthProvider: '',
    };

    this.checkForEndpointsAsync = this.checkForEndpointsAsync.bind(this);
    this.postLoginSteps = this.postLoginSteps.bind(this);

    this.oAuthLoginAsync = this.oAuthLoginAsync.bind(this);
    this.internalLoginAsync = this.internalLoginAsync.bind(this);

    this.authenticateUserAsync = this.authenticateUserAsync.bind(this);

    this.manageOauthCodeReturn = this.manageOauthCodeReturn.bind(this);
    this.authEnabledFlowAsync = this.authEnabledFlowAsync.bind(this);
    this.onInit = this.onInit.bind(this);
  }

  /**
   * UTILS FUNCTIONS SECTION
   */

  toggleShowPassword() {
    this.state.passwordInputType = this.state.passwordInputType === 'text' ? 'password' : 'text';
  }

  // set the password input type to password, so that browser autofills don't treat the input as text
  setPasswordInputType(inputType) {
    this.state.passwordInputType = inputType;
    document.getElementById('password').setAttribute('type', inputType);
  }

  logout(error) {
    this.Authentication.logout();
    this.state.loginInProgress = false;
    this.generateOAuthLoginURI();
    this.LocalStorage.storeLogoutReason(error);
    this.$window.location.reload();
  }

  error(err, message) {
    this.state.AuthenticationError = message;
    if (!err) {
      err = {};
    }
    this.Notifications.error('Failure', err, message);
    this.state.loginInProgress = false;
  }

  determineOauthProvider(LoginURI) {
    if (LoginURI.indexOf('login.microsoftonline.com') !== -1) {
      return 'Microsoft';
    } else if (LoginURI.indexOf('accounts.google.com') !== -1) {
      return 'Google';
    } else if (LoginURI.indexOf('github.com') !== -1) {
      return 'Github';
    }
    return 'OAuth';
  }

  generateState() {
    const uuid = uuidv4();
    this.LocalStorage.storeLoginStateUUID(uuid);
    return '&state=' + uuid;
  }

  generateOAuthLoginURI() {
    this.OAuthLoginURI = this.state.OAuthLoginURI + this.generateState();
  }

  hasValidState(state) {
    const savedUUID = this.LocalStorage.getLoginStateUUID();
    return savedUUID && state && savedUUID === state;
  }

  /**
   * END UTILS FUNCTIONS SECTION
   */

  /**
   * POST LOGIN STEPS SECTION
   */

  async checkForEndpointsAsync() {
    try {
      const isAdmin = this.Authentication.isAdmin();
      const endpoints = await getEnvironments({ limit: 1, query: { excludeSnapshots: true } });

      if (this.Authentication.getUserDetails().forceChangePassword) {
        return this.$state.go('portainer.account');
      }

      if (endpoints.value.length === 0 && isAdmin) {
        return this.$state.go('portainer.wizard');
      } else {
        return this.$state.go('portainer.home');
      }
    } catch (err) {
      this.error(err, '无法获取环境');
    }
  }

  async postLoginSteps() {
    await this.StateManager.initialize();

    const isAdmin = this.Authentication.isAdmin();
    this.$analytics.setUserRole(isAdmin ? 'admin' : 'standard-user');

    await this.checkForEndpointsAsync();
  }
  /**
   * END POST LOGIN STEPS SECTION
   */

  /**
   * LOGIN METHODS SECTION
   */

  async oAuthLoginAsync(code) {
    try {
      await this.Authentication.OAuthLogin(code);
      this.URLHelper.cleanParameters();
    } catch (err) {
      this.error(err, '无法通过OAuth进行登录');
    }
  }

  async internalLoginAsync(username, password) {
    await this.Authentication.login(username, password);
    await this.postLoginSteps();
  }

  /**
   * END LOGIN METHODS SECTION
   */

  /**
   * AUTHENTICATE USER SECTION
   */

  async authenticateUserAsync() {
    try {
      var username = this.formValues.Username;
      var password = this.formValues.Password;
      this.state.loginInProgress = true;
      await this.internalLoginAsync(username, password);
    } catch (err) {
      this.error(err, '无法登录');
    }
  }

  authenticateUser() {
    this.setPasswordInputType('password');
    return this.$async(this.authenticateUserAsync);
  }

  /**
   * END AUTHENTICATE USER SECTION
   */

  /**
   * ON INIT SECTION
   */
  async manageOauthCodeReturn(code, state) {
    if (this.hasValidState(state)) {
      await this.oAuthLoginAsync(code);
    } else {
      this.error(null, '无效的OAuth状态，请重试。');
    }
  }

  async authEnabledFlowAsync() {
    try {
      const exists = await this.UserService.administratorExists();
      if (!exists) {
        this.$state.go('portainer.init.admin');
      }
    } catch (err) {
      this.error(err, '无法验证管理员帐户是否存在');
    }
  }

  toggleStandardLogin() {
    this.state.showStandardLogin = !this.state.showStandardLogin;
  }

  async onInit() {
    try {
      const settings = await this.SettingsService.publicSettings();
      this.state.showOAuthLogin = settings.AuthenticationMethod === 3;
      this.state.showStandardLogin = !this.state.showOAuthLogin;
      this.state.OAuthLoginURI = settings.OAuthLoginURI;
      this.state.OAuthProvider = this.determineOauthProvider(settings.OAuthLoginURI);

      const code = this.URLHelper.getParameter('code');
      const state = this.URLHelper.getParameter('state');
      if (code && state) {
        await this.manageOauthCodeReturn(code, state);
        this.generateOAuthLoginURI();
        return;
      }
      if (!this.logo) {
        await this.StateManager.initialize();
        this.logo = this.StateManager.getState().application.logo;
      }
      this.generateOAuthLoginURI();

      if (this.$stateParams.logout || this.$stateParams.error) {
        this.logout(this.$stateParams.error);
        return;
      }
      const error = this.LocalStorage.getLogoutReason();
      if (error) {
        this.state.AuthenticationError = error;
        this.LocalStorage.cleanLogoutReason();
      }

      if (this.Authentication.isAuthenticated()) {
        await this.postLoginSteps();
      }
      this.state.loginInProgress = false;

      await this.authEnabledFlowAsync();
    } catch (err) {
      this.Notifications.error('失败', err, '无法检索公共设置');
    }
  }

  $onInit() {
    return this.$async(this.onInit);
  }

  /**
   * END ON INIT SECTION
   */
}

export default AuthenticationController;
angular.module('portainer.app').controller('AuthenticationController', AuthenticationController);
