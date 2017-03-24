import * as d3 from "d3";
import * as react from "react";
import {HierarchyNode} from "d3-hierarchy";
const {svg, circle, title, g, text} = react.DOM;
import {ReactSVGPanZoom} from 'react-svg-pan-zoom';
import {FileSystemNode} from "../scan-repo";
const reactSVGPanZoom = react.createFactory(ReactSVGPanZoom);

interface MainComponentProps {
  parentElement: HTMLElement;
  tree: HierarchyNode<FileSystemNode>;
}

interface MainComponentState {
  zoom: number;
}

class MainComponent extends react.Component<MainComponentProps, MainComponentState> {
  viewer: ReactSVGPanZoom;
  state = {
    zoom: 1
  }

  componentDidMount() {
    this.viewer.fitToViewer();
    window.addEventListener('resize', this.onResize);
  }

  onResize= () => {
    this.forceUpdate();
  }


  render() {
    const {parentElement} = this.props;
    const width = parentElement.offsetWidth;
    const height = parentElement.offsetHeight;
    console.log(width, height);
    const pack = d3.pack<FileSystemNode>()
      .size([width - 4, height - 4]);
    const format = d3.format(",d");
    const s = this.state;
    return reactSVGPanZoom({
      width, height,
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
    }, svg({width, height},
      g({
          transform: 'translate(2,2)'
        }, pack(this.props.tree).descendants().map(d =>
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

export const mainComponent = react.createFactory(MainComponent);
