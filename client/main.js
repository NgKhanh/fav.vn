Template.albumItem.created=function(){
	//if(this.data)console.log("on create > albumItem ",this.data.title);
}

Template.albumItem.rendered=function(){
	if(this.data){
		//console.log("on rendered > albumItem ",this.data.title);
		$('#albumList').tinyscrollbar_update();
	}
}

Template.albumItem.events = {
	'click .albumItem':function(e){
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
		_album.timeAgo 	=  timeAgo(_album.createTime);		
		_album.length 	= _album.numSong;
		_album.cover 	= (_album.cover)?_album.cover:getCoverAlbum(_album.genre);
		_album.isAdmin   = Session.get("isAdmin");
		
	return _album;
}

Template.playlistInfo.created=function(){
	//console.log(" --- > playlistInfo Created");
}

Template.playlistInfo.rendered=function(){
	//console.log(" --- > playlistInfo Rendered");
}

Template.playlistInfo.events = {
	'keydown #changeCover':function(e){				
		if(e.keyCode==13){			
			if($(e.currentTarget).val()!="")
				Meteor.call("updateAlbumCover",$(e.currentTarget).val(),Session.get("currentRoom"));
		}	
	}
	
	,'click #changeCover':function(e){	
		$(e.currentTarget).select();
	}
}

/**
##############################################################################################
*/

Template.video.source = function(){	
	return Session.get("currentSongSource");
}

Template.video.created = function(){	
	//console.log("-------> video created");
}

Template.video.rendered = function(){
	//console.log("-------> video rendered");
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
	if(Session.get("currentRoom")=="" || Session.get("currentSong")=="")return null;	
	if(listSongInMyListeningAlbum.length==0) return;
	return Song.findOne({_id:Session.get("currentSong")});
}

Template.songInfo.created = function(){		
	//console.log("-----> songInfo created");
}

Template.songInfo.rendered = function(){		
	//console.log("-----> songInfo rendered");
}

/**
##############################################################################################
*/

Template.playlist.data=function(){	
	if(Session.get("currentRoom")=="")return null;		
	
	var playlist = Song.find({albumID:Session.get("currentRoom")}).fetch();
	listSongInMyListeningAlbum = [];
	var song;
	for (var i=0;i<playlist.length;i++) {
		song 		= playlist[i];		
		song.index	= i;
		song.index1 = i+1;
		song.isAdmin = Session.get("isAdmin");
		song.timeAgo= timeAgo(song.createTime);	
		listSongInMyListeningAlbum.push(song);
	}	
	return listSongInMyListeningAlbum;
}

Template.playlist.created=function(){	
	//console.log("-------------------------> playlist created");
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
	//console.log(" >>Template.playlistItem.destroyed");
}

Template.playlistItem.events = {
	'click li':function(e){
		e.preventDefault();		
		
		console.log("click to play",Meteor.userId(),Session.get("isAdmin"));
		
		if(Meteor.userId()==null){
			// chưa đăng nhập > cho phép nghe tự do
			Session.set("currentSong", $(e.currentTarget).attr("id"));
			Session.set('currentSongSource',$(e.currentTarget).attr("data-source"));
			activePlaylistItem();
		}else{
			if(Session.get("isAdmin")==false) return false;
			
			if($(e.target).attr("class")=="remove"){
				console.log("remove song from playlist",$(e.target).attr("id"));
				Meteor.call("removeSongFromPlaylist", $(e.target).attr("id"),Session.get("currentRoom"));
			}else{
				console.log(" --->  play",$(e.currentTarget).attr("id"));
				Session.set("currentSong", $(e.currentTarget).attr("id"));
				Session.set('currentSongSource',$(e.currentTarget).attr("data-source"));
				activePlaylistItem();
			}	
		}		
	}
}

Template.chatInput.events = {
	'keydown #chatInput':function(e){
		if(e.keyCode==13){	
			
			if(!Meteor.userId()){
				// not loggin > requires login
				$('.modal').modal('show');
				return false;
			}
			
			//console.log("submit chat ",$(e.currentTarget).val(), $(e.currentTarget).val()=="");
			// send content to chat
			if($(e.currentTarget).val()!=""){
				Meteor.call("chat", $(e.currentTarget).val() , Session.get("currentRoom"), Session.get("currentSong"), function(err, res){
					if(res){
						// chat thanh cong
						//console.log("Chat ok", res);					
					}
				})				
				$(e.currentTarget).val('');
			}	
			
			// chan enter line
			e.preventDefault();
		}		
	}
	,'click #chatInput':function(e){		
		if(!Meteor.userId()){
			// not loggin > requires login
			$('.modal').modal('show');
			return false;
		}
	}
}

Template.oldchat.data=function(){
	if(Session.get("currentRoom")=="")return null;
	
	var _arr =  Message.find({roomID:Session.get("currentRoom"),createTime:{$lt:joinTime}},{sort:{createTime:1}}).fetch();
	
	if(_arr.length < 1) return [];	
	var _chat = _arr[0];	
	var _listChat=[];
		_listChat.push(_chat);
		
	for(var i = 1;i<_arr.length;i++){
		_chat = _arr[i];		
		if(_chat.owner.username == _listChat[_listChat.length-1].owner.username){
			_listChat[_listChat.length-1].message += '<p>'+_chat.message+'</p>';
		}else{			
			_listChat.push(_chat);
		}
	}	
	
	return _listChat;
}

Template.realtimeChat.data=function(){
	if(Session.get("currentRoom")=="")return null;
	return Message.find({roomID:Session.get("currentRoom"),createTime:{$gt:joinTime}},{sort:{createTime:1}});
}

Template.realtimeChat.rendered=function(){	
	$('#chatlist').tinyscrollbar({ sizethumb: 50});
	$('#chatlist').tinyscrollbar_update('bottom');	
}

Template.messageChat.created=function(){
	if(this.data){
		//console.log("-----------> messageChat created");
		
		var li = $('#chatlist #realtimeChat li').last();
		var info = li.find(".info");
		var username = info.attr("username");
		
		if(this.data.owner.username==username){			
			li.find(".message").append('<p>'+this.data.message+'</p>');			
			this.data.message = "";
		}		
	}
}

Template.messageChat.rendered=function(){
	if(this.data){
		if(this.data.message==""){
			$("#"+this.lastNode.id).remove();
		}
		
		$("#"+this.lastNode.id +" .thumbnail").popover({"content":'<a href="https://www.facebook.com/'+this.data.owner.username+'" target="_blank">Xem profile trên facebook</a>',"html":true});
	}
}

Template.tablist.events={
	'click li':function(e){
		
		switch($(e.currentTarget).attr("id")){
			case "memberTab": break;
				
			
			case "playlistTab":				
				setTimeout(function(){
					$('#albumPlaylist').tinyscrollbar({ sizethumb: 50});
					$('#albumPlaylist').tinyscrollbar_update();
				},200);
			break;
			
			case "chatTab":
				setTimeout(function(){
					$('#chatlist').tinyscrollbar({ sizethumb: 50});
					$('#chatlist').tinyscrollbar_update('bottom');	
				},200);
			break;
			
		}
		
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
			
			/*console.log("1.genre",$("#createAlbumForm #genre option:selected").val());
			console.log("2.genre",$("#createAlbumForm #genre option:selected").attr("value"));
			console.log("3.genre",$("#createAlbumForm #genre").attr("value"));
			console.log("4.genre", $("#createAlbumForm #genre").val());
			console.log("5.genre", $("#createAlbumForm #genre option:selected").text());*/
			
			var _album={};
				_album.title = $("#createAlbumForm #title").val();
				_album.genre = $("#createAlbumForm #genre option:selected").text();
				_album.policy= parseInt($('input:radio[name=policy]:checked').val());
				_album.owner = Meteor.user().profile.name;
				_album.cover = getCoverAlbum(_album.genre);

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
				
		var _scale  = 0.7 + Math.random();
		var _opacity = Math.min(0.8, 0.7 + _scale - 1);
		var _ran	= $(window).width()*Math.random();
		var _time 	= (20 + 10*Math.random())/_opacity;
		var _depth  = parseInt(20*_opacity);
		var _blur   = 30 - _depth;
		var _css = { 
						"left"				: (i-1) * (60 + Math.random() * 60) + "px"
						,"top"				:  Math.random() * $(window).height() + "px"
						
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
		_info.length 	= _album.numSong;
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