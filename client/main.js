Template.albumItem.created=function(){
	if(this.data)console.log("on create > albumItem ",this.data.title);
}

Template.albumItem.rendered=function(){
	if(this.data){
		console.log("on rendered > albumItem ",this.data.title);
		$('#albumList').tinyscrollbar_update();
	}
}

Template.albumItem.events = {
	'click .playListItem':function(e){
		e.preventDefault();	
		gotoAlbum($(e.currentTarget).find(".albump").attr("room-id"));			
		//Router.navigate($(e.currentTarget).attr("href"),{trigger: true});   
	}
}

/**
#################################################################################
*/

/**

Template.albumDetail.rendered=function(){
	console.log("-------------------------> Render albumDetail");

	if(Session.get("currentSong")==-1){
		Session.set("currentSong",0);
	}
}

Template.albumDetail.info=function(){
	
	if(Session.get("currentRoom")=="")return null;
	
	var _album =  Album.findOne({_id:Session.get("currentRoom")});

	var _info = {};
		_info.title 	= _album.title;
		_info.timeAgo 	=  timeAgo(_album.createTime);
		_info.owner 	= _album.owner;
		_info.genre 	= _album.genre;

		console.log(" --- > playlistInfo get info ",_info);
		
	return _info;
}


Template.albumDetail.song=function(){
	if(Session.get("currentRoom")=="")return null;
	
	var _playlist = Album.findOne({_id:Session.get("currentRoom")}).playlist;
	if(_playlist.length==0 || Session.get("currentSong") < 0) return;
	return _playlist[Session.get("currentSong")];
}

Template.albumDetail.albumList=function(){
	if(Session.get("currentRoom")=="")return null;
	return Album.findOne({_id:Session.get("currentRoom")}).playlist;
	//return  Album.findOne({_id:Session.get("currentRoom")});	
}

#################################################################################
*/

Template.playlistInfo.data=function(){
	if(Session.get("currentRoom")=="")return null;
	
	var _album =  Album.findOne({_id:Session.get("currentRoom")});
	var _info = {};
		_info.title 	= _album.title;
		_info.timeAgo 	=  timeAgo(_album.createTime);
		_info.owner 	= _album.owner;
		_info.genre 	= _album.genre;
		_info.length 	= _album.playlist.length;
		
		console.log(" --- > playlistInfo get data ",_info);
		
	return _info;
}

Template.playlistInfo.created=function(){
	console.log(" --- > playlistInfo Created");
}

Template.playlistInfo.rendered=function(){
	console.log(" --- > playlistInfo Rendered");
}

/**
##############################################################################################
*/

Template.video.source = function(){	
	return Session.get("currentSongSource");
}

Template.video.created = function(){	
	console.log("-------> video created");
}

Template.video.rendered = function(){
	console.log("-------> video rendered");
	setTimeout(function(){
		var myVideo=document.getElementById("myVideo"); 			
			myVideo.load();
			myVideo.play();
			myVideo.addEventListener('ended',nextSong,false);
	},500);
}

/**
##############################################################################################
*/
Template.songInfo.data = function(){		
	if(Session.get("currentRoom")=="")return null;	
	var _playlist = Album.findOne({_id:Session.get("currentRoom")}).playlist;
	if(_playlist.length==0) return;
	if(Session.get("currentSong")<0){
		Session.set("currentSong",0);
		Session.set("currentSongSource",_playlist[Session.get("currentSong")].source);
	}
	console.log("-----> songInfo update data");
	return _playlist[Session.get("currentSong")];
}

Template.songInfo.created = function(){		
	console.log("-----> songInfo created");
}

Template.songInfo.rendered = function(){		
	console.log("-----> songInfo rendered");
}

/**
##############################################################################################
*/

Template.playlist.data=function(){	
	if(Session.get("currentRoom")=="")return null;		
	
	var playlist =  Album.findOne({_id:Session.get("currentRoom")}).playlist;	
	var arr=[];
	var song;
	for (var i=0;i<playlist.length;i++) {
		song 		= playlist[i]
		song.id		= i;
		song.index	= i+1;
		song.timeAgo= timeAgo(song.createTime);	
		arr.push(song);
	}	
	return arr;
}

Template.playlist.created=function(){	
	console.log("-------------------------> playlist created");
}

Template.playlist.rendered=function(){	
	$('#albumPlaylist .viewport').css("height",$("#PageContainer").height()-260);
	$('#albumPlaylist').tinyscrollbar();
	$('#albumPlaylist').tinyscrollbar_update('bottom');
	
	activePlaylistItem();
}

/**
#################################################################################
*/

Template.playlistItem.created=function(){	
	//console.log("playlistItem created",this.data.title);
}

Template.playlistItem.rendered=function(){	
	//console.log(" >> playlistItem rendered",this.data.title);
}

Template.playlistItem.destroyed=function(){	
	console.log(" >>Template.playlistItem.destroyed");
}

Template.playlistItem.events = {
	'click li':function(e){
		e.preventDefault();		
		
		Session.set("currentSong", parseInt($(e.currentTarget).attr("id")) );
		Session.set('currentSongSource',$(e.currentTarget).attr("data-source"));
		
		console.log("click to play",Session.get("currentSong"));
		
		activePlaylistItem();
				
	}
}

Template.chatInput.events = {
	'keydown #chatInput':function(e){
		if(e.keyCode==13){			
			// send content to chat
			Meteor.call("chat", $(e.currentTarget).val() , Session.get("currentRoom"), Session.get("currentSong"), function(err, res){
				if(res){
					// chat thanh cong
					//console.log("Chat ok", res);					
				}else{}
			})
			
			$(e.currentTarget).val('');
			
			// chan enter line
			e.preventDefault();
		}		
	}
}

Template.chatlist.data=function(){
	if(!Session.get("currentRoom"))return;
	
	var _arr = Message.find({roomID:Session.get("currentRoom"),objectID:Session.get("currentSong")},{sort:{createTime:1}}).fetch();
	
	if(_arr.length < 1) return [];
	
	var _chat = _arr[0];
		_chat.avatar = "img/avatar.jpg";
		_chat.msg=[];
		_chat.msg.push(_chat.message);
		
	var _listChat=[];
		_listChat.push(_chat);
		
	for(var i = 1;i<_arr.length;i++){
		_chat = _arr[i];
		_chat.avatar = "img/avatar.jpg";
		if(_chat.owner == _listChat[_listChat.length-1].owner){
			_listChat[_listChat.length-1].msg.push(_chat.message);
		}else{
			_chat.msg=[];
			_chat.msg.push(_chat.message);
			_listChat.push(_chat);
		}
	}	
	
	return _listChat;
}

Template.chatlist.rendered=function(){
	
	console.log("-----------> rendered chatlist");
	
	//$('#chatlist .viewport').css("height",$("#PageContainer").height()-260);
	$('#chatlist').tinyscrollbar();
	$('#chatlist').tinyscrollbar_update('bottom');	
}

Template.messageChat.created=function(){
	if(this.data){
		console.log("-----------> messageChat created");
		/*this.data.avatar = "img/avatar.jpg";
		
		// find last chat
		var li = $('#chatlist ul li').last();
		var info = li.find(".info");
		var username = info.attr("username");
		
		if(username==this.data.owner){
			li.find(".message").append('<p>'+this.data.message+'</p>');			
		}*/
	}
}

Template.messageChat.rendered=function(){
	if(this.data){
		console.log("-----------> messageChat rendered");			
		$('#chatlist').tinyscrollbar_update('bottom');		
	}
}
/**
#################################################################################
*/

Template.createAlbumForm.events={
	'click #saveBtn':function(e){
		e.preventDefault();

		
		// Chỉ được tạo album nếu đăng nhập
		if(Meteor.userId()){
			var _album={};
				_album.title = $("#createAlbumForm #title").val();
				_album.genre = $("#createAlbumForm #genre").val();
				_album.policy= parseInt($('input:radio[name=policy]:checked').val());
				_album.owner = Meteor.user().profile.name;

			Meteor.call("createAlbum", _album,function(err,res){
				if(res){				
					// close modal
					$('#createAlbumForm').modal('hide')
				}			
			});
		}
	}
}


Template.animationBG.rendered=function(){
	
	$(".cloud").each(function(i){
		
		console.log("render cloud",i);
		
		
		var _scale  = 0.7 + Math.random();
		var _opacity = Math.min(0.8, 0.7 + _scale - 1);
		var _ran	= $(window).width()*Math.random();
		var _time 	= (20 + 10*Math.random())/_opacity;
		var _depth  = parseInt(20*_opacity);
		var _blur   = 30 - _depth;
		var _css = { 
						"left"				: (i-1) * (60 + Math.random() * 60) + "px"
						,"top"				:  Math.random() * $(window).height() + "px"
						
						//,"box-shadow"		: "0px 0px "+_blur+"px " +_blur+"px rgba(255,255,255,1)"
						,"opacity"			:_opacity
						,"-webkit-transform": "scale("+_scale+")"
						,"-moz-transform"	: "scale("+_scale+")"
						,"transform"		: "scale("+_scale+")"
						
						/*,"-webkit-animation": "moveclouds "+_time+"s linear infinite"
						,"-moz-animation"	: "moveclouds "+_time+"s linear infinite"
						,"-o-animation"		: "moveclouds "+_time+"s linear infinite"*/
						,"position"			: "absolute"
						,"z-index"			: _depth
		};
		$(this).css(_css);
	})
	
}


Template.currentRoomLogged.data= function(){
	if(Session.get("currentRoom")=="")return null;
	
	var _album =  Album.findOne({_id:Session.get("currentRoom")});
	var _info = {};
		_info.title 	= _album.title;
		_info.timeAgo 	=  timeAgo(_album.createTime);
		_info.owner 	= _album.owner;
		_info.genre 	= _album.genre;
		_info.length 	= _album.playlist.length;
	return _info;
}

Template.currentRoomLogged.events={
	'click #showAlbum':function(e){
		e.preventDefault();
		// show Room				
		$("#page2").transition({y:-$("#page1").height()});
		$("#page1").transition({y:-$("#page1").height()});
		$("#Nav").transition({x:-$("#Nav").width()});
	}
}
		
/**
#################################################################################
*/


// start-up when load all js
Meteor.startup(function () {
	 
	Session.set('currentPage',"home");	 
	//Backbone.history.start({pushState: true});
	loadTopAlbumList();	
});