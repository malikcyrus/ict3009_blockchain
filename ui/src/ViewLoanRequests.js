import React, { Component } from 'react'
import * as ReactBootStrap from 'react-bootstrap'
import moment from 'moment'


class ViewLoanRequests extends Component {


    constructor(props) {
        super(props)
        this.state = {
        }
    }

    rendertable = (lr, index) => {
        const payBackDate = moment.unix(lr.paybackPeriod).format("DD-MM-YYYY:HH:mm")
        let status = lr.status
        switch (lr.status) {
            case '0':
                status = 'No guarantee'
                break
            case '1':
                status = 'Guaranteed'
                break
            case '2':
                status = 'Loan provided'
                break
            case '3':
                status = 'Paid back'
                break
            default:
                break
        }

        return (
            <tr key={index}>
                <td>{index}</td>
                <td>{lr.sum}</td>
                <td>{lr.interest}</td>
                <td>{lr.guarantorInterest}</td>
                <td>{lr.lenderInterest}</td>
                <td>{status}</td>
                <td>{payBackDate}</td>
                <td>{lr.borrower}</td>
                <td>{lr.guarantor}</td>
                <td>{lr.lender}</td>
            </tr>
        )
    }

    render() {
        return (
            <div className="card bg-dark">
                <div className="card-body">
                    <div className="table-responsive" style={{height: '400px'}}>
                        <ReactBootStrap.Table className="table table-sm" striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Sum</th>
                                    <th>Interest</th>
                                    <th>GuarantorInterest</th>
                                    <th>lenderInterest</th>
                                    <th>Status</th>
                                    <th>Expires</th>
                                    <th>Borrower</th>
                                    <th>Guarantor</th>
                                    <th>Lender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.loanRequests.map(this.rendertable)}
                            </tbody>
                        </ReactBootStrap.Table>
                    </div>
                </div>
            </div>

        )
    }

}

export default ViewLoanRequests;
