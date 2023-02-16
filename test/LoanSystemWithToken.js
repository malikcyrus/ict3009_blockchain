const LoanToken = artifacts.require('LoanToken')

contract('LoanToken', async accounts => {
    let instance_token

    it('should initialize the contract with valid values', function () { 
        return LoanToken.deployed().then(function(instance) {
            instance_token = instance
            return instance_token.name()
        }).then(function(name) { 
            assert.equal(name, 'LoanToken', 'has the expected name')
            return instance_token.symbol()
        }).then(function(symbol) { 
            assert.equal(symbol, 'LOAN', 'has the expected symbol')
        }) 
    })

    it('should transfer ownership of token correctly', function() {
        return LoanToken.deployed().then(function(instance) { 
            instance_token = instance
            return instance_token.transfer.call(accounts[1], 999999999)
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >=0, 'Funds have not been reverted')
            return instance_token.transfer.call(accounts[1], 250000, { from: accounts[0] })
        }).then(function(success) {
            assert.equal(success, true, "Returned true")
            return instance_token.transfer(accounts[1], 250000, { from: accounts[0]})
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, "triggers an event")
            assert.equal(receipt.logs[0].event, 'Transfer', 'Transfer event expected')
            assert.equal(receipt.logs[0].args.sender, accounts[0], 'account tokens are transferred from')
            assert.equal(receipt.logs[0].args.receiver, accounts[1], 'account tokens are transferred to')
            assert.equal(receipt.logs[0].args.val, accounts[0], 'Amount transferred')
            return instance_token.balanceOf(accounts[1])
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'Checking Receiver\'s balance')
            return instance_token.balanceOf(accounts[0])
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 75000, 'Checking Sender has the expected balance after sending')
        })
    })
    
})