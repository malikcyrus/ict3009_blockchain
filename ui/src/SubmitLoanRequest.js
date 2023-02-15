import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'

class SubmitLoanRequest extends Component {

    constructor(props) {
        super(props)
        this.state = {
            sum: '',
            interest: '',
            paybackPeriod: '',
            error: ''
        }
    }

    handleSumChange(event) {
        this.setState({
            sum: event.target.value
        })
    }

    handleInterestChange(event) {
        this.setState({
            interest: event.target.value
        })
    }

    handlePaybackPeriodChange(event) {
        this.setState({
            paybackPeriod: event.target.value
        })
    }

    async handleClick(event) {
        event.preventDefault()
        const isValid = this.validate()
        if (isValid) {
            try {
                this.setState({ error: '' })
                let accounts = await this.props.web3Instance.eth.getAccounts()
                await this.props.loanPlatform.methods.submitRequest(this.state.sum, this.state.interest, this.state.paybackPeriod).send({ from: accounts[0] })
            } catch (error) {
                this.setState({ error: 'Transaction failed' })
                return (<div style={{ fontsize: 12, color: "red" }}>{this.state.error}</div>)
            }
        } else {
            console.log(this.state)
        }

    }

    validate = () => {
        let error = ''
        if (isNaN(parseInt(this.state.sum)) || isNaN(parseInt(this.state.interest)) || isNaN(parseInt(this.state.paybackPeriod))) {
            error = 'All inputs must be filled in as numeric!'
            this.setState({ error })
            return false
        }
        return true
    }

    render() {
        return (
            <div style={{ color: 'white' }}>
                 Submit Loan Request
                <form>
                <input
                    id="sum"
                    value={this.state.sum}
                    onChange={this.handleSumChange.bind(this)}
                    type="text" className="formControl"
                    placeholder="Loan value"
                />
                <input
                    id="interest"
                    value={this.state.interest}
                    onChange={this.handleInterestChange.bind(this)}
                    type="text" className="formControl"
                    placeholder="Interest"
                />
                <input
                    id="paybackPeriod"
                    value={this.state.pabackPeriod}
                    onChange={this.handlePaybackPeriodChange.bind(this)}
                    type="text"
                    className="formControl"
                    placeholder="Payback period"
                />
                <button onClick={this.handleClick.bind(this)}>Submit</button>
                <div style={{ fontsize: 12, color: "red" }}>{this.state.error}</div>
            </form>
            </div>
        );
    }
}

export default SubmitLoanRequest;
