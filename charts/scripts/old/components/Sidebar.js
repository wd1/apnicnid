/* eslint-disable max-len */
import React, {
  Component,
} from 'react';
import Links from './Links';
import Economies from './Economies';
import Filter from './Filter';

class Sidebar extends Component {

  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }
  updateDimensions() {
    if (window.innerWidth <= 768) {
      this.props.onSidebarShow(false);
    } else {
      this.props.onSidebarShow(true);
    }
  }

  render() {
    return (
      <div id="sidebar" className={`sidebar ${this.props.sidebar.toggled ? 'sidebar-shown' : 'sidebar-hidden'}`}>
        <div className="sidebar-header" />
        <Economies
          filter={this.props.filter}
          onEconomyChange={this.props.onEconomyChange}
        />
        <Filter
          filter={this.props.filter}
          onFilterApply={this.props.onFilterApply}
        />
        <Links />
      </div>
    );
  }
}

export default Sidebar;
