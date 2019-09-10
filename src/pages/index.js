import "bootstrap/dist/css/bootstrap.css"
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css"
import "open-iconic/font/css/open-iconic-bootstrap.css"
import React from "react"
import { Navbar, Form } from "react-bootstrap"
import BootstrapTable from "react-bootstrap-table-next"
import filterFactory, {
  multiSelectFilter,
  Comparator,
} from "react-bootstrap-table2-filter"
import { Link } from "gatsby-plugin-modal-routing"
import NavLink from "react-bootstrap/NavLink"
import axios from "axios"
import Dropdown from "react-bootstrap/Dropdown"
import NavDropdown from "react-bootstrap/NavDropdown"
import Table from "react-bootstrap/Table"
import Row from "react-bootstrap/Row"
import Container from "react-bootstrap/Container"
import Col from "react-bootstrap/Col"

function urlFormatter(cell) {
  return <>{cell.length > 0 && <a href={cell}>{cell}</a>}</>
}

const availabilityOptions = {
  Available: `Available`,
  DIY: `DIY`,
  Discontinued: `Discontinued`,
  Unreleased: `Unreleased`,
  "Existence unknown": `Existence unknown`,
}

const connectionOptions = {
  BT: `Bluetooth (Any)`,
  "BT2 (Serial)": `Bluetooth (Serial)`,
  "BT2 (Audio)": `Bluetooth (Audio)`,
  "BT2 (HID)": `Bluetooth (HID)`,
  BT4: `Bluetooth LE`,
  USB: `USB`,
  Serial: `Serial`,
}

const columns = [
  {
    dataField: `id`,
    text: `ID`,
    hidden: true,
  },
  {
    dataField: `Brand`,
    text: `Brand Name`,
    sort: true,
  },
  {
    dataField: `Device`,
    text: `Device`,
    sort: true,
  },
  {
    dataField: `Availability`,
    text: `Availability`,
    filter: multiSelectFilter({
      options: availabilityOptions,
      comparator: Comparator.LIKE,
      defaultValue: [`Available`, `DIY`],
    }),
    sort: true,
  },
  {
    dataField: `Connection`,
    text: `Connectivity`,
    filter: multiSelectFilter({
      options: connectionOptions,
      comparator: Comparator.LIKE,
    }),
    sort: true,
  },
  {
    dataField: `Type`,
    text: `Form Factor`,
    sort: true,
  },
  {
    dataField: `ButtplugSupport`,
    text: `Buttplug.io Support`,
    sort: true,
    formatter: (cellContent, row) => (
      <div>
        {(row.ButtplugSupport & 1 && <span> C#</span>) || ``}
        {(row.ButtplugSupport & 2 && <span> JS</span>) || ``}
      </div>
    ),
  },
  {
    dataField: `Detail`,
    text: `Url`,
    formatter: urlFormatter,
  },
]

const SelectOption = props => {
  if (props.value === props.selected) {
    return (
      <option value={props.value} selected>
        {props.text}
      </option>
    )
  }
  return <option value={props.value}>{props.text}</option>
}

class FieldFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleFieldChange = event => {
    this.props.onChange(this.props.ident, { field: event.target.value })
  }

  doTextFilter = (data, filter) =>
    data[filter.field].match(new RegExp(filter.search, `i`)) !== null

  handleSearchChange = event => {
    this.props.onChange(this.props.ident, {
      field: this.props.filter.field,
      search: event.target.value,
      filterData: this.doTextFilter,
    })
  }

  doBpFilter = (data, filter) =>
    (data[filter.field] & filter.bpSupport) === filter.bpSupport

  handleBpChange = (event, mode) => {
    this.props.onChange(this.props.ident, {
      field: this.props.filter.field,
      bpSupport:
        (this.props.filter.bpSupport &= ~mode) |
        (event.target.checked ? mode : 0),
      filterData: this.doBpFilter,
    })
  }

  render() {
    return (
      <Navbar>
        <Navbar.Collapse>
          <Navbar.Text>
            <Form.Control as="select" onChange={e => this.handleFieldChange(e)}>
              <SelectOption
                value={`none`}
                selected={this.props.filter.field}
                text={`Choose a field:`}
              />
              <SelectOption
                value={`Brand`}
                selected={this.props.filter.field}
                text={`Brand`}
              />
              <SelectOption
                value={`Device`}
                selected={this.props.filter.field}
                text={`Device Name`}
              />
              <SelectOption
                value={`Availability`}
                selected={this.props.filter.field}
                text={`Availability`}
              />
              <SelectOption
                value={`Connection`}
                selected={this.props.filter.field}
                text={`Connectivity`}
              />
              <SelectOption
                value={`Type`}
                selected={this.props.filter.field}
                text={`Form Factor`}
              />
              <SelectOption
                value={`ButtplugSupport`}
                selected={this.props.filter.field}
                text={`Buttplug Support`}
              />
              <SelectOption
                value={`Features`}
                selected={this.props.filter.field}
                text={`Features`}
              />
            </Form.Control>
          </Navbar.Text>
          {(this.props.filter.field === `Brand` ||
            this.props.filter.field === `Device`) && (
            <Navbar.Text>
              <Form.Control
                as="input"
                value={this.props.filter.search ? this.props.filter.search : ``}
                onChange={e => this.handleSearchChange(e)}
              />
            </Navbar.Text>
          )}
          {this.props.filter.field === `ButtplugSupport` && (
            <Navbar.Text>
              <Form.Check
                inline
                label="C#"
                onChange={e => this.handleBpChange(e, 1)}
              />
              <Form.Check
                inline
                label="JS"
                onChange={e => this.handleBpChange(e, 2)}
              />
            </Navbar.Text>
          )}
          {this.props.filter.field === `Features` && (
            <NavDropdown title="Outputs" id="nav-out-dropdown">
              {this.props.filterData.Features !== undefined &&
                this.props.filterData.Features.Outputs.map((feat, i) => (
                  <NavDropdown.Item key={i}>{feat}</NavDropdown.Item>
                ))}
            </NavDropdown>
          )}
          {this.props.filter.field === `Features` && (
            <NavDropdown title="Inputs" id="nav-in-dropdown">
              {this.props.filterData.Features !== undefined &&
                this.props.filterData.Features.Inputs.map((feat, i) => (
                  <NavDropdown.Item key={i}>{feat}</NavDropdown.Item>
                ))}
            </NavDropdown>
          )}
          <NavLink onClick={() => this.props.onRemove(this.props.ident)}>
            <span className="oi oi-circle-x" title="Close" aria-hidden="true" />
          </NavLink>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

class IndexComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = { devices: [], data: [], filters: [], filterData: {} }
    this.handleFilterRemove = this.handleFilterRemove.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
  }

  componentDidMount() {
    axios.get(`/devices.json`).then(res => {
      let filterData = { Features: { Inputs: [], Outputs: [] } }
      if (res.data.length > 0) {
        filterData.Features.Inputs = Object.getOwnPropertyNames(
          res.data[0].Features.Inputs
        )
        filterData.Features.Outputs = Object.getOwnPropertyNames(
          res.data[0].Features.Outputs
        )
      }
      this.setState({ devices: res.data, data: res.data, filterData })
    })
  }

  expandRow = {
    renderer: row => (
      <div style={{ width: `100%` }}>
        <Container>
          <Row>
            <Col>
              <h1>
                {row.Brand} - {row.Device}
              </h1>
              <span>{row.Notes}</span>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table>
                <thead>
                  <td>Input</td>
                  <td>Count</td>
                </thead>
                {Object.keys(row.Features.Inputs).map((feat, i) => (
                  <tr key={i}>
                    <td>{feat}</td>
                    <td>{row.Features.Inputs[feat]}</td>
                  </tr>
                ))}
              </Table>
            </Col>
            <Col>
              <Table>
                <thead>
                  <td>Output</td>
                  <td>Count</td>
                </thead>
                {Object.keys(row.Features.Outputs).map((feat, i) => (
                  <tr key={i}>
                    <td>{feat}</td>
                    <td>{row.Features.Outputs[feat]}</td>
                  </tr>
                ))}
              </Table>
            </Col>
          </Row>
        </Container>
      </div>
    ),
    showExpandColumn: true,
    expandByColumnOnly: true,
    expandHeaderColumnRenderer: ({ isAnyExpands }) => {
      if (isAnyExpands) {
        return (
          <span className="oi oi-minus" title="icon minus" aria-hidden="true" />
        )
      }
      return (
        <span className="oi oi-plus" title="icon plus" aria-hidden="true" />
      )
    },
    expandColumnRenderer: ({ expanded }) => {
      if (expanded) {
        return (
          <span className="oi oi-minus" title="icon minus" aria-hidden="true" />
        )
      }
      return (
        <span className="oi oi-plus" title="icon plus" aria-hidden="true" />
      )
    },
  }

  handleTableChange = (type, { sortField, sortOrder }) => {
    if (!sortOrder || !sortOrder) return
    let result
    if (sortOrder === `asc`) {
      result = this.state.devices.sort((a, b) =>
        a[sortField].localeCompare(b[sortField], `en`, { sensitivity: `base` })
      )
    } else {
      result = this.state.devices.sort((a, b) =>
        b[sortField].localeCompare(a[sortField], `en`, { sensitivity: `base` })
      )
    }
    this.setState({ devices: result })
    this.handleFilterChange()
  }

  handleFilterRemove(ident) {
    const filters = this.state.filters
    filters.splice(ident, 1)
    this.setState({ filters })
    this.handleFilterChange()
  }

  handleFilterChange(ident, filter) {
    const filters = this.state.filters
    if (ident !== undefined) {
      filters[ident] = filter
    }
    let data = this.state.devices
    filters.forEach(f => {
      if (f.hasOwnProperty(`filterData`)) {
        data = data.filter(d => {
          const res = f.filterData(d, f)
          return res
        })
      }
    })
    this.setState({ data, filters })
  }

  addFilter = () => {
    let filters = this.state.filters
    filters.push({})
    this.setState({ filters })
  }

  render() {
    const filterNavs = []
    this.state.filters.forEach((f, i) =>
      filterNavs.push(
        <FieldFilter
          filter={f}
          key={i}
          ident={i}
          onChange={this.handleFilterChange}
          onRemove={this.handleFilterRemove}
          filterData={this.state.filterData}
        />
      )
    )

    return (
      <div>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="#home">IoST Index</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="left-navbar-nav">
            <NavLink variant="dark" onClick={this.addFilter}>
              Add Filter
            </NavLink>
          </Navbar.Collapse>
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Navbar.Text>
              <Link to="/about/" asModal>
                About
              </Link>
            </Navbar.Text>
          </Navbar.Collapse>
        </Navbar>
        {filterNavs}
        <BootstrapTable
          bootstrap4
          striped
          bordered
          hover
          remote={{ sort: true }}
          keyField="id"
          columns={columns}
          expandRow={this.expandRow}
          filter={filterFactory()}
          noDataIndication="No matching devices found"
          data={this.state.data}
          onTableChange={this.handleTableChange}
        />
      </div>
    )
  }
}

export default IndexComponent
