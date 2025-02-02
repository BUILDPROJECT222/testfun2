import { useWallet } from '../context/WalletContext';
import WalletInfo from './WalletInfo/WalletInfo';

const SomeComponent = () => {
  const { walletAddress, disconnectWallet } = useWallet();

  return (
    <div>
      <WalletInfo 
        walletAddress={walletAddress} 
        onDisconnect={disconnectWallet} 
      />
      {/* component content */}
    </div>
  );
}; 