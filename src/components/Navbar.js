import React, { Component } from 'react';
import Identicon from 'identicon.js';
import './App.css';
import 'semantic-ui-css/semantic.min.css';

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <h2>Bihu</h2>
        <table>
          <tr>
            <th>
              <ul className="navar-nav px-4">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <h9><a class="nav-brand link">{this.props.account}</a></h9>
                  {this.props.account
                    ? <img
                      className='ml-2'
                      width='25'
                      height='25'
                      src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
                    />
                    : <span></span>
                  }
                </li>
              </ul>
            </th>
          </tr>
        </table>
      </nav>

    );
  }
}

export default Navbar;
