pragma solidity ^0.6.6;

// import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

// contract LoanNFTToken is ERC721 {
//     uint256 totalMinted; 

//     mapping (uint256 => uint256) public tokenIdToPrice;
//     mapping (address => uint256) public nftOf; 
 
//     event NftBought (
//         address _seller,
//         address _buyer,
//         uint256 _price
//     );

//     event Transfer(
//         address _from,
//         address _to,
//         uint256 _tokenId
//     );

//     constructor(uint256 startSupply) ERC721('MyToken', 'MyT') {
//         _mint(msg.sender, 1);
//     }

//     function allowBuy(uint256 _tokenId, uint256 _price) external {
//         require(msg.sender == ownerOf(_tokenId), 'Not owner of this token');
//         require(_price > 0, 'Price zero');
//         tokenIdToPrice[_tokenId] = _price;
//     }

//     function disallowBuy(uint256 _tokenId) external {
//         require(msg.sender == ownerOf(_tokenId), 'Not owner of this token');
//         tokenIdToPrice[_tokenId] = 0;
//     }
    
//     function transferNFT(uint256 _tokenId, address _to) external {
//         require(msg.sender == ownerOf(_tokenId), "Not owner of this token");
//        
//         address _from = ownerOf(_tokenId);
//         _transfer(_from, _to, _tokenId);
//         tokenIdToPrice[_tokenId] = 0; // not for sale anymore

//         emit Transfer(_from, _to, _tokenId);
//     }
// }