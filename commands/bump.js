import path from "node:path";
import { command } from "cleye";
import { COMMANDS } from "./_config.js";

export const bumpCommand = command({
	name: COMMANDS.BUMP,
	alias: "b",
	help: {
		description: "Run interactive CLI to bump shared MFEs version",
	},
});

export async function bump() {
	const homeDirectory = process.env.HOME || process.env.USERPROFILE;
	const npmrcPath = path.join(homeDirectory, ".npmrc");

	const packageJsonPath = path.join(process.cwd(), "package.json");

	console.log({
		npmrcPath,
		packageJsonPath,
	});
}
