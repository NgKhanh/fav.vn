Accounts.onCreateUser(function(options, user) {

	////////////////////////////////////////////////
	var _profile = {};

	var _service = user.services.google;

	if(_service){
		_profile.username 	= _service.email.substring(0,_service.email.lastIndexOf("@"));
		_profile.picture 	= _service.picture;

	}else {
		_service = user.services.facebook;
		_profile.username 	= _service.username;
		_profile.picture 	= "https://graph.facebook.com/"+_service.id+"/picture";//?type=large";
	}
		
		_profile.id 		= _service.id;		
		_profile.name 		= _service.name;
		_profile.email 		= _service.email;
		_profile.link 		= _service.link;	
		_profile.gender 	= _service.gender;
		_profile.locale 	= _service.locale;

	user.role 		= "";
	user.username 	= _profile.username;
	user.profile 	= _profile;
	user.currentRoom= "";
	user.online		= 1;

	console.log("################### profile user #############################" );
	console.log(user);
	console.log("################### End profile user #########################");

	return user;

});


getUserFromFacebook = function(options,user){

	var accessToken = user.services.facebook.accessToken;

	var result = Meteor.http.get("https://graph.facebook.com/me",{ 
					params:{ access_token:accessToken}
				});

	if(result.error)
  		throw result.error;
  	
  	result.data.avatar = "https://graph.facebook.com/"+result.data.id+"/picture ";
  	user.profile = result.data;

	return user ;
};