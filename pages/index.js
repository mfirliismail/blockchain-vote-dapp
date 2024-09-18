
import dynamic from 'next/dynamic';


const Wagmi = dynamic(() => import("./components/Wagmi"), {
  ssr: false,
});

export default function Home() {

  return (
    <div>
     <Wagmi></Wagmi>
    </div>
  );
}
