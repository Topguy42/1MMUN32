var apps = [
    {
      'id': 'customapp',
      'title': 'Add custom app',
      'image': 'addicon.png'
    },
    {
      "id": "google",
      "title": "Google",
      "url": "https://www.google.com/?safe=active&ssui=on",
      'image': 'https://img.freepik.com/free-icon/search_318-265146.jpg'
      
    },
    {
      "id": "discord",
      "title": "Discord",
      "url": "https://discord.com/app",
      'image': 'https://static.vecteezy.com/system/resources/previews/006/892/625/original/discord-logo-icon-editorial-free-vector.jpg'
    },
    {
      "id": "geforce",
      "title": "GeForce NOW",
      "url": "https://play.geforcenow.com",
      'image': 'https://www.google.com/s2/favicons?domain=geforcenow.com&sz=128'
    },
    {
      'id': 'vscode',
      'title': 'Visual Studio Code',
      'url': 'https://vscode.dev/',
      'image': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/250px-Visual_Studio_Code_1.35_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail'
    },
    {
      "id": "tiktok",
      "title": "TikTok",
      "url": "https://tiktok.com",
      'image': 'https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png'
    },
    {
      'id': 'nowgg',
      'title': 'now.gg',
      'url': 'https://now.gg',
      'image': 'https://uploads-ssl.webflow.com/60f008ba9757da0940af288e/6232d610e4172bed260d4cfd_9Dw5vXGi_400x400.jpeg',
    },
    {
      "id": "reddit",
      "title": "Reddit",
      "url": "https://reddit.com",
      'image': 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png'
    },
    {
      "id": "youtube",
      "title": "YouTube",
      "url": "https://youtube.com",
      'image': 'https://www.iconpacks.net/icons/2/free-youtube-logo-icon-2431-thumb.png'
    },
    {
      "id": "twitter",
      "title": "Twitter",
      "url": "https://twitter.com",
      'image': 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png'
    },
    {
      'id': 'spotify',
      'title': 'Spotify',
      'url': 'https://open.spotify.com/browse',
      'image': 'https://www.freepnglogos.com/uploads/spotify-logo-png/file-spotify-logo-png-4.png'
    },
    {
      'id': 'chess',
      'title': 'Chess.com',
      'url': 'https://chess.com',
      'image': 'https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/SamCopeland/phpmeXx6V.png'
    },
    {
      'id': 'coolmathgames',
      'title': 'Cool Math Games',
      'url': 'https://coolmathgames.com',
      'image': 'https://docs.google.com/drawings/d/e/2PACX-1vR6y2GvcGu9PdrX9zzE24dhm24hClcNsdAmZjIgSUC8sFOahf6t7Yg6l_W8Rd4GduWOH_X02GHVFdBb/pub?w=512&h=512'
    },
    {
      'id': 'win11',
      'title': 'Windows 11 in React',
      'url': 'https://win11.blueedge.me/',
      "image": "https://365cloudstore.com/wp-content/uploads/2023/02/windows-11-500x500-01.png",
      "description": "A remake of the Windows 11 UI in React.js"
    },
    {
      'id': 'gbaemulator',
      'title': 'Game Boy Emulator',
      'url': 'https://cattn.github.io/gba',
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6Dyd39CxufwgGFd_xRMfw-FKFUWpJNimH0QVziZ_EFRGyWxeL",
      "description": "A Game Boy Advance retro emulator with over 3000 games, and other consoles as well"
    },
    {
      'id': 'snapchat',
      'title': 'Snapchat',
      'url': 'https://nowgg.nl/play/Aptoide/1440/aptoide',
      "image": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQB1vggZ9ykno5lmGbt2NrNFh2Lkn66W5yOAQU3a1QnzQX3JBLx",
    },
    {
      'id': 'twitch',
      'title': 'Twitch',
      'url': 'https://twitch.tv',
      "image": "https://cdn.pixabay.com/photo/2021/12/10/16/38/twitch-6860918_1280.png",
    }
  ]
  
  var customapps = JSON.parse(localStorage.getItem("customapps") || "[]")
  customapps.forEach(app => {
    apps.push(app)
  })
