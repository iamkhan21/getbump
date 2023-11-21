import { command } from "cleye";

function prepare() {
	console.log("prepare");
}

const prepareCommand = command({
	name: "prepare",
	alias: "p",
	help: {
		description:
			"Prepare host app to new format of managing versions of shared MFEs",
	},
	prepare,
});

export default prepareCommand;
