import React, { Component } from 'react'
import 'bootstrap/dist/css/bootstrap.css'

class Withdraw extends Component {

    constructor(props) {
        super(props)
        this.state = {
            index: '',
            error: ''
        }
    }

    handleIndexChange(event) {
        this.setState({
            index: event.target.value
        })
    }

    async handleClick(event) {
        event.preventDefault()
        const isValid = this.validate()
        if (isValid) {
            try {
                this.setState({ error: '' })
                let accounts = await this.props.web3Instance.eth.getAccounts()
                await this.props.loanPlatform.methods.missedPayback(this.state.index).send({ from: accounts[0] })
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
        if (isNaN(parseInt(this.state.index))) {
            error = 'All inputs must be filled in as numeric!'
            this.setState({ error })
            return false
        }
        return true
    }

    render() {
        return (
            <div style={{ color: 'white' }}>
                 Withdraw Guarantee
                <form>
                <input
                    id="index"
                    value={this.state.index}
                    onChange={this.handleIndexChange.bind(this)}
                    type="text" className="formControl"
                    placeholder="Loan request ID"
                />
                <button onClick={this.handleClick.bind(this)}>Submit</button>
                <div style={{ fontsize: 12, color: "red" }}>{this.state.error}</div>
            </form>
            </div>
        );
    }
}

export default Withdraw;
