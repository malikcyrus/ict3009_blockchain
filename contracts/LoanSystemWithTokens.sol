pragma solidity ^0.6.6;

import './LoanToken.sol';

contract LoanSystemWithTokens { 
    
    Loan[] loanRequests; 
    LoanToken token;
    address owner; 

    struct Loan { 
    address payable borrower; 
    address payable guarantor; 
    address payable lender; 
    uint256 loan; 
    uint256 interest;
    uint256 paybackLength; 
    uint256 guarantorInterest; 
    uint256 lenderInterest; 
    uint256 stateOfLoan; // // 0 = has no accepted guarantee, 1 = has an accepted guarantee, 2 = has been provided a loan, 3 = has been paid back by borrower, 4 = borrower has missed the payback period
    }

    constructor() public { 
        owner = msg.sender;
    }

    function setLoanTokens(address loanTokenContract) public { 
        require(msg.sender == owner, "Only the owner can create LoanTokens!");
        token = LoanToken(loanTokenContract);
    }

    modifier validIdx(uint256 index) {
        require(IndexInRange(index) == true, "Valid Index! No loan request at that position");
        _;
    }
    
    modifier isBorrower(uint256 idx) { 
        require(msg.sender == loanRequests[idx].borrower, "Needs to be a borrower");
        _; 
    }

    function IndexInRange(uint256 idx) public view returns(bool valid) { 
        if (idx < loanRequests.length) { return true; }
        return false; 
    }


    function requestLoan(uint256 loan, uint256 interest, uint256 paybackLength) public { 
        require(loan > 0, "Invalid Loan Amount");
        loanRequests.push(Loan(msg.sender, address(0), address(0), loan, interest, (now + paybackLength), 0, 0, 0));
    }

    function viewLoanRequests(uint256 idx) public view returns(address borrower, address guarantor, address lender, uint256 sum , uint256 interest, uint256 paybackPeriod, uint256 guarantorInterest, uint256 lenderInterest, uint256 status) { 
        Loan memory lr = loanRequests[idx];    // this prevents stack from getting too deep
        return(lr.borrower,
            lr.guarantor,
            lr.lender,
            lr.loan,
            lr.interest,
            lr.paybackLength,
            lr.guarantorInterest,
            lr.interest - lr.guarantorInterest,
            lr.stateOfLoan);
    }

    function guaranteeLoan(uint256 idx, uint256 guaranteeInterest) public payable {
        require(msg.value == loanRequests[idx].loan, "Invalid Funds Transferred! Funds transffered is not equal to loan request");
        require(msg.sender != loanRequests[idx].borrower, "Invalid Guarantee! Borrower cannot guarantee");
        require(loanRequests[idx].guarantor == address(0), "Loan already being guaranteed!");
        require(guaranteeInterest < loanRequests[idx].interest, "Guarantor Interest too high"); 
        require(now < loanRequests[idx].paybackLength, "Loan Expired");
        loanRequests[idx].guarantor = msg.sender; 
        loanRequests[idx].guarantorInterest = guaranteeInterest;
    
        token.transferFrom(msg.sender, address(this), loanRequests[idx].loan);
    }

    function grantLoan(uint256 idx) public payable{ 
        require(msg.value == loanRequests[idx].loan, "Invalid Funds Transferred! Funds transffered is not equal to loan request");
        require(msg.sender == loanRequests[idx].lender, "You are not the lender!");
        require(loanRequests[idx].stateOfLoan == 1, "The guarantee has either not yet been accepted, or a loan has already been provided!");
        require(now < loanRequests[idx].paybackLength, "Loan Expired!");
        loanRequests[idx].stateOfLoan = 2; 
        loanRequests[idx].lender = msg.sender; 
        loanRequests[idx].lenderInterest = loanRequests[idx].interest - loanRequests[idx].guarantorInterest;
        
        token.transferFrom(loanRequests[idx].lender, loanRequests[idx].borrower, loanRequests[idx].loan);
    }

    function acceptGuarantee(uint256 idx) public {
        require(loanRequests[idx].stateOfLoan == 0, "Loan has an already accepted guarantee");
        loanRequests[idx].stateOfLoan = 1;
    }

    function rejectGuarantee(uint256 idx) public { 
        require((loanRequests[idx].stateOfLoan != 2) && (loanRequests[idx].stateOfLoan != 3), "Loan Provided. Cannot reject guarantee");
        require(loanRequests[idx].stateOfLoan != 0, "No Guarantee present");
        loanRequests[idx].stateOfLoan = 0; 
        loanRequests[idx].guarantorInterest = 0; 
        token.transfer(loanRequests[idx].guarantor, loanRequests[idx].loan);
        loanRequests[idx].guarantor = address(0);
    }

    function payLoan(uint256 idx) public validIdx(idx) isBorrower(idx) payable { 
        require(msg.value == (loanRequests[idx].loan + loanRequests[idx].interest), "Insufficient funds transferred!");
        require(loanRequests[idx].stateOfLoan == 2, "Loan paid already or No Loan has been granted");
        loanRequests[idx].stateOfLoan = 3; 

        // transfering loan tokens
        token.transferFrom((address(this)), loanRequests[idx].guarantor, loanRequests[idx].loan);
        token.transferFrom(loanRequests[idx].borrower, loanRequests[idx].guarantor, loanRequests[idx].guarantorInterest);
        token.transferFrom(loanRequests[idx].borrower, loanRequests[idx].lender, loanRequests[idx].loan + loanRequests[idx].lenderInterest);
    }

    function payLoanWithNFT(uint256 idx) public validIdx(idx) isBorrower(idx) payable { 

    }

    function missedPaybackDate(uint256 idx) public validIdx(idx) { 
        require(loanRequests[idx].stateOfLoan == 2, "Loan already paid!");
        require(now > loanRequests[idx].paybackLength, "Payback period not over yet!");
        require(msg.sender == loanRequests[idx].lender, "You are not the lender");
        loanRequests[idx].stateOfLoan = 4; 
        
        token.transferFrom(address(this), loanRequests[idx].lender, loanRequests[idx].loan);
    } 

    // 
}