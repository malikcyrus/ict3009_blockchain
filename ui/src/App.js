import React, { Component } from 'react'
import * as ReactBootStrap from 'react-bootstrap'
import './App.css'
import { abi, address } from './config'
import Web3 from 'web3'
import ViewLoanRequests from './ViewLoanRequests'
import SubmitLoanRequest from './SubmitLoanRequest'
import Guarantee from './Guarantee'
import Accept from './Accept'
import Reject from './Reject'
import ProvideLoan from './ProvideLoan'
import Payback from './Payback'
import Withdraw from './Withdraw'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            web3Instance: null,
            account: '',
            network: '',
            loanRequestsCount: 0,
            loanRequests: [],
            loading: true
        }
    }

    async componentDidMount() {
        this.loadBlockChainData()
    }

    async loadBlockChainData() {
        // Setup web3, get network and accounts
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545')
        const network = await web3.eth.net.getNetworkType()
        const accounts = await web3.eth.getAccounts()
        this.setState({ network: network })
        this.setState({ account: accounts[0] })
        this.setState({ web3Instance: web3 })

        // Connect to smart contract and store it in state
        const loanPlatform = new web3.eth.Contract(abi, address)
        this.setState({ loanPlatform })

        // Start interaction with smart contract
        let loanRequestsCount = await loanPlatform.methods.getLoanRequestArrayLength().call()

        // Get all loan requests and store them in state
        for (let i = 0; i < loanRequestsCount; i++) {
            const loanRequest = await loanPlatform.methods.viewRequest(i).call()
            this.setState({
                loanRequests: [...this.state.loanRequests, loanRequest]
            })
        }

        // Confirm they have been stored in state
        console.log('Loan requests: ', this.state.loanRequests)

        // Finished loading
        this.setState({ loading: false })
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a className="navbar-brand col-sm-3 col-md-2 mr-0">Loan Platform!</a>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            {/* <small><a className="nav-link" href="#"><span id="account"></span></a></small> */}
                        </li>
                    </ul>
                </nav>
                <div className="grid-container bg-dark">
                    <div className="LoanRequests-Table">
                        {this.state.loading
                            ? <div id="loader" className="text-center"><br/><br/><br/><br/><br/><br/><br/><h3 className="text-center" style={{color: 'white'}}>Loading...</h3></div>
                            : <div><br /><br /><ViewLoanRequests loanRequests={this.state.loanRequests} /></div>
                        }
                    </div>
                    <div id="submit-loan-request">
                        <SubmitLoanRequest loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                    </div>
                    <div id="accept-reject-wrapper">
                        <div id="accept-guarantee">
                            <Accept loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                        </div>
                        <div id="reject-guarantee">
                            <Reject loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                        </div>
                    </div>
                    <div id="payback-loan">
                        <Payback loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                    </div>
                    <div id="guarantee-loan">
                        <Guarantee loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                    </div>
                    <div id="provide-loan">
                        <ProvideLoan loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                    </div>
                    <div id="withdraw-guarantee">
                        <Withdraw loanPlatform={this.state.loanPlatform} web3Instance={this.state.web3Instance} />
                    </div>
                </div>
            </div>
        );
    }
}


export default App;
