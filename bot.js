const Discord = require("discord.js");
const client = new Discord.Client();
const sql = require("sqlite");
sql.open("./score.sqlite");
var ids = ["261610099699744769", "232040363957813248", "186342659739090944", "289789718638362625", "261707256435965952", "261678719511429120", 
           "193593113522995201", "211603633286938624", "360227821999882240", "229032872785215488", "142898856999387136", "323126810730692610", 
           "350392033518682114", "100482322888933376", "218567556854710283", "355373307979366403", "381828671058608130", "249837765888442368", 
           "246746999687348224", "163313218196996097", "280498369594654730", "252504012715196437", "141322986505502721", "127241019900166144"];


const prefix = "-";

client.on("message", message => {
  if (message.author.bot) return;
  if (message.channel.type !== "text") return;
  if (message.channel.name !== "internal_scrim") return;

  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, points) VALUES (?, ?)", [message.author.id, 0]);
    } 
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points) VALUES (?, ?)", [message.author.id, 0]);
    });
  });

  if (!message.content.startsWith(prefix)) return;

  if (message.content.startsWith(prefix + "info")) {
    const info = "-report @A @B: report a match where A won and B lost\n-points @A: check how many points A has\n-teampoints: check how many points the team has in total\n-leaderboard: check the top 5 scorers\n+scrim; @A @B: let my sister SAlter know that A is scrimming B so she can help with the bans";
    message.channel.send(info);
  }

  if (message.content.startsWith(prefix + "points")) { 
    if(message.mentions.members.first() == undefined) {
      message.channel.send("S-sorry, I don't know who that is.");
      return;
    }
    sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.members.first().user.id}"`).then(row => {
      if (!row) {
        message.channel.send("I-I'm sorry, " + message.mentions.members.first().user.username + " doesn't have any points yet... did I do something wrong?");
        return;
      }
      if(row.points === 0) {
        message.channel.send("I-I'm sorry, " + message.mentions.members.first().user.username + " doesn't have any points yet... did I do something wrong?");
        return;
      }
      message.channel.send("Sugoi! " + message.mentions.members.first().user.username + " currently has " + row.points + " points! Keep up the good work!");
    });
  }

  if (message.content.startsWith(prefix + "teampoints")) {
    var sum = 0;
    
    for(var i = 0; i < ids.length; i++) {
      
      sql.get(`SELECT * FROM scores WHERE userId ="${ids[i]}"`).then(row => {
        if(!row) {
          sum += 0; 
        }
        else {
          sum += row.points;
        }
        console.log(sum);
      });
    }
    setTimeout(() => {
      console.log(sum);
        message.channel.send("Wow! You guys already have " + sum + " points! Keep up the good work!");
    }, 3000);
    
  }

  if (message.content.startsWith(prefix + "lewd")) {
    message.channel.send("Hi, I'm Chris Hansen from Dateline NBC. Why don't you have a seat over there?", {files: ["https://i.imgur.com/2o9hNUv.jpg"]});
    return;
  }

  if (message.content.startsWith(prefix + "leaderboard")) {
    sql.get('SELECT * FROM scores ORDER BY points DESC LIMIT 5').then(row => { 
      var msg = client.users.get(row.userId).username + " has " + row.points + " points";
      message.channel.send(msg);
    })
  }

  if (message.content.startsWith(prefix + "reset")) {
    if(message.author.id === "261678719511429120") {
      for(var i = 0; i < ids.length; i++) {
        sql.run(`UPDATE scores SET points = 0 WHERE userId = ${ids[i]}`);
      }
      message.channel.send("I did it! I reset the scores!");
    }
    else {
      message.channel.send("No bich.", {files: ["https://media.discordapp.net/attachments/411423966612160533/467503402369417216/fakyu.png"]});
    }
  }

  if (message.content.startsWith(prefix + "report")) {
    //console.log("final for real");
    console.log(message.content);
    var cont = message.content.replace(/@!/g, "@");
    var firstAt = cont.indexOf("@");
    var firstClose = cont.indexOf(">");
    var lastAt = cont.lastIndexOf("@");
    var lastClose = cont.lastIndexOf(">");
    console.log(cont);
    if(firstAt === lastAt) {
      message.channel.send("S-sorry, but the correct format is -report @A @B where A is the winner and B is the loser. I'm not smart enough to read other formats... will you forgive me?");
      return;
    }
    var winnerID = cont.substring(firstAt + 1, firstClose);
    var loserID = cont.substring(lastAt + 1, lastClose);
    if(winnerID === loserID) {
      message.channel.send("I c-can't let you report a match against yourself, o-or Law says he's g-going to punish me.");
      return;
    }
    
    var winner = client.users.get(winnerID);
    var loser = client.users.get(loserID);
    console.log(winner.username);
    console.log(loser.username);

    sql.get(`SELECT * FROM scores WHERE userId ="${winner.id}"`).then(row => {
      if (!row) {
        sql.run("INSERT INTO scores (userId, points) VALUES (?, ?)", [winner.id, 5]);
      } 
      else {
        sql.run(`UPDATE scores SET points = ${row.points + 5} WHERE userId = ${winner.id}`);
      }
      if(ids.indexOf(winner.id) === -1) {
          ids.push(winner.id);
      }
    }).catch(() => {
      console.error;
      sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER)").then(() => {
        sql.run("INSERT INTO scores (userId, points) VALUES (?, ?)", [winner.id, 5]);
      });
      if(ids.indexOf(winner.id) === -1) {
          ids.push(winner.id);
      }
    });

    sql.get(`SELECT * FROM scores WHERE userId ="${loser.id}"`).then(row => {
      if (!row) {
        sql.run("INSERT INTO scores (userId, points) VALUES (?, ?)", [loser.id, 3]);
      } 
      else {
        sql.run(`UPDATE scores SET points = ${row.points + 3} WHERE userId = ${loser.id}`);
      }
      if(ids.indexOf(loser.id) === -1) {
          ids.push(loser.id);
      }
    }).catch(() => {
      console.error;
      sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER)").then(() => {
        sql.run("INSERT INTO scores (userId, points) VALUES (?, ?)", [loser.id, 3]);
      });
      if(ids.indexOf(loser.id) === -1) {
          ids.push(loser.id);
      }
    });

    message.channel.send("Good job " + winner.username + "! You can do it next time " + loser.username + ", I believe in you!");
  }
});

client.login(process.env.BOT_TOKEN);
