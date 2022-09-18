import kaboom from "kaboom";
import loadAssets from "./loadAssets";
import {LEVELS} from "./levels";
import {damage} from "./damage";
import {levelConf} from "./levelConf";

// initialize context
kaboom();
loadAssets();

var visible=false
var levelId=0

const song=play("theme",{volume:1.2,loop:true,})



scene("start",()=>{
  add([
    sprite("play button",{anim:"normal",}),
    area(),
    pos(0,0),
    scale(width(),height()),
  ]);
  add([
    text("click to play\n\nHUGE CURSOR\n(part 1)"),
    origin("center"),
    pos(center()),
  ]);
  mouseClick(()=>{
    go("backstory");
  });
});


scene("backstory",()=>{
  add([
    sprite("play button",{anim:"hovered",}),
    area(),
    pos(0,0),
    scale(width(),height()),
  ]);
  const bs=add([
    sprite("backstory",{anim:"00"}),
    pos(center()),
    origin("center"),
    scale(7),
  ]);
  var amines=-1
  var amins=["01","02","03","04","05","06","07",];
  add([
    text("click to continue also this is the backstory and '?'\nsignifies\nan unknown\n object"),
    pos(20,40),
    scale(0.5),
  ]);
  mouseClick(()=>{
    amines+=1
    if(amines<6){
      if(amins[amines]=="06"||amins[amines]=="07"){
        bs.move(0,1000);
      }else{
        bs.play(amins[amines]);
      };
    }else{
      go("game");
    };
  });
});


scene("game",() => {
  var x=0
  var y=0
  var playerhealth;
  var cursorhealth;
  visible=true
  add([
    sprite("bgblue"),
    scale(100),
  ]);
  const level=addLevel(LEVELS[levelId],levelConf);
  add([
    text("p\n\nc"),
    fixed(),
    pos(10,10),
    scale(0.3),
  ]);
  const playerHealth=add([
    sprite("health",{anim:"10",}),
    pos(30,10),
    fixed(),
    scale(3)
  ]);
  const cursorHealth=add([
    sprite("health",{anim:"10",}),
    pos(30,50),
    fixed(),
    scale(3)
  ]);

  const player=add([
    sprite("player"),
    pos(100,200),
    body(),
    health(10),
    origin("center"),
    area(),
    {
      maxspeed:200,
      maxhealth:10,
      currenthealth:10,
    },
  ]);

  const cursor=add([
	sprite("cursor",{anim:"hidden",}),
	pos(80, 40),
	area(),
  "cursor",
  origin("topleft"),
  health(10),
  fixed(),
  scale(2),
  {
    maxhealth:10,
    currenthealth:10,
  },
  ]);
  playerHealth.action(()=>{
    playerhealth=""+player.currenthealth
    if(player.currenthealth<0){
      playerHealth.play(0);
    }else{
      playerHealth.play(playerhealth);
    };
    cursorhealth=""+cursor.currenthealth
    if(cursor.currenthealth<0){
      cursorHealth.play(0);
    }else{
      cursorHealth.play(cursorhealth);
    };
  });
  cursor.action(()=>{
  cursor.moveTo(mousePos());
  if(visible){
    if(mouseIsDown()){
      cursor.play("pressed");
    }else{
      cursor.play("idle");
    };
  }else{
    cursor.play("hidden");
  };
  });
  player.action(() => {
    if(player.pos.x>712&&player.pos.x<1415){
      camPos(player.pos.x,362);
    }else{
      if(player.pos.x>1413){
        camPos(1413,362);
      }else{
        camPos(715,362);
      };
    };
  });


  //shift speed increase
  keyDown("shift", ()=>{
    player.maxspeed=250;
  });
  keyRelease("shift",()=>{
    player.maxspeed=200
  });

  //double jump
  keyPress("w", () => {
    if(player.grounded()){
      player.jump();
    }else if(x<=0){
      player.jump();
      x+=1;
    };
  });
  player.action(()=>{
    if(player.grounded()){
      x=0    
    };
  });
  player.collides("wall",(e,side)=>{
    if(side=="left"||side=="right"){
      x=0
    };
  });

  //movement and acceleration
  keyDown("a",() => {
    y=Math.min(y+25, player.maxspeed)
    player.move(-y,0);
  });
  keyRelease("a",()=>{
    y=0
  });
  keyDown("d", () => {
    y=Math.min(y+25, player.maxspeed)
    player.move(y,0);
  });
  keyRelease("d",()=>{
    y=0
  });
  
  //dropping down quicker
  keyDown("s",() => {
    player.weight=Math.min(player.weight+2,15)
  });
  keyRelease("s",()=>{
    player.weight=1
  });

  player.collides("crystal", () => {
		if (levelId + 1 < LEVELS.length) {
      levelId+=1
      wait(0.5,()=>{
        go("nextlevel");
      });
		}else{
      go("win");
    };
	});



  //enemy things
  player.on("ground", (l) => {
		if (l.is("enemy")) {
			destroy(l);
			addKaboom(player.pos);
      play("explode");
		}
	});
  player.collides("stillenemy",()=>{
    damage(player,10,"danger",15)
  });
  cursor.collides("stillenemy",(z)=>{
    destroy(z)
    play("explode");
  });

  player.collides("walkenemy", (e, side) => {
		if (side !== "bottom") {
			damage(player,4,"bug",10)
      wait(0.25)
		}
	});
  player.collides("allbad",()=>{
    damage(player,10,"bug",20)
  });
  player.collides("laserbutton",(e,side)=>{
    destroyAll("cursorallbad")
  });
  player.collides("button",(e,side)=>{
    destroyAll("box")
  });
  cursor.collides("cursorallbad",()=>{
    damage(cursor,10,"bug",20)
  });
  player.collides("topbad",(e,side)=>{
    damage(player,2,"bug",10)
  });

  player.on("death",()=>{
    wait(0.2)
    shake(25);
    wait(0.2,()=>{
      go("die");
    });
  });
  cursor.on("death",()=>{
    wait(0.2)
    shake(25);
    wait(0.2,()=>{
      go("die");
    });
  });
});

scene("die",()=>{
  add([
    sprite("play button",{anim:"normal",}),
    area(),
    pos(0,0),
    scale(width(),height()),
  ]);
  add([
    text("you ded\n\npress any button to retry"),
    origin("center"),
    pos(center()),
  ]);
  add([
    text("move your\ncursor\nhere pls"),
    origin("topleft"),
    pos(10,10),
    scale(0.5),
  ]);
  keyPress(()=>{
    go("game");
  });
});
scene("nextlevel",()=>{
  add([
    sprite("play button",{anim:"normal",}),
    area(),
    pos(0,0),
    scale(width(),height()),
  ]);
  add([
    text("LEVEL CLEARED!\n\npress any button to\ngo to the next level"),
    origin("center"),
    pos(center()),
  ]);
  add([
    text("move your\ncursor\nhere pls"),
    origin("topleft"),
    pos(10,10),
    scale(0.5),
  ]);
  keyPress(()=>{
    go("game");
  });
});

scene("win",()=>{
  add([
    sprite("play button",{anim:"normal",}),
    area(),
    pos(0,0),
    scale(width(),height()),
  ]);
  add([
    text("YOU WON SO YOU  ARE EPIC GAMER!\n\nplayer and cursor will\n\nreturn in Huge Cursor Part 2\n\nto get back their '?'"),
    origin("center"),
    pos(center()),
  ]);
  add([
    text("press tab to play again or enter to watch the endingcutscene"),
    origin("topleft"),
    pos(10,40),
    scale(0.5),
  ]);
  keyPress("tab",()=>{
    levelId=0
    go("game");
  });
  keyPress("enter",()=>{
    go("cutscene");
  });
});

scene("cutscene",()=>{
  add([
    sprite("play button",{anim:"hovered",}),
    area(),
    pos(0,0),
    scale(width(),height()),
  ]);
  const bs=add([
    sprite("cutscene",{anim:"0"}),
    pos(center()),
    origin("center"),
    scale(7),
  ]);
  var amines=-1
  var amins=["1","2","3","4","5","06","07",];
  add([
    text("click to continue"),
    pos(20,40),
    scale(0.5),
  ]);
  mouseClick(()=>{
    amines+=1
    if(amines<6){
      if(amins[amines]=="06"||amins[amines]=="07"){
        bs.move(0,1000);
      }else{
        bs.play(amins[amines]);
      };
    }else{
      go("win");
    };
  });
});

go("start");