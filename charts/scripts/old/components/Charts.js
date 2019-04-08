import React, {
  Component,
} from 'react';
import {
  Col,
  Grid,
  Row,
  Panel,
  ProgressBar,
} from 'react-bootstrap';
import Bar from './Bar';

import economies from '../utils/economies';

import Pie from './Pie';

class Charts extends Component {
  constructor(props) {
    super(props);
    this.objects = [];
    this.state = {
      page: this.props.page,
      from: this.props.filter.from,
      to: this.props.filter.to,
      disabled: this.props.filter.disabled,
      subregionId: this.props.filter.subregionId,
      countryId: this.props.filter.countryId,
      countryName: '',
      subregionText: '',
      countryNameText: '',
    };
    this.getCharts = this.getCharts.bind(this);
    this.getAllCharts = this.getAllCharts.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.addChart = this.addChart.bind(this);
    this.getcountryName = this.getcountryName.bind(this);

    this.invalid = false;
  }
  componentDidMount() {
    this.getcountryName();
  }
  componentWillReceiveProps(nextProps) {
    this.getcountryName(nextProps);
    this.getcountryName();
    this.setState({
      page: nextProps.page,
      disabled: nextProps.filter.disabled,
      from: nextProps.filter.from,
      to: nextProps.filter.to,
      subregionId: nextProps.filter.subregionId,
      countryId: nextProps.filter.countryId,
    });
  }

  shouldComponentUpdate(nextProps) {
    this.getcountryName(nextProps);
    if (nextProps.filter.disabled !== this.state.disabled ||
      nextProps.filter.subregionId !== this.state.subregionId ||
      nextProps.filter.countryId !== this.state.countryId ||
      nextProps.filter.from !== this.state.from ||
      nextProps.filter.to !== this.state.to ||
      nextProps.page !== this.state.page
    ) {
      return true;
    }
    return false;
  }

  componentWillUpdate(nextProps) {
    this.getcountryName(nextProps);
    this.invalid = false;
    if (nextProps.filter.from > nextProps.filter.to) this.invalid = true;
  }
  getcountryName(nextProps) {
    if (nextProps) {
      this.props = nextProps;
    }
    for (let i = 0; i <= 4; i += 1) {
      if (economies[i].id === this.props.subregionId) {
        for (let j = 0; j < economies[i].countries.length; j += 1) {
          if (economies[i].countries[j].id === this.props.countryId) {
            this.setState({ countryName: economies[i].countries[j].label });
          }
        }
      }
    }
  }
  getcountryName(nextProps) {
    if (nextProps) {
      this.props = nextProps;
    }
    for (let i = 0; i <= 4; i += 1) {
      if (economies[i].id === this.props.subregionId) {
        for (let j = 0; j < economies[i].countries.length; j += 1) {
          if (economies[i].countries[j].id === this.props.countryId) {
            this.setState({ countryName: economies[i].countries[j].label });
          }
        }
      }
    }
  }

  getCharts() {
    if (this.state.disabled) {
      return (
        <Grid fluid className="loading-wrapper">
          <Panel>
            <ProgressBar className="loading" active now={100} label="Loading data..." />
          </Panel>
        </Grid>
      );
    } else if (this.invalid) {
      return (
        <Grid fluid>Invalid input.</Grid>
      );
    } else if (this.state.subregionId === 'all') {
      return this.getAllCharts();
    } else if (this.state.countryId === 'all') {
      return this.getSubregionCharts();
    }
    return this.getCountryCharts();
  }

  getAllCharts() {
    if (this.state.page === 'summary') {
      return (
        <Grid fluid>
          <span>
            <b className="container-header-active">APNICS / </b>
            <b className="container-header-disabled">SUMMARY</b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="ASN Total by Year"
                yLabel="Count (Thousands of Unique Numbers)"
                yFactor={1000}
                type="asn"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="ASN by Subregion"
                type="asn"
                subregion="all"
                chart={this}
              />
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv4 Total by Year"
                yFactor={1000000}
                yLabel="Count (Millions of Unique Addresses)"
                type="ipv4"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv4 by Subregion"
                type="ipv4"
                subregion="all"
                chart={this}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv6 Total by Year"
                yLabel="Count (Thousands of Unique Addresses)"
                yFactor={1000}
                type="ipv6"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv6 by Subregion"
                type="ipv6"
                subregion="all"
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'asn') {
      return (
        <Grid fluid>
          <span>
            <b className="container-header-active">APNICS / </b>
            <b className="container-header-disabled">SUMMARY</b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="ASN Total by Year"
                yLabel="Count (Thousands of Unique Numbers)"
                yFactor={1000}
                type="asn"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="ASN by Subregion"
                type="asn"
                subregion="all"
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'ipv4') {
      return (
        <Grid fluid>
          <span>
            <b className="container-header-active">APNICS / </b>
            <b className="container-header-disabled">SUMMARY</b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv4 Total by Year"
                yFactor={1000000}
                yLabel="Count (Millions of Unique Addresses)"
                type="ipv4"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv4 by Subregion"
                type="ipv4"
                subregion="all"
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'ipv6') {
      return (
        <Grid fluid>
          <span>
            <b className="container-header-active">APNICS / </b>
            <b className="container-header-disabled">SUMMARY</b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv6 Total by Year"
                yLabel="Count (Thousands of Unique Addresses)"
                yFactor={1000}
                type="ipv6"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv6 by Subregion"
                type="ipv6"
                subregion="all"
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    }
  }

  getSubregionCharts() {
    this.state.subregionText = `${this.state.subregionId} / `;
    if (this.state.page === 'summary') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-active">{this.state.subregionText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="ASN Total by Year"
                yLabel="Count (Thousands of Unique Numbers)"
                yFactor={1000}
                type="asn"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="ASN by Economy"
                type="asn"
                subregion={this.state.subregionId}
                chart={this}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv4 Total by Year"
                yLabel="Count (Millions of Unique Addresses)"
                yFactor={1000000}
                type="ipv4"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv4 by Economy"
                type="ipv4"
                subregion={this.state.subregionId}
                chart={this}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv6 Total by Year"
                yLabel="Count (Thousands of Unique Addresses)"
                yFactor={1000}
                type="ipv6"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv6 by Economy"
                type="ipv6"
                subregion={this.state.subregionId}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'asn') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-active">{this.state.subregionText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="ASN Total by Year"
                yLabel="Count (Thousands of Unique Numbers)"
                yFactor={1000}
                type="asn"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="ASN by Economy"
                type="asn"
                subregion={this.state.subregionId}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'ipv4') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-active">{this.state.subregionText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv4 Total by Year"
                yLabel="Count (Millions of Unique Addresses)"
                yFactor={1000000}
                type="ipv4"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv4 by Economy"
                type="ipv4"
                subregion={this.state.subregionId}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'ipv6') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-active">{this.state.subregionText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv6 Total by Year"
                type="ipv6"
                yLabel="Count (Thousands of Unique Addresses)"
                yFactor={1000}
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Pie
                title="IPv6 by Economy"
                type="ipv6"
                subregion={this.state.subregionId}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    }
  }

  getCountryCharts() {
    this.state.subregionText = `${this.state.subregionId} / `;
    this.state.countryNameText = `${this.state.countryName} / `;
    if (this.state.page === 'summary') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-inactive">{this.state.subregionText}</b>
            <b className="container-header-active">{this.state.countryNameText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="ASN Total by Year"
                yLabel="Count (Thousands of Unique Numbers)"
                yFactor={1000}
                type="asn"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv4 Total by Year"
                yLabel="Count (Millions of Unique Addresses)"
                yFactor={1000000}
                type="ipv4"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv6 Total by Year"
                yLabel="Count (Thousands of Unique Addresses)"
                yFactor={1000}
                type="ipv6"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'asn') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-inactive">{this.state.subregionText}</b>
            <b className="container-header-active">{this.state.countryNameText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="ASN Total by Year"
                yLabel="Count (Thousands of Unique Numbers)"
                yFactor={1000}
                type="asn"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'ipv4') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-inactive">{this.state.subregionText}</b>
            <b className="container-header-active">{this.state.countryNameText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv4 Total by Year"
                yLabel="Count (Millions of Unique Addresses)"
                yFactor={1000000}
                type="ipv4"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    } else if (this.state.page === 'ipv6') {
      return (
        <Grid fluid>
          <span>
            <b>APNICS / </b>
            <b className="container-header-inactive">{this.state.subregionText}</b>
            <b className="container-header-active">{this.state.countryNameText}</b>
            <b className="container-header-disabled"> SUMMARY </b>
          </span>
          <Row>
            <Col xs={12} sm={12} md={6} className="chart-column">
              <Bar
                title="IPv6 Total by Year"
                yLabel="Count (Thousands of Unique Addresses)"
                yFactor={1000}
                type="ipv6"
                subregion={this.state.subregionId}
                country={this.state.countryId}
                from={this.state.from}
                to={this.state.to}
                chart={this}
              />
            </Col>
          </Row>
        </Grid>
      );
    }
  }

  addChart(object) {
    this.objects.push(object);
  }

  updateDimensions() {
    for (let i = 0; i < this.objects.length; i += 1) {
      this.objects[i].updateDimensions();
    }
  }

  render() {
    return this.getCharts();
  }

}

export default Charts;
