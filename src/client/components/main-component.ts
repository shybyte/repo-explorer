import * as d3 from "d3";
import * as react from "react";
const {svg, circle, title, g, text, div} = react.DOM;
import {FileSystemNode, filterRepoScan, RepoScan} from "../scan-repo";
import {toolbarComponent} from "./toolbar";

import {IgnoreInstance} from "ignore";
const ignore = require('ignore');

interface MainComponentProps {
  parentElement: HTMLElement;
  repoScan: RepoScan;
}

interface  Point {
  x: number,
  y: number
}

interface MainComponentState {
  zoom: number;
  width: number;
  height: number;
  center: Point;
  translate: Point;
  filter: string;
}

const FILTER_KEY = 'ignoreFilter';

class MainComponent extends react.Component<MainComponentProps, MainComponentState> {
  mouseDown: Point | undefined;

  state = {
    zoom: 1,
    width: 1,
    height: 1,
    center: {x: 0.5, y: 0.5},
    translate: {x: 0, y: 0},
    filter: ''
  }

  componentWillMount() {
    this.setState({filter: localStorage.getItem(FILTER_KEY) || ''});
    window.addEventListener('resize', this.onResize);
    this.onResize();

  }

  onResize = () => {
    this.forceUpdate();
    const {parentElement} = this.props;
    const width: number = parentElement.offsetWidth;
    const height: number = parentElement.offsetHeight;
    this.setState({width, height});
  }

  onWheel = (ev: React.WheelEvent<HTMLElement>) => {
    this.setState({
      zoom: Math.max(1, this.state.zoom * (1 - Math.sign(ev.deltaY) / 10))
    });
  }

  onMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    this.mouseDown = {x: event.clientX, y: event.clientY};
    console.log('mouseDown', event, this.mouseDown);
  }

  onMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!this.mouseDown) {
      return;
    }
    this.setState({
      translate: {
        x: event.clientX - this.mouseDown.x,
        y: event.clientY - this.mouseDown.y
      }
    });
  }

  onMouseUp = () => {
    this.mouseDown = undefined;
    const {translate, center, zoom, width, height} = this.state;
    const diameter = Math.min(width, height);
    this.setState({
      translate: {x: 0, y: 0},
      center: {
        x: center.x - translate.x / zoom / diameter,
        y: center.y - translate.y / zoom / diameter,
      }
    });
  }

  onChangeFilter = (filter: string) => {
    localStorage.setItem(FILTER_KEY, filter);
    this.setState({filter});
  }

  render() {
    const s = this.state;
    const {width, height, center} = s;
    const diameter = Math.min(width, height);
    console.log('render', width, height, s.zoom);
    const pack = d3.pack<FileSystemNode>().size([1, 1]);
    const format = d3.format(",d");
    const filter = this.state.filter;

    console.log(filter);

    const ignoreInstance: IgnoreInstance = ignore();
    ignoreInstance.add(filter);
    const filteredRepoScan = filterRepoScan(this.props.repoScan, ignoreInstance);
    const root = d3.hierarchy<FileSystemNode>(filteredRepoScan)
      .sum(function (d) {
        return d.size;
      })
      .sort(function (a, b) {
        return (b.value || 0) - (a.value || 0);
      });


    let descendants = pack(root).descendants();
    return div({
        className: 'mainComponent',
        onWheel: this.onWheel,
        onMouseDown: this.onMouseDown,
        onMouseMove: this.onMouseMove,
        onMouseUp: this.onMouseUp,
      },
      toolbarComponent({filter: filter, changeFilter: this.onChangeFilter}),
      svg({width, height},
        g({
            transform: `translate(${s.translate.x},${s.translate.y})`
          }, descendants.map(d => {
            const x = (d.x * s.zoom - center.x * s.zoom + 0.5) * diameter;
            const y = (d.y * s.zoom - center.y * s.zoom + 0.5) * diameter;
            return g({
                key: (d.parent ? d.parent.data.name : '') + '/' + d.data.name,
                className: d.children ? "node" : "leaf node",
                transform: "translate(" + x + "," + y + ")"
              },
              circle({r: d.r * s.zoom * diameter}),
              title({}, d.data.relativePath + "\n" + format(d.value!)),
              !d.children ? text({
                dy: '0.3em',
                style: {
                  fontSize: '12px'
                }
              }, d.data.name.substring(0, d.r * diameter / 3 * s.zoom)) : []
            );
          }
          )
        )
      ));
  }
}

export const mainComponent = react.createFactory(MainComponent);
