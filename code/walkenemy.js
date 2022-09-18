export default function walkenemy(speed = 60, dir=-1) {
	return {
		id: "walkenemy",
		require: [ "pos", "area",],
		add() {
			this.on("collide", (obj,side) => {
				if ((side === "left" || side === "right")) {
					dir = -dir;
				}
			});
		},
		update() {
			this.move(speed*dir,0);
		},
	};
}