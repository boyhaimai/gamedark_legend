import NFT from "./NFT";

const Store = () => {
  // const [selectedNFT, setSelectedNFT] = useState<NFTType | null>(null);
  // const [showInventory, setShowInventory] = useState(true);
  // const [animationType, setAnimationType] = useState<"fade-up" | "slide-left">(
  //   "fade-up"
  // );

  // const handleSelectNFT = (nft: NFTType) => {
  //   setSelectedNFT(nft);
  //   setShowInventory(false);
  // };

  // const handleCloseDetail = () => {
  //   setAnimationType("slide-left");
  //   setSelectedNFT(null);
  //   // Reset animation type for inventory
  //   setTimeout(() => {
  //     setAnimationType("fade-up");
  //     setShowInventory(true);
  //   }, 400);
  // };

  return (
    <>
      {/* {showInventory && <NFT onSelectNFT={handleSelectNFT} />} */}
      <NFT />
      {/* {selectedNFT && (
        <NFTDetail
          data={selectedNFT}
          onClose={handleCloseDetail}
          animationType={animationType}
        />
      )} */}
    </>
  );
};

export default Store;
