import { useMemo } from 'react';
import { ApolloClient, ApolloLink, from, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
// @ts-ignore
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { getJwtToken } from '../libs/auth';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			return forward(operation);
		});

		const uploadLink = createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL,
		});

		/* lazy: the socket only opens once a subscription is actually started */
		const wsLink = new WebSocketLink({
			uri: process.env.REACT_APP_API_WS ?? 'ws://localhost:3011',
			options: {
				lazy: true,
				reconnect: false,
				connectionParams: () => ({ headers: getHeaders() }),
			},
		});

		const errorLink = onError(({ graphQLErrors, networkError }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message }) => {
					if (process.env.NODE_ENV === 'development') console.log(`[GraphQL error]: ${message}`);
				});
			}
			if (networkError) {
				console.log(`[Network error]: ${networkError}`);
				// @ts-ignore
				if (networkError?.statusCode === 401) {
				}
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(uploadLink),
		);

		return from([errorLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
