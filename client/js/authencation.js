/**
#################################################################################
*/
Template.noLoggInForm.events={
	'click .loginIco':function(e){
		e.preventDefault();		
		console.log("--> login by facebook");		
		Meteor.call("requireLoginWithFacebook");
	}
}


Template.loggInForm.events={
	'click .thumbnail':function(e){
		e.preventDefault();		
		console.log("--> logout");
		Meteor.logout();
	}
}

/**
#################################################################################
*/
Meteor.methods({
	requireLoginWithFacebook:function(){
		Meteor.loginWithFacebook({
			requestPermissions:["email","publish_actions"]
		},function(err){
			if(err){
				console.log("login loginWithFacebook is err ",err);
			}else{
				console.log("login loginWithFacebook >>>>> ");
			}

		})
	}
})