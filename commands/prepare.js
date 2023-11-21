import {command} from "cleye";
import {COMMANDS} from "./_config.js";

export const prepareCommand = command({
	name: COMMANDS.PREPARE,
	alias: "p",
	help: {
		description: "Prepare host app to new format of managing versions of shared MFEs",
	}
});

export function prepare() {

}
