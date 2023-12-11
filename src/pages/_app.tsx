import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

const metaMaskConnector = new MetaMaskConnector({chains: [goerli]},)

const { chains, publicClient } = configureChains(
  [goerli],
  [alchemyProvider({ apiKey: '0R20Qwh34mUfBv0mdMS_lJxrhH--egTt'}), publicProvider()],
)
 
const config = createConfig({
  autoConnect: true,
  connectors: [metaMaskConnector],
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return(
  <WagmiConfig config={config}>
      <Component {...pageProps} />
  </WagmiConfig>
  )
}