Meteor.headly.config({tagsForRequest: function(req) {
	var url = Npm.require('url'); 
	
	var parts = url.parse(req.url).pathname.split('/');
	
	var meta='';
		meta += '<meta property="og:site_name" content="FAVorite music" />';
	
		
	if(parts.length>1){
		// re turn custome
		if(parts[3] && parts[3]!='' && parts[1]=="a"){
			var media = Song.findOne({_id:parts[3]}); 
				if(media==undefined) return meta;
				
			var album = Album.findOne({_id:media.albumID});
				if(album==undefined) return meta;
			
			if(media.domain=='youtube.com')
				meta += '<meta property="og:image" 		content="http://i1.ytimg.com/vi/'+media.mID+'/hqdefault.jpg"/>';
			else
				meta += '<meta property="og:image" 		content="http://fav.vn'+getCoverAlbum(album.genre)+'"/>';
				
			meta += '<meta property="og:url" 		content="http://fav.vn/a/'+parts[2]+'/'+media._id+'" />';
			meta += '<meta property="og:title" 		content=" '+media.title+' trong playlist '+album.title +' - '+album.owner.name+'"/>';
			meta += '<meta property="og:description" content="Nghe nhạc và chia sẻ cảm xúc cùng '+album.owner.name+' tại FAV.VN" />';
		}else{
			
			switch(parts[1]){
				case "a" :
					var _albumID = parts[2].substring( parts[2].lastIndexOf(".")+1,parts[2].length);
					var _album = Album.findOne({_id:_albumID});
					
						if(_album==undefined) return meta;
					
					meta += '<meta property="og:url" 		content="http://fav.vn/a/'+parts[2]+'" />';
					meta += '<meta property="og:image" 		content="http://fav.vn'+getCoverAlbum(_album.genre)+'"/>';
					meta += '<meta property="og:title" 		content="Album: '+_album.title+' - tạo bởi '+_album.owner.name+'"/>';
					meta += '<meta property="og:description" content="Nghe nhạc và chia sẻ cảm xúc cùng '+_album.owner.name+' tại FAV.VN" />';
				break;			
			}
		}
	}else{
		// return default
		meta += '<meta property="og:url" 			content="http://fav.vn" />';		
		meta += '<meta property="og:image" 			content="/img/tcs.jpg"/>';
		meta += '<meta property="og:title" 			content="FAV.VN - FAVorite music"/>';
		meta += '<meta property="og:description" 	content="Trang web nghe nhạc dành cho người tự kỉ cấp độ cao nhất nhất" />';
	}
	
  return meta;
}});



Meteor.publish("Album", function (_step) { 	
	return [	Album.find({policy:0,numSong:{$gt:0}},{sort:{createTime:-1},limit:_step})
				,Meteor.users.find({currentRoom:{ $ne: "" }},{fields:{username:1,profile:1,role:1,currentRoom:1}})
			]
});


Meteor.publish("myAlbum", function (_username) { 	
	return Album.find({"owner.username":_username},{sort:{createTime:-1}});	
});

Meteor.publish("OneAlbum", function (_roomID) { 
	return [	Song.find({albumID:_roomID})
				,Message.find({roomID:_roomID})				
				,Meteor.users.find({},{fields:{username:1,profile:1,role:1,currentRoom:1}})
			]
});

Meteor.publish("MessageAndSong", function (_roomID) {	
	return [	Message.find({roomID:_roomID})				
				,Meteor.users.find({},{fields:{username:1,profile:1,role:1,currentRoom:1}})
			]
});