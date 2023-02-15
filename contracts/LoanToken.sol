pragma solidity ^0.6.6;

contract LoanToken { 
    uint256 totalMinted; 
    mapping(address => uint256) public balance;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer (
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval (
        address indexed _owner, 
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 startSupply) public { 
        // Initial supply 
        balance[msg.sender] = startSupply;
        totalMinted = startSupply;
    }

    function transfer(address receiver, uint256 val) public returns (bool success) { 
        // not enough funds
        require (balance[msg.sender] >= val, "Not enough funds!");

        balance[msg.sender] -= val;
        balance[receiver] += val; 

        emit Transfer(msg.sender, receiver, val);

        return true; 
    }

    function approve() public pure returns(bool success) { 
        return true; 
    }

    function transferFrom(address sender, address receiver, uint256 val) public returns (bool success) { 
        require(val <= balance[sender], "Sender does not have enough funds");
        require(val <= balance[receiver], "Receiver does not have enough funds");

        balance[sender] -= val; 
        balance[receiver] += val; 
        allowance[sender][msg.sender] =- val; 

        emit Transfer(sender, receiver, val);
        return true; 
    }

    function name() public pure returns (string memory) {
        return "LoanToken";
    }
 
    function symbol() public pure returns (string memory) {
        return "LOAN";
    }
}