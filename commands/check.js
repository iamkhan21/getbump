import { command } from "cleye";
import { getMicrofrontends, readTokenFromNpmrc } from "./bump.js";

function check() {
	const isTokenPresented = Boolean(readTokenFromNpmrc());

	if (!isTokenPresented) {
		console.log("No GitLab token found in .npmrc");
		return;
	}

	const microfrontends = getMicrofrontends();

	if (!(microfrontends && Object.keys(microfrontends).length)) {
		console.log("No micro-frontend projects defined in package.json");
		return;
	}

	console.log("All good");
}

const checkCommand = command(
	{
		name: "check",
		alias: "c",
		help: {
			description:
				"Check if host app is prepared to new format of managing versions of shared MFEs and has all required",
		},
	},
	check,
);

export default checkCommand;
