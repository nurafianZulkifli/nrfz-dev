/**
 * Cookie banner Plugin
 *
 * $author       Sophie Seguin
 * $url          http://www.soseguin.com/
 */

$.fn.cookieBanner = function (options) {

    //Settings
    var settings = $.extend({
      cookieDuration: 730, // Number of days before the cookie expires
      cookieNeverExpire: false, // set to true for never-expire-cookies
      cookieName: 'CookieLawCompliance',
      cookieValue: true
    }, options);
  
    return this.each(function () {
  
      var $container = $(this);
      var $trigger = $container.find('.close');
  
      // Check whether to show or hide the cookie banner
      function checkCookie() {
        if (getCookie(settings.cookieName)) {
          $container.hide();
        } else {
          $container.slideDown();
          $trigger.bind('click', acceptCookie);
        }
      }
  
      // Check whether a cookie exists
      function getCookie(name) {
        if (!name) {
          return false;
        }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
      }
  
      // Update the styling of the cookie
      function acceptCookie() {
        if (setCookie(settings)) {
          $container.slideToggle();
        }
      }
  
      // Create a cookie. Return true if sucessfully set
      function setCookie(settings) {
        if (settings.cookieName) {
          var dateToday = new Date();
          var expire = new Date();
  
          if (settings.cookieNeverExpire) {
            //conventional date of end of the world
            expire = 'Tue, 19 Jan 2038 03:14:07 GMT';
          } else {
            if (settings.cookieDuration === null || settings.cookieDuration === 0) settings.cookieDuration = 1;
            expire.setTime(dateToday.getTime() + (settings.cookieDuration * 24 * 60 * 60 * 1000));
            expire = expire.toUTCString();
          }
  
          var dateExpire = "; expires=" + expire;
          document.cookie = settings.cookieName + "=" + encodeURIComponent(settings.cookieValue) + dateExpire + "; path=/";
  
          return true;
        }
      }
  
      //Init functions
      checkCookie();
  
    });
    //end each
  };
  //end jquery extend