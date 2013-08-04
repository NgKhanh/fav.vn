loadTopAlbumList =function(){	
	Meteor.subscribe('OnlineUser');
	
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
										album.myOwn		= true;
									return Template["albumItem"](album);
							});	
							
							$("#myAlbumList").append(myAlbumTemp);	
						});
						
	// hiện label
	$("#myPlLabel").css("display","block");
}


onDocumentReady = function (templatePage) {  
	currentPath = window.location.pathname;
		
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
		
	// Nếu trở lại phòng hiện tại > Không cần là subscribe, chỉ cần hiện lại phòng
	if(_albumID!='' && _albumID==Session.get('currentRoom')){		
		returnRoom();
		return false;
	}		
	
	
	// Kiểm tra xem phòng này đã được subscribe chưa
	if(Song.find({albumID:_albumID}).count()>0 ||  Message.find({roomID:_albumID}).count()>0){
		ImJoinRoom(_albumID);
	}else{	
		// Nếu chưa thì bắt đầu subscribe
		Meteor.subscribe('OneAlbum', _albumID, function () {
			ImJoinRoom(_albumID);
		})
	}	
}

ImJoinRoom=function(_albumID){
	
	var _album =  Album.findOne({_id: _albumID});
	
	// Nếu không tìm thấy phòng này > báo lỗi
	if(_album==undefined){
		console.error("Không tìm thấy phòng này");
		return false;
	}
	
	Meteor.call('ImJoinRoom',_albumID,function(err,res){		
		returnRoom();		
		// Update currentRoom
		Session.set('currentRoom',_albumID);
		
		// Tự động tìm và play bài hát
		if(_album.currentSong!=''){				
			Session.set('currentSong', _album.currentSong);
			playCurrentSong();
		}
	});	
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

returnRoom=function(){
	// show Room				
	$("#page2").transition({y:0},function(){$("#page2").css('transform','none')});
	$("#page1").transition({y:0});
	$("#Nav").transition({x:0});
	
	// Vào phòng
	onRoom = true;
	
	
	// Xóa hết nội dung phòng chat để cập nhật mới
	$('#chatlist #realtimeChat li').remove();	
		
	
	// Nếu đang edit > remove nó đi
	Session.set('edit',false);
	// Trở lại playlist
	$('#page2 #gallery').show();
	
}

returnHome = function(){
	onRoom = false;
	$("#page2").transition({y:-$("#page2").height()});
	$("#page1").transition({y:-$("#page1").height()});
	
	if(Session.get('reviewRoom')!=Session.get('currentRoom'))
		Session.set('reviewRoom',Session.get('currentRoom'));
		
	Session.set('edit',false);
}

notiSound = function() {
    $("#notiSound").remove();
    $('body').append('<embed id="notiSound" autostart="true" hidden="true" src="https://christiaanconover.com/wp-content/uploads/2011/03/GTalkNotify.mp3" />');
}

isAdmin = function(){
	var room = Album.findOne({_id:Session.get('currentRoom')});
	if(room && Meteor.userId() && Meteor.user().username == room.owner.username){
		return true;
	}else{
		console.error("You have not permission!");
		return false;
	}
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
