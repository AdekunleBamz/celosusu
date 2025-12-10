'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useFarcasterFrame } from '@/hooks/useFarcaster';
import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';
import { useUserCircles, useOpenCircles, useTotalCircles } from '@/hooks/useContracts';
import { Header } from '@/components/Header';
import { CircleCard } from '@/components/CircleCard';
import { CreateCircleModal } from '@/components/CreateCircleModal';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TabNav } from '@/components/TabNav';
import { WalletModal } from '@/components/WalletModal';

type Tab = 'my-circles' | 'discover' | 'create';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  const { context, autoConnect, isConnecting, connectWallet, error } = useFarcasterFrame();
  const { context: sdkContext, isReady: sdkReady } = useFarcasterSDK();
  const { address, isConnected } = useAccount();
  
  // Fetch data
  const { data: userCircles, isLoading: loadingUserCircles, refetch: refetchUserCircles } = useUserCircles(address);
  const { data: openCircles, isLoading: loadingOpenCircles, refetch: refetchOpenCircles } = useOpenCircles(0, 50);
  const { data: totalCircles } = useTotalCircles();

  // Auto-connect in Farcaster miniapp
  useEffect(() => {
    if (sdkContext.isSDK && sdkReady && !isConnected && !isConnecting) {
      console.log('In Farcaster miniapp, auto-connecting wallet...');
      autoConnect();
    }
  }, [sdkContext.isSDK, sdkReady, isConnected, isConnecting, autoConnect]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refetchUserCircles();
    refetchOpenCircles();
    setActiveTab('my-circles');
  };

  const handleGetStartedClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletSelect = (connector: any) => {
    connectWallet(connector);
    setShowWalletModal(false);
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="text-7xl mb-6 float">🏦</div>
          <h2 className="text-3xl font-display font-bold text-susu-cream mb-3 text-center">
            Welcome to CeloSusu
          </h2>
          <p className="text-susu-cream/70 text-center mb-8 max-w-md leading-relaxed">
            Join savings circles with friends and family. Pool funds, earn yield, and build financial community together.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">👥</div>
              <p className="text-xs text-susu-cream/60">3-12 Members</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🌱</div>
              <p className="text-xs text-susu-cream/60">Earn Yield</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔄</div>
              <p className="text-xs text-susu-cream/60">Weekly Cycles</p>
            </div>
          </div>

          {/* Get Started Button */}
          <button
            onClick={handleGetStartedClick}
            disabled={isConnecting}
            className="btn-primary text-lg py-4 px-8 flex items-center gap-3"
          >
            {isConnecting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Get Started</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-susu-cream/50 mt-4 text-center">
            Connect your wallet to create or join savings circles
          </p>
        </div>
      );
    }

    if (activeTab === 'my-circles') {
      if (loadingUserCircles) {
        return <LoadingState />;
      }
      
      if (!userCircles || userCircles.length === 0) {
        return (
          <EmptyState
            icon="🔮"
            title="No circles yet"
            description="Join an existing circle or create your own to get started"
            actionLabel="Browse Circles"
            onAction={() => setActiveTab('discover')}
          />
        );
      }

      return (
        <div className="space-y-4">
          {userCircles.map((circleAddress) => (
            <CircleCard
              key={circleAddress}
              circleAddress={circleAddress}
              userAddress={address}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'discover') {
      if (loadingOpenCircles) {
        return <LoadingState />;
      }

      if (!openCircles || openCircles.length === 0) {
        return (
          <EmptyState
            icon="🌍"
            title="No open circles"
            description="Be the first to create a savings circle!"
            actionLabel="Create Circle"
            onAction={() => setShowCreateModal(true)}
          />
        );
      }

      return (
        <div className="space-y-4">
          {openCircles.map((circleAddress) => (
            <CircleCard
              key={circleAddress}
              circleAddress={circleAddress}
              userAddress={address}
              showJoinButton
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen safe-top safe-bottom">
      <Header />
      
      {isConnected && (
        <>
          {/* Stats Bar */}
          <div className="px-4 py-3 border-b border-susu-gold/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-susu-cream/60">
                Total Circles: <span className="text-susu-gold font-semibold">{totalCircles?.toString() || '0'}</span>
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 text-susu-gold font-medium"
              >
                <span className="text-lg">+</span>
                Create
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { id: 'my-circles', label: 'My Circles', count: userCircles?.length },
              { id: 'discover', label: 'Discover', count: openCircles?.length },
            ]}
          />
        </>
      )}

      {/* Main Content */}
      <div className="px-4 py-6">
        {renderContent()}
      </div>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <CreateCircleModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletSelect}
          isConnecting={isConnecting}
          error={error}
        />
      )}
    </main>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card shimmer h-40" />
      ))}
    </div>
  );
}
