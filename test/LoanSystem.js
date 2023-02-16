const LoanSystem = artifacts.require('LoanSystem')

contract('LoanSystem', async accounts => {
    let instance
    let borrower = accounts[0]
    let guarantor = accounts[1]
    let lender = accounts[2]
    let thirdParty = accounts[3]

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    it('should initialize the loanRequests array to be empty', async () => {
        instance = await LoanSystem.deployed()
        let len = await instance.getNumberOfLoanRequests();
        assert.equal(len, 0);
    })

    it('should not allow a borrower to submit a loanRequest of 0 ETH', async () => {
        instance = await LoanSystem.deployed();
        try {
            await instance.requestLoan(0, web3.utils.toWei('0.5', 'ether'), 5, {from: borrower})
        } catch (error) {
            assert.equal('Invalid Loan Amount', error.reason);
        }
    })

    it('should push a LoanRequest struct onto the requests array when a borrower submits a loan request', async () => {
        instance = await LoanSystem.deployed()
        await instance.requestLoan(web3.utils.toWei('2', 'ether'), web3.utils.toWei('0.5', 'ether'), 50, { from: borrower })
        let arrayLength = await instance.getNumberOfLoanRequests()
        assert.equal(arrayLength, 1)
    })

    it('should prevent a guarantor from requesting all the available interest', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.guaranteeLoan(0, web3.utils.toWei('0.5', 'ether'), { from: guarantor, value: web3.utils.toWei('2', 'ether') })
        } catch(error) {
            assert.equal('Guarantor Interest too high', error.reason)
        }
    })

    it('should block guarantees that are less than the loan value', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.guaranteeLoan(0, web3.utils.toWei('0.25', 'ether'), { from: guarantor, value: web3.utils.toWei('1', 'ether') })
        } catch(error) {
            assert.equal('Invalid Funds Transferred! Funds transffered is not equal to loan request', error.reason)
        }
    })

    it('should block guarantees that are greater than the loan value', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.guaranteeLoan(0, web3.utils.toWei('0.25', 'ether'), { from: guarantor, value: web3.utils.toWei('3', 'ether') })
        } catch(error) {
            assert.equal('Invalid Funds Transferred! Funds transffered is not equal to loan request', error.reason)
        }
    })

    it('should stop the borrower from guaranteeing their own loan request', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.guaranteeLoan(0, web3.utils.toWei('0.25', 'ether'), { from: borrower, value: web3.utils.toWei('2', 'ether') })
        } catch(error) {
            assert.equal('Invalid Guarantee! Borrower cannot guarantee', error.reason)
        }
    })

    it('should allow a guarantor to place a guarantee on a LoanRequest', async () => {
        instance = await LoanSystem.deployed()
        await instance.guaranteeLoan(0, web3.utils.toWei('0.25', 'ether'), { from: guarantor, value: web3.utils.toWei('2', 'ether') })
        let ret = await instance.viewLoanRequests(0)
        assert.equal(guarantor, ret.guarantor)
        assert.equal(0, ret.stateOfLoan)     
        assert.equal(web3.utils.toWei('0.25', 'ether'), ret.guarantorInterest)   
    })

    it('should block other guarantees once a guarantee has been placed but not yet accepted', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.guaranteeLoan(0, web3.utils.toWei('0.25', 'ether'), { from: thirdParty, value: web3.utils.toWei('2', 'ether') })
        } catch (error) {
            assert.equal('Loan already being guaranteed!', error.reason)
        }
    })

    it('should allow the borrower to successfully accept a guarantee', async () => {
        instance = await LoanSystem.deployed()
        await instance.acceptGuarantee(0)
        let ret = await instance.viewLoanRequests(0)
        assert.equal(1, ret.stateOfLoan)
    })

    it('should block loans that are not exactly equal to the loan value', async () => {
        instance = await LoanSystem.deployed()
        try { 
            await instance.grantLoan(0, { from: borrower, value: web3.utils.toWei('1', 'ether') }) 
        } catch (error) {
            assert.equal('Invalid Funds Transferred! Funds transffered is not equal to loan request', error.reason) 
        }
        try {
            await instance.grantLoan(0, { from: borrower, value: web3.utils.toWei('3', 'ether') })
        } catch (error) {
            assert.equal('Invalid Funds Transferred! Funds transffered is not equal to loan request', error.reason)
        }
    })

    it('should stop the borrower or guarantor from providing the loan', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.grantLoan(0, { from: borrower, value: web3.utils.toWei('2', 'ether') })
        } catch (error) {
            assert.equal('You are not the lender!', error.reason)
        }
        try {
            await instance.grantLoan(0, { from: guarantor, value: web3.utils.toWei('2', 'ether')})
        } catch (error) {
            assert.equal('You are not the lender!', error.reason)
        }
    })

    it('should clear the guarantor address and return their funds upon guarantee rejection', async () => {
        instance = await LoanSystem.deployed()
        // get guarantor balance before rejection
        let guarantorBalBefore = await web3.eth.getBalance(guarantor)
        guarantorBalBefore =  web3.utils.fromWei(guarantorBalBefore, 'ether')
        // reject their guarantee
        await instance.rejectGuarantee(0, { from: borrower })
        let ret = await instance.viewLoanRequests(0)
        assert.equal(ret.guarantor, '0x0000000000000000000000000000000000000000')
        // get guarantor balance after rejection
        let guarantorBalAfter = await web3.eth.getBalance(guarantor)
        guarantorBalAfter =  web3.utils.fromWei(guarantorBalAfter, 'ether')

        assert.equal((guarantorBalAfter - guarantorBalBefore).toFixed(2), 2)
    })

    it('should prevent the lender from rejecting a guarantee more than once', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.rejectGuarantee(0, { from: borrower })
        } catch (error) {
            assert.equal('No Guarantee present', error.reason)
        }
    })

    it('should update LoanRequest stateOfLoan upon loan and transfer the funds to borrower', async () => {
        instance = await LoanSystem.deployed()
        await instance.guaranteeLoan(0, web3.utils.toWei('0.25', 'ether'), { from: guarantor, value: web3.utils.toWei('2', 'ether') })
        await instance.acceptGuarantee(0, { from: borrower })

        let borrowerBalBefore = await web3.eth.getBalance(borrower)
        borrowerBalBefore =  web3.utils.fromWei(borrowerBalBefore, 'ether')
        let lenderBalBefore = await web3.eth.getBalance(lender)
        lenderBalBefore =  web3.utils.fromWei(lenderBalBefore, 'ether')

        await instance.grantLoan(0, { from: lender, value: web3.utils.toWei('2', 'ether') })
        let ret = await instance.viewLoanRequests(0)
        assert.equal(ret.stateOfLoan, 2)

        let borrowerBalAfter = await web3.eth.getBalance(borrower)
        borrowerBalAfter =  web3.utils.fromWei(borrowerBalAfter, 'ether')
        let lenderBalAfter = await web3.eth.getBalance(lender)
        lenderBalAfter =  web3.utils.fromWei(lenderBalAfter, 'ether')

        assert.equal((borrowerBalAfter - borrowerBalBefore).toFixed(2), 2)
        assert.equal((lenderBalBefore - lenderBalAfter).toFixed(2), 2)
    })

    it('should associate the lender with the relavent LoanRequest', async () => {
        instance = await LoanSystem.deployed()
        let ret = await instance.viewLoanRequests(0)
        assert.equal(ret.lender, lender)
    })

    it('should prevent the borrower from rejecting a guarantee once the loan is provided', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.rejectGuarantee(0, { from: borrower })
        } catch (error) {
            assert.equal('Loan Provided. Cannot reject guarantee', error.reason)
        }
    })

    it('should only allow the borrower to pay back the loan', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.payLoan(0, { from: lender })
        } catch (error) {
            assert.equal('Needs to be a borrower', error.reason)
        }
        try {
            await instance.payLoan(0, { from: guarantor })
        } catch (error) {
            assert.equal('Needs to be a borrower', error.reason)
        }
    })

    it('should prevent the borrower from paying back any amount less than loan value + total interest', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.payLoan(0, { from: borrower, value: web3.utils.toWei('2', 'ether')})
        } catch (error) {
            assert.equal('Insufficient funds transferred!', error.reason)
        }
    })

    it('should transfer back (funds + interest) to lender and guarantor upon payback', async () => {
        instance = await LoanSystem.deployed()
        // get guarantor and lender balances before payback
        let guarantorBalBefore = await web3.eth.getBalance(guarantor)
        guarantorBalBefore =  web3.utils.fromWei(guarantorBalBefore, 'ether')
        let lenderBalBefore = await web3.eth.getBalance(lender)
        lenderBalBefore =  web3.utils.fromWei(lenderBalBefore, 'ether')
        // payback loan
        await instance.payLoan(0, { from: borrower, value: web3.utils.toWei('2.5', 'ether')})
        // get guarantor and lender balances after payback
        let guarantorBalAfter = await web3.eth.getBalance(guarantor)
        guarantorBalAfter =  web3.utils.fromWei(guarantorBalAfter, 'ether')
        let lenderBalAfter = await web3.eth.getBalance(lender)
        lenderBalAfter =  web3.utils.fromWei(lenderBalAfter, 'ether')

        assert.equal((guarantorBalAfter - guarantorBalBefore).toFixed(2), 2.25)
        assert.equal((lenderBalAfter - lenderBalBefore).toFixed(2), 2.25)
    })

    it('should update LoanRequest stateOfLoan to reflect being paid back', async () => {
        instance = await LoanSystem.deployed()
        let ret = await instance.viewLoanRequests(0)
        assert.equal(ret.stateOfLoan, 3)
    })

    it('should prevent lender from withdrawing guarantee if loan is already paid back', async () => {
        instance = await LoanSystem.deployed()
        try {
            await instance.missedPaybackDate(0, { from: lender })
        } catch (error) {
            assert.equal('Loan already paid!', error.reason)
        }
    })

    it('should prevent a lender from providing a loan until borrower accepts a guarantee', async () => {
        instance = await LoanSystem.deployed()
        await instance.requestLoan(web3.utils.toWei('2', 'ether'), web3.utils.toWei('0.5', 'ether'), 10, { from: borrower })
        await instance.guaranteeLoan(1, web3.utils.toWei('0.25', 'ether'), { from: guarantor, value: web3.utils.toWei('2', 'ether') })
        try {
            await instance.grantLoan(1, { from: lender, value: web3.utils.toWei('2', 'ether') })
        } catch(error) {
            assert.equal('The guarantee has either not yet been accepted, or a loan has already been provided!', error.reason)
        }
    })

    it('should prevent lender from withdrawing guarantee if paybackLength is not over', async () => {
        instance = await LoanSystem.deployed()
        await instance.acceptGuarantee(1, { from: borrower })
        await instance.grantLoan(1, { from: lender, value: web3.utils.toWei('2', 'ether') })
        try {
            await instance.missedPaybackDate(1, { from: lender })
        } catch(error) {
            assert.equal('Payback period not over yet!', error.reason)
        }
    })

    it('should allow only the lender to withdraw guarantee', async () => {
        console.log("[+] Waiting 10 seconds for paybackLength to expire...");
        await timeout(10000);
        instance = await LoanSystem.deployed()
        try {
            await instance.missedPaybackDate(1, { from: borrower })
        } catch(error) {
            assert.equal('You are not the lender!', error.reason)
        }
        try {
            await instance.missedPaybackDate(1, { from: guarantor })
        } catch(error) {
            assert.equal('You are not the lender!', error.reason)
        }
        try {
            await instance.missedPaybackDate(1, { from: thirdParty })
        } catch(error) {
            assert.equal('You are not the lender!', error.reason)
        }
    })

    it('should prevent a guarantor from providing funds for an expired loan request', async () => {
        instance = await LoanSystem.deployed()
        await instance.requestLoan(1000, 100, 1, { from: borrower })
        await timeout(5000);
        console.log("[+] Waiting a bit more for another loan request to expire...");
        try {
            await instance.guaranteeLoan(2, 50, { from: guarantor, value: 1000 })
        } catch(error) {
            assert.equal('Loan Expired', error.reason)
        }
    })
})