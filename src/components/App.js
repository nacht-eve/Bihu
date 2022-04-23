import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { Card, Grid } from 'semantic-ui-react';
import Identicon from 'identicon.js';
import Navbar from './Navbar';
import 'semantic-ui-css/semantic.min.css';
import Bihu from '../abis/Bihu.json';
import { NavLink } from 'react-router-dom';
import Route from 'react-router-dom/Route';
import Answers from './Answers.js'

class App extends Component
{
  async componentWillMount()
  {
    await this.loadWeb3()
    await this.loadBlockchainData()
    //this.renderQuestions()
  }

  async loadWeb3()
  {
    if (window.ethereum)
    {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3)
    {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else
    {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData()
  {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Bihu.networks[networkId]
    if (networkData)
    {
      const bihu = web3.eth.Contract(Bihu.abi, networkData.address)
      this.setState({ bihu })
      // Load Posts
      const p = await bihu.methods.postCountQuestion().call()
      const postCountQuestion = p.toNumber()
      this.setState({ postCountQuestion })
      for (var i = 1; i <= postCountQuestion; i++)
      {
        const post = await bihu.methods.questions(i).call()
        this.setState({
          posts: [...this.state.posts, post.question],
          labels: [...this.state.labels, post.label],
          ask: [...this.state.ask, post.author],
          q: [...this.state.q, post.ansCount.toNumber()]
        })
        const ansCount = post.ansCount
        ansCount = ansCount.toNumber()
        if (ansCount > 0)
        {
          let arr_ans = [] // To store answers of question 1 at index 1 and so on
          let arr_tip = []
          let arr_author = []
          for (var j = 1; j <= ansCount; j++)
          {
            const ans = await bihu.methods.getAnswer(i, j).call()
            arr_ans.push(ans[1])
            arr_tip.push(ans[2])
            arr_author.push(ans[3])
          }
          this.state.answers[i] = arr_ans
          this.state.tipAmounts[i] = arr_tip
          this.state.authors[i] = arr_author
        }
      }

      // Sort posts. Show highest tipped posts first
      this.setState({
        posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount)
      })
    }
    else
    {
      window.alert('Bihu contract not deployed to detected network.')
    }
  }

  async createQuestion(content, label)
  {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Bihu.networks[networkId]
    const bihu = web3.eth.Contract(Bihu.abi, networkData.address)
    this.setState({ bihu })
    await bihu.methods.createQuestion(content, label).send({ from: this.state.account }).then(setTimeout(function () { window.location.reload(true) }, 29000))
  }

  async createResults(searching)
  {
    this.setState({searched: true});
    await this.setState({searchingresult: []});
    if(searching.length > 0)
    {
      for(var i = 0; i < this.state.postCountQuestion; i++)
      {
        if(stringMatching(this.state.posts[i], searching) || stringMatching(this.state.labels[i], searching))
        {
          this.setState({
            searchingresult: [...this.state.searchingresult, this.state.posts[i]]
          })
        }
      } 
    }
    this.forceUpdate();
  }

  renderQuestions()
  {
    const isSearched = this.state.searched;
    if(!isSearched){
      const items = this.state.posts.map((post, index) =>
      {
        return{
          header: (<div><h3>Question : {post}</h3></div>),
          description: (
            <div>
              <hr />
              <NavLink to={`/answer/${index + 1}`} activeStyle={{ color: 'green' }}>
                <h5>
                  View Answers
                </h5>
              </NavLink>
              <Route path={`/answer/${index + 1}`} exact strict component={this.renderAnswers} />
            </div>

          ),
          meta: (
            <div>
              <hr size="20" noshade />
              Author :
            <img
                className='ml-2'
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.state.ask[index], 30).toString()}`}
              />
              {this.state.ask[index]}
            </div>),
          fluid: true
        };
      })
      return <Card.Group items={items} />;
    }
    else {
      const items = this.state.searchingresult.map((post, index) =>
      {
        var _index;
        for(var i = 0; i < this.state.postCountQuestion; i++){
          if(this.state.posts[i] === this.state.searchingresult[index]){
            _index = i 
          }
        }
        return{
          header: (<div><h3>Question : {post}</h3></div>),
          description: (
            <div>
              <hr />
              <NavLink to={`/answer/${_index + 1}`} activeStyle={{ color: 'green' }}>
                <h5>
                  View Answers
                </h5>
              </NavLink>
              <Route path={`/answer/${_index + 1}`} exact strict component={this.renderAnswers} />
            </div>

          ),
          meta: (
            <div>
              <hr size="20" noshade />
              Author :
            <img
                className='ml-2'
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.state.ask[_index], 30).toString()}`}
              />
              {this.state.ask[_index]}
            </div>),
          fluid: true
        };
      })
      return <Card.Group items={items} />;
    }
    
  }

  renderAnswers({ match })
  {
    const id = match.path.slice(8)
    const answers = this.state.answers[id]
    return <Answers q = {id} answers={answers} tipAmounts={this.state.tipAmounts[id]} authors={this.state.authors[id]} />;
  }

  constructor(props)
  {
    super(props)
    this.state = {
      account: '',
      accounts: [],
      ask: [],
      bihu: null,
      postCountQuestion: 0,
      posts: [],
      labels: [],
      answers: [],
      q: [],//list of number of answers
      tipAmounts: [],
      authors: [],
      searched: false,
      searchingresult: []
    }
    this.renderAnswers = this.renderAnswers.bind(this)
  }

  render

  render()
  {
    return (
      <div>
        <Navbar account={this.state.account} />
        
        <p>
          &nbsp;
        </p>

        <br />
        
        <div className = "container-fluid mt-5">
          <div className = "row">
            <main role = "main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '900px' }}>
              <div className = "content mr-auto ml-auto">
                <form onSubmit = {(event) => {
                  event.preventDefault()
                  const content = this.postContent.value
                  const label = this.postLabel.value
                  this.createQuestion(content, label)
                  }}>
                  <div className="form-group mr-sm-2" style={{ width: '540px', margin: '10px', float: 'left' }}>
                    <input
                      id="postContent"
                      type="text"
                      ref={(input) => { this.postContent = input }}
                      className="form-control"
                      placeholder="What's your question?"
                      required />
                  </div>
                  <div className="form-group mr-sm-3" style={{ width: '280px', margin: '10px', float: 'right' }}>
                    <input
                      id="postLabel"
                      type="text"
                      ref={(input) => { this.postLabel = input }}
                      className="form-control"
                      placeholder="What's your questions' keyword?"
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" style={{width : '850px', margin: '10px'}}>Add Question</button>
                </form>
              </div>
            </main>
            <p>
              &nbsp;
            </p>
          </div>
          <p>
              &nbsp;
          </p>
          <div className = "row">
            <main role = "main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '900px' }}>
              <div className = "content mr-auto ml-auto">
                <form onSubmit = {(event) => {
                  event.preventDefault()
                  const searching = this.searchingContent.value
                  this.createResults(searching)
                  }}>
                  <div className="form-group mr-sm-2" style={{ width: '620px' , margin: '10px',float: 'left'}}>
                    <input
                      id="searching"
                      type="text"
                      ref={(input) => { this.searchingContent = input }}
                      className="form-control"
                      placeholder="Search your question."
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" style={{ maxWidth: '200px' , margin: '10px', float: 'right'}}>Search Question</button>
                </form>
              </div>
            </main>
            <p>
              &nbsp;
            </p>
          </div>
            <div className="container-fluid mt-5">
              <div className="row">
                <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '850px'}}>
                  <div className="content mr-auto ml-auto" width="700">
                    <Grid>
                      <Grid.Row>
                        <Grid.Column width={18}>{this.renderQuestions()}</Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </div>
                </main>
              </div>
            </div>
        </div>
      </div>
    );
  }
  

}

function stringMatching(str, substr)
{
  var len_str = str.length;
  var len_substr = substr.length;
  if(len_str < len_substr)
  {
    var tmp = str;
    str = substr;
    substr = tmp;
  }
  for(var i = 0; i < len_str; i++)
  {
    if(str[i] === substr[0])
    {
      for(var j = 1; j < len_substr; j++)
      {
        if(str[i+j] !== substr[j])
        {
          break;
        }
        if(j === len_substr-1)
        {
          return true;
        }
      }
    }
  }
  return false;
}

export default App;
