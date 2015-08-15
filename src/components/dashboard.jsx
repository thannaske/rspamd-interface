var React = require('react');
var PieChart = require("react-chartjs").Pie;
var Common = require('../common.js');

var StatBox = React.createClass({
  render: function() {
    var clsname = "stat-box pull-" + this.props.align;
    return (
      <li className={clsname}>
        <div className="widget">
        <strong>{this.props.value}</strong>
        {this.props.label}
      </div>
      </li>
    );
  }
});

var RspamdChart = React.createClass({
  loadAjaxData: function() {
    $.ajax({
      dataType: 'json',
      cache: false,
      url: Common.ajaxURI('/pie', this.props),
      data: {
        password: this.props.password
      },
      success: function(data) {
        var total = data.reduce(function(prev, cur, idx, ar) {
          return prev + cur.data << idx;
        }, 0);

        /* Update state only if we have some change */
        if (!this.state.loaded || this.state.total !== total) {
          this.setState({
            total: total,
            series: data.map(function(elt) { elt.value = elt.data; return elt; }),
            loaded: true
          });
        }
      }.bind(this),
      error: function() {
        this.setState({
          loaded: false,
          total: 0
        });
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      loaded: false,
      total: 0
    };
  },

  componentDidMount: function() {
    this.loadAjaxData();
    this.timer = setInterval(this.loadAjaxData, 1000);
  },

  render: function() {
    if (this.state.loaded) {
      var chartOptions = {
        animation: false
      };

      return <PieChart data={this.state.series} options={chartOptions}/>;
    }
    else {
      return <div></div>;
    }
  }
})

module.exports = React.createClass({
  loadAjaxData: function() {
    $.ajax({
      dataType: 'json',
      cache: false,
      url: Common.ajaxURI('/auth', this.props),
      data: {
        password: this.props.password
      },
      success: function(data) {
        this.setState({
          data: data,
          loaded: true
        });
      }.bind(this),
      error: function() {
        this.setState({
          loaded: false
        });
      }.bind(this)
    });
  },

  getInitialState: function() {
    return {
      loaded: false
    };
  },

  componentDidMount: function() {
    this.loadAjaxData();
    this.timer = setInterval(this.loadAjaxData, 1000);
  },

  componentWillUnmount: function() {
    clearInterval(this.timer);
  },

  render: function() {
    if (this.state.loaded) {
      return (
        <div className="tab-pane active" id="status">
          <div className="row-fluid">
            <div className="span12">
              <div className="widget-box widget-plain">
                <ul className="stat-boxes" id="statWidgets">
                  <StatBox label="Scanned" align="left"
                      value={this.state.data.scanned}/>
                  <StatBox label="Clean" align="left"
                      value={this.state.data.clean}/>
                  <StatBox label="Greylist" align="left"
                      value={this.state.data.greylist}/>
                  <StatBox label="Probable" align="left"
                      value={this.state.data.probable}/>
                  <StatBox label="Reject" align="left"
                      value={this.state.data.reject}/>
                    <StatBox label="Learned" align="left"
                      value={this.state.data.learned}/>
                  <StatBox label="Uptime" align="right"
                      value={Common.msToTime(this.state.data.uptime)}/>
                  <StatBox label="Version" align="right"
                      value={this.state.data.version}/>
                </ul>
              </div>
            </div>
          </div>
          <div className="widget-box">
  					<div className="widget-title">
  						<span className="icon"><i class="icon-signal"></i></span>
  						<h5>Statistics</h5>
  					</div>
  					<div className="widget-content chart-content">
  						<div className="row-fluid row-chart">
  							<div className="chart" id="chart">
  								<RspamdChart server={this.props.server}
                    password={this.props.password}/>
  							</div>
  						</div>
  					</div>
  				</div>
          {JSON.stringify(this.state.data)}
        </div>
      );
    } else {
      /* XXX: add loading progress */
      return <div></div>;
    }
  }
});
