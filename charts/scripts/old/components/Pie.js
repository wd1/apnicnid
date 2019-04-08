import React, {
  Component,
} from 'react'; import {
  Panel,
  DropdownButton,
  ButtonGroup,
  Button,
  MenuItem,
  Col,
  Grid,
  Row,
  Glyphicon,
} from 'react-bootstrap';
import NVD3Chart from 'react-nvd3';
import stats from '../utils/stats';

import {
  savePng,
  saveSvg,
  saveCsv,
  saveJson,
} from '../utils/save';

class Pie extends Component {

  constructor(props) {
    super(props);
    this.data = [];
    this.updateDimensions = this.updateDimensions.bind(this);
    this.fillData = this.fillData.bind(this);
    this.state = {
      width: 500,
      height: 350,
      showLegend: false,
      fullscreen: false,
    };
    this.fillData(props);
  }

  componentDidMount() {
    this.props.chart.addChart(this);
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUpdate(nextProps) {
    if (this.props.type !== nextProps.type || this.props.subregion !== nextProps.subregion) {
      this.fillData(nextProps);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  fillData(props) {
    this.data = stats.getPieData(props.type, props.subregion);
  }
  updateDimensions() {
    const elem = document.getElementsByName('pieorbar');
    this.setState({ width: elem.width });
  }

  showChartMode(isFullscreen, element) {
    if (isFullscreen === true) {
      element.classList.remove('col-md-6');
      element.classList.remove('col-sm-12');
      element.classList.add('container-fluid');
    } else {
      element.classList.add('col-md-6');
      element.classList.add('col-sm-12');
      element.classList.remove('container-fluid');
    }
  }

  render() {
    return (
      <Panel name="pieorbar" className="panel-custom" id={`export-${this.props.title.replace(/\s+/g, '-').toLowerCase()}-${'pie'}`} >
        <div
          tabIndex={0}
          role="button"
          className="icon-bar"
          onClick={() => {
            if (this.state.showLegend === false) {
              this.setState({ showLegend: true });
            } else {
              this.setState({ showLegend: false });
            }
          }}
        >
          <span className="icon" style={{ backgroundColor: '#386cdc' }} />
          <span className="icon" style={{ backgroundColor: '#0f2c52' }} />
          <span className="icon" style={{ backgroundColor: '#47ad1f' }} />
        </div>
        <Grid fluid>
          <Row className="chart-header">
            <Col xs={2} >
              &nbsp;
            </Col>
            <Col xs={6} className="chart-title">
              <p>{this.props.title}</p>
            </Col>
            <Col xs={3} bsClass="text-right" className="chart-export">
              <ButtonGroup>
                <DropdownButton
                  noCaret
                  pullRight
                  className="chart-export"
                  id={`export-${this.props.title.replace(/\s+/g, '-').toLowerCase()}`}
                  title={<Glyphicon glyph="share" />}
                  onSelect={(key) => {
                    if (key === 'json') {
                      saveJson(this.data, `${this.props.title.replace(/\s+/g, '-').toLowerCase()}`);
                    } else if (key === 'csv') {
                      saveCsv(this.data, `${this.props.title.replace(/\s+/g, '-').toLowerCase()}`, 'pie');
                    } else if (key === 'png') {
                      savePng(`chart-${this.props.title.replace(/\s+/g, '-').toLowerCase()}`);
                    } else if (key === 'svg') {
                      saveSvg(`chart-${this.props.title.replace(/\s+/g, '-').toLowerCase()}`);
                    }
                  }}
                >
                  <MenuItem eventKey="json">JSON</MenuItem>
                  <MenuItem eventKey="csv">CSV</MenuItem>
                  <MenuItem eventKey="png">PNG</MenuItem>
                  <MenuItem eventKey="svg">SVG</MenuItem>
                </DropdownButton>
                <Button
                  onClick={() => {
                    const id = `export-${this.props.title.replace(/\s+/g, '-').toLowerCase()}`;
                    const mainId = `${id}-pie`;
                    const pieOrBarElements = document.getElementsByName('pieorbar');

                    const elem = document.getElementsByName('pieorbar');
                    this.setState({ width: elem.width });
                    if (this.state.fullscreen === false) {
                      this.setState({ fullscreen: true });
                      this.setState({ height: 630 });
                      for (let i = 0; i < pieOrBarElements.length; i += 1) {
                        if (pieOrBarElements[i].id !== mainId) {
                          pieOrBarElements[i].style.display = 'none';
                        } else if (pieOrBarElements[i].id === mainId) {
                          this.showChartMode(true, pieOrBarElements[i].parentElement);
                        }
                      }
                    } else {
                      this.setState({ fullscreen: false });
                      this.setState({ height: 350 });
                      for (let i = 0; i < pieOrBarElements.length; i += 1) {
                        if (pieOrBarElements[i].id !== mainId) {
                          pieOrBarElements[i].style.display = 'block';
                        } else if (pieOrBarElements[i].id === mainId) {
                          this.showChartMode(false, pieOrBarElements[i].parentElement);
                        }
                      }
                    }
                    this.props.chart.updateDimensions();
                  }}
                >
                  <Glyphicon glyph="fullscreen" />
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Grid>

        <div className="chart-responsive" id={`chart-${this.props.title.replace(/\s+/g, '-').toLowerCase()}`} >
          <NVD3Chart
            id="chart"
            width={this.state.width}
            height={this.state.height}
            type="pieChart"
            show={false}
            datum={this.data}
            x="label"
            y="total"
            showLegend={this.state.showLegend}
            showLabels={false}
          />
        </div>
      </Panel>
    );
  }
}

export default Pie;
