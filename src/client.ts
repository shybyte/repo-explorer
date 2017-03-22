import * as d3 from "d3";
import * as fs from "fs";
import * as path from "path";
import * as react from "react";
import * as reactDom from "react-dom";
import {scanRepo} from "./scan-repo";
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';

const reactSVGPanZoom = react.createFactory(ReactSVGPanZoom);

interface NodeType {
  name: string;
  size: number;
}

const {svg, circle, title, g, text} = react.DOM;
const diameter = 400;

const data = (scanRepo('.', ['node_modules', '.git', '.idea']));

const pack = d3.pack<NodeType>()
  .size([diameter - 4, diameter - 4]);

const format = d3.format(",d");

const root = d3.hierarchy<NodeType>(data)
  .sum(function (d) {
    return d.size;
  })
  .sort(function (a, b) {
    return (b.value || 0) - (a.value || 0);
  });

console.log(data);
console.log('out:', pack(root).descendants());

interface DemoState {
  zoom: number;
}

class Demo extends react.Component<any, DemoState> {
  viewer: ReactSVGPanZoom;
  state = {
    zoom: 1
  }

  componentDidMount() {
    this.viewer.fitToViewer();
  }

  render() {
    const s = this.state;
    return reactSVGPanZoom({
      width: diameter,
      height: diameter,
      tool: 'auto',
      detectAutoPan: false,
      className: 'reactSVGPanZoom',
      background: '#ffffff' as any,
      ref: (viewer: ReactSVGPanZoom) => {
        this.viewer = viewer;
      },
      onChangeValue: (value) => {
        this.setState({zoom: value.a});
      }
    }, svg({
        width: diameter,
        height: diameter,
      },
      g({
          transform: 'translate(2,2)'
        }, pack(root).descendants().map(d =>
          g({
              key: (d.parent ? d.parent.data.name : '') + '/' + d.data.name,
              className: d.children ? "node" : "leaf node",
              transform: "translate(" + d.x + "," + d.y + ")"
            },
            circle({r: d.r}),
            title({}, d.data.name + "\n" + format(d.value!)),
            !d.children ? text({
              dy: '0.3em',
              style: {
                fontSize: 12 / s.zoom + 'px'
              }
            }, d.data.name.substring(0, d.r / 3 * s.zoom)) : []
          )
        )
      )
    ));
  }
}

const demo = react.createFactory(Demo);


const appEl = document.getElementById('app');

reactDom.render(demo({}), appEl);
