import React, {Component} from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";

import "./App.css";

var _modifyVotingCount = (candidates, i, votingCount) => {

  let obj = candidates[i];
  obj.votingCount = votingCount;
  return candidates;
}

class App extends Component {
  state = {
    candidates: [
      {
        "name": "ZhuZhu",
        "id": 100,
        "votingCount": 0
      }, {
        "name": "Shimmer",
        "id": 101,
        "votingCount": 0
      }, {
        "name": "PigPig",
        "id": 102,
        "votingCount": 0
      }, {
        "name": "ShuoShuo",
        "id": 103,
        "votingCount": 0
      }
    ],
    candidatesVoteCount: [
      "0", "0", "0", "0"
    ],
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(VotingContract.abi, deployedNetwork && deployedNetwork.address,);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        accounts,
        contract: instance
      }, this.readInitialVotingCount);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
      console.error(error);
    }
  };

  readInitialVotingCount = async () => {
    const {accounts, contract} = this.state;

    for (let i = 0; i < this.state.candidates.length; i++) {
      let object = this.state.candidates[i];
      var result = await contract.methods.totalVotesFor(object.name).call();
      console.log(result);
      this.setState({
        candidates: _modifyVotingCount(this.state.candidates, i, result)
      });
    }
    console.log(this.state.candidates);
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    // alert('A name was submitted: ' + this.state.value);

    let candidateName = this.refs.candidateInput.value;
    const {accounts, contract} = this.state;

    await contract.methods.voteForCandidate(candidateName).send({from:accounts[0]});

    this.readInitialVotingCount();

  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (<div className="App">
      <ul>
        {
          this.state.candidates.map((object) => {
            console.log(object);
            return (<li key={object.id}>候选人：{object.name}
              支持票数：{object.votingCount}</li>)
          })
        }
      </ul>

      <input style={{
          width: 200,
          height: 30,
          borderWidth: 2,
          marginLeft: 40
        }} placeholder="请输入候选人姓名..." ref="candidateInput"/>

      <button style={{
          height: 30,
          borderWidth: 2,
          marginLeft: 20
        }} onClick={this.handleSubmit}>Voting</button>

    </div>);
  }
}

export default App;
