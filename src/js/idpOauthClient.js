(function(){
	var app = angular.module('idp-oauth-client', ['angular-storage']);
	app.factory('IdpClient', function($log, $window, $http, $httpParamSerializerJQLike, store){
		var authCodePromise = undefined;

		var smartThingsHost = 'https://graph.api.smartthings.com';
		var clientIdSmartThings = 'ec909493-9dbc-465d-8681-01b559022b75';
		var secretSmartThings = 'a7a5775e-7c5d-4b57-85d9-30636987cf0f';
		var idpHost='https://if-idp.appspot.com';	

		var devPortalProjectId = 'devnet-alpha.integratingfactor.com';
		var devPortalClientId = 'b80a9eb3-8b8e-46ef-ad61-77309f9bedb4';
		var devPortalClientSecret = '';

		var idotProjectId = 'e2ecd93f-aada-4009-8be1-4fa072c97749';
		var idotClientId = '7204ae71-c0aa-446a-ae12-460afba58bf4';
		var idotClientSecret = 'secret';

		var clientId = idotClientId;
		var clientSecret = idotClientSecret;

		var clientAuth=btoa(clientId+':'+clientSecret);
		var errorPage;
		var redirectUrl=$window.location.protocol + '//' + $window.location.host;
		var userInfo;
		var token;
		var isSessionStorageSupported = false;
		try {
			$window.sessionStorage.test = 1;
			isSessionStorageSupported = true;
			var temp = $window.sessionStorage.userInfo;
			if (temp && typeof temp != "undefined" && temp != "null") {
				userInfo = JSON.parse(temp);
				token = JSON.parse($window.sessionStorage.token);
				$log.log('user info retreived from session storage');
			} else {
				$log.log('user info not found in session storage');
				$window.sessionStorage.userInfo = JSON.stringify(userInfo);
				$window.sessionStorage.token = JSON.stringify(token);
			}
		} catch (e) {
			$log.log('session storage not supported', e);
		};

		function requestAccessToken(clientId,type){
			$log.log("requesting access token");
			$window.location=idpHost+'/oauth/authorize?client_id='+clientId+'&response_type='+type+'&redirect_uri='+redirectUrl;
		}


		//
		// SmartThings authorize uri for getting auth code:
		//
        // GET https://graph.api.smartthings.com/oauth/authorize?
        // response_type=code&
        // client_id=YOUR-SMARTAPP-CLIENT-ID&
        // scope=app&
        // redirect_uri=YOUR-SERVER-URI
        //
		function requestAccessTokenSmartThings(smartHost,clientId,type,scope,redirect_uri){
			$log.log("requesting access token from SmartThings");
			$window.location=smartHost+'/oauth/authorize?client_id='+clientId+'&response_type='+type+'&scope='+scope+'&redirect_uri='+redirect_uri;
		}

		function validateToken(accessToken, returnTo) {
			$log.log("validating access token");
			if (accessToken && typeof accessToken != "undefined" && accessToken != "null") {
			  $http({
			    url:idpHost+'/oauth/check_token',
			    method: "POST",
			    headers: {
			      Authorization: "Basic " + clientAuth,
			      'Content-Type': 'application/x-www-form-urlencoded'
			    },
			    data: $httpParamSerializerJQLike({
			      token: accessToken
			    })
			  })
			  .success(function (data) {
			    $log.log("validated token successfully");
			    userInfo=data;
			    token=accessToken;
				if (isSessionStorageSupported) {
					$window.sessionStorage.userInfo = JSON.stringify(userInfo);
					$window.sessionStorage.token = JSON.stringify(token);
				}
				returnTo();
			  })
			  .error(function (req, status, error) {
			    $log.log("Failed to validate token: ", status, error);
			    userInfo=null;
			    token=null;
				if (isSessionStorageSupported) {
					$window.sessionStorage.userInfo = JSON.stringify(userInfo);
					$window.sessionStorage.token = JSON.stringify(token);
				}
			  });
			}
		}

        //
        // POST https://graph.api.smartthings.com/oauth/token HTTP/1.1
        // Host: graph.api.smartthings.com
        // Content-Type: application/x-www-form-urlencoded
        // grant_type=authorization_code&code=YOUR_CODE&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=YOUR_REDIRECT_URI
        //
		// function getAccessToken(authCode) {
		// 	$http({
		// 	    url:smartThingsHost+'/oauth/token',
		// 	    method: "POST",
		// 	    headers: {
		// 	      'Content-Type': 'application/x-www-form-urlencoded'
		// 	    },
		// 	    data: $httpParamSerializerJQLike({
		// 	      grant_type: 'authorization_code',
		// 	      code: authCode,
		// 	      client_id: clientIdSmartThings,
		// 	      client_secret: secretSmartThings,
		// 	      redirect_uri: redirectUrl
		// 	    })
		// 	  })
		// 	  .success(function (data) {
		// 	    $log.log("validated token successfully");
		// 	    userInfo=data;
		// 	  })
		// 	  .error(function (req, status, error) {
		// 	    $log.log("Failed to validate token: ", status, error);
		// 	    userInfo=null;
		// 	    token=null;
		// 		if (isSessionStorageSupported) {
		// 			$window.sessionStorage.userInfo = JSON.stringify(userInfo);
		// 			$window.sessionStorage.token = JSON.stringify(token);
		// 		}
		// 	  });
		// }

		function checkTokenGrant(returnTo) {
			$log.log("checking access token in location hash");
			// First, parse the query string

			// if ($window.location.hash === "") {
			// 	if ($window.location.href.length > 0) {
   //       			var deviceData = store.get('deviceData')
   //       			if (deviceData) {
   // 					  var i = $window.location.href.indexOf("code=");
			// 		  var authCode = $window.location.href.substring(i+5);
			// 		  deviceData.authCodePromise.resolve(authCode);
			// 		  store.remove('deviceData');
			// 		  store.set('deviceData',deviceData);
			// 		}
			// 	}
			// }

			var params = {}, queryString = $window.location.hash.substring(1),
			    regex = /([^&=]+)=([^&]*)/g, m;
			while (m = regex.exec(queryString)) {
			  params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}
			$window.location.hash='';

			// Verify that we have a token grant
			if (params['/access_token']) {
			  // remove hash fragments from location
			  $log.log("found access_token in hash, validating it");
			  validateToken(params['/access_token'], returnTo);
			} else if (params['error']){
			  $log.log("Token authorization failed: ", params['error_description']);
			}
		}


		return {
			devPortalProjectId: devPortalProjectId,
			idotProjectId: idotProjectId,
			redirectUrl: redirectUrl,
			// call this method at the startup/page load to initialize
			idpInitialize: function(returnTo) {
				$log.log('idp library initializing');
				checkTokenGrant(returnTo);
			},
			// get current access token, e.g., to talk to backend service
			getToken: function() {
				if (this.isAuthenticated()) {
					return token;					
				} else {
					return null;
				}
			},
			// get current authenticated user
			getUser: function() {
				if (this.isAuthenticated()) {
					return {
						firstName: userInfo['given_name'],
						lastName: userInfo['family_name'],
						roles: userInfo['org_roles'],
						org: userInfo['org_id']
					};					
				} else {
					return null;
				}
			},
			// intiate a login explicitly
			idpLogin: function(onSuccess) {
				$log.log('idp login called');
				if (!this.isAuthenticated()) {
				  $log.log("User is not authenticated");
				  requestAccessToken(clientId, 'token', 'http://'+$window.location.hostname+$window.location.pathname);
				} else {
				  $log.log("User is already authenticated");
				  onSuccess();
				}
			},
			// initiate a logout explicitly
			idpLogout: function() {
				$log.log("logging out user");
			    userInfo=null;
				if (isSessionStorageSupported) {
					$window.sessionStorage.userInfo = JSON.stringify(userInfo);
				}
			    token=null;
			},
			smartThingsLogin: function(clientId, onSuccess) {
              $log.log('smartThings login called');
		      //
	          // SmartThings authorize uri for getting auth code:
              //
              // GET https://graph.api.smartthings.com/oauth/authorize?
              // response_type=code&
              // client_id=YOUR-SMARTAPP-CLIENT-ID&
              // scope=app&
              // redirect_uri=YOUR-SERVER-URI
              //
              var type = 'code';
              var scope = 'app';
			  requestAccessTokenSmartThings(smartThingsHost,clientId,type,scope,redirectUrl);
			},
			// check if user is authenticated and token is not expired
			isAuthenticated: function () {
				return userInfo && userInfo.exp * 1000 > Date.now();
			},
			// check if user is authorized with specified role for the org
			isAuthorized: function(role, org) {
				if (!this.isAuthenticated()) {
					return false;
				}
				return (!role || $.inArray(role, userInfo['org_roles']) !== -1) && (!org || org == userInfo['org_id']);
			}
		};
	});
})();