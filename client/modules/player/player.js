// Khai bao bien audio
var audio;
var player;
Template.player.rendered = function(){	
	console.log("-------------------------------------------> Template.player.rendered");
	
	audiojs.events.ready(function() {
		var a  = audiojs.createAll({		
			autoplay:true,
			imageLocation: '/modules/player/audiojs/player-graphics.gif',
			swfLocation: '/modules/player/audiojs/audiojs.swf',
			trackEnded: function() {
				console.log("Hat xong roi"); 
				nextSong();
			}
			,loadError:function(){
				console.error("Load song error!");
			}
			
		});		
		audio = a[0];		
	});	
	
	// Youtube
	var params = { allowScriptAccess: "always" };
	var atts = { id: "myytplayer" };
	swfobject.embedSWF("http://www.youtube.com/v/M7lc1UVf-VE?enablejsapi=1&playerapiid=ytplayer&version=3&html5=1",
						"ytapiplayer", "448", "252", "8", null, null, params, atts);
						
	$("#myytplayer").hide();
	$("#ytapiplayer").hide();					
}

	
onYouTubePlayerReady = function (playerId) {
	console.log("##################### VIDEO READY #########################");
	player = document.getElementById("myytplayer");
	player.addEventListener('onStateChange','onPlayerStateChange')
	if(_youtube_video_id!='')player.loadVideoById(_youtube_video_id);	
}	  
 
onPlayerStateChange = function(event){
	console.log("Player's new state: " + event,event.data);
	if(event==0)nextSong();
}

var _youtube_video_id='';
var _currentMedia;

playSong=function(mediaID){	

	if(_currentMedia==mediaID)return false;
	
	_currentMedia = mediaID;
	// check video || mp3
	
	var media = Song.findOne({_id:mediaID});
	
	if(!media)return false;
	
	//console.log("play song on", media);
	
	if(media.domain=='youtube.com'){
		// playvideo 		
		_youtube_video_id = media.mID;
		
		if($("#myytplayer").css('display')=='none'){
			// Nếu đang ẩn > hiện ra
			$("#myytplayer").show();
			
			// ẩn và stop audio					
			$(".audiojs").hide();
			$("#adPlayer").hide();
			audio.pause();
		}else{
			// đang hiện > play liền
			if(_youtube_video_id!='')player.loadVideoById(_youtube_video_id);
		}
		
		// resize chat
		$('#chatlist').height(175);	
		$('#chatlist').parent().height(175);	
		$('#page2 .slideBody').height(175);	
		
	}else{
		
		$('#chatlist').height(310);	
		$('#chatlist').parent().height(310);		
		$('#page2 .slideBody').height(310);		
		
		if($(".audiojs").css('display')=='none'){
			// Nếu đang ẩn > hiện ra và play
			$(".audiojs").show();
			$("#adPlayer").show();	
			
			// Ẩn player
			$("#myytplayer").hide();	
		}else{
			// Nếu đang hiện > thôi
		}
		
		if ( audio ) {
			audio.load(media.source);
			audio.play();
		}	
		
		//if(player!=undefined)player.stopVideo();
	}	
	
	var album = Album.findOne({_id:media.albumID});
	// reset url 
	var url = "a/"+title2Alias(album.title)+"."+album._id+"/"+media._id;
	
	//console.log('reset url -------------->', url);
	
	Router.navigate(url); 
}

nextSong = function(){	
	var next = 0;
	
	if(Session.get('currentRoom')=='')return;
	
	if(Session.get("currentSong")!='')
		next = parseInt($("#albumPlaylist").find("#"+Session.get("currentSong")).attr("index")) + 1;	
	
	var listSong = Song.find({albumID:Session.get('currentRoom'),ignore : { $ne: true}},{$sort:{createTime:-1}}).fetch();
	
	if(next==listSong.length || next==undefined || next==NaN)	
		next = 0;	
	
	var song = listSong[next];	
					
	console.log(" ---> end song >> next", song._id);	
	
	if(song)changeSong(song._id);
}

activePlaylistItem=function(){
	
	var scroll =  $("#albumPlaylist").find("li").each(function(index){
   			if($(this).attr("id") == Session.get("currentSong")){
   				$(this).addClass("active");
   			}else{
   				$(this).removeClass("active");
   			}
	});
}

changeSong=function(songID){	
	// Hàm này chỉ cho Admin sử dụng
	
	if(songID==undefined || songID==''){
		console.warn('Song not found!');
		return;
	}
	
	if(songID==Session.get('currentSong')){
		console.warn('This song is playing!');
		return;
	}
	
	var album = Album.findOne({_id:Session.get('currentRoom')});
	
	if(album){
		//TODO: Kiểm tra xem live is true|false
		
		console.warn(" album is live ", album.live);
		
		if(album.live){
			// Nếu live > chỉ có admin mới được play
			if(Session.get('isAdmin')){
				Meteor.call('changeCurrentMedia',Session.get('currentRoom'),songID,function(err,res){
					console.warn("Active song", res);
				})
			}else{
				console.error('Have not permission to set active song!');
			}
				
		}else{
			// Không ở chế độ live > nghe tự do
			Session.set('currentSong',songID); 
			playCurrentSong();
		}
	}else{
		console.error("Album not found");
	}
}

playCurrentSong = function(){
	// Hàm này để play song khi client nhận được thay đổi bài hát từ server
	console.log("--->Play current Song", Session.get('currentSong'));	
	activePlaylistItem();	
	playSong(Session.get('currentSong'));		
}