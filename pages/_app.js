// pages/_app.js
// pages/_app.js
// import "@/styles/globals.css";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { PrimeReactProvider } from 'primereact/api';

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
<WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrimeReactProvider>
          <Component {...pageProps} />
        </PrimeReactProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default MyApp;