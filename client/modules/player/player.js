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
			},
			loadStarted:function(){
				console.log('on load start audio');
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
	
	if(media.domain=='youtube.com'){
		// playvideo 		
	
		$("#myytplayer").show();
		$("#ytapiplayer").show();
		
		$(".audiojs").hide();
		$("#adPlayer").hide();
		
		$('#chatlist').height(175);	
		$('#chatlist').parent().height(175);	
		$('#page2 .slideBody').height(175);		
	
		if(audio && audio.pause)audio.pause();
		
		_youtube_video_id = media.mID;		
		if(player)player.loadVideoById(_youtube_video_id);
		
	}else{
		// playaudio
		$("#myytplayer").hide();
		$("#ytapiplayer").hide();
		
		$(".audiojs").show();
		$("#adPlayer").show();		
			
		
		$('#chatlist').height(310);	
		$('#chatlist').parent().height(310);		
		$('#page2 .slideBody').height(310);		
		
		
		if ( audio ) {
			audio.load(media.source);
			audio.play();
		}	
		
		//if(player!=undefined)player.stopVideo();
	}	
	
	var album = Album.findOne({_id:media.albumID});
	// reset url 
	var url = "a/"+title2Alias(album.title)+"."+album._id+"/"+media._id;
	
	console.log('reset url -------------->', url);
	
	Router.navigate(url); 
}

nextSong = function(){	
	var next = 0;
	
	if(Session.get('currentRoom')=='')return;
	
	if(Session.get("currentSong")!='')
		next = parseInt($("#albumPlaylist").find("#"+Session.get("currentSong")).attr("index")) + 1;	
	
	var listSong = Song.find({albumID:Session.get('currentRoom')},{$sort:{createTime:-1}}).fetch();
	
	if(next==listSong.length || next==undefined)	
		next = 0;	
	
	var song = listSong[next];	
	
	console.log(" ---> end song >> next", next);
	
	Session.set("currentSong", song._id);
	Session.set('currentSongSource', song.source);
	
	activePlaylistItem();	
	playSong(Session.get('currentSong'));
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

playActiveSong = function(){
	if(Session.get('currentSong')=='')		
		nextSong();
	else{
		activePlaylistItem();	
		playSong(Session.get('currentSong'));
	}
}