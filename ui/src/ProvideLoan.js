import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'

class ProvideLoan extends Component {

    constructor(props) {
        super(props)
        this.state = {
            index: '',
            value: '',
            error: ''
        }
    }

    handleIndexChange(event) {
        this.setState({
            index: event.target.value
        })
    }

    handleValueChange(event) {
        this.setState({
            value: event.target.value
        })
    }

    async handleClick(event) {
        event.preventDefault()
        const isValid = this.validate()
        if (isValid) {
            try {
                this.setState({ error: '' })
                let accounts = await this.props.web3Instance.eth.getAccounts()
                await this.props.loanPlatform.methods.lend(this.state.index).send({ from: accounts[0], value: this.state.value })
            } catch (error) {
                this.setState({ error: 'Transaction failed or canceled. Check that you are submitting from the correct account.' })
                return (<div style={{ fontsize: 12, color: "red" }}>{this.state.error}</div>)
            }
        } else {
            console.log(this.state)
        }

    }

    validate = () => {
        let error = ''
        if (isNaN(parseInt(this.state.index)) || isNaN(parseInt(this.state.value))) {
            error = 'All inputs must be filled in as numeric!'
            this.setState({ error })
            return false
        }
        return true
    }

    render() {
        return (
            <div style={{ color: 'white' }}>
                 Provide Loan
                <form>
                <input
                    id="index"
                    value={this.state.index}
                    onChange={this.handleIndexChange.bind(this)}
                    type="text" className="formControl"
                    placeholder="Loan request ID"
                />
                <input
                    id="value"
                    value={this.state.value}
                    onChange={this.handleValueChange.bind(this)}
                    type="text" className="formControl"
                    placeholder="Confirm transaction value"
                />
                <button onClick={this.handleClick.bind(this)}>Submit</button>
                <div style={{ fontsize: 12, color: "red" }}>{this.state.error}</div>
            </form>
            </div>
        );
    }
}

export default ProvideLoan;
