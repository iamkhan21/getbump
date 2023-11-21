#!/usr/bin/env node

import fs from "node:fs";
import { cli } from "cleye";
import { COMMANDS } from "./commands/_config.js";
import { bump, bumpCommand } from "./commands/bump.js";
import { prepare, prepareCommand } from "./commands/prepare.js";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

/* const main = defineCommand({
    meta: {
        name: "getbump",
        version:packageJson.version,
        description: "Bump MFEs version",
    },
    args: {
        command: {
            type: "positional",
            description: `The command to run.
                    "bump" - Bump MFEs version (default)
                    "help" - Show help
                    "version" - Show version`,
            default: "bump",
            required: true,
        },
    },
    run({ args }) {
        console.log(`${args.friendly ? "Hi" : "Greetings"} ${args.command}!`);
    },
});

runMain(main); */

const getCliArguments = () =>
	cli({
		name: "getbump",
		version: packageJson.version,
		commands: [bumpCommand, prepareCommand],
	});

(async () => {
	const argv = getCliArguments();

	const selectedCommand = argv.command || COMMANDS.BUMP;

	switch (selectedCommand) {
		case COMMANDS.BUMP: {
			bump();
			break;
		}
		case COMMANDS.PREPARE: {
			prepare();
			break;
		}
		default: {
			console.log("There is no such command");
			break;
		}
	}
})();
