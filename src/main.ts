import { WhoAmIDocument, WhoAmIQuery } from "./generated";
import { client } from "./helpers/client";
export async function hello(): Promise<string> {
	const {
		data: { viewer },
	} = await client.query<WhoAmIQuery>({
		query: WhoAmIDocument,
	});
	return `Hello, ${viewer.login}`;
}
