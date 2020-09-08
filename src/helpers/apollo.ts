import { getInput, warning } from "@actions/core";
import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import fetch from "cross-fetch";

export function makeClient(): ApolloClient<NormalizedCacheObject> {
	try {
		const token = getInput("token", { required: true });

		const link = createHttpLink({
			uri: "https://api.github.com/graphql",
			headers: {
				authorization: `token ${token}`,
			},
			fetch,
		});

		return new ApolloClient({
			link,
			cache: new InMemoryCache(),
		});
	} catch (err) {
		warning("You must provide a GitHub access token as the 'token' input: https://git.io/JUJlv");
		throw new Error("No GitHub Access token provided");
	}
}
