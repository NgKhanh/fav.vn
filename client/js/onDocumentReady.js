loadTopAlbumList =function(){	
	Meteor.subscribe(	'Album', loadStep,
						function () {
							onDocumentReady();
							appendAlbumList();
							Backbone.history.start({pushState: true});
						});
						
	Meteor.call('getCurrentTime',function(err,res){
		console.log("YOU JOIN THIS APP AT", res);
		joinTime = res;
	})
}

getMyAlbum = function(){
	Meteor.subscribe(	'myAlbum',Meteor.user().username,
						function () {
							
							console.log("subscribe My Album");
							
							$("#myAlbumList").html("");
							
							var myAlbumTemp = Meteor.renderList(
								Album.find({"owner.username":Meteor.user().username},{sort:{createTime:-1}}),			
								function(album) {	
									if(album.title)	album.alias  	= "a/"+title2Alias(album.title) +"."+album._id;
										album.timeAgo 	= timeAgo(album.createTime);	
										album.length    = album.numSong;
										album.users		= Meteor.users.find({currentRoom:album._id}).count();
									return Template["albumItem"](album);
							});	
							
							$("#myAlbumList").append(myAlbumTemp);	
						});
						
	// hiện label
	$("#myPlLabel").css("display","block");
}


onDocumentReady = function (templatePage) {  
	currentPath = window.location.pathname;
	initTypeAHead();
	
	
	$("#page2").css("height",$("#PageContainer").height());
	$("#page1").css("height",$("#PageContainer").height());	
	
	$('#albumList').slimScroll({
		width: '540px',		
		height: '470px',
		position:'left',
		wheelStep : 30
	});
	
	$("#page2 .header").click( function(){
		Router.navigate('',{trigger: true}); 
	});
		
	// show PageContainer
	$("#MainContainer").transition({opacity:1});
	
	

	window.onfocus = function () { isActive = true; document.title = defaultTitle }; 
	window.onblur = function () { isActive = false; }; 

	$("#notification").click(function(){
		$("#notification").hide();
		if(Session.get("currentRoom")!=""){
			if(Session.get('currentSong')!='')
				Router.navigate($("#showAlbum").attr("href")+'/'+Session.get('currentRoom'),{trigger: true});  
			else 
				Router.navigate($("#showAlbum").attr("href"),{trigger: true});  
		}
			 
	});
	

	console.log("ON READY");
}


appendAlbumList =function(){	
	
	if(Meteor.user()){
		var templatePost = Meteor.renderList(
			Album.find({'owner.username':{ $ne: Meteor.user().username }},{	sort:{createTime:-1}}),			
			function(album) {	
				if(album.title)	album.alias  	= "a/"+title2Alias(album.title) +"."+album._id;
								album.timeAgo 	= timeAgo(album.createTime);	
								album.length    = album.numSong;
								album.active  	= album._id == Session.get("reviewRoom")?true:false;
								album.users		= Meteor.users.find({currentRoom:album._id}).count();
			return Template["albumItem"](album);	   
			    
		});	
		getMyAlbum();
	}else{
		var templatePost = Meteor.renderList(
			Album.find({},{	sort:{createTime:-1}}),			
			function(album) {	
				if(album.title)	album.alias  	= "a/"+title2Alias(album.title) +"."+album._id;
								album.timeAgo 	= timeAgo(album.createTime);	
								album.length    = album.numSong;
								album.active  	= album._id == Session.get("reviewRoom")?true:false;
								album.users		= Meteor.users.find({currentRoom:album._id}).count();
			return Template["albumItem"](album);	   
			    
		});	
	}
	
	$("#realTimeAlbumList").append(templatePost);	
}

gotoAlbum = function(_albumID){
		
	//userJoinRoom(_albumID);
	
	
	if(Song.find({albumID:_albumID}).count()>0 ||  Message.find({roomID:_albumID}).count()>0){
		userJoinRoom(_albumID);
	}else{		
		Meteor.subscribe('OneAlbum', _albumID, function () {
			userJoinRoom(_albumID);
		})
	}
	
}

userJoinRoom=function(_albumID){

	onRoom = true;
	
	// show Room				
	$("#page2").transition({y:0},function(){$("#page2").css('transform','none')});
	$("#page1").transition({y:0});
	$("#Nav").transition({x:0});
	
	if(_albumID!='' && _albumID==Session.get('currentRoom')){return false;}
		
	if(Meteor.userId()){		
		Meteor.call('ImJoinRoom',_albumID,function(err,res){
			console.log(Meteor.user().profile.name, "login room");			
		});
	}else{
		console.log('Update mot guest vao list user room');
	}	
		
	if(_albumID!='' && _albumID!=Session.get('currentRoom')){
		
		var _album =  Album.findOne({_id: _albumID});
			_album.alias   = AbsoluteUrl() + "a/"+title2Alias(_album.title) +"."+_album._id;    
			_album.timeAgo = timeAgo(_album.createTime);
		
		// admin room ?		
		if(Meteor.userId() && Meteor.user().profile.username==_album.owner.username){	
			// đổi quyền chủ phòng lại cho user này > update server để thông báo cho những người khác
			Meteor.call("updateAdminRoom",_albumID,function(err,res){
				Session.set("isAdmin",true);				
			});
		}
		else 
			Session.set("isAdmin",false);
		
		
		// vao phong chat khac;		
		// xoa het noi dung trong phong chat
		$('#chatlist #realtimeChat li').remove();		
		// current Room
		Session.set('currentRoom',_albumID);		
		//Session.set('reviewRoom','');
		
	}	
	
}

openReview=function(_albumID){
	
	if(Session.get('reviewRoom')==_albumID){
		$("#Nav").transition({x:0},function(){
			Session.set('reviewRoom','');
		});		
	}else{
		
		$("#Nav").transition({x:-$("#Nav").width(),delay:500});
		
		if(Song.find({albumID:_albumID}).count()>0 ||  Message.find({roomID:_albumID}).count()>0){
			Session.set('reviewRoom',_albumID);		
		}else{		
			Meteor.subscribe('OneAlbum', _albumID, function () {			
				Session.set('reviewRoom',_albumID);		
			})
		}
	}
}


parseMp3Source = function(_id, _domain){
	var arr=[	"http://mp3.zing.vn/html5/song/LncHTLnaBNRzSVCytbmLn"
				,"http://mp3.zing.vn/html5/song/ZGcnyLnNBiSQCEJttvHkn"
				,"http://mp3.zing.vn/html5/song/ZncHyLHNdNhgslxTTbGZn"
				,"http://mp3.zing.vn/html5/song/LHxmyLmNdsADHCWytDGkG"
				,"http://mp3.zing.vn/html5/song/LmJGykmsVsAaEBpyyvHZn"
				,"http://s82.stream.nixcdn.com/9c0a2d958a136f7645aabb6d8c48b733/51c98b4c/NhacCuaTui829/BienCan-LeQuyenUyenLinh-2454494.mp3"
	]
	var ran = parseInt(Math.random()*arr.length);
	return arr[ran];
}



returnHome = function(){
	onRoom = false;
	$("#page2").transition({y:-$("#page2").height()});
	$("#page1").transition({y:-$("#page1").height()});
	$("#Nav").transition({x:-$("#Nav").width()});
	
	if(Session.get('reviewRoom')!=Session.get('currentRoom'))
		Session.set('reviewRoom',Session.get('currentRoom'));
}

notiSound = function() {
    $("#notiSound").remove();
    $('body').append('<embed id="notiSound" autostart="true" hidden="true" src="https://christiaanconover.com/wp-content/uploads/2011/03/GTalkNotify.mp3" />');
}



getCoverAlbum = function(_genre){
	_genre = title2Alias(_genre);
	
	switch(_genre){
		
		case "tonghop":
		case "tong-hop":
			return "/covers/nhactre.jpg"; break
			
		case "nhactrinh":
		case "nhac-trinh":
			return "/covers/Trinh1.jpg"; break
			
		case "trutinh":
		case "tru-tinh":
			return "/covers/trutinh2.jpg" || "/covers/trutinh2.png"; break;
			
		case "nhactre":
		case "nhac-tre":
			return "/covers/nhactre.jpg"; break;
		
		case "nhacvang":
		case "nhac-vang":
			return "/covers/nhacvang1.jpg" || "/covers/nhacvang.jpg"; break;		
		
		case "nhacdo":
		case "nhac-do":
			return "/covers/nhac-do.jpg"; break;		
		
		case "cailuong":
		case "cai-luong":
			return "/covers/cai-luong.jpg"; break;
			
		case "rock":		
			return "/covers/rock3.jpg" || "/covers/rock2.jpg"||  "/covers/rock1.jpg"; break;
			
		case "piano":		
			return "/covers/piano.jpg"; break;
		
		case "guitar":		
			return "/covers/guitar.jpg"; break;
		
		default:
			return "/covers/cover.jpg";break;
		
	}
}
