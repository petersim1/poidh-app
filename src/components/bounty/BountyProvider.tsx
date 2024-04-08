import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { fetchBountyById, getParticipants } from '@/app/context/web3';
import { Bounty } from '@/types/web3';


interface BountyContextType {
  bountyData: Bounty | null;
  isOwner: boolean;
  isMultiplayer: boolean | null;
  isBountyClaimed: boolean | null;
}


const BountyContext = createContext<BountyContextType | null>(null);

export const useBountyContext = () => useContext(BountyContext);


export const BountyProvider = ({ bountyId, children }: { bountyId: string, children: ReactNode }) => {
  const [bountyData, setBountyData] = useState<Bounty | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isBountyClaimed, setIsBountyClaimed] = useState<boolean | null>(null); 

  const { user } = useDynamicContext();
  const currentUser = user?.verifiedCredentials[0].address;

  useEffect(() => {
    if (bountyId) {
      fetchBountyById(bountyId).then(data => {
        setBountyData(data);
        setIsOwner(currentUser === data.issuer);
        setIsBountyClaimed(data.claimer !== "0x0000000000000000000000000000000000000000");
      }).catch(console.error);

      getParticipants(bountyId).then((openBounty) => {
        setIsMultiplayer(openBounty.addresses.length > 0);
      }).catch(console.error);
    }
  }, [bountyId, currentUser]);

  return (
    <BountyContext.Provider value={{ bountyData, isOwner, isMultiplayer, isBountyClaimed }}>
      {children}
    </BountyContext.Provider>
  );
};