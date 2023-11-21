import { command } from "cleye";
import { COMMANDS } from "./_config.js";

export const bumpCommand = command({
	name: COMMANDS.BUMP,
	alias: "b",
	help: {
		description: "Run interactive CLI to bump shared MFEs version",
	},
});

export function bump() {
	console.log("bump");
}
