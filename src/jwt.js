class JwtHelper {
    static key = 'auth_token';
    static storeToken(token) {
      localStorage.setItem(this.key, token);
    }
  
    static getToken() {
      return localStorage.getItem(this.key);
    }
  
    static removeToken() {
      localStorage.removeItem(this.key);
    }
  
    static decodeToken(token) {
      if (token) {
        return JSON.parse(atob(token.split('.')[1]));
      }
      return null;
    }
  
    static isExpired(token) {
      const jwt = this.decodeToken(token);
      if (jwt) {
        const now = new Date().getTime() / 1000;
        return now > jwt.exp;
      }
      return true;
    }  
}

module.exports = JwtHelper;
  