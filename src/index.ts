import { group, setFailed, warning } from "@actions/core";
import { hello } from "./main";

async function main(): Promise<void> {
	try {
		const message = await group("Running start()", hello.bind(null));
		console.log(message);
	} catch (err) {
		warning(err);
		setFailed(`Action failed with error ${err}`);
	}
}

main();
