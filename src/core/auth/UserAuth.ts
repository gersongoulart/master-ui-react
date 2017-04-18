import settings from 'core/settings';
import { Api, LocalStorage } from 'core/helpers';
import { userRoles, accessLevels } from './Access';
import { ActionResult } from 'core/models';

class UserAuth {

  /**
   * Authenticate a user. Save a token string in Local Storage
   *
   * @param {string} token
   */
  public static login(identifier: string, password: string) {
      let self = this;
      let promise = null;

      const grantContent = `grant_type=${settings.api.grantType}`;
      const userNameContent = `${'&username='}${identifier}`;
      const passwordContent = `${'&password='}${password}`;
      const clientId = `${'&client_id='}${settings.api.clientId}`;

      const bodyContent = `${grantContent}${userNameContent}${passwordContent}${clientId}`;
      const apiResponse: ActionResult = new ActionResult();
      apiResponse.action = 'login';

      return new Promise((resolve: any, reject: any) => {
          Api
              .plainRequest(settings.api.loginUrl, 'POST', bodyContent, 'application/x-www-form-urlencoded', true)
              .then((result) => {
                if (!apiResponse.error) {
                    self.setToken(result.access_token);
                    self.setUser({username: result.username}, {title: result.role, bitMask: parseInt(result.bitMask, 0)});
                    apiResponse.redirect = settings.defaultRoute;
                    apiResponse.data = self.user;
                    apiResponse.message = 'User has been successfully authenticated';
                    resolve(apiResponse);
                } else {

                }
              }).catch((error) => {
                  apiResponse.error = new Error(error.error_description);
                  reject(apiResponse);
              });
      });
  }

  public static resetPassword(email: string) {
      let self = this;
      const apiResponse: ActionResult = new ActionResult();

      return new Promise((resolve: any, reject: any) => {
          Api
              .patch(settings.api.resetPasswordUrl, { email }, null, true)
              .then((result) => {
                if (!apiResponse.error) {
                    apiResponse.redirect = settings.loginRedirect;
                    apiResponse.message = 'User has been successfully authenticated';
                    resolve(apiResponse);
                } else {

                }
              }).catch((error) => {
                  apiResponse.error = new Error(error.error_description);
                  reject(apiResponse);
              });
      });
  }  

  public static get token(): string {
      return LocalStorage.get(this.tokenKey);
  }
  /**
   * Check if a user is authenticated - check if a token is saved in Local Storage
   *
   * @returns {boolean}
   */
  static isAuthenticated() {
    return !!this.token;
  }

  private static get userKey() {
    return `${settings.tokenPrefix}_user`;
  }

  private static get tokenKey() {
    return `${settings.tokenPrefix}_${settings.tokenName}`;
  }

  public static get user() {
    let usr = JSON.parse(LocalStorage.get(this.userKey));
    return usr;
  }

  private static setUser(user: any, level: any): void {
    user.accessLevel = level;
    LocalStorage.set(this.userKey, JSON.stringify(user));
  }

  private static setToken(token) {
    return LocalStorage.set(this.tokenKey, token);
  }
  /**
   * Get a token value.
   *
   * @returns {string}
   */

  private static get publicUser() {
    return { username: '', role: userRoles.public };
  }

  public static isAuthorized(accessLevel, role) {
    role = (role || this.user.accessLevel) || this.publicUser.role;
    return accessLevel.bitMask <= role.bitMask;
  }

  static get accessLevel() {
    return this.user.accessLevel || accessLevels.public;
  }

  public static checkAuth(nextState, replace, accessLevel) {

      const isAuth = this.isAuthenticated();

      if ( (accessLevel > 0 && !isAuth) || (accessLevel === 0 && isAuth) ) {
        replace({
          pathname : '/',
          state : { nextPathname : nextState.location.pathname },
        });
      }

      if (isAuth && nextState.location.pathname === '/') {
        replace({
          pathname : settings.defaultRoute,
          state : { nextPathname : nextState.location.pathname },
        });
      }

  }

  public static logout() {
      return new Promise((resolve, reject) => {
          this.clearToken();
          const apiResponse = new ActionResult();
          apiResponse.action = 'logout';
          apiResponse.message = 'User successfully logged out';
          apiResponse.redirect = settings.loginRedirect;
          resolve(apiResponse);
      });
  }

  private static clearToken(): void {
      LocalStorage.remove(this.tokenKey);
      LocalStorage.remove(this.userKey);
  }

}

export default UserAuth;
