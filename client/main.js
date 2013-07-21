Template.albumItem.created=function(){
	//if(this.data)console.log("on create > albumItem ",this.data.title);
}

Template.albumItem.rendered=function(){
	if(this.data){
		//console.log("on rendered > albumItem ",this.data.title);
		$('#albumList').slimScroll({
			width: '540px',		
			height: '495px'
		});
	}
}

Template.albumItem.events = {
	'click .albumItem':function(e){
		e.preventDefault();	
		//gotoAlbum($(e.currentTarget).find(".albump").attr("href"));			
		
		if(Session.get("reviewRoom")!=$(e.currentTarget).find(".albump").attr("room-id"))
			openReview($(e.currentTarget).find(".albump").attr("room-id"));
		else	
			Router.navigate($(e.currentTarget).find(".albump").attr("href"),{trigger: true}); 
	}
}

/**
#################################################################################
*/


Template.playlistInfo.info=function(){
	if(Session.get("currentRoom")=="")return null;
	
	var _album =  Album.findOne({_id:Session.get("currentRoom")});	
		_album.timeAgo 		=  timeAgo(_album.createTime);		
		_album.length 		= _album.numSong;
		_album.cover 		= (_album.cover)?_album.cover:getCoverAlbum(_album.genre);
		_album.isAdmin   	= Session.get("isAdmin");		
		_album.url   		= AbsoluteUrl() + "a/"+title2Alias(_album.title) +"."+_album._id;    
	return _album;
}

Template.playlistInfo.created=function(){
	//console.log(" --- > playlistInfo Created");
}

Template.playlistInfo.rendered=function(){
	if(Session.get("currentRoom")=="")return null;
	var _album 		=  Album.findOne({_id:Session.get("currentRoom")});	
		_album.url  = AbsoluteUrl() + "a/"+title2Alias(_album.title) +"."+_album._id;  
		
	var fbLikeDiv = $("#fbLike");	
		fbLikeDiv.html('');
		fbLikeDiv.html('<div class="fb-like" data-href="'+_album.url+'" data-send="true" data-layout="button_count" data-width="450" data-show-faces="false"></div>');
		if(FB)FB.XFBML.parse(fbLikeDiv[0]); 
	
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
		song 				= playlist[i];		
		song.index			= i;
		song.index1 		= i+1;
		song.isAdmin 		= Session.get("isAdmin");
		song.allowRemove  	= (Session.get("isAdmin") || (Meteor.user() && Meteor.user().username == song.shareBy.username))?true:false;		
		song.timeAgo		= timeAgo(song.createTime);	
		listSongInMyListeningAlbum.push(song);
	}	
	return listSongInMyListeningAlbum;
}

Template.playlist.created=function(){	
	//console.log("-------------------------> playlist created");
}

Template.playlist.rendered=function(){
	
	console.log("-------------------------> Template.playlist.rendered");
	
	$('#albumPlaylist').slimScroll({			
		height: '355px'
	});
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
		
		console.log("Template.playlistItem.events --> ",$(e.target).attr("class"),Session.get("isAdmin"));
		
		if(Meteor.userId()==null){
			// chưa đăng nhập > cho phép nghe tự do
			Session.set("currentSong", $(e.currentTarget).attr("id"));
			Session.set('currentSongSource',$(e.currentTarget).attr("data-source"));
			activePlaylistItem();
		}else{
			//if(Session.get("isAdmin")==false) return false;
			
			if($(e.target).attr("class")=="remove"){
				console.log("remove song from playlist",$(e.target).attr("id"));
				Meteor.call("removeSongFromPlaylist", $(e.target).attr("id"),Session.get("currentRoom"));
			}else{				
				Session.set("currentSong", $(e.currentTarget).attr("id"));
				Session.set('currentSongSource',$(e.currentTarget).attr("data-source"));
				
				console.log(" --->  play",$(e.currentTarget).attr("id"), " >> ",Session.get('currentSongSource'));
				
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
	
	var _arr =  Message.find({roomID:Session.get("currentRoom"),createTime:{$lt:joinTime},"owner.username":{$ne:"SYS"}},{sort:{createTime:1}}).fetch();
	
	if(_arr.length < 1) return [];	
	var _chat = _arr[0];	
		_chat.message = emoticon(_chat.message);
		_chat.old=true;
		
	var _listChat=[];
		_listChat.push(_chat);
		
	for(var i = 1;i<_arr.length;i++){
		_chat = _arr[i];		
		_chat.message = emoticon(_chat.message);
		_chat.old=true;
		
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
	console.log("-----------> RealtimeChat rendered");
	$('#chatlist').slimScroll({	
		height: '300px',
		opacity:1,
		railOpacity:1,
		scrollTo:$("#chatContent").height() + 'px'
	});	
}

Template.messageChat.created=function(){
	if(this.data){
		//console.log("-----------> messageChat created",this.data.owner.name,this.data.owner.name!="SYS");
		
		if(!this.data.old)this.data.message = emoticon(this.data.message);
		this.data.timeAgo = timeAgo(this.data.createTime);
				
		var li = $('#chatlist #realtimeChat li').last();
		var info = li.find(".info");
		var username = info.attr("username");
			
		if(this.data.owner.username==username && this.data.owner.name!="SYS"){				
			li.find(".message").append('<p>'+this.data.message+'</p>');			
			this.data.message = "";
		}
	}
}

Template.messageChat.rendered=function(){
	if(this.data){
		
		console.log("-----------> messageChat rendered", this.data.message=="");
		
		if(this.data.message==""){			
			$("#"+this.data._id).remove();
		}
		
		$("#"+this.lastNode.id +" .thumbnail").popover({"content":'<a href="https://www.facebook.com/'+this.data.owner.username+'" target="_blank">Xem profile trên facebook</a>',"html":true});
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

			if(_album.title==""){
				$("#createAlbumForm .alert-error").css('display','block');
				return false;
			}
			
			$("#createAlbumForm .alert-error").css('display','none');
			 
			Meteor.call("createAlbum", _album,function(err,res){
				if(res){				
					// close modal
					$('#createAlbumForm').modal('hide')
					
					// goto Album
					console.log("goto album", res);
					Router.navigate("a/"+title2Alias(_album.title)+"."+res,{trigger: true});
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
		_info.alias 	= "a/"+title2Alias(_album.title) +"."+_album._id;
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
		Router.navigate($(e.currentTarget).attr("href"),{trigger: true});  
	}
}
		
/**
#################################################################################
*/

Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {    
   
	console.log("#############################################",lvalue,rvalue,lvalue!=rvalue);
	
	if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});


/**
#################################################################################
*/
// start-up when load all js
Meteor.startup(function () {	 
	Session.set('currentPage',"home");
	loadTopAlbumList();		
});

