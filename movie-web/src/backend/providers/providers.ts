import {
  buildProviders,
  getBuiltinEmbeds,
  getBuiltinSources,
  targets,
} from "@movie-web/providers";

import { isExtensionActiveCached } from "@/backend/extension/messaging";
import {
  makeExtensionFetcher,
  makeLoadBalancedSimpleProxyFetcher,
} from "@/backend/providers/fetchers";
import { conf } from "@/setup/config";

function getKnownProviderIds() {
  return new Set(getBuiltinSources().map((source) => source.id));
}

function getKnownEmbedIds() {
  return new Set(getBuiltinEmbeds().map((embed) => embed.id));
}

export function getEnabledProviderIds() {
  const knownIds = getKnownProviderIds();
  return conf().ENABLED_PROVIDER_IDS.filter((id) => knownIds.has(id));
}

export function getEnabledEmbedIds() {
  const knownIds = getKnownEmbedIds();
  return conf().ENABLED_EMBED_IDS.filter((id) => knownIds.has(id));
}

export function hasEnabledPlaybackProviders() {
  return getEnabledProviderIds().length > 0;
}

export function getProviders() {
  const builder = buildProviders().enableConsistentIpForRequests();
  getEnabledProviderIds().forEach((id) => builder.addSource(id));
  getEnabledEmbedIds().forEach((id) => builder.addEmbed(id));

  if (isExtensionActiveCached()) {
    return builder
      .setFetcher(makeExtensionFetcher())
      .setTarget(targets.BROWSER_EXTENSION)
      .build();
  }

  const proxyFetcher = makeLoadBalancedSimpleProxyFetcher();
  return builder
    .setFetcher(proxyFetcher)
    .setProxiedFetcher(proxyFetcher)
    .setTarget(targets.BROWSER)
    .build();
}
