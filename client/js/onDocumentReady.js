loadTopAlbumList =function(){
	Meteor.subscribe(	'Album', 						
						loadStep,
						function () {
							onDocumentReady();
							appendAlbumList();
						});
}

onDocumentReady = function (templatePage) {  
	currentPath = window.location.pathname;
	initTypeAHead();
	
	
	$("#page2").css("height",$("#PageContainer").height());
	$("#page1").css("height",$("#PageContainer").height());	
	
	$('#albumList .viewport').css("height",$('#PageContainer').height()-150);
	$('#albumList').tinyscrollbar();
	
	$("#page2 .header").click( function(){
		$("#page2").transition({y:$("#page1").height()});
		$("#page1").transition({y:0});
		$("#Nav").transition({x:0});
	});
		
	console.log("ON READY");
}

appendAlbumList =function(){
	
	var templatePost = Meteor.renderList(
			Album.find({},{	sort:{createTime:-1}}),			
			function(album) {	
				if(album.title)	album.alias  	= "album/"+title2Alias(album.title) +"."+album._id;
								album.timeAgo 	= timeAgo(album.createTime);		
			return Template["albumItem"](album);	   
			    
  	});	
	
  	$("#realTimeAlbumList").append(templatePost);		
}

gotoAlbum = function(_albumID){
	
	Meteor.subscribe('OneAlbum', _albumID, function () {
		
		var _album =  Album.findOne({_id: _albumID});
			_album.alias   = AbsoluteUrl() + "album/"+title2Alias(_album.title) +"."+_album._id;    
			_album.timeAgo = timeAgo(_album.createTime);
		
		//Template["playlist"](_album.playlist);
		
		console.log(" ->>> joint room",_albumID);	
		Session.set('currentRoom',_albumID);
				
		// show Room				
		$("#page2").transition({y:-$("#page1").height()});
		$("#page1").transition({y:-$("#page1").height()});
		$("#Nav").transition({x:-$("#Nav").width()});
		
		
		joinTime    = Date.now();
		
	
		// clear chatlist & update chatlist scrollbar
		$("#chatlist .overview").html("");		
		$('#chatlist').tinyscrollbar();
		$('#chatlist').tinyscrollbar_update();
		
		// append list chat				
		var _chatMsg =  Meteor.renderList(
				Message.find({roomID:Session.get("currentRoom")},{sort:{createTime:1}})
				,function(_msg) {
					
					// find lasted chat owner
					var li = $('#chatlist ul li').last();
					var info = li.find(".info");
					var username = info.attr("username");
					
					if(_msg.owner.username==username){
						// append vao itemchat truoc do			
						li.find(".message").append('<p>'+_msg.message+'</p>');	
						$('#chatlist').tinyscrollbar_update('bottom');
						return '';
					}else{
						return Template["messageChat"](_msg);
					}
				}
			);
						
		$("#chatlist .overview").append(_chatMsg);
	});
	
}


var timeOut;

initTypeAHead=function(){ 
	
console.log(" -------------> initTypeAHead");

	var searchkey="";
	var resultData=[];
	
	
	$('#searchInput').typeahead({
		items:10,
		minLength:3,
		source: function(query,process){
			map = {};
			
			window.clearTimeout(timeOut);
			timeOut = window.setTimeout(function(){				
				
				Meteor.call("autoCompleteSearch",query,function(err,res){
					if(res){
						var data = $.parseJSON(res);						
						var result = [];
						
						console.log("search complete",query,data.song.list);
						
						$.each(data.song.list, function (i, song) {
							if(i<10){															
								if(song.name.lastIndexOf("+")>-1)song.name = song.name.substring(0,song.name.lastIndexOf("+"));	
								song.title = song.object_id;	
								song.domain = "mp3.zing.vn";							
								map[song.title] = song;
								result.push(song.title);
							}	
						});						
						resultData = result;
						
						return process(result);
					}
				})
				
			},300); 
		 
		},
		
		updater:function (item) {
			console.log("select item >>",item,map[item]);
			
			Meteor.call("getSongInfo",map[item].object_id, map[item].domain,function(err, res){
				if(res){
					
					console.log(" get source complete >>",res);
					
					var _song={};
						_song.id 		= map[item].object_id;
						_song.title 	= map[item].name;
						_song.artist 	= map[item].artist;
						_song.domain 	= map[item].domain;
						_song.source  	= res.source;
						
					
					Meteor.call("addSongToPlaylist",_song,Session.get("currentRoom"),function(err,res){
						if(res){
							console.log(">> addSongToPlaylist success");
						}
					});
					
				}				
			});
			
			return map[item].name + " - "+map[item].artist;
		},

		highlighter: function (item) {
			//var regex = new RegExp( '(' + this.query + ')', 'gi' );
			//item.replace( regex, "<strong>$1</strong>" );
			//console.log("highlighter item >>",item,map[item]);
			return map[item].name + ' - <span>'+map[item].artist+'</span>' + '<small class="pull-right" style="color:#ddd">'+map[item].domain+'</small>';
		}
	});

}

nextSong = function(){	
	var next = Session.get("currentSong") + 1;	
	if(next==Album.findOne({_id:Session.get("currentRoom")}).playlist.length)	
		next = 0;	
	
	var song = Album.findOne({_id:Session.get("currentRoom")}).playlist[next];	
	
	console.log(" ---> end song >> next", next);
	
	Session.set("currentSong", next);
	Session.set('currentSongSource', song.source);
	activePlaylistItem();
}

activePlaylistItem=function(){
	var scroll =  $("#albumPlaylist").find("li").each(function(index){
   			if(parseInt($(this).attr("id")) == Session.get("currentSong")){
   				$(this).addClass("active");
   			}else{
   				$(this).removeClass("active");
   			}
	});
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
